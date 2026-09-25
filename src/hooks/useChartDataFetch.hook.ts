import { ref, toRefs, toRaw, watch } from 'vue'
import type VChart from 'vue-echarts'
import { customizeHttp } from '@/api/http'
import { customizeMcp } from '@/api/mcp'
import { useChartDataPondFetch } from '@/hooks/'
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

  const applyFetchResult = (res: any) => {
    if (!res) return
    try {
      const filter = targetComponent.filter
      const { data } = res
      echartsUpdateHandle(newFunctionHandle(data, res, filter))
      if (updateCallback) {
        updateCallback(newFunctionHandle(data, res, filter))
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
  return { vChartRef }
}
