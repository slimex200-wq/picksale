import { useMemo, useState } from "react";
import { useEventOccurrences, type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, ChevronDown, ChevronUp } from "lucide-react";
import EventRadarCard from "@/components/EventRadarCard";
import ExpandedEventOverlay from "@/components/ExpandedEventOverlay";

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

const groups: { key: string; emoji: string; label: string }[] = [
  { key: "live", emoji: "🟢", label: "진행 중" },
  { key: "scheduled", emoji: "🟡", label: "예정" },
  { key: "ended", emoji: "⚪", label: "지난 기록" },
];

export default function EventRadarSection() {
  const { data: items = [], isLoading } = useEventOccurrences();
  const [showAllEnded, setShowAllEnded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventOccurrence | null>(null);

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
          이벤트 레이더
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
        이벤트 레이더
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
                <EventRadarCard
                  key={item.occurrence_id ?? idx}
                  item={item}
                  variant={g.key as "live" | "scheduled" | "ended"}
                  onClick={() => setSelectedEvent(item)}
                />
              ))}
            </div>
            {isEnded && hasMoreEnded && (
              <button
                onClick={() => setShowAllEnded((v) => !v)}
                className="flex items-center gap-1 mx-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg hover:bg-accent"
              >
                {showAllEnded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    지난 기록 더 보기 ({grouped.ended.length - 3}개)
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}

      <ExpandedEventOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  );
}
