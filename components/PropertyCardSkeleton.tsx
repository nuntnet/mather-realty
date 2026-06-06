import { cn } from '@/lib/utils'

interface PropertyCardSkeletonProps {
  view?: 'grid' | 'list'
  count?: number
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-gray-200', className)} />
}

export function PropertyCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  const isList = view === 'list'

  return (
    <article
      className={cn(
        'rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm',
        isList ? 'flex flex-row' : 'flex flex-col',
      )}
    >
      {/* Status bar */}
      <SkeletonBox className={cn('shrink-0', isList ? 'w-1 h-full' : 'h-1 w-full rounded-none')} />

      {/* Image */}
      <div
        className={cn(
          'relative bg-gray-200 animate-pulse shrink-0',
          isList ? 'w-64 min-h-[180px]' : 'w-full aspect-[4/3]',
        )}
      />

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-3/4" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>

        {/* Price */}
        <SkeletonBox className="h-7 w-36" />

        {/* Stats */}
        <div className="flex items-center gap-4">
          <SkeletonBox className="h-4 w-10" />
          <SkeletonBox className="h-4 w-10" />
          <SkeletonBox className="h-4 w-14" />
        </div>

        {/* Badges */}
        <div className="flex gap-1.5">
          <SkeletonBox className="h-6 w-16 rounded-full" />
          <SkeletonBox className="h-6 w-20 rounded-full" />
          <SkeletonBox className="h-6 w-12 rounded-full" />
        </div>

        {/* Button */}
        <SkeletonBox className="h-9 w-full mt-auto rounded-md" />
      </div>
    </article>
  )
}

export function PropertyCardSkeletonGrid({
  count = 6,
  view = 'grid',
}: PropertyCardSkeletonProps) {
  return (
    <div
      className={
        view === 'list'
          ? 'flex flex-col gap-4'
          : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} view={view} />
      ))}
    </div>
  )
}
