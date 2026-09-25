import { toRaw, nextTick } from 'vue'
import { customizeHttp } from '@/api/http'
import { customizeMcp } from '@/api/mcp'
import { RequestDataTypeEnum } from '@/enums/httpEnum'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'
import {
  RequestGlobalConfigType,
  RequestDataPondItemType
} from '@/store/modules/chartEditStore/chartEditStore.d'
import { newFunctionHandle } from '@/utils/utils'

/** AJAX / Pond only. MCP awaits customizeMcp fully (its own 5min cap). */
const HTTP_TIMEOUT_MS = 20_000

const withTimeout = <T>(promise: Promise<T> | undefined | null, ms = HTTP_TIMEOUT_MS): Promise<T | null> => {
  const safe = promise ?? Promise.resolve(null as T | null)
  return Promise.race([
    safe.then(v => v).catch(() => null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), ms))
  ])
}

const flattenComponents = (
  list: Array<CreateComponentType | CreateComponentGroupType>
): CreateComponentType[] => {
  const result: CreateComponentType[] = []
  for (const item of list) {
    if (item.isGroup) {
      result.push(...flattenComponents((item as CreateComponentGroupType).groupList || []))
    } else {
      result.push(item as CreateComponentType)
    }
  }
  return result
}

const applyDataset = (component: CreateComponentType, dataset: any) => {
  if (!component.option) component.option = {} as any
  component.option.dataset = dataset
}

const asDataType = (raw: unknown): RequestDataTypeEnum => Number(raw) as RequestDataTypeEnum

/**
 * Prefetch page data into componentList clones.
 * AJAX/Pond run in parallel; MCP tools run one-by-one and are awaited fully.
 * @returns number of failed fetches
 */
export const waitForPageDataReady = async (
  componentList: Array<CreateComponentType | CreateComponentGroupType>,
  requestGlobalConfig: RequestGlobalConfigType,
  onProgress?: (message: string) => void
): Promise<number> => {
  const components = flattenComponents(componentList)
  const pondCache = new Map<string, Promise<any>>()
  let failed = 0

  const fetchPond = (pondId: string): Promise<any> => {
    if (pondCache.has(pondId)) return pondCache.get(pondId)!
    const pondItem = (requestGlobalConfig.requestDataPond || []).find(
      (p: RequestDataPondItemType) => p.dataPondId === pondId
    )
    if (!pondItem) {
      const empty = Promise.resolve(null)
      pondCache.set(pondId, empty)
      return empty
    }
    const p = withTimeout(
      customizeHttp(toRaw(pondItem.dataPondRequestConfig), toRaw(requestGlobalConfig))
    )
    pondCache.set(pondId, p)
    return p
  }

  const ajaxOrPond: CreateComponentType[] = []
  const mcpList: CreateComponentType[] = []

  for (const component of components) {
    const req = component.request
    if (!req) continue
    const dataType = asDataType(req.requestDataType)
    if (dataType === RequestDataTypeEnum.AJAX && req.requestUrl) {
      ajaxOrPond.push(component)
    } else if (
      dataType === RequestDataTypeEnum.MCP &&
      req.requestMcp?.mcpToolName &&
      req.requestMcp?.mcpServerUrl
    ) {
      mcpList.push(component)
    } else if (dataType === RequestDataTypeEnum.Pond && req.requestDataPondId) {
      ajaxOrPond.push(component)
    }
  }

  await Promise.allSettled(
    ajaxOrPond.map(async component => {
      const req = component.request
      const dataType = asDataType(req.requestDataType)
      try {
        const res =
          dataType === RequestDataTypeEnum.AJAX
            ? await withTimeout(customizeHttp(toRaw(req), toRaw(requestGlobalConfig)))
            : await fetchPond(req.requestDataPondId!)
        if (!res) {
          failed += 1
          return
        }
        applyDataset(component, newFunctionHandle(res.data, res, component.filter))
      } catch (error) {
        failed += 1
        console.error('[waitForPageDataReady]', component.id, error)
      }
    })
  )

  for (let i = 0; i < mcpList.length; i++) {
    const component = mcpList[i]
    const toolName = component.request.requestMcp?.mcpToolName || 'tool'
    onProgress?.(
      mcpList.length > 1
        ? `Waiting for MCP ${i + 1}/${mcpList.length}: ${toolName}…`
        : `Waiting for MCP: ${toolName}…`
    )
    try {
      const res = await customizeMcp(toRaw(component.request))
      if (!res) {
        failed += 1
        continue
      }
      applyDataset(component, newFunctionHandle(res.data, res, component.filter))
    } catch (error) {
      failed += 1
      console.error('[waitForPageDataReady] MCP failed', component.id, toolName, error)
    }
  }

  await nextTick()
  return failed
}
