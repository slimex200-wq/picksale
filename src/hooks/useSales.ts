import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Sale, Platform, SaleTier, ReviewStatus, PublishStatus } from "@/data/salesUtils";
import { getTodayKST } from "@/data/salesUtils";

/** Columns needed for card/list views (no description, source_urls, filter_reason) */
const LIST_COLUMNS = "id,platform,sale_name,start_date,end_date,category,link,sale_tier,importance_score,review_status,publish_status,grouped_page_count,event_id,signal_id,created_at,image_url,updated_at,description,latest_source_url,source_type";

/** Public hook – only returns published & non-expired sales */
export function useSales() {
  return useQuery({
    queryKey: ["sales", "published"],
    queryFn: async (): Promise<Sale[]> => {
      const today = getTodayKST();
      const { data, error } = await supabase
        .from("sales")
        .select(LIST_COLUMNS)
        .eq("publish_status", "published")
        .gte("end_date", today)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
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
    image_url: row.image_url ?? "",
    event_id: row.event_id ?? null,
    signal_id: row.signal_id ?? null,
    created_at: row.created_at,
    event_key: row.event_key ?? "",
    latest_pub_date: row.latest_pub_date ?? null,
    latest_source_url: row.latest_source_url ?? "",
    source_type: row.source_type ?? "",
    signal_type: row.signal_type ?? "",
    confidence_score: row.confidence_score ?? 0,
    updated_at: row.updated_at ?? "",
    matched_by: row.matched_by ?? "",
  };
}
