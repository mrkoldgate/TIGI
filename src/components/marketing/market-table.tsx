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

type Region = 'Africa' | 'United States'
type Kind = 'Home' | 'Apartments'

interface Row {
  code: string
  name: string
  place: string
  region: Region
  kind: Kind
  photo: PhotoKey
  pricePerShare: number
  change12m: number
  estYield: number
  funded: number
  series: number[]
}

// Sample listings in TIGI Shares' planned markets: Kenya (regulator sandbox),
// Rwanda (showcase) and the US pilot. Not live offerings.
const ROWS: Row[] = [
  { code: 'TG-KE01', name: 'Westlands Residences', place: 'Nairobi, Kenya', region: 'Africa', kind: 'Apartments', photo: 'nairobiSkyline', pricePerShare: 100, change12m: 7.2, estYield: 8.4, funded: 46, series: [30, 31, 33, 32, 34, 36, 35, 38, 39, 41, 42, 44] },
  { code: 'TG-RW01', name: 'Kiyovu Terraces', place: 'Kigali, Rwanda', region: 'Africa', kind: 'Home', photo: 'kigaliHomes', pricePerShare: 100, change12m: 5.6, estYield: 7.1, funded: 28, series: [40, 41, 41, 43, 42, 44, 45, 45, 47, 48, 48, 50] },
  { code: 'TG-RW02', name: 'Nyarutarama Heights', place: 'Kigali, Rwanda', region: 'Africa', kind: 'Apartments', photo: 'kigaliSunset', pricePerShare: 120, change12m: 4.3, estYield: 7.6, funded: 63, series: [35, 36, 35, 37, 38, 37, 39, 40, 39, 41, 42, 42] },
  { code: 'TG-US01', name: 'Blue Hour Residences', place: 'Brooklyn · US pilot', region: 'United States', kind: 'Apartments', photo: 'apartmentsBlueHour', pricePerShare: 210, change12m: -1.4, estYield: 5.9, funded: 78, series: [50, 51, 50, 49, 50, 48, 49, 47, 48, 47, 48, 49] },
  { code: 'TG-US02', name: 'Lamplight House', place: 'Houston · US pilot', region: 'United States', kind: 'Home', photo: 'houseDusk', pricePerShare: 150, change12m: 2.2, estYield: 5.4, funded: 22, series: [44, 45, 44, 46, 45, 46, 47, 46, 47, 48, 47, 48] },
]

const FILTERS: Array<'All' | Region> = ['All', 'Africa', 'United States']

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
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="spark overflow-visible">
      <polyline points={pts} pathLength={1} fill="none" stroke={up ? '#34D399' : '#F87171'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${up ? 'rgba(52,211,153,0.7)' : 'rgba(248,113,113,0.7)'})` }} />
    </svg>
  )
}

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

export function MarketTable() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const rows = filter === 'All' ? ROWS : ROWS.filter((r) => r.region === filter)

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
              'rounded-full px-4 py-2 text-sm transition-all duration-300',
              filter === f
                ? 'bg-[#F5F5F7] text-[#000000] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'
                : 'glass text-[#C3C3CC] hover:text-[#F5F5F7] hover:bg-[rgba(39,39,53,0.8)]'
            )}
          >
            {f === 'All' ? 'All markets' : f}
          </button>
        ))}
      </div>

      <div className="tray shadow-[0_40px_140px_-50px_rgba(110,91,243,0.6)]" data-reveal="up"><div className="cell overflow-hidden !p-0">
        {/* Header row */}
        <div className="hidden grid-cols-[minmax(0,2.4fr)_1fr_1fr_1.1fr_0.9fr_1fr_auto] items-center gap-6 border-b border-[rgba(255,255,255,0.07)] px-6 py-3 md:grid">
          {['Property', 'Price / share', '12-mo value', 'Trend', 'Est. yield', 'Funded', ''].map((h) => (
            <span key={h} className="text-label">{h}</span>
          ))}
        </div>

        <ul>
          {rows.map((r) => {
            const up = r.change12m >= 0
            return (
              <li key={r.code} className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
                <Link
                  href="/marketplace"
                  data-glow
                  className="row-glow group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 transition-colors duration-300 hover:bg-[#100e1c] before:absolute before:inset-y-3 before:left-0 before:w-[2px] before:rounded-full before:bg-violet-400 before:opacity-0 before:shadow-[0_0_12px_rgba(167,139,250,1)] before:transition-opacity hover:before:opacity-100 md:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1.1fr_0.9fr_1fr_auto] md:gap-6 md:px-6"
                >
                  {/* Property */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="plate h-12 w-16 flex-shrink-0 rounded-md">
                      <Image src={photoUrl(r.photo, 320, 70)} alt={PHOTOS[r.photo].alt} fill sizes="64px" className="zoom-img object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-[#F5F5F7]">{r.name}</p>
                      <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[#8E8E9C]">
                        {r.code} · {r.place}
                      </p>
                    </div>
                  </div>

                  {/* Mobile summary */}
                  <div className="text-right md:hidden">
                    <p className="font-mono text-sm tabular-nums text-[#F5F5F7]">{usd(r.pricePerShare)}</p>
                    <p className={cn('font-mono text-xs tabular-nums', up ? 'text-[#34D399]' : 'text-[#F87171]')}>
                      {up ? '+' : ''}{r.change12m.toFixed(1)}%
                    </p>
                  </div>

                  <span className="hidden font-mono text-sm tabular-nums text-[#F5F5F7] md:block">{usd(r.pricePerShare)}</span>
                  <span className={cn('hidden font-mono text-sm tabular-nums md:block', up ? 'text-[#34D399]' : 'text-[#F87171]')}>
                    {up ? '+' : ''}{r.change12m.toFixed(1)}%
                  </span>
                  <span className="hidden md:block"><Sparkline series={r.series} up={up} /></span>
                  <span className="hidden font-mono text-sm tabular-nums text-[#C3C3CC] md:block">{r.estYield.toFixed(1)}%</span>
                  <span className="hidden md:block">
                    <span className="flex items-center gap-3">
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-[#1C1C25]">
                        <span className="block h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300 shadow-[0_0_8px_rgba(167,139,250,0.8)]" style={{ width: `${r.funded}%` }} />
                      </span>
                      <span className="font-mono text-xs tabular-nums text-[#8E8E9C]">{r.funded}%</span>
                    </span>
                  </span>
                  <span className="hidden items-center gap-1 text-sm text-[#C3C3CC] transition-colors group-hover:text-violet-100 md:flex">
                    View <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div></div>
    </div>
  )
}
