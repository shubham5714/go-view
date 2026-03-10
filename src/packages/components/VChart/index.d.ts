import { IBarChartSpec, ILineChartSpec, IAreaChartSpec, IPieChartSpec, IFunnelChartSpec, IWordCloudChartSpec } from '@visactor/vchart'
import { ICartesianAxisCommonSpec } from '@visactor/vchart/esm/component/axis'


export enum ChatCategoryEnum {
  BAR = 'Bars',
  PIE = 'Pies',
  LINE = 'Lines',
  AREA = 'Areas',
  FUNNEL = 'Funnels',
  WORDCLOUD = 'WordClouds',
  SCATTER = 'Scatters',
}

export enum ChatCategoryEnumName {
  BAR = 'Bar',
  PIE = 'Pie',
  LINE = 'Line',
  AREA = 'Area',
  FUNNEL = 'Funnel',
  WORDCLOUD = 'Word Cloud',
  SCATTER = 'Scatter',
}

export interface IBarOption extends Omit<IBarChartSpec, 'axes'> {
  category: ChatCategoryEnum.BAR
  type: 'bar'
  xAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
  yAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
}

export interface ILineOption extends Omit<ILineChartSpec, 'axes'> {
  category: ChatCategoryEnum.LINE
  type: 'line'
  xAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
  yAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
}

export interface IAreaOption extends Omit<IAreaChartSpec, 'axes'> {
  category: ChatCategoryEnum.AREA
  type: 'area'
  xAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
  yAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
}

export interface IPieOption extends IPieChartSpec {
  category?: ChatCategoryEnum.PIE
  type: 'pie'
}

export interface IFunnelOption extends IFunnelChartSpec {
  category: ChatCategoryEnum.FUNNEL
  type: 'funnel'
}

export interface IWordCloudOption extends IWordCloudChartSpec {
  category: ChatCategoryEnum.WORDCLOUD
  type: 'wordCloud'
}

export interface IScatterOption extends Omit<IAreaChartSpec, 'axes'> {
  category: ChatCategoryEnum.SCATTER
  type: 'scatter'
  xAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
  yAxis?: {
    name: string
  } & ICartesianAxisCommonSpec
}

// todo
// export type IOption = IBarOption | ILineOption ....
export type IOption = IBarOption | IPieOption | ILineOption | IAreaOption | IFunnelOption | IScatterOption
