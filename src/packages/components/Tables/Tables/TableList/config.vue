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
      <SettingItem name="Value unit">
        <n-input
          v-model:value="optionData.unit"
          size="small"
          placeholder="Value unit"
        ></n-input>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Style">
      <SettingItem name="Main color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Data color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.textColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Bottom line">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.borderColor"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Font style">
       <SettingItem name="Index font">
        <n-input-number
          size="small"
          v-model:value="optionData.indexFontSize"
          :min="12"
        />
      </SettingItem>
      <SettingItem name="Left data font">
        <n-input-number
          size="small"
          v-model:value="optionData.leftFontSize"
          :min="12"
        />
      </SettingItem>
      <SettingItem name="Right data font">
        <n-input-number
          size="small"
          v-model:value="optionData.rightFontSize"
          :min="12"
        />
      </SettingItem>
    </SettingItemBox>
      
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import {
  CollapseItem,
  SettingItemBox,
  SettingItem,
} from '@/components/Pages/ChartItemSetting'
import { option } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true,
  },
})
</script>
