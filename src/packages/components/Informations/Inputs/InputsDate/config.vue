<template>
  <collapse-item name="Display mode" :expanded="true">
    <setting-item-box name="Select mode">
      <n-select v-model:value="optionData.isPanel" size="small" :options="panelOptions" />
    </setting-item-box>
  </collapse-item>

  <collapse-item name="Time config" :expanded="true">
    <setting-item-box name="Basic">
      <setting-item name="Type">
        <n-select v-model:value="optionData.componentInteractEventKey" size="small" :options="datePickerTypeOptions"
                  @update:value="datePickerTypeUpdate"/>
      </setting-item>
    </setting-item-box>

    <setting-item-box name="Default value">
      <setting-item name="Type">
        <n-select v-model:value="optionData.defaultType" size="small" :options="defaultTypeOptions"
                  @update:value="defaultTypeUpdate" />
      </setting-item>

    </setting-item-box>
    <setting-item-box v-if="optionData.defaultType === DefaultTypeEnum.STATIC" :alone="true">
      <setting-item name="Static default">
        <n-date-picker size="small" clearable v-model:value="optionData.dataset" :type="optionData.componentInteractEventKey" />
      </setting-item>
    </setting-item-box>
    <setting-item-box v-if="optionData.defaultType === DefaultTypeEnum.DYNAMIC" >
      <template #name>
        <n-text></n-text>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-icon size="21" :depth="3">
              <help-outline-icon></help-outline-icon>
            </n-icon>
          </template>
          <span>System time when page opens + offset (unit)</span>
        </n-tooltip>
      </template>
      <setting-item :name="differValueName">
        <n-input-number v-model:value="optionData.differValue[0]" class="input-num-width" size="small">
          <template #suffix>
            {{DifferUnitObject[optionData.differUnit[0]]}}
          </template>
        </n-input-number>
      </setting-item>
      <setting-item :name="differUnitName">
        <n-select v-model:value="optionData.differUnit[0]" size="small" :options="differUnitOptions" />
      </setting-item>
      <setting-item v-if="isRange" name="End value dynamic offset">
        <n-input-number v-model:value="optionData.differValue[1]" class="input-num-width" size="small">
          <template #suffix>
            {{DifferUnitObject[optionData.differUnit[1]]}}
          </template>
        </n-input-number>
      </setting-item>
      <setting-item v-if="isRange" name="End value offset unit">
        <n-select v-model:value="optionData.differUnit[1]" size="small" :options="differUnitOptions" />
      </setting-item>
    </setting-item-box>

  </collapse-item>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { icon } from '@/plugins'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { option } from './config'
import { ComponentInteractEventEnum, DefaultTypeEnum, DifferUnitEnum, DifferUnitObject } from './interact'
import dayjs from "dayjs";

const { HelpOutlineIcon } = icon.ionicons5

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true
  }
})

const panelOptions = [
  {
    label: 'Dropdown display',
    value: 0
  },
  {
    label: 'Panel display',
    value: 1
  }
]

const datePickerTypeOptions = [
  {
    label: 'Date',
    value: ComponentInteractEventEnum.DATE
  },
  {
    label: 'Date time',
    value: ComponentInteractEventEnum.DATE_TIME
  },
  {
    label: 'Date range',
    value: ComponentInteractEventEnum.DATE_RANGE
  },
  {
    label: 'Month',
    value: ComponentInteractEventEnum.MONTH
  },
  {
    label: 'Month range',
    value: ComponentInteractEventEnum.MONTH_RANGE
  },
  {
    label: 'Year',
    value: ComponentInteractEventEnum.YEAR
  },
  {
    label: 'Year range',
    value: ComponentInteractEventEnum.YEAR_RANGE
  },
  {
    label: 'Quarter',
    value: ComponentInteractEventEnum.QUARTER
  },
  {
    label: 'Quarter range',
    value: ComponentInteractEventEnum.QUARTER_RANGE
  }
]

const defaultTypeOptions = [
  {
    label: 'Static',
    value: DefaultTypeEnum.STATIC
  },
  {
    label: 'Dynamic',
    value: DefaultTypeEnum.DYNAMIC
  },
  {
    label: 'None',
    value: DefaultTypeEnum.NONE
  }
]


const differUnitOptions = [
  // ManipulateType
  {
    value: DifferUnitEnum.DAY,
    label: DifferUnitObject[DifferUnitEnum.DAY]
  },
  {
    value: DifferUnitEnum.WEEK,
    label: DifferUnitObject[DifferUnitEnum.WEEK]
  },
  {
    value: DifferUnitEnum.MONTH,
    label: DifferUnitObject[DifferUnitEnum.MONTH]
  },
  {
    value: DifferUnitEnum.QUARTER,
    label: DifferUnitObject[DifferUnitEnum.QUARTER]
  },
  {
    value: DifferUnitEnum.YEAR,
    label: DifferUnitObject[DifferUnitEnum.YEAR]
  },
  {
    value: DifferUnitEnum.HOUR,
    label: DifferUnitObject[DifferUnitEnum.HOUR]
  },
  {
    value: DifferUnitEnum.MINUTE,
    label: DifferUnitObject[DifferUnitEnum.MINUTE]
  },
  {
    value: DifferUnitEnum.SECOND,
    label: DifferUnitObject[DifferUnitEnum.SECOND]
  },
  {
    value: DifferUnitEnum.MILLISECOND,
    label: DifferUnitObject[DifferUnitEnum.MILLISECOND]
  }
]


const isRange = computed(() => {
  return props.optionData.componentInteractEventKey.endsWith('range')
})

const differValueName = computed(() => {
  return isRange.value ? 'Start value dynamic offset' : 'Dynamic offset'
})

const differUnitName = computed(() => {
  return isRange.value ? 'Start value offset unit' : 'Offset unit'
})

const datePickerTypeUpdate = () => {
  props.optionData.dataset = isRange.value ? [dayjs().valueOf(), dayjs().valueOf()] : dayjs().valueOf()
}

const defaultTypeUpdate = (v: string) => {
  if (v === DefaultTypeEnum.STATIC) {
    datePickerTypeUpdate()
  } else {
    // DefaultTypeEnum.
    props.optionData.dataset = null
  }
}

</script>
