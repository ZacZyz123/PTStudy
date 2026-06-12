import Skeleton from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <div>
      <Skeleton className="h-36 w-full rounded-[20px]" />
      <Skeleton className="mt-4 h-20 w-full rounded-[20px]" />
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-[20px]" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
