import { Platform, platformEmojis } from "@/data/mockSales";

const platforms: Platform[] = [
  "쿠팡", "올리브영", "무신사", "KREAM", "SSG", "오늘의집", "29CM",
];

interface Props {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export default function PlatformFilter({ selected, onChange }: Props) {
  const toggle = (p: Platform) => {
    if (selected.includes(p)) {
      onChange(selected.filter((s) => s !== p));
    } else {
      onChange([...selected, p]);
    }
  };

  const allSelected = selected.length === 0;

  return (
    <div className="flex flex-wrap gap-2 py-2 px-1">
      <button
        onClick={() => onChange([])}
        className={`shrink-0 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
          allSelected
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        전체
      </button>
      {platforms.map((p) => {
        const active = selected.includes(p);
        return (
          <button
            key={p}
            onClick={() => toggle(p)}
            className={`shrink-0 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <span>{platformEmojis[p]}</span>
            {p}
          </button>
        );
      })}
    </div>
  );
}
