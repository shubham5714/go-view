<template>
  <div class="go-chart-configurations-data-ajax">
    <n-card class="n-card-shallow">
      <setting-item-box name="Request config">
        <setting-item name="Type">
          <n-tag :bordered="false" type="primary" style="border-radius: 5px">
            {{ targetData.request.requestContentType === RequestContentTypeEnum.DEFAULT ? 'Default' : 'SQL' }}
          </n-tag>
        </setting-item>

        <setting-item name="Method">
          <n-input size="small" :placeholder="targetData.request.requestHttpType || '—'" :disabled="true"></n-input>
        </setting-item>

        <setting-item name="Interval">
          <n-input size="small" :placeholder="`${targetData.request.requestInterval || '—'}`" :disabled="true">
            <template #suffix> {{ SelectHttpTimeNameObj[targetData.request.requestIntervalUnit] }} </template>
          </n-input>
        </setting-item>

        <setting-item name="Global interval (default)">
          <n-input size="small" :placeholder="`${GlobalRequestInterval || '—'} `" :disabled="true">
            <template #suffix> {{ SelectHttpTimeNameObj[GlobalRequestIntervalUnit] }} </template>
          </n-input>
        </setting-item>
      </setting-item-box>

      <setting-item-box name="Origin URL" :alone="true">
        <n-input size="small" :placeholder="requestOriginUrl || '—'" :disabled="true">
          <template #prefix>
            <n-icon :component="PulseIcon" />
          </template>
        </n-input>
      </setting-item-box>

      <setting-item-box name="Request URL" :alone="true">
        <n-input size="small" :placeholder="targetData.request.requestUrl || '—'" :disabled="true">
          <template #prefix>
            <n-icon :component="FlashIcon" />
          </template>
        </n-input>
      </setting-item-box>

      <div class="edit-text" @click="requestModelHandle">
        <div class="go-absolute-center">
          <n-button type="primary" secondary>Edit config</n-button>
        </div>
      </div>
    </n-card>

    <setting-item-box :alone="true">
      <template #name>
        Test
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-icon size="21" :depth="3">
              <help-outline-icon></help-outline-icon>
            </n-icon>
          </template>
          Assigns to dataset by default
        </n-tooltip>
      </template>
      <n-button type="primary" ghost @click="sendHandle">
        <template #icon>
          <n-icon>
            <flash-icon />
          </n-icon>
        </template>
        Send request
      </n-button>
    </setting-item-box>

    <!-- 底部数据展示 -->
    <chart-data-matching-and-show :show="showMatching && !loading" :ajax="true"></chart-data-matching-and-show>

    <!-- 骨架图 -->
    <go-skeleton :load="loading" :repeat="3"></go-skeleton>
    
    <!-- 请求配置model -->
    <chart-data-request
      v-model:modelShow="requestShow"
      :targetData="targetData"
      @sendHandle="sendHandle"
    ></chart-data-request>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed, onBeforeUnmount, watchEffect, toRaw } from 'vue'
import { icon } from '@/plugins'
import { useDesignStore } from '@/store/modules/designStore/designStore'
import { SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { ChartDataRequest } from '../ChartDataRequest/index'
import { RequestHttpEnum, ResultEnum, SelectHttpTimeNameObj, RequestContentTypeEnum } from '@/enums/httpEnum'
import { chartDataUrl, rankListUrl, scrollBoardUrl, numberFloatUrl, numberIntUrl, textUrl, imageUrl } from '@/api/mock'
import { http, customizeHttp } from '@/api/http'
import { SelectHttpType } from '../../index.d'
import { ChartDataMatchingAndShow } from '../ChartDataMatchingAndShow'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import { newFunctionHandle } from '@/utils'

const { HelpOutlineIcon, FlashIcon, PulseIcon } = icon.ionicons5
const { targetData, chartEditStore } = useTargetData()

const {
  requestOriginUrl,
  requestInterval: GlobalRequestInterval,
  requestIntervalUnit: GlobalRequestIntervalUnit
} = toRefs(chartEditStore.getRequestGlobalConfig)
const designStore = useDesignStore()

// 是否展示数据分析
const loading = ref(false)
const requestShow = ref(false)
const showMatching = ref(false)

let firstFocus = 0
let lastFilter: any = undefined

// 请求配置 model
const requestModelHandle = () => {
  requestShow.value = true
}

// 发送请求
const sendHandle = async () => {
  if (!targetData.value?.request) return
  loading.value = true
  try {
    const res = await customizeHttp(toRaw(targetData.value.request), toRaw(chartEditStore.getRequestGlobalConfig))
    loading.value = false
    if (res) {
      const { data } = res
      if (!data && !targetData.value.filter) {
        window['$message'].warning('Data format is invalid. Please configure a filter.')
        showMatching.value = true
        return
      }
      targetData.value.option.dataset = newFunctionHandle(data, res, targetData.value.filter)
      showMatching.value = true
      return
    }
    window['$message'].warning('No response. Check the API.')
  } catch (error) {
    console.error(error);
    loading.value = false
    window['$message'].warning('Data error. Check parameters.')
  }
}

// 颜色
const themeColor = computed(() => {
  return designStore.getAppTheme
})

watchEffect(() => {
  const filter = targetData.value?.filter
  if (lastFilter !== filter && firstFocus) {
    lastFilter = filter
    sendHandle()
  }
  firstFocus++
})

onBeforeUnmount(() => {
  lastFilter = null
})
</script>

<style lang="scss" scoped>
@include go('chart-configurations-data-ajax') {
  .n-card-shallow {
    &.n-card {
      @extend .go-background-filter;
      @include deep() {
        .n-card__content {
          padding: 10px;
        }
      }
    }
    .edit-text {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 325px;
      height: 270px;
      cursor: pointer;
      opacity: 0;
      transition: all 0.3s;
      @extend .go-background-filter;
      backdrop-filter: blur(2px) !important;
    }
    &:hover {
      border-color: v-bind('themeColor');
      .edit-text {
        opacity: 1;
      }
    }
  }
}
</style>
