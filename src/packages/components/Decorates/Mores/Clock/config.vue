<template>
  <CollapseItem name="Clock" expanded>
    <SettingItemBox name="Dial">
      <SettingItem name="Background color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.bgColor"></n-color-picker>
      </SettingItem>
      <SettingItem name="Border color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.borderColor"></n-color-picker>
      </SettingItem>
      <SettingItem name="Border size">
        <n-input-number v-model:value="optionData.border" size="small" :step="0.5" :min="0"></n-input-number>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Pointer">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.color"></n-color-picker>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})
</script>
