import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://picksale.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];

    // Fetch published sales, active events, published community posts in parallel
    const [salesRes, eventsRes, postsRes] = await Promise.all([
      supabase.from("sales").select("id, start_date, end_date").eq("publish_status", "published").limit(1000),
      supabase.from("sale_events").select("id, start_date, end_date, updated_at").eq("event_status", "active").limit(500),
      supabase.from("community_posts").select("id, updated_at").eq("review_status", "published").limit(500),
    ]);

    const sales = salesRes.data ?? [];
    const events = eventsRes.data ?? [];
    const posts = postsRes.data ?? [];

    // Platform slugs
    const platformSlugs = ["coupang", "oliveyoung", "musinsa", "kream", "ssg", "ohouse", "29cm", "wconcept", "community"];

    let urls = "";

    // Static pages
    urls += url("/", today, "daily", "1.0");
    urls += url("/calendar", today, "daily", "0.7");
    urls += url("/community", today, "daily", "0.6");

    // Platform pages
    for (const slug of platformSlugs) {
      urls += url(`/platform/${slug}`, today, "daily", "0.8");
    }

    // Event pages
    for (const e of events) {
      urls += url(`/event/${e.id}`, e.updated_at?.split("T")[0] || today, "daily", "0.9");
    }

    // Sale pages
    for (const s of sales) {
      urls += url(`/sale/${s.id}`, s.start_date, "weekly", "0.7");
    }

    // Community posts
    for (const p of posts) {
      urls += url(`/community/${p.id}`, p.updated_at?.split("T")[0] || today, "weekly", "0.5");
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (e) {
    return new Response(`<!-- error: ${e.message} -->`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
});

function url(path: string, lastmod: string, freq: string, priority: string): string {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
}
