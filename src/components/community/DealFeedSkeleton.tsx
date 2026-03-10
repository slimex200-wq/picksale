import { Skeleton } from "@/components/ui/skeleton";

export function DealCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl px-5 sm:px-6 py-4 space-y-2.5">
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full rounded" />
      <Skeleton className="h-5 w-3/4 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function DealFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}
