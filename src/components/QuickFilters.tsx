import { useRef, useEffect, useMemo } from "react";
import type { Sale } from "@/data/salesUtils";
import { getSaleStatus } from "@/data/salesUtils";
import { QUICK_FILTER_DEFS, matchesQuickFilter } from "@/data/quickFilterDefs";

interface Props {
  activeFilter: string | null;
  onFilter: (filter: string | null) => void;
  sales?: Sale[];
}

export default function QuickFilters({ activeFilter, onFilter, sales = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    const active = sales.filter((s) => getSaleStatus(s) !== "ended");
    for (const f of QUICK_FILTER_DEFS) {
      if (f.key === null) {
        map["all"] = active.length;
      } else {
        map[f.key] = active.filter((s) => matchesQuickFilter(s, f.key!)).length;
      }
    }
    return map;
  }, [sales]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeFilter]);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {QUICK_FILTER_DEFS.map((f) => {
        const isActive = activeFilter === f.key;
        const count = counts[f.key ?? "all"] ?? 0;
        return (
          <button
            key={f.key ?? "all"}
            data-active={isActive}
            onClick={() => onFilter(f.key)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                : "bg-card text-foreground/70 border-border font-medium hover:bg-accent hover:border-border/80"
            }`}
          >
            {f.dot ? (
              <span className={`w-1.5 h-1.5 rounded-full animate-closing-pulse ${isActive ? "bg-primary-foreground" : "bg-closing-today"}`} />
            ) : (
              <span className="text-sm">{f.emoji}</span>
            )}
            {f.label}
            {count > 0 && (
              <span className={`text-[11px] tabular-nums ${
                isActive ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
