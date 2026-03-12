<template>
  <div class="go-project-template-market">
    <div class="go-project-template-market-header">
      <h3>Library</h3>
      <p>Browse common projects and quickly create copies in your workspaces.</p>
    </div>

    <div class="go-project-template-market-content">
      <div v-if="loading">
        <go-loading />
      </div>
      <div v-else>
        <n-grid :x-gap="20" :y-gap="20" cols="2 s:2 m:3 l:4 xl:4 xxl:4" responsive="screen">
          <n-grid-item v-for="item in list" :key="item.id">
            <div
              class="template-card-wrapper"
              @mouseenter="hoveredId = item.id"
              @mouseleave="hoveredId = null"
            >
              <project-items-card
                :cardData="item"
                @preview="() => openCreateModal(item)"
                @resize="() => openCreateModal(item)"
                @edit="() => openCreateModal(item)"
                @delete="noop"
                @release="noop"
              />
              <div v-if="hoveredId === item.id" class="template-card-overlay">
                <n-button size="small" type="primary" @click.stop="openCreateModal(item)">
                  Create
                </n-button>
              </div>
            </div>
          </n-grid-item>
        </n-grid>
        <div v-if="!list.length" class="empty-text">
          No templates available. Mark any project as a template to show it here.
        </div>
      </div>
    </div>

    <n-modal v-model:show="showCreateModal" preset="dialog" title="Create project from template">
      <n-space vertical>
        <div v-if="selectedTemplate">
          <div class="modal-template-title">{{ selectedTemplate.title }}</div>
        </div>
        <n-select
          v-model:value="selectedWorkspaceId"
          :options="workspaceOptions"
          placeholder="Select workspace"
        />
        <n-input
          v-model:value="projectName"
          placeholder="Project name (optional, defaults to template name)"
          maxlength="100"
        />
      </n-space>
      <template #action>
        <n-space justify="end">
          <n-button @click="showCreateModal = false">Cancel</n-button>
          <n-button type="primary" @click="confirmCreateFromTemplate">Create</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ProjectItemsCard } from '@/views/project/items/components/ProjectItemsCard'
import { fetchTemplateProjectsApi, createProjectFromTemplateApi } from '@/api/path'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { fetchPathByName, routerTurnByPath } from '@/utils'
import { ChartEnum } from '@/enums/pageEnum'
import { ResultEnum } from '@/enums/httpEnum'

type TemplateCard = {
  id: string
  title: string
  image: string | null
  release: boolean
}

const systemStore = useSystemStore()

const loading = ref(true)
const list = ref<TemplateCard[]>([])
const hoveredId = ref<string | null>(null)

const showCreateModal = ref(false)
const selectedTemplate = ref<TemplateCard | null>(null)
const selectedWorkspaceId = ref<string | undefined>(undefined)
const projectName = ref('')

const workspaceOptions = computed(() =>
  (systemStore.getWorkspaces || []).map((ws: any) => ({
    label: ws.name,
    value: ws.id,
  }))
)

const loadTemplates = async () => {
  loading.value = true
  const res = await fetchTemplateProjectsApi()
  if (res && res.code === ResultEnum.SUCCESS && res.data) {
    list.value = res.data.map((tpl: any) => ({
      id: tpl.id,
      title: tpl.name,
      image: tpl.indexImage || null,
      release: true,
    }))
  } else {
    list.value = []
  }
  loading.value = false
}

const openCreateModal = (item: TemplateCard) => {
  selectedTemplate.value = item
  selectedWorkspaceId.value = (systemStore as any).currentWorkspaceId
  projectName.value = ''
  showCreateModal.value = true
}

const confirmCreateFromTemplate = async () => {
  if (!selectedTemplate.value) {
    window['$message'].error('No template selected')
    return
  }
  const workspaceId = selectedWorkspaceId.value
  if (!workspaceId) {
    window['$message'].error('Please select a workspace first')
    return
  }
  try {
    const res = await createProjectFromTemplateApi(selectedTemplate.value.id, {
      workspaceId,
      projectName: projectName.value.trim() || undefined,
    })
    if (res && res.code === ResultEnum.SUCCESS) {
      window['$message'].success('Project created from template')
      const { id } = res.data
      const path = fetchPathByName(ChartEnum.CHART_HOME_NAME, 'href')
      routerTurnByPath(path, [id], undefined, true)
      showCreateModal.value = false
    }
  } catch {
    window['$message'].error('Failed to create project from template')
  }
}

const noop = () => {}

onMounted(() => {
  loadTemplates()
})
</script>

<style lang="scss" scoped>
@include go('project-template-market') {
  padding: 20px 20px;
  &-header {
    margin-bottom: 16px;
    h3 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
    }
    p {
      margin: 0;
      font-size: 13px;
      opacity: 0.75;
    }
  }
  &-content {
    min-height: calc(100vh - #{$--header-height} - 80px);
  }
  .empty-text {
    margin-top: 16px;
    font-size: 13px;
    opacity: 0.7;
  }
  .template-card-wrapper {
    position: relative;
  }
  .template-card-overlay {
    position: absolute;
    bottom: 12px;
    right: 12px;
    z-index: 2;
  }
  .modal-template-title {
    font-weight: 500;
    margin-bottom: 4px;
  }
  // Hide default project card footer actions (edit / menu / release text) for templates
  .template-card-wrapper {
    :deep(.list-footer) {
      display: none;
    }
  }
}
</style>
