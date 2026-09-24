<template>
  <CollapseItem name="Pipeline" :expanded="true">
    <SettingItemBox name="Default color">
      <SettingItem>
        <n-select v-model:value="optionData.color_type" :options="colorOptions" @update:value="handleColorChange" />
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Pipeline color">
      <SettingItem>
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.o_color"></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Water flow color">
      <SettingItem>
        <n-color-picker size="small" :modes="['hex']" v-model:value="optionData.i_color"></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Flow">
      <SettingItem>
        <n-select v-model:value="optionData.line_class" :options="options" />
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option } from './config'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const options = ref([
  {
    value: 'svg_ani_flow',
    label: 'Forward'
  },
  {
    value: 'svg_ani_flow_back',
    label: 'Reverse'
  },
  {
    value: 'svg_ani_flow_stop',
    label: 'Stop'
  }
])

const colorOptions = ref([
  {
    value: 1,
    label: 'Blue'
  },
  {
    value: 2,
    label: 'Yellow'
  }
])

// 默认颜色
const handleColorChange = (e: number) => {
  switch (e) {
    case 1:
      props.optionData.o_color = '#0a7ae2'
      props.optionData.i_color = '#119bfa'
      break
    case 2:
      props.optionData.o_color = '#ff9d00'
      props.optionData.i_color = '#f7ea37'
      break
  }
}
</script>
