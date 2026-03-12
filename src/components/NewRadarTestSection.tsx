import { useMemo, useState } from "react";
import { useEventOccurrences, type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, ExternalLink, ChevronDown } from "lucide-react";

const todayKST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

const formatDate = (d: string) => d.replace(/-/g, ".");

const statusBadge: Record<string, { label: string; className: string }> = {
  live: { label: "진행 중", className: "bg-green-100 text-green-700 border-green-300" },
  scheduled: { label: "예정", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ended: { label: "종료", className: "bg-muted text-muted-foreground border-border" },
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

/* ─── Card ─── */
function RadarCard({ item, dimmed = false }: { item: EventOccurrence; dimmed?: boolean }) {
  const today = todayKST();
  const isEndingToday = item.ends_on === today;
  const badge = statusBadge[item.status ?? ""] ?? statusBadge.ended;
  const discount = item.max_discount_pct ? `${item.max_discount_pct}% OFF` : null;

  const dateRange = [item.starts_on, item.ends_on]
    .filter(Boolean)
    .map((d) => formatDate(d!))
    .join(" - ");

  const tags = item.category_tags ?? [];
  const visibleTags = tags.slice(0, 2);
  const extraCount = tags.length - 2;

  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 transition-all ${
        dimmed
          ? "bg-muted/40 border-border/40 opacity-70"
          : "bg-card border-border/60 hover:shadow-sm"
      }`}
      style={{ borderRadius: 12, boxShadow: dimmed ? "none" : "0 1px 6px rgba(0,0,0,0.06)" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[11px] font-semibold truncate ${dimmed ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
          {item.organization_name ?? "알 수 없음"}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isEndingToday && !dimmed && (
            <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
              오늘 마감
            </span>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-[18px] font-semibold border ${badge.className} ${dimmed ? "opacity-60" : ""}`}
          >
            {badge.label}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`line-clamp-2 tracking-tight mb-1 ${dimmed ? "text-muted-foreground" : "text-card-foreground"}`}
        style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}
      >
        {item.occurrence_title || item.event_name || "이벤트"}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p className={`text-xs line-clamp-1 mb-2 ${dimmed ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          {item.summary}
        </p>
      )}

      {/* Date + Discount */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {dateRange && (
          <span className={`text-[10px] font-medium ${dimmed ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
            {dateRange}
          </span>
        )}
        {discount && (
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-[18px] font-bold ${dimmed ? "opacity-50" : ""}`}
          >
            {discount}
          </Badge>
        )}
      </div>

      {/* Category chips */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${dimmed ? "bg-muted text-muted-foreground/50" : "bg-accent text-accent-foreground"}`}
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

      {/* CTA */}
      {item.official_url && !dimmed && (
        <a
          href={item.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
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
          New Radar Test
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (totalCount === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
          <Radar className="w-5 h-5 text-primary" />
          New Radar Test
        </h2>
        <p className="text-sm text-muted-foreground px-1">표시할 이벤트가 없습니다.</p>
      </section>
    );
  }

  const endedVisible = showAllEnded ? grouped.ended : grouped.ended.slice(0, 3);
  const hasMoreEnded = grouped.ended.length > 3;

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <Radar className="w-5 h-5 text-primary" />
        New Radar Test
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
          <div key={g.key} className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
                <span>{g.emoji}</span>
                {g.label}
                <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
                  {total}
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {list.map((item, idx) => (
                <RadarCard key={item.occurrence_id ?? idx} item={item} dimmed={isEnded} />
              ))}
            </div>
            {isEnded && hasMoreEnded && !showAllEnded && (
              <button
                onClick={() => setShowAllEnded(true)}
                className="flex items-center gap-1 mx-auto text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg hover:bg-accent"
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
