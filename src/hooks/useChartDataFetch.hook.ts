import { ref, toRefs, toRaw, watch, onUnmounted } from 'vue'
import type VChart from 'vue-echarts'
import { customizeHttp } from '@/api/http'
import { customizeMcp } from '@/api/mcp'
import { useChartDataPondFetch } from '@/hooks/'
import { beginComponentDataFetch, endComponentDataFetch } from '@/hooks/useComponentDataFetchStatus.hook'
import { CreateComponentType, ChartFrameEnum } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { RequestDataTypeEnum } from '@/enums/httpEnum'
import { isPreview, newFunctionHandle, intervalUnitHandle } from '@/utils'
import { setOption } from '@/packages/public/chart'
import { isNil } from 'lodash'

// 获取类型
type ChartEditStoreType = typeof useChartEditStore

/**
 * setdata 数据监听与更改
 * @param targetComponent
 * @param useChartEditStore 若直接引会报错，只能动态传递
 * @param updateCallback 自定义更新函数
 */
// Mark that this component instance already completed a live fetch (survives page remounts).
const LIVE_FETCHED_KEY = '__liveDataFetched'

export const useChartDataFetch = (
  targetComponent: CreateComponentType,
  useChartEditStore: ChartEditStoreType,
  updateCallback?: (...args: any) => any
) => {
  const vChartRef = ref<typeof VChart | null>(null)
  let fetchInterval: any = 0

  // 数据池
  const { addGlobalDataInterface } = useChartDataPondFetch()

  // 组件类型
  const { chartFrame } = targetComponent.chartConfig

  // eCharts 组件配合 vChart 库更新方式
  const echartsUpdateHandle = (dataset: any) => {
    if (chartFrame === ChartFrameEnum.ECHARTS) {
      if (vChartRef.value) {
        setOption(vChartRef.value, { dataset: dataset }, false)
      }
    }
  }

  // Keep last-fetched data on the store component. Preview remounts on page
  // switch (flushCurrentPage → applyPageToActive); without this, setOption-only
  // updates are lost and the chart falls back to the originally saved dataset.
  const persistDataset = (dataset: any) => {
    if (dataset === undefined || !targetComponent.option) return
    targetComponent.option.dataset = dataset
  }

  const markLiveFetched = () => {
    ;(targetComponent as any)[LIVE_FETCHED_KEY] = true
  }

  const hasLiveFetched = () => Boolean((targetComponent as any)[LIVE_FETCHED_KEY])

  const applyFetchResult = (res: any) => {
    if (!res) return
    try {
      const filter = targetComponent.filter
      const { data } = res
      const dataset = newFunctionHandle(data, res, filter)
      persistDataset(dataset)
      markLiveFetched()
      echartsUpdateHandle(dataset)
      if (updateCallback) {
        updateCallback(dataset)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const requestIntervalFn = () => {
    const chartEditStore = useChartEditStore()

    // 全局数据
    const {
      requestOriginUrl,
      requestIntervalUnit: globalUnit,
      requestInterval: globalRequestInterval
    } = toRefs(chartEditStore.getRequestGlobalConfig)

    // 目标组件
    const {
      requestDataType,
      requestUrl,
      requestIntervalUnit: targetUnit,
      requestInterval: targetInterval
    } = toRefs(targetComponent.request)

    // Static / Pond handled elsewhere
    if (
      requestDataType.value !== RequestDataTypeEnum.AJAX &&
      requestDataType.value !== RequestDataTypeEnum.MCP
    ) {
      return
    }

    try {
      clearInterval(fetchInterval)

      const fetchFn = async () => {
        const componentId = targetComponent.id
        beginComponentDataFetch(componentId)
        try {
          if (requestDataType.value === RequestDataTypeEnum.MCP) {
            const res = await customizeMcp(toRaw(targetComponent.request))
            applyFetchResult(res)
            return
          }

          // AJAX
          // @ts-ignore
          if (requestUrl?.value) {
            const completePath = requestOriginUrl && requestOriginUrl.value + requestUrl.value
            if (!completePath) return
            const res = await customizeHttp(
              toRaw(targetComponent.request),
              toRaw(chartEditStore.getRequestGlobalConfig)
            )
            applyFetchResult(res)
          }
        } finally {
          endComponentDataFetch(componentId)
        }
      }

      // Preview remounts (page switch) keep the same store objects with live data.
      // Skip the immediate re-fetch and only poll on the configured interval.
      // First mount / new component objects still fetch immediately.
      const fetchImmediately = !(isPreview() && hasLiveFetched())

      if (requestDataType.value === RequestDataTypeEnum.AJAX) {
        // @ts-ignore
        if (!requestUrl?.value) return
        const completePath = requestOriginUrl && requestOriginUrl.value + requestUrl.value
        if (!completePath) return

        watch(
          () => targetComponent.request.requestParams,
          () => {
            fetchFn()
          },
          {
            immediate: fetchImmediately,
            deep: true
          }
        )
      } else if (requestDataType.value === RequestDataTypeEnum.MCP) {
        if (!targetComponent.request.requestMcp?.mcpToolName || !targetComponent.request.requestMcp?.mcpServerUrl) {
          return
        }

        watch(
          () => targetComponent.request.requestMcp,
          () => {
            fetchFn()
          },
          {
            immediate: fetchImmediately,
            deep: true
          }
        )
      }

      // 定时时间
      const time = targetInterval && !isNil(targetInterval.value) ? targetInterval.value : globalRequestInterval.value
      // 单位
      const unit = targetInterval && !isNil(targetInterval.value) ? targetUnit.value : globalUnit.value
      // 开启轮询
      if (time) {
        fetchInterval = setInterval(fetchFn, intervalUnitHandle(time, unit))
      }
      // eslint-disable-next-line no-empty
    } catch (error) {
      console.log(error)
    }
  }

  if (isPreview()) {
    targetComponent.request.requestDataType === RequestDataTypeEnum.Pond
      ? addGlobalDataInterface(targetComponent, useChartEditStore, (newData: any) => {
          persistDataset(newData)
          markLiveFetched()
          echartsUpdateHandle(newData)
          if (updateCallback) updateCallback(newData)
        })
      : requestIntervalFn()
  } else {
    // Editor: AJAX keeps live fetch.
    if (targetComponent.request.requestDataType === RequestDataTypeEnum.AJAX) {
      requestIntervalFn()
    } else if (targetComponent.request.requestDataType === RequestDataTypeEnum.MCP) {
      // MCP Call tool writes option.dataset in the data panel — push that to the canvas chart
      // without re-fetching (re-fetch watch was stacking long MCP calls).
      watch(
        () => targetComponent.option?.dataset,
        (dataset) => {
          if (dataset === undefined || dataset === null) return
          echartsUpdateHandle(dataset)
          if (updateCallback) updateCallback(dataset)
        },
        { deep: true }
      )
    }
  }

  onUnmounted(() => {
    if (fetchInterval) clearInterval(fetchInterval)
  })

  return { vChartRef }
}
