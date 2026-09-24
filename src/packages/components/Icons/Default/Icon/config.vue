<template>
  <collapse-item name="Properties" :expanded="true">
    <setting-item-box name="Style">
      <setting-item name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.color"></n-color-picker>
      </setting-item>
      <setting-item name="Size">
        <n-input-number v-model:value="optionData.size" size="small" :min="0" placeholder="Size"></n-input-number>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Quick rotate">
      <setting-item name="You can also use the common [Transform] to rotate">
        <n-select v-model:value="optionData.rotate" size="small" :options="rotateMode"></n-select>
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { option } from './config'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

// 旋转方式
const rotateMode = [
  {
    value: 0,
    label: '0°'
  },
  {
    value: 90,
    label: '90°'
  },
  {
    value: 180,
    label: '180°'
  },
  {
    value: 270,
    label: '270°'
  }
]
</script>
