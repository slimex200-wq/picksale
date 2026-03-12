import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Platform } from "@/data/salesUtils";

export const PLATFORM_OPTIONS: { key: Platform; label: string }[] = [
  { key: "쿠팡", label: "쿠팡" },
  { key: "올리브영", label: "올리브영" },
  { key: "무신사", label: "무신사" },
  { key: "KREAM", label: "KREAM" },
  { key: "SSG", label: "SSG" },
  { key: "오늘의집", label: "오늘의집" },
  { key: "29CM", label: "29CM" },
  { key: "WCONCEPT", label: "WCONCEPT" },
];

const QUERY_KEY = "user_preferences";

export function useUserPreferences() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; user_id: string; favorite_platforms: string[] } | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const favoritePlatforms = (preferences?.favorite_platforms ?? []) as Platform[];
  const hasFavorites = favoritePlatforms.length > 0;

  const saveMutation = useMutation({
    mutationFn: async (platforms: Platform[]) => {
      if (!user) throw new Error("Not authenticated");

      if (preferences) {
        const { error } = await supabase
          .from("user_preferences" as any)
          .update({ favorite_platforms: platforms } as any)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_preferences" as any)
          .insert({ user_id: user.id, favorite_platforms: platforms } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] });
    },
  });

  return {
    favoritePlatforms,
    hasFavorites,
    isLoading,
    savePlatforms: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
