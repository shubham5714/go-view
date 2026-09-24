import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const TableListConfig: ConfigType = {
  key: 'TableList',
  chartKey: 'VTableList',
  conKey: 'VCTableList',
  title: 'Scroll Ranking List',
  category: ChatCategoryEnum.TABLE,
  categoryName: ChatCategoryEnumName.TABLE,
  package: PackagesCategoryEnum.TABLES,
  chartFrame: ChartFrameEnum.COMMON,
  image: 'tables_list.png'
}
