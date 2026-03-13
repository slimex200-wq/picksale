import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "live" | "ending_today" | "starting_soon";

const STATUS_OPTIONS: { key: StatusFilter; label: string; dotColor?: string }[] = [
  { key: "all", label: "전체" },
  { key: "live", label: "진행중", dotColor: "bg-green-500" },
  { key: "ending_today", label: "오늘 마감", dotColor: "bg-red-500" },
  { key: "starting_soon", label: "곧 시작", dotColor: "bg-amber-500" },
];

interface Props {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}

export default function RadarStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            "px-3.5 py-1.5 rounded-[20px] text-[13px] font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 border",
            value === opt.key
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
          )}
        >
          {opt.dotColor && (
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", opt.dotColor)} />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
