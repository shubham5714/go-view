<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <collapse-item name="Video" expanded>
    <setting-item-box name="Source" alone>
      <setting-item name="Custom source">
        <n-input v-model:value="optionData.dataset" size="small"></n-input>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Control">
      <setting-item>
        <n-checkbox v-model:checked="optionData.loop" size="small">Loop</n-checkbox>
      </setting-item>
      <setting-item>
        <n-checkbox v-model:checked="optionData.muted" size="small">Mute</n-checkbox>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Style">
      <setting-item name="Type">
        <n-select v-model:value="optionData.fit" size="small" :options="fitList"></n-select>
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { option } from './config'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

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

defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})
</script>
