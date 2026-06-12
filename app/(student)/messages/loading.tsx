import Skeleton, { SkeletonRow } from '@/components/ui/Skeleton'

export default function MessagesLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-44" />
      <Skeleton className="mt-2 h-4 w-60" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card glass-card-static">
            <SkeletonRow />
          </div>
        ))}
      </div>
    </div>
  )
}
