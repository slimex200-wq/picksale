import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrganizationBySlug, useBrandEvents, getSeriesSummaries, type SeriesSummary } from "@/hooks/useBrandData";
import { useOrganizationFollow } from "@/hooks/useOrganizationFollow";
import { useLoginGate } from "@/hooks/useLoginGate";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import EventRadarCard from "@/components/event-radar/EventRadarCard";
import ExpandedEventOverlay from "@/components/event-radar/ExpandedEventOverlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Building2, ChevronDown, ChevronUp, ArrowLeft, Bell, BellRing, Layers, ChevronRight } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";

// ── Section Component ──
function EventSection({
  title,
  emoji,
  items,
  variant,
  onCardClick,
  collapsible,
  initialCount = 100,
  compact,
}: {
  title: string;
  emoji: string;
  items: EventOccurrence[];
  variant: "live" | "scheduled" | "ended" | "default";
  onCardClick: (item: EventOccurrence) => void;
  collapsible?: boolean;
  initialCount?: number;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = collapsible && !expanded ? items.slice(0, initialCount) : items;
  const hasMore = collapsible && items.length > initialCount;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">{emoji}</span>
        <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
        <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-[18px]">
          {items.length}
        </Badge>
      </div>
      {compact ? (
        <div className="space-y-1">
          {visible.map((item) => (
            <CompactEndedRow key={item.occurrence_id} item={item} onClick={() => onCardClick(item)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {visible.map((item) => (
            <EventRadarCard
              key={item.occurrence_id}
              item={item}
              variant={variant}
              onClick={() => onCardClick(item)}
            />
          ))}
        </div>
      )}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          {expanded ? (
            <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>더 보기 ({items.length - initialCount}개) <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </section>
  );
}

// ── Compact Ended Row ──
function CompactEndedRow({ item, onClick }: { item: EventOccurrence; onClick: () => void }) {
  const formatShort = (d: string) => { const [y, m, day] = d.split("-"); return `${y}.${m}.${day}`; };
  const dateRange = item.starts_on && item.ends_on
    ? `${formatShort(item.starts_on)} - ${formatShort(item.ends_on)}`
    : item.starts_on ? formatShort(item.starts_on) : "";
  const discount = item.max_discount_pct ? `최대 ${item.max_discount_pct}%` : null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2 text-left hover:bg-accent/40 transition-colors group opacity-60 hover:opacity-80"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
          {item.occurrence_title || item.event_name || "이벤트"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {dateRange && <span className="text-[10px] text-muted-foreground/60 font-medium">{dateRange}</span>}
        {discount && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-[16px] font-bold opacity-60">
            {discount}
          </Badge>
        )}
        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}

// ── Series Summary Card ──
function SeriesCard({ series, onClick }: { series: SeriesSummary; onClick: () => void }) {
  const statusLabel = series.latestOccurrence.status === "live" ? "진행 중"
    : series.latestOccurrence.status === "scheduled" ? "예정" : "종료";
  const statusDot = series.latestOccurrence.status === "live" ? "bg-green-500"
    : series.latestOccurrence.status === "scheduled" ? "bg-yellow-500" : "bg-muted-foreground/30";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border/60 bg-card p-3.5 hover:shadow-sm hover:border-border transition-all group"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-[13px] font-bold text-card-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {series.seriesName}
        </h3>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-colors" />
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          {statusLabel}
        </span>
        {series.bestDiscount && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-[16px] font-bold bg-primary/10 text-primary">
            최대 {series.bestDiscount}%
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground/60 font-medium">
          {series.occurrenceCount}회 기록
        </span>
      </div>
    </button>
  );
}

// ── Series Summary Section ──
function SeriesSummarySection({
  series,
  onCardClick,
}: {
  series: SeriesSummary[];
  onCardClick: (item: EventOccurrence) => void;
}) {
  if (series.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground tracking-tight">대표 이벤트 시리즈</h2>
        <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-[18px]">
          {series.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {series.map((s) => (
          <SeriesCard
            key={s.latestOccurrence.event_series_id}
            series={s}
            onClick={() => onCardClick(s.latestOccurrence)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Loading Skeleton ──
function BrandPageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
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
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-6 pb-28 sm:pb-24 space-y-5">
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
          <header className="space-y-2">
            <Link
              to="/home"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 홈
            </Link>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                    {org.name}
                  </h1>
                  {org.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-md line-clamp-1">
                      {org.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {org.website_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs rounded-lg h-8"
                    onClick={() => window.open(org.website_url!, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">공식 사이트</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs rounded-lg opacity-50 cursor-not-allowed h-8"
                  disabled
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">알림</span>
                </Button>
              </div>
            </div>

            {/* Stats bar — hide zero-value items */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <span>전체 <strong className="text-foreground">{events.length}</strong></span>
              {liveEvents.length > 0 && (
                <span>진행 중 <strong className="text-green-600">{liveEvents.length}</strong></span>
              )}
              {scheduledEvents.length > 0 && (
                <span>예정 <strong className="text-yellow-600">{scheduledEvents.length}</strong></span>
              )}
              {endedEvents.length > 0 && (
                <span className="text-muted-foreground/50">지난 기록 <strong>{endedEvents.length}</strong></span>
              )}
              {seriesSummaries.length > 0 && (
                <span>시리즈 <strong className="text-foreground">{seriesSummaries.length}</strong></span>
              )}
            </div>
          </header>

          {/* ─── Sections ─── */}
          <div className="space-y-6">
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
              compact
            />

            <SeriesSummarySection
              series={seriesSummaries}
              onCardClick={setSelectedEvent}
            />
          </div>

          {events.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">아직 등록된 이벤트가 없습니다.</p>
            </div>
          )}
        </>
      ) : null}

      <ExpandedEventOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
