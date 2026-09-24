<template>
  <global-setting :optionData="optionData"></global-setting>
  <collapse-item name="Word Cloud" expanded>
    <setting-item-box name="Shape">
      <setting-item>
        <n-select v-model:value="optionData.series[0].shape" size="small" :options="ShapeEnumList" />
      </setting-item>
      <setting-item>
        <n-checkbox v-model:checked="optionData.series[0].drawOutOfBound" size="small">Allow overflow</n-checkbox>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Layout">
      <setting-item name="Width">
        <n-slider
          v-model:value="series.width"
          :min="0"
          :max="100"
          :format-tooltip="sliderFormatTooltip"
          @update:value="updateWidth"
        ></n-slider>
      </setting-item>
      <setting-item name="Height">
        <n-slider
          v-model:value="series.height"
          :min="0"
          :max="100"
          :format-tooltip="sliderFormatTooltip"
          @update:value="updateHeight"
        ></n-slider>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Style" alone>
      <setting-item name="Font range (min/max)">
        <n-slider v-model:value="optionData.series[0].sizeRange" range :step="1" :min="6" :max="100" />
      </setting-item>
      <setting-item name="Rotation angle">
        <n-slider v-model:value="series.rotationStep" :step="15" :min="0" :max="45" @update:value="updateRotation" />
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { option, ShapeEnumList } from './config'
// eslint-disable-next-line no-unused-vars
import { GlobalSetting, CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const series = computed(() => {
  const { width, height, rotationStep } = props.optionData.series[0]
  return {
    width: +width.replace('%', ''),
    height: +height.replace('%', ''),
    rotationStep
  }
})

const sliderFormatTooltip = (v: number) => {
  return `${v}%`
}

const updateWidth = (value: number) => {
  props.optionData.series[0].width = `${value}%`
}

const updateHeight = (value: number) => {
  props.optionData.series[0].height = `${value}%`
}

const updateRotation = (value: number) => {
  props.optionData.series[0].rotationStep = value
  props.optionData.series[0].rotationRange = value === 0 ? [0, 0] : [-90, 90]
}
</script>
