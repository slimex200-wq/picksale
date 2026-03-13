import { useMemo, useState } from "react";
import { useEventOccurrences, type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar } from "lucide-react";
import EventRadarGroup from "./EventRadarGroup";
import ExpandedEventOverlay from "./ExpandedEventOverlay";

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

const GROUP_DEFS = [
  { key: "live" as const, emoji: "🟢", label: "진행 중" },
  { key: "scheduled" as const, emoji: "🟡", label: "예정" },
  { key: "ended" as const, emoji: "⚪", label: "지난 기록" },
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

      {GROUP_DEFS.map((g) => (
        <EventRadarGroup
          key={g.key}
          groupKey={g.key}
          emoji={g.emoji}
          label={g.label}
          items={g.key === "ended" ? endedVisible : grouped[g.key]}
          totalCount={grouped[g.key].length}
          onCardClick={setSelectedEvent}
          showAll={showAllEnded}
          onToggleShowAll={() => setShowAllEnded((v) => !v)}
          hasMore={hasMoreEnded}
          hiddenCount={grouped.ended.length - 3}
        />
      ))}

      <ExpandedEventOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  );
}
