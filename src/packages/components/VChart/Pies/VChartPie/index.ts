import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const VChartPieConfig: ConfigType = {
  key: 'VChartPie',
  chartKey: 'VVChartPie',
  conKey: 'VCVChartPie',
  title: 'Multi Pie Chart - VChart',
  category: ChatCategoryEnum.PIE,
  categoryName: ChatCategoryEnumName.PIE,
  package: PackagesCategoryEnum.VCHART,
  chartFrame: ChartFrameEnum.VCHART,
  image: 'vchart_pie.png'
}
