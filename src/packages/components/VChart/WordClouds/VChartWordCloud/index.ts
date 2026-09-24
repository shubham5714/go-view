import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const VChartWordCloudConfig: ConfigType = {
  key: 'VChartWordCloud',
  chartKey: 'VVChartWordCloud',
  conKey: 'VCVChartWordCloud',
  title: 'Word Cloud - VChart',
  category: ChatCategoryEnum.WORDCLOUD,
  categoryName: ChatCategoryEnumName.WORDCLOUD,
  package: PackagesCategoryEnum.VCHART,
  chartFrame: ChartFrameEnum.VCHART,
  image: 'vchart_word_cloud.png'
}
