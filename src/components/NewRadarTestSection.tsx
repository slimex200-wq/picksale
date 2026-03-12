import { useMemo } from "react";
import { useEventOccurrences, type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, ExternalLink } from "lucide-react";

/** Get KST today string */
const todayKST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

/** Status badge config keyed by DB status value */
const statusBadge: Record<string, { label: string; className: string }> = {
  live: {
    label: "진행 중",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  scheduled: {
    label: "예정",
    className: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  ended: {
    label: "종료",
    className: "bg-muted text-muted-foreground border-border",
  },
};

function sortItems(items: EventOccurrence[]): EventOccurrence[] {
  const priority: Record<string, number> = { live: 0, scheduled: 1, ended: 2 };
  return [...items].sort((a, b) => {
    const pa = priority[a.status ?? "ended"] ?? 9;
    const pb = priority[b.status ?? "ended"] ?? 9;
    if (pa !== pb) return pa - pb;
    // ends_on ascending
    const ea = a.ends_on ?? "9999-12-31";
    const eb = b.ends_on ?? "9999-12-31";
    if (ea !== eb) return ea < eb ? -1 : 1;
    // starts_on ascending
    const sa = a.starts_on ?? "9999-12-31";
    const sb = b.starts_on ?? "9999-12-31";
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
}

/* ─── Card ─── */
function RadarCard({ item }: { item: EventOccurrence }) {
  const today = todayKST();
  const isEndingToday = item.ends_on === today;
  const badge = statusBadge[item.status ?? ""] ?? statusBadge.ended;
  const discount = item.max_discount_pct
    ? `${item.max_discount_pct}% OFF`
    : null;

  const dateRange = [item.starts_on, item.ends_on].filter(Boolean).join(" ~ ");

  return (
    <div
      className="rounded-xl bg-card border border-border/60 p-3.5 sm:p-4 transition-all hover:shadow-sm"
      style={{
        borderRadius: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      {/* Top row: org + status */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground truncate">
          {item.organization_name ?? "알 수 없음"}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isEndingToday && (
            <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
              오늘 마감
            </span>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-[18px] font-semibold border ${badge.className}`}
          >
            {badge.label}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-card-foreground line-clamp-2 tracking-tight mb-1"
        style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}
      >
        {item.occurrence_title || item.event_name || "이벤트"}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p className="text-muted-foreground text-xs line-clamp-1 mb-2">
          {item.summary}
        </p>
      )}

      {/* Date + Discount */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {dateRange && (
          <span className="text-[10px] text-muted-foreground font-medium">
            {dateRange}
          </span>
        )}
        {discount && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-[18px] font-bold"
          >
            {discount}
          </Badge>
        )}
      </div>

      {/* Category chips */}
      {item.category_tags && item.category_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {item.category_tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium bg-accent text-accent-foreground rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      {item.official_url && (
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

  const sorted = useMemo(() => sortItems(items), [items]);

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

  if (sorted.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
          <Radar className="w-5 h-5 text-primary" />
          New Radar Test
        </h2>
        <p className="text-sm text-muted-foreground px-1">
          표시할 이벤트가 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <Radar className="w-5 h-5 text-primary" />
        New Radar Test
        <span className="text-muted-foreground bg-accent rounded-full px-2 py-0.5 text-[11px] font-semibold">
          {sorted.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {sorted.map((item, idx) => (
          <RadarCard key={item.occurrence_id ?? idx} item={item} />
        ))}
      </div>
    </section>
  );
}
