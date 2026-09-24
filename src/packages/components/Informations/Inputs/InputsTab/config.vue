<template>
  <collapse-item name="Tabs config" :expanded="true">
    <setting-item-box name="Label type" :alone="true">
      <n-select size="small" v-model:value="optionData.tabType" :options="tabTypeOptions" />
    </setting-item-box>
    <setting-item-box name="Default value" :alone="true">
       <n-select size="small" v-model:value="optionData.tabLabel" value-field="label" :options="optionData.dataset" />
    </setting-item-box>
  </collapse-item>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { CollapseItem, SettingItemBox } from '@/components/Pages/ChartItemSetting'
import { option } from './config'

defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const tabTypeOptions = [
  {
    label: 'Line',
    value: 'bar'
  },
  {
    label: 'Segment',
    value: 'segment'
  }
]
</script>
