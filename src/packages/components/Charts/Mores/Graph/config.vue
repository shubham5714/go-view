<template>
  <div>
    <CollapseItem name="Graph Chart" :expanded="true">
      <SettingItemBox name="Style">
        <setting-item name="Layout">
          <n-select v-model:value="graphConfig.layout" :options="GraphLayout" size="small" />
        </setting-item>
      </SettingItemBox>
      <SettingItemBox name="Label">
        <setting-item name="Display">
          <n-select v-model:value="graphConfig.label.show" :options="LabelSwitch" size="small" />
        </setting-item>
        <setting-item name="Position">
          <n-select v-model:value="graphConfig.label.position" :options="LabelPosition" size="small" />
        </setting-item>
      </SettingItemBox>
      <SettingItemBox name="Line">
        <SettingItem name="Arc">
          <!-- 需要输入两位的小数才会变化 -->
          <n-input-number
            v-model:value="optionData.series[0].lineStyle.curveness"
            :min="0"
            :step="0.01"
            placeholder="Curvature"
            size="small"
          ></n-input-number>
        </SettingItem>
      </SettingItemBox>
      <SettingItemBox name="Legend">
        <SettingItem name="Color">
          <n-color-picker
            size="small"
            :modes="['hex']"
            v-model:value="optionData.legend.textStyle.color"
          ></n-color-picker>
        </SettingItem>
        <SettingItem name="Text">
          <n-input-number
            v-model:value="optionData.legend.textStyle.fontSize"
            :min="0"
            :step="1"
            size="small"
            placeholder="Text size"
          >
          </n-input-number>
        </SettingItem>
      </SettingItemBox>
      <SettingItemBox name="Force directed" v-if="optionData.series[0].force && graphConfig.layout == 'force'">
        <SettingItem name="Repulsion factor" v-if="optionData.series[0].force.repulsion">
          <n-input-number
            v-model:value="optionData.series[0].force.repulsion"
            :min="0"
            :step="1"
            size="small"
            placeholder="Repulsion factor size"
          >
          </n-input-number>
        </SettingItem>
        <SettingItem name="Gravity factor" v-if="optionData.series[0].force.gravity">
          <n-input-number
            v-model:value="optionData.series[0].force.gravity"
            :min="0"
            :step="0.1"
            size="small"
            placeholder="Gravity factor"
          >
          </n-input-number>
        </SettingItem>
        <SettingItem name="Node distance">
          <n-input-number
            v-model:value="optionData.series[0].force.edgeLength"
            :min="0"
            :step="1"
            size="small"
            placeholder="Node distance"
          >
          </n-input-number>
        </SettingItem>
        <SettingItem name="Iterate animation">
          <n-select v-model:value="graphConfig.force.layoutAnimation" :options="LayoutAnimation" size="small" />
        </SettingItem>
        <SettingItem name="Node speed">
          <n-input-number
            v-model:value="optionData.series[0].force.friction"
            :min="0"
            :step="0.1"
            size="small"
            placeholder="Node speed"
          >
          </n-input-number>
        </SettingItem>
      </SettingItemBox>
    </CollapseItem>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option, GraphLayout, LabelSwitch, LabelPosition, LayoutAnimation } from './config'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option & GlobalThemeJsonType>,
    required: true
  }
})

const graphConfig = computed<(typeof option.series)[0]>(() => {
  return props.optionData.series[0]
})
</script>
