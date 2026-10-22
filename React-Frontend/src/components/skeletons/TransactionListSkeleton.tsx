import { Skeleton } from '../ui';

export function TransactionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border" aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" /> {/* type icon */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />           {/* description */}
              <Skeleton className="h-3 w-20" />           {/* date */}
            </div>
          </div>
          <Skeleton className="h-4 w-16" />               {/* amount */}
        </li>
      ))}
    </ul>
  );
}