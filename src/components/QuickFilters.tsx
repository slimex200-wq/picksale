interface Props {
  activeFilter: string | null;
  onFilter: (filter: string | null) => void;
}

const QUICK_FILTERS = [
  { key: "ending_today", label: "오늘 종료", emoji: "🔥" },
  { key: "패션", label: "패션", emoji: "👟" },
  { key: "뷰티", label: "뷰티", emoji: "💄" },
  { key: "리빙", label: "가전/리빙", emoji: "🏠" },
  { key: null, label: "전체 세일", emoji: "🛍" },
];

export default function QuickFilters({ activeFilter, onFilter }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {QUICK_FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        return (
          <button
            key={f.key ?? "all"}
            onClick={() => onFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 border ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <span className="text-[11px]">{f.emoji}</span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
