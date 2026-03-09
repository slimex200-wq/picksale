import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // KST (UTC+9) 기준 오늘 날짜
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const today = new Date(now.getTime() + kstOffset).toISOString().split("T")[0];
    const results: string[] = [];

    // 1. Expire sale_events where end_date < today
    const { data: expiredEvents, error: e1 } = await supabase
      .from("sale_events")
      .update({ event_status: "expired", updated_at: new Date().toISOString() })
      .lt("end_date", today)
      .eq("event_status", "active")
      .select("id");
    if (e1) throw e1;
    results.push(`Expired ${expiredEvents?.length ?? 0} events`);

    // 2. Hide published sales where end_date < today
    const { data: hiddenSales, error: e2 } = await supabase
      .from("sales")
      .update({ publish_status: "hidden" })
      .lt("end_date", today)
      .eq("publish_status", "published")
      .select("id");
    if (e2) throw e2;
    results.push(`Hidden ${hiddenSales?.length ?? 0} expired sales`);

    // 3. Auto-dismiss old unprocessed signals (>7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: dismissedSignals, error: e3 } = await supabase
      .from("sale_signals")
      .update({ review_status: "auto_dismissed", processed: true })
      .eq("review_status", "pending")
      .lt("created_at", sevenDaysAgo)
      .select("id");
    if (e3) throw e3;
    results.push(`Auto-dismissed ${dismissedSignals?.length ?? 0} old signals`);

    // 4. Auto-dismiss card promo signals still pending
    const CARD_KEYWORDS = ["카드사", "삼성카드", "신한카드", "국민카드", "현대카드", "롯데카드", "결제혜택", "청구할인", "카드할인", "카드혜택"];
    const { data: pendingSignals } = await supabase
      .from("sale_signals")
      .select("id, raw_title")
      .eq("review_status", "pending");

    const cardPromoIds = (pendingSignals ?? [])
      .filter(s => {
        const t = s.raw_title.toLowerCase();
        return CARD_KEYWORDS.some(kw => t.includes(kw.toLowerCase())) ||
          (t.includes("카드") && !t.includes("세일") && !t.includes("페스타") && !t.includes("위크"));
      })
      .map(s => s.id);

    if (cardPromoIds.length > 0) {
      await supabase
        .from("sale_signals")
        .update({ review_status: "dismissed", processed: true })
        .in("id", cardPromoIds);
    }
    results.push(`Card-promo dismissed ${cardPromoIds.length} signals`);

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
