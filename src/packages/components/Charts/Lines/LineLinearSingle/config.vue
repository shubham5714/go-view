<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem
    v-for="(item, index) in seriesList"
    :key="index"
    :name="`Style`"
    :expanded="true"
  >
    <SettingItemBox name="Line">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.lineStyle.color.colorStops[0].color"
       ></n-color-picker>
      </SettingItem>
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.lineStyle.color.colorStops[1].color"
       ></n-color-picker>
      </SettingItem>
      <SettingItem name="Width">
        <n-input-number
          v-model:value="item.lineStyle.width"
          :min="1"
          :max="100"
          size="small"
          placeholder="Auto calculate"
       ></n-input-number>
      </SettingItem>
      <SettingItem name="Type">
        <n-select
          v-model:value="item.lineStyle.type"
          size="small"
          :options="lineConf.lineStyle.type"
       ></n-select>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Solid dot">
      <SettingItem name="Size">
        <n-input-number
          v-model:value="item.symbolSize"
          :min="1"
          :max="100"
          size="small"
          placeholder="Auto calculate"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Shadow" :alone="true">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.lineStyle.shadowColor"
      ></n-color-picker>
      </SettingItem>
      
    </SettingItemBox>
    <SettingItemBox name="Settings">
     <SettingItem name="Shadow">
        <n-button
          size="small"
          @click="item.lineStyle.shadowColor = 'rgba(0, 0, 0, 0)'"
        >
          Remove Shadow
        </n-button>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { lineConf } from '@/packages/chartConfiguration/echarts/index'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'
import {
  GlobalSetting,
  CollapseItem,
  SettingItemBox,
  SettingItem
} from '@/components/Pages/ChartItemSetting'

const props = defineProps({
  optionData: {
    type: Object as PropType<GlobalThemeJsonType>,
    required: true
  }
})

const seriesList = computed(() => {
  return props.optionData.series
})
</script>
