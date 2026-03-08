import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * DEPRECATED: Use api-signals for crawler ingestion instead.
 * api-signals → sale_signals → admin review → sale_events → sales
 *
 * This endpoint is kept for backward compatibility but should be phased out.
 * It inserts directly into the sales table, bypassing the signal review workflow.
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

  // Auth check
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
    } = body;

    if (!platform || !sale_name || !link) {
      return new Response(
        JSON.stringify({ error: "platform, sale_name, link are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Duplicate check by link
    const { data: existing } = await supabase
      .from("sales")
      .select("id")
      .eq("link", link)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ ok: true, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse category string to array
    const categoryArray = category
      ? (Array.isArray(category) ? category : category.split(",").map((c: string) => c.trim()).filter(Boolean))
      : [];

    const { error } = await supabase.from("sales").insert({
      platform,
      sale_name,
      start_date: start_date || null,
      end_date: end_date || null,
      category: categoryArray,
      link,
      description: description || "",
      sale_tier: sale_tier || "major",
      importance_score: importance_score ?? 0,
      filter_reason: filter_reason || "",
      review_status: "pending",
      publish_status: "draft",
      source_urls: Array.isArray(source_urls) ? source_urls : [],
      grouped_page_count: grouped_page_count ?? 0,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        inserted: true,
        _notice: "DEPRECATED: Consider using api-signals instead for signal-based ingestion workflow.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
