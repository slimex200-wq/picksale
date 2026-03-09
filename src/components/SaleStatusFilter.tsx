import { SaleStatus } from "@/data/salesUtils";

export type StatusFilter = "all" | "live" | "ending_today" | "starting_soon";

const filters: { key: StatusFilter; label: string; emoji: string }[] = [
  { key: "all", label: "전체", emoji: "📋" },
  { key: "live", label: "진행중", emoji: "🟢" },
  { key: "ending_today", label: "오늘 종료", emoji: "🔴" },
  { key: "starting_soon", label: "곧 시작", emoji: "🟡" },
];

interface Props {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}

export default function SaleStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-1">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
            value === f.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <span className="text-[10px]">{f.emoji}</span>
          {f.label}
        </button>
      ))}
    </div>
  );
}
