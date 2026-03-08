import { useState, useMemo } from "react";
import { mockSales, categorizeSales, Platform } from "@/data/mockSales";
import PlatformFilter from "@/components/PlatformFilter";
import SaleSection from "@/components/SaleSection";

export default function Index() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  const filtered = useMemo(() => {
    if (selectedPlatforms.length === 0) return mockSales;
    return mockSales.filter((s) => selectedPlatforms.includes(s.platform));
  }, [selectedPlatforms]);

  const { startsToday, ongoing, endingSoon } = useMemo(
    () => categorizeSales(filtered),
    [filtered]
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* Filter */}
      <PlatformFilter
        selected={selectedPlatforms}
        onChange={setSelectedPlatforms}
      />

      {/* Sections */}
      <SaleSection title="오늘 시작" emoji="🔥" sales={startsToday} />
      <SaleSection title="진행중 세일" emoji="🛍️" sales={ongoing} />
      <SaleSection title="곧 종료" emoji="⏰" sales={endingSoon} />

      {startsToday.length === 0 && ongoing.length === 0 && endingSoon.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">선택한 플랫폼에 해당하는 세일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
