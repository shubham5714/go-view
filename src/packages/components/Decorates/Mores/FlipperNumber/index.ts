import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const FlipperNumberConfig: ConfigType = {
  key: 'FlipperNumber',
  chartKey: 'VFlipperNumber',
  conKey: 'VCFlipperNumber',
  title: 'Flipper Number (Dynamic)',
  category: ChatCategoryEnum.MORE,
  categoryName: ChatCategoryEnumName.MORE,
  package: PackagesCategoryEnum.DECORATES,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'flipper-number.png'
}
