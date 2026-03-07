<template>
  <n-space class="go-mt-0" :wrap="false">
    <n-button v-for="item in comBtnList" :key="item.key" :type="item.type()" ghost @click="item.event">
      <template #icon>
        <component :is="item.icon"></component>
      </template>
      <span>{{ item.title() }}</span>
    </n-button>
  </n-space>

  <!-- 发布管理弹窗 -->
  <n-modal v-model:show="modelShow" @afterLeave="closeHandle">
    <n-list bordered class="go-system-setting">
      <template #header>
        <n-space justify="space-between">
          <n-h3 class="go-mb-0">Release Management</n-h3>
          <n-icon size="20" class="go-cursor-pointer" @click="closeHandle">
            <close-icon></close-icon>
          </n-icon>
        </n-space>
      </template>

      <n-list-item>
        <n-space :size="10">
          <n-alert :show-icon="false" title="Preview URL:" type="success">
            {{ previewPath() }}
          </n-alert>
          <n-space vertical>
            <n-button tertiary type="primary" @click="copyPreviewPath()"> Copy URL </n-button>
            <n-button :type="release ? 'warning' : 'primary'" @click="sendHandle">
              {{ release ? 'Unpublish' : 'Publish Dashboard' }}
            </n-button>
          </n-space>
        </n-space>
      </n-list-item>

      <n-list-item>
        <n-space :size="10">
          <n-button @click="modelShowHandle">Close</n-button>
        </n-space>
      </n-list-item>
    </n-list>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { PreviewEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { syncData } from '../../ContentEdit/components/EditTools/hooks/useSyncUpdate.hook'
import { ProjectInfoEnum } from '@/store/modules/chartEditStore/chartEditStore.d'
import { changeProjectReleaseApi } from '@/api/path'
import {
  previewPath,
  renderIcon,
  fetchPathByName,
  routerTurnByPath,
  setSessionStorage,
  getSessionStorage,
  httpErrorHandle,
  fetchRouteParamsLocation
} from '@/utils'
import { icon } from '@/plugins'
import { cloneDeep } from 'lodash'

const { BrowsersOutlineIcon, SendIcon, AnalyticsIcon, CloseIcon } = icon.ionicons5
const chartEditStore = useChartEditStore()

const previewPathRef = ref(previewPath())
const { copy, isSupported } = useClipboard({ source: previewPathRef })

const routerParamsInfo = useRoute()

const modelShow = ref<boolean>(false)
const release = ref<boolean>(false)

watchEffect(() => {
  release.value = chartEditStore.getProjectInfo.release || false
})

// 关闭弹窗
const closeHandle = () => {
  modelShow.value = false
}

// 预览
const previewHandle = () => {
  const path = fetchPathByName(PreviewEnum.CHART_PREVIEW_NAME, 'href')
  if (!path) return
  const { id } = routerParamsInfo.params
  // id 标识
  const previewId = typeof id === 'string' ? id : id[0]
  const storageInfo = chartEditStore.getStorageInfo()
  const sessionStorageInfo = getSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST) || []

  if (sessionStorageInfo?.length) {
    const repeateIndex = sessionStorageInfo.findIndex((e: { id: string }) => e.id === previewId)
    // 重复替换
    if (repeateIndex !== -1) {
      sessionStorageInfo.splice(repeateIndex, 1, {
        id: previewId,
        ...storageInfo
      })
      setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
    } else {
      sessionStorageInfo.push({
        id: previewId,
        ...storageInfo
      })
      setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
    }
  } else {
    setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, [{ id: previewId, ...storageInfo }])
  }
  // 跳转
  routerTurnByPath(path, [previewId], undefined, true)
}

// 模态弹窗
const modelShowHandle = () => {
  modelShow.value = !modelShow.value
}

// 复制预览地址
const copyPreviewPath = (successText?: string, failureText?: string) => {
  if (isSupported) {
    copy()
    window['$message'].success(successText || 'Copied successfully!')
  } else {
    window['$message'].error(failureText || 'Copy failed!')
  }
}

// 发布
const sendHandle = async () => {
  const res = await changeProjectReleaseApi({
    id: fetchRouteParamsLocation(),
    // 反过来
    state: release.value ? -1 : 1
  })

  if (res && res.code === ResultEnum.SUCCESS) {
    modelShowHandle()
    if (!release.value) {
      copyPreviewPath('Published successfully! URL copied to clipboard~', 'Published successfully!')
    } else {
      window['$message'].success(`Unpublished successfully`)
    }
    chartEditStore.setProjectInfo(ProjectInfoEnum.RELEASE, !release.value)
  } else {
    httpErrorHandle()
  }
}

const btnList = [
  {
    select: true,
    title: () => 'Sync Content',
    type: () => 'primary',
    icon: renderIcon(AnalyticsIcon),
    event: syncData
  },
  {
    key: 'preview',
    title: () => 'Preview',
    type: () => 'default',
    icon: renderIcon(BrowsersOutlineIcon),
    event: previewHandle
  },
  {
    key: 'release',
    title: () => (release.value ? 'Published' : 'Publish'),
    icon: renderIcon(SendIcon),
    type: () => (release.value ? 'primary' : 'default'),
    event: modelShowHandle
  }
]

const comBtnList = computed(() => {
  if (chartEditStore.getEditCanvas.isCodeEdit) {
    return btnList
  }
  const cloneList = cloneDeep(btnList)
  cloneList.shift()
  return cloneList
})
</script>

<style lang="scss" scoped>
@include go('system-setting') {
  @extend .go-background-filter;
  min-width: 100px;
  max-width: 60vw;
  padding-bottom: 20px;
  @include deep() {
    .n-list-item:not(:last-child) {
      border-bottom: 0;
    }
  }
}
</style>
