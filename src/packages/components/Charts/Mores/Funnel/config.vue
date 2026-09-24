<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"> </global-setting>
  <!-- 漏斗图 -->
  <collapse-item v-for="(item, index) in seriesList" :key="index" :name="`Funnel`" expanded>
    <setting-item-box name="Sort" alone>
      <setting-item>
        <n-select v-model:value="item.sort" :options="FunnelOrderEnumList" size="small" />
      </setting-item>
    </setting-item-box>

    <SettingItemBox name="Range" :alone="true">
      <setting-item :name="`Top: ${item.top}px`">
        <n-slider v-model:value="item.top" :min="0" :max="300" :format-tooltip="sliderFormatTooltip"></n-slider>
      </setting-item>
    </SettingItemBox>

    <setting-item-box name="Block">
      <setting-item name="Border size">
        <n-input-number v-model:value="item.itemStyle.borderWidth" :min="0" :max="10" size="small" />
      </setting-item>
      <setting-item name="Border color">
        <n-color-picker v-model:value="item.itemStyle.borderColor" :modes="['hex']" size="small" />
      </setting-item>
      <setting-item name="Interval">
        <n-input-number v-model:value="item.gap" :min="0" :max="20" size="small" />
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Label">
      <setting-item name="Visible">
        <n-checkbox v-model:checked="item.label.show" size="small">Label</n-checkbox>
      </setting-item>
      <setting-item name="Position">
        <n-select v-model:value="item.label.position" :options="FunnelLabelPositionEnumList" size="small" />
      </setting-item>
      <setting-item name="Size">
        <n-input-number v-model:value="item.label.fontSize" :min="0" size="small" />
      </setting-item>
      <setting-item name="Hover size">
        <n-input-number v-model:value="item.emphasis.label.fontSize" :min="0" size="small" />
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { GlobalSetting, CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'
import { option, FunnelOrderEnumList, FunnelLabelPositionEnumList } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option & GlobalThemeJsonType>,
    required: true
  }
})

const seriesList = computed(() => {
  return props.optionData.series
})

const sliderFormatTooltip = (v: number) => {
  return `${v}px`
}
</script>
