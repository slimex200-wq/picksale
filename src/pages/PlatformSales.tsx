import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useSales } from "@/hooks/useSales";
import { slugToPlatform, platformEmojis, platformColors, getSaleStatus, calculateRankingScore, Platform, getTodayKST } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import SaleCard from "@/components/SaleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

type StatusFilter = "all" | "live" | "starting_soon" | "ending_today" | "ending_soon";
type SortOption = "ranking" | "newest" | "ending_soon" | "starting_soon";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "live", label: "🟢 진행중" },
  { key: "starting_soon", label: "🟡 곧 시작" },
  { key: "ending_today", label: "🔴 오늘 마감" },
  { key: "ending_soon", label: "⚠️ 종료 임박" },
];

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "ranking", label: "중요도순" },
  { key: "newest", label: "최신순" },
  { key: "ending_soon", label: "종료임박순" },
  { key: "starting_soon", label: "시작임박순" },
];

/** Uses KST-based today for consistent status with PlatformExplorer */
function getDetailedStatus(sale: { start_date: string; end_date: string }): StatusFilter {
  const today = getTodayKST();
  const daysBetween = (a: string, b: string) =>
    Math.round((new Date(a + "T00:00:00+09:00").getTime() - new Date(b + "T00:00:00+09:00").getTime()) / 86400000);

  const isActive = sale.start_date <= today && sale.end_date >= today;
  const endDaysLeft = daysBetween(sale.end_date, today);
  const startDaysLeft = daysBetween(sale.start_date, today);

  if (sale.end_date === today) return "ending_today";
  if (isActive && endDaysLeft >= 0 && endDaysLeft <= 2) return "ending_soon";
  if (isActive) return "live";
  if (startDaysLeft > 0 && startDaysLeft <= 3) return "starting_soon";
  return "all";
}

export default function PlatformSales() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const platform = slug ? slugToPlatform[slug] : undefined;
  const { data: allSales = [], isLoading } = useSales();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("ranking");

  const filtered = useMemo(() => {
    if (!platform) return [];
    const today = getTodayKST();

    // Filter: same platform, not ended (using KST)
    // NOTE: No sale_tier filter — must match PlatformExplorer home card counts exactly
    let result = allSales.filter(
      (s) => s.platform === platform && s.end_date >= today
    );

    if (statusFilter === "live") {
      // "진행중" includes ending_today + ending_soon + live (all currently active)
      // This matches PlatformExplorer which counts ending_today inside live
      result = result.filter((s) => {
        const st = getSaleStatus(s);
        return st === "live" || st === "ending_today";
      });
    } else if (statusFilter === "ending_today") {
      result = result.filter((s) => getSaleStatus(s) === "ending_today");
    } else if (statusFilter === "ending_soon") {
      result = result.filter((s) => {
        const st = getDetailedStatus(s);
        return st === "ending_soon";
      });
    } else if (statusFilter === "starting_soon") {
      result = result.filter((s) => getDetailedStatus(s) === "starting_soon");
    }
    // "all" → no extra filter

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "ranking":
          return calculateRankingScore(b) - calculateRankingScore(a);
        case "newest":
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        case "ending_soon":
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case "starting_soon":
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [allSales, platform, statusFilter, sortBy]);

  // Debug logging
  useEffect(() => {
    if (!platform) return;
    const today = getTodayKST();
    const allForPlatform = allSales.filter((s) => s.platform === platform);
    const majorPublished = allForPlatform.filter((s) => s.sale_tier === "major");
    const notEnded = majorPublished.filter((s) => s.end_date >= today);

    console.group(`[PlatformSales Debug] ${platform}`);
    console.log("selected platform:", platform);
    console.log("selected tab:", statusFilter);
    console.log("today (KST):", today);
    console.log("all sales for platform:", allForPlatform.length);
    console.log("major+published:", majorPublished.length);
    console.log("not ended (end_date >= today):", notEnded.length);
    console.log("filtered result:", filtered.length);
    notEnded.forEach((s) => {
      console.log(`  - ${s.sale_name} | start: ${s.start_date} | end: ${s.end_date} | status: ${getDetailedStatus(s)} | tier: ${s.sale_tier}`);
    });
    console.groupEnd();
  }, [platform, allSales, statusFilter, filtered]);

  if (!platform) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-muted-foreground">존재하지 않는 플랫폼입니다.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">홈으로 돌아가기</Link>
      </div>
    );
  }

  const emoji = platformEmojis[platform];
  const colorClass = platformColors[platform];
  const today = getTodayKST();
  const liveCount = filtered.filter((s) => s.start_date <= today && s.end_date >= today).length;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 space-y-4">
      <PageMeta
        title={`${platform} 세일 모음 | PickSale`}
        description={`${platform}의 현재 진행 중이거나 곧 시작하는 주요 세일 이벤트를 모아봅니다.`}
        ogUrl={`${window.location.origin}/platform/${slug}`}
      />
      <CanonicalLink href={`${window.location.origin}/platform/${slug}`} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${platform} 세일 모음 | PickSale`,
        description: `${platform}의 현재 진행 중이거나 곧 시작하는 주요 세일 이벤트를 모아봅니다.`,
        url: `${window.location.origin}${location.pathname}`,
        about: { "@type": "Organization", name: platform },
        numberOfItems: filtered.length,
      }} />

      {/* Header */}
      <div className="space-y-3">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          홈으로
        </Link>

        <div className={`${colorClass} rounded-xl p-4 text-primary-foreground`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-white/20">
              <PlatformLogo platform={platform} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{platform} 세일</h1>
              <p className="text-xs opacity-90">
                현재 진행 중이거나 곧 시작하는 주요 세일 이벤트를 모아봅니다.
              </p>
            </div>
          </div>
          {liveCount > 0 && (
            <p className="text-xs mt-2 bg-white/15 rounded-lg px-3 py-1.5 inline-block font-semibold">
              현재 진행 중인 주요 세일 {liveCount}건
            </p>
          )}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-1.5">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              statusFilter === f.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex flex-wrap gap-1.5">
        {sortOptions.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap ${
              sortBy === s.key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <span className="text-3xl">{emoji}</span>
          <p className="text-sm mt-3">
            {statusFilter === "all"
              ? "현재 진행 중인 세일이 없습니다."
              : "해당 상태의 세일이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground px-1">{filtered.length}개 세일</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((sale) => (
              <SaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
