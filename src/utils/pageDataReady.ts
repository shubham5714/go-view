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

const REQUEST_TIMEOUT_MS = 20_000

const withTimeout = <T>(promise: Promise<T>, ms = REQUEST_TIMEOUT_MS): Promise<T | null> => {
  return Promise.race([
    promise.then(v => v).catch(() => null),
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

/**
 * Fetch data for every AJAX / MCP / Pond component on the current page (in parallel),
 * apply results into option.dataset, and resolve when settled (or timed out).
 * Used by multi-page PDF export so each page waits before capture.
 */
export const waitForPageDataReady = async (
  componentList: Array<CreateComponentType | CreateComponentGroupType>,
  requestGlobalConfig: RequestGlobalConfigType
): Promise<void> => {
  const components = flattenComponents(componentList)
  const pondCache = new Map<string, Promise<any>>()

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

  const tasks = components.map(async component => {
    const req = component.request
    if (!req) return

    try {
      if (req.requestDataType === RequestDataTypeEnum.AJAX) {
        if (!req.requestUrl) return
        const res = await withTimeout(customizeHttp(toRaw(req), toRaw(requestGlobalConfig)))
        if (!res) return
        const dataset = newFunctionHandle(res.data, res, component.filter)
        applyDataset(component, dataset)
      } else if (req.requestDataType === RequestDataTypeEnum.MCP) {
        if (!req.requestMcp?.mcpToolName || !req.requestMcp?.mcpServerUrl) return
        const res = await withTimeout(customizeMcp(toRaw(req)))
        if (!res) return
        const dataset = newFunctionHandle(res.data, res, component.filter)
        applyDataset(component, dataset)
      } else if (req.requestDataType === RequestDataTypeEnum.Pond) {
        const pondId = req.requestDataPondId
        if (!pondId) return
        const res = await fetchPond(pondId)
        if (!res) return
        const dataset = newFunctionHandle(res.data, res, component.filter)
        applyDataset(component, dataset)
      }
    } catch (error) {
      console.error('[waitForPageDataReady]', component.id, error)
    }
  })

  await Promise.allSettled(tasks)
  await nextTick()
}
