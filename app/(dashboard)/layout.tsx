import { CRMAuthenticatedLayout } from '@/components/layout/crm-authenticated-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CRMAuthenticatedLayout>
      {children}
    </CRMAuthenticatedLayout>
  )
}
