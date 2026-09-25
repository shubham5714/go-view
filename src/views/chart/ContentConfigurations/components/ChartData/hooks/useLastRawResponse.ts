/**
 * Session cache of the last raw request/tool response per chart id.
 * Used so filter editing can preview/apply without re-calling the API/MCP tool.
 */
const lastRawByChartId = new Map<string, any>()

const chartKey = (chartOrId: object | string | null | undefined): string | null => {
  if (chartOrId == null) return null
  if (typeof chartOrId === 'string') {
    const id = chartOrId.trim()
    return id || null
  }
  const id = String((chartOrId as { id?: string | number }).id ?? '').trim()
  return id || null
}

export const setLastRawResponse = (chartOrId: object | string | null | undefined, res: any) => {
  const key = chartKey(chartOrId)
  if (!key || res === undefined) return
  lastRawByChartId.set(key, res)
}

export const getLastRawResponse = (chartOrId: object | string | null | undefined): any | undefined => {
  const key = chartKey(chartOrId)
  if (!key) return undefined
  return lastRawByChartId.get(key)
}

export const clearLastRawResponse = (chartOrId: object | string | null | undefined) => {
  const key = chartKey(chartOrId)
  if (!key) return
  lastRawByChartId.delete(key)
}
