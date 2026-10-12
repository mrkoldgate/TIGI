import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#000000]">
      {/* Ambient light — two soft fields that drift slowly behind the glass surfaces */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="animate-float-slow absolute -left-60 top-[18%] h-[720px] w-[720px] rounded-full bg-cyan-500/[0.06] blur-[200px]" />
        <div className="animate-float absolute -right-48 top-[55%] h-[600px] w-[600px] rounded-full bg-indigo-500/[0.07] blur-[180px]" />
      </div>
      <MarketingNav />
      <main className="relative z-[1] flex-1">{children}</main>
      <div className="relative z-[1]">
        <MarketingFooter />
      </div>
    </div>
  )
}
