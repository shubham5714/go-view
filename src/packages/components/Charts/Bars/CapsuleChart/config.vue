<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"> </global-setting>
  <!-- 胶囊柱图 -->
  <collapse-item name="Capsule Bar Chart" expanded>
    <SettingItemBox name="Layout">
      <setting-item name="Left margin">
        <n-input-number v-model:value="optionData.paddingLeft" :min="10" :step="1" size="small"></n-input-number>
      </setting-item>
      <setting-item name="Right margin">
        <n-input-number v-model:value="optionData.paddingRight" :min="10" :step="1" size="small"></n-input-number>
      </setting-item>
      <setting-item name="Block height (px)">
        <n-input-number v-model:value="optionData.itemHeight" :min="0" :step="1" size="small"></n-input-number>
      </setting-item>
    </SettingItemBox>
    <SettingItemBox name="Text">
      <setting-item name="All text size">
        <n-input-number v-model:value="optionData.valueFontSize" :min="0" :step="1" size="small"></n-input-number>
      </setting-item>
      <setting-item name="Unit">
        <n-input v-model:value="optionData.unit" size="small"></n-input>
      </setting-item>

      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.showValue" size="small"></n-switch>
          <n-text>Show value</n-text>
        </n-space>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Color">
      <setting-item v-for="(item, index) in optionData.colors" :key="index" :name="`Color${index}`">
        <n-color-picker v-model:value="optionData.colors[index]" size="small" :modes="['hex']"></n-color-picker>
      </setting-item>
    </SettingItemBox>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { GlobalSetting, CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'

import { option } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option & GlobalThemeJsonType>,
    required: true
  }
})
</script>
