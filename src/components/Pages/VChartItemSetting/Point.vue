<template>
  <template v-if="optionData.point">
    <collapse-item name="Point">
      <template #header>
        <n-switch v-model:value="optionData.point.visible" size="small"></n-switch>
      </template>

      <setting-item-box name="Style">
        <setting-item name="Shape">
          <n-select v-model:value="optionData.point.style.symbolType" size="small" :options="styleConfig.symbolType" />
        </setting-item>

        <setting-item name="Size">
          <n-input-number v-model:value="optionData.point.style.size" :min="0" size="small" />
        </setting-item>
        <setting-item name="Fill Opacity">
          <n-input-number v-model:value="optionData.point.style.fillOpacity" :step="0.1" :min="0" size="small" />
        </setting-item>
        <setting-item name="Border Width">
          <n-input-number v-model:value="optionData.point.style.lineWidth" :min="0" size="small" />
        </setting-item>
        <setting-item name="Border Color">
          <n-color-picker v-model:value="optionData.point.style.stroke" size="small" />
        </setting-item>
        <setting-item name="Border Opacity">
          <n-input-number v-model:value="optionData.point.style.strokeOpacity" :step="0.1" :min="0" size="small" />
        </setting-item>
        <setting-item name="Offset X">
          <n-input-number v-model:value="optionData.point.style.dx" :min="0" size="small" />
        </setting-item>
        <setting-item name="Offset Y">
          <n-input-number v-model:value="optionData.point.style.dy" :min="0" size="small" />
        </setting-item>
      </setting-item-box>
    </collapse-item>
  </template>
</template>

<script setup lang="ts">
import { PropType, toRefs } from 'vue'
import { styleConfig } from '@/packages/chartConfiguration/vcharts/index'
import FontStyle from './common/FontStyle.vue'
import { vChartGlobalThemeJsonType } from '@/settings/vchartThemes/index'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

defineProps({
  optionData: {
    type: Object as PropType<vChartGlobalThemeJsonType>,
    required: true
  },
  positionOptions: {
    type: Array,
    required: false
  }
})
</script>
