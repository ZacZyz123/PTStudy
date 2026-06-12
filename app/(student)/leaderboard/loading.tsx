import Skeleton, { SkeletonRow } from '@/components/ui/Skeleton'

export default function LeaderboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card glass-card-static">
            <SkeletonRow />
          </div>
        ))}
      </div>
    </div>
  )
}
