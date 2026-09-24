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
      <setting-item name="Font size">
        <n-input-number v-model:value="optionData.size" size="small" placeholder="Font size"></n-input-number>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Gradient params">
      <setting-item name="Start value">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.gradient.from"></n-color-picker>
      </setting-item>
      <setting-item name="End value">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.gradient.to"></n-color-picker>
      </setting-item>
      <setting-item name="Offset angle">
        <n-input-number v-model:value="optionData.gradient.deg" size="small" placeholder="Color rotate"></n-input-number>
      </setting-item>
    </setting-item-box>

  </collapse-item>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { option } from './config'
import {
  CollapseItem,
  SettingItemBox,
  SettingItem
} from '@/components/Pages/ChartItemSetting'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})
</script>
