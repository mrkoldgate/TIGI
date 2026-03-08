// ---------------------------------------------------------------------------
// Notification service — creates in-app notifications.
//
// Design principles:
//   • Fire-and-forget: createNotification() never throws. Notification failure
//     must never break the calling API route's main transaction.
//   • Atomic-optional: callers may pass a Prisma tx client to co-locate the
//     notification write inside an existing $transaction, or omit it for an
//     independent write.
//   • Channel-extensible: the channel field is stored at creation time.
//     Future email/push/SMS dispatch will be triggered here — most likely via
//     a background queue (e.g. BullMQ, Inngest) rather than inline await.
// ---------------------------------------------------------------------------

import type { Prisma, PrismaClient } from '@prisma/client'
import { prisma as globalPrisma } from '@/lib/db'
import type { NotificationType } from './notification-types'

export interface CreateNotificationInput {
  userId:     string
  type:       NotificationType
  title:      string
  body:       string
  actionUrl?: string
  metadata?:  Record<string, unknown>
}

type TxClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

/**
 * Creates an in-app notification for a user.
 *
 * Pass a Prisma transaction client (`tx`) to write atomically alongside
 * domain model changes. When `tx` is omitted, a top-level write is made.
 *
 * All errors are caught and logged — notification failure never propagates
 * to the caller.
 */
export async function createNotification(
  input: CreateNotificationInput,
  tx?: TxClient,
): Promise<void> {
  const client = (tx ?? globalPrisma) as unknown as {
    notification: { create: (args: { data: Prisma.NotificationCreateInput }) => Promise<unknown> }
  }

  try {
    await client.notification.create({
      data: {
        user:      { connect: { id: input.userId } },
        type:      input.type as never,
        title:     input.title,
        body:      input.body,
        actionUrl: input.actionUrl ?? null,
        metadata:  (input.metadata ?? {}) as Prisma.InputJsonValue,
        channel:   'IN_APP',
      },
    })
  } catch (err) {
    // Notification failure must never break the primary business operation.
    console.error('[notification-service] Failed to create notification', {
      type: input.type,
      userId: input.userId,
      err,
    })
  }
}
