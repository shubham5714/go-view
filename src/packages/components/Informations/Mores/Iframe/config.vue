<template>
  <collapse-item name="Properties" :expanded="true">
    <setting-item-box name="Path" :alone="true">
      <setting-item name="Please enter a URL with https protocol">
        <n-input v-model:value="optionData.dataset" size="small"></n-input>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="Style">
      <setting-item name="Rounded">
        <n-input-number
          v-model:value="optionData.borderRadius"
          size="small"
          :min="0"
          placeholder="Rounded"
        ></n-input-number>
      </setting-item>
    </setting-item-box>
  </collapse-item>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { option } from "./config";
import {
  CollapseItem,
  SettingItemBox,
  SettingItem,
} from "@/components/Pages/ChartItemSetting";

const props = defineProps({
  optionData: {
    type: Object as PropType<typeof option>,
    required: true,
  },
});
</script>
