<template>
  <div class="go-chart-data-display">
    <n-scrollbar style="max-height: 570px">
      <div class="go-mr-3">
        <div>
          <setting-item-box name="Info">
            <setting-item name="API name">
              <n-input size="small" :placeholder="targetData?.dataPondName || '—'" :disabled="true"> </n-input>
            </setting-item>
            <setting-item name="API type">
              <n-input size="small" :placeholder="requestHttpType || '—'" :disabled="true"></n-input>
            </setting-item>
          </setting-item-box>

          <setting-item-box>
            <setting-item name="Interval">
              <n-input size="small" :placeholder="`${requestInterval || '—'}`" :disabled="true">
                <template #suffix>
                  {{ targetData && SelectHttpTimeNameObj[requestIntervalUnit] }}
                </template>
              </n-input>
            </setting-item>
            <setting-item name="Global interval (default)">
              <n-input size="small" :placeholder="`${globalData?.requestInterval || '—'}`" :disabled="true">
                <template #suffix> {{ globalData && SelectHttpTimeNameObj[globalData.requestIntervalUnit] }} </template>
              </n-input>
            </setting-item>
          </setting-item-box>

          <setting-item-box name="Origin URL" :alone="true">
            <n-input size="small" :placeholder="globalData?.requestOriginUrl || '—'" :disabled="true">
              <template #prefix>
                <n-icon :component="PulseIcon" />
              </template>
            </n-input>
          </setting-item-box>

          <setting-item-box name="API URL" :alone="true">
            <n-input
              size="small"
              :placeholder="requestUrl || '—'"
              :disabled="true"
            >
              <template #prefix>
                <n-icon :component="FlashIcon" />
              </template>
            </n-input>
          </setting-item-box>
        </div>
        <n-divider />
        <setting-item-box name="类型">
          <setting-item name="配置类型">
            <n-input
              size="small"
              :placeholder="targetData && requestContentTypeObj[requestContentType]"
              :disabled="true"
            ></n-input>
          </setting-item>
          <setting-item name="Body type" v-if="requestContentType === RequestContentTypeEnum.DEFAULT">
            <n-input size="small" :placeholder="targetData && requestParamsBodyType" :disabled="true"></n-input>
          </setting-item>
        </setting-item-box>
        <div v-if="requestContentType === RequestContentTypeEnum.DEFAULT">
          <n-tabs type="line" animated v-model:value="tabValue">
            <n-tab v-for="item in RequestParamsTypeEnum" :key="item" :name="item" :tab="item"> {{ item }} </n-tab>
          </n-tabs>
          <!-- 各个页面 -->
          <div class="go-mt-3">
            <div v-if="tabValue !== RequestParamsTypeEnum.BODY">
              <display-table class="go-my-3" :target="requestParams[tabValue]"> </display-table>
            </div>

            <!-- 选择了 body -->
            <div v-else>
              <!-- 为 none 时 -->
              <n-card class="go-mt-3 go-pb-3" v-if="requestParamsBodyType === RequestBodyEnum['NONE']">
                <n-text depth="3">This API has no body</n-text>
              </n-card>

              <!-- 具有对象属性时 -->
              <template
                v-else-if="
                  requestParamsBodyType === RequestBodyEnum['FORM_DATA'] ||
                  requestParamsBodyType === RequestBodyEnum['X_WWW_FORM_URLENCODED']
                "
              >
                <display-table
                  class="go-my-3"
                  :target="requestParams[RequestParamsTypeEnum.BODY][requestParamsBodyType]"
                ></display-table>
              </template>

              <!-- json  -->
              <template v-else-if="requestParamsBodyType === RequestBodyEnum['JSON']">
                <n-card size="small" style="padding-bottom: 7px">
                  <n-code
                    :code="requestParams[RequestParamsTypeEnum.BODY][requestParamsBodyType] || '—'"
                    language="json"
                  ></n-code>
                </n-card>
              </template>

              <!-- xml  -->
              <template v-else-if="requestParamsBodyType === RequestBodyEnum['XML']">
                <n-code
                  :code="requestParams[RequestParamsTypeEnum.BODY][requestParamsBodyType] || ''"
                  language="html"
                ></n-code>
              </template>
            </div>
          </div>
        </div>
        <!-- SQL 请求 -->
        <div v-else>
          <setting-item-box name="Key">
            <n-text>sql</n-text>
          </setting-item-box>
          <setting-item-box name="Value">
            <n-code :code="requestSQLContent.sql || ''" language="sql"></n-code>
          </setting-item-box>
        </div>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, toRefs } from 'vue'
import { icon } from '@/plugins'
import { MonacoEditor } from '@/components/Pages/MonacoEditor'
import { SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { RequestDataPondItemType, RequestGlobalConfigType } from '@/store/modules/chartEditStore/chartEditStore.d'
import displayTable from './displayTable.vue'
import {
  RequestBodyEnum,
  RequestParamsTypeEnum,
  SelectHttpTimeNameObj,
  RequestContentTypeEnum,
  RequestBodyEnumList,
  RequestParamsObjType
} from '@/enums/httpEnum'

const props = defineProps({
  globalData: Object as PropType<RequestGlobalConfigType>,
  targetData: Object as PropType<RequestDataPondItemType>
})

const { HelpOutlineIcon, FlashIcon, PulseIcon } = icon.ionicons5
const {
  requestUrl,
  requestInterval,
  requestHttpType,
  requestContentType,
  requestSQLContent,
  requestParams,
  requestParamsBodyType,
  requestIntervalUnit
} = toRefs((props.targetData as RequestDataPondItemType).dataPondRequestConfig)

const tabs = [RequestParamsTypeEnum.HEADER]
const requestContentTypeObj = {
  [RequestContentTypeEnum.DEFAULT]: '普通请求',
  [RequestContentTypeEnum.SQL]: 'SQL 请求'
}
const tabValue = ref<RequestParamsTypeEnum>(RequestParamsTypeEnum.PARAMS)

// 更新参数表格数据
const updateRequestParams = (paramsObj: RequestParamsObjType) => {
  if (tabValue.value !== RequestParamsTypeEnum.BODY) {
    requestParams.value[tabValue.value] = paramsObj
  }
}

// 更新参数表格数据
const updateRequestBodyTable = (paramsObj: RequestParamsObjType) => {
  if (
    tabValue.value === RequestParamsTypeEnum.BODY &&
    // 仅有两种类型有 body
    (requestParamsBodyType.value === RequestBodyEnum.FORM_DATA ||
      requestParamsBodyType.value === RequestBodyEnum.X_WWW_FORM_URLENCODED)
  ) {
    requestParams.value[RequestParamsTypeEnum.BODY][requestParamsBodyType.value] = paramsObj
  }
}
</script>

<style lang="scss" scoped>
@include go('chart-data-display') {
  flex: 1;
}
</style>
