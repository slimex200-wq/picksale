import { useState, useMemo } from "react";
import { categorizeSales, Platform } from "@/data/salesUtils";
import { useSales } from "@/hooks/useSales";
import PlatformFilter from "@/components/PlatformFilter";
import SaleSection from "@/components/SaleSection";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const { data: sales = [], isLoading } = useSales();

  const filtered = useMemo(() => {
    if (selectedPlatforms.length === 0) return sales;
    return sales.filter((s) => selectedPlatforms.includes(s.platform));
  }, [selectedPlatforms, sales]);

  const { startsToday, ongoing, endingSoon } = useMemo(
    () => categorizeSales(filtered),
    [filtered]
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-6">
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
              <p className="text-sm">등록된 세일이 없습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
