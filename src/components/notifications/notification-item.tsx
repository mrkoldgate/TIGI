'use client'

// ---------------------------------------------------------------------------
// NotificationItem — single notification row.
//
// TIGI Hyper-Glass v3 — Novu/Wope sharp contrast:
//   UNREAD: Elevated glass plate with cyan left accent, brighter bg, neon
//           unread dot with ping animation, white title text, visible body
//   READ:   Receded glass — near-invisible border, dimmed bg, muted text,
//           no accent, no glow. Maximum contrast between states.
//
// Used in both the dropdown (compact) and the full /notifications page.
// ---------------------------------------------------------------------------

import { useRouter } from 'next/navigation'
import {
  CheckCircle2, XCircle, AlertCircle,
  ShieldCheck, ShieldX, ShieldAlert,
  TrendingUp, MapPin, Landmark, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationType, NotificationTypeConfig } from '@/lib/notifications/notification-types'
import { NOTIFICATION_TYPE_CONFIG } from '@/lib/notifications/notification-types'
import type { NotificationRecord } from '@/lib/notifications/notification-query'

// ── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  CheckCircle2: CheckCircle2,
  XCircle:      XCircle,
  AlertCircle:  AlertCircle,
  ShieldCheck:  ShieldCheck,
  ShieldX:      ShieldX,
  ShieldAlert:  ShieldAlert,
  TrendingUp:   TrendingUp,
  MapPin:       MapPin,
  Landmark:     Landmark,
  Bell:         Bell,
}

function NotificationIcon({
  config,
  size = 'md',
  isUnread,
}: {
  config: NotificationTypeConfig
  size?: 'sm' | 'md'
  isUnread: boolean
}) {
  const Icon = ICON_MAP[config.iconName] ?? Bell
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
  const wrapSize = size === 'sm' ? 'h-7 w-7' : 'h-10 w-10'

  return (
    <div className={cn(
      'relative flex shrink-0 items-center justify-center rounded-xl border backdrop-blur-xl transition-all duration-300',
      wrapSize,
      isUnread
        ? cn(config.bgColor, config.borderColor, 'shadow-[inset_0_0_12px_rgba(255,255,255,0.06)]')
        : 'bg-white/[0.02] border-white/[0.04] shadow-none',
    )}>
      {/* Neon glow behind icon — only for unread */}
      {isUnread && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl blur-[8px] opacity-40"
          style={{ backgroundColor: config.glowColor }}
          aria-hidden="true"
        />
      )}
      <Icon
        className={cn(
          'relative transition-colors duration-300',
          iconSize,
          isUnread ? config.color : 'text-zinc-600',
        )}
        style={isUnread ? { filter: `drop-shadow(0 0 8px ${config.glowColor})` } : undefined}
      />
    </div>
  )
}

// ── Time formatting ───────────────────────────────────────────────────────────

function timeAgo(date: Date | string): string {
  const d     = typeof date === 'string' ? new Date(date) : date
  const delta = Math.floor((Date.now() - d.getTime()) / 1000)

  if (delta < 60)   return 'just now'
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`
  if (delta < 604800) return `${Math.floor(delta / 86400)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Main component ────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: NotificationRecord
  onRead:       (id: string) => void
  compact?:     boolean
}

export function NotificationItem({ notification, onRead, compact = false }: NotificationItemProps) {
  const router  = useRouter()
  const config  = NOTIFICATION_TYPE_CONFIG[notification.type] ?? NOTIFICATION_TYPE_CONFIG.SYSTEM_ANNOUNCEMENT
  const isUnread = !notification.readAt

  const handleClick = () => {
    onRead(notification.id)
    const dest = notification.actionUrl ?? config.defaultActionUrl
    if (dest) router.push(dest)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative flex w-full items-start gap-3 text-left transition-all duration-300',
        compact ? 'px-4 py-3' : 'rounded-xl px-4 py-3.5',

        // ── UNREAD: elevated, glowing, sharp presence ──
        isUnread && !compact &&
          'border border-white/[0.08] border-l-[2px] border-l-cyan-400/60 bg-white/[0.04] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_20px_rgba(34,211,238,0.02),0_2px_16px_rgba(0,0,0,0.2)] hover:bg-white/[0.06] hover:border-l-cyan-400/80 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_24px_rgba(34,211,238,0.03),0_4px_24px_rgba(0,0,0,0.25)]',
        isUnread && compact &&
          'bg-white/[0.04] hover:bg-white/[0.06]',

        // ── READ: receded, dim, near-invisible ──
        !isUnread && !compact &&
          'border border-white/[0.03] bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.03] hover:border-white/[0.05]',
        !isUnread && compact &&
          'hover:bg-white/[0.03]',
      )}
    >
      {/* Icon */}
      <NotificationIcon config={config} size={compact ? 'sm' : 'md'} isUnread={isUnread} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'font-medium leading-tight transition-colors duration-300',
            compact ? 'text-xs' : 'text-sm',
            isUnread ? 'text-white' : 'text-zinc-500',
          )}>
            {notification.title}
          </p>
          <span className={cn(
            'shrink-0 tabular-nums transition-colors duration-300',
            compact ? 'text-[10px]' : 'text-xs',
            isUnread ? 'text-zinc-500' : 'text-zinc-700',
          )}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className={cn(
          'mt-0.5 leading-relaxed transition-colors duration-300',
          compact ? 'line-clamp-2 text-[11px]' : 'line-clamp-3 text-xs',
          isUnread ? 'text-zinc-400' : 'text-zinc-600',
        )}>
          {notification.body}
        </p>
      </div>

      {/* Unread dot — Novu/Wope neon glow indicator */}
      {isUnread && (
        <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0" aria-label="Unread">
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-30" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6),0_0_16px_rgba(34,211,238,0.3)]" />
        </span>
      )}
    </button>
  )
}
