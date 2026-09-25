<template>
  <template v-if="targetData.filter">
    <n-card>
      <p><span class="func-keyword">function</span>&nbsp;&nbsp;filter(data, res)&nbsp;&nbsp;{</p>
      <!-- 函数体 -->
      <div class="go-ml-4">
        <n-code :code="targetData.filter" language="typescript"></n-code>
      </div>
      <p>}</p>
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" tertiary size="small" @click="addFilter">
            <template #icon>
              <n-icon>
                <filter-edit-icon />
              </n-icon>
            </template>
            Edit
          </n-button>
          <n-button tertiary size="small" @click="delFilter"> Delete </n-button>
        </n-space>
      </template>
    </n-card>
  </template>
  <template v-else>
    <n-button class="go-ml-3" @click="addFilter">
      <template #icon>
        <n-icon>
          <filter-icon />
        </n-icon>
      </template>
      Add filter
    </n-button>
  </template>

  <!-- 弹窗 -->
  <n-modal class="go-chart-data-monaco-editor" v-model:show="showModal" :mask-closable="false" :closeOnEsc="false">
    <n-card :bordered="false" role="dialog" size="small" aria-modal="true" style="width: 1000px; height: 600px">
      <template #header>
        <n-space>
          <n-text>Filter function editor</n-text>
        </n-space>
      </template>
      <template #header-extra> </template>
      <n-space size="small" vertical>
        <n-space justify="space-between">
          <div>
            <n-space vertical>
              <n-tag type="info">
                <span class="func-keyword">function</span>&nbsp;&nbsp;filter(data, res)&nbsp;&nbsp;{
              </n-tag>
              <monaco-editor v-model:modelValue="filter" width="460px" height="380px" language="javascript" />
              <n-tag type="info">}</n-tag>
            </n-space>
          </div>
          <n-divider vertical style="height: 480px" />
          <n-scrollbar style="max-height: 480px">
            <n-space :size="15" vertical>
              <n-space align="center" justify="space-between" style="width: 420px">
                <n-text depth="3" style="font-size: 12px">
                  {{ sourceStatusLabel }}
                </n-text>
                <n-button size="tiny" quaternary :loading="loadingSource" @click="() => loadSourceData(true)">
                  Refresh data
                </n-button>
              </n-space>
              <div class="editor-data-show">
                <n-space>
                  <n-text depth="3">Filter input (data):</n-text>
                  <n-code :code="toString(sourceData?.data) || '—'" language="json" :word-wrap="true"></n-code>
                </n-space>
              </div>
              <div class="editor-data-show">
                <n-space>
                  <n-text depth="3">API response (res):</n-text>
                  <n-code :code="toString(sourceData) || '—'" language="json" :word-wrap="true"></n-code>
                </n-space>
              </div>
              <div class="editor-data-show">
                <n-space>
                  <n-text depth="3">Filter result:</n-text>
                  <n-code :code="filterRes || '—'" language="json" :word-wrap="true"></n-code>
                </n-space>
              </div>
            </n-space>
          </n-scrollbar>
        </n-space>
      </n-space>
      <template #action>
        <n-space justify="space-between">
          <div class="go-flex-items-center">
            <n-tag :bordered="false" type="primary">
              <template #icon>
                <n-icon :component="DocumentTextIcon" />
              </template>
              Rules
            </n-tag>
            <n-text class="go-ml-2" depth="2">Filter processes the response "data" field by default</n-text>
          </div>

          <n-space>
            <n-button size="medium" @click="closeFilter">Cancel</n-button>
            <n-button size="medium" type="primary" @click="saveFilter">Save</n-button>
          </n-space>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch, toRaw } from 'vue'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import { MonacoEditor } from '@/components/Pages/MonacoEditor'
import { icon } from '@/plugins'
import { goDialog, toString } from '@/utils'
import { customizeHttp } from '@/api/http'
import { customizeMcp } from '@/api/mcp'
import { RequestDataTypeEnum } from '@/enums/httpEnum'
import cloneDeep from 'lodash/cloneDeep'
import { getLastRawResponse, setLastRawResponse } from '../../hooks/useLastRawResponse'

const { DocumentTextIcon } = icon.ionicons5
const { FilterIcon, FilterEditIcon } = icon.carbon
const { targetData, chartEditStore } = useTargetData()

// 受控弹窗
const showModal = ref(false)
// filter 函数模板
const filter = ref(targetData.value.filter || `return data`)
// 过滤错误标识
const errorFlag = ref(false)
// 目标静态/接口数据 — shape `{ data }` matching customizeHttp / customizeMcp
const sourceData = ref<any>(null)
const usingCachedData = ref(false)
const loadingSource = ref(false)

const sourceStatusLabel = computed(() => {
  if (loadingSource.value) return 'Fetching…'
  if (usingCachedData.value && sourceData.value) return 'Using last Call tool / API result'
  if (sourceData.value) return 'Live fetch'
  return 'No cached result — Call tool first, or Refresh data'
})

const fetchTargetData = async () => {
  loadingSource.value = true
  try {
    // Pass the live request config (not a shallow toRaw-only snapshot) so MCP params resolve
    const request = targetData.value.request
    const res =
      request.requestDataType === RequestDataTypeEnum.MCP
        ? await customizeMcp(toRaw(request))
        : await customizeHttp(toRaw(request), toRaw(chartEditStore.getRequestGlobalConfig))
    if (res) {
      sourceData.value = res
      setLastRawResponse(targetData.value, res)
      usingCachedData.value = false
      return
    }
    window['$message'].warning('No response. Check the API.')
  } catch (error: any) {
    console.error(error)
    window['$message'].warning(error?.message || 'Data error. Check parameters.')
  } finally {
    loadingSource.value = false
  }
}

/**
 * Default: use cached Call tool / API result only (no network).
 * forceFetch=true: live Refresh data button.
 */
const loadSourceData = async (forceFetch = false) => {
  if (!forceFetch) {
    const cached = getLastRawResponse(targetData.value)
    if (cached !== undefined) {
      sourceData.value = cached
      usingCachedData.value = true
      return
    }
    // Do NOT auto-call MCP/API on Edit — params/expressions need an intentional Call tool
    sourceData.value = null
    usingCachedData.value = false
    return
  }
  await fetchTargetData()
}

// 过滤结果
const filterRes = computed(() => {
  if (!sourceData.value) {
    return '—'
  }
  try {
    const fn = new Function('data', 'res', filter.value)
    const response = cloneDeep(sourceData.value)
    const res = fn(response?.data, response)
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    errorFlag.value = false
    return toString(res)
  } catch (error) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    errorFlag.value = true
    return `Filter function error. Log: ${error}`
  }
})

// 新增过滤器
const addFilter = () => {
  showModal.value = true
}

// 删除过滤器
const delFilter = () => {
  goDialog({
    message: 'Delete this filter?',
    onPositiveCallback: () => {
      targetData.value.filter = undefined
    }
  })
}

// 关闭过滤器
const closeFilter = () => {
  showModal.value = false
}

// 新增过滤器
const saveFilter = () => {
  if (errorFlag.value) {
    window['$message'].error('Filter function error. Cannot save.')
    return
  }
  targetData.value.filter = filter.value
  closeFilter()
}

watch(
  () => showModal.value,
  (newData: boolean) => {
    if (newData) {
      loadSourceData(false)
      filter.value = targetData.value.filter || `return data`
    }
  }
)
</script>

<style lang="scss" scoped>
.func-keyword {
  color: #b478cf;
}
@include go('chart-data-monaco-editor') {
  &.n-card.n-modal,
  .n-card {
    @extend .go-background-filter;
  }
  .editor-data-show {
    @include fetch-bg-color('filter-color');
    width: 420px;
    padding: 20px;
    border-radius: 5px;
  }
}
</style>
