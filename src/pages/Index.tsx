import { useState, useMemo, useRef } from "react";
import { sortByRanking, sortForFeatured, getSaleStatus, SaleStatus, Sale } from "@/data/salesUtils";
import { matchesQuickFilter } from "@/data/quickFilterDefs";
import { useSales } from "@/hooks/useSales";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/hooks/useAuth";
import { useEventOccurrences, type EventOccurrence } from "@/hooks/useEventOccurrences";
import SaleCard from "@/components/SaleCard";
import EditorialBrandCard from "@/components/EditorialBrandCard";
import CoverflowCarousel from "@/components/CoverflowCarousel";
import HeroSaleCard from "@/components/HeroSaleCard";
import ExpandedSaleOverlay from "@/components/ExpandedSaleOverlay";
import SaleRankingItem from "@/components/SaleRankingItem";
import SearchSuggestions from "@/components/SearchSuggestions";
import HeroStats from "@/components/HeroStats";
import QuickFilters from "@/components/QuickFilters";
import PlatformSummary from "@/components/PlatformSummary";
import TrendingCommunity from "@/components/TrendingCommunity";

import {
  SaleCardCompactSkeleton,
  SaleCardSkeleton,
  RankingItemSkeleton,
  HeroStatsSkeleton,
  EditorialCardSkeleton,
  PlatformCardSkeleton,
  CommunityPostSkeleton,
} from "@/components/skeletons/SaleCardSkeleton";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Star, Eye, ChevronRight, Radar } from "lucide-react";
import { Link } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import { Skeleton } from "@/components/ui/skeleton";

function SectionHeader({ emoji, title, count, moreLink, moreLabel }: { emoji?: string; title: string; count?: number; moreLink?: string; moreLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-foreground flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight">
        {emoji && <span>{emoji}</span>}
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

/* ── Event Series Summary Card ── */
function EventSeriesSummary() {
  const { data: items = [], isLoading } = useEventOccurrences();

  const liveEvents = useMemo(
    () => items.filter((e) => e.status === "live" || e.status === "scheduled").slice(0, 4),
    [items]
  );

  if (isLoading) {
    return (
      <section className="space-y-3">
        <SectionHeader emoji="📅" title="대표 세일 시리즈" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </section>
    );
  }

  if (liveEvents.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionHeader emoji="📅" title="대표 세일 시리즈" moreLink="/radar" moreLabel="전체 보기" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {liveEvents.map((ev) => (
          <Link
            key={ev.occurrence_id}
            to={ev.event_slug ? `/series/${ev.event_slug}` : "#"}
            className="group rounded-xl border border-border/60 bg-card p-3 hover:shadow-sm hover:-translate-y-px transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${ev.status === "live" ? "bg-green-500" : "bg-yellow-400"}`} />
              <span className="text-[11px] font-semibold text-muted-foreground truncate">
                {ev.organization_name}
              </span>
            </div>
            <h3 className="text-[13px] font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {ev.event_name || ev.occurrence_title}
            </h3>
            {ev.max_discount_pct && (
              <span className="text-[10px] font-bold text-primary mt-0.5 inline-block">
                최대 {ev.max_discount_pct}%
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Index() {
  const [query, setQuery] = useState("");
  const [heroFilter, setHeroFilter] = useState<SaleStatus | null>(null);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedSale, setExpandedSale] = useState<Sale | null>(null);
  const [showAll, setShowAll] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: sales = [], isLoading } = useSales();
  const { user } = useAuth();
  const { favoritePlatforms, hasFavorites } = useUserPreferences();
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  const platformFiltered = useMemo(() => {
    if (!hasFavorites || showAll) return activeSales;
    return activeSales.filter((s) => favoritePlatforms.includes(s.platform as any));
  }, [activeSales, favoritePlatforms, hasFavorites, showAll]);

  const filtered = useMemo(() => {
    let result = platformFiltered;
    if (heroFilter) result = result.filter((s) => getSaleStatus(s) === heroFilter);
    if (quickFilter) result = result.filter((s) => matchesQuickFilter(s, quickFilter));
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
  }, [query, platformFiltered, heroFilter, quickFilter]);

  const hasActiveFilter = !!heroFilter || !!quickFilter || !!query.trim();

  const featuredSales = useMemo(
    () => sortForFeatured(platformFiltered.filter((s) => {
      const st = getSaleStatus(s);
      return st === "live" || st === "ending_today";
    })).slice(0, 6),
    [platformFiltered]
  );
  const liveSales = useMemo(
    () => sortByRanking(platformFiltered.filter((s) => {
      const st = getSaleStatus(s);
      return st === "live" || st === "ending_today";
    })).slice(0, 6),
    [platformFiltered]
  );
  const startingSoonSales = useMemo(
    () => sortByRanking(platformFiltered.filter((s) => getSaleStatus(s) === "starting_soon")).slice(0, 4),
    [platformFiltered]
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

  /* ── Main content (shared across layouts) ── */
  const mainContent = (
    <>
      {hasActiveFilter ? (
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
        </section>
      ) : (
        <div className="space-y-6">
          {/* 1. 추천 세일 캐러셀 */}
          {featuredSales.length > 0 && (
            <section className={`space-y-3 ${bp === "mobile" ? "-mx-3" : "overflow-hidden"}`}>
              <div className={bp === "mobile" ? "px-3" : ""}>
                <SectionHeader emoji="🔥" title="추천 세일" count={featuredSales.length} moreLink="/radar" />
              </div>
              <CoverflowCarousel>
                {featuredSales.map((sale, i) =>
                  isDesktop ? (
                    <HeroSaleCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
                  ) : (
                    <EditorialBrandCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
                  )
                )}
              </CoverflowCarousel>
            </section>
          )}

          {/* 2. 대표 세일 시리즈 */}
          <EventSeriesSummary />

          {/* 3. 진행 중 세일 6개 */}
          {liveSales.length > 0 && (
            <section className="space-y-3">
              <SectionHeader emoji="🟢" title="진행 중 세일" count={liveSales.length} moreLink="/radar" />
              <div className="space-y-1.5">
                {liveSales.map((sale, i) => (
                  <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
                ))}
              </div>
            </section>
          )}

          {/* 4. 곧 시작 세일 4개 */}
          {startingSoonSales.length > 0 && (
            <section className="space-y-3">
              <SectionHeader emoji="🟡" title="곧 시작" count={startingSoonSales.length} moreLink="/radar" />
              <div className="space-y-1.5">
                {startingSoonSales.map((sale, i) => (
                  <SaleRankingItem key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setExpandedSale} />
                ))}
              </div>
            </section>
          )}

          {/* 5. 커뮤니티 트렌딩 */}
          <TrendingCommunity maxPosts={3} />

          {/* 6. 레이더에서 전체 보기 */}
          <Link
            to="/radar"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-sm font-semibold text-foreground"
          >
            <Radar className="w-4 h-4 text-primary" />
            레이더에서 전체 세일 보기
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          {activeSales.length === 0 && (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Trophy className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm mt-2">진행 중인 세일이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-28 sm:pb-24">
      <PageMeta title="PickSale - 쇼핑 세일 한눈에" description="의류, 뷰티, 라이프스타일 세일 정보를 한눈에 확인하세요." />
      <CanonicalLink href={window.location.origin + "/"} />

      {/* Search + Filters + Stats */}
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
          <HeroStats sales={platformFiltered} activeFilter={heroFilter} onFilterChange={handleHeroFilter} favoritePlatforms={favoritePlatforms} />
        )}

        {user && hasFavorites && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showAll
                ? "border-border text-muted-foreground hover:bg-accent"
                : "border-primary/30 bg-primary/5 text-primary"
            }`}
          >
            {showAll ? (
              <><Star className="w-3.5 h-3.5" /> 관심 플랫폼만</>
            ) : (
              <><Eye className="w-3.5 h-3.5" /> 전체 보기</>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading && !sales.length ? (
        isDesktop ? (
          <div className="grid grid-cols-[1fr_280px] gap-6 min-w-0">
            <div className="space-y-6 min-w-0">
              <section className="space-y-3">
                <SectionHeader emoji="🔥" title="추천 세일" />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => <SaleCardSkeleton key={i} />)}
                </div>
              </section>
              <section className="space-y-2">
                <SectionHeader emoji="🟢" title="진행 중" />
                {[1, 2, 3].map((i) => <RankingItemSkeleton key={i} />)}
              </section>
            </div>
            <aside className="space-y-4">
              <Skeleton className="h-[400px] rounded-xl" />
            </aside>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-2">
              <SectionHeader emoji="🔥" title="추천 세일" />
              {[1, 2, 3].map((i) => <SaleCardCompactSkeleton key={i} />)}
            </section>
            <section className="space-y-2">
              <SectionHeader emoji="🟢" title="진행 중" />
              {[1, 2, 3].map((i) => <RankingItemSkeleton key={i} />)}
            </section>
          </div>
        )
      ) : isDesktop ? (
        <div className="grid grid-cols-[1fr_280px] gap-6 min-w-0 items-start">
          <main className="min-w-0">
            {mainContent}
          </main>
          <aside className="sticky top-[68px] self-start h-fit space-y-4 transition-none bg-background/80 backdrop-blur-sm rounded-xl p-3">
            <PlatformSummary sales={activeSales} />
            <div>
              <p className="text-[10px] text-muted-foreground text-center mb-1">광고</p>
              <div className="flex justify-center py-3">
                <iframe src="https://coupa.ng/clTGff" width="120" height="240" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" />
              </div>
            </div>
          </aside>
        </div>
      ) : (
        mainContent
      )}

      <ExpandedSaleOverlay sale={expandedSale} onClose={() => setExpandedSale(null)} />
    </div>
  );
}
