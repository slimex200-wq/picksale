import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useBookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarkedSaleIds = [], isLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("sale_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((b) => b.sale_id);
    },
    staleTime: 60 * 1000,
  });

  const isBookmarked = (saleId: string) => bookmarkedSaleIds.includes(saleId);

  const toggleBookmark = useMutation({
    mutationFn: async (saleId: string) => {
      if (!user) throw new Error("Not authenticated");
      const existing = bookmarkedSaleIds.includes(saleId);
      if (existing) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("sale_id", saleId);
        if (error) throw error;
        return { action: "removed" as const, saleId };
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, sale_id: saleId });
        if (error) throw error;
        return { action: "added" as const, saleId };
      }
    },
    onMutate: async (saleId: string) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks", user?.id] });
      const previous = queryClient.getQueryData<string[]>(["bookmarks", user?.id]);
      queryClient.setQueryData<string[]>(["bookmarks", user?.id], (old = []) =>
        old.includes(saleId) ? old.filter((id) => id !== saleId) : [...old, saleId]
      );
      return { previous };
    },
    onError: (_err, _saleId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks", user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
    },
  });

  return { bookmarkedSaleIds, isBookmarked, toggleBookmark, isLoading };
}
