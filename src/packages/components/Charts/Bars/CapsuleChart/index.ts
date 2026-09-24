import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const CapsuleChartConfig: ConfigType = {
  key: 'CapsuleChart',
  chartKey: 'VCapsuleChart',
  conKey: 'VCCapsuleChart',
  title: 'Capsule Bar Chart',
  category: ChatCategoryEnum.BAR,
  categoryName: ChatCategoryEnumName.BAR,
  package: PackagesCategoryEnum.CHARTS,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'capsule.png'
}
