<template>
  <CollapseItem name="Line" :expanded="true">
    <SettingItemBox name="Detail">
      <SettingItem name="Outer ring radius">
        <n-input-number
            size="small"
            v-model:value="optionData.outCircle"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Inner circle radius">
        <n-input-number
            size="small"
            v-model:value="optionData.inCircle"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Outer ring thickness">
        <n-input-number
            size="small"
            v-model:value="optionData.outCircleWidth"
        ></n-input-number>
      </SettingItem>

      <SettingItem name="Outer ring color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.outCircleColor"></n-color-picker>
      </SettingItem>
      <SettingItem name="Inner circle color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.inCircleColor"></n-color-picker>
      </SettingItem>
    </SettingItemBox>

  </CollapseItem>

</template>

<script setup lang="ts">
import { PropType } from 'vue'
import {
  CollapseItem,
  SettingItemBox,
  SettingItem
} from '@/components/Pages/ChartItemSetting'
import { option } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

</script>
