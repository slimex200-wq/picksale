import { useEffect, useCallback, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, X, Radar, History, Layers, ChevronRight } from "lucide-react";

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
}

function formatDateShort(d: string) {
  const [y, m, day] = d.split("-");
  return `${y}.${m}.${day}`;
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return formatDate(start);
  return formatDate(end!);
}

function formatDateRangeShort(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && end) return `${formatDateShort(start)} - ${formatDateShort(end)}`;
  if (start) return formatDateShort(start);
  return formatDateShort(end!);
}

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  live: { label: "진행 중", emoji: "🟢", className: "bg-green-100 text-green-800 border-green-400" },
  scheduled: { label: "예정", emoji: "🟡", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ended: { label: "종료", emoji: "⚪", className: "bg-muted text-muted-foreground border-border" },
};

export interface ExpandedEventOverlayProps {
  event: EventOccurrence | null;
  onClose: () => void;
}

// ── Hooks ──

function usePastOccurrences(event: EventOccurrence | null) {
  const seriesId = event?.event_series_id;
  const occurrenceId = event?.occurrence_id;

  return useQuery({
    queryKey: ["past_occurrences", seriesId, occurrenceId],
    enabled: !!seriesId && !!occurrenceId,
    queryFn: async (): Promise<EventOccurrence[]> => {
      if (!seriesId || !occurrenceId) return [];

      const { data, error } = await supabase
        .from("event_occurrence_cards")
        .select("*")
        .eq("event_series_id", seriesId)
        .neq("occurrence_id", occurrenceId)
        .order("starts_on", { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data ?? []) as EventOccurrence[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

function useSameBrandEvents(event: EventOccurrence | null) {
  const orgId = event?.organization_id;
  const occurrenceId = event?.occurrence_id;

  return useQuery({
    queryKey: ["same_brand_events", orgId, occurrenceId],
    enabled: !!orgId && !!occurrenceId,
    queryFn: async (): Promise<EventOccurrence[]> => {
      if (!orgId || !occurrenceId) return [];

      const { data, error } = await supabase
        .from("event_occurrence_cards")
        .select("*")
        .eq("organization_id", orgId)
        .neq("occurrence_id", occurrenceId)
        .order("starts_on", { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data ?? []) as EventOccurrence[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ── Sub-components ──

function RelatedItem({ item, onClick }: { item: EventOccurrence; onClick: () => void }) {
  const dateRange = formatDateRangeShort(item.starts_on, item.ends_on);
  const discount = item.max_discount_pct ? `최대 ${item.max_discount_pct}%` : null;
  const st = statusConfig[item.status ?? "ended"] ?? statusConfig.ended;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-border/60 px-3.5 py-3 text-left hover:bg-accent/50 hover:border-border transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {item.occurrence_title || item.event_name || "이벤트"}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {dateRange && (
            <span className="text-[10px] text-muted-foreground font-medium">{dateRange}</span>
          )}
          {discount && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-[16px] font-bold bg-primary/10 text-primary">
              {discount}
            </Badge>
          )}
          <Badge variant="outline" className={`text-[9px] px-1 py-0 h-[14px] font-semibold border ${st.className}`}>
            {st.label}
          </Badge>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-colors" />
    </button>
  );
}

function RelatedSection({
  icon: Icon,
  title,
  items,
  isLoading,
  emptyText,
  onItemClick,
}: {
  icon: typeof History;
  title: string;
  items: EventOccurrence[];
  isLoading: boolean;
  emptyText: string;
  onItemClick: (item: EventOccurrence) => void;
}) {
  return (
    <div className="border-t border-border/40 pt-4 space-y-2">
      <div className="flex items-center gap-2 px-0.5 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-xs font-bold text-foreground">{title}</span>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map((item) => (
            <RelatedItem key={item.occurrence_id} item={item} onClick={() => onItemClick(item)} />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground/60 px-1 py-2">{emptyText}</p>
      )}
    </div>
  );
}

// ── Main Overlay ──

export default function ExpandedEventOverlay({ event: initialEvent, onClose }: ExpandedEventOverlayProps) {
  const [event, setEvent] = useState<EventOccurrence | null>(initialEvent);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  // Scroll content to top when event changes internally
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [event?.occurrence_id]);

  const { data: pastOccurrences = [], isLoading: pastLoading } = usePastOccurrences(event);
  const { data: sameBrandEvents = [], isLoading: brandLoading } = useSameBrandEvents(event);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!event) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [event, handleKeyDown]);

  if (!event) return null;

  const status = statusConfig[event.status ?? "ended"] ?? statusConfig.ended;
  const dateRange = formatDateRange(event.starts_on, event.ends_on);
  const discount = event.max_discount_pct ? `최대 ${event.max_discount_pct}%` : null;
  const tags = event.category_tags ?? [];
  const title = event.occurrence_title || event.event_name || "이벤트";
  const showEventName = event.event_name && event.occurrence_title && event.event_name !== event.occurrence_title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ animation: "expandOverlayIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "expandDimIn 300ms ease forwards" }}
      />

      <div
        className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          animation: "expandCardIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          willChange: "transform, opacity",
          boxShadow: "0 25px 60px -12px hsl(var(--foreground) / 0.25), 0 8px 24px -4px hsl(var(--primary) / 0.15)",
        }}
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-br from-primary/10 to-accent/30 p-5 pb-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-foreground/10 backdrop-blur-sm rounded-xl p-2 text-foreground/60 hover:bg-foreground/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Organization as sub-label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radar className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground tracking-tight">
              {event.organization_name ?? "알 수 없음"}
            </span>
          </div>

          {/* Main title */}
          <h2 className="text-lg font-bold text-card-foreground leading-snug tracking-tight pr-8">
            {title}
          </h2>

          {/* Event name as secondary description */}
          {showEventName && (
            <p className="text-[11px] text-muted-foreground/70 mt-1 font-medium">
              {event.event_name}
            </p>
          )}
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status + Discount */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="outline" className={`${status.className} border text-xs font-semibold px-2 py-0.5`}>
              {status.emoji} {status.label}
            </Badge>
            {discount && (
              <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5">
                {discount}
              </Badge>
            )}
          </div>

          {/* Date */}
          {dateRange && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{dateRange}</span>
            </div>
          )}

          {/* Category tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Summary */}
          {event.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.summary}
            </p>
          )}

          {/* CTA */}
          {event.official_url && (
            <div className="pt-1">
              <Button
                className="w-full rounded-xl gap-2 h-11 font-semibold"
                onClick={() => window.open(event.official_url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                공식 페이지 바로가기
              </Button>
            </div>
          )}

          {/* ─── Past Occurrences ─── */}
          <RelatedSection
            icon={History}
            title="작년 기록 보기"
            items={pastOccurrences}
            isLoading={pastLoading}
            emptyText="이전 기록이 아직 없습니다"
            onItemClick={setEvent}
          />

          {/* ─── Same Brand Events ─── */}
          <RelatedSection
            icon={Layers}
            title={`${event.organization_name ?? "브랜드"}의 다른 이벤트`}
            items={sameBrandEvents}
            isLoading={brandLoading}
            emptyText="같은 브랜드의 다른 이벤트가 없습니다"
            onItemClick={setEvent}
          />
        </div>
      </div>

      <style>{`
        @keyframes expandDimIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes expandOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes expandCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
