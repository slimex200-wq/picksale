interface Props {
  activeFilter: string | null;
  onFilter: (filter: string | null) => void;
}

const QUICK_FILTERS = [
  { key: "ending_today", label: "오늘 마감", emoji: "" },
  { key: "패션", label: "패션", emoji: "👟" },
  { key: "뷰티", label: "뷰티", emoji: "💄" },
  { key: "리빙", label: "가전/리빙", emoji: "🏠" },
  { key: null, label: "전체 세일", emoji: "🛍" },
];

export default function QuickFilters({ activeFilter, onFilter }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {QUICK_FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        return (
          <button
            key={f.key ?? "all"}
            onClick={() => onFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                : "bg-card text-foreground/70 border-border font-medium hover:bg-accent hover:border-border/80"
            }`}
          >
            {f.key === "ending_today" ? (
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary-foreground" : "bg-closing-today"} animate-closing-pulse`} />
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
