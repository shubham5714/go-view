<template>
  <!-- 遍历 seriesList -->
  <CollapseItem v-for="(item, index) in config.series" :key="index" :name="`Ring`" :expanded="true">
    <SettingItemBox name="Data">
      <SettingItem name="Value">
        <n-input-number v-model:value="config.dataset" :min="0" :max="1" :step="0.01" size="small" placeholder="Value">
        </n-input-number>
      </SettingItem>
    </SettingItemBox>
    <!-- 中心标题 -->
    <SettingItemBox v-if="config.title" name="Title">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="config.title.textStyle.color"></n-color-picker>
      </SettingItem>
      <SettingItem name="Font size">
        <n-input-number
          v-model:value="config.title.textStyle.fontSize"
          :min="0"
          :step="1"
          size="small"
          placeholder="Font size"
        >
        </n-input-number>
      </SettingItem>
    </SettingItemBox>
    <!-- Echarts 全局设置 -->
    <SettingItemBox name="Progress bar">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="item.data[0].itemStyle.color"></n-color-picker>
      </SettingItem>
      <SettingItem name="Shadow blur level">
        <n-input-number
          v-model:value="item.data[0].itemStyle.shadowBlur"
          :min="0"
          :max="50"
          :step="1"
          size="small"
          placeholder="Shadow blur level"
        >
        </n-input-number>
      </SettingItem>
      <SettingItem name="Shadow color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.data[0].itemStyle.shadowColor"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <!-- 其他样式 -->
    <SettingItemBox name="Track">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="item.data[1].itemStyle.color"></n-color-picker>
      </SettingItem>
      <SettingItem name="Shadow blur level">
        <n-input-number
          v-model:value="item.data[1].itemStyle.shadowBlur"
          :min="0"
          :step="1"
          size="small"
          placeholder="Shadow blur level"
        >
        </n-input-number>
      </SettingItem>
      <SettingItem name="Shadow color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.data[1].itemStyle.shadowColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Track width">
        <n-select
          v-model:value="item.radius[0]"
          size="small"
          :options="[
            { label: 'Narrow', value: '75%' },
            { label: 'Center', value: '60%' },
            { label: 'Wide', value: '45%' },
            { label: 'Wider', value: '30%' }
          ]"
        />
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
// 以下是封装的设置模块布局组件，具体效果可在官网查看
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { GlobalThemeJsonType } from '@/settings/chartThemes'

const props = defineProps({
  optionData: {
    type: Object as PropType<GlobalThemeJsonType>,
    required: true
  }
})

const config = computed(() => {
  return props.optionData
})
</script>
