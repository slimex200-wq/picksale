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

  // Auth
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || token !== Deno.env.get("PICKSALE_API_KEY")) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean).pop() || "";

  try {
    // Credit card promo keywords
    const CARD_PROMO_KEYWORDS = [
      "카드사", "삼성카드", "신한카드", "국민카드", "현대카드", "롯데카드", "우리카드", "하나카드", "bc카드",
      "결제혜택", "청구할인", "카드할인", "카드혜택", "카드결제",
    ];
    const isCreditCardPromo = (title: string) => {
      const t = title.toLowerCase();
      if (CARD_PROMO_KEYWORDS.some(kw => t.includes(kw))) return true;
      if (t.includes("카드") && !t.includes("세일") && !t.includes("페스타") && !t.includes("위크") && !t.includes("할인대전")) return true;
      return false;
    };

    // POST /api-signals — insert raw signals
    if (req.method === "POST" && (path === "api-signals" || path === "")) {
      const body = await req.json();
      const items = Array.isArray(body) ? body : [body];
      const inserted: string[] = [];
      const skippedCardPromo: string[] = [];

      for (const item of items) {
        if (!item.platform || !item.raw_title) continue;

        const normalized_title = (item.raw_title || "").toLowerCase().trim();

        // Card promo filter: auto-exclude or reduce confidence
        const isCardPromo = isCreditCardPromo(item.raw_title);
        if (isCardPromo) {
          skippedCardPromo.push(item.raw_title);
        }

        let matched_alias = "";
        const { data: alias } = await supabase
          .from("event_aliases")
          .select("canonical_name")
          .eq("platform", item.platform)
          .ilike("alias", normalized_title)
          .limit(1)
          .maybeSingle();
        if (alias) matched_alias = alias.canonical_name;

        const confidenceMap: Record<string, number> = {
          detail: 0.9, event_hub: 0.8, homepage: 0.7, news: 0.5, community: 0.4,
        };
        let confidence = item.confidence != null
          ? Math.min(item.confidence / 100, 1)
          : (confidenceMap[item.source_type] ?? 0.5);

        // Heavily reduce confidence for card promos
        if (isCardPromo) confidence = Math.min(confidence * 0.2, 0.15);

        const { data: existing } = await supabase
          .from("sale_signals")
          .select("id")
          .eq("platform", item.platform)
          .eq("raw_title", item.raw_title)
          .eq("source_type", item.source_type || "homepage")
          .limit(1);
        if (existing && existing.length > 0) continue;

        const { data, error } = await supabase.from("sale_signals").insert({
          platform: item.platform,
          source_type: item.source_type || "homepage",
          source_url: item.source_url || "",
          raw_title: item.raw_title,
          raw_text: item.raw_text || "",
          detected_keywords: item.detected_keywords || [],
          detected_discount: item.detected_discount || "",
          start_date_raw: item.start_date_raw || null,
          end_date_raw: item.end_date_raw || null,
          confidence,
          normalized_title,
          matched_alias,
          review_status: isCardPromo ? "dismissed" : "pending",
          processed: isCardPromo,
        }).select("id").single();

        if (!error && data) inserted.push(data.id);
      }

      return json({ ok: true, inserted_count: inserted.length, ids: inserted, card_promo_filtered: skippedCardPromo.length });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
