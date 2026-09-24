import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const VChartBarStackConfig: ConfigType = {
  key: 'VChartBarStack',
  chartKey: 'VVChartBarStack',
  conKey: 'VCVChartBarStack',
  title: 'Stacked Bar Chart - VChart',
  category: ChatCategoryEnum.BAR,
  categoryName: ChatCategoryEnumName.BAR,
  package: PackagesCategoryEnum.VCHART,
  chartFrame: ChartFrameEnum.VCHART,
  image: 'vchart_bar_x_stack.png'
}
