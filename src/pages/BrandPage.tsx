import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrganizationBySlug, useBrandEvents, getSeriesSummaries } from "@/hooks/useBrandData";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import EventRadarCard from "@/components/event-radar/EventRadarCard";
import ExpandedEventOverlay from "@/components/event-radar/ExpandedEventOverlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Building2, ChevronDown, ChevronUp, ArrowLeft, Bell, Layers } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

// ── Section Component ──
function EventSection({
  title,
  emoji,
  items,
  variant,
  onCardClick,
  collapsible,
  initialCount = 100,
}: {
  title: string;
  emoji: string;
  items: EventOccurrence[];
  variant: "live" | "scheduled" | "ended" | "default";
  onCardClick: (item: EventOccurrence) => void;
  collapsible?: boolean;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = collapsible && !expanded ? items.slice(0, initialCount) : items;
  const hasMore = collapsible && items.length > initialCount;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
        <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-[18px]">
          {items.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((item) => (
          <EventRadarCard
            key={item.occurrence_id}
            item={item}
            variant={variant}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          {expanded ? (
            <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>지난 기록 더 보기 ({items.length - initialCount}개) <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </section>
  );
}

// ── Series Summary Section ──
function SeriesSummarySection({
  series,
  onCardClick,
}: {
  series: EventOccurrence[];
  onCardClick: (item: EventOccurrence) => void;
}) {
  if (series.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground tracking-tight">대표 이벤트 시리즈</h2>
        <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-[18px]">
          {series.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {series.map((item) => (
          <EventRadarCard
            key={item.event_series_id}
            item={item}
            variant={item.status === "live" ? "live" : item.status === "scheduled" ? "scheduled" : "default"}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Loading Skeleton ──
function BrandPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function BrandPage() {
  const { organizationSlug } = useParams<{ organizationSlug: string }>();
  const { data: org, isLoading: orgLoading } = useOrganizationBySlug(organizationSlug);
  const { data: events = [], isLoading: eventsLoading } = useBrandEvents(org?.id);
  const [selectedEvent, setSelectedEvent] = useState<EventOccurrence | null>(null);

  const isLoading = orgLoading || eventsLoading;

  const liveEvents = useMemo(() => events.filter((e) => e.status === "live"), [events]);
  const scheduledEvents = useMemo(() => events.filter((e) => e.status === "scheduled"), [events]);
  const endedEvents = useMemo(() => events.filter((e) => e.status === "ended"), [events]);
  const seriesSummaries = useMemo(() => getSeriesSummaries(events), [events]);

  if (!orgLoading && !org) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-28 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">브랜드를 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground">요청한 브랜드 페이지가 존재하지 않습니다.</p>
        <Link to="/home">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-8 pb-28 sm:pb-24 space-y-8">
      <PageMeta
        title={org ? `${org.name} 세일·이벤트 | PickSale` : "브랜드 | PickSale"}
        description={org?.description ?? `${org?.name ?? "브랜드"}의 세일 및 이벤트 정보를 확인하세요.`}
      />
      {org && <CanonicalLink href={`${window.location.origin}/brands/${org.slug}`} />}

      {isLoading ? (
        <BrandPageSkeleton />
      ) : org ? (
        <>
          {/* ─── Header ─── */}
          <header className="space-y-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 홈
            </Link>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    {org.name}
                  </h1>
                  {org.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                      {org.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Placeholder for follow/alert button */}
              <div className="shrink-0 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs rounded-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Bell className="w-3.5 h-3.5" />
                  알림 받기
                </Button>
              </div>
            </div>

            {org.website_url && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-lg"
                onClick={() => window.open(org.website_url!, "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                공식 사이트
              </Button>
            )}

            {/* Stats bar */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium pt-1">
              <span>전체 이벤트 <strong className="text-foreground">{events.length}</strong></span>
              <span>진행 중 <strong className="text-green-600">{liveEvents.length}</strong></span>
              <span>예정 <strong className="text-yellow-600">{scheduledEvents.length}</strong></span>
              <span>시리즈 <strong className="text-foreground">{seriesSummaries.length}</strong></span>
            </div>
          </header>

          {/* ─── Sections ─── */}
          <div className="space-y-8">
            <EventSection
              title="진행 중"
              emoji="🟢"
              items={liveEvents}
              variant="live"
              onCardClick={setSelectedEvent}
            />

            <EventSection
              title="예정"
              emoji="🟡"
              items={scheduledEvents}
              variant="scheduled"
              onCardClick={setSelectedEvent}
            />

            <EventSection
              title="지난 기록"
              emoji="⚪"
              items={endedEvents}
              variant="ended"
              onCardClick={setSelectedEvent}
              collapsible
              initialCount={4}
            />

            <SeriesSummarySection
              series={seriesSummaries}
              onCardClick={setSelectedEvent}
            />
          </div>

          {/* Empty state */}
          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">아직 등록된 이벤트가 없습니다.</p>
            </div>
          )}
        </>
      ) : null}

      <ExpandedEventOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
