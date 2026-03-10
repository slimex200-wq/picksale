import { Skeleton } from "@/components/ui/skeleton";

export function SaleCardCompactSkeleton() {
  return (
    <div className="w-full bg-card rounded-xl flex items-center gap-3 border border-border/60 overflow-hidden" style={{ padding: "10px 12px", borderRadius: 12 }}>
      <Skeleton className="w-10 h-10 rounded-[22%] shrink-0" />
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
    <div className="w-full bg-card overflow-hidden flex flex-col gap-2" style={{ borderRadius: 12, border: "1px solid #eaecf0", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <Skeleton className="w-full h-32 rounded-none" />
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-12 rounded" />
        </div>
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-3.5 w-3/5 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-[22%]" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg mt-auto" />
      </div>
    </div>
  );
}

export function EditorialCardSkeleton() {
  return (
    <div className="w-full bg-card overflow-hidden flex flex-col" style={{ borderRadius: 12, border: "1px solid #eaecf0", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", minHeight: 280 }}>
      <Skeleton className="w-full h-28 rounded-none" />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-[22%]" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-12 rounded" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-4 w-3/5 rounded" />
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function RankingItemSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50">
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      <Skeleton className="w-10 h-10 rounded-[22%] shrink-0" />
      <Skeleton className="h-3.5 flex-1 rounded" />
      <Skeleton className="h-4 w-10 rounded shrink-0" />
    </div>
  );
}

export function PlatformCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-3" style={{ minWidth: 170 }}>
      <Skeleton className="w-11 h-11 rounded-[22%] shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-2.5 w-20 rounded" />
      </div>
      <Skeleton className="w-4 h-4 rounded shrink-0" />
    </div>
  );
}

export function CommunityPostSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-xl">
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      <Skeleton className="w-10 h-10 rounded-md shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
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

/** Radar page: status exploration skeleton */
export function StatusExplorationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <RankingItemSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Radar page: timeline skeleton */
export function TimelineSkeletonFull() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="h-5 w-32 rounded" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
            <Skeleton className="w-9 h-9 rounded-[22%] shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-10 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Radar page: platform grid skeleton */
export function PlatformGridSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-28 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-[22%] shrink-0" />
            <Skeleton className="h-3.5 flex-1 rounded" />
            <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Calendar page skeleton */
export function CalendarSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
      <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 rounded mx-auto w-6" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
