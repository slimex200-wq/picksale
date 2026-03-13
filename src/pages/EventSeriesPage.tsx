import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useEventSeriesBySlug, predictNextOccurrence, getDiscountPattern } from "@/hooks/useEventSeriesDetail";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import EventRadarCard from "@/components/event-radar/EventRadarCard";
import ExpandedEventOverlay from "@/components/event-radar/ExpandedEventOverlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, TrendingUp, Building2, ChevronRight, Sparkles } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import JsonLd from "@/components/JsonLd";

// ── Helpers ──

function formatDateShort(d: string) {
  const [y, m, day] = d.split("-");
  return `${y}.${m}.${day}`;
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && end) return `${formatDateShort(start)} - ${formatDateShort(end)}`;
  if (start) return formatDateShort(start);
  return formatDateShort(end!);
}

const statusLabel: Record<string, string> = {
  live: "진행 중",
  scheduled: "예정",
  ended: "종료",
};

const statusDot: Record<string, string> = {
  live: "bg-green-500",
  scheduled: "bg-yellow-500",
  ended: "bg-muted-foreground/30",
};

// ── Skeleton ──
function PageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-72" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: typeof TrendingUp }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-extrabold text-card-foreground tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Occurrence Row ──
function OccurrenceRow({ item, onClick }: { item: EventOccurrence; onClick: () => void }) {
  const dateRange = formatDateRange(item.starts_on, item.ends_on);
  const discount = item.max_discount_pct ? `최대 ${item.max_discount_pct}%` : null;
  const status = item.status ?? "ended";
  const isEnded = status === "ended";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl border border-border/60 px-3.5 py-3 text-left transition-colors group ${
        isEnded ? "opacity-60 hover:opacity-80" : "hover:bg-accent/50 hover:border-border"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[status] ?? statusDot.ended}`} />
          <p className="text-xs font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {item.occurrence_title || item.event_name || "이벤트"}
          </p>
        </div>
        <div className="flex items-center gap-2 pl-4 flex-wrap">
          {dateRange && <span className="text-[10px] text-muted-foreground font-medium">{dateRange}</span>}
          {discount && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-[16px] font-bold bg-primary/10 text-primary">
              {discount}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground/60 font-medium">{statusLabel[status] ?? "종료"}</span>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-colors" />
    </button>
  );
}

// ── Main Page ──
export default function EventSeriesPage() {
  const { eventSeriesSlug } = useParams<{ eventSeriesSlug: string }>();
  const { data, isLoading } = useEventSeriesBySlug(eventSeriesSlug);
  const [selectedEvent, setSelectedEvent] = useState<EventOccurrence | null>(null);

  const prediction = useMemo(
    () => (data ? predictNextOccurrence(data.occurrences) : null),
    [data]
  );

  const discountPattern = useMemo(
    () => (data ? getDiscountPattern(data.occurrences) : null),
    [data]
  );

  const liveOccurrences = useMemo(
    () => (data?.occurrences ?? []).filter((o) => o.status === "live" || o.status === "scheduled"),
    [data]
  );

  const pastOccurrences = useMemo(
    () => (data?.occurrences ?? []).filter((o) => o.status === "ended"),
    [data]
  );

  // SEO title
  const seoTitle = data
    ? `${data.series.name} 언제 하나요? | PickSale`
    : "이벤트 시리즈 | PickSale";
  const seoDesc = data
    ? `${data.organizationName}의 ${data.series.name} 세일 일정, 할인율, 패턴을 확인하세요.`
    : "세일 이벤트 시리즈 정보";

  if (!isLoading && !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-28 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">시리즈를 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground">요청한 이벤트 시리즈가 존재하지 않습니다.</p>
        <Link to="/home">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-6 pb-28 sm:pb-24 space-y-5">
      <PageMeta title={seoTitle} description={seoDesc} />
      {data && <CanonicalLink href={`${window.location.origin}/series/${data.series.slug}`} />}
      {data && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: data.series.name,
            description: seoDesc,
            organizer: {
              "@type": "Organization",
              name: data.organizationName,
            },
          }}
        />
      )}

      {isLoading ? (
        <PageSkeleton />
      ) : data ? (
        <>
          {/* ─── Header ─── */}
          <header className="space-y-2">
            <Link
              to="/home"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 홈
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  {data.series.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Link
                    to={`/brands/${data.organizationSlug}`}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    {data.organizationName}
                  </Link>
                  {data.series.cadence !== "irregular" && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-[16px] font-medium">
                      {data.series.cadence === "annual" ? "연 1회" : data.series.cadence === "biannual" ? "연 2회" : data.series.cadence}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {data.series.notes && (
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{data.series.notes}</p>
            )}
          </header>

          {/* ─── Next Prediction ─── */}
          {prediction && (
            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">다음 예상 세일</span>
              </div>
              <p className="text-lg font-extrabold text-primary tracking-tight">{prediction.nextExpected}</p>
              <p className="text-[11px] text-muted-foreground">{prediction.patternDescription}</p>
              <p className="text-[10px] text-muted-foreground/60">* 과거 {data.occurrences.filter((o) => o.starts_on).length}회 데이터 기반 예측</p>
            </section>
          )}

          {/* ─── Discount Pattern ─── */}
          {discountPattern && (discountPattern.avgDiscount || discountPattern.maxDiscount) && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">할인 패턴 요약</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {discountPattern.avgDiscount && (
                  <StatCard label="최근 평균 할인" value={`${discountPattern.avgDiscount}%`} icon={TrendingUp} />
                )}
                {discountPattern.maxDiscount && (
                  <StatCard label="최근 최고 할인" value={`${discountPattern.maxDiscount}%`} />
                )}
                {discountPattern.avgStartMonth && (
                  <StatCard label="평균 시작 시기" value={`${discountPattern.avgStartMonth}월`} icon={Calendar} />
                )}
              </div>
            </section>
          )}

          {/* ─── Live / Scheduled ─── */}
          {liveOccurrences.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🟢</span>
                <span className="text-sm font-bold text-foreground">진행 중 / 예정</span>
                <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-[18px]">
                  {liveOccurrences.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {liveOccurrences.map((item) => (
                  <EventRadarCard
                    key={item.occurrence_id}
                    item={item}
                    variant={item.status === "live" ? "live" : "scheduled"}
                    onClick={() => setSelectedEvent(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─── Past Occurrences ─── */}
          {pastOccurrences.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">📋</span>
                <span className="text-sm font-bold text-foreground">최근 기록</span>
                <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-[18px]">
                  {pastOccurrences.length}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {pastOccurrences.map((item) => (
                  <OccurrenceRow key={item.occurrence_id} item={item} onClick={() => setSelectedEvent(item)} />
                ))}
              </div>
            </section>
          )}

          {/* ─── Related Brand ─── */}
          {data.organizationSlug && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">관련 브랜드</span>
              </div>
              <Link
                to={`/brands/${data.organizationSlug}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 hover:bg-accent/50 hover:border-border transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {data.organizationName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">모든 이벤트와 시리즈 확인</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-colors" />
              </Link>
            </section>
          )}

          {data.occurrences.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">아직 등록된 기록이 없습니다.</p>
            </div>
          )}
        </>
      ) : null}

      <ExpandedEventOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
