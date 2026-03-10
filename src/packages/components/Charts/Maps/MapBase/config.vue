<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem name="Map" :expanded="true">
    <SettingItemBox name="Map Region">
      <SettingItem name="Map Region">
        <n-select
          size="small"
          v-model:value="mapRegion.adcode"
          :options="mapRegionOptions"
          value-field="adcode"
          label-field="name"
        />
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Region Color">
      <SettingItem name="Color at 0%">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].itemStyle.areaColor.colorStops[0].color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Color at 100%">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].itemStyle.areaColor.colorStops[1].color"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Shadow">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].itemStyle.shadowColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Blur">
        <n-input-number
          v-model:value="seriesList[1].itemStyle.shadowBlur"
          :min="0"
          size="small"
          placeholder="Enter blur"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Offset X">
        <n-input-number
          v-model:value="seriesList[1].itemStyle.shadowOffsetX"
          size="small"
          placeholder="Enter horizontal offset"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Offset Y">
        <n-input-number
          v-model:value="seriesList[1].itemStyle.shadowOffsetY"
          size="small"
          placeholder="Enter vertical offset"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Geo Labels">
      <SettingItem name="Show">
        <n-space>
          <n-switch v-model:value="seriesList[1].label.show" size="small"></n-switch>
        </n-space>
      </SettingItem>
      <SettingItem name="Font Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="seriesList[1].label.color"></n-color-picker>
      </SettingItem>
      <SettingItem name="Font Size">
        <n-input-number
          v-model:value="seriesList[1].label.fontSize"
          :min="1"
          size="small"
          placeholder="Enter font size"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Hover Focus">
      <SettingItem name="Disabled (visible in preview)">
        <n-space>
          <n-switch v-model:value="seriesList[1].emphasis.disabled" size="small"></n-switch>
        </n-space>
      </SettingItem>
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].emphasis.itemStyle.areaColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Font Size">
        <n-input-number
          v-model:value="seriesList[1].emphasis.label.fontSize"
          :min="1"
          size="small"
          placeholder="Enter font size"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Shadow">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].emphasis.itemStyle.shadowColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Border Size">
        <n-input-number
          v-model:value="seriesList[1].emphasis.itemStyle.borderWidth"
          :min="1"
          size="small"
          placeholder="Enter border size"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Text Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].emphasis.label.color"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Tooltip">
      <SettingItem name="Show">
        <n-space>
          <n-switch v-model:value="seriesList[1].tooltip.show" size="small"></n-switch>
        </n-space>
      </SettingItem>
      <SettingItem name="Font Size">
        <n-input-number
          v-model:value="seriesList[1].tooltip.textStyle.fontSize"
          :min="1"
          size="small"
          placeholder="Enter font size"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Font Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].tooltip.textStyle.color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Background Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].tooltip.backgroundColor"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Region Border">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[1].itemStyle.borderColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Width">
        <n-input-number
          v-model:value="seriesList[1].itemStyle.borderWidth"
          :min="1"
          size="small"
          placeholder="Enter border size"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Other" v-if="mapRegion.adcode === 'china'">
      <SettingItem>
        <n-checkbox v-model:checked="mapRegion.showHainanIsLands" size="small">Show South China Sea Islands</n-checkbox>
      </SettingItem>
      <SettingItem v-if="seriesList[2]">
        <n-checkbox v-model:checked="mapRegion.enter" size="small">Click to drill down</n-checkbox>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Back Icon" v-if="mapRegion.enter">
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="mapRegion.backColor"></n-color-picker>
      </SettingItem>
      <SettingItem name="Size">
        <n-input-number
          v-model:value="mapRegion.backSize"
          :min="1"
          size="small"
          placeholder="Enter size"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
  <CollapseItem name="Marker" :expanded="true">
    <SettingItemBox name="Style">
      <SettingItem name="Size">
        <n-input-number v-model:value="seriesList[0].symbolSize" size="small" :min="0"></n-input-number>
      </SettingItem>
      <SettingItem name="Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="seriesList[0].itemStyle.color"></n-color-picker>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Text">
      <SettingItem name="Show">
        <n-space>
          <n-switch v-model:value="seriesList[0].label.show" size="small"></n-switch>
        </n-space>
      </SettingItem>
      <SettingItem name="Font Size">
        <n-input-number v-model:value="seriesList[0].label.fontSize" size="small" :min="0"></n-input-number>
      </SettingItem>
      <SettingItem name="Font Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="seriesList[0].label.color"></n-color-picker>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Ripple">
      <SettingItem name="Ripple Size">
        <n-input-number
          v-model:value="seriesList[0].rippleEffect.scale"
          :min="1"
          size="small"
          placeholder="Enter ripple size"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Ripple Color">
        <n-color-picker size="small" :modes="['hex']" v-model:value="seriesList[0].rippleEffect.color"></n-color-picker>
      </SettingItem>
      <SettingItem name="Ripple Brush Type">
        <n-select size="small" v-model:value="seriesList[0].rippleEffect.brushType" :options="rippleEffectOptions" />
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>

  <CollapseItem v-if="seriesList[2]" name="Line" :expanded="true">
    <SettingItemBox name="Arrow">
      <SettingItem name="Speed">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-input-number v-model:value="seriesList[2].effect.period" size="small" :min="0"></n-input-number>
          </template>
          Lower value = faster speed
        </n-tooltip>
      </SettingItem>
      <SettingItem name="Trail">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-input-number
              v-model:value="seriesList[2].effect.trailLength"
              size="small"
              :min="0"
              :max="1"
            ></n-input-number>
          </template>
          Trail length [0,1], higher = longer trail
        </n-tooltip>
      </SettingItem>
      <SettingItem name="Size">
        <n-input-number v-model:value="seriesList[2].effect.symbolSize" size="small" :min="0"></n-input-number>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Config">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="seriesList[2].lineStyle.normal.color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Width">
        <n-input-number v-model:value="seriesList[2].lineStyle.normal.width" size="small" :min="1"></n-input-number>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'
import { GlobalSetting } from '@/components/Pages/ChartItemSetting'
import { ref } from 'vue'
import mapChinaJson from './mapGeojson/china.json'

const mapRegionOptions = ref([
  {
    adcode: 'china',
    name: 'China'
  },
  {
    adcode: 'india',
    name: 'India'
  }
])

const rippleEffectOptions = ref([
  {
    value: 'fill',
    label: 'Filled'
  },
  {
    value: 'stroke',
    label: 'Stroke'
  }
])

const props = defineProps({
  optionData: {
    type: Object as PropType<GlobalThemeJsonType>,
    required: true
  }
})

const initMapRegionOptions = () => {
  mapChinaJson.features.forEach((element: any) => {
    if (element.properties.name) {
      mapRegionOptions.value.push({ ...element.properties })
    }
  })
}
initMapRegionOptions()

const seriesList = computed(() => {
  return props.optionData.series
})

const mapRegion = computed(() => {
  return props.optionData.mapRegion
})
</script>
