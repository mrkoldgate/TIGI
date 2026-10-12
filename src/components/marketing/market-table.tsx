'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { photoUrl, PHOTOS, type PhotoKey } from '@/lib/photography'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// MarketTable — a property market laid out like an asset table
// (pattern from Coinbase "Explore" / Robinhood lists: filter chips, name +
// ticker, price, change, sparkline, one action per row).
// All rows are SAMPLE data and are labelled as such on the page.
// ---------------------------------------------------------------------------

type Kind = 'Home' | 'Apartments' | 'Land'

interface Row {
  code: string
  name: string
  place: string
  kind: Kind
  photo: PhotoKey
  pricePerShare: number
  change12m: number
  estYield: number
  funded: number
  series: number[]
}

const ROWS: Row[] = [
  { code: 'TG-001', name: 'Reflecting Pool House', place: 'Scottsdale, AZ', kind: 'Home', photo: 'heroHouse', pricePerShare: 485, change12m: 6.4, estYield: 5.8, funded: 34, series: [40, 42, 41, 44, 46, 45, 48, 50, 49, 52, 54, 56] },
  { code: 'TG-002', name: 'Harbour Lofts', place: 'Montréal, QC', kind: 'Apartments', photo: 'apartmentsPink', pricePerShare: 120, change12m: 3.1, estYield: 6.9, funded: 61, series: [30, 31, 31, 32, 31, 33, 33, 34, 35, 34, 35, 36] },
  { code: 'TG-003', name: 'Sonoran Ridge Parcel', place: 'Cave Creek, AZ', kind: 'Land', photo: 'desertCabin', pricePerShare: 250, change12m: 9.2, estYield: 3.2, funded: 12, series: [20, 21, 23, 22, 24, 26, 25, 28, 29, 31, 32, 34] },
  { code: 'TG-004', name: 'Blue Hour Residences', place: 'Brooklyn, NY', kind: 'Apartments', photo: 'apartmentsBlueHour', pricePerShare: 210, change12m: -1.4, estYield: 7.4, funded: 78, series: [50, 51, 50, 49, 50, 48, 49, 47, 48, 47, 48, 49] },
  { code: 'TG-005', name: 'Prairie Row Farmland', place: 'Ames, IA', kind: 'Land', photo: 'fieldsAerial', pricePerShare: 95, change12m: 4.8, estYield: 4.1, funded: 45, series: [30, 30, 31, 32, 32, 33, 33, 34, 35, 35, 36, 37] },
  { code: 'TG-006', name: 'Lamplight House', place: 'Austin, TX', kind: 'Home', photo: 'houseDusk', pricePerShare: 330, change12m: 2.2, estYield: 5.1, funded: 22, series: [44, 45, 44, 46, 45, 46, 47, 46, 47, 48, 47, 48] },
]

const FILTERS: Array<'All' | Kind> = ['All', 'Home', 'Apartments', 'Land']

function Sparkline({ series, up }: { series: number[]; up: boolean }) {
  const w = 96
  const h = 28
  const min = Math.min(...series)
  const max = Math.max(...series)
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? '#7FD1A8' : '#F08A80'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

export function MarketTable() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const rows = filter === 'All' ? ROWS : ROWS.filter((r) => r.kind === filter)

  return (
    <div>
      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter sample listings">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition-colors',
              filter === f
                ? 'bg-[#EDEDF3] text-[#171721]'
                : 'bg-[#1E1E2A] text-[#C3C3CC] hover:bg-[#272735]'
            )}
          >
            {f === 'All' ? 'All assets' : f === 'Home' ? 'Homes' : f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-[#1E1E2A]">
        {/* Header row */}
        <div className="hidden grid-cols-[minmax(0,2.4fr)_1fr_1fr_1.1fr_0.9fr_1fr_auto] items-center gap-6 border-b border-[rgba(237,237,243,0.07)] px-6 py-3 md:grid">
          {['Property', 'Price / share', '12-mo value', 'Trend', 'Est. yield', 'Funded', ''].map((h) => (
            <span key={h} className="text-label">{h}</span>
          ))}
        </div>

        <ul>
          {rows.map((r) => {
            const up = r.change12m >= 0
            return (
              <li key={r.code} className="border-b border-[rgba(237,237,243,0.06)] last:border-b-0">
                <Link
                  href="/marketplace"
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-[#232331] md:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1.1fr_0.9fr_1fr_auto] md:gap-6 md:px-6"
                >
                  {/* Property */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="plate h-12 w-16 flex-shrink-0">
                      <Image src={photoUrl(r.photo, 320, 70)} alt={PHOTOS[r.photo].alt} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-[#EDEDF3]">{r.name}</p>
                      <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[#8E8E9C]">
                        {r.code} · {r.kind} · {r.place}
                      </p>
                    </div>
                  </div>

                  {/* Mobile summary */}
                  <div className="text-right md:hidden">
                    <p className="font-mono text-sm tabular-nums text-[#EDEDF3]">{usd(r.pricePerShare)}</p>
                    <p className={cn('font-mono text-xs tabular-nums', up ? 'text-[#7FD1A8]' : 'text-[#F08A80]')}>
                      {up ? '+' : ''}{r.change12m.toFixed(1)}%
                    </p>
                  </div>

                  <span className="hidden font-mono text-sm tabular-nums text-[#EDEDF3] md:block">{usd(r.pricePerShare)}</span>
                  <span className={cn('hidden font-mono text-sm tabular-nums md:block', up ? 'text-[#7FD1A8]' : 'text-[#F08A80]')}>
                    {up ? '+' : ''}{r.change12m.toFixed(1)}%
                  </span>
                  <span className="hidden md:block"><Sparkline series={r.series} up={up} /></span>
                  <span className="hidden font-mono text-sm tabular-nums text-[#C3C3CC] md:block">{r.estYield.toFixed(1)}%</span>
                  <span className="hidden md:block">
                    <span className="flex items-center gap-3">
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-[#2E2E3D]">
                        <span className="block h-full rounded-full bg-[#C3C3CC]" style={{ width: `${r.funded}%` }} />
                      </span>
                      <span className="font-mono text-xs tabular-nums text-[#8E8E9C]">{r.funded}%</span>
                    </span>
                  </span>
                  <span className="hidden items-center gap-1 text-sm text-[#C3C3CC] md:flex">
                    View <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
