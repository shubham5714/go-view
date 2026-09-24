<template>
  <CollapseItem
    v-for="(item, index) in seriesList"
    :key="index"
    name="Liquid"
    :expanded="true"
  >
    <SettingItemBox name="Content">
      <SettingItem name="Value">
        <n-input-number
          v-model:value="item.data[0]"
          :min="0"
          :step="0.01"
          size="small"
          placeholder="Liquid value"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Shape">
        <n-select v-model:value="item.shape" :options="shapes" placeholder="Select shape" />
      </SettingItem>
      <SettingItem name="Text">
        <n-input-number v-model:value="item.label.normal.textStyle.fontSize" :min="0" :step="1" size="small" placeholder="Text size">
        </n-input-number>
      </SettingItem>
      <SettingItem name="Color 1">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.color[0].colorStops[0].color"
      ></n-color-picker>
      </SettingItem>
      <SettingItem name="Color 2">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.color[0].colorStops[1].color"
      ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Background" :alone="true">
      <SettingItem>
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.backgroundStyle.color"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { option, shapes } from './config'
import {
  CollapseItem,
  SettingItemBox,
  SettingItem,
} from '@/components/Pages/ChartItemSetting'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true,
  },
})

const seriesList = computed(() => {
  return props.optionData.series
})
</script>
