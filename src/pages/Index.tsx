import { useState, useMemo, useRef } from "react";
import { sortByRanking, getSaleStatus, SaleStatus } from "@/data/salesUtils";
import { useSales } from "@/hooks/useSales";
import SaleCard from "@/components/SaleCard";
import SaleRankingItem from "@/components/SaleRankingItem";
import SearchSuggestions from "@/components/SearchSuggestions";
import HeroStats from "@/components/HeroStats";
import QuickFilters from "@/components/QuickFilters";
import PlatformExplorer from "@/components/PlatformExplorer";
import TrendingCommunity from "@/components/TrendingCommunity";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Trophy, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

function SectionHeader({ emoji, title, count, moreLink, moreLabel }: { emoji: string; title: string; count?: number; moreLink?: string; moreLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-foreground flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
        <span>{emoji}</span>
        {title}
        {count !== undefined && (
          <span className="text-muted-foreground bg-accent rounded-full px-2 py-0.5" style={{ fontSize: '11px', fontWeight: '600' }}>
            {count}
          </span>
        )}
      </h2>
      {moreLink && (
        <Link to={moreLink} className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
          {moreLabel || "더보기"} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

export default function Index() {
  const [query, setQuery] = useState("");
  const [heroFilter, setHeroFilter] = useState<SaleStatus | null>(null);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileTab, setMobileTab] = useState<"featured" | "live" | "ending">("featured");
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: sales = [], isLoading } = useSales();
  const isMobile = useIsMobile();

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  const filtered = useMemo(() => {
    let result = activeSales;
    if (heroFilter) result = result.filter((s) => getSaleStatus(s) === heroFilter);
    if (quickFilter) {
      if (quickFilter === "ending_today") {
        result = result.filter((s) => getSaleStatus(s) === "ending_today");
      } else {
        result = result.filter((s) => s.category.some((c) => c.includes(quickFilter)));
      }
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.sale_name.toLowerCase().includes(q) ||
          s.platform.toLowerCase().includes(q) ||
          s.category.some((c) => c.toLowerCase().includes(q))
      );
    }
    return sortByRanking(result);
  }, [query, activeSales, heroFilter, quickFilter]);

  const hasActiveFilter = !!heroFilter || !!quickFilter || !!query.trim();

  // Featured: only live + ending_today (no ended)
  const featuredSales = useMemo(
    () => sortByRanking(activeSales.filter((s) => {
      const st = getSaleStatus(s);
      return st === "live" || st === "ending_today";
    })).slice(0, 6),
    [activeSales]
  );
  const endingTodaySales = useMemo(
    () => sortByRanking(activeSales.filter((s) => getSaleStatus(s) === "ending_today")),
    [activeSales]
  );
  const liveSales = useMemo(
    () => sortByRanking(activeSales.filter((s) => getSaleStatus(s) === "live")),
    [activeSales]
  );

  const handleSearchSelect = (keyword: string) => {
    setQuery(keyword);
    setSearchFocused(false);
  };
  const handleHeroFilter = (filter: SaleStatus | null) => {
    setHeroFilter(filter);
    setQuickFilter(null);
  };
  const handleQuickFilter = (filter: string | null) => {
    setQuickFilter(filter);
    setHeroFilter(null);
  };

  const mobileCardLimit = 3;
  const mobileTabSales = mobileTab === "featured" ? featuredSales : mobileTab === "live" ? liveSales : endingTodaySales;
  const mobileTabDisplay = mobileTabSales.slice(0, mobileCardLimit);
  const rankingSales = sortByRanking(activeSales).slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24">
      <PageMeta title="PickSale - 쇼핑 세일 레이더" description="쿠팡, 무신사, 올리브영 등 주요 쇼핑몰의 세일 정보를 한눈에 확인하세요." />
      <CanonicalLink href={window.location.origin + "/"} />

      {/* Hero + Search */}
      <div className="space-y-3 mb-6">
        {!isLoading && (
          <HeroStats sales={activeSales} activeFilter={heroFilter} onFilterChange={handleHeroFilter} />
        )}
        <div className="space-y-2">
          <div className="relative max-w-lg" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="세일, 플랫폼, 카테고리 검색"
              className="pl-9 rounded-xl bg-card border-border h-10"
            />
            {searchFocused && !query.trim() && <SearchSuggestions onSelect={handleSearchSelect} />}
          </div>
          <QuickFilters activeFilter={quickFilter} onFilter={handleQuickFilter} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : hasActiveFilter ? (
        <section className="space-y-3">
          <SectionHeader emoji="🔍" title="검색 결과" count={filtered.length} />
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((sale, i) => <SaleCard key={sale.id} sale={sale} rank={i + 1} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Search className="w-7 h-7 text-muted-foreground/40" />
              <p className="text-sm mt-2">검색 결과가 없습니다.</p>
            </div>
          )}
        </section>
      ) : isMobile ? (
        /* ═══ MOBILE LAYOUT ═══ */
        <div className="space-y-8">
          {/* Tabbed sections */}
          <section className="space-y-3">
            <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
              {([
                { key: "featured", label: "🔥 추천", count: featuredSales.length },
                { key: "live", label: "🟢 진행중", count: liveSales.length },
                { key: "ending", label: "⏰ 오늘 종료", count: endingTodaySales.length },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMobileTab(tab.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mobileTab === tab.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label} <span className="tabular-nums">{tab.count}</span>
                </button>
              ))}
            </div>
            {mobileTabDisplay.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {mobileTabDisplay.map((sale, i) => <SaleCard key={sale.id} sale={sale} rank={i + 1} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <p className="text-sm">해당 세일이 없습니다.</p>
              </div>
            )}
            {mobileTabSales.length > mobileCardLimit && (
              <Link to="/radar" className="block text-center text-xs text-primary font-medium hover:underline py-1">
                전체 보기 →
              </Link>
            )}
          </section>

          {/* Ranking — top 3 */}
          {rankingSales.length > 0 && (
            <section className="space-y-2">
              <SectionHeader emoji="🏆" title="세일 랭킹" moreLink="/radar" moreLabel="전체 랭킹" />
              <div className="space-y-1.5">
                {rankingSales.slice(0, 3).map((sale, i) => (
                  <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          <PlatformExplorer sales={activeSales} />
          <TrendingCommunity maxPosts={2} />

          {activeSales.length === 0 && (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Trophy className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm mt-2">진행 중인 세일이 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        /* ═══ DESKTOP 2-COLUMN LAYOUT ═══ */
        <div className="grid grid-cols-[1fr_280px] gap-6 min-w-0">
          <main className="space-y-8 min-w-0 overflow-hidden">
            {/* Ranking */}
            {rankingSales.length > 0 && (
              <section className="space-y-3">
                <SectionHeader emoji="🏆" title="세일 랭킹" moreLink="/radar" moreLabel="전체 랭킹" />
                <div className="grid grid-cols-2 gap-1.5">
                  {rankingSales.slice(0, 6).map((sale, i) => (
                    <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured — horizontal scroll */}
            {featuredSales.length > 0 && (
              <section className="space-y-3">
                <SectionHeader emoji="🔥" title="추천 세일" count={featuredSales.length} moreLink="/radar" />
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                  {featuredSales.map((sale, i) => (
                    <div key={sale.id} className="min-w-[260px] max-w-[280px] flex-1 shrink-0 snap-start">
                      <SaleCard sale={sale} rank={i + 1} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ending Today + Live — horizontal scroll rows side by side */}
            {(endingTodaySales.length > 0 || liveSales.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                {endingTodaySales.length > 0 && (
                  <section className="space-y-3">
                    <SectionHeader emoji="⏰" title="오늘 종료 세일" count={endingTodaySales.length} />
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                      {endingTodaySales.map((sale) => (
                        <div key={sale.id} className="min-w-[240px] max-w-[260px] flex-1 shrink-0 snap-start">
                          <SaleCard sale={sale} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {liveSales.length > 0 && (
                  <section className="space-y-3">
                    <SectionHeader emoji="🟢" title="진행중 세일" count={liveSales.length} />
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                      {liveSales.slice(0, 6).map((sale) => (
                        <div key={sale.id} className="w-[260px] shrink-0">
                          <SaleCard sale={sale} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            <PlatformExplorer sales={activeSales} />

            {activeSales.length === 0 && (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <Trophy className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm mt-2">진행 중인 세일이 없습니다.</p>
              </div>
            )}
          </main>

          <aside className="space-y-4 sticky top-4">
            <TrendingCommunity maxPosts={5} />
          </aside>
        </div>
      )}
    </div>
  );
}
