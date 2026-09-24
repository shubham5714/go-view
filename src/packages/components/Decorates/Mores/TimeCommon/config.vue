<template>
  <CollapseItem name="Content" :expanded="true">
    <SettingItemBox name="Font">
      <SettingItem name="Size">
        <n-input-number
          v-model:value="optionData.timeSize"
          size="small"
          :min="1"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Thickness">
        <n-select
          v-model:value="optionData.fontWeight"
          size="small"
          :options="fontWeightOptions"
        />
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Gap">
      <SettingItem name="Letter spacing">
        <n-input-number
          v-model:value="optionData.timeTextIndent"
          size="small"
          :min="1"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="Line spacing">
        <n-input-number
          v-model:value="optionData.timeLineHeight"
          size="small"
          :min="1"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Color">
      <SettingItem name="Time">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.timeColor"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="Shadow">
      <SettingItem>
        <n-space>
          <n-switch v-model:value="optionData.showShadow" size="small" />
          <n-text>Show shadow</n-text>
        </n-space>
      </SettingItem>
      <SettingItem name="x">
        <n-input-number v-model:value="optionData.hShadow" size="small"></n-input-number
      ></SettingItem>
      <SettingItem name="y">
        <n-input-number v-model:value="optionData.vShadow" size="small"></n-input-number
      ></SettingItem>
      <SettingItem name="Blur">
        <n-input-number
          v-model:value="optionData.blurShadow"
          size="small"
        ></n-input-number
      ></SettingItem>
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="optionData.colorShadow"
        ></n-color-picker
      ></SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import {
  CollapseItem,
  SettingItemBox,
  SettingItem,
} from "@/components/Pages/ChartItemSetting";
import { option, FontWeightEnum, FontWeightObject } from "./config";

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true,
  },
});
const fontWeightOptions = [
  {
    label: FontWeightEnum.NORMAL,
    value: FontWeightObject[FontWeightEnum.NORMAL],
  },
  {
    label: FontWeightEnum.BOLD,
    value: FontWeightObject[FontWeightEnum.BOLD],
  },
];
</script>
