import { useMemo } from "react";
import { Sale, getSaleStatus, sortByRanking, saleStatusConfig, type SaleStatus } from "@/data/salesUtils";
import SaleRankingItem from "./SaleRankingItem";

interface Props {
  sales: Sale[];
}

const sections: { status: SaleStatus; emoji: string; title: string }[] = [
  { status: "ending_today", emoji: "", title: "오늘 마감" },
  { status: "live", emoji: "🟢", title: "진행중" },
  { status: "starting_soon", emoji: "🟡", title: "곧 시작" },
];

export default function StatusExploration({ sales }: Props) {
  const grouped = useMemo(() => {
    const result: Record<SaleStatus, Sale[]> = {
      live: [],
      ending_today: [],
      starting_soon: [],
      ended: [],
    };
    for (const sale of sales) {
      const status = getSaleStatus(sale);
      result[status].push(sale);
    }
    for (const key of Object.keys(result) as SaleStatus[]) {
      result[key] = sortByRanking(result[key]);
    }
    return result;
  }, [sales]);

  const nonEmpty = sections.filter((s) => grouped[s.status].length > 0);
  if (nonEmpty.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <span>📡</span>
        상태별 탐색
      </h2>

      <div className="space-y-4">
        {nonEmpty.map((section) => {
          const items = grouped[section.status].slice(0, 5);
          const total = grouped[section.status].length;
          return (
            <div key={section.status} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
                  {section.status === "ending_today" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today" style={{ fontSize: "12px", fontWeight: 700, padding: "2px 6px" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
                      오늘 마감
                    </span>
                  ) : (
                    <>
                      <span>{section.emoji}</span>
                      {section.title}
                    </>
                  )}
                  <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
                    {total}
                  </span>
                </h3>
              </div>
              <div className="space-y-1.5">
                {items.map((sale, i) => (
                  <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
