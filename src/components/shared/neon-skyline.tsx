import { cn } from '@/lib/utils'
import {
  SKYLINE_DETAILS,
  SKYLINE_SILHOUETTE,
  SKYLINE_VIEWBOX,
  SKYLINE_WINDOWS,
} from '@/components/shared/skyline-paths'

// ---------------------------------------------------------------------------
// NeonSkyline — TIGI's background motif: the outline of houses, apartment
// blocks and towers drawn in thin violet line, with two pulses of neon light
// tracing the skyline and a few windows glowing on and off. Same motif as the
// brand film and the pitch deck.
//
// Decorative only (aria-hidden). Animation lives in globals.css (.neon-sky)
// and stops under prefers-reduced-motion. Pass a unique `glowId` if two
// skylines ever share a page.
// ---------------------------------------------------------------------------

export function NeonSkyline({ className, glowId = 'neon-sky-glow' }: { className?: string; glowId?: string }) {
  return (
    <svg
      viewBox={SKYLINE_VIEWBOX}
      preserveAspectRatio="xMidYMax slice"
      className={cn('neon-sky pointer-events-none block', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={glowId} x="-2%" y="-20%" width="104%" height="140%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path className="neon-sky-detail" d={SKYLINE_DETAILS} />
      {SKYLINE_WINDOWS.map(([x, y, w, h], i) => (
        <rect
          key={i}
          className="neon-sky-window"
          style={{ animationDelay: `${((i * 1.37) % 9).toFixed(2)}s` }}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1.5}
        />
      ))}
      <path className="neon-sky-line" d={SKYLINE_SILHOUETTE} />
      <g filter={`url(#${glowId})`}>
        <path className="neon-sky-trace" pathLength={1} d={SKYLINE_SILHOUETTE} />
        <path className="neon-sky-trace neon-sky-trace--late" pathLength={1} d={SKYLINE_SILHOUETTE} />
        <path className="neon-sky-trace neon-sky-trace--head" pathLength={1} d={SKYLINE_SILHOUETTE} />
        <path className="neon-sky-trace neon-sky-trace--head neon-sky-trace--late" pathLength={1} d={SKYLINE_SILHOUETTE} />
      </g>
    </svg>
  )
}
