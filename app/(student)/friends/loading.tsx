import Skeleton, { SkeletonRow } from '@/components/ui/Skeleton'

export default function FriendsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <Skeleton className="mt-6 h-12 w-full rounded-xl" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card glass-card-static">
            <SkeletonRow />
          </div>
        ))}
      </div>
    </div>
  )
}
