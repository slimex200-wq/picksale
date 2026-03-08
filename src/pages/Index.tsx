import { useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { sortByRanking, Platform, getSaleStatus, platforms, platformSlugs } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { useSales } from "@/hooks/useSales";
import PlatformFilter from "@/components/PlatformFilter";
import SaleCard from "@/components/SaleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Trophy, ChevronRight } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

// Lazy load secondary sections — they are below the fold
const SaleTimeline = lazy(() => import("@/components/SaleTimeline"));
const TrendingCommunity = lazy(() => import("@/components/TrendingCommunity"));

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-40" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function Index() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [query, setQuery] = useState("");
  const { data: sales = [], isLoading } = useSales();

  const ranked = useMemo(() => {
    let result = sales;

    if (selectedPlatforms.length > 0) {
      result = result.filter((s) => selectedPlatforms.includes(s.platform));
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

    result = result.filter((s) => getSaleStatus(s) !== "ended");
    return sortByRanking(result);
  }, [selectedPlatforms, query, sales]);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 space-y-4">
      <PageMeta title="PickSale - 쇼핑 세일 레이더" description="쿠팡, 무신사, 올리브영 등 주요 쇼핑몰의 세일 정보를 한눈에 확인하세요. 실시간 세일 랭킹과 타임라인을 제공합니다." />
      <CanonicalLink href={window.location.origin + "/"} />
      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="세일, 플랫폼, 카테고리 검색"
          className="pl-9 rounded-lg bg-card border-border"
        />
      </div>

      <PlatformFilter
        selected={selectedPlatforms}
        onChange={setSelectedPlatforms}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Trophy className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm mt-3">진행 중인 세일이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Desktop: 2-column layout (ranking + timeline) */}
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
            {/* Left: Ranking — renders immediately */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
                <span>🏆</span>
                세일 랭킹
                <span className="text-xs text-muted-foreground font-medium ml-1">
                  {ranked.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {ranked.map((sale, index) => (
                  <SaleCard key={sale.id} sale={sale} rank={index + 1} />
                ))}
              </div>
            </section>

            {/* Right: Timeline — lazy loaded */}
            <aside className="mt-6 lg:mt-0">
              <Suspense fallback={<TimelineSkeleton />}>
                <SaleTimeline sales={sales} />
              </Suspense>
            </aside>
          </div>

          {/* Trending Community — lazy loaded */}
          <Suspense fallback={<TrendingSkeleton />}>
            <TrendingCommunity />
          </Suspense>

          {/* Platform Navigation */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
              <span>🏬</span>
              플랫폼별 세일
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {platforms.map((p) => (
                <Link
                  key={p}
                  to={`/platform/${platformSlugs[p]}`}
                  className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-2.5 hover:shadow-md transition-shadow"
                >
                  <img src={platformLogos[p]} alt={p} className="h-8 w-8 object-contain rounded-lg" loading="lazy" />
                  <span className="text-xs font-bold text-card-foreground flex-1">{p}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
