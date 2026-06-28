export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-2xl bg-tg-secondary-bg p-4">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="rounded-2xl bg-tg-secondary-bg p-4">
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="rounded-2xl bg-tg-secondary-bg p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
