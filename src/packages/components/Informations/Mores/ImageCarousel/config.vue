<template>
  <collapse-item name="Path" :expanded="true">
      <setting-item v-for="(item, index) in optionData.dataset" :key="index">
        <n-input-group>
          <n-input v-model:value="optionData.dataset[index]" size="small" placeholder="Please enter image URL"></n-input>
          <n-button ghost @click="optionData.dataset.splice(index, 1)"> - </n-button>
        </n-input-group>
      </setting-item>
      <setting-item>
        <n-button size="small" @click="optionData.dataset.push('')"> + Add</n-button>
      </setting-item>
  </collapse-item>
  <collapse-item name="Carousel props" :expanded="true">
    <setting-item-box name="Player">
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.autoplay" size="small" />
          <n-text>Autoplay</n-text>
        </n-space>
      </setting-item>
      <!-- 开启自动播放时，设置间隔时间 -->
      <setting-item name="Interval">
        <n-input-number v-model:value="optionData.interval" size="small" placeholder="">
          <template #suffix> Millisecond </template>
        </n-input-number>
      </setting-item>
      <setting-item name="Carousel direction">
        <n-select v-model:value="optionData.direction" :options="directions" placeholder="Select direction" />
      </setting-item>
      <setting-item name="Transition">
        <n-select v-model:value="optionData.effect" :options="effects" placeholder="Effect" />
      </setting-item>
      <setting-item name="Page size">
        <n-input-number v-model:value="optionData.slidesPerview" size="small" placeholder=""></n-input-number>
      </setting-item>
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.centeredSlides" size="small" />
          <n-text>Center display</n-text>
        </n-space>
      </setting-item>
      <setting-item name="Image style">
        <n-select v-model:value="optionData.fit" :options="fitList" placeholder="Style" />
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Indicator">
      <setting-item name="Style">
        <n-select v-model:value="optionData.dotType" :options="dotTypes" placeholder="Select style" />
      </setting-item>
      <setting-item name="Position">
        <n-select v-model:value="optionData.dotPlacement" :options="dotPlacements" placeholder="Select position" />
      </setting-item>
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.showDots" size="small" />
          <n-text>Show</n-text>
        </n-space>
      </setting-item>
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.showArrow" size="small" />
          <n-text>Arrow</n-text>
        </n-space>
      </setting-item>
      <setting-item>
        <n-space>
          <n-switch v-model:value="optionData.draggable" size="small" />
          <n-text>Drag to switch</n-text>
        </n-space>
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

// 字典
const dotTypes = [
  {
    label: 'Dot',
    value: 'dot'
  },
  {
    label: 'Line',
    value: 'line'
  }
]
const directions = [
  {
    label: 'Horizontal',
    value: 'horizontal'
  },
  {
    label: 'Vertical',
    value: 'vertical'
  }
]
const effects = [
  {
    label: 'slide',
    value: 'slide'
  },
  {
    label: 'fade',
    value: 'fade'
  },
  {
    label: 'card',
    value: 'card'
  },
  {
    label: 'custom',
    value: 'custom'
  }
]
const dotPlacements = [
  {
    label: 'Top',
    value: 'top'
  },
  {
    label: 'Bottom',
    value: 'bottom'
  },
  {
    label: 'Left',
    value: 'left'
  },
  {
    label: 'Right',
    value: 'right'
  }
]

// 适应类型
const fitList = [
  {
    value: 'fill',
    label: 'fill'
  },
  {
    value: 'contain',
    label: 'contain'
  },
  {
    value: 'cover',
    label: 'cover'
  },
  {
    value: 'scale-down',
    label: 'scale-down'
  },
  {
    value: 'none',
    label: 'none'
  }
]
</script>
