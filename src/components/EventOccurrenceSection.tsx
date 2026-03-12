import { useMemo } from "react";
import { useEventOccurrences, getOccurrenceStatus, type EventOccurrence, type OccurrenceStatus } from "@/hooks/useEventOccurrences";
import { countdownText } from "@/utils/countdown";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

const sections: { status: OccurrenceStatus; emoji: string; label: string }[] = [
  { status: "ending_today", emoji: "🔴", label: "오늘 마감" },
  { status: "live", emoji: "🟢", label: "진행중" },
  { status: "starting_soon", emoji: "🟡", label: "곧 시작" },
];

function OccurrenceItem({ item }: { item: EventOccurrence }) {
  const countdown = item.ends_on ? countdownText(item.ends_on) : "";
  const status = getOccurrenceStatus(item);
  const isEndingToday = status === "ending_today";
  const discount = item.max_discount_pct ? `최대 ${item.max_discount_pct}%` : null;

  return (
    <a
      href={item.official_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card border border-border/50 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer"
    >
      {/* Logo / Org initial */}
      <div className="w-10 h-10 rounded-lg bg-accent/60 border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
          <span className="text-sm font-bold text-muted-foreground">
            {(item.organization_name ?? "?").charAt(0)}
          </span>
          <span className="text-sm font-bold text-muted-foreground">
            {(item.organization_name ?? "?").charAt(0)}
          </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-card-foreground truncate tracking-tight" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
          {item.occurrence_title || item.event_name || "이벤트"}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground font-medium truncate">
            {item.organization_name}
          </span>
          {discount && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
              {discount}
            </Badge>
          )}
        </div>
      </div>

      {/* Countdown */}
      {isEndingToday ? (
        <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today whitespace-nowrap" style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
          오늘 마감
        </span>
      ) : countdown ? (
        <span className="shrink-0 whitespace-nowrap text-muted-foreground font-normal px-1.5 py-0.5 rounded-md" style={{ fontSize: 10 }}>
          {countdown}
        </span>
      ) : null}
    </a>
  );
}

export default function EventOccurrenceSection() {
  const { data: items = [], isLoading } = useEventOccurrences();

  const grouped = useMemo(() => {
    const result: Record<OccurrenceStatus, EventOccurrence[]> = {
      live: [], ending_today: [], starting_soon: [], ended: [],
    };
    for (const item of items) {
      const st = getOccurrenceStatus(item);
      result[st].push(item);
    }
    return result;
  }, [items]);

  const nonEmpty = sections.filter((s) => grouped[s.status].length > 0);

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
          <CalendarDays className="w-5 h-5 text-primary" />
          이벤트 캘린더 (테스트)
        </h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (nonEmpty.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
          <CalendarDays className="w-5 h-5 text-primary" />
          이벤트 캘린더 (테스트)
        </h2>
        <p className="text-sm text-muted-foreground px-1">표시할 이벤트가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <CalendarDays className="w-5 h-5 text-primary" />
        이벤트 캘린더 (테스트)
      </h2>

      <div className="space-y-4">
        {nonEmpty.map((section) => {
          const list = grouped[section.status].slice(0, 5);
          const total = grouped[section.status].length;
          return (
            <div key={section.status} className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
                  <span>{section.emoji}</span>
                  {section.label}
                  <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
                    {total}
                  </span>
                </h3>
              </div>
              <div className="space-y-1.5">
                {list.map((item, idx) => (
                  <OccurrenceItem key={item.occurrence_id ?? idx} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
