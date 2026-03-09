import { Skeleton } from "@/components/ui/skeleton";

export function SaleCardCompactSkeleton() {
  return (
    <div className="w-full bg-card rounded-xl flex items-center gap-3 border border-border/60 overflow-hidden" style={{ padding: "10px 12px" }}>
      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-2.5 w-1/2 rounded" />
      </div>
      <Skeleton className="w-4 h-4 rounded shrink-0" />
    </div>
  );
}

export function SaleCardSkeleton() {
  return (
    <div className="w-full bg-card rounded-xl border border-border/60 overflow-hidden p-3 sm:p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3.5 w-12 rounded" />
      </div>
      <Skeleton className="h-4 w-4/5 rounded" />
      <Skeleton className="h-3.5 w-3/5 rounded" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-4.5 h-4.5 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg mt-auto" />
    </div>
  );
}

export function RankingItemSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card border border-border/50">
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
      <Skeleton className="h-3.5 flex-1 rounded" />
      <Skeleton className="h-4 w-8 rounded shrink-0" />
    </div>
  );
}

export function PlatformCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center gap-2.5">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-2.5 w-20 rounded" />
      </div>
    </div>
  );
}

export function CommunityPostSkeleton() {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl">
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      <div className="flex-1 min-w-0 space-y-1">
        <Skeleton className="h-2.5 w-12 rounded" />
        <Skeleton className="h-3.5 w-3/4 rounded" />
      </div>
      <Skeleton className="h-3 w-10 rounded shrink-0" />
    </div>
  );
}

export function HeroStatsSkeleton() {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
