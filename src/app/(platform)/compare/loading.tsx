// Skeleton shown while compare/page.tsx fetches listings in parallel.

export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8 md:px-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 animate-pulse rounded bg-[#1A1A24]" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[#1A1A24]" />
      </div>

      {/* Column header skeletons */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 600 }}>
          {/* Image row */}
          <div className="flex gap-4">
            <div className="w-44 shrink-0" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1">
                <div className="aspect-[4/3] animate-pulse rounded-xl bg-[#1A1A24]" />
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-[#1A1A24]" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#1A1A24]" />
                <div className="mt-3 h-7 w-1/3 animate-pulse rounded bg-[#1A1A24]" />
              </div>
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mt-4 flex gap-4 border-t border-[#1A1A24] pt-4">
              <div className="w-44 shrink-0">
                <div className="h-4 w-24 animate-pulse rounded bg-[#1A1A24]" />
              </div>
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex-1">
                  <div
                    className="h-4 animate-pulse rounded bg-[#1A1A24]"
                    style={{ width: `${55 + ((i + j) % 4) * 10}%` }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
