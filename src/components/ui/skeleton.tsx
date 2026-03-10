import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-skeleton-base skeleton-shimmer", className)}
      {...props}
    />
  );
}

export { Skeleton };
