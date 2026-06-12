import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-48" />
      <Skeleton className="mt-6 h-20 w-full rounded-[20px]" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-[20px]" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
