<template>
  <collapse-item name="Flip" :expanded="true">
    <setting-item-box name="Content">
      <setting-item name="Initial value">
        <n-input-number v-model:value="optionData.dataset" size="small" :min="0"></n-input-number>
      </setting-item>
      <setting-item name="Flip count">
        <n-input-number v-model:value="optionData.flipperLength" size="small" :min="1"></n-input-number>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Style">
      <setting-item name="Width">
        <n-input-number v-model:value="optionData.flipperWidth" size="small" :min="1"></n-input-number>
      </setting-item>
      <setting-item name="Height">
        <n-input-number v-model:value="optionData.flipperHeight" size="small" :min="1"></n-input-number>
      </setting-item>
      <setting-item name="Border">
        <n-input-number v-model:value="optionData.flipperBorderWidth" size="small" :min="0" :max="10"></n-input-number>
      </setting-item>
      <setting-item name="Rounded">
        <n-input-number v-model:value="optionData.flipperRadius" size="small" :min="0"></n-input-number>
      </setting-item>
      <setting-item name="Flip interval">
        <n-input-number v-model:value="optionData.flipperGap" size="small" :min="0"></n-input-number>
      </setting-item>
      <setting-item />
      <setting-item name="Background color">
        <n-color-picker
          size="small"
          :show-alpha="false"
          :modes="['hex']"
          v-model:value="optionData.flipperBgColor"
        ></n-color-picker>
      </setting-item>
      <setting-item name="Font color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.flipperTextColor"></n-color-picker>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Behavior">
      <setting-item name="Animation">
        <n-select
          v-model:value="optionData.flipperType"
          size="small"
          :options="[
            { label: 'Flip down', value: 'down' },
            { label: 'Flip up', value: 'up' }
          ]"
        ></n-select>
      </setting-item>
      <setting-item name="Flip speed (ms)">
        <n-input-number
          v-model:value="optionData.flipperSpeed"
          size="small"
          :min="100"
          :max="900"
          :step="100"
        ></n-input-number>
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { OptionType } from './config'

defineProps({
  optionData: {
    type: Object as PropType<OptionType>,
    required: true
  }
})
</script>
