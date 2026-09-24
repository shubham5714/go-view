<template>
  <div>
    <CollapseItem name="Sankey Chart" :expanded="true">
      <SettingItemBox name="Style">
        <SettingItem name="Direction">
          <n-select
            v-model:value="sankeyConfig.orient"
            size="small"
            :options="orientList"
            placeholder="Select direction"
          />
        </SettingItem>
        <SettingItem name="Tooltip label">
          <n-select
            v-model:value="optionData.tooltip.show"
            size="small"
            :options="toolTipSwitch"
            placeholder="Enabled"
          />
        </SettingItem>
      </SettingItemBox>
    </CollapseItem>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option, orientList, toolTipSwitch } from './config'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option & GlobalThemeJsonType>,
    required: true
  }
})

const sankeyConfig = computed<typeof option.series>(() => {
  return props.optionData.series
})

</script>
