import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const SankeyConfig: ConfigType = {
  key: 'Sankey',
  chartKey: 'VSankey',
  conKey: 'VCSankey',
  title: 'Sankey Chart',
  category: ChatCategoryEnum.MORE,
  categoryName: ChatCategoryEnumName.MORE,
  package: PackagesCategoryEnum.CHARTS,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'sankey.png'
}
