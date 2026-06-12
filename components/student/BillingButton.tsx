'use client'

import { useState } from 'react'
import { IconCreditCard } from '@tabler/icons-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function BillingButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const openPortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data: { url?: string; error?: string } = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? 'Could not open billing portal')
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Billing portal unavailable', 'error')
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={openPortal}>
      <IconCreditCard size={16} />
      Manage subscription
    </Button>
  )
}
