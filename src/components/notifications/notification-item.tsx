'use client'

// ---------------------------------------------------------------------------
// NotificationItem — single notification row.
//
// Used in both the dropdown (compact) and the full /notifications page.
//
// Props:
//   notification — the notification record
//   onRead       — called with id when user clicks (triggers mark-read + nav)
//   compact      — reduces padding/font sizes for dropdown usage
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
  type,
  config,
  size = 'md',
}: {
  type: NotificationType
  config: NotificationTypeConfig
  size?: 'sm' | 'md'
}) {
  const Icon = ICON_MAP[config.iconName] ?? Bell
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const wrapSize = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'

  return (
    <div className={cn(
      'flex shrink-0 items-center justify-center rounded-xl border',
      wrapSize, config.bgColor, config.borderColor,
    )}>
      <Icon className={cn(iconSize, config.color)} />
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
        'group flex w-full items-start gap-3 text-left transition-colors',
        compact ? 'px-4 py-3' : 'rounded-xl border px-4 py-3.5',
        isUnread
          ? compact
            ? 'bg-[#1A1A28] hover:bg-[#1E1E30]'
            : 'border-white/[0.08] bg-[#1A1A28] hover:bg-[#1E1E30]'
          : compact
            ? 'hover:bg-white/[0.04] backdrop-blur-xl'
            : 'border-[#1F1F2E] bg-white/[0.04] backdrop-blur-xl hover:bg-[#141420]',
      )}
    >
      {/* Icon */}
      <NotificationIcon type={notification.type} config={config} size={compact ? 'sm' : 'md'} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'font-medium leading-tight text-[#F5F5F7]',
            compact ? 'text-xs' : 'text-sm',
          )}>
            {notification.title}
          </p>
          <span className={cn(
            'shrink-0 tabular-nums text-[#6B6B80]',
            compact ? 'text-[10px]' : 'text-xs',
          )}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className={cn(
          'mt-0.5 leading-relaxed text-[#8080A0]',
          compact ? 'line-clamp-2 text-[11px]' : 'line-clamp-3 text-xs',
        )}>
          {notification.body}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A84C]" aria-label="Unread" />
      )}
    </button>
  )
}
