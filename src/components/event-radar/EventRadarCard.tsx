import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

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
  live: { label: "진행 중", className: "bg-green-100 text-green-800 border-green-400 font-bold" },
  scheduled: { label: "예정", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ended: { label: "종료", className: "bg-muted text-muted-foreground/60 border-border/50" },
};

export interface EventRadarCardProps {
  item: EventOccurrence;
  variant?: "live" | "scheduled" | "ended" | "default";
  onClick?: () => void;
}

export default function EventRadarCard({ item, variant = "default", onClick }: EventRadarCardProps) {
  const today = todayKST();
  const isEndingToday = item.ends_on === today;
  const badge = statusBadge[item.status ?? ""] ?? statusBadge.ended;
  const discount = item.max_discount_pct ? `최대 ${item.max_discount_pct}%` : null;
  const isLive = variant === "live";
  const isEnded = variant === "ended";
  const isScheduled = variant === "scheduled";

  const dateRange = formatDateRange(item.starts_on, item.ends_on);

  const scheduledHint = isScheduled && item.starts_on
    ? `${formatDate(item.starts_on)} 시작 예정`
    : null;

  const tags = item.category_tags ?? [];
  const visibleTags = tags.slice(0, 2);
  const extraCount = tags.length - 2;

  const cardClasses = isEnded
    ? "bg-muted/20 border-border/25"
    : isLive
      ? "bg-card border-primary/30 hover:shadow-lg ring-1 ring-primary/10 hover:-translate-y-0.5"
      : "bg-card border-border/60 hover:shadow-sm hover:-translate-y-px";

  const cardShadow = isEnded
    ? "none"
    : isLive
      ? "0 3px 14px rgba(0,0,0,0.10)"
      : "0 1px 6px rgba(0,0,0,0.06)";

  const handleClick = () => {
    if (isEnded) return;
    onClick?.();
  };

  return (
    <div
      className={`rounded-xl border transition-all ${cardClasses} ${!isEnded ? "cursor-pointer" : "opacity-50"}`}
      style={{ borderRadius: 12, boxShadow: cardShadow, padding: "10px 12px" }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-[11px] font-semibold truncate ${isEnded ? "text-muted-foreground/30" : isLive ? "text-foreground/70" : "text-muted-foreground"}`}>
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
            className={`text-[10px] px-1.5 py-0 h-[18px] font-semibold border ${badge.className} ${isEnded ? "opacity-40" : ""}`}
          >
            {badge.label}
          </Badge>
        </div>
      </div>

      <h3
        className={`line-clamp-2 tracking-tight mb-0.5 ${isEnded ? "text-muted-foreground/40" : "text-card-foreground"}`}
        style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}
      >
        {item.occurrence_title || item.event_name || "이벤트"}
      </h3>

      {item.summary && !isEnded && (
        <p className="text-[11px] line-clamp-1 mb-1 text-muted-foreground">
          {item.summary}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-1">
        {isScheduled && scheduledHint ? (
          <span className="text-[10px] font-semibold text-yellow-600">
            📅 {scheduledHint}
          </span>
        ) : dateRange ? (
          <span className={`text-[10px] font-medium ${isEnded ? "text-muted-foreground/30" : isLive ? "text-foreground/60" : "text-muted-foreground"}`}>
            {dateRange}
          </span>
        ) : null}
        {discount && !isEnded && (
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-[18px] ${isLive ? "font-bold bg-primary/10 text-primary" : "font-bold"}`}
          >
            {discount}
          </Badge>
        )}
      </div>

      {visibleTags.length > 0 && !isEnded && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {visibleTags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-accent text-accent-foreground">
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

      {item.official_url && !isEnded && (
        <a
          href={item.official_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          공식 링크
        </a>
      )}
    </div>
  );
}
