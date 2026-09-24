<template>
    <collapse-item name="Pagination config" :expanded="true">
      <setting-item-box :alone="false" name="Pagination settings">
        <setting-item  name="Default page" :alone="true">
          <n-input-number v-model:value="optionData.pageValue" size="small" placeholder="Font size"></n-input-number>
        </setting-item>
        <setting-item  name="Pagination" :alone="true">
          <n-select v-model:value="optionData.pageSize" size="small"
                    :options="page" />
        </setting-item>
        <setting-item  name="Pages" :alone="true">
          <n-input-number v-model:value="optionData.dataset" size="small" placeholder="Font size"></n-input-number>
        </setting-item>
      </setting-item-box>
    </collapse-item>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import {CollapseItem, SettingItem, SettingItemBox} from '@/components/Pages/ChartItemSetting'
import { option } from './config'

const page = [
  {label:'2',value:2},
  {label:'4',value:4},
  {label:'8',value:8},
  {label:'10',value:10},
  {label:'20',value:20}
]
defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})
</script>