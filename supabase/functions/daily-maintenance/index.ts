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

    const today = new Date().toISOString().split("T")[0];
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
