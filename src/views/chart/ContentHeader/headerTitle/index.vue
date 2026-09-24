<template>
  <n-space>
    <n-icon size="20" :depth="3">
      <create-icon></create-icon>
    </n-icon>
    <n-text @click="handleFocus">
      Name:
      <n-button v-show="!focus" secondary size="tiny">
        <span class="title">
          {{ comTitle }}
        </span>
      </n-button>
    </n-text>

    <n-input
      v-show="focus"
      ref="inputInstRef"
      size="small"
      type="text"
      maxlength="50"
      show-count
      placeholder="Enter project name"
      v-model:value="title"
      @keyup.enter="handleBlur"
      @blur="handleBlur"
    ></n-input>
  </n-space>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watchEffect } from 'vue'
import { ResultEnum } from '@/enums/httpEnum'
import { fetchRouteParamsLocation, httpErrorHandle, setTitle } from '@/utils'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { ProjectInfoEnum, EditCanvasConfigEnum } from '@/store/modules/chartEditStore/chartEditStore.d'
import { updateProjectApi } from '@/api/path'
import { useSync } from '../../hooks/useSync.hook'
import { icon } from '@/plugins'

const chartEditStore = useChartEditStore()
const { dataSyncUpdate } = useSync()
const { CreateIcon } = icon.ionicons5

const focus = ref<boolean>(false)
const inputInstRef = ref(null)

const title = ref<string>(fetchRouteParamsLocation())

watchEffect(() => {
  title.value = chartEditStore.getProjectInfo.projectName || ''
})

const comTitle = computed(() => {
  const newTitle = title.value.trim().length ? title.value.trim() : 'New Project'
  setTitle(newTitle)
  chartEditStore.setEditCanvasConfig(EditCanvasConfigEnum.PROJECT_NAME, newTitle)
  return newTitle
})

const handleFocus = () => {
  focus.value = true
  nextTick(() => {
    inputInstRef.value && (inputInstRef.value as any).focus()
  })
}

const handleBlur = async () => {
  focus.value = false
  const nextTitle = title.value.trim()
  title.value = nextTitle
  chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_NAME, nextTitle || '')
  const res = (await updateProjectApi({
    id: fetchRouteParamsLocation(),
    projectName: nextTitle
  }))
  if (res && res.code === ResultEnum.SUCCESS) {
    dataSyncUpdate()
  } else {
    httpErrorHandle()
  }
}
</script>
<style lang="scss" scoped>
.title {
  padding-left: 5px;
  padding-right: 5px;
  font-size: 15px;
}
</style>
