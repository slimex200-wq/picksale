import { useMemo } from "react";
import { Globe, Newspaper, MessageSquare, X, Filter } from "lucide-react";
import { getSourceClass, type SourceClass } from "@/data/adminStateModel";

interface SourceDistributionProps {
  sales: { source_type?: string | null }[];
  activeSource: string;
  onSourceChange: (source: string) => void;
  contextLabel?: string;
  /** How many items are currently shown after filtering */
  filteredCount?: number;
}

const sourceCards: {
  key: SourceClass;
  label: string;
  icon: typeof Globe;
  activeRing: string;
  activeBg: string;
  iconColor: string;
}[] = [
  { key: "official", label: "공식", icon: Globe, activeRing: "ring-blue-500", activeBg: "bg-blue-600 dark:bg-blue-500", iconColor: "text-blue-600" },
  { key: "news", label: "뉴스", icon: Newspaper, activeRing: "ring-amber-500", activeBg: "bg-amber-600 dark:bg-amber-500", iconColor: "text-amber-600" },
  { key: "community", label: "커뮤니티", icon: MessageSquare, activeRing: "ring-purple-500", activeBg: "bg-purple-600 dark:bg-purple-500", iconColor: "text-purple-600" },
];

export default function SourceDistribution({ sales, activeSource, onSourceChange, contextLabel, filteredCount }: SourceDistributionProps) {
  const counts = useMemo(() => {
    const c: Record<SourceClass, number> = { official: 0, news: 0, community: 0, unknown: 0 };
    for (const s of sales) c[getSourceClass(s)]++;
    return c;
  }, [sales]);

  const activeLabel = sourceCards.find(c => c.key === activeSource)?.label;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Filter className="w-3 h-3 text-muted-foreground" />
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">소스별 필터</h4>
        {contextLabel && (
          <span className="text-[10px] text-muted-foreground">· {contextLabel}</span>
        )}
      </div>

      {/* Filter cards */}
      <div className="grid grid-cols-3 gap-2">
        {sourceCards.map(({ key, label, icon: Icon, activeRing, activeBg, iconColor }) => {
          const isActive = activeSource === key;
          const count = counts[key];
          return (
            <button
              key={key}
              onClick={() => onSourceChange(isActive ? "" : key)}
              className={`relative rounded-lg p-2.5 flex items-center gap-2 transition-all border ${
                isActive
                  ? `${activeBg} border-transparent ring-2 ${activeRing} shadow-md`
                  : "bg-card border-border hover:bg-accent/50 hover:shadow-sm"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : iconColor}`} />
              <div className="text-left">
                <p className={`text-base font-bold ${isActive ? "text-white" : "text-card-foreground"}`}>{count}</p>
                <p className={`text-[10px] ${isActive ? "text-white/80" : "text-muted-foreground"}`}>{label}</p>
              </div>
              {isActive && (
                <X className="absolute top-1.5 right-1.5 w-3 h-3 text-white/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active filter banner */}
      {activeSource && activeLabel && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs font-semibold text-primary">
            현재 필터: {activeLabel}
          </span>
          {filteredCount !== undefined && (
            <span className="text-xs text-primary/70">
              ({filteredCount}건)
            </span>
          )}
          <button
            onClick={() => onSourceChange("")}
            className="ml-auto text-[11px] text-primary font-medium hover:underline flex items-center gap-0.5"
          >
            <X className="w-3 h-3" />
            해제
          </button>
        </div>
      )}
    </div>
  );
}
