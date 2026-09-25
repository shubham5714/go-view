<template>
  <n-timeline class="go-chart-configurations-timeline">
    <!-- 处理 echarts 的数据映射 -->
    <n-timeline-item v-if="isCharts && dimensionsAndSource" type="info" :title="TimelineTitleEnum.MAPPING">
      <n-table striped>
        <thead>
          <tr>
            <th v-for="item in tableTitle" :key="item">{{ item }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dimensionsAndSource" :key="index">
            <td>{{ item.field }}</td>
            <td>{{ item.mapping }}</td>
            <td>
              <n-space v-if="item.result === 0">
                <n-badge dot type="success"></n-badge>
                <n-text>None</n-text>
              </n-space>
              <n-space v-else>
                <n-badge dot :type="item.result === 1 ? 'success' : 'error'"></n-badge>
                <n-text>Match {{ item.result === 1 ? 'success' : 'failed' }}</n-text>
              </n-space>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-timeline-item>
    <!-- 处理 vcharts 的数据映射 -->
    <n-timeline-item v-if="isVChart" type="info" :title="TimelineTitleEnum.MAPPING">
      <n-table striped>
        <thead>
          <tr>
            <th v-for="item in vchartTableTitle" :key="item">{{ item }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in fieldList" :key="item.field">
            <td>
              <n-ellipsis style="width: 70px; max-width: 240px">
                {{ item.field }}
              </n-ellipsis>
            </td>
            <td v-if="isArray(item.mapping)">
              <n-space :size="4" vertical>
                <n-input
                  v-for="(mappingItem, index) in item.mapping"
                  :key="index"
                  v-model:value="item.mapping[index]"
                  type="tiny"
                  size="small"
                  placeholder="Enter field"
                  @change="() => (item.result = matchingHandle(item.mapping[index]))"
                />
              </n-space>
            </td>
            <td v-else>
              <n-input v-model:value="item.mapping" type="text" size="small" placeholder="Field" />
            </td>
            <!-- <td>
              <n-space style="width: 70px" :size="4">
                <n-badge dot :type="item.result === 1 ? 'success' : 'error'"></n-badge>
                <n-text>Match {{ item.result === 1 ? 'success' : 'failed' }}</n-text>
              </n-space>
            </td> -->
          </tr>
        </tbody>
      </n-table>
    </n-timeline-item>
    <n-timeline-item v-show="filterShow" color="#97846c" :title="TimelineTitleEnum.FILTER">
      <n-space :size="18" vertical>
        <n-text depth="3">Filters process the "data" field of the API response by default</n-text>
        <chart-data-monaco-editor></chart-data-monaco-editor>
      </n-space>
    </n-timeline-item>
    <n-timeline-item type="success" :title="TimelineTitleEnum.CONTENT">
      <n-space vertical>
        <n-space class="source-btn-box">
          <n-button class="sourceBtn-item" :disabled="noData" @click="openOnlineEditHandle">
            <template #icon>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            Edit
          </n-button>
          <n-upload
            v-model:file-list="uploadFileListRef"
            :show-file-list="false"
            :customRequest="customRequest"
            @before-upload="beforeUpload"
          >
            <n-space>
              <n-button v-if="!ajax" class="sourceBtn-item" :disabled="noData">
                <template #icon>
                  <n-icon>
                    <document-add-icon />
                  </n-icon>
                </template>
                Import (json / txt)
              </n-button>
            </n-space>
          </n-upload>
          <div>
            <n-button class="sourceBtn-item" :disabled="noData" @click="download">
              <template #icon>
                <n-icon>
                  <document-download-icon />
                </n-icon>
              </template>
              Download
            </n-button>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon class="go-ml-1" size="21" :depth="3">
                  <help-outline-icon></help-outline-icon>
                </n-icon>
              </template>
              <span>Click [Download] to view full data</span>
            </n-tooltip>
          </div>
        </n-space>
        <n-card size="small">
          <n-code :key="codeKey" :code="displayCode" language="json"></n-code>
        </n-card>
      </n-space>
    </n-timeline-item>
  </n-timeline>
  <!-- 编辑数据 -->
  <n-modal
    class="go-online-edit go-background-filter"
    :title="'Component Data Editor — ' + targetData.chartConfig.title"
    preset="card"
    size="small"
    style="width: 800px"
    v-model:show="showRef"
    transform-origin="center"
    :mask-closable="false"
    :bordered="true"
    @afterLeave="closeOlineEditHandle"
    content-style="padding: 0;"
  >
    <n-divider style="margin: 4px 0 10px" />
    <monaco-editor
      v-model:modelValue="editorCode"
      height="70vh"
      :language="targetData.chartConfig.chartKey === 'VHtmlCommon' ? 'html' : 'json'"
    />
    <template #action>
      <n-space justify="space-between">
        <div class="go-flex-items-center">
          <n-tag :bordered="false" type="primary" style="border-radius: 5px">
            <template #icon>
              <n-icon :component="DocumentTextIcon" />
            </template>
            Notes
          </n-tag>
          <n-space :wrap-item="false" vertical>
            <n-text class="go-ml-2" depth="3" style="font-size: 1">
              1. Format code:
              <n-tag :bordered="false" type="warning" style="font-size: 12px">( shift + alt + f ) </n-tag>
              <n-divider vertical />
              <n-tag :bordered="false" type="warning" style="font-size: 12px">Right-click -> Format Document</n-tag>
            </n-text>
            <n-text class="go-ml-2" depth="3" style="font-size: 1; text-align: left">
              2. Strings must use English double quotes, or an error will occur
            </n-text>
          </n-space>
        </div>
        <n-space>
          <n-button class="go-px-4" :focusable="false" @click="closeOlineEditHandle">Cancel</n-button>
          <n-button class="go-px-4" type="primary" @click="saveOlineEditHandle"> Save </n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChartFrameEnum } from '@/packages/index.d'
import { RequestDataTypeEnum } from '@/enums/httpEnum'
import { icon } from '@/plugins'
import { DataResultEnum, TimelineTitleEnum } from '../../index.d'
import { ChartDataMonacoEditor } from '../ChartDataMonacoEditor'
import { useFile } from '../../hooks/useFile.hooks'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import { toString, isArray, goDialog } from '@/utils'
// @ts-ignore
import MonacoEditor from '@/components/Pages/MonacoEditor/index.vue'

const { targetData } = useTargetData()
const props = defineProps({
  show: {
    type: Boolean,
    required: false
  },
  ajax: {
    type: Boolean,
    required: true
  },
  /** When set, Content uses this immediately (bypasses flaky store watch) */
  overrideDataset: {
    type: [Object, Array, String, Number, Boolean] as any,
    required: false,
    default: undefined
  }
})

// 表格标题
const tableTitle = ['Field', 'Mapping', 'Status']
const vchartTableTitle = ['Field', 'API mapping field']

const { HelpOutlineIcon, DocumentTextIcon } = icon.ionicons5
const { DocumentAddIcon, DocumentDownloadIcon, EditIcon } = icon.carbon

const source = ref()
const dimensions = ref()
const dimensionsAndSource = ref()
const noData = ref(false)
const showRef = ref(false)
// 编辑的代码
const editorCode = ref('')
const codeKey = ref(0)

const displayCode = computed(() => {
  try {
    return toString(source.value) || '—'
  } catch {
    return '—'
  }
})

const applyDatasetToView = (newData?: any) => {
  noData.value = false
  if (newData && targetData?.value?.chartConfig?.chartFrame === ChartFrameEnum.ECHARTS) {
    source.value = newData
    if (isCharts.value) {
      dimensions.value = Array.isArray(newData?.dimensions) ? newData.dimensions : []
      dimensionsAndSource.value = dimensionsAndSourceHandle()
    }
  } else if (newData && targetData?.value?.chartConfig?.chartFrame === ChartFrameEnum.VCHART) {
    source.value = newData
    initFieldListHandle()
  } else if (newData !== undefined && newData !== null) {
    dimensionsAndSource.value = null
    source.value = newData
    fieldList.value = []
  } else {
    noData.value = true
    source.value = 'This component has no data source'
  }
  if (isArray(newData)) {
    dimensionsAndSource.value = null
  }
  codeKey.value += 1
}
// 映射列表, 注意内部的mapping是响应式的，上方需要修改
const fieldList = ref<
  Array<{
    field: string
    mapping: string[]
    result: DataResultEnum
  }>
>([])

const { uploadFileListRef, customRequest, beforeUpload, download } = useFile(targetData)

// 是否展示过滤器
const filterShow = computed(() => {
  return targetData.value.request.requestDataType !== RequestDataTypeEnum.STATIC
})

// 是支持 dataset 的图表类型
const isCharts = computed(() => {
  return targetData.value.chartConfig.chartFrame === ChartFrameEnum.ECHARTS
})
// 是支持 vchart 的图表类型
const isVChart = computed(() => {
  return targetData.value.chartConfig.chartFrame === ChartFrameEnum.VCHART
})

// 处理映射列表状态结果
const matchingHandle = (mapping: string) => {
  let res = DataResultEnum.SUCCESS
  for (let i = 0; i < source.value.length; i++) {
    if (source.value[i][mapping] === undefined) {
      res = DataResultEnum.FAILURE
      return res
    }
  }
  return DataResultEnum.SUCCESS
}

// 处理映射列表
const dimensionsAndSourceHandle = () => {
  try {
    // 去除首项数据轴标识
    return dimensions.value.map((dimensionsItem: string, index: number) => {
      return index === 0
        ? {
            // 字段
            field: 'Common key',
            // 映射
            mapping: dimensionsItem,
            // 结果
            result: DataResultEnum.NULL
          }
        : {
            field: `Data item-${index}`,
            mapping: dimensionsItem,
            result: matchingHandle(dimensionsItem)
          }
    })
  } catch (error) {
    return []
  }
}

// 处理 vchart 映射列表
const initFieldListHandle = () => {
  if (targetData.value?.option) {
    fieldList.value = []
    // 所有名称，找到其中中 Field 结尾 的 key 和值
    for (const key in targetData.value.option) {
      if (key.endsWith('Field')) {
        const value = targetData.value.option[key]
        targetData.value.option[key] = value
        const item = {
          field: key,
          mapping: value,
          result: DataResultEnum.SUCCESS
        }
        if (item.mapping === undefined) {
          item.result = DataResultEnum.FAILURE
        }
        fieldList.value.push(item)
      }
    }
  }
}

// 打开在线编辑
const openOnlineEditHandle = () => {
  showRef.value = true
  if (targetData.value.chartConfig.chartKey !== 'VHtmlCommon') {
    editorCode.value = JSON.stringify(source.value, null, 2)
  } else {
    editorCode.value = source.value
  }
}

// 取消在线编辑
const closeOlineEditHandle = () => {
  showRef.value = false
}

// 取消在线编辑
const saveOlineEditHandle = () => {
  // 设置
  const setDataHandle = (newData: any) => {
    targetData.value.option.dataset = newData
  }
  goDialog({
    message: 'Save edited data?',
    onPositiveCallback: () => {
      try {
        let jsonData = editorCode.value
        if (targetData.value.chartConfig.chartKey !== 'VHtmlCommon') {
          jsonData = JSON.parse(jsonData)
        }
        if (typeof jsonData !== typeof source.value) {
          goDialog({
            message: 'Data type differs from original. Apply anyway?',
            onPositiveCallback: () => {
              try {
                setDataHandle(jsonData)
                editorCode.value = ''
                window['$message'].success('Saved successfully')
                closeOlineEditHandle()
              } catch (error) {
                window['$message'].error('Failed to apply content. Please check the format.')
              }
            }
          })
        } else {
          try {
            setDataHandle(jsonData)
            editorCode.value = ''
            window['$message'].success('Saved successfully')
            closeOlineEditHandle()
          } catch (error) {
            window['$message'].error('Failed to apply content. Please check the format.')
          }
        }
      } catch (error) {
        console.log(error)
        window['$message'].error('Failed to apply content. Please check the format.')
      }
    }
  })
}

watch(
  () => props.overrideDataset,
  (newData) => {
    if (newData !== undefined) {
      applyDatasetToView(newData)
    }
  },
  { immediate: true }
)

watch(
  () => targetData.value?.option?.dataset,
  (newData?: any) => {
    // Prefer explicit override from Call tool when present
    if (props.overrideDataset !== undefined) return
    applyDatasetToView(newData)
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style lang="scss" scoped>
@include go('chart-configurations-timeline') {
  @include deep() {
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
  .source-btn-box {
    margin-top: 10px !important;
  }
}
</style>
