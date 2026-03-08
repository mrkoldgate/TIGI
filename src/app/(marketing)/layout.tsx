import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0F]">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
