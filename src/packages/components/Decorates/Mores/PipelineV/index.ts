import { ConfigType, PackagesCategoryEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const PipelineVConfig: ConfigType = {
  key: 'PipelineV',
  chartKey: 'VPipelineV',
  conKey: 'VCPipelineV',
  title: 'Pipeline Vertical',
  category: ChatCategoryEnum.MORE,
  categoryName: ChatCategoryEnumName.MORE,
  package: PackagesCategoryEnum.DECORATES,
  image: 'Pipeline_V.png'
}

