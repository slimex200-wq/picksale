import { useMemo } from "react";
import { Globe, Newspaper, MessageSquare } from "lucide-react";
import { getSourceClass, type SourceClass } from "@/data/adminStateModel";

interface SourceDistributionProps {
  sales: { source_type?: string | null }[];
  activeSource: string;
  onSourceChange: (source: string) => void;
  contextLabel?: string;
}

const sourceCards: { key: SourceClass; label: string; icon: typeof Globe; colorClass: string; activeClass: string }[] = [
  { key: "official", label: "공식", icon: Globe, colorClass: "text-blue-600", activeClass: "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-950" },
  { key: "news", label: "뉴스", icon: Newspaper, colorClass: "text-amber-600", activeClass: "ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950" },
  { key: "community", label: "커뮤니티", icon: MessageSquare, colorClass: "text-purple-600", activeClass: "ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-950" },
];

export default function SourceDistribution({ sales, activeSource, onSourceChange, contextLabel }: SourceDistributionProps) {
  const counts = useMemo(() => {
    const c: Record<SourceClass, number> = { official: 0, news: 0, community: 0, unknown: 0 };
    for (const s of sales) c[getSourceClass(s)]++;
    return c;
  }, [sales]);

  const handleClick = (key: string) => {
    onSourceChange(activeSource === key ? "" : key);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">소스별 분포</h4>
        {contextLabel && (
          <span className="text-[10px] text-muted-foreground">({contextLabel} 기준)</span>
        )}
        {activeSource && (
          <button
            onClick={() => onSourceChange("")}
            className="text-[10px] text-primary hover:underline"
          >
            필터 해제
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {sourceCards.map(({ key, label, icon: Icon, colorClass, activeClass }) => {
          const isActive = activeSource === key;
          return (
            <button
              key={key}
              onClick={() => handleClick(key)}
              className={`bg-card border border-border rounded-lg p-2.5 flex items-center gap-2 transition-all cursor-pointer hover:shadow-sm ${
                isActive ? activeClass : "hover:bg-accent/50"
              }`}
            >
              <Icon className={`w-5 h-5 ${colorClass}`} />
              <div className="text-left">
                <p className="text-base font-bold text-card-foreground">{counts[key]}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
