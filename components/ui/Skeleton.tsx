'use client'

interface SkeletonProps {
  className?: string
}

/** Shimmer skeleton block — never a static gray box. */
export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`glass-card glass-card-static p-6 ${className}`}>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-5 h-9 w-28 rounded-full" />
    </div>
  )
}

export function SkeletonRow({ className = '' }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  )
}
