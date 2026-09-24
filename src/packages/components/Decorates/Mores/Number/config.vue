<template>
  <CollapseItem name="Content" :expanded="true">
    <SettingItemBox name="Value">
      <SettingItem name="End value">
        <n-input-number
          v-model:value="optionData.dataset"
          size="small"
          :min="1"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Size">
        <n-input-number
          v-model:value="optionData.numberSize"
          size="small"
          :min="1"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Precision">
        <n-input-number
          v-model:value="optionData.precision"
          size="small"
          :min="0"
        ></n-input-number>
      </SettingItem>
      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.showSeparator" size="small" />
          <n-text>Show separator</n-text>
        </n-space>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Value">
      <SettingItem name="Prefix">
        <n-input v-model:value="optionData.prefixText" size="small"></n-input>
      </SettingItem>
      <SettingItem name="Suffix">
        <n-input v-model:value="optionData.suffixText" size="small"></n-input>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Color">
      <SettingItem name="Prefix">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.prefixColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Suffix">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.suffixColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Value">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.numberColor"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>

  <CollapseItem name="Animation" :expanded="true">
    <SettingItemBox name="Speed (s)">
      <SettingItem>
        <n-input-number
          v-model:value="optionData.dur"
          size="small"
          :step="0.5"
          :min="0.5"
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
