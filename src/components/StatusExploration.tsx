import { useMemo, useState } from "react";
import { Sale, getSaleStatus, sortByRanking, type SaleStatus } from "@/data/salesUtils";
import SaleRankingItem from "./SaleRankingItem";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  sales: Sale[];
  onOpenDetail?: (sale: Sale) => void;
}

const INITIAL_LIMIT = 6;

const sections: { status: SaleStatus; emoji: string; title: string }[] = [
  { status: "ending_today", emoji: "", title: "오늘 마감" },
  { status: "live", emoji: "🟢", title: "진행중" },
  { status: "starting_soon", emoji: "🟡", title: "곧 시작" },
];

function isCommunity(sale: Sale): boolean {
  return sale.platform === "커뮤니티 핫딜" || sale.source_type === "community";
}

export default function StatusExploration({ sales, onOpenDetail }: Props) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [communityExpanded, setCommunityExpanded] = useState(false);

  const { grouped, communityActive } = useMemo(() => {
    const result: Record<SaleStatus, Sale[]> = {
      live: [],
      ending_today: [],
      starting_soon: [],
      ended: [],
    };
    const community: Sale[] = [];

    for (const sale of sales) {
      const status = getSaleStatus(sale);
      if (status === "ended") continue;

      if (isCommunity(sale)) {
        community.push(sale);
      } else {
        result[status].push(sale);
      }
    }
    for (const key of Object.keys(result) as SaleStatus[]) {
      result[key] = sortByRanking(result[key]);
    }
    return { grouped: result, communityActive: sortByRanking(community) };
  }, [sales]);

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const nonEmpty = sections.filter((s) => grouped[s.status].length > 0);

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <span>📡</span>
        상태별 탐색
      </h2>

      {nonEmpty.length === 0 && communityActive.length === 0 ? null : (
        <div className="space-y-4">
          {nonEmpty.map((section) => {
            const all = grouped[section.status];
            const isExpanded = expandedSections[section.status] ?? false;
            const items = isExpanded ? all : all.slice(0, INITIAL_LIMIT);
            const hasMore = all.length > INITIAL_LIMIT;

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
                      {all.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {items.map((sale, i) => (
                    <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={onOpenDetail} />
                  ))}
                </div>
                {hasMore && (
                  <button
                    onClick={() => toggleSection(section.status)}
                    className="flex items-center gap-1 mx-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg hover:bg-accent"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        접기
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        더보기 ({all.length - INITIAL_LIMIT}개)
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}

          {/* Community Hot Deals Section */}
          {communityActive.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 tracking-tight">
                  <span>🔥</span>
                  커뮤니티 핫딜
                  <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
                    {communityActive.length}
                  </span>
                </h3>
              </div>
              <div className="space-y-1.5">
                {(communityExpanded ? communityActive : communityActive.slice(0, INITIAL_LIMIT)).map((sale, i) => (
                  <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={onOpenDetail} />
                ))}
              </div>
              {communityActive.length > INITIAL_LIMIT && (
                <button
                  onClick={() => setCommunityExpanded((v) => !v)}
                  className="flex items-center gap-1 mx-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg hover:bg-accent"
                >
                  {communityExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      접기
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      더보기 ({communityActive.length - INITIAL_LIMIT}개)
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
