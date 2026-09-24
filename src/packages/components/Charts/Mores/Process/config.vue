<template>
  <!-- 默认展开 -->
  <CollapseItem name="Progress bar" :expanded="true">
    <SettingItemBox name="Content">
      <SettingItem name="Value">
        <!-- 与 config.ts 里的 option 对应 --><!-- n-input-number 是 NaiveUI 的控件 -->
        <n-input-number v-model:value="optionData.dataset" size="small" :min="0" placeholder="Progress value"></n-input-number>
      </SettingItem>
      <setting-item name="Unit">
        <n-input v-model:value="optionData.unit" size="small"></n-input>
      </setting-item>
    </SettingItemBox>

    <SettingItemBox name="Track">
      <SettingItem name="Shape">
        <n-select v-model:value="optionData.type" :options="types" placeholder="Select shape" />
      </SettingItem>

      <!-- 颜色粗细等等... -->
      <SettingItem name="Progress bar color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.color"></n-color-picker>
      </SettingItem>
      <SettingItem name="Track color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.railColor"></n-color-picker>
      </SettingItem>
      <setting-item name="Offset angle" v-if="optionData.type !== types[0].value">
        <n-input-number v-model:value="optionData.offsetDegree" size="small"></n-input-number>
      </setting-item>
      <SettingItem v-if="optionData.type == types[0].value">
        <n-space>
          <n-switch v-model:value="optionData.processing" size="small" />
          <n-text>In-progress animation</n-text>
        </n-space>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Metric">
      <SettingItem name="Position" v-if="optionData.type == types[0].value">
        <n-select v-model:value="optionData.indicatorPlacement" :options="indicatorPlacements" placeholder="Select shape" />
      </SettingItem>
      <SettingItem name="Text color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.indicatorTextColor"></n-color-picker>
      </SettingItem>
       <setting-item name="Text size">
        <n-input-number v-model:value="optionData.indicatorTextSize" size="small"></n-input-number>
      </setting-item>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
// 以下是封装的设置模块布局组件，具体效果可在官网查看
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'

// 获取 option 的数据，便于使用 typeof 获取类型
import { option, types, indicatorPlacements } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})
</script>
