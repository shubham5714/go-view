<template>
  <!-- todo 补充常用配置项 -->
  <div v-if="optionData.legends">
    <div v-for="(legendItem, index) in optionData.legends" :key="index">
      <collapse-item name="Legend">
        <template #header>
          <n-switch v-model:value="legendItem.visible" size="small"></n-switch>
        </template>
        <setting-item-box name="Layout">
          <setting-item name="Position">
            <n-select v-model:value="legendItem.orient" size="small" :options="legendsConfig.orient" />
          </setting-item>
          <setting-item name="Alignment">
            <n-select v-model:value="legendItem.position" size="small" :options="legendsConfig.position" />
          </setting-item>
        </setting-item-box>
        <setting-item-box name="Item">
          <FontStyle :style="toRefs(legendItem.item.label.style)"></FontStyle>
        </setting-item-box>
      </collapse-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, toRefs } from 'vue'
import { legendsConfig } from '@/packages/chartConfiguration/vcharts/index'
import FontStyle from './common/FontStyle.vue'
import { vChartGlobalThemeJsonType } from '@/settings/vchartThemes/index'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

defineProps({
  optionData: {
    type: Object as PropType<vChartGlobalThemeJsonType>,
    required: true
  }
})
</script>
