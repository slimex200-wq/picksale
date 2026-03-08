import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || token !== Deno.env.get("PICKSALE_API_KEY")) return json({ error: "Unauthorized" }, 401);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const body = await req.json();
    const action = body.action || "ingest";

    // Action: ingest community post
    if (action === "ingest") {
      const { platform, title, content, link, category, author, source_type } = body;
      if (!title) return json({ error: "title is required" }, 400);

      // Duplicate check
      if (link) {
        const { data: existing } = await supabase
          .from("community_posts")
          .select("id")
          .eq("external_link", link)
          .limit(1);
        if (existing && existing.length > 0) return json({ ok: true, duplicate: true });
      }

      const categoryArray = category
        ? (Array.isArray(category) ? category : category.split(",").map((c: string) => c.trim()).filter(Boolean))
        : [];

      const { data, error } = await supabase.from("community_posts").insert({
        platform: platform || null,
        title,
        content: content || null,
        external_link: link || "",
        category: categoryArray,
        author: author || null,
        source_type: source_type || null,
        review_status: "published",
      }).select("id").single();

      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, inserted: true, post_id: data.id });
    }

    // Action: create-signal from community post
    if (action === "create-signal") {
      const { post_id } = body;
      if (!post_id) return json({ error: "post_id required" }, 400);

      const { data: post, error: postErr } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", post_id)
        .single();
      if (postErr || !post) return json({ error: "Post not found" }, 404);
      if (post.is_sale_signal) return json({ ok: true, already_signal: true });

      const normalized_title = (post.title || "").toLowerCase().trim();
      let matched_alias = "";
      if (post.platform) {
        const { data: alias } = await supabase
          .from("event_aliases")
          .select("canonical_name")
          .eq("platform", post.platform)
          .ilike("alias", normalized_title)
          .limit(1)
          .maybeSingle();
        if (alias) matched_alias = alias.canonical_name;
      }

      const score = (post.upvotes || 0) * 2 + (post.comments_count || 0);
      const confidence = Math.min(score / 20, 1);

      const { data: sig, error: sigErr } = await supabase.from("sale_signals").insert({
        platform: post.platform || "커뮤니티",
        source_type: "community",
        source_url: post.external_link || "",
        raw_title: post.title,
        raw_text: post.content || "",
        confidence,
        normalized_title,
        matched_alias,
        community_post_id: post.id,
        review_status: "pending",
      }).select("id").single();
      if (sigErr) return json({ error: sigErr.message }, 500);

      await supabase.from("community_posts").update({ is_sale_signal: true }).eq("id", post.id);
      return json({ ok: true, signal_id: sig.id });
    }

    // Action: promote-event
    if (action === "promote-event") {
      const { signal_ids, canonical_title, platform, start_date, end_date } = body;
      if (!signal_ids?.length || !canonical_title || !platform) {
        return json({ error: "signal_ids, canonical_title, platform required" }, 400);
      }

      const today = new Date().toISOString().split("T")[0];
      const finalEnd = end_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

      const { data: evt, error: evtErr } = await supabase.from("sale_events").insert({
        canonical_title,
        platform,
        start_date: start_date || today,
        end_date: finalEnd,
        signal_count: signal_ids.length,
        importance_score: signal_ids.length * 3,
        event_status: "active",
      }).select("id").single();
      if (evtErr) return json({ error: evtErr.message }, 500);

      await supabase.from("sales").insert({
        platform,
        sale_name: canonical_title,
        start_date: start_date || today,
        end_date: finalEnd,
        event_id: evt.id,
        review_status: "approved",
        publish_status: "draft",
      });

      await supabase
        .from("sale_signals")
        .update({ review_status: "promoted", processed: true })
        .in("id", signal_ids);

      return json({ ok: true, event_id: evt.id });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
