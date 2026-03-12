import { useMemo, useState } from "react";
import { useEventOccurrences, type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, ExternalLink, ChevronDown } from "lucide-react";

const todayKST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

const formatDate = (d: string) => {
  const [, m, day] = d.split("-");
  return `${parseInt(m)}월 ${parseInt(day)}일`;
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return "";
  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
  if (start) return formatDate(start);
  return formatDate(end!);
};

const statusBadge: Record<string, { label: string; className: string }> = {
  live: { label: "진행 중", className: "bg-green-100 text-green-700 border-green-300" },
  scheduled: { label: "예정", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ended: { label: "종료", className: "bg-muted text-muted-foreground/60 border-border/50" },
};

const groups: { key: string; emoji: string; label: string }[] = [
  { key: "live", emoji: "🟢", label: "진행 중" },
  { key: "scheduled", emoji: "🟡", label: "예정" },
  { key: "ended", emoji: "⚪", label: "지난 기록" },
];

function sortWithinGroup(items: EventOccurrence[]): EventOccurrence[] {
  return [...items].sort((a, b) => {
    const ea = a.ends_on ?? "9999-12-31";
    const eb = b.ends_on ?? "9999-12-31";
    if (ea !== eb) return ea < eb ? -1 : 1;
    const sa = a.starts_on ?? "9999-12-31";
    const sb = b.starts_on ?? "9999-12-31";
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
}

function daysUntil(dateStr: string): number {
  const today = new Date(todayKST());
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/* ─── Card ─── */
function RadarCard({ item, variant = "default" }: { item: EventOccurrence; variant?: "live" | "scheduled" | "ended" | "default" }) {
  const today = todayKST();
  const isEndingToday = item.ends_on === today;
  const badge = statusBadge[item.status ?? ""] ?? statusBadge.ended;
  const discount = item.max_discount_pct ? `${item.max_discount_pct}% OFF` : null;
  const isLive = variant === "live";
  const isEnded = variant === "ended";
  const isScheduled = variant === "scheduled";

  const dateRange = formatDateRange(item.starts_on, item.ends_on);

  // Scheduled helper text
  const scheduledHint = isScheduled && item.starts_on
    ? `${formatDate(item.starts_on)} 시작 예정`
    : null;

  const tags = item.category_tags ?? [];
  const visibleTags = tags.slice(0, 2);
  const extraCount = tags.length - 2;

  const cardClasses = isEnded
    ? "bg-muted/30 border-border/30 opacity-60"
    : isLive
      ? "bg-card border-primary/20 hover:shadow-md ring-1 ring-primary/5"
      : "bg-card border-border/60 hover:shadow-sm";

  const cardShadow = isEnded
    ? "none"
    : isLive
      ? "0 2px 10px rgba(0,0,0,0.08)"
      : "0 1px 6px rgba(0,0,0,0.06)";

  return (
    <div
      className={`rounded-xl border transition-all ${cardClasses}`}
      style={{ borderRadius: 12, boxShadow: cardShadow, padding: "10px 12px" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-[11px] font-semibold truncate ${isEnded ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
          {item.organization_name ?? "알 수 없음"}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isEndingToday && !isEnded && (
            <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
              오늘 마감
            </span>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-[18px] font-semibold border ${badge.className} ${isEnded ? "opacity-50" : ""}`}
          >
            {badge.label}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`line-clamp-2 tracking-tight mb-0.5 ${isEnded ? "text-muted-foreground/50" : "text-card-foreground"}`}
        style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}
      >
        {item.occurrence_title || item.event_name || "이벤트"}
      </h3>

      {/* Summary */}
      {item.summary && !isEnded && (
        <p className="text-[11px] line-clamp-1 mb-1 text-muted-foreground">
          {item.summary}
        </p>
      )}

      {/* Date + Discount */}
      <div className="flex items-center gap-2 flex-wrap mb-1">
        {isScheduled && scheduledHint ? (
          <span className="text-[10px] font-medium text-yellow-600">
            📅 {scheduledHint}
          </span>
        ) : dateRange ? (
          <span className={`text-[10px] font-medium ${isEnded ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
            {dateRange}
          </span>
        ) : null}
        {discount && !isEnded && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-[18px] font-bold"
          >
            {discount}
          </Badge>
        )}
      </div>

      {/* Category chips - hide for ended */}
      {visibleTags.length > 0 && !isEnded && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-accent text-accent-foreground"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground/60 px-1 py-0.5">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {/* CTA - hide for ended */}
      {item.official_url && !isEnded && (
        <a
          href={item.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          공식 링크
        </a>
      )}
    </div>
  );
}

/* ─── Section ─── */
export default function NewRadarTestSection() {
  const { data: items = [], isLoading } = useEventOccurrences();
  const [showAllEnded, setShowAllEnded] = useState(false);

  const grouped = useMemo(() => {
    const buckets: Record<string, EventOccurrence[]> = { live: [], scheduled: [], ended: [] };
    for (const item of items) {
      const key = item.status === "live" ? "live" : item.status === "scheduled" ? "scheduled" : "ended";
      buckets[key].push(item);
    }
    buckets.live = sortWithinGroup(buckets.live);
    buckets.scheduled = sortWithinGroup(buckets.scheduled);
    buckets.ended = sortWithinGroup(buckets.ended);
    return buckets;
  }, [items]);

  const totalCount = items.length;

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
          <Radar className="w-5 h-5 text-primary" />
          세일 이벤트
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (totalCount === 0) return null;

  const endedVisible = showAllEnded ? grouped.ended : grouped.ended.slice(0, 3);
  const hasMoreEnded = grouped.ended.length > 3;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <Radar className="w-5 h-5 text-primary" />
        세일 이벤트
        <span className="text-muted-foreground bg-accent rounded-full px-2 py-0.5 text-[11px] font-semibold">
          {totalCount}
        </span>
      </h2>

      {groups.map((g) => {
        const list = g.key === "ended" ? endedVisible : grouped[g.key];
        const total = grouped[g.key].length;
        if (total === 0) return null;
        const isEnded = g.key === "ended";

        return (
          <div key={g.key} className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
                <span>{g.emoji}</span>
                {g.label}
                <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
                  {total}
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {list.map((item, idx) => (
                <RadarCard key={item.occurrence_id ?? idx} item={item} variant={g.key as "live" | "scheduled" | "ended"} />
              ))}
            </div>
            {isEnded && hasMoreEnded && !showAllEnded && (
              <button
                onClick={() => setShowAllEnded(true)}
                className="flex items-center gap-1 mx-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg hover:bg-accent"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                지난 기록 더 보기 ({grouped.ended.length - 3}개)
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
