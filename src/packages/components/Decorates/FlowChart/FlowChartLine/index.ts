import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum,ChatCategoryEnumName } from '../../index.d'

export const FlowChartLineConfig: ConfigType = {
    key: 'FlowChartLine',
    chartKey: 'VFlowChartLine',
    conKey: 'VCFlowChartLine',
    title: 'Flow Line',
    category: ChatCategoryEnum.FlowChart,
    categoryName: ChatCategoryEnumName.FlowChart,
    package: PackagesCategoryEnum.DECORATES,
    chartFrame: ChartFrameEnum.STATIC,
    image: 'flow-zhexian.png'
}
