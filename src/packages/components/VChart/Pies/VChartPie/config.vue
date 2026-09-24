<template>
  <!-- vCharts 全局设置 -->
  <VChartGlobalSetting :optionData="optionData"></VChartGlobalSetting>
  <!-- 饼图配制 -->
  <CollapseItem name="Pie Chart" expanded>
    <!-- <SettingItemBox name="动画">
      <SettingItem>
        <n-space>
          <n-switch v-model:value="animationRef" size="small" @update:value="animationHandle"></n-switch>
          <n-text>Enable animation</n-text>
        </n-space>
      </SettingItem>
    </SettingItemBox> -->
    <SettingItemBox name="Shape">
      <setting-item name="Inner range">
        <n-input-number v-model:value="optionData.innerRadius" :step="0.1" :min="0" size="small"></n-input-number>
      </setting-item>
      <setting-item name="Outer range">
        <n-input-number v-model:value="optionData.outerRadius" :step="0.1" :min="0" size="small"></n-input-number>
      </setting-item>
      <setting-item name="Center axis X">
        <n-input v-model:value="optionData.centerX" :step="1" :min="0" size="small"></n-input>
      </setting-item>
      <setting-item name="Center axis Y">
        <n-input v-model:value="optionData.centerY" :step="1" :min="0" size="small"></n-input>
      </setting-item>
    </SettingItemBox>
    <SettingItemBox name="Label" v-if="optionData.label">
      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.label.visible" size="small"></n-switch>
          <n-text>Show label</n-text>
        </n-space>
      </SettingItem>
      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.label.line.visible" size="small"></n-switch>
          <n-text>Guide line</n-text>
        </n-space>
      </SettingItem>
      <SettingItem name="Position">
        <n-select v-model:value="optionData.label.position" :options="labelConfig.position" size="small" />
      </SettingItem>
      <FontStyle :style="toRefs(optionData.label.style)"></FontStyle>
    </SettingItemBox>
    <SettingItemBox name="Segment style">
      <setting-item name="Texture type">
        <n-select v-model:value="optionData.pie.style.texture" :options="styleConfig.texture" size="small"></n-select>
      </setting-item>
      <setting-item name="Border radius">
        <n-input-number v-model:value="optionData.pie.style.cornerRadius" size="small" :min="0"></n-input-number>
      </setting-item>
      <setting-item name="Stroke width">
        <n-input-number
          v-model:value="optionData.pie.style.outerBorder.lineWidth"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
      <setting-item name="Color">
        <n-color-picker v-model:value="optionData.pie.style.outerBorder.stroke" size="small" />
      </setting-item>
      <setting-item name="Outer stroke distance">
        <n-input-number
          v-model:value="optionData.pie.style.outerBorder.distance"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
      <setting-item name="Stroke opacity">
        <n-input-number
          v-model:value="optionData.pie.style.outerBorder.strokeOpacity"
          :step="0.1"
          size="small"
          :min="0"
        ></n-input-number>
      </setting-item>
    </SettingItemBox>
    <SettingItemBox name="Inner ring">
      <setting-item name="Visibility">
        <n-space>
          <n-switch v-model:value="extensionMarkRef" size="small" @update:value="markerHandle"></n-switch>
        </n-space>
      </setting-item>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, ref, toRefs } from 'vue'
import { VChartGlobalSetting } from '@/components/Pages/VChartItemSetting'
import FontStyle from '@/components/Pages/VChartItemSetting/common/FontStyle.vue'
import type { vChartGlobalThemeJsonType } from '@/settings/vchartThemes/index'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { labelConfig, styleConfig } from '@/packages/chartConfiguration/vcharts/index'

const props = defineProps({
  optionData: {
    type: Object as PropType<vChartGlobalThemeJsonType>,
    required: true
  }
})

const animationRef = ref(props.optionData.animationNormal && Object.keys(props.optionData.animationNormal)?.length > 0)
const extensionMarkRef = ref(!!props.optionData?.extensionMark)

const markerHandle = (value: boolean) => {
  if (value) {
    props.optionData.extensionMark = []
  } else {
    delete props.optionData.extensionMark
  }
}

const animationHandle = (value: boolean) => {
  if (value) {
    props.optionData.animationNormal = {
      pie: [
        {
          loop: true,
          startTime: 800,
          oneByOne: true,
          timeSlices: [
            {
              effects: {
                channel: {
                  outerRadius: {
                    to: props.optionData.outerRadius * 100 + 10
                  }
                },
                easing: 'linear'
              },
              duration: 500
            },
            {
              effects: {
                channel: {
                  outerRadius: {
                    to: props.optionData.outerRadius * 100 + 10
                  }
                },
                easing: 'linear'
              },
              duration: 500
            },
            {
              effects: {
                channel: {
                  outerRadius: {
                    to: props.optionData.outerRadius * 100
                  }
                }
              },
              duration: 500
            }
          ]
        }
      ]
    }
  } else {
    props.optionData.animationNormal = {}
  }
}
</script>
