import { useState, useMemo, useRef } from "react";
import { sortByRanking, sortForFeatured, getSaleStatus, SaleStatus, Sale } from "@/data/salesUtils";
import { matchesQuickFilter } from "@/data/quickFilterDefs";
import { useSales } from "@/hooks/useSales";
import SaleCard from "@/components/SaleCard";
import HeroSaleCard from "@/components/HeroSaleCard";
import CoverflowCarousel from "@/components/CoverflowCarousel";
import EditorialBrandCard from "@/components/EditorialBrandCard";
import PeekCarousel from "@/components/PeekCarousel";
import ExpandedSaleOverlay from "@/components/ExpandedSaleOverlay";
import SaleRankingItem from "@/components/SaleRankingItem";
import SearchSuggestions from "@/components/SearchSuggestions";
import HeroStats from "@/components/HeroStats";
import QuickFilters from "@/components/QuickFilters";
import PlatformExplorer from "@/components/PlatformExplorer";
import TrendingCommunity from "@/components/TrendingCommunity";

import NewRadarTestSection from "@/components/NewRadarTestSection";
import {
  SaleCardCompactSkeleton,
  SaleCardSkeleton,
  EditorialCardSkeleton,
  RankingItemSkeleton,
  PlatformCardSkeleton,
  CommunityPostSkeleton,
  HeroStatsSkeleton,
} from "@/components/skeletons/SaleCardSkeleton";
import { Input } from "@/components/ui/input";
import { Search, Trophy, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

function SectionHeader({ emoji, title, count, moreLink, moreLabel }: { emoji: string; title: string; count?: number; moreLink?: string; moreLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-foreground flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight">
        <span>{emoji}</span>
        {title}
        {count !== undefined && (
          <span className="text-muted-foreground bg-accent rounded-full px-2 py-0.5 text-[11px] font-semibold">
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
  const [expandedSale, setExpandedSale] = useState<Sale | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: sales = [], isLoading } = useSales();
  const bp = useBreakpoint();

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  const filtered = useMemo(() => {
    let result = activeSales;
    if (heroFilter) result = result.filter((s) => getSaleStatus(s) === heroFilter);
    if (quickFilter) {
      result = result.filter((s) => matchesQuickFilter(s, quickFilter));
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

  const featuredSales = useMemo(
    () => sortForFeatured(activeSales.filter((s) => {
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

  const rankingSales = useMemo(() => sortByRanking(activeSales).slice(0, 10), [activeSales]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-28 sm:pb-24 overflow-x-hidden">
      <PageMeta title="PickSale - 쇼핑 세일 한눈에" description="의류, 뷰티, 라이프스타일 세일 정보를 한눈에 확인하세요." />
      <CanonicalLink href={window.location.origin + "/"} />

      {/* Search + Filters + Hero */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="space-y-2">
          <div className="relative w-full max-w-xl" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="무신사, 올리브영, 뷰티 등 검색"
              className="pl-9 rounded-xl bg-card border-border h-11"
            />
            {searchFocused && !query.trim() && <SearchSuggestions onSelect={handleSearchSelect} />}
          </div>
          <QuickFilters activeFilter={quickFilter} onFilter={handleQuickFilter} sales={activeSales} />
        </div>
        {isLoading && !sales.length ? (
          <HeroStatsSkeleton />
        ) : (
          <HeroStats sales={activeSales} activeFilter={heroFilter} onFilterChange={handleHeroFilter} />
        )}
      </div>

      {isLoading && !sales.length ? (
        bp === "mobile" ? <MobileLoadingSkeleton /> :
        bp === "tablet" ? <TabletLoadingSkeleton /> :
        <DesktopLoadingSkeleton />
      ) : hasActiveFilter ? (
        <section className="space-y-3">
          <SectionHeader emoji="🔍" title="검색 결과" count={filtered.length} />
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
              {filtered.map((sale, i) => <SaleCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Search className="w-7 h-7 text-muted-foreground/40" />
              <p className="text-sm mt-2">검색 결과가 없습니다.</p>
            </div>
          )}
          <ExpandedSaleOverlay sale={expandedSale} onClose={() => setExpandedSale(null)} />
        </section>
      ) : bp === "mobile" ? (
        <MobileLayout
          featuredSales={featuredSales}
          liveSales={liveSales}
          endingTodaySales={endingTodaySales}
          rankingSales={rankingSales}
          activeSales={activeSales}
        />
      ) : bp === "tablet" ? (
        <TabletLayout
          featuredSales={featuredSales}
          liveSales={liveSales}
          endingTodaySales={endingTodaySales}
          rankingSales={rankingSales}
          activeSales={activeSales}
        />
      ) : (
        <DesktopLayout
          featuredSales={featuredSales}
          liveSales={liveSales}
          endingTodaySales={endingTodaySales}
          rankingSales={rankingSales}
          activeSales={activeSales}
        />
      )}
    </div>
  );
}

/* ─── Layout Props ─── */

interface LayoutProps {
  featuredSales: Sale[];
  liveSales: Sale[];
  endingTodaySales: Sale[];
  rankingSales: Sale[];
  activeSales: Sale[];
}

/* ─── MOBILE ─── */
function MobileLayout({ featuredSales, liveSales, endingTodaySales, rankingSales, activeSales }: LayoutProps) {
  const [expandedSale, setExpandedSale] = useState<Sale | null>(null);

  return (
    <div className="space-y-6">
      {featuredSales.length > 0 && (
        <section className="space-y-2 -mx-3">
          <div className="px-3">
            <SectionHeader emoji="🔥" title="추천 세일" count={featuredSales.length} moreLink="/radar" />
          </div>
          <CoverflowCarousel>
            {featuredSales.map((sale, i) => (
              <EditorialBrandCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
            ))}
          </CoverflowCarousel>
        </section>
      )}

      {endingTodaySales.length > 0 && (
        <section className="space-y-2">
          <SectionHeader emoji="⏰" title="오늘 마감 세일" count={endingTodaySales.length} />
          <div className="space-y-2">
            {endingTodaySales.slice(0, 3).map((sale) => (
              <SaleCard key={sale.id} sale={sale} compact onOpenDetail={setExpandedSale} />
            ))}
          </div>
        </section>
      )}

      {liveSales.length > 0 && (
        <section className="space-y-2">
          <SectionHeader emoji="🟢" title="진행중 세일" count={liveSales.length} moreLink="/radar" />
          <div className="space-y-2">
            {liveSales.slice(0, 3).map((sale) => (
              <SaleCard key={sale.id} sale={sale} compact onOpenDetail={setExpandedSale} />
            ))}
          </div>
        </section>
      )}

      {rankingSales.length > 0 && (
        <section className="space-y-2">
          <SectionHeader emoji="🏆" title="세일 랭킹" moreLink="/radar" moreLabel="전체 랭킹" />
          <div className="space-y-1.5">
            {rankingSales.slice(0, 3).map((sale, i) => (
              <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
            ))}
          </div>
        </section>
      )}

      <NewRadarTestSection />
      <PlatformExplorer sales={activeSales} />
      <TrendingCommunity maxPosts={2} />

      {activeSales.length === 0 && (
        <div className="flex flex-col items-center py-10 text-muted-foreground">
          <Trophy className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm mt-2">진행 중인 세일이 없습니다.</p>
        </div>
      )}

      <ExpandedSaleOverlay sale={expandedSale} onClose={() => setExpandedSale(null)} />
    </div>
  );
}

/* ─── TABLET ─── */
function TabletLayout({ featuredSales, liveSales, endingTodaySales, rankingSales, activeSales }: LayoutProps) {
  const [expandedSale, setExpandedSale] = useState<Sale | null>(null);

  return (
    <div className="space-y-6">
      {featuredSales.length > 0 && (
        <section className="space-y-3">
          <SectionHeader emoji="🔥" title="추천 세일" count={featuredSales.length} moreLink="/radar" />
          <div className="grid grid-cols-2 gap-3">
            {featuredSales.slice(0, 4).map((sale, i) => (
              <SaleCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4">
        {endingTodaySales.length > 0 && (
          <section className="space-y-2">
            <SectionHeader emoji="⏰" title="오늘 마감" count={endingTodaySales.length} />
            <div className="space-y-2">
              {endingTodaySales.slice(0, 4).map((sale) => (
                <SaleCard key={sale.id} sale={sale} compact onOpenDetail={setExpandedSale} />
              ))}
            </div>
          </section>
        )}
        {liveSales.length > 0 && (
          <section className="space-y-2">
            <SectionHeader emoji="🟢" title="진행중" count={liveSales.length} moreLink="/radar" />
            <div className="space-y-2">
              {liveSales.slice(0, 4).map((sale) => (
                <SaleCard key={sale.id} sale={sale} compact onOpenDetail={setExpandedSale} />
              ))}
            </div>
          </section>
        )}
      </div>

      {rankingSales.length > 0 && (
        <section className="space-y-2">
          <SectionHeader emoji="🏆" title="세일 랭킹" moreLink="/radar" moreLabel="전체 랭킹" />
          <div className="grid grid-cols-2 gap-1.5">
            {rankingSales.slice(0, 6).map((sale, i) => (
              <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
            ))}
          </div>
        </section>
      )}

      <NewRadarTestSection />
      <PlatformExplorer sales={activeSales} />
      <TrendingCommunity maxPosts={3} />

      {activeSales.length === 0 && (
        <div className="flex flex-col items-center py-10 text-muted-foreground">
          <Trophy className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm mt-2">진행 중인 세일이 없습니다.</p>
        </div>
      )}

      <ExpandedSaleOverlay sale={expandedSale} onClose={() => setExpandedSale(null)} />
    </div>
  );
}

/* ─── DESKTOP ─── */
function DesktopLayout({ featuredSales, liveSales, endingTodaySales, rankingSales, activeSales }: LayoutProps) {
  const [expandedSale, setExpandedSale] = useState<Sale | null>(null);

  return (
    <>
      <div className="grid grid-cols-[1fr_280px] gap-6 min-w-0">
        <main className="space-y-8 min-w-0 overflow-hidden">
          {rankingSales.length > 0 && (
            <section className="space-y-3">
              <SectionHeader emoji="🏆" title="세일 랭킹" moreLink="/radar" moreLabel="전체 랭킹" />
              <div className="grid grid-cols-2 gap-1.5">
                {rankingSales.slice(0, 6).map((sale, i) => (
                  <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
                ))}
              </div>
            </section>
          )}

          {featuredSales.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div className="mb-3">
                <SectionHeader emoji="🔥" title="추천 세일" count={featuredSales.length} moreLink="/radar" />
              </div>
              <CoverflowCarousel>
                {featuredSales.map((sale, i) => (
                  <HeroSaleCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
                ))}
              </CoverflowCarousel>
            </section>
          )}

          {(endingTodaySales.length > 0 || liveSales.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 min-w-0 gap-5">
              {endingTodaySales.length > 0 && (
                <section className="space-y-3">
                  <SectionHeader emoji="⏰" title="오늘 마감 세일" count={endingTodaySales.length} />
                  <PeekCarousel cardWidth={240} gap={16}>
                    {endingTodaySales.map((sale) => (
                      <EditorialBrandCard key={sale.id} sale={sale} onOpenDetail={setExpandedSale} />
                    ))}
                  </PeekCarousel>
                </section>
              )}
              {liveSales.length > 0 && (
                <section className="space-y-3">
                  <SectionHeader emoji="🟢" title="진행중 세일" count={liveSales.length} />
                  <PeekCarousel cardWidth={240} gap={16}>
                    {liveSales.slice(0, 6).map((sale) => (
                      <EditorialBrandCard key={sale.id} sale={sale} onOpenDetail={setExpandedSale} />
                    ))}
                  </PeekCarousel>
                </section>
              )}
            </div>
          )}

          <NewRadarTestSection />
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

      <ExpandedSaleOverlay sale={expandedSale} onClose={() => setExpandedSale(null)} />
    </>
  );
}

/* ─── Loading Skeletons ─── */
function MobileLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <SectionHeader emoji="🔥" title="추천 세일" />
        {[1, 2, 3, 4].map((i) => <SaleCardCompactSkeleton key={i} />)}
      </section>
      <section className="space-y-2">
        <SectionHeader emoji="⏰" title="오늘 마감 세일" />
        {[1, 2, 3].map((i) => <SaleCardCompactSkeleton key={i} />)}
      </section>
      <section className="space-y-2">
        <SectionHeader emoji="🏆" title="세일 랭킹" />
        {[1, 2, 3].map((i) => <RankingItemSkeleton key={i} />)}
      </section>
      <section className="space-y-2">
        <SectionHeader emoji="🏬" title="플랫폼별 세일" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2].map((i) => <PlatformCardSkeleton key={i} />)}
        </div>
      </section>
    </div>
  );
}

function TabletLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionHeader emoji="🔥" title="추천 세일" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <SaleCardSkeleton key={i} />)}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-4">
        <section className="space-y-2">
          <SectionHeader emoji="⏰" title="오늘 마감" />
          {[1, 2, 3].map((i) => <SaleCardCompactSkeleton key={i} />)}
        </section>
        <section className="space-y-2">
          <SectionHeader emoji="🟢" title="진행중" />
          {[1, 2, 3].map((i) => <SaleCardCompactSkeleton key={i} />)}
        </section>
      </div>
      <section className="space-y-2">
        <SectionHeader emoji="🏆" title="세일 랭킹" />
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => <RankingItemSkeleton key={i} />)}
        </div>
      </section>
    </div>
  );
}

function DesktopLoadingSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_280px] gap-6 min-w-0">
      <main className="space-y-8 min-w-0">
        <section className="space-y-3">
          <SectionHeader emoji="🏆" title="세일 랭킹" />
          <div className="grid grid-cols-2 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => <RankingItemSkeleton key={i} />)}
          </div>
        </section>
        <section className="space-y-3">
          <SectionHeader emoji="🔥" title="추천 세일" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <SaleCardSkeleton key={i} />)}
          </div>
        </section>
        <section className="space-y-3">
          <SectionHeader emoji="🏬" title="플랫폼별 세일" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => <PlatformCardSkeleton key={i} />)}
          </div>
        </section>
      </main>
      <aside className="space-y-4">
        <section className="space-y-3">
          <SectionHeader emoji="🔥" title="커뮤니티 트렌딩" />
          {[1, 2, 3, 4, 5].map((i) => <CommunityPostSkeleton key={i} />)}
        </section>
      </aside>
    </div>
  );
}
