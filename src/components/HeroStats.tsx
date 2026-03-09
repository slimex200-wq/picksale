import { Sale, getSaleStatus, SaleStatus } from "@/data/salesUtils";
import { Radar, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  sales: Sale[];
  activeFilter: SaleStatus | null;
  onFilterChange: (filter: SaleStatus | null) => void;
}

export default function HeroStats({ sales, activeFilter, onFilterChange }: Props) {
  const isMobile = useIsMobile();
  const liveSales = sales.filter((s) => getSaleStatus(s) === "live");
  const startingSoon = sales.filter((s) => getSaleStatus(s) === "starting_soon");
  const endingToday = sales.filter((s) => getSaleStatus(s) === "ending_today");

  const stats = [
    { key: "live" as SaleStatus, label: "진행중", count: liveSales.length, color: "text-green-600", bg: "bg-green-100/80", activeBorder: "border-green-400", icon: TrendingUp },
    { key: "starting_soon" as SaleStatus, label: "예정", count: startingSoon.length, color: "text-yellow-600", bg: "bg-yellow-100/80", activeBorder: "border-yellow-400", icon: Clock },
    { key: "ending_today" as SaleStatus, label: "오늘 종료", count: endingToday.length, color: "text-red-600", bg: "bg-red-100/80", activeBorder: "border-red-400", icon: AlertTriangle },
  ];

  const handleClick = (key: SaleStatus) => {
    onFilterChange(activeFilter === key ? null : key);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <Radar className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-lg font-extrabold text-foreground tracking-tight">세일 레이더</h1>
          <p className="text-xs text-muted-foreground">주요 쇼핑몰 세일을 실시간으로 탐지합니다</p>
        </div>
      </div>

      {isMobile ? (
        /* Mobile: compact inline bar */
        <div className="flex items-center bg-card border border-border rounded-xl px-1 py-1 gap-0.5">
          {stats.map((stat) => {
            const isActive = activeFilter === stat.key;
            return (
              <button
                key={stat.key}
                onClick={() => handleClick(stat.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? `${stat.bg} ${stat.color} shadow-sm`
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className={`font-extrabold text-sm tabular-nums ${isActive ? stat.color : "text-foreground"}`}>
                  {stat.count}
                </span>
                <span className="whitespace-nowrap">{stat.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Desktop: cards */
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
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-xl font-extrabold text-card-foreground tabular-nums">{stat.count}</span>
                <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">{stat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
