import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-moss/10 dark:bg-snow/10",
        className
      )}
      {...props}
    />
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-panel p-6 shadow-sm">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-36 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-panel overflow-hidden shadow-sm">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex space-x-4 border-b border-line pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 py-2 border-b border-line/40">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-panel p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="h-64 w-full flex items-end justify-between gap-2 pt-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-md"
            style={{ height: `${20 + (i * 12) % 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}
