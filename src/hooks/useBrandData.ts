import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  org_type: string;
  country_code: string;
}

export function useOrganizationBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["organization", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Organization | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug, description, website_url, logo_url, org_type, country_code")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Organization | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandEvents(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["brand_events", organizationId],
    enabled: !!organizationId,
    queryFn: async (): Promise<EventOccurrence[]> => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("event_occurrence_cards")
        .select("occurrence_id,organization_name,organization_id,event_name,event_series_id,occurrence_title,status,starts_on,ends_on,max_discount_pct,official_url,category_tags,organization_slug,event_slug,summary")
        .eq("organization_id", organizationId)
        .order("starts_on", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventOccurrence[];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export interface SeriesSummary {
  latestOccurrence: EventOccurrence;
  seriesName: string;
  occurrenceCount: number;
  bestDiscount: number | null;
}

export function getSeriesSummaries(events: EventOccurrence[]): SeriesSummary[] {
  const seriesMap = new Map<string, { latest: EventOccurrence; count: number; bestDiscount: number | null }>();
  for (const ev of events) {
    const sid = ev.event_series_id;
    if (!sid) continue;
    const existing = seriesMap.get(sid);
    if (!existing) {
      seriesMap.set(sid, { latest: ev, count: 1, bestDiscount: ev.max_discount_pct });
    } else {
      existing.count++;
      if (ev.max_discount_pct && (!existing.bestDiscount || ev.max_discount_pct > existing.bestDiscount)) {
        existing.bestDiscount = ev.max_discount_pct;
      }
      if ((ev.starts_on ?? "") > (existing.latest.starts_on ?? "")) {
        existing.latest = ev;
      }
    }
  }
  return Array.from(seriesMap.values())
    .map((v) => ({
      latestOccurrence: v.latest,
      seriesName: v.latest.event_name || v.latest.occurrence_title || "이벤트",
      occurrenceCount: v.count,
      bestDiscount: v.bestDiscount,
    }))
    .sort((a, b) => (b.latestOccurrence.starts_on ?? "").localeCompare(a.latestOccurrence.starts_on ?? ""));
}
