import { useMemo, useState, useRef } from "react";
import { useSales } from "@/hooks/useSales";
import { Sale, getSaleStatus, sortByRanking, Platform, platforms, platformEmojis } from "@/data/salesUtils";
import { QUICK_FILTER_DEFS, matchesQuickFilter } from "@/data/quickFilterDefs";
import { FilterChip } from "@/components/QuickFilters";
import SaleCard from "@/components/SaleCard";
import ExpandedSaleOverlay from "@/components/ExpandedSaleOverlay";
import { EventRadarSection } from "@/components/event-radar";
import { SaleCardSkeleton } from "@/components/skeletons/SaleCardSkeleton";
import SearchSuggestions from "@/components/SearchSuggestions";
import { Input } from "@/components/ui/input";
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

export default function RadarPage() {
  const { data: sales = [], isLoading } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<Platform[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
        categoryFilter.some((filterKey) => matchesQuickFilter(s, filterKey))
      );
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
  }, [activeSales, statusFilter, platformFilter, categoryFilter, query]);

  const hasFilter = statusFilter !== "all" || platformFilter.length > 0 || categoryFilter.length > 0 || query.trim() !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setPlatformFilter([]);
    setCategoryFilter([]);
    setQuery("");
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

  const handleSearchSelect = (keyword: string) => {
    setQuery(keyword);
    setSearchFocused(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-28 sm:pb-24 space-y-3">
      <PageMeta title="세일 레이더 - PickSale" description="상태별, 플랫폼별, 카테고리별로 전체 세일을 탐색하세요." />
      <CanonicalLink href={window.location.origin + "/radar"} />

      {/* 1. Search bar */}
      <div className="relative w-full max-w-xl" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder="브랜드, 세일명, 플랫폼 검색"
          className="pl-9 rounded-xl bg-card border-border h-10"
        />
        {searchFocused && !query.trim() && <SearchSuggestions onSelect={handleSearchSelect} />}
      </div>

      {/* 2. Title + Status filters inline */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Radar className="w-5 h-5 text-primary" />
          <h1 className="text-lg sm:text-xl text-foreground font-extrabold tracking-tight">세일 레이더</h1>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.key}
              def={{ label: opt.label, emoji: opt.emoji }}
              isActive={statusFilter === opt.key}
              onClick={() => setStatusFilter(opt.key)}
            />
          ))}
        </div>
      </div>

      {/* 3. Category chips */}
      <div className="flex gap-1.5 flex-wrap">
        {QUICK_FILTER_DEFS.filter((f) => f.key !== null && f.key !== "ending_today").map((f) => (
          <FilterChip
            key={f.key!}
            def={f}
            isActive={categoryFilter.includes(f.key!)}
            onClick={() => toggleCategory(f.key!)}
          />
        ))}
      </div>

      {/* 4. Platform chips */}
      <div className="flex gap-1.5 flex-wrap">
        {platforms.filter((p) => p !== "커뮤니티 핫딜").map((p) => (
          <FilterChip
            key={p}
            def={{ label: p, emoji: platformEmojis[p] || "" }}
            isActive={platformFilter.includes(p)}
            onClick={() => togglePlatform(p)}
          />
        ))}
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
