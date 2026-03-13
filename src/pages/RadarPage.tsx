import { useMemo, useState } from "react";
import { useSales } from "@/hooks/useSales";
import { Sale, getSaleStatus, sortByRanking, Platform, platforms, platformEmojis } from "@/data/salesUtils";
import SaleCard from "@/components/SaleCard";
import ExpandedSaleOverlay from "@/components/ExpandedSaleOverlay";
import { EventRadarSection } from "@/components/event-radar";
import { SaleCardSkeleton } from "@/components/skeletons/SaleCardSkeleton";
import { Radar, Search, X } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

type StatusFilter = "all" | "live" | "ending_today" | "starting_soon";

const STATUS_OPTIONS: { key: StatusFilter; label: string; emoji: string }[] = [
  { key: "all", label: "전체", emoji: "📋" },
  { key: "live", label: "진행중", emoji: "🟢" },
  { key: "ending_today", label: "오늘 마감", emoji: "🔴" },
  { key: "starting_soon", label: "곧 시작", emoji: "🟡" },
];

const CATEGORIES = ["패션", "뷰티", "라이프스타일", "테크", "식품", "스포츠"];

export default function RadarPage() {
  const { data: sales = [], isLoading } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<Platform[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  const filtered = useMemo(() => {
    let result = activeSales;

    if (statusFilter !== "all") {
      result = result.filter((s) => getSaleStatus(s) === statusFilter);
    }
    if (platformFilter.length > 0) {
      result = result.filter((s) => platformFilter.includes(s.platform as Platform));
    }
    if (categoryFilter.length > 0) {
      result = result.filter((s) =>
        s.category.some((c) => categoryFilter.some((f) => c.toLowerCase().includes(f.toLowerCase())))
      );
    }

    return sortByRanking(result);
  }, [activeSales, statusFilter, platformFilter, categoryFilter]);

  const hasFilter = statusFilter !== "all" || platformFilter.length > 0 || categoryFilter.length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setPlatformFilter([]);
    setCategoryFilter([]);
  };

  const togglePlatform = (p: Platform) => {
    setPlatformFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleCategory = (c: string) => {
    setCategoryFilter((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-8 pb-28 sm:pb-24 space-y-6">
      <PageMeta title="세일 레이더 - PickSale" description="상태별, 플랫폼별, 카테고리별로 전체 세일을 탐색하세요." />
      <CanonicalLink href={window.location.origin + "/radar"} />

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Radar className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-extrabold tracking-tight">세일 레이더</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-normal">전체 세일을 필터별로 탐색하세요</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        {/* Status */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">상태</span>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  statusFilter === opt.key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                    : "bg-card text-foreground/70 border-border font-medium hover:bg-accent hover:border-border/80"
                }`}
              >
                <span className="text-sm">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">플랫폼</span>
          <div className="flex gap-2 flex-wrap">
            {platforms.filter((p) => p !== "커뮤니티 핫딜").map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  platformFilter.includes(p)
                    ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                    : "bg-card text-foreground/70 border-border font-medium hover:bg-accent hover:border-border/80"
                }`}
              >
                <span className="text-sm">{platformEmojis[p]}</span>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">카테고리</span>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  categoryFilter.includes(c)
                    ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                    : "bg-card text-foreground/70 border-border font-medium hover:bg-accent hover:border-border/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Filter summary */}
        {hasFilter && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">{filtered.length}개 결과</span>
            <button
              onClick={clearFilters}
              className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium"
            >
              <X className="w-3 h-3" /> 초기화
            </button>
          </div>
        )}
      </div>

      {/* Event Radar */}
      <EventRadarSection />

      {/* Sale List */}
      {isLoading && !sales.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SaleCardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((sale, i) => (
            <SaleCard key={sale.id} sale={sale} rank={i + 1} onOpenDetail={setSelectedSale} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Search className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm mt-2">
            {hasFilter ? "필터 조건에 맞는 세일이 없습니다." : "진행 중인 세일이 없습니다."}
          </p>
        </div>
      )}

      <ExpandedSaleOverlay sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </div>
  );
}
