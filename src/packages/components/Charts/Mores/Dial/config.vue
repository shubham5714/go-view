<template>
    <!-- 遍历 seriesList -->
    <CollapseItem :name="`Ring`" :expanded="true">
      <SettingItemBox name="Data">
        <SettingItem name="Value">
          <n-input-number v-model:value="config.dataset" :min="dialConfig.min" :max="dialConfig.max" :step="1" size="small" placeholder="Value">
          </n-input-number>
        </SettingItem>
      </SettingItemBox>
      <!-- Echarts 全局设置 -->
      <!-- 表盘刻度字体 -->
      <SettingItemBox name="Font">
        <SettingItem name="Color">
          <n-color-picker size="small" :modes="['hex']" v-model:value="dialConfig.axisLabel.color"></n-color-picker>
        </SettingItem>
        <SettingItem name="Font size">
          <n-input-number
            v-model:value="dialConfig.axisLabel.fontSize"
            :min="0"
            :step="1"
            size="small"
            placeholder="Font size"
          >
          </n-input-number>
        </SettingItem>
      </SettingItemBox>
      <!-- 表盘 -->
      <SettingItemBox name="Dial exterior">
        <SettingItem name="Color" >
          <n-color-picker size="small" :modes="['hex']" v-model:value="config.series[1].axisLine.lineStyle.color[1][1]"></n-color-picker>
        </SettingItem>
      </SettingItemBox>
      <!-- 指针 -->
      <SettingItemBox name="Pointer">
        <SettingItem name="Color" >
          <n-color-picker size="small" :modes="['hex']" v-model:value="dialConfig.data[0].itemStyle.color"></n-color-picker>
        </SettingItem>
        <SettingItem name="Width">
          <n-input-number v-model:value="dialConfig.pointer.width" :min="0" :step="1" size="small" placeholder="Value">
          </n-input-number>
        </SettingItem>
      </SettingItemBox>
      <SettingItemBox name="Tick">
        <SettingItem name="Min value">
          <n-input-number v-model:value="dialConfig.min" :min="0" :step="1" size="small" placeholder="Value">
          </n-input-number>
        </SettingItem>
        <SettingItem name="Max value">
          <n-input-number v-model:value="dialConfig.max" :min="0" :step="1" size="small" placeholder="Value">
          </n-input-number>
        </SettingItem>
        <SettingItem name="Color" >
          <n-color-picker size="small" :modes="['hex']" v-model:value="config.series[1].axisTick.lineStyle.color" @update:value="updateClick"></n-color-picker>
        </SettingItem>
      </SettingItemBox>
  
    </CollapseItem>
  </template>
  
  <script setup lang="ts">
  import { PropType, computed } from 'vue'
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
  
  const dialConfig = computed(() => {
    return props.optionData.series[0]
  })
  
  const updateClick = (val: any) => {
    props.optionData.series[1].splitLine.lineStyle.color=val
  }
  </script>
  