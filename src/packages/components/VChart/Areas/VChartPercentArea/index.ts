import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const VChartPercentAreaConfig: ConfigType = {
  key: 'VChartPercentArea',
  chartKey: 'VVChartPercentArea',
  conKey: 'VCVChartPercentArea',
  title: 'VChart Percent Area Chart',
  category: ChatCategoryEnum.AREA,
  categoryName: ChatCategoryEnumName.AREA,
  package: PackagesCategoryEnum.VCHART,
  chartFrame: ChartFrameEnum.VCHART,
  image: 'vchart_percent_area.png'
}
