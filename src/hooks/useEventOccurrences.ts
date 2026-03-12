import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventOccurrence {
  occurrence_id: string | null;
  organization_name: string | null;
  organization_id: string | null;
  event_name: string | null;
  event_series_id: string | null;
  occurrence_title: string | null;
  status: string | null;
  starts_on: string | null;
  ends_on: string | null;
  max_discount_pct: number | null;
  official_url: string | null;
  category_tags: string[] | null;
  organization_slug: string | null;
  event_slug: string | null;
  summary: string | null;
}

export type OccurrenceStatus = "live" | "ending_today" | "starting_soon" | "ended";

export function getOccurrenceStatus(item: EventOccurrence): OccurrenceStatus {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

  if (!item.starts_on || !item.ends_on) return "ended";
  if (item.ends_on < todayStr) return "ended";
  if (item.ends_on === todayStr) return "ending_today";
  if (item.starts_on > todayStr) return "starting_soon";
  return "live";
}

export function useEventOccurrences() {
  return useQuery({
    queryKey: ["event_occurrence_cards"],
    queryFn: async (): Promise<EventOccurrence[]> => {
      const { data, error } = await supabase
        .from("event_occurrence_cards")
        .select("occurrence_id,organization_name,event_name,occurrence_title,status,starts_on,ends_on,max_discount_pct,official_url,category_tags,organization_slug,event_slug,summary");

      if (error) throw error;
      return (data ?? []) as EventOccurrence[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
