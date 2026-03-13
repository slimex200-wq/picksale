import { useMemo } from "react";
import type { Sale } from "@/data/salesUtils";
import { getSaleStatus } from "@/data/salesUtils";
import { QUICK_FILTER_DEFS, matchesQuickFilter } from "@/data/quickFilterDefs";
import { FilterChip } from "@/components/QuickFilters";

/** Category-only filters (exclude null/"all" and "ending_today" which is a status filter) */
const CATEGORY_DEFS = QUICK_FILTER_DEFS.filter(
  (f) => f.key !== null && f.key !== "ending_today"
);

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
  sales?: Sale[];
}

export default function RadarCategoryFilter({ selected, onChange, sales = [] }: Props) {
  const isAllActive = selected.length === 0;

  const counts = useMemo(() => {
    const active = sales.filter((s) => getSaleStatus(s) !== "ended");
    const map: Record<string, number> = { all: active.length };
    for (const cat of CATEGORY_DEFS) {
      map[cat.key!] = active.filter((s) => matchesQuickFilter(s, cat.key!)).length;
    }
    return map;
  }, [sales]);

  const handleClick = (key: string | null) => {
    if (key === null) {
      onChange([]);
      return;
    }
    if (selected.includes(key)) {
      const next = selected.filter((k) => k !== key);
      onChange(next);
    } else {
      onChange([...selected, key]);
    }
  };

  const allDef = QUICK_FILTER_DEFS.find((f) => f.key === null)!;

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">
        카테고리
      </span>
      <div className="flex gap-2 flex-wrap">
        <FilterChip
          def={allDef}
          isActive={isAllActive}
          count={counts.all}
          onClick={() => handleClick(null)}
        />
        {CATEGORY_DEFS.map((cat) => {
          const isActive = selected.includes(cat.key!);
          const count = counts[cat.key!] ?? 0;
          return (
            <FilterChip
              key={cat.key}
              def={cat}
              isActive={isActive}
              count={count}
              onClick={() => handleClick(cat.key)}
            />
          );
        })}
      </div>
    </div>
  );
}
