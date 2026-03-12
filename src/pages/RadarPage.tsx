import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSales } from "@/hooks/useSales";
import { Sale, getSaleStatus, platforms, platformSlugs } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import StatusExploration from "@/components/StatusExploration";
import ExpandedSaleOverlay from "@/components/ExpandedSaleOverlay";
import {
  StatusExplorationSkeleton,
  TimelineSkeletonFull,
  PlatformGridSkeleton,
} from "@/components/skeletons/SaleCardSkeleton";
import { ChevronRight, Radar } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

const SaleTimeline = lazy(() => import("@/components/SaleTimeline"));


export default function RadarPage() {
  const { data: sales = [], isLoading } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-8 pb-28 sm:pb-24 space-y-6">
      <PageMeta title="세일 레이더 - PickSale" description="상태별, 타임라인별, 플랫폼별로 세일을 탐색하세요." />
      <CanonicalLink href={window.location.origin + "/radar"} />

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Radar className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-extrabold tracking-tight">세일 레이더</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-normal">상태별 · 타임라인 · 플랫폼별 탐색</p>
        </div>
      </div>

      {isLoading && !sales.length ? (
        <div className="space-y-6">
          <StatusExplorationSkeleton />
          <TimelineSkeletonFull />
          <PlatformGridSkeleton />
        </div>
      ) : (
        <>
          {/* 1. Status Exploration */}
          <StatusExploration sales={activeSales} onOpenDetail={setSelectedSale} />

          {/* 2. Sale Timeline */}
          <Suspense fallback={<TimelineSkeletonFull />}>
            <SaleTimeline sales={sales} onOpenDetail={setSelectedSale} />
          </Suspense>

          {/* 3. Platform Exploration */}
          <PlatformExplorer sales={sales} />
        </>
      )}

      <ExpandedSaleOverlay sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </div>
  );
}
