import axios from 'axios'
import { clearLocalStorage, getLocalStorage, setLocalStorage, resolveParamsRecord } from '@/utils'
import { StorageEnum } from '@/enums/storageEnum'
import { SystemStoreEnum, SystemStoreUserInfoEnum } from '@/store/modules/systemStore/systemStore.d'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import type { RequestConfigType } from '@/store/modules/chartEditStore/chartEditStore.d'
import { RequestDataTypeEnum } from '@/enums/httpEnum'
import cloneDeep from 'lodash/cloneDeep'

export type McpFieldOption = { label: string; value: string }

export type McpToolField = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json'
  required: boolean
  description?: string
  placeholder?: string
  defaultValue?: unknown
  options?: McpFieldOption[]
}

export type McpToolOption = {
  instance_tool_id: number
  instance_id: number | null
  instance_name: string
  tool_name: string
  label: string
  type: string | null
  description: string | null
  mcp_tool_name: string | null
  mcp_matched: boolean
  mcp_server_url: string | null
  mcp_server_name: string | null
  input_schema: unknown
  fields: McpToolField[]
}

type ToolsCacheEntry = {
  tenantId: string
  expiresAt: number
  tools: McpToolOption[]
  server_errors: Array<{ url: string; name?: string; error: string }>
}

/** Persist tools list across refresh; expire after 3 hours */
const TOOLS_CACHE_TTL_MS = 3 * 60 * 60 * 1000 // 3 hours
let toolsCache: ToolsCacheEntry | null = null
let toolsInflight: Promise<{
  tools: McpToolOption[]
  server_errors: Array<{ url: string; name?: string; error: string }>
}> | null = null

const readToolsCache = (tenantId: string): ToolsCacheEntry | null => {
  if (
    toolsCache &&
    toolsCache.tenantId === tenantId &&
    toolsCache.expiresAt > Date.now()
  ) {
    return toolsCache
  }
  const stored = getLocalStorage(StorageEnum.GO_MCP_TOOLS_CACHE) as ToolsCacheEntry | null
  if (
    stored &&
    typeof stored === 'object' &&
    stored.tenantId === tenantId &&
    typeof stored.expiresAt === 'number' &&
    stored.expiresAt > Date.now() &&
    Array.isArray(stored.tools)
  ) {
    toolsCache = {
      tenantId: stored.tenantId,
      expiresAt: stored.expiresAt,
      tools: stored.tools,
      server_errors: Array.isArray(stored.server_errors) ? stored.server_errors : []
    }
    return toolsCache
  }
  if (stored) {
    clearLocalStorage(StorageEnum.GO_MCP_TOOLS_CACHE)
  }
  toolsCache = null
  return null
}

const writeToolsCache = (entry: ToolsCacheEntry) => {
  toolsCache = entry
  setLocalStorage(StorageEnum.GO_MCP_TOOLS_CACHE, entry)
}

export const clearGoviewMcpToolsCache = () => {
  toolsCache = null
  toolsInflight = null
  clearLocalStorage(StorageEnum.GO_MCP_TOOLS_CACHE)
}

const mcpApiBase = (): string => {
  const configured = (import.meta.env.VITE_MCP_API_BASE as string | undefined)?.replace(/\/$/, '')
  if (configured) return configured
  // Dev: Vite proxies /api/goview/mcp → AI-SOC (see vite.config.ts)
  if (import.meta.env.DEV) return '/api/goview/mcp'
  const aiSoc = (import.meta.env.VITE_AI_SOC_URL as string | undefined)?.replace(/\/$/, '') || ''
  return aiSoc ? `${aiSoc}/api/goview/mcp` : '/api/goview/mcp'
}

const authHeaders = (): Record<string, string> => {
  const info = getLocalStorage(StorageEnum.GO_SYSTEM_STORE)
  const userInfo = info?.[SystemStoreEnum.USER_INFO]
  const tokenName = userInfo?.[SystemStoreUserInfoEnum.TOKEN_NAME] || 'satoken'
  const token = userInfo?.[SystemStoreUserInfoEnum.USER_TOKEN] || ''
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers[tokenName] = token
  return headers
}

export const getCurrentTenantId = (): string => {
  const systemStore = useSystemStore()
  return String(systemStore.getCurrentTenantId || '').trim()
}

export const listGoviewMcpTools = async (
  tenantId?: string,
  options?: { force?: boolean }
): Promise<{
  tools: McpToolOption[]
  server_errors: Array<{ url: string; name?: string; error: string }>
}> => {
  const tid = (tenantId || getCurrentTenantId()).trim()
  if (!tid) {
    throw new Error('Tenant context missing. Open GoView from AI-SOC.')
  }

  if (!options?.force) {
    const cached = readToolsCache(tid)
    if (cached) {
      return {
        tools: cached.tools,
        server_errors: cached.server_errors
      }
    }
  }

  if (!options?.force && toolsInflight) {
    return toolsInflight
  }

  toolsInflight = (async () => {
    try {
      const { data } = await axios.get(`${mcpApiBase()}/tools`, {
        params: { tenant_id: tid },
        headers: authHeaders(),
        timeout: 60000
      })
      if (data?.error) {
        throw new Error(String(data.error))
      }
      const payload = {
        tools: Array.isArray(data?.tools) ? (data.tools as McpToolOption[]) : [],
        server_errors: Array.isArray(data?.server_errors) ? data.server_errors : []
      }
      writeToolsCache({
        tenantId: tid,
        expiresAt: Date.now() + TOOLS_CACHE_TTL_MS,
        tools: payload.tools,
        server_errors: payload.server_errors
      })
      return payload
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load DRX tools.'
      throw new Error(String(message))
    } finally {
      toolsInflight = null
    }
  })()

  return toolsInflight
}

/**
 * Execute the selected FastMCP tool. Returns `{ data }` compatible with chart filter pipeline.
 * Uses fetch (not axios) so Vite proxy / long MCP responses always settle the promise.
 * Each call has its own timeout AbortController — concurrent calls must not cancel each other.
 */
export const customizeMcp = async (targetParams: RequestConfigType) => {
  if (!targetParams || targetParams.requestDataType !== RequestDataTypeEnum.MCP) {
    return
  }
  const mcp = targetParams.requestMcp
  const mcpToolName = String(mcp?.mcpToolName ?? '').trim()
  const mcpServerUrl = String(mcp?.mcpServerUrl ?? '').trim()
  if (!mcpToolName || !mcpServerUrl) {
    window['$message']?.warning?.('Select a DRX tool first (missing server/tool).')
    return
  }
  const tenantId = getCurrentTenantId()
  if (!tenantId) {
    window['$message']?.warning?.('Tenant context missing. Open GoView from AI-SOC.')
    return
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 300000)

  try {
    // Resolve Fixed/Expression params at call time so interval polls get fresh datetimes
    let resolvedParams: Record<string, unknown> = {}
    try {
      const rawParams =
        mcp?.params && typeof mcp.params === 'object' ? cloneDeep(mcp.params) : {}
      resolvedParams = resolveParamsRecord(rawParams as Record<string, unknown>)
    } catch (error: any) {
      throw new Error(String(error?.message || 'Failed to resolve parameter expressions.'))
    }

    const response = await fetch(`${mcpApiBase()}/execute/`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenant_id: tenantId,
        mcp_tool_name: mcpToolName,
        mcp_server_url: mcpServerUrl,
        params: resolvedParams
      }),
      signal: controller.signal
    })

    const text = await response.text()
    let body: any = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      throw new Error(text || `Invalid JSON (${response.status})`)
    }

    if (!response.ok) {
      throw new Error(String(body?.error || `HTTP ${response.status}`))
    }
    if (body?.error) {
      throw new Error(String(body.error))
    }

    const payload = body?.data !== undefined ? body.data : body
    return { data: payload }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('DRX tool call was cancelled or timed out.')
    }
    throw new Error(String(error?.message || 'DRX tool call failed.'))
  } finally {
    window.clearTimeout(timeoutId)
  }
}
