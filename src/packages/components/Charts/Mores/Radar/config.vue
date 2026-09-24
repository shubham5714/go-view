<template>
  <div>
    <!-- Echarts 全局设置 -->
    <global-setting :optionData="optionData"></global-setting>
    <CollapseItem name="Radar" :expanded="true">
      <SettingItemBox name="Style">
        <SettingItem>
          <n-checkbox v-model:checked="radarConfig.splitArea.show">Background</n-checkbox>
        </SettingItem>
        <SettingItem>
          <n-checkbox v-model:checked="radarConfig.splitLine.show">Split line</n-checkbox>
        </SettingItem>
        <SettingItem name="Radar shape">
          <n-select
            v-model:value="radarConfig.shape"
            size="small"
            :options="RadarShapeEnumList"
            placeholder="Select shape"
          />
        </SettingItem>
      </SettingItemBox>

      <SettingItemBox name="Axis">
        <SettingItem>
          <n-checkbox v-model:checked="radarConfig.axisLine.show">Axis line</n-checkbox>
        </SettingItem>
        <SettingItem>
          <n-checkbox v-model:checked="radarConfig.axisTick.show">Tick</n-checkbox>
        </SettingItem>
      </SettingItemBox>

      <SettingItemBox name="Range">
        <setting-item :name="`Min: ${radarProp.radius[0]}%`">
          <n-slider
            v-model:value="radarProp.radius[0]"
            :min="0"
            :max="100"
            :format-tooltip="sliderFormatTooltip"
            @update:value="updateRadius0"
          ></n-slider>
        </setting-item>
        <setting-item :name="`Max: ${radarProp.radius[1]}%`">
          <n-slider
            v-model:value="radarProp.radius[1]"
            :min="0"
            :max="100"
            :format-tooltip="sliderFormatTooltip"
            @update:value="updateRadius1"
          ></n-slider>
        </setting-item>
      </SettingItemBox>

      <SettingItemBox name="Offset">
        <setting-item :name="`X: ${radarProp.center[0]}%`">
          <n-slider
            v-model:value="radarProp.center[0]"
            :min="0"
            :max="100"
            :format-tooltip="sliderFormatTooltip"
            @update:value="updateCenter0"
          ></n-slider>
        </setting-item>
        <setting-item :name="`Y: ${radarProp.center[1]}%`">
          <n-slider
            v-model:value="radarProp.center[1]"
            :min="0"
            :max="100"
            :format-tooltip="sliderFormatTooltip"
            @update:value="updateCenter1"
          ></n-slider>
        </setting-item>
      </SettingItemBox>

      <SettingItemBox name="Indicator">
        <SettingItem name="Color">
          <n-color-picker size="small" :modes="['hex']" v-model:value="radarConfig.axisName.color"></n-color-picker>
        </SettingItem>
        <SettingItem name="Size">
          <n-input-number v-model:value="radarConfig.axisName.fontSize" size="small" :min="9"></n-input-number>
        </SettingItem>
        <SettingItem>
          <n-checkbox v-model:checked="radarConfig.axisName.show">Text label</n-checkbox>
        </SettingItem>
      </SettingItemBox>

      <SettingItemBox name="Series" :alone="true">
        <SettingItem name="Background opacity">
          <n-input-number
            v-model:value="optionData.series[0].areaStyle.opacity"
            size="small"
            :min="0"
            :max="1"
            :step="0.1"
          ></n-input-number>
        </SettingItem>
      </SettingItemBox>
    </CollapseItem>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, reactive } from 'vue'
import { GlobalSetting, CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option, RadarShapeEnumList } from './config'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option & GlobalThemeJsonType>,
    required: true
  }
})

const radarConfig = computed<typeof option.radar>(() => {
  return props.optionData.radar
})

const radarProp = reactive({
  radius: [0, 60],
  center: [50, 50]
})

// 更新处理
const updateRadius0 = (value: number) => {
  props.optionData.radar.radius[0] = `${value}%`
}

const updateRadius1 = (value: number) => {
  props.optionData.radar.radius[1] = `${value}%`
}

// 更新处理
const updateCenter0 = (value: number) => {
  props.optionData.radar.center[0] = `${value}%`
}

const updateCenter1 = (value: number) => {
  props.optionData.radar.center[1] = `${value}%`
}

// 百分比格式化 percent
const sliderFormatTooltip = (v: number) => {
  return `${v}%`
}
</script>
