import Link from 'next/link'
import { IconUpload } from '@tabler/icons-react'
import ContentTable from '@/components/admin/ContentTable'
import Button from '@/components/ui/Button'
import { createAdminClient } from '@/lib/supabase/server'
import type { Content } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const admin = createAdminClient()
  const { data } = await admin.from('content').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Publish lectures to make them visible to students.
          </p>
        </div>
        <Link href="/admin/upload">
          <Button size="sm">
            <IconUpload size={16} /> Upload
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        <ContentTable contents={(data as Content[]) ?? []} />
      </div>
    </div>
  )
}
