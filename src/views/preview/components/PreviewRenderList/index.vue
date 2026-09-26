<template>
  <div
    class="chart-item"
    :id="item.id"
    v-for="(item, index) in chartEditStore.componentList"
    :class="animationsClass(item.styles.animations)"
    :key="item.id"
    :style="{
      ...getComponentAttrStyle(item.attr, index),
      ...getTransformStyle(item.styles),
      ...getStatusStyle(item.status),
      ...getPreviewConfigStyle(item.preview),
      ...getBlendModeStyle(item.styles) as any,
      ...getSizeStyle(item.attr)
    }"
  >
    <!-- 分组 -->
    <preview-render-group
      v-if="item.isGroup"
      :groupData="(item as CreateComponentGroupType)"
      :groupIndex="index"
      :themeSetting="themeSetting"
      :themeColor="themeColor"
    ></preview-render-group>

    <!-- 单组件 -->
    <template v-else>
      <component
        :is="item.chartConfig.chartKey"
        :id="item.id"
        :chartConfig="item"
        :themeSetting="themeSetting"
        :themeColor="themeColor"
        :style="{ 
          ...getSizeStyle(item.attr),
          ...getFilterStyle(item.styles)
        }"
        v-on="useLifeHandler(item)"
      ></component>
      <chart-data-fetch-indicator :component-id="item.id" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PreviewRenderGroup } from '../PreviewRenderGroup/index'
import { CreateComponentGroupType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { animationsClass, getFilterStyle, getTransformStyle, getBlendModeStyle, colorCustomMerge } from '@/utils'
import { getSizeStyle, getComponentAttrStyle, getStatusStyle, getPreviewConfigStyle } from '../../utils'
import { useLifeHandler } from '@/hooks'
import { ChartDataFetchIndicator } from '@/components/ChartDataFetchIndicator'

// Pond / AJAX / MCP polling is owned by previewFetchSession (survives page remounts).
const chartEditStore = useChartEditStore()

// 主题色
const themeSetting = computed(() => {
  const chartThemeSetting = chartEditStore.editCanvasConfig.chartThemeSetting
  return chartThemeSetting
})

// 配置项
const themeColor = computed(() => {
  const colorCustomMergeData = colorCustomMerge(chartEditStore.editCanvasConfig.chartCustomThemeColorInfo)
  return colorCustomMergeData[chartEditStore.editCanvasConfig.chartThemeColor]
})
</script>

<style lang="scss" scoped>
.chart-item {
  position: absolute;
}
</style>
