import { useRef, useEffect, useMemo, useState } from "react";
import type { Sale } from "@/data/salesUtils";
import { getSaleStatus } from "@/data/salesUtils";
import { QUICK_FILTER_DEFS, matchesQuickFilter } from "@/data/quickFilterDefs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** First 5 filters are always visible; rest go behind "더보기" on mobile */
const PRIMARY_COUNT = 5;

interface Props {
  activeFilter: string | null;
  onFilter: (filter: string | null) => void;
  sales?: Sale[];
}

export default function QuickFilters({ activeFilter, onFilter, sales = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const primaryFilters = QUICK_FILTER_DEFS.slice(0, PRIMARY_COUNT);
  const secondaryFilters = QUICK_FILTER_DEFS.slice(PRIMARY_COUNT);

  // Check if active filter is in the secondary group
  const activeInSecondary = secondaryFilters.some((f) => f.key === activeFilter);
  const activeSecondaryDef = activeInSecondary
    ? secondaryFilters.find((f) => f.key === activeFilter)
    : null;

  const visibleFilters = isMobile ? primaryFilters : QUICK_FILTER_DEFS;

  const handleSecondarySelect = (key: string | null) => {
    onFilter(key);
    setSheetOpen(false);
  };

  return (
    <div className="relative -mx-3 sm:-mx-4">
      {/* Right fade hint */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent" />
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-nowrap px-3 sm:px-4"
        style={{ minWidth: 0 }}
      >
        <div className="flex gap-2 flex-nowrap" style={{ minWidth: "max-content" }}>
      {visibleFilters.map((f) => {
        const isActive = activeFilter === f.key;
        const count = counts[f.key ?? "all"] ?? 0;
        return (
          <FilterChip
            key={f.key ?? "all"}
            def={f}
            isActive={isActive}
            count={count}
            onClick={() => onFilter(f.key)}
          />
        );
      })}

      {/* Mobile: show active secondary chip OR "더보기" button */}
      {isMobile && secondaryFilters.length > 0 && (
        <>
          {activeSecondaryDef && (
            <FilterChip
              key={activeSecondaryDef.key!}
              def={activeSecondaryDef}
              isActive={true}
              count={counts[activeSecondaryDef.key!] ?? 0}
              onClick={() => onFilter(activeSecondaryDef.key)}
            />
          )}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border font-medium ${
                  activeInSecondary
                    ? "bg-accent text-foreground border-primary/30"
                    : "bg-card text-foreground/70 border-border hover:bg-accent hover:border-border/80"
                }`}
              >
                <span className="text-sm">＋</span>
                더보기
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-8">
              <SheetHeader className="pb-2">
                <SheetTitle className="text-base font-bold">카테고리 선택</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {secondaryFilters.map((f) => {
                  const isActive = activeFilter === f.key;
                  const count = counts[f.key!] ?? 0;
                  return (
                    <button
                      key={f.key}
                      onClick={() => handleSecondarySelect(f.key)}
                      className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-[13px] transition-all border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary font-bold"
                          : "bg-card text-foreground/80 border-border font-medium hover:bg-accent"
                      }`}
                    >
                      <span className="text-base">{f.emoji}</span>
                      <span className="flex-1 text-left">{f.label}</span>
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
            </SheetContent>
          </Sheet>
        </>
      )}
        {/* Spacer so last chip isn't hidden behind fade */}
        <div className="shrink-0 w-6" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/* ── Shared chip component (exported for reuse) ── */
export function FilterChip({
  def,
  isActive,
  count,
  onClick,
}: {
  def: { label: string; emoji: string; dot?: boolean; dotColor?: string };
  isActive: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      data-active={isActive}
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
          : "bg-card text-foreground/70 border-border font-medium hover:bg-accent hover:border-border/80"
      }`}
    >
      {def.dot ? (
        <span
          className={`w-1.5 h-1.5 rounded-full animate-closing-pulse ${isActive ? "bg-primary-foreground" : (!def.dotColor ? "bg-closing-today" : "")}`}
          style={!isActive && def.dotColor ? { backgroundColor: def.dotColor } : undefined}
        />
      ) : (
        <span className="text-sm">{def.emoji}</span>
      )}
      {def.label}
      {count !== undefined && count > 0 && (
        <span className={`text-[11px] tabular-nums ${
          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
