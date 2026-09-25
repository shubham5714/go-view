import { toRaw, watch, computed, ComputedRef } from 'vue'
import { customizeHttp } from '@/api/http'
import { CreateComponentType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { RequestGlobalConfigType, RequestDataPondItemType } from '@/store/modules/chartEditStore/chartEditStore.d'
import { newFunctionHandle, intervalUnitHandle } from '@/utils'
import { beginComponentDataFetch, endComponentDataFetch } from '@/hooks/useComponentDataFetchStatus.hook'

// 获取类型
type ChartEditStoreType = typeof useChartEditStore

const LIVE_FETCHED_KEY = '__liveDataFetched'

// 数据池存储的数据类型
type DataPondMapType = {
  componentId: string
  updateCallback: (...args: any) => any
  filter?: string | undefined
  isLiveFetched?: () => boolean
}

// 数据池 Map 中请求对应 callback
const mittDataPondMap = new Map<string, DataPondMapType[]>()
// Active poll timers — cleared on remount so intervals are not leaked/stacked
const pondFetchIntervals = new Map<string, ReturnType<typeof setInterval>>()

// 创建单个数据项轮询接口
const newPondItemInterval = (
  requestGlobalConfig: RequestGlobalConfigType,
  requestDataPondItem: ComputedRef<RequestDataPondItemType>,
  dataPondMapItem?: DataPondMapType[],
  pondKey?: string
) => {
  if (!dataPondMapItem || !pondKey) return

  const existing = pondFetchIntervals.get(pondKey)
  if (existing) clearInterval(existing)

  // 请求
  const fetchFn = async () => {
    const componentIds = dataPondMapItem.map(item => item.componentId).filter(Boolean)
    componentIds.forEach(id => beginComponentDataFetch(id))
    try {
      const res = await customizeHttp(toRaw(requestDataPondItem.value.dataPondRequestConfig), toRaw(requestGlobalConfig))
      if (res) {
        try {
          // 遍历更新回调函数
          dataPondMapItem.forEach(item => {
            item.updateCallback(newFunctionHandle(res?.data, res, item.filter))
          })
        } catch (error) {
          console.error(error)
          return error
        }
      }
    } catch (error) {
      return error
    } finally {
      componentIds.forEach(id => endComponentDataFetch(id))
    }
  }

  watch(
    () => requestDataPondItem.value.dataPondRequestConfig.requestParams.Params,
    () => {
      fetchFn()
    },
    {
      immediate: false,
      deep: true
    }
  )

  // Skip immediate re-fetch when all subscribers already hold live data
  // (preview page remount). First init still fetches immediately.
  const alreadyLive = dataPondMapItem.every(item => item.isLiveFetched?.())
  if (!alreadyLive) {
    fetchFn()
  }

  const targetInterval = requestDataPondItem.value.dataPondRequestConfig.requestInterval
  const targetUnit = requestDataPondItem.value.dataPondRequestConfig.requestIntervalUnit

  const globalRequestInterval = requestGlobalConfig.requestInterval
  const globalUnit = requestGlobalConfig.requestIntervalUnit

  // 定时时间
  const time = targetInterval ? targetInterval : globalRequestInterval
  // 单位
  const unit = targetInterval ? targetUnit : globalUnit
  // 开启轮询
  if (time) {
    const fetchInterval = setInterval(fetchFn, intervalUnitHandle(time, unit))
    pondFetchIntervals.set(pondKey, fetchInterval)
  }
}

/**
 * 数据池接口处理
 */
export const useChartDataPondFetch = () => {
  // 新增全局接口
  const addGlobalDataInterface = (
    targetComponent: CreateComponentType,
    useChartEditStore: ChartEditStoreType,
    updateCallback: (...args: any) => any
  ) => {
    const chartEditStore = useChartEditStore()
    const { requestDataPond } = chartEditStore.getRequestGlobalConfig

    // 组件对应的数据池 Id
    const requestDataPondId = targetComponent.request.requestDataPondId as string
    // 新增数据项
    const mittPondIdArr = mittDataPondMap.get(requestDataPondId) || []
    mittPondIdArr.push({
      componentId: targetComponent.id,
      updateCallback: updateCallback,
      filter: targetComponent.filter,
      isLiveFetched: () => Boolean((targetComponent as any)[LIVE_FETCHED_KEY])
    })
    mittDataPondMap.set(requestDataPondId, mittPondIdArr)
  }

  // 清除旧数据
  const clearMittDataPondMap = () => {
    pondFetchIntervals.forEach(interval => clearInterval(interval))
    pondFetchIntervals.clear()
    mittDataPondMap.clear()
  }

  // 初始化数据池
  const initDataPond = (useChartEditStore: ChartEditStoreType) => {
    const { requestGlobalConfig } = useChartEditStore()
    const chartEditStore = useChartEditStore()
    // 根据 mapId 查找对应的数据池配置
    for (let pondKey of mittDataPondMap.keys()) {
      const requestDataPondItem = computed(() => {
        return requestGlobalConfig.requestDataPond.find(item => item.dataPondId === pondKey)
      }) as ComputedRef<RequestDataPondItemType>
      if (requestDataPondItem.value) {
        newPondItemInterval(
          chartEditStore.requestGlobalConfig,
          requestDataPondItem,
          mittDataPondMap.get(pondKey),
          pondKey
        )
      }
    }
  }

  return {
    addGlobalDataInterface,
    clearMittDataPondMap,
    initDataPond
  }
}
