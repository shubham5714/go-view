import { ref } from 'vue'
import { ChartEditStorageType } from '../index.d'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'
import { fetchChartComponent } from '@/packages/index'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'

export const useComInstall = (localStorageInfo: ChartEditStorageType) => {
  const show = ref(false)
  const chartEditStore = useChartEditStore()

  // 注册组件(一开始无法获取window['$vue'])
  const intervalTiming = setInterval(() => {
    if (window['$vue']?.component) {
      clearInterval(intervalTiming)

      const intComponent = (target: CreateComponentType) => {
        if (!window['$vue'].component(target.chartConfig.chartKey)) {
          window['$vue'].component(target.chartConfig.chartKey, fetchChartComponent(target.chartConfig))
        }
      }

      const registerList = (list: Array<CreateComponentType | CreateComponentGroupType> = []) => {
        list.forEach((e: CreateComponentType | CreateComponentGroupType) => {
          if (e.isGroup) {
            ;(e as CreateComponentGroupType).groupList.forEach(groupItem => {
              intComponent(groupItem)
            })
          } else {
            intComponent(e as CreateComponentType)
          }
        })
      }

      // Register all pages so tab switches don't miss chart components
      const pages = chartEditStore.pages?.length
        ? chartEditStore.pages
        : (localStorageInfo as any).pages
      if (pages?.length) {
        pages.forEach((page: { componentList?: Array<CreateComponentType | CreateComponentGroupType> }) => {
          registerList(page.componentList || [])
        })
      } else {
        registerList(localStorageInfo.componentList || [])
      }

      show.value = true
    }
  }, 200)

  return {
    show
  }
}
