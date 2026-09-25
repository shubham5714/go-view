/**
 * n8n-style Fixed / Expression param values.
 * Expressions are JavaScript evaluated at request time (each poll).
 */

export type ParamValueMode = 'fixed' | 'expression'

export type ParamValue = {
  mode: ParamValueMode
  value: unknown
}

export const isParamValue = (raw: unknown): raw is ParamValue => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const mode = (raw as ParamValue).mode
  return mode === 'fixed' || mode === 'expression'
}

export const normalizeParamValue = (raw: unknown, fallback: unknown = ''): ParamValue => {
  if (isParamValue(raw)) {
    return {
      mode: raw.mode,
      value: raw.value
    }
  }
  if (raw === undefined) {
    return { mode: 'fixed', value: fallback }
  }
  return { mode: 'fixed', value: raw }
}

const MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000
} as const

/** Helpers available inside expression scope (rebuilt each evaluation). */
export const createExpressionHelpers = () => {
  const now = () => new Date()
  const asDate = (d?: Date | number | string) => (d === undefined ? now() : new Date(d))

  return {
    Date,
    Math,
    JSON,
    Number,
    String,
    Boolean,
    /** Fresh Date on each call */
    now,
    /** Snapshot at the start of this evaluation */
    $now: now(),
    /** ISO-8601 string (UTC) */
    iso: (d?: Date | number | string) => asDate(d).toISOString(),
    /** Unix seconds */
    unix: (d?: Date | number | string) => Math.floor(asDate(d).getTime() / 1000),
    /** Unix milliseconds */
    unixMs: (d?: Date | number | string) => asDate(d).getTime(),
    minutesAgo: (n: number) => new Date(Date.now() - Number(n) * MS.minute),
    hoursAgo: (n: number) => new Date(Date.now() - Number(n) * MS.hour),
    daysAgo: (n: number) => new Date(Date.now() - Number(n) * MS.day),
    minutesFromNow: (n: number) => new Date(Date.now() + Number(n) * MS.minute),
    hoursFromNow: (n: number) => new Date(Date.now() + Number(n) * MS.hour),
    daysFromNow: (n: number) => new Date(Date.now() + Number(n) * MS.day),
    startOfDay: (d?: Date | number | string) => {
      const x = asDate(d)
      x.setHours(0, 0, 0, 0)
      return x
    },
    endOfDay: (d?: Date | number | string) => {
      const x = asDate(d)
      x.setHours(23, 59, 59, 999)
      return x
    }
  }
}

const stripExpressionWrappers = (expression: string): string => {
  let body = expression.trim()
  // Optional n8n-style {{ ... }} or leading =
  if (body.startsWith('{{') && body.endsWith('}}')) {
    body = body.slice(2, -2).trim()
  }
  if (body.startsWith('=')) {
    body = body.slice(1).trim()
  }
  // Optional legacy AJAX prefix
  if (body.startsWith('javascript:')) {
    body = body.slice('javascript:'.length).trim()
  }
  return body
}

/**
 * Evaluate a JS expression with datetime helpers in scope.
 * Examples: `iso()`, `iso(hoursAgo(1))`, `$now.toISOString()`, `unix(minutesAgo(15))`
 */
export const evaluateExpression = (expression: string): unknown => {
  const code = stripExpressionWrappers(expression)
  if (!code) return undefined

  const helpers = createExpressionHelpers()
  const keys = Object.keys(helpers)
  const values = Object.values(helpers)

  try {
    // Prefer expression form: iso(hoursAgo(1))
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `"use strict"; return (${code});`)
    return fn(...values)
  } catch {
    // Fallback for statement bodies with explicit return
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `"use strict"; ${code}`)
    return fn(...values)
  }
}

export const resolveParamValue = (raw: unknown): unknown => {
  const normalized = normalizeParamValue(raw)
  if (normalized.mode !== 'expression') {
    return normalized.value
  }
  const expr = String(normalized.value ?? '').trim()
  if (!expr) return undefined
  try {
    return evaluateExpression(expr)
  } catch (error: any) {
    throw new Error(String(error?.message || 'Invalid expression'))
  }
}

/** Resolve a params map; expressions re-run on every call (interval-safe). */
export const resolveParamsRecord = (
  params: Record<string, unknown> | null | undefined
): Record<string, unknown> => {
  const source = params && typeof params === 'object' ? params : {}
  const out: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(source)) {
    try {
      out[key] = resolveParamValue(raw)
    } catch (error: any) {
      throw new Error(`Expression failed for "${key}": ${error?.message || error}`)
    }
  }
  return out
}

export const EXPRESSION_PLACEHOLDER =
  'e.g. iso()  ·  iso(hoursAgo(1))  ·  unix(minutesAgo(15))  ·  $now.toISOString()'
