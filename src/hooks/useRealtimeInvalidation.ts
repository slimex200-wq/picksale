import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single Realtime subscription that covers all card-data tables.
 * Must be mounted exactly once (via <RealtimeSync /> in App.tsx).
 *
 * Tables monitored → query keys invalidated:
 *   sales              → ["sales"]  (covers "published", "admin", detail pages)
 *   event_occurrences  → ["event_occurrence_cards"], ["brand_events"], ["event_series_detail"]
 *   event_series       → ["event_occurrence_cards"], ["event_series_detail"], ["brand_events"]
 *   organizations      → ["organization"], ["event_occurrence_cards"]
 *   community_posts    → ["community_posts"]
 */
export function useRealtimeInvalidation() {
  const queryClient = useQueryClient();
  const mountedRef = useRef(false);

  useEffect(() => {
    // Guard against React strict-mode double-mount
    if (mountedRef.current) return;
    mountedRef.current = true;

    const channel = supabase
      .channel("global-data-sync")
      // ── sales table ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sales"] });
        }
      )
      // ── event_occurrences table (backs event_occurrence_cards view) ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_occurrences" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["event_occurrence_cards"] });
          queryClient.invalidateQueries({ queryKey: ["brand_events"] });
          queryClient.invalidateQueries({ queryKey: ["event_series_detail"] });
        }
      )
      // ── event_series table (also feeds the view) ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_series" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["event_occurrence_cards"] });
          queryClient.invalidateQueries({ queryKey: ["event_series_detail"] });
          queryClient.invalidateQueries({ queryKey: ["brand_events"] });
        }
      )
      // ── organizations (feeds the view + brand pages) ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organizations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["organization"] });
          queryClient.invalidateQueries({ queryKey: ["event_occurrence_cards"] });
        }
      )
      // ── community_posts ──
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_posts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["community_posts"] });
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
