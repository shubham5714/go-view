<template>
  <CollapseItem name="Style" :expanded="true">
    <SettingItemBox
      :name="`Color-${index + 1}`"
      v-for="(item, index) in optionData.colors"
      :key="index"
    >
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.colors[index]"
        ></n-color-picker>
      </SettingItem>
      <SettingItem>
        <n-button
          size="small"
          @click="optionData.colors[index] = option.colors[index]"
        >
          Restore Default
        </n-button>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>

  <CollapseItem name="Animation" :expanded="true">
    <SettingItemBox name="Speed (s)">
      <SettingItem>
        <n-input-number
          v-model:value="optionData.dur"
          size="small"
          :step="1"
          :min="2"
        ></n-input-number>
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
