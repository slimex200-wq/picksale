import { useRef, useEffect } from "react";

interface Props {
  activeFilter: string | null;
  onFilter: (filter: string | null) => void;
}

const QUICK_FILTERS = [
  { key: null as string | null, label: "전체 세일", emoji: "🛍" },
  { key: "ending_today", label: "오늘 마감", emoji: "", dot: true },
  { key: "패션", label: "패션", emoji: "👟" },
  { key: "뷰티", label: "뷰티", emoji: "💄" },
  { key: "리빙", label: "가전/리빙", emoji: "🏠" },
];

export default function QuickFilters({ activeFilter, onFilter }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeFilter]);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {QUICK_FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        return (
          <button
            key={f.key ?? "all"}
            data-active={isActive}
            onClick={() => {
              onFilter(f.key);
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
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
          </button>
        );
      })}
    </div>
  );
}
