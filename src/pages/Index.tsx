import { useState, useMemo } from "react";
import { sortByRanking, Platform, getSaleStatus, saleStatusConfig } from "@/data/salesUtils";
import { useSales } from "@/hooks/useSales";
import PlatformFilter from "@/components/PlatformFilter";
import SaleCard from "@/components/SaleCard";
import SaleTimeline from "@/components/SaleTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Trophy } from "lucide-react";

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

    // 종료된 세일 제외, 랭킹순 정렬
    result = result.filter((s) => getSaleStatus(s) !== "ended");
    return sortByRanking(result);
  }, [selectedPlatforms, query, sales]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4">
      {/* Search */}
      <div className="relative">
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Trophy className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm mt-3">진행 중인 세일이 없습니다.</p>
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
            <span>🏆</span>
            세일 랭킹
            <span className="text-xs text-muted-foreground font-medium ml-1">
              {ranked.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ranked.map((sale, index) => (
              <SaleCard key={sale.id} sale={sale} rank={index + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
