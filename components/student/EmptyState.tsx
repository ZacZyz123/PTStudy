'use client'

import Flex from '@/components/mascot/Flex'

/** Empty state — sleeping Flex with a custom message. */
export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <Flex mood="sleeping" size={120} />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  )
}
