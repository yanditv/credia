import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circle';
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse bg-slate-800/60',
        variant === 'circle' ? 'rounded-full' : 'rounded-md',
        variant === 'text' && 'h-4',
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full">
        <thead className="bg-slate-900/60">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div
      className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
      style={{ minHeight: height }}
    >
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-7 w-24" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}
