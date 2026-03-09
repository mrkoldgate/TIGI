// ---------------------------------------------------------------------------
// logger.ts — Structured logging abstraction for TIGI.
//
// Usage:
//   import { logger } from '@/lib/logger'
//   logger.info('User created', { userId: 'abc123', role: 'INVESTOR' })
//   logger.error('Stripe webhook failed', { event: 'checkout.session.completed', err })
//
// Behaviour:
//   - Development: pretty-printed lines with timestamp prefix and colour cues
//   - Production:  single-line JSON per record (stdout) — ingest with Logtail,
//     Axiom, Datadog, or any log drain that accepts newline-delimited JSON
//
// Extending to an external provider:
//   Swap the emit() function below to forward records to your provider SDK.
//   The rest of the callsites don't change.
//
// Log level:
//   Controlled via LOG_LEVEL env var (debug | info | warn | error).
//   Defaults to 'debug' in development, 'info' in production.
// ---------------------------------------------------------------------------

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

// ── Level ordering ──────────────────────────────────────────────────────────

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
}

function minLevel(): LogLevel {
  const env = process.env.LOG_LEVEL as LogLevel | undefined
  if (env && env in LEVEL_RANK) return env
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

// ── Formatting ──────────────────────────────────────────────────────────────

function buildRecord(
  level: LogLevel,
  message: string,
  context?: LogContext,
): Record<string, unknown> {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ...(context ?? {}),
  }
}

function prettyLine(record: Record<string, unknown>): string {
  const { level, message, timestamp, env: _env, ...rest } = record
  const ts   = String(timestamp).split('T')[1]?.slice(0, 12) ?? ''
  const lbl  = String(level).toUpperCase().padEnd(5)
  const ctx  = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : ''
  return `${ts} [${lbl}] ${String(message)}${ctx}`
}

// ── Emission ────────────────────────────────────────────────────────────────
// Replace this function to forward to an external provider (Sentry, Axiom…).

function emit(level: LogLevel, record: Record<string, unknown>): void {
  const output =
    process.env.NODE_ENV === 'production'
      ? JSON.stringify(record)
      : prettyLine(record)

  switch (level) {
    case 'error': console.error(output); break
    case 'warn':  console.warn(output);  break
    case 'debug': console.debug(output); break
    default:      console.log(output);   break
  }
}

// ── Core log function ───────────────────────────────────────────────────────

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel()]) return
  const record = buildRecord(level, message, context)
  emit(level, record)
}

// ── Public API ──────────────────────────────────────────────────────────────

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info:  (message: string, context?: LogContext) => log('info',  message, context),
  warn:  (message: string, context?: LogContext) => log('warn',  message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
}
