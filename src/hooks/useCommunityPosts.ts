import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityPost {
  id: string;
  platform: string | null;
  title: string;
  content: string | null;
  external_link: string;
  category: string[];
  author: string | null;
  source_type: string | null;
  review_status: string;
  upvotes: number;
  comments_count: number;
  signal_score: number;
  is_sale_signal: boolean;
  created_at: string;
  updated_at: string;
}

/** Columns needed for list/card views (no content, source_type, updated_at) */
const LIST_COLUMNS = "id,platform,title,external_link,category,author,review_status,upvotes,comments_count,signal_score,is_sale_signal,created_at";

export function useCommunityPosts(options?: {
  category?: string;
  sort?: "newest" | "upvotes" | "trending";
  limit?: number;
}) {
  return useQuery({
    queryKey: ["community_posts", options],
    queryFn: async (): Promise<CommunityPost[]> => {
      let q = supabase
        .from("community_posts")
        .select(LIST_COLUMNS)
        .eq("review_status", "published");

      if (options?.category && options.category !== "all") {
        q = q.contains("category", [options.category]);
      }

      if (options?.sort === "upvotes") {
        q = q.order("upvotes", { ascending: false });
      } else if (options?.sort === "trending") {
        q = q.order("signal_score", { ascending: false });
      } else {
        q = q.order("created_at", { ascending: false });
      }

      if (options?.limit) {
        q = q.limit(options.limit);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CommunityPost[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAllCommunityPosts() {
  return useQuery({
    queryKey: ["community_posts", "all"],
    queryFn: async (): Promise<CommunityPost[]> => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CommunityPost[];
    },
  });
}
