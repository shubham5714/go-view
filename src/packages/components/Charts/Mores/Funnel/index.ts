import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const FunnelConfig: ConfigType = {
  key: 'Funnel',
  chartKey: 'VFunnel',
  conKey: 'VCFunnel',
  title: 'Funnel Chart',
  category: ChatCategoryEnum.MORE,
  categoryName: ChatCategoryEnumName.MORE,
  package: PackagesCategoryEnum.CHARTS,
  chartFrame: ChartFrameEnum.ECHARTS,
  image: 'funnel.png'
}
