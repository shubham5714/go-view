<template>
  <collapse-item name="Info" :expanded="true">
    <setting-item-box name="Text" :alone="true">
      <setting-item>
        <n-input v-model:value="optionData.dataset" type="textarea" size="small"></n-input>
      </setting-item>
    </setting-item-box>
  </collapse-item>

  <collapse-item name="Style" :expanded="true">
    <setting-item-box name="Text">
      <setting-item name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.fontColor"></n-color-picker>
      </setting-item>
      <setting-item name="Font size">
        <n-input-number v-model:value="optionData.fontSize" size="small" placeholder="Font size"></n-input-number>
      </setting-item>
      <setting-item name="Font weight">
        <n-select v-model:value="optionData.fontWeight" size="small" :options="fontWeightOptions" />
      </setting-item>

      <setting-item name="Letter spacing">
        <n-input-number v-model:value="optionData.letterSpacing" size="small" placeholder="Input letter spacing"></n-input-number>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Shadow">
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.showShadow" size="small" />
          <n-text>Show shadow</n-text>
        </n-space>
      </setting-item>
      <setting-item name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.colorShadow"></n-color-picker
      ></setting-item>
      <setting-item name="x">
        <n-input-number v-model:value="optionData.hShadow" size="small"></n-input-number
      ></setting-item>
      <setting-item name="y">
        <n-input-number v-model:value="optionData.vShadow" size="small"></n-input-number
      ></setting-item>
      <setting-item name="Blur">
        <n-input-number v-model:value="optionData.blurShadow" size="small"></n-input-number
      ></setting-item>
    </setting-item-box>

    <setting-item-box name="Animation">
      <setting-item name="Animation speed">
        <n-input-number
          v-model:value="optionData.animationSpeed"
          size="small"
          placeholder="Animation speed"
          :min="0"
        ></n-input-number>
      </setting-item>
      <setting-item name="Animation interval">
        <n-input-number
          v-model:value="optionData.animationTime"
          size="small"
          placeholder="Animation interval"
          :min="0"
        ></n-input-number>
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { option, FontWeightEnum, FontWeightObject } from './config'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const fontWeightOptions = [
  {
    label: FontWeightEnum.NORMAL,
    value: FontWeightObject[FontWeightEnum.NORMAL]
  },
  {
    label: FontWeightEnum.BOLD,
    value: FontWeightObject[FontWeightEnum.BOLD]
  }
]
</script>
