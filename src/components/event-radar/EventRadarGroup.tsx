import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import { ChevronDown, ChevronUp } from "lucide-react";
import EventRadarCard from "./EventRadarCard";

interface EventRadarGroupProps {
  groupKey: "live" | "scheduled" | "ended";
  emoji: string;
  label: string;
  items: EventOccurrence[];
  totalCount: number;
  onCardClick: (item: EventOccurrence) => void;
  /** Only for ended group */
  showAll?: boolean;
  onToggleShowAll?: () => void;
  hasMore?: boolean;
  hiddenCount?: number;
}

export default function EventRadarGroup({
  groupKey,
  emoji,
  label,
  items,
  totalCount,
  onCardClick,
  showAll,
  onToggleShowAll,
  hasMore,
  hiddenCount,
}: EventRadarGroupProps) {
  if (totalCount === 0) return null;

  const isEnded = groupKey === "ended";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
          <span>{emoji}</span>
          {label}
          <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
            {totalCount}
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {items.map((item, idx) => (
          <EventRadarCard
            key={item.occurrence_id ?? idx}
            item={item}
            variant={groupKey}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>
      {isEnded && hasMore && onToggleShowAll && (
        <button
          onClick={onToggleShowAll}
          className="flex items-center gap-1 mx-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg hover:bg-accent"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              접기
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              지난 기록 더 보기 ({hiddenCount}개)
            </>
          )}
        </button>
      )}
    </div>
  );
}
