import merge from 'lodash/merge'
import pick from 'lodash/pick'
import cloneDeep from 'lodash/cloneDeep'
import { EchartsDataType } from '../index.d'
import { globalThemeJson } from '@/settings/chartThemes/index'
import type VChart from 'vue-echarts'

/**
 * * 合并 color 和全局配置项
 * @param option 配置
 * @param themeSetting 设置
 * @param excludes 排除元素
 * @returns object
 */
export const mergeTheme = <T, U>(option: T, themeSetting: U, includes: string[]) => {
  return (option = merge({}, pick(themeSetting, includes), option))
}

/**
 * * ECharts option 统一前置处理
 * @param option
 * @return option
 */
export const echartOptionProfixHandle = (option: any, includes: string[] = []) => {
  option['backgroundColor'] = 'rgba(0,0,0,0)'
  return mergeTheme(option, globalThemeJson, includes)
}

/**
 * * 设置数据
 * @param option
 * @return option
 */
export const setData = (option: any, data: EchartsDataType) => {
  option.dataset = data
  return option
}

/**
 * Keep option.series length aligned with dataset dimensions.
 * dimensions[0] is the category axis; the rest map 1:1 to series.
 * Fixes double bars when data has one series but the demo config still has two.
 */
export const syncEchartsSeriesToDataset = (option: any, seriesTemplate?: any) => {
  if (!option || !Array.isArray(option.series)) return false
  const dims = option.dataset?.dimensions
  if (!Array.isArray(dims)) return false

  const seriesCount = Math.max(dims.length - 1, 0)
  const current = option.series as any[]
  if (current.length === seriesCount) return false

  const template = seriesTemplate ?? current[0] ?? { type: 'bar' }
  const next: any[] = []
  for (let i = 0; i < seriesCount; i++) {
    next.push(current[i] ? current[i] : cloneDeep(template))
  }
  option.series = next
  return true
}

/**
 * * 配置公共 setOption 方法
 * @param instance
 * @param data
 */
export const setOption = <T extends typeof VChart | undefined, D>(instance: T, data: D, notMerge = true) => {
  if (!instance) return
  // replaceMerge ensures dataset swaps actually paint on repeated updates;
  // mutating getOption().dataset = null is a no-op on ECharts clones and left charts stale.
  instance.setOption(data as any, {
    notMerge,
    ...(notMerge ? {} : { replaceMerge: ['dataset'] })
  })
}
