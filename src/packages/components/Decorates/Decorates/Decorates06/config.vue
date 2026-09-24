<template>
  <CollapseItem name="Content" expanded>
    <SettingItemBox name="Text" alone>
      <SettingItem>
        <n-input v-model:value="optionData.dataset" size="small"></n-input>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Style">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.textColor"></n-color-picker>
      </SettingItem>
      <SettingItem name="Size">
        <n-input-number v-model:value="optionData.textSize" size="small" :min="12"></n-input-number>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>

  <CollapseItem name="Style" expanded>
    <SettingItemBox :name="`Color-${index + 1}`" v-for="(item, index) in optionData.colors" :key="index">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.colors[index]"></n-color-picker>
      </SettingItem>
      <SettingItem>
        <n-button size="small" @click="optionData.colors[index] = option.colors[index]"> Restore default </n-button>
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
