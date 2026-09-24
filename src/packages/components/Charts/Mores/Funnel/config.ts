import { echartOptionProfixHandle, PublicConfigClass } from '@/packages/public'
import { FunnelConfig } from './index'
import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
import dataJson from './data.json'

export const includes = ['legend']

// 排序枚举
export const FunnelOrderEnumList = [
  { label: 'Inverted triangle', value: 'descending' },
  { label: 'Triangle', value: 'ascending' }
]
// 标签位置枚举
export const FunnelLabelPositionEnumList = [
  { label: 'Inside', value: 'inside' },
  { label: 'Outside', value: 'outside' },
  { label: 'Inside left', value: 'insideLeft' },
  { label: 'Inside right', value: 'insideRight' }
]

export const option = {
  tooltip: {},
  legend: {},
  dataset: { ...dataJson },
  series: [
    {
      name: 'Funnel',
      type: 'funnel',
      top: 70,
      left: '10%',
      width: '80%',
      min: 0,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending', // descending | ascending
      gap: 5,
      label: {
        show: true,
        position: 'inside',
        fontSize: 12
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 0
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      }
    }
  ]
}

export default class Config extends PublicConfigClass implements CreateComponentType {
  public key: string = FunnelConfig.key
  public chartConfig = cloneDeep(FunnelConfig)

  // 图表配置项
  public option = echartOptionProfixHandle(option, includes)
}
