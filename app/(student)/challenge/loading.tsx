import Skeleton from '@/components/ui/Skeleton'

export default function ChallengeLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-52" />
      <Skeleton className="mt-2 h-4 w-72" />
      <Skeleton className="mt-6 h-72 w-full rounded-[20px]" />
      <Skeleton className="mt-8 h-6 w-32" />
      <div className="mt-3 space-y-3">
        <Skeleton className="h-[72px] w-full rounded-[20px]" />
        <Skeleton className="h-[72px] w-full rounded-[20px]" />
      </div>
    </div>
  )
}
