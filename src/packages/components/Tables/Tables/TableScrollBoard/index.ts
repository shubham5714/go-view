import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const TableScrollBoardConfig: ConfigType = {
  key: 'TableScrollBoard',
  chartKey: 'VTableScrollBoard',
  conKey: 'VCTableScrollBoard',
  title: 'Scroll Board',
  category: ChatCategoryEnum.TABLE,
  categoryName: ChatCategoryEnumName.TABLE,
  package: PackagesCategoryEnum.TABLES,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'table_scrollboard.png'
}
