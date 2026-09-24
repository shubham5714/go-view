import { PublicConfigClass } from '@/packages/public'
import { CreateComponentType } from '@/packages/index.d'
import { TextCommonConfig } from './index'
import cloneDeep from 'lodash/cloneDeep'

export enum WritingModeEnum {
  HORIZONTAL = 'Horizontal',
  VERTICAL = 'Vertical'
}

export const WritingModeObject = {
  [WritingModeEnum.HORIZONTAL]: 'horizontal-tb',
  [WritingModeEnum.VERTICAL]: 'vertical-rl'
}

export enum FontWeightEnum {
  NORMAL = 'Normal',
  BOLD = 'Bold',
}

export const FontWeightObject = {
  [FontWeightEnum.NORMAL]: 'normal',
  [FontWeightEnum.BOLD]: 'bold',
}

export const option = {
  link: '',
  linkHead: 'http://',
  dataset: 'Sample text',
  fontSize: 20,
  fontColor: '#ffffff',
  paddingX: 10,
  paddingY: 10,
  textAlign: 'center', // 水平对齐方式
  fontWeight: 'normal',

  // 边框
  borderWidth: 0,
  borderColor: '#ffffff',
  borderRadius: 5,

  // 字间距
  letterSpacing: 5,
  writingMode: 'horizontal-tb',
  backgroundColor: '#00000000'
}

export default class Config extends PublicConfigClass implements CreateComponentType {
  public key = TextCommonConfig.key
  public chartConfig = cloneDeep(TextCommonConfig)
  public option = cloneDeep(option)
}
