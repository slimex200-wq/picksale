import { useState, useMemo, useRef } from "react";
import { sortByRanking, Platform, getSaleStatus } from "@/data/salesUtils";
import { useSales } from "@/hooks/useSales";
import SaleCard from "@/components/SaleCard";
import SaleRankingItem from "@/components/SaleRankingItem";
import SaleStatusFilter, { type StatusFilter } from "@/components/SaleStatusFilter";
import SearchSuggestions from "@/components/SearchSuggestions";
import HeroStats from "@/components/HeroStats";
import TrendingCommunity from "@/components/TrendingCommunity";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Trophy } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

function SectionHeader({ emoji, title, count }: { emoji: string; title: string; count?: number }) {
  return (
    <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2">
      <span>{emoji}</span>
      {title}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground font-medium ml-1 bg-accent rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
    </h2>
  );
}

export default function Index() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: sales = [], isLoading } = useSales();

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  // Live sales section
  const liveSales = useMemo(
    () => sortByRanking(activeSales.filter((s) => getSaleStatus(s) === "live")),
    [activeSales]
  );

  // Filtered ranking
  const ranked = useMemo(() => {
    let result = activeSales;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.sale_name.toLowerCase().includes(q) ||
          s.platform.toLowerCase().includes(q) ||
          s.category.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => getSaleStatus(s) === statusFilter);
    }

    return sortByRanking(result);
  }, [query, activeSales, statusFilter]);

  const featuredSales = ranked.slice(0, 6);
  const rankingSales = ranked.slice(6);

  const handleSearchSelect = (keyword: string) => {
    setQuery(keyword);
    setSearchFocused(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 space-y-12">
      <PageMeta title="PickSale - 쇼핑 세일 레이더" description="쿠팡, 무신사, 올리브영 등 주요 쇼핑몰의 세일 정보를 한눈에 확인하세요. 실시간 세일 랭킹과 타임라인을 제공합니다." />
      <CanonicalLink href={window.location.origin + "/"} />

      {/* 1. Hero — Identity + Stats */}
      {!isLoading && <HeroStats sales={activeSales} />}

      {/* 2. Search */}
      <div className="relative max-w-lg" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder="세일, 플랫폼, 카테고리 검색"
          className="pl-9 rounded-xl bg-card border-border h-11"
        />
        {searchFocused && !query.trim() && (
          <SearchSuggestions onSelect={handleSearchSelect} />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* 3. 진행중 세일 */}
          {liveSales.length > 0 && !query.trim() && statusFilter === "all" && (
            <section className="space-y-4">
              <SectionHeader emoji="🟢" title="진행중 세일" count={liveSales.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {liveSales.slice(0, 3).map((sale, i) => (
                  <SaleCard key={sale.id} sale={sale} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* 4. 추천 세일 + 필터 */}
          <section className="space-y-4">
            <div className="space-y-3">
              <SaleStatusFilter value={statusFilter} onChange={setStatusFilter} />
            </div>

            {featuredSales.length > 0 && (
              <div className="space-y-4">
                <SectionHeader emoji="⚡" title="추천 세일" count={featuredSales.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {featuredSales.map((sale, i) => (
                    <SaleCard key={sale.id} sale={sale} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* 5. 세일 랭킹 */}
            {rankingSales.length > 0 && (
              <div className="space-y-4">
                <SectionHeader emoji="🏆" title="세일 랭킹" count={rankingSales.length} />
                <div className="space-y-2">
                  {rankingSales.map((sale, i) => (
                    <SaleRankingItem key={sale.id} sale={sale} rank={i + 7} />
                  ))}
                </div>
              </div>
            )}

            {ranked.length === 0 && (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                {query.trim() || statusFilter !== "all" ? (
                  <>
                    <Search className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm mt-3">검색 결과가 없습니다.</p>
                  </>
                ) : (
                  <>
                    <Trophy className="w-10 h-10 text-muted-foreground/40" />
                    <p className="text-sm mt-3">진행 중인 세일이 없습니다.</p>
                  </>
                )}
              </div>
            )}
          </section>

          {/* 6. Small community preview */}
          <TrendingCommunity maxPosts={3} />
        </>
      )}
    </div>
  );
}
