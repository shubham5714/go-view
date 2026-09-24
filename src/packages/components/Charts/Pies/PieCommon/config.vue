<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem name="Pie config" :expanded="true">
    <SettingItemBox name="Type">
      <SettingItem>
        <n-select v-model:value="optionData.type" size="small" :options="fontWeightOptions" />
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Animation" :alone="true">
      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.isCarousel" size="small"></n-switch>
          <n-text>On<n-text :depth="3">(Legend will be hidden automatically)</n-text></n-text>
        </n-space>
      </SettingItem>
      <SettingItem>
        <n-text :depth="3">Force-show legend when there is no clickable legend</n-text>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Shape">
      <setting-item name="Inner range">
        <n-input v-model:value="optionData.series[0].radius[0]" size="small"></n-input>
      </setting-item>
      <setting-item name="Outer range">
        <n-input v-model:value="optionData.series[0].radius[1]" size="small"></n-input>
      </setting-item>
      <setting-item name="X-axis center">
        <n-input v-model:value="optionData.series[0].center[0]" size="small"></n-input>
      </setting-item>
      <setting-item name="Y-axis center">
        <n-input v-model:value="optionData.series[0].center[1]" size="small"></n-input>
      </setting-item>
    </SettingItemBox>
    <SettingItemBox name="Label">
      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.series[0].label.show" size="small"></n-switch>
          <n-text>Show label</n-text>
        </n-space>
      </SettingItem>
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.series[0].labelLine.show" size="small"></n-switch>
          <n-text>Guide line</n-text>
        </n-space>
      </setting-item>
      <SettingItem name="Position">
        <n-select v-model:value="optionData.series[0].label.position" size="small" :options="labelConfig.position" />
      </SettingItem>
      <setting-item name="Display type">
        <n-select v-model:value="optionData.series[0].label.formatter" size="small" :options="labelFormatterOptions" />
      </setting-item>
    </SettingItemBox>
    <setting-item-box name="Font">
      <setting-item name="Size">
        <n-input-number v-model:value="optionData.series[0].label.fontSize" size="small" :min="0"></n-input-number>
      </setting-item>
      <setting-item name="Color" v-if="optionData.series[0].label.color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.series[0].label.color"></n-color-picker>
      </setting-item>
      <SettingItem name="Bold text" v-if="optionData.series[0].label.fontWeight">
        <n-select
          v-model:value="optionData.series[0].label.fontWeight"
          size="small"
          :options="labelConfig.fontWeight"
        />
      </SettingItem>
      <setting-item name="Text border size" v-if="optionData.series[0].label.textBorderWidth > -1">
        <n-input-number
          v-model:value="optionData.series[0].label.textBorderWidth"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
      <setting-item name="Text border color" v-if="optionData.series[0].label.textBorderColor">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.series[0].label.textBorderColor"
        ></n-color-picker>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Segment style">
      <setting-item name="Border radius">
        <n-input-number
          v-model:value="optionData.series[0].itemStyle.borderRadius"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
      <setting-item name="Line width">
        <n-input-number
          v-model:value="optionData.series[0].itemStyle.borderWidth"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Mouse focus">
      <setting-item name="Text size">
        <n-input-number
          v-model:value="optionData.series[0].emphasis.label.fontSize"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
      <SettingItem name="Bold text" v-if="optionData.series[0].emphasis.label.fontWeight">
        <n-select
          v-model:value="optionData.series[0].emphasis.label.fontWeight"
          size="small"
          :options="labelConfig.fontWeight"
        />
      </SettingItem>
    </setting-item-box>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, watch } from 'vue'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'
import { GlobalSetting, CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { PieTypeObject, PieTypeEnum } from './config'
import { labelConfig } from '@/packages/chartConfiguration/echarts'

const props = defineProps({
  optionData: {
    type: Object as PropType<GlobalThemeJsonType>,
    required: true
  }
})
const fontWeightOptions = [
  {
    label: PieTypeEnum.NORMAL,
    value: PieTypeObject[PieTypeEnum.NORMAL]
  },
  {
    label: PieTypeEnum.RING,
    value: PieTypeObject[PieTypeEnum.RING]
  },
  {
    label: PieTypeEnum.ROSE,
    value: PieTypeObject[PieTypeEnum.ROSE]
  }
]

const labelFormatterOptions = [
  { label: 'Data name', value: '{b}' },
  { label: 'Percent', value: '{d}' },
  { label: 'Column: Percent', value: '{b}:{d}%' }
]
</script>
