<template>
  <div class="go-chart-configurations-data-mcp">
    <n-card class="n-card-shallow">
      <setting-item-box name="DRX tool" :alone="true">
        <n-select
          v-model:value="selectedToolId"
          filterable
          clearable
          :options="toolSelectOptions"
          placeholder="Select tenant-enabled tool"
          @update:value="onToolChange"
        />
        <n-button class="go-mt-2" size="small" quaternary :loading="toolsLoading" @click="() => loadTools(true)">
          Refresh tools
        </n-button>
        <n-text v-if="serverErrorText" depth="3" class="go-mt-1" style="display: block; font-size: 12px">
          {{ serverErrorText }}
        </n-text>
      </setting-item-box>

      <setting-item-box v-if="selectedTool" name="Matched server" :alone="true">
        <n-input
          size="small"
          :value="selectedTool.mcp_server_name || selectedTool.mcp_server_url || '—'"
          :disabled="true"
        />
        <n-text depth="3" style="font-size: 12px">
          Tool: {{ selectedTool.mcp_tool_name || selectedTool.tool_name }}
        </n-text>
      </setting-item-box>

      <setting-item-box
        v-if="selectedTool && selectedTool.fields.length"
        name="Input parameters"
        :alone="true"
      >
        <n-text depth="3" class="mcp-expr-hint" style="display: block; margin-bottom: 8px; font-size: 11px">
          Expression mode runs JS on each call/interval. Helpers:
          <code>iso()</code>, <code>iso(hoursAgo(1))</code>, <code>unix(minutesAgo(15))</code>,
          <code>$now</code>, <code>startOfDay()</code>
        </n-text>
        <div v-for="field in selectedTool.fields" :key="field.name" class="mcp-field">
          <div class="mcp-field-header">
            <div class="mcp-field-label">
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </div>
            <n-button-group size="tiny" class="mcp-mode-toggle">
              <n-button
                size="tiny"
                :type="getFieldMode(field.name) === 'fixed' ? 'primary' : 'default'"
                :ghost="getFieldMode(field.name) !== 'fixed'"
                @click="setFieldMode(field, 'fixed')"
              >
                Fixed
              </n-button>
              <n-button
                size="tiny"
                :type="getFieldMode(field.name) === 'expression' ? 'primary' : 'default'"
                :ghost="getFieldMode(field.name) !== 'expression'"
                @click="setFieldMode(field, 'expression')"
              >
                Expression
              </n-button>
            </n-button-group>
          </div>

          <!-- Expression: always a JS textarea -->
          <template v-if="getFieldMode(field.name) === 'expression'">
            <n-input
              class="mcp-expression-input"
              :value="String(paramModel[field.name]?.value ?? '')"
              type="textarea"
              :rows="3"
              :placeholder="EXPRESSION_PLACEHOLDER"
              @update:value="(v) => setFieldValue(field.name, v)"
            />
          </template>

          <!-- Fixed: schema-driven controls -->
          <template v-else>
            <n-select
              v-if="field.type === 'select'"
              :value="paramModel[field.name]?.value"
              :options="(field.options || []).map((o) => ({ label: o.label, value: o.value }))"
              :placeholder="field.placeholder || field.description || field.label"
              clearable
              @update:value="(v) => setFieldValue(field.name, v)"
            />
            <n-switch
              v-else-if="field.type === 'boolean'"
              :value="Boolean(paramModel[field.name]?.value)"
              size="small"
              @update:value="(v) => setFieldValue(field.name, v)"
            />
            <n-input-number
              v-else-if="field.type === 'number'"
              :value="paramModel[field.name]?.value as number | null"
              :show-button="false"
              :placeholder="field.placeholder || field.description || ''"
              style="width: 100%"
              @update:value="(v) => setFieldValue(field.name, v)"
            />
            <n-input
              v-else-if="field.type === 'textarea' || field.type === 'json'"
              :value="String(paramModel[field.name]?.value ?? '')"
              type="textarea"
              :rows="field.type === 'json' ? 4 : 3"
              :placeholder="field.placeholder || field.description || ''"
              @update:value="(v) => setFieldValue(field.name, v)"
            />
            <n-input
              v-else
              :value="String(paramModel[field.name]?.value ?? '')"
              :placeholder="field.placeholder || field.description || ''"
              @update:value="(v) => setFieldValue(field.name, v)"
            />
          </template>
        </div>
      </setting-item-box>

      <setting-item-box name="Interval (0 = once)" :alone="true">
        <n-input-group>
          <n-input-number
            v-model:value="targetData.request.requestInterval"
            class="select-time-number"
            :min="0"
            :show-button="false"
            placeholder="Use global default"
          />
          <n-select
            class="select-time-options"
            v-model:value="targetData.request.requestIntervalUnit"
            :options="selectTimeOptions"
          />
        </n-input-group>
      </setting-item-box>
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
          Assigns to dataset by default. Expressions resolve on each Call tool / interval.
        </n-tooltip>
      </template>
      <n-button type="primary" ghost :loading="loading" @click="sendHandle">
        <template #icon>
          <n-icon>
            <flash-icon />
          </n-icon>
        </template>
        Call tool
      </n-button>
    </setting-item-box>

    <chart-data-matching-and-show
      :key="resultVersion"
      :show="true"
      :ajax="true"
      :override-dataset="previewDataset"
    ></chart-data-matching-and-show>
    <go-skeleton :load="loading" :repeat="3"></go-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed, toRaw, nextTick, shallowRef } from 'vue'
import { icon } from '@/plugins'
import { SettingItemBox } from '@/components/Pages/ChartItemSetting'
import { selectTimeOptions } from '../../index.d'
import { ChartDataMatchingAndShow } from '../ChartDataMatchingAndShow'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import {
  newFunctionHandle,
  normalizeParamValue,
  EXPRESSION_PLACEHOLDER,
  type ParamValue,
  type ParamValueMode
} from '@/utils'
import { customizeMcp, listGoviewMcpTools, type McpToolOption, type McpToolField } from '@/api/mcp'
import { getLastRawResponse, setLastRawResponse } from '../../hooks/useLastRawResponse'

const { HelpOutlineIcon, FlashIcon } = icon.ionicons5
const { targetData } = useTargetData()

const ensureMcpConfig = () => {
  if (!targetData.value.request.requestMcp) {
    targetData.value.request.requestMcp = {
      instanceToolId: null,
      instanceId: null,
      toolLabel: '',
      toolName: '',
      mcpToolName: '',
      mcpServerUrl: '',
      instanceName: '',
      params: {}
    }
  }
  if (!targetData.value.request.requestMcp.params) {
    targetData.value.request.requestMcp.params = {}
  }
  return targetData.value.request.requestMcp
}

ensureMcpConfig()

const toolsLoading = ref(false)
const loading = ref(false)
const previewDataset = shallowRef<any>(undefined)
const resultVersion = ref(0)
const tools = ref<McpToolOption[]>([])
const serverErrors = ref<Array<{ url: string; name?: string; error: string }>>([])
const selectedToolId = ref<number | null>(ensureMcpConfig().instanceToolId ?? null)
const paramModel = reactive<Record<string, ParamValue>>({})
/** Remember values when toggling Fixed ↔ Expression so nothing is lost */
const fixedValueCache: Record<string, unknown> = {}
const expressionValueCache: Record<string, string> = {}

let syncingParams = false
let firstFocus = 0
let lastFilter: any = undefined
let alive = true

const selectedTool = computed(() => tools.value.find((t) => t.instance_tool_id === selectedToolId.value) || null)

const toolSelectOptions = computed(() => {
  const options = tools.value.map((tool) => ({
    label: `${tool.instance_name} / ${tool.label}`,
    value: tool.instance_tool_id
  }))
  const mcp = ensureMcpConfig()
  const id = selectedToolId.value
  if (id != null && !options.some((o) => o.value === id)) {
    const labelParts = [mcp.instanceName, mcp.toolLabel || mcp.toolName || mcp.mcpToolName].filter(Boolean)
    options.unshift({
      label: labelParts.length ? labelParts.join(' / ') : `Tool #${id}`,
      value: id
    })
  }
  return options
})

const serverErrorText = computed(() => {
  if (!serverErrors.value.length) return ''
  return serverErrors.value.map((e) => e.error).join('; ')
})

const defaultFixedValue = (field: McpToolField): unknown => {
  if (field.type === 'boolean') {
    return field.defaultValue === true || field.defaultValue === 'true'
  }
  if (field.defaultValue != null) {
    return field.type === 'json' ? JSON.stringify(field.defaultValue, null, 2) : field.defaultValue
  }
  if (field.type === 'number') return null
  return ''
}

const getFieldMode = (name: string): ParamValueMode => paramModel[name]?.mode || 'fixed'

const setFieldValue = (name: string, value: unknown) => {
  const current = paramModel[name] || { mode: 'fixed' as const, value: '' }
  paramModel[name] = { mode: current.mode, value }
}

const setFieldMode = (field: McpToolField, mode: ParamValueMode) => {
  const current = paramModel[field.name] || normalizeParamValue(undefined, defaultFixedValue(field))
  if (current.mode === mode) return

  if (mode === 'expression') {
    if (current.mode === 'fixed') {
      fixedValueCache[field.name] = current.value
    }
    const seed =
      expressionValueCache[field.name] ||
      (field.type === 'number' ? 'unix()' : field.type === 'boolean' ? 'true' : 'iso()')
    paramModel[field.name] = { mode: 'expression', value: seed }
  } else {
    if (current.mode === 'expression') {
      expressionValueCache[field.name] = String(current.value ?? '')
    }
    const restored =
      fixedValueCache[field.name] !== undefined ? fixedValueCache[field.name] : defaultFixedValue(field)
    paramModel[field.name] = { mode: 'fixed', value: restored }
  }
}

const initParamModel = (tool: McpToolOption | null) => {
  syncingParams = true
  Object.keys(paramModel).forEach((key) => delete paramModel[key])
  Object.keys(fixedValueCache).forEach((key) => delete fixedValueCache[key])
  Object.keys(expressionValueCache).forEach((key) => delete expressionValueCache[key])
  const saved = ensureMcpConfig().params || {}
  if (!tool) {
    syncingParams = false
    return
  }
  for (const field of tool.fields) {
    const existing = saved[field.name]
    if (existing !== undefined && existing !== null && existing !== '') {
      const normalized = normalizeParamValue(existing, defaultFixedValue(field))
      paramModel[field.name] = normalized
      if (normalized.mode === 'expression') {
        expressionValueCache[field.name] = String(normalized.value ?? '')
      } else {
        fixedValueCache[field.name] = normalized.value
      }
      continue
    }
    paramModel[field.name] = { mode: 'fixed', value: defaultFixedValue(field) }
  }
  syncingParams = false
  persistParams()
}

const persistParams = () => {
  const mcp = ensureMcpConfig()
  const next: Record<string, ParamValue> = {}
  for (const [key, val] of Object.entries(paramModel)) {
    next[key] = { mode: val.mode, value: val.value }
  }
  mcp.params = next
}

const onToolChange = (id: number | null) => {
  selectedToolId.value = id
  const tool = tools.value.find((t) => t.instance_tool_id === id) || null
  const mcp = ensureMcpConfig()
  mcp.instanceToolId = id
  mcp.instanceId = tool?.instance_id ?? null
  mcp.toolLabel = tool?.label || ''
  mcp.toolName = tool?.tool_name || ''
  mcp.mcpToolName = tool?.mcp_tool_name || ''
  mcp.mcpServerUrl = tool?.mcp_server_url || ''
  mcp.instanceName = tool?.instance_name || ''
  if (!tool) {
    mcp.params = {}
  }
  initParamModel(tool)
}

const loadTools = async (force = false) => {
  toolsLoading.value = true
  try {
    const payload = await listGoviewMcpTools(undefined, { force })
    if (!alive) return
    tools.value = payload.tools
    serverErrors.value = payload.server_errors
    const currentId = ensureMcpConfig().instanceToolId ?? null
    selectedToolId.value = currentId
    const tool = tools.value.find((t) => t.instance_tool_id === currentId) || null
    if (currentId && !tool) {
      window['$message']?.warning?.('Saved tool is no longer available for this tenant.')
    }
    if (tool) {
      const mcp = ensureMcpConfig()
      mcp.instanceId = tool.instance_id
      mcp.mcpToolName = tool.mcp_tool_name || mcp.mcpToolName || ''
      mcp.mcpServerUrl = tool.mcp_server_url || mcp.mcpServerUrl || ''
      mcp.toolLabel = tool.label || mcp.toolLabel || ''
      mcp.toolName = tool.tool_name || mcp.toolName || ''
      mcp.instanceName = tool.instance_name || mcp.instanceName || ''
    }
    initParamModel(tool)
  } catch (error: any) {
    if (!alive) return
    console.error(error)
    window['$message']?.warning?.(error?.message || 'Failed to load DRX tools.')
  } finally {
    if (alive) toolsLoading.value = false
  }
}

const applyResultToUi = (nextDataset: any) => {
  previewDataset.value = nextDataset
  resultVersion.value += 1
  try {
    targetData.value.option.dataset = nextDataset
  } catch (e) {
    console.error(e)
  }
}

const sendHandle = async () => {
  if (!targetData.value?.request) return
  persistParams()
  loading.value = true
  try {
    const res = await customizeMcp(toRaw(targetData.value.request))
    if (!res) {
      window['$message'].warning('No response. Check the tool configuration.')
      return
    }
    setLastRawResponse(targetData.value, res)
    const { data } = res
    if ((data === undefined || data === null) && !targetData.value.filter) {
      window['$message'].warning('Data format is invalid. Please configure a filter.')
      return
    }
    const nextDataset = newFunctionHandle(data, res, targetData.value.filter)
    applyResultToUi(nextDataset)
    await nextTick()
  } catch (error: any) {
    console.error(error)
    window['$message'].warning(error?.message || 'Tool call failed. Check parameters.')
  } finally {
    loading.value = false
  }
}

/** Re-run filter on cached Call tool result — no network. */
const applyFilterLocally = () => {
  const cached = getLastRawResponse(targetData.value)
  if (!cached) {
    // Avoid surprise MCP calls (and empty-param failures) when editing filters
    window['$message']?.info?.('Filter saved. Click Call tool to apply it to a fresh result.')
    return
  }
  const nextDataset = newFunctionHandle(cached?.data, cached, targetData.value.filter)
  applyResultToUi(nextDataset)
}

watch(
  paramModel,
  () => {
    if (syncingParams) return
    persistParams()
  },
  { deep: true }
)

watch(
  () => targetData.value?.filter,
  (filter) => {
    if (lastFilter !== filter && firstFocus) {
      lastFilter = filter
      applyFilterLocally()
    }
    firstFocus++
  }
)

onMounted(() => {
  alive = true
  // Show current dataset until first Call tool
  const existing = targetData.value?.option?.dataset
  if (existing !== undefined) {
    applyResultToUi(existing)
  }
  loadTools(false)
})

onBeforeUnmount(() => {
  alive = false
})
</script>

<style lang="scss" scoped>
@include go('chart-configurations-data-mcp') {
  .n-card-shallow {
    &.n-card {
      @extend .go-background-filter;
      @include deep() {
        .n-card__content {
          padding: 10px;
        }
      }
    }
  }
  .mcp-expr-hint {
    code {
      font-size: 10px;
      opacity: 0.9;
    }
  }
  .mcp-field {
    margin-bottom: 12px;
    .mcp-field-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .mcp-field-label {
      font-size: 12px;
      opacity: 0.85;
      .required {
        color: #e88080;
        margin-left: 2px;
      }
    }
    .mcp-mode-toggle {
      flex-shrink: 0;
    }
    .mcp-expression-input {
      @include deep() {
        .n-input__textarea-el,
        .n-input__input-el {
          color: #63e2b7;
          caret-color: #63e2b7;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
        }
        .n-input__placeholder {
          color: rgba(99, 226, 183, 0.45);
        }
      }
    }
  }
  .select-time-number {
    width: 60%;
  }
  .select-time-options {
    width: 40%;
  }
}
</style>
