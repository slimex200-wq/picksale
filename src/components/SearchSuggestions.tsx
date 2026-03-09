interface Props {
  onSelect: (keyword: string) => void;
}

const TRENDING_KEYWORDS = [
  "#올영세일",
  "#무신사특가",
  "#오늘의집페어",
  "#쿠팡로켓",
  "#SSG데이",
  "#KREAM드로우",
  "#29CM세일",
];

export default function SearchSuggestions({ onSelect }: Props) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-fade-in">
      <p className="text-[11px] font-semibold text-muted-foreground mb-2.5">🔥 인기 검색어</p>
      <div className="flex flex-wrap gap-2">
        {TRENDING_KEYWORDS.map((kw) => (
          <button
            key={kw}
            onClick={() => onSelect(kw.replace("#", ""))}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}
