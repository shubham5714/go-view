import { PublicConfigClass } from '@/packages/public'
import { CreateComponentType } from '@/packages/index.d'
import { Decorates03Config } from './index'
import cloneDeep from 'lodash/cloneDeep'
import { chartInitConfig } from '@/settings/designSetting'

export const option = {
  dataset: 'Sample title',
  textColor: '#fff',
  textSize: 32,
  colors: ['#1dc1f5', '#1dc1f5']
}

export default class Config extends PublicConfigClass implements CreateComponentType {
  public key = Decorates03Config.key
  public attr = { ...chartInitConfig, w: 500, h: 70, zIndex: 1 }
  public chartConfig = cloneDeep(Decorates03Config)
  public option = cloneDeep(option)
}
