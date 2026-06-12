import Skeleton from '@/components/ui/Skeleton'

export default function FlashcardsLoading() {
  return (
    <div className="mx-auto max-w-xl">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-8 w-44" />
      <Skeleton className="mt-6 h-2 w-full rounded-full" />
      <Skeleton className="mt-5 h-72 w-full rounded-[24px] sm:h-80" />
      <div className="mt-6 flex justify-center gap-3">
        <Skeleton className="h-12 w-36 rounded-full" />
        <Skeleton className="h-12 w-28 rounded-full" />
      </div>
    </div>
  )
}
