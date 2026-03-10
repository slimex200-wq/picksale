import { memo, useMemo } from "react";
import { Sale, getSaleStatus, SaleStatus } from "@/data/salesUtils";
import { Radar, TrendingUp, Clock } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface Props {
  sales: Sale[];
  activeFilter: SaleStatus | null;
  onFilterChange: (filter: SaleStatus | null) => void;
}

export default memo(function HeroStats({ sales, activeFilter, onFilterChange }: Props) {
  const bp = useBreakpoint();
  const { liveCount, startingSoonCount, endingTodayCount } = useMemo(() => {
    let live = 0, soon = 0, ending = 0;
    for (const s of sales) {
      const st = getSaleStatus(s);
      if (st === "live") live++;
      else if (st === "starting_soon") soon++;
      else if (st === "ending_today") ending++;
    }
    return { liveCount: live, startingSoonCount: soon, endingTodayCount: ending };
  }, [sales]);

  const stats = [
    { key: "live" as SaleStatus, label: "진행중", count: liveCount, color: "text-green-600", bg: "bg-green-100/80", activeBorder: "border-green-400", icon: TrendingUp, emoji: "🟢" },
    { key: "starting_soon" as SaleStatus, label: "예정", count: startingSoonCount, color: "text-yellow-600", bg: "bg-yellow-100/80", activeBorder: "border-yellow-400", icon: Clock, emoji: "⏰" },
    { key: "ending_today" as SaleStatus, label: "오늘 마감", count: endingTodayCount, color: "text-closing-today", bg: "bg-closing-today-bg", activeBorder: "border-closing-today", icon: null, emoji: "" },
  ];

  const handleClick = (key: SaleStatus) => {
    onFilterChange(activeFilter === key ? null : key);
  };

  return (
    <section className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2.5">
        <Radar className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-foreground tracking-tight text-xl sm:text-2xl font-bold">세일 레이더</h1>
          <p className="text-muted-foreground text-xs sm:text-[13px] font-medium">주요 쇼핑몰 세일을 실시간으로 탐지합니다</p>
        </div>
      </div>

      {bp === "mobile" ? (
        <div className="flex items-center bg-card border border-border rounded-xl px-1 py-1 gap-0.5">
          {stats.map((stat) => {
            const isActive = activeFilter === stat.key;
            return (
              <button
                key={stat.key}
                onClick={() => handleClick(stat.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? `${stat.bg} ${stat.color} shadow-sm`
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {stat.key === "ending_today" ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
                ) : (
                  <span className="text-xs">{stat.emoji}</span>
                )}
                <span className="whitespace-nowrap text-[11px]">{stat.label}</span>
                <span className={`font-extrabold tabular-nums text-[13px] font-display ${isActive ? stat.color : "text-foreground"}`}>
                  {stat.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => {
            const isActive = activeFilter === stat.key;
            return (
              <button
                key={stat.key}
                onClick={() => handleClick(stat.key)}
                className={`bg-card border rounded-xl px-3 py-3 flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? `${stat.activeBorder} border-2 shadow-sm`
                    : "border-border hover:border-border/80 hover:shadow-sm"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  {stat.key === "ending_today" ? (
                    <span className="w-2 h-2 rounded-full bg-closing-today animate-closing-pulse" />
                  ) : (
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  )}
                </div>
                <span className="text-xl font-extrabold text-card-foreground tabular-nums font-display">{stat.count}</span>
                <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">{stat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
});
