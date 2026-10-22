import { Skeleton } from '../ui';

export function BalanceCardSkeleton() {
  return (
    <div className="rounded-md border border-border bg-surface p-6" aria-busy="true" aria-label="Loading balance">
      <Skeleton className="h-4 w-28" />      {/* "Current balance" label */}
      <Skeleton className="mt-3 h-9 w-48" /> {/* balance amount */}
      <Skeleton className="mt-3 h-3 w-36" /> {/* account number */}
    </div>
  );
}