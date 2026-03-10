export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="h-3 w-24 animate-pulse rounded bg-[#1A1A24]" />
        <div className="mt-2 h-7 w-52 animate-pulse rounded bg-[#1A1A24]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[#1A1A24]" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[#1E1E2A] bg-[#111118] p-4">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-[#1A1A24]" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded bg-[#1A1A24]" />
            <div className="mt-1 h-3 w-24 animate-pulse rounded bg-[#1A1A24]" />
          </div>
        ))}
      </div>

      {/* Two-col rows */}
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((col) => (
            <div key={col} className="rounded-xl border border-[#1E1E2A] bg-[#111118] p-5">
              <div className="mb-4 h-3 w-32 animate-pulse rounded bg-[#1A1A24]" />
              <div className="space-y-4">
                {[0, 1, 2, 3].map((bar) => (
                  <div key={bar}>
                    <div className="mb-1 flex justify-between">
                      <div className="h-3 w-28 animate-pulse rounded bg-[#1A1A24]" />
                      <div className="h-3 w-12 animate-pulse rounded bg-[#1A1A24]" />
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#1A1A24]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
