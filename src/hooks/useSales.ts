import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Sale, type Platform, type SaleTier, type ReviewStatus, type PublishStatus, normalizePlatform } from "@/data/salesUtils";

/** Public hook – only returns published sales */
export function useSales() {
  return useQuery({
    queryKey: ["sales", "published"],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("publish_status", "published")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });
}

/** Admin hook – returns all sales with optional filters */
export function useAdminSales(filters?: {
  review_status?: string;
  publish_status?: string;
  sale_tier?: string;
  platform?: string;
  sort?: "newest" | "importance";
}) {
  return useQuery({
    queryKey: ["sales", "admin", filters],
    queryFn: async (): Promise<Sale[]> => {
      let q = supabase.from("sales").select("*");

      if (filters?.review_status && filters.review_status !== "all") q = q.eq("review_status", filters.review_status);
      if (filters?.publish_status && filters.publish_status !== "all") q = q.eq("publish_status", filters.publish_status);
      if (filters?.sale_tier && filters.sale_tier !== "all") q = q.eq("sale_tier", filters.sale_tier);
      if (filters?.platform && filters.platform !== "all") q = q.eq("platform", filters.platform);

      if (filters?.sort === "importance") {
        q = q.order("importance_score", { ascending: false });
      } else {
        q = q.order("created_at", { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });
}

function mapRow(row: any): Sale {
  return {
    id: row.id,
    platform: row.platform as Platform,
    sale_name: row.sale_name,
    start_date: row.start_date,
    end_date: row.end_date,
    category: row.category ?? [],
    link: row.link ?? "",
    description: row.description ?? "",
    sale_tier: (row.sale_tier ?? "major") as SaleTier,
    importance_score: row.importance_score ?? 0,
    filter_reason: row.filter_reason ?? "",
    review_status: (row.review_status ?? "pending") as ReviewStatus,
    publish_status: (row.publish_status ?? "draft") as PublishStatus,
    source_urls: row.source_urls ?? [],
    grouped_page_count: row.grouped_page_count ?? 0,
    created_at: row.created_at,
  };
}
