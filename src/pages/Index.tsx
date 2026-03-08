import { useState, useMemo } from "react";
import { categorizeSales, Platform } from "@/data/salesUtils";
import { useSales } from "@/hooks/useSales";
import PlatformFilter from "@/components/PlatformFilter";
import SaleSection from "@/components/SaleSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Index() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [query, setQuery] = useState("");
  const { data: sales = [], isLoading } = useSales();

  const filtered = useMemo(() => {
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

    return result;
  }, [selectedPlatforms, query, sales]);

  const { startsToday, ongoing, endingSoon } = useMemo(
    () => categorizeSales(filtered),
    [filtered]
  );

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
      ) : (
        <>
          <SaleSection title="오늘 시작" emoji="🔥" sales={startsToday} />
          <SaleSection title="진행중 세일" emoji="🛍️" sales={ongoing} />
          <SaleSection title="곧 종료" emoji="⏰" sales={endingSoon} />

          {startsToday.length === 0 && ongoing.length === 0 && endingSoon.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
