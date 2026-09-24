import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const ScatterLogarithmicRegressionConfig: ConfigType = {
  key: 'ScatterLogarithmicRegression',
  chartKey: 'VScatterLogarithmicRegression',
  conKey: 'VCScatterLogarithmicRegression',
  title: 'Logarithmic Regression Scatter',
  category: ChatCategoryEnum.SCATTER,
  categoryName: ChatCategoryEnumName.SCATTER,
  package: PackagesCategoryEnum.CHARTS,
  chartFrame: ChartFrameEnum.ECHARTS,
  image: 'scatter-logarithmic-regression.png'
}
