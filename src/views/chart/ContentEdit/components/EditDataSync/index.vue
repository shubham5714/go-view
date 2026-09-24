<template>
  <div class="go-edit-data-sync go-flex-items-center">
    <n-tooltip v-if="statusDesc" trigger="hover">
      <template #trigger>
        <n-text class="status-desc go-ml-2" :type="descType" depth="3">
          {{ statusDesc }}
        </n-text>
      </template>
      <span>Auto-saves every {{ saveInterval }}s</span>
    </n-tooltip>
    <n-spin
      v-show="statusDesc === statusDescObj[1]['text']"
      class="go-ml-2"
      size="small"
    >
      <template #icon>
        <n-icon size="13">
          <reload-icon />
        </n-icon>
      </template>
    </n-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { useDesignStore } from '@/store/modules/designStore/designStore'
import { SyncEnum } from '@/enums/editPageEnum'
import { icon } from '@/plugins'
import { saveInterval } from '@/settings/designSetting'

const { ReloadIcon } = icon.ionicons5

const chartEditStore = useChartEditStore()
const designStore = useDesignStore()

const { saveStatus } = toRefs(chartEditStore.getEditCanvas)
const themeColor = ref(designStore.getAppTheme)

const statusDesc = ref('')
const descType = ref('')
let setTimeoutIns: NodeJS.Timeout = setTimeout(() => {})

const statusDescObj = {
  [SyncEnum.PENDING]: {
    text: '',
    type: '',
  },
  [SyncEnum.START]: {
    text: 'Saving…',
    type: '',
  },
  [SyncEnum.SUCCESS]: {
    text: 'Saved',
    type: 'success',
  },
  [SyncEnum.FAILURE]: {
    text: 'Save failed',
    type: 'error',
  },
}

watch(
  () => saveStatus.value,
  newData => {
    clearTimeout(setTimeoutIns)
    statusDesc.value = statusDescObj[newData]['text']
    descType.value = statusDescObj[newData]['type']
    if (newData === SyncEnum.PENDING) return
    // Brief status only — avoid lingering chrome
    const holdMs = newData === SyncEnum.SUCCESS ? 1400 : newData === SyncEnum.START ? 0 : 2200
    if (holdMs > 0) {
      setTimeoutIns = setTimeout(() => {
        statusDesc.value = statusDescObj[SyncEnum.PENDING]['text']
        descType.value = statusDescObj[SyncEnum.PENDING]['type']
      }, holdMs)
    }
  },
  {
    immediate: true,
  }
)
</script>

<style lang="scss" scoped>
@include go('edit-data-sync') {
  @include deep() {
    .n-spin {
      width: 13px;
      height: 13px;
    }
  }
  .status-desc {
    cursor: default;
    color: v-bind('themeColor');
    font-size: 12px;
    opacity: 0.8;
  }
}
</style>
