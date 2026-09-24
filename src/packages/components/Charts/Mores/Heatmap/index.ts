import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const HeatmapConfig: ConfigType = {
  key: 'Heatmap',
  chartKey: 'VHeatmap',
  conKey: 'VCHeatmap',
  title: 'Heatmap',
  category: ChatCategoryEnum.MORE,
  categoryName: ChatCategoryEnumName.MORE,
  package: PackagesCategoryEnum.CHARTS,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'heatmap.png'
}
