import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum,ChatCategoryEnumName } from '../../index.d'

export const TextBarrageConfig: ConfigType = {
  key: 'TextBarrage',
  chartKey: 'VTextBarrage',
  conKey: 'VCTextBarrage',
  title: 'Barrage Text',
  category: ChatCategoryEnum.TEXT,
  categoryName: ChatCategoryEnumName.TEXT,
  package: PackagesCategoryEnum.INFORMATIONS,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'text_barrage.png'
}
