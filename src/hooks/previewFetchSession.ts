/**
 * Preview-only fetch session.
 *
 * Preview remounts the canvas on page switch (flushCurrentPage → cloneDeep →
 * applyPageToActive). Component hooks must not own intervals/requests or each
 * remount aborts the schedule and can start a duplicate in-flight fetch.
 *
 * This module keeps AJAX / MCP / Pond polling alive for the Preview visit.
 * Editor paths do not use it.
 */
import { toRaw } from 'vue'
import { customizeHttp } from '@/api/http'
import { customizeMcp } from '@/api/mcp'
import { beginComponentDataFetch, endComponentDataFetch } from '@/hooks/useComponentDataFetchStatus.hook'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { RequestDataTypeEnum } from '@/enums/httpEnum'
import { newFunctionHandle, intervalUnitHandle } from '@/utils'
import { isNil } from 'lodash'

type ChartEditStoreType = typeof useChartEditStore
type ChartEditStore = ReturnType<ChartEditStoreType>
type DatasetBinder = (dataset: any) => void

const LIVE_FETCHED_KEY = '__liveDataFetched'

type ComponentSession = {
  componentId: string
  intervalId: ReturnType<typeof setInterval> | null
  fetchFn: () => Promise<void>
}

type PondSubscriber = {
  componentId: string
  filter?: string
  onDataset: DatasetBinder
}

type PondSession = {
  pondId: string
  intervalId: ReturnType<typeof setInterval> | null
  fetchFn: () => Promise<void>
  subscribers: Map<string, PondSubscriber>
  lastRes: any | null
}

const componentSessions = new Map<string, ComponentSession>()
const componentBinders = new Map<string, Set<DatasetBinder>>()
const pondSessions = new Map<string, PondSession>()

const walkComponents = (
  list: Array<CreateComponentType | CreateComponentGroupType> | undefined,
  visit: (item: CreateComponentType) => void
) => {
  if (!list) return
  for (const item of list) {
    if (item.isGroup) {
      walkComponents((item as CreateComponentGroupType).groupList, visit)
    } else {
      visit(item as CreateComponentType)
    }
  }
}

/** Active canvas first, then all saved pages (survives cloneDeep on switch). */
const findComponentsById = (store: ChartEditStore, componentId: string): CreateComponentType[] => {
  const found: CreateComponentType[] = []
  const collect = (item: CreateComponentType) => {
    if (item.id === componentId) found.push(item)
  }
  walkComponents(store.componentList, collect)
  for (const page of store.pages || []) {
    walkComponents(page.componentList, collect)
  }
  return found
}

const resolveComponent = (store: ChartEditStore, componentId: string): CreateComponentType | null => {
  let active: CreateComponentType | null = null
  walkComponents(store.componentList, item => {
    if (!active && item.id === componentId) active = item
  })
  if (active) return active

  for (const page of store.pages || []) {
    let fromPage: CreateComponentType | null = null
    walkComponents(page.componentList, item => {
      if (!fromPage && item.id === componentId) fromPage = item
    })
    if (fromPage) return fromPage
  }
  return null
}

const persistDataset = (store: ChartEditStore, componentId: string, dataset: any) => {
  if (dataset === undefined) return
  for (const component of findComponentsById(store, componentId)) {
    if (component.option) component.option.dataset = dataset
    ;(component as any)[LIVE_FETCHED_KEY] = true
  }
}

const notifyBinders = (componentId: string, dataset: any) => {
  const binders = componentBinders.get(componentId)
  if (!binders) return
  binders.forEach(binder => {
    try {
      binder(dataset)
    } catch (error) {
      console.error(error)
    }
  })
}

const applyComponentResult = (
  store: ChartEditStore,
  componentId: string,
  res: any,
  filter?: string
) => {
  if (!res) return
  try {
    const component = resolveComponent(store, componentId)
    const dataset = newFunctionHandle(res.data, res, filter ?? component?.filter)
    persistDataset(store, componentId, dataset)
    notifyBinders(componentId, dataset)
  } catch (error) {
    console.error(error)
  }
}

const getIntervalMs = (store: ChartEditStore, component: CreateComponentType) => {
  const global = store.getRequestGlobalConfig
  const targetInterval = component.request.requestInterval
  const targetUnit = component.request.requestIntervalUnit
  const time = !isNil(targetInterval) ? targetInterval : global.requestInterval
  const unit = !isNil(targetInterval) ? targetUnit : global.requestIntervalUnit
  if (!time) return 0
  return intervalUnitHandle(time, unit)
}

const startComponentSession = (
  store: ChartEditStore,
  useStore: ChartEditStoreType,
  componentId: string
) => {
  if (componentSessions.has(componentId)) return

  const fetchFn = async () => {
    const chartEditStore = useStore()
    const component = resolveComponent(chartEditStore, componentId)
    if (!component) return

    const requestDataType = component.request.requestDataType
    if (requestDataType !== RequestDataTypeEnum.AJAX && requestDataType !== RequestDataTypeEnum.MCP) {
      return
    }

    beginComponentDataFetch(componentId)
    try {
      if (requestDataType === RequestDataTypeEnum.MCP) {
        const res = await customizeMcp(toRaw(component.request))
        applyComponentResult(chartEditStore, componentId, res, component.filter)
        return
      }

      const requestUrl = component.request.requestUrl
      const origin = chartEditStore.getRequestGlobalConfig.requestOriginUrl
      if (!requestUrl || !(origin + requestUrl)) return

      const res = await customizeHttp(toRaw(component.request), toRaw(chartEditStore.getRequestGlobalConfig))
      applyComponentResult(chartEditStore, componentId, res, component.filter)
    } finally {
      endComponentDataFetch(componentId)
    }
  }

  const component = resolveComponent(store, componentId)
  const intervalMs = component ? getIntervalMs(store, component) : 0
  const intervalId = intervalMs > 0 ? setInterval(fetchFn, intervalMs) : null

  componentSessions.set(componentId, { componentId, intervalId, fetchFn })
  // First attach always fetches once; remounts reuse this session and skip.
  void fetchFn()
}

/**
 * Bind a mounted Preview chart to its durable fetch session.
 * Remounts only rebind UI — they do not abort or restart the request/interval.
 */
export const attachPreviewComponentFetch = (
  targetComponent: CreateComponentType,
  useStore: ChartEditStoreType,
  onDataset: DatasetBinder
) => {
  const componentId = targetComponent.id
  const requestDataType = targetComponent.request.requestDataType
  if (requestDataType !== RequestDataTypeEnum.AJAX && requestDataType !== RequestDataTypeEnum.MCP) {
    return () => undefined
  }

  if (requestDataType === RequestDataTypeEnum.AJAX) {
    const store = useStore()
    const requestUrl = targetComponent.request.requestUrl
    const origin = store.getRequestGlobalConfig.requestOriginUrl
    if (!requestUrl || !(origin + requestUrl)) return () => undefined
  } else if (requestDataType === RequestDataTypeEnum.MCP) {
    if (
      !targetComponent.request.requestMcp?.mcpToolName ||
      !targetComponent.request.requestMcp?.mcpServerUrl
    ) {
      return () => undefined
    }
  }

  let binders = componentBinders.get(componentId)
  if (!binders) {
    binders = new Set()
    componentBinders.set(componentId, binders)
  }
  binders.add(onDataset)

  const existing = componentSessions.get(componentId)
  if (existing) {
    // Restore UI from last persisted dataset without a new network call.
    const live = resolveComponent(useStore(), componentId)
    const dataset = live?.option?.dataset
    if (dataset !== undefined) {
      try {
        onDataset(dataset)
      } catch (error) {
        console.error(error)
      }
    }
  } else {
    startComponentSession(useStore(), useStore, componentId)
  }

  return () => {
    const set = componentBinders.get(componentId)
    if (!set) return
    set.delete(onDataset)
    if (set.size === 0) componentBinders.delete(componentId)
  }
}

/** Manual refresh (e.g. requestParams change). Does not recreate the interval. */
export const requestPreviewComponentFetch = (componentId: string) => {
  const session = componentSessions.get(componentId)
  if (session) void session.fetchFn()
}

const getPondIntervalMs = (store: ChartEditStore, pondId: string) => {
  const global = store.getRequestGlobalConfig
  const pondItem = global.requestDataPond.find(item => item.dataPondId === pondId)
  if (!pondItem) return 0
  const targetInterval = pondItem.dataPondRequestConfig.requestInterval
  const targetUnit = pondItem.dataPondRequestConfig.requestIntervalUnit
  const time = targetInterval ? targetInterval : global.requestInterval
  const unit = targetInterval ? targetUnit : global.requestIntervalUnit
  if (!time) return 0
  return intervalUnitHandle(time, unit)
}

const collectPondComponentIds = (store: ChartEditStore, pondId: string) => {
  const loadingIds = new Set<string>()
  const visit = (item: CreateComponentType) => {
    if (item.request?.requestDataPondId === pondId) loadingIds.add(item.id)
  }
  walkComponents(store.componentList, visit)
  for (const page of store.pages || []) {
    walkComponents(page.componentList, visit)
  }
  return loadingIds
}

const applyPondResult = (store: ChartEditStore, pondId: string, res: any) => {
  const current = pondSessions.get(pondId)
  if (current) current.lastRes = res

  // Always persist onto every component that uses this pond (active + pages).
  const visit = (item: CreateComponentType) => {
    if (item.request?.requestDataPondId !== pondId) return
    try {
      const dataset = newFunctionHandle(res?.data, res, item.filter)
      persistDataset(store, item.id, dataset)
    } catch (error) {
      console.error(error)
    }
  }
  walkComponents(store.componentList, visit)
  for (const page of store.pages || []) {
    walkComponents(page.componentList, visit)
  }

  current?.subscribers.forEach(sub => {
    try {
      const dataset = newFunctionHandle(res?.data, res, sub.filter)
      sub.onDataset(dataset)
    } catch (error) {
      console.error(error)
    }
  })
}

const ensurePondSession = (store: ChartEditStore, useStore: ChartEditStoreType, pondId: string) => {
  if (pondSessions.has(pondId)) return pondSessions.get(pondId)!

  const subscribers = new Map<string, PondSubscriber>()

  const fetchFn = async () => {
    const chartEditStore = useStore()
    const pondItem = chartEditStore.getRequestGlobalConfig.requestDataPond.find(
      item => item.dataPondId === pondId
    )
    if (!pondItem) return

    const loadingIds = collectPondComponentIds(chartEditStore, pondId)
    loadingIds.forEach(id => beginComponentDataFetch(id))
    try {
      const res = await customizeHttp(
        toRaw(pondItem.dataPondRequestConfig),
        toRaw(chartEditStore.getRequestGlobalConfig)
      )
      if (!res) return
      applyPondResult(chartEditStore, pondId, res)
    } catch (error) {
      return error
    } finally {
      loadingIds.forEach(id => endComponentDataFetch(id))
    }
  }

  const intervalMs = getPondIntervalMs(store, pondId)
  const intervalId = intervalMs > 0 ? setInterval(fetchFn, intervalMs) : null
  const session: PondSession = { pondId, intervalId, fetchFn, subscribers, lastRes: null }
  pondSessions.set(pondId, session)
  return session
}

export const attachPreviewPondSubscriber = (
  targetComponent: CreateComponentType,
  useStore: ChartEditStoreType,
  onDataset: DatasetBinder
) => {
  const pondId = targetComponent.request.requestDataPondId as string
  if (!pondId) return () => undefined

  const componentId = targetComponent.id
  const store = useStore()
  const alreadyRunning = pondSessions.has(pondId)
  const session = ensurePondSession(store, useStore, pondId)

  session.subscribers.set(componentId, {
    componentId,
    filter: targetComponent.filter,
    onDataset
  })

  if (!alreadyRunning) {
    // Subscriber is registered before the first fetch so results reach the UI.
    void session.fetchFn()
  } else if (session.lastRes) {
    try {
      const dataset = newFunctionHandle(session.lastRes?.data, session.lastRes, targetComponent.filter)
      persistDataset(store, componentId, dataset)
      onDataset(dataset)
    } catch (error) {
      console.error(error)
    }
  } else {
    // Remount while first fetch still in flight — paint persisted data if any.
    const live = resolveComponent(store, componentId)
    const dataset = live?.option?.dataset
    if (dataset !== undefined && (live as any)?.[LIVE_FETCHED_KEY]) {
      try {
        onDataset(dataset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  return () => {
    const current = pondSessions.get(pondId)
    if (!current) return
    // Only remove this component's subscriber; keep pond interval alive.
    if (current.subscribers.get(componentId)?.onDataset === onDataset) {
      current.subscribers.delete(componentId)
    }
  }
}

export const requestPreviewPondFetch = (pondId: string) => {
  const session = pondSessions.get(pondId)
  if (session) void session.fetchFn()
}

/** Tear down all Preview sessions when leaving the Preview route. */
export const disposePreviewFetchSession = () => {
  componentSessions.forEach(session => {
    if (session.intervalId) clearInterval(session.intervalId)
  })
  componentSessions.clear()
  componentBinders.clear()

  pondSessions.forEach(session => {
    if (session.intervalId) clearInterval(session.intervalId)
  })
  pondSessions.clear()
}
