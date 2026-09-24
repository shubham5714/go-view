<template>
  <!-- 工作台相关 -->
  <div class="go-chart">
    <n-layout>
      <layout-header-pro>
        <template #left>
          <header-left-btn></header-left-btn>
        </template>
        <template #center>
          <header-title></header-title>
        </template>
        <template #ri-left>
          <header-right-btn></header-right-btn>
        </template>
      </layout-header-pro>
      <n-layout-content content-style="overflow:hidden; display: flex">
        <div style="overflow:hidden; display: flex">
          <content-charts></content-charts>
          <content-layers></content-layers>
        </div>
        <content-configurations></content-configurations>
      </n-layout-content>
    </n-layout>
  </div>
  <!-- 右键 -->
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="small"
    :x="mousePosition.x"
    :y="mousePosition.y"
    :options="menuOptions"
    :show="chartEditStore.getRightMenuShow"
    :on-clickoutside="onClickOutSide"
    @select="handleMenuSelect"
  ></n-dropdown>
  <!-- 单一编辑器启动加载层 -->
  <content-load></content-load>
</template>

<script setup lang="ts">
import { loadAsyncComponent } from '@/utils'
import { LayoutHeaderPro } from '@/layout/components/LayoutHeaderPro'
import { useContextMenu } from './hooks/useContextMenu.hook'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { useChartHistoryStore } from '@/store/modules/chartHistoryStore/chartHistoryStore'
import { useChartLayoutStore } from '@/store/modules/chartLayoutStore/chartLayoutStore'
import { ChartLayoutStoreEnum } from '@/store/modules/chartLayoutStore/chartLayoutStore.d'
import { ContentLoad } from './ContentLoad'

const quiet = { loading: false } as const

const chartHistoryStoreStore = useChartHistoryStore()
const chartEditStore = useChartEditStore()
const chartLayoutStore = useChartLayoutStore()

// Show one boot overlay immediately; cleared when project data finishes loading
chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 1)

// 记录初始化
chartHistoryStoreStore.canvasInit(chartEditStore.getEditCanvas)

const HeaderLeftBtn = loadAsyncComponent(() => import('./ContentHeader/headerLeftBtn/index.vue'), quiet)
const HeaderRightBtn = loadAsyncComponent(() => import('./ContentHeader/headerRightBtn/index.vue'), quiet)
const HeaderTitle = loadAsyncComponent(() => import('./ContentHeader/headerTitle/index.vue'), quiet)
const ContentLayers = loadAsyncComponent(() => import('./ContentLayers/index.vue'), quiet)
const ContentCharts = loadAsyncComponent(() => import('./ContentCharts/index.vue'), quiet)
const ContentConfigurations = loadAsyncComponent(() => import('./ContentConfigurations/index.vue'), quiet)

// 右键
const {
  menuOptions,
  onClickOutSide,
  mousePosition,
  handleMenuSelect
} = useContextMenu()
</script>

<style lang="scss" scoped>
@include go("chart") {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  @include background-image("background-image");
}
</style>
