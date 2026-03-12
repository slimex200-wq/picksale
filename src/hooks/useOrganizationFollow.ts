import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useOrganizationFollow(organizationId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["org_follow", user?.id, organizationId];

  const { data: isFollowing = false, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user && !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_follows")
        .select("user_id")
        .eq("user_id", user!.id)
        .eq("organization_id", organizationId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !organizationId) throw new Error("Missing data");
      const { error } = await supabase
        .from("organization_follows")
        .insert({ user_id: user.id, organization_id: organizationId });
      if (error) throw error;
    },
    onSuccess: () => qc.setQueryData(key, true),
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user || !organizationId) throw new Error("Missing data");
      const { error } = await supabase
        .from("organization_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("organization_id", organizationId);
      if (error) throw error;
    },
    onSuccess: () => qc.setQueryData(key, false),
  });

  return {
    isFollowing,
    isLoading,
    follow: followMutation.mutateAsync,
    unfollow: unfollowMutation.mutateAsync,
    isToggling: followMutation.isPending || unfollowMutation.isPending,
  };
}
