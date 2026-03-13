import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on `sales` and `event_occurrences`
 * tables, and invalidates the corresponding React Query caches so the UI
 * reflects inserts/updates within seconds.
 */
export function useRealtimeInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("global-data-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sales"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_occurrences" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["event_occurrence_cards"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
