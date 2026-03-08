import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityPost {
  id: string;
  platform: string | null;
  title: string;
  content: string | null;
  link: string;
  category: string[];
  author: string | null;
  source_type: string | null;
  review_status: string;
  created_at: string;
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ["community_posts"],
    queryFn: async (): Promise<CommunityPost[]> => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
