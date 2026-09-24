<template>
  <CollapseItem name="List" :expanded="true">
    <SettingItemBox name="Basic">
      <SettingItem name="Row count">
        <n-input-number
          v-model:value="optionData.rowNum"
          :min="1"
          size="small"
          placeholder="Please enter auto-calc"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Carousel interval (s)">
        <n-input-number
          v-model:value="optionData.waitTime"
          :min="1"
          size="small"
          placeholder="Please enter carousel interval"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Header height">
        <n-input-number
          v-model:value="optionData.headerHeight"
          :min="1"
          size="small"
          placeholder="Please enter header height"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Show row number">
        <n-switch size="small" v-model:value="optionData.index" />
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Config" :alone="true">
      <SettingItem name="Header data">
        <n-input v-model:value="header" :min="1" size="small" placeholder="Header data (comma-separated)"></n-input>
      </SettingItem>
      <SettingItem name="Column alignment">
        <n-input v-model:value="align" :min="1" size="small" placeholder="Alignment (comma-separated)"></n-input>
      </SettingItem>
      <SettingItem name="Column width">
        <n-input v-model:value="columnWidth" :min="1" size="small" placeholder="Column width (comma-separated)"></n-input>
      </SettingItem>
      <SettingItem name="Carousel mode">
        <n-select
          v-model:value="optionData.carousel"
          :options="[
            { label: 'Single-item carousel', value: 'single' },
            { label: 'Page carousel', value: 'page' },
          ]"
        />
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Style">
      <SettingItem name="Header background">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.headerBGC"></n-color-picker>
      </SettingItem>
      <SettingItem name="Odd row background">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.oddRowBGC"></n-color-picker>
      </SettingItem>
      <SettingItem name="Even row background">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.evenRowBGC"></n-color-picker>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const header = ref()
const align = ref()
const columnWidth = ref()

watch(
  () => props.optionData,
  newData => {
    header.value = props.optionData.header.toString()
    align.value = props.optionData.align.toString()
    columnWidth.value = props.optionData.columnWidth.toString()
  },
  {
    deep: false,
    immediate: true
  }
)

watch([header, align, columnWidth], ([headerNew, alignNew, columnWidthNew], [headerOld, alignOld, columnWidthOld]) => {
  if (headerNew !== headerOld) {
    props.optionData.header = headerNew.split(',')
  }
  if (alignNew !== alignOld) {
    props.optionData.align = alignNew.split(',')
  }
  if (columnWidthNew !== columnWidthOld) {
    // @ts-ignore
    props.optionData.columnWidth = columnWidthNew.split(',')
  }
})
</script>
