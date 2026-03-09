import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * api-sales: Upsert-based sales ingestion endpoint.
 * Dedup rule:
 *   1st: platform + event_key (exact match)
 *   2nd: platform + normalized sale_name + overlapping date range
 * If match found → update metadata (preserve review/publish status).
 * If no match → insert new row.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const apiKey = Deno.env.get("PICKSALE_API_KEY");

  if (!token || token !== apiKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      platform, sale_name, start_date, end_date, category, link, description,
      sale_tier, importance_score, filter_reason, source_urls, grouped_page_count,
      event_key, pub_date, image_url, source_type, signal_type, confidence_score,
    } = body;

    if (!platform || !sale_name) {
      return new Response(
        JSON.stringify({ error: "platform, sale_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const categoryArray = category
      ? (Array.isArray(category) ? category : category.split(",").map((c: string) => c.trim()).filter(Boolean))
      : [];

    const incomingSourceUrls = Array.isArray(source_urls) ? source_urls : [];
    if (link && !incomingSourceUrls.includes(link)) {
      incomingSourceUrls.push(link);
    }

    const pubDate = pub_date ? new Date(pub_date).toISOString() : null;

    // ── 1. Try match by platform + event_key ──
    let existing: any = null;
    let matchedBy = "none";

    if (event_key) {
      const { data } = await supabase
        .from("sales")
        .select("*")
        .eq("platform", platform)
        .eq("event_key", event_key)
        .limit(1);
      if (data && data.length > 0) {
        existing = data[0];
        matchedBy = "event_key";
      }
    }

    // ── 2. Fallback: platform + normalized title + overlapping dates ──
    if (!existing) {
      const normalized = normalizeName(sale_name);
      const { data: candidates } = await supabase
        .from("sales")
        .select("*")
        .eq("platform", platform);

      if (candidates) {
        for (const c of candidates) {
          const cNorm = normalizeName(c.sale_name);
          if (cNorm === normalized || similarity(cNorm, normalized) > 0.75) {
            // Check date overlap if dates provided
            if (start_date && end_date && c.start_date && c.end_date) {
              if (datesOverlap(c.start_date, c.end_date, start_date, end_date)) {
                existing = c;
                matchedBy = "fallback_title_date";
                break;
              }
            } else {
              // No dates to compare, title match is enough
              existing = c;
              matchedBy = "fallback_title";
              break;
            }
          }
        }
      }
    }

    // ── 3. Fallback: exact link match ──
    if (!existing && link) {
      const { data } = await supabase
        .from("sales")
        .select("*")
        .eq("link", link)
        .limit(1);
      if (data && data.length > 0) {
        existing = data[0];
        matchedBy = "link";
      }
    }

    // ── UPDATE existing row ──
    if (existing) {
      const updates: Record<string, any> = {};

      // Merge source_urls (no duplicates)
      const mergedUrls = [...new Set([...(existing.source_urls || []), ...incomingSourceUrls])];
      updates.source_urls = mergedUrls;

      // Update latest_pub_date if newer
      if (pubDate) {
        if (!existing.latest_pub_date || new Date(pubDate) > new Date(existing.latest_pub_date)) {
          updates.latest_pub_date = pubDate;
          if (link) updates.latest_source_url = link;
          if (link) updates.link = link;
        }
      }

      // Update event_key if incoming has one and existing doesn't
      if (event_key && !existing.event_key) {
        updates.event_key = event_key;
      }

      // Update image_url: always prefer a non-empty image_url
      if (image_url && image_url.trim() !== '') {
        updates.image_url = image_url;
      }

      // ── Cross-row image propagation within same event_key ──
      // If after update this row still has no image, check sibling rows
      const finalEventKey = event_key || existing.event_key || "";
      const finalImageUrl = (image_url && image_url.trim() !== '') ? image_url : (existing.image_url || "");
      if (!finalImageUrl && finalEventKey) {
        const { data: siblings } = await supabase
          .from("sales")
          .select("image_url")
          .eq("platform", platform)
          .eq("event_key", finalEventKey)
          .neq("id", existing.id)
          .not("image_url", "eq", "")
          .not("image_url", "is", null)
          .limit(1);
        if (siblings && siblings.length > 0 && siblings[0].image_url) {
          updates.image_url = siblings[0].image_url;
        }
      }
      // Also propagate: if THIS row now has image_url, update siblings that don't
      const resolvedImage = updates.image_url || finalImageUrl;
      if (resolvedImage && finalEventKey) {
        await supabase
          .from("sales")
          .update({ image_url: resolvedImage })
          .eq("platform", platform)
          .eq("event_key", finalEventKey)
          .neq("id", existing.id)
          .or("image_url.eq.,image_url.is.null");
      }

      // Update dates
      const existingIsSingleDay = existing.start_date && existing.end_date && existing.start_date === existing.end_date;
      const newHasRange = start_date && end_date && start_date !== end_date;

      if (existingIsSingleDay && newHasRange) {
        updates.start_date = start_date;
        updates.end_date = end_date;
      } else {
        if (start_date && (!existing.start_date || start_date < existing.start_date)) {
          updates.start_date = start_date;
        }
        if (end_date && (!existing.end_date || end_date > existing.end_date)) {
          updates.end_date = end_date;
        }
      }

      // Update description if existing is empty
      if (description && (!existing.description || existing.description === '')) {
        updates.description = description;
      }

      // Update source_type, signal_type, confidence_score
      if (source_type) updates.source_type = source_type;
      if (signal_type) updates.signal_type = signal_type;
      if (confidence_score != null && confidence_score > (existing.confidence_score || 0)) {
        updates.confidence_score = confidence_score;
      }
      if (importance_score != null && importance_score > (existing.importance_score || 0)) {
        updates.importance_score = importance_score;
      }

      // Category merge
      if (categoryArray.length > 0) {
        const mergedCats = [...new Set([...(existing.category || []), ...categoryArray])];
        updates.category = mergedCats;
      }

      // Save matched_by and updated_at
      updates.matched_by = matchedBy;
      updates.updated_at = new Date().toISOString();

      // DO NOT touch review_status, publish_status

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("sales").update(updates).eq("id", existing.id);
        if (error) {
          return jsonResponse(500, { error: error.message });
        }
      }

      return jsonResponse(200, {
        ok: true,
        inserted: false,
        updated: true,
        duplicate: false,
        matched_by: matchedBy,
        existing_id: existing.id,
        final_event_key: finalEventKey,
      });
    }

    // ── INSERT new row ──
    const insertData: Record<string, any> = {
      platform,
      sale_name,
      start_date: start_date || null,
      end_date: end_date || null,
      category: categoryArray,
      link: link || "",
      description: description || "",
      sale_tier: sale_tier || "major",
      importance_score: importance_score ?? 0,
      filter_reason: filter_reason || "",
      review_status: "pending",
      publish_status: "draft",
      source_urls: incomingSourceUrls,
      grouped_page_count: grouped_page_count ?? 0,
      event_key: event_key || "",
      latest_pub_date: pubDate,
      latest_source_url: link || "",
      image_url: image_url || "",
      source_type: source_type || "",
      signal_type: signal_type || "",
      confidence_score: confidence_score ?? 0,
    };

    const { data: inserted, error } = await supabase
      .from("sales")
      .insert(insertData)
      .select("id, event_key")
      .single();

    if (error) {
      return jsonResponse(500, { error: error.message });
    }

    return jsonResponse(200, {
      ok: true,
      inserted: true,
      updated: false,
      duplicate: false,
      matched_by: "none",
      existing_id: inserted.id,
      final_event_key: inserted.event_key || "",
    });
  } catch (e) {
    return jsonResponse(500, { error: e.message });
  }
});

function jsonResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\[\](){}【】「」『』〈〉]/g, "")
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) { costs[j] = j; }
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer[i - 1] !== shorter[j - 1]) {
          newValue = Math.min(newValue, lastValue, costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}

function datesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 <= e2 && s2 <= e1;
}
