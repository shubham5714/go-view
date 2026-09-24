<template>
  <template v-if="optionData.bar">
    <collapse-item name="Bar">
      <SettingItemBox name="Style">
        <setting-item v-if="'width' in optionData.bar.style" name="Width">
          <n-input-number v-model:value="optionData.bar.style.width" size="small" :min="1"></n-input-number>
        </setting-item>
        <setting-item v-if="'height' in (optionData.bar.style as any)" name="Height">
          <n-input-number v-model:value="(optionData.bar.style as any).height" size="small" :min="1"></n-input-number>
        </setting-item>
        <setting-item name="Corner Radius">
          <n-input-number v-model:value="optionData.bar.style.cornerRadius" size="small" :min="0"></n-input-number>
        </setting-item>
        <setting-item name="Fill Opacity">
          <n-input-number
            v-model:value="optionData.bar.style.fillOpacity"
            :step="0.1"
            size="small"
            :min="0"
            :max="1"
          ></n-input-number>
        </setting-item>
        <setting-item name="Opacity">
          <n-input-number
            v-model:value="optionData.bar.style.opacity"
            :step="0.1"
            size="small"
            :min="0"
            :max="1"
          ></n-input-number>
        </setting-item>
        <setting-item name="Texture">
          <n-select v-model:value="optionData.bar.style.texture" :options="styleConfig.texture" size="small"></n-select>
        </setting-item>
      </SettingItemBox>
    </collapse-item>
  </template>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { vChartGlobalThemeJsonType } from '@/settings/vchartThemes/index'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { styleConfig } from '@/packages/chartConfiguration/vcharts/index'

defineProps({
  optionData: {
    type: Object as PropType<vChartGlobalThemeJsonType>,
    required: true
  }
})
</script>
