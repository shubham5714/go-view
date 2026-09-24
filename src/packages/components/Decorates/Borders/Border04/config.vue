<template>
  <CollapseItem name="Title" :expanded="true">
    <SettingItemBox name="Content" :alone="true">
      <n-input
        size="small"
        v-model:value="optionData.borderTitle"
        :minlength="1"
        type="text"
        placeholder="Please enter title"
      />
    </SettingItemBox>

    <SettingItemBox name="Style">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.borderTitleColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Text size">
        <n-input-number
          size="small"
          v-model:value="optionData.borderTitleSize"
          :min="12"
        />
      </SettingItem>
      <SettingItem name="Height">
        <n-input-number
          size="small"
          v-model:value="optionData.borderTitleHeight"
          :min="24"
        />
      </SettingItem>
      <SettingItem name="Width">
        <n-input-number
          size="small"
          v-model:value="optionData.borderTitleWidth"
          :min="50"
          :step="10"
        />
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>

  <CollapseItem name="Border" :expanded="true">
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

  <CollapseItem name="Background" :expanded="true">
    <SettingItemBox name="Color">
      <SettingItem>
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.backgroundColor"
        ></n-color-picker>
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
