<template>
  <collapse-item name="Table settings" :expanded="true">
    <n-tag type="primary">If config has no effect, check the preview page</n-tag>
    <setting-item-box :alone="true" name="Alignment">
      <setting-item :alone="true">
        <n-select
          v-model:value="optionData.align"
          size="small"
          :options="[
            { label: 'Align left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Align right', value: 'right' }
          ]"
        />
      </setting-item>
    </setting-item-box>
    <setting-item-box :alone="false" name="Pagination settings">
      <setting-item name="Default page" :alone="true">
        <n-input-number v-model:value="optionData.pagination.page" size="small" placeholder="Font size"></n-input-number>
      </setting-item>
      <setting-item name="Pagination" :alone="true">
        <n-select v-model:value="optionData.pagination.pageSize" size="small" :options="page" />
      </setting-item>
    </setting-item-box>
    <setting-item-box :alone="false" name="Table data">
      <SettingItem name="Header name" class="form_name">
        <div style="width: 260px">
          <n-input v-model:value="header" size="small" placeholder="Header data (comma-separated)"></n-input>
        </div>
      </SettingItem>
    </setting-item-box>
    <setting-item-box :alone="false" name="Table style">
      <SettingItem name="Show border" :alone="true">
        <n-select v-model:value="(optionData as any).style.border" size="small" :options="borderFlag" />
      </SettingItem>
      <SettingItem name="Bottom border" :alone="true">
        <n-select
          v-model:value="(optionData as any).style.bottomBordered"
          size="small"
          :options="bottom_borderedFlag"
        />
      </SettingItem>
      <SettingItem name="Column divider" :alone="true">
        <n-select v-model:value="(optionData as any).style.singleLine" size="small" :options="columnFlag" />
      </SettingItem>
      <SettingItem name="Row divider" :alone="true">
        <n-select v-model:value="(optionData as any).style.singleColumn" size="small" :options="lineFlag" />
      </SettingItem>
      <SettingItem name="Stripes" :alone="true">
        <n-select v-model:value="(optionData as any).style.striped" size="small" :options="stripedFlag" />
      </SettingItem>
      <setting-item name="Font size" :alone="true">
        <n-input-number
          v-model:value="optionData.style.fontSize"
          :min="12"
          size="small"
          placeholder="Font size"
        ></n-input-number>
      </setting-item>
      <setting-item name="Border width" :alone="true">
        <n-input-number
          v-model:value="optionData.style.borderWidth"
          :min="0"
          size="small"
          placeholder="Font size"
        ></n-input-number>
      </setting-item>
      <setting-item name="Border color" :alone="true">
        <n-color-picker size="small" :modes="['rgb']" v-model:value="optionData.style.borderColor"></n-color-picker>
      </setting-item>
      <setting-item name="Border style" :alone="true">
        <n-select v-model:value="optionData.style.borderStyle" size="small" :options="borderStyleFlag" />
      </setting-item>
      <SettingItem name="Table search (client-side)" :alone="true">
        <n-select v-model:value="optionData.inputShow" size="small" :options="inputSelect" />
      </SettingItem>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType, watch, ref } from 'vue'
import { option } from './config'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

const page = [
  { label: '2', value: 2 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '30', value: 30 }
]
const borderFlag = [
  { label: 'Show', value: 'on' },
  { label: 'Hide', value: 'off' }
]
const columnFlag = [
  { label: 'Show', value: 'off' },
  { label: 'Hide', value: 'on' }
]
const lineFlag = [
  { label: 'Show', value: 'off' },
  { label: 'Hide', value: 'on' }
]
const bottom_borderedFlag = [
  { label: 'Show', value: 'on' },
  { label: 'Hide', value: 'off' }
]
const stripedFlag = [
  { label: 'Show', value: 'on' },
  { label: 'Hide', value: 'off' }
]
const borderStyleFlag = [
  { label: 'Solid border', value: 'solid' },
  { label: 'Dashed border', value: 'dashed' },
  { label: 'Dotted border', value: 'dotted' },
  { label: 'Double border', value: 'double' }
]
const inputSelect = [
  { label: 'Disable', value: 'none' },
  { label: 'Enable', value: 'flex' }
]
const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const header = ref()
const median = ref<string[]>([])
props.optionData.dataset.dimensions.forEach(item => {
  median.value.push(item.title)
})

//转string
watch(
  () => props.optionData,
  () => {
    median.value = []
    props.optionData.dataset.dimensions.forEach(item => {
      median.value.push(item.title)
    })
    header.value = median.value.toString()
  },
  {
    deep: false,
    immediate: true
  }
)

//更新columns
watch([header], ([headerNew], [headerOld]) => {
  if (headerNew !== headerOld) {
    headerNew.split(',').forEach((item: string, index: number) => {
      if (index + 1 <= props.optionData.dataset.dimensions.length) {
        props.optionData.dataset.dimensions[index].title = headerNew.split(',')[index]
      }
    })
  }
})
</script>
