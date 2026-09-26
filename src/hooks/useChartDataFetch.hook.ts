import { ref, toRefs, toRaw, watch, onUnmounted } from 'vue'
import type VChart from 'vue-echarts'
import { customizeHttp } from '@/api/http'
import { customizeMcp } from '@/api/mcp'
import { beginComponentDataFetch, endComponentDataFetch } from '@/hooks/useComponentDataFetchStatus.hook'
import {
  attachPreviewComponentFetch,
  attachPreviewPondSubscriber,
  requestPreviewComponentFetch
} from '@/hooks/previewFetchSession'
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
export const useChartDataFetch = (
  targetComponent: CreateComponentType,
  useChartEditStore: ChartEditStoreType,
  updateCallback?: (...args: any) => any
) => {
  const vChartRef = ref<typeof VChart | null>(null)
  let fetchInterval: any = 0
  const stopWatchers: Array<() => void> = []

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

  const applyDatasetToView = (dataset: any) => {
    if (dataset === undefined) return
    echartsUpdateHandle(dataset)
    if (updateCallback) updateCallback(dataset)
  }

  // ---------- Preview: durable session (survives page remounts) ----------
  if (isPreview()) {
    const requestDataType = targetComponent.request.requestDataType

    if (requestDataType === RequestDataTypeEnum.Pond) {
      const detach = attachPreviewPondSubscriber(targetComponent, useChartEditStore, applyDatasetToView)
      onUnmounted(() => {
        detach()
      })
      return { vChartRef }
    }

    if (requestDataType === RequestDataTypeEnum.AJAX || requestDataType === RequestDataTypeEnum.MCP) {
      const detach = attachPreviewComponentFetch(targetComponent, useChartEditStore, applyDatasetToView)

      if (requestDataType === RequestDataTypeEnum.AJAX) {
        stopWatchers.push(
          watch(
            () => targetComponent.request.requestParams,
            () => {
              requestPreviewComponentFetch(targetComponent.id)
            },
            { deep: true }
          )
        )
      } else {
        stopWatchers.push(
          watch(
            () => targetComponent.request.requestMcp,
            () => {
              requestPreviewComponentFetch(targetComponent.id)
            },
            { deep: true }
          )
        )
      }

      onUnmounted(() => {
        stopWatchers.forEach(stop => stop())
        detach()
      })
      return { vChartRef }
    }

    return { vChartRef }
  }

  // ---------- Editor (and non-preview): existing local interval ownership ----------
  const persistDataset = (dataset: any) => {
    if (dataset === undefined || !targetComponent.option) return
    targetComponent.option.dataset = dataset
  }

  const applyFetchResult = (res: any) => {
    if (!res) return
    try {
      const filter = targetComponent.filter
      const { data } = res
      const dataset = newFunctionHandle(data, res, filter)
      persistDataset(dataset)
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

    const {
      requestOriginUrl,
      requestIntervalUnit: globalUnit,
      requestInterval: globalRequestInterval
    } = toRefs(chartEditStore.getRequestGlobalConfig)

    const {
      requestDataType,
      requestUrl,
      requestIntervalUnit: targetUnit,
      requestInterval: targetInterval
    } = toRefs(targetComponent.request)

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
            immediate: true,
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
            immediate: true,
            deep: true
          }
        )
      }

      const time = targetInterval && !isNil(targetInterval.value) ? targetInterval.value : globalRequestInterval.value
      const unit = targetInterval && !isNil(targetInterval.value) ? targetUnit.value : globalUnit.value
      if (time) {
        fetchInterval = setInterval(fetchFn, intervalUnitHandle(time, unit))
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Editor: AJAX keeps live fetch. Pond polling is Preview-only (previewFetchSession).
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

  onUnmounted(() => {
    if (fetchInterval) clearInterval(fetchInterval)
  })

  return { vChartRef }
}
