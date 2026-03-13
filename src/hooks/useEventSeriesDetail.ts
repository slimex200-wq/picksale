import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";

export interface EventSeries {
  id: string;
  name: string;
  slug: string;
  cadence: string;
  event_kind: string;
  notes: string | null;
  organization_id: string;
  typical_start_month: number | null;
  typical_end_month: number | null;
}

export interface EventSeriesDetail {
  series: EventSeries;
  organizationName: string;
  organizationSlug: string;
  occurrences: EventOccurrence[];
}

export function useEventSeriesBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["event_series_detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<EventSeriesDetail | null> => {
      if (!slug) return null;

      // 1. Fetch series
      const { data: series, error: seriesError } = await supabase
        .from("event_series")
        .select("id, name, slug, cadence, event_kind, notes, organization_id, typical_start_month, typical_end_month")
        .eq("slug", slug)
        .maybeSingle();

      if (seriesError) throw seriesError;
      if (!series) return null;

      // 2. Fetch organization name
      const { data: org } = await supabase
        .from("organizations")
        .select("name, slug")
        .eq("id", series.organization_id)
        .maybeSingle();

      // 3. Fetch all occurrences for this series
      const { data: occurrences, error: occError } = await supabase
        .from("event_occurrence_cards")
        .select("occurrence_id,organization_name,organization_id,event_name,event_series_id,occurrence_title,status,starts_on,ends_on,max_discount_pct,official_url,category_tags,organization_slug,event_slug,summary")
        .eq("event_series_id", series.id)
        .order("starts_on", { ascending: false });

      if (occError) throw occError;

      return {
        series: series as EventSeries,
        organizationName: org?.name ?? "알 수 없음",
        organizationSlug: org?.slug ?? "",
        occurrences: (occurrences ?? []) as EventOccurrence[],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Prediction helpers ──

interface PredictionResult {
  patternDescription: string;
  nextExpected: string;
}

export function predictNextOccurrence(occurrences: EventOccurrence[]): PredictionResult | null {
  const withDates = occurrences
    .filter((o) => o.starts_on)
    .sort((a, b) => (b.starts_on! > a.starts_on! ? 1 : -1));

  if (withDates.length < 2) return null;

  const startDates = withDates.map((o) => {
    const d = new Date(o.starts_on! + "T00:00:00");
    return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() };
  });

  // Find average month and week
  const avgMonth = Math.round(startDates.reduce((s, d) => s + d.month, 0) / startDates.length);
  const avgDay = Math.round(startDates.reduce((s, d) => s + d.day, 0) / startDates.length);
  const weekNum = Math.ceil(avgDay / 7);

  const weekLabel = weekNum === 1 ? "첫째 주" : weekNum === 2 ? "둘째 주" : weekNum === 3 ? "셋째 주" : weekNum === 4 ? "넷째 주" : "말";

  const patternDescription = `보통 ${avgMonth}월 ${weekLabel} 시작`;

  // Predict next year
  const latestYear = startDates[0].year;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let nextYear = latestYear + 1;
  if (nextYear < currentYear || (nextYear === currentYear && avgMonth < currentMonth)) {
    nextYear = currentYear + 1;
  }

  const nextExpected = `${nextYear}년 ${avgMonth}월 ${weekLabel}`;

  return { patternDescription, nextExpected };
}

export interface DiscountPattern {
  avgDiscount: number | null;
  maxDiscount: number | null;
  avgStartMonth: number | null;
}

export function getDiscountPattern(occurrences: EventOccurrence[], count = 3): DiscountPattern {
  const recent = occurrences
    .filter((o) => o.max_discount_pct != null)
    .sort((a, b) => (b.starts_on ?? "" > (a.starts_on ?? "") ? 1 : -1))
    .slice(0, count);

  if (recent.length === 0) return { avgDiscount: null, maxDiscount: null, avgStartMonth: null };

  const discounts = recent.map((o) => o.max_discount_pct!);
  const avgDiscount = Math.round(discounts.reduce((s, d) => s + d, 0) / discounts.length);
  const maxDiscount = Math.max(...discounts);

  const withDates = recent.filter((o) => o.starts_on);
  const avgStartMonth = withDates.length > 0
    ? Math.round(withDates.reduce((s, o) => s + (new Date(o.starts_on! + "T00:00:00").getMonth() + 1), 0) / withDates.length)
    : null;

  return { avgDiscount, maxDiscount, avgStartMonth };
}
