import { FilterChip } from "@/components/QuickFilters";

export type StatusFilter = "all" | "live" | "ending_today" | "starting_soon";

const STATUS_DEFS: { key: StatusFilter; label: string; emoji: string; dot?: boolean }[] = [
  { key: "all", label: "전체", emoji: "🛍" },
  { key: "live", label: "진행중", emoji: "", dot: true },
  { key: "ending_today", label: "오늘 마감", emoji: "", dot: true },
  { key: "starting_soon", label: "곧 시작", emoji: "", dot: true },
];

interface Props {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}

export default function RadarStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {STATUS_DEFS.map((opt) => (
        <FilterChip
          key={opt.key}
          def={opt}
          isActive={value === opt.key}
          onClick={() => onChange(opt.key)}
        />
      ))}
    </div>
  );
}
