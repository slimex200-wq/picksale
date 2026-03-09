import { lazy, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSales } from "@/hooks/useSales";
import { getSaleStatus, platforms, platformSlugs } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import StatusExploration from "@/components/StatusExploration";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Radar } from "lucide-react";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

const SaleTimeline = lazy(() => import("@/components/SaleTimeline"));

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function RadarPage() {
  const { data: sales = [], isLoading } = useSales();

  const activeSales = useMemo(
    () => sales.filter((s) => getSaleStatus(s) !== "ended"),
    [sales]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 space-y-6">
      <PageMeta title="세일 레이더 - PickSale" description="상태별, 타임라인별, 플랫폼별로 세일을 탐색하세요." />
      <CanonicalLink href={window.location.origin + "/radar"} />

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Radar className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-foreground font-extrabold tracking-tight" style={{ fontSize: '28px' }}>세일 레이더</h1>
          <p className="text-xs text-muted-foreground mt-0.5">상태별 · 타임라인 · 플랫폼별 탐색</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* 1. Status Exploration */}
          <StatusExploration sales={activeSales} />

          {/* 2. Sale Timeline */}
          <Suspense fallback={<TimelineSkeleton />}>
            <SaleTimeline sales={sales} />
          </Suspense>

          {/* 3. Platform Exploration */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2">
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
                  <div className="w-9 h-9 rounded-lg bg-accent/60 border border-border/50 flex items-center justify-center p-1 shrink-0">
                    <img src={platformLogos[p]} alt={p} className="w-full h-full object-contain rounded" loading="lazy" />
                  </div>
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
