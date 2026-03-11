<template>
  <n-space align="center" class="go-workspace-controls" :wrap="false">
    <!-- Create project -->
    <project-layout-create :collapsed="false" />

    <!-- Workspace selector -->
    <n-space align="center" :wrap="false">
      <span class="go-workspace-controls-label">Select workspace:</span>
      <n-select
        v-model:value="selectedWorkspaceId"
        :options="workspaceOptions"
        size="small"
        class="go-workspace-controls-select"
        placeholder="Select workspace"
        style="min-width: 120px"
      />
    </n-space>

    <!-- Workspace actions -->
    <n-button size="small" secondary @click="showWorkspaceModal = true">New workspace</n-button>
    <n-button
      v-if="!isDefaultWorkspace"
      size="small"
      secondary
      :disabled="!selectedWorkspaceId"
      @click="showAddUserModal = true"
    >
      Add user
    </n-button>

    <n-modal v-model:show="showWorkspaceModal" preset="dialog" title="Create workspace">
      <n-input v-model:value="newWorkspaceName" placeholder="Enter workspace name" maxlength="50" />
      <template #action>
        <n-button @click="showWorkspaceModal = false">Cancel</n-button>
        <n-button type="primary" @click="onCreateWorkspace">Create</n-button>
      </template>
    </n-modal>

    <n-modal v-model:show="showAddUserModal" preset="dialog" title="Add user to workspace">
      <n-form :model="addUserForm">
        <n-form-item label="Username">
          <n-input v-model:value="addUserForm.username" placeholder="Enter username" />
        </n-form-item>
        <n-form-item label="Password">
          <n-input v-model:value="addUserForm.password" type="password" placeholder="Enter password" />
        </n-form-item>
        <n-form-item label="Nickname">
          <n-input v-model:value="addUserForm.nickname" placeholder="Enter nickname (optional)" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showAddUserModal = false">Cancel</n-button>
        <n-button type="primary" @click="onAddUser">Add</n-button>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { fetchWorkspacesApi, createWorkspaceApi, createWorkspaceUserApi } from '@/api/path'
import { ProjectLayoutCreate } from '../ProjectLayoutCreate/index'

const systemStore = useSystemStore()

const workspaceOptions = computed(() =>
  (systemStore.getWorkspaces || []).map(ws => ({
    label: ws.name,
    value: ws.id
  }))
)

const isDefaultWorkspace = computed(() => {
  const workspaces = systemStore.getWorkspaces || []
  const currentId = systemStore.getCurrentWorkspaceId
  const current = workspaces.find(ws => ws.id === currentId)
  return current?.name === 'Default workspace'
})

const selectedWorkspaceId = computed({
  get: () => systemStore.getCurrentWorkspaceId,
  set: (val: string | undefined) => {
    if (val) {
      ;(systemStore as any).setItem('currentWorkspaceId', val)
    }
  }
})

const showWorkspaceModal = ref(false)
const newWorkspaceName = ref('')

const showAddUserModal = ref(false)
const addUserForm = ref({
  username: '',
  password: '',
  nickname: ''
})

const refreshWorkspaces = async () => {
  const res = await fetchWorkspacesApi()
  if (res && res.data) {
    ;(systemStore as any).setItem('workspaces', res.data)
    if (!systemStore.getCurrentWorkspaceId && res.data.length > 0) {
      ;(systemStore as any).setItem('currentWorkspaceId', res.data[0].id)
    }
  }
}

const onCreateWorkspace = async () => {
  if (!newWorkspaceName.value.trim()) {
    window['$message'].error('Please enter workspace name')
    return
  }
  const res = await createWorkspaceApi({ name: newWorkspaceName.value.trim() })
  if (res && res.code === 200) {
    await refreshWorkspaces()
    if (res.data?.id) {
      ;(systemStore as any).setItem('currentWorkspaceId', res.data.id)
    }
    window['$message'].success('Workspace created successfully')
    newWorkspaceName.value = ''
    showWorkspaceModal.value = false
  }
}

const onAddUser = async () => {
  const workspaceId = (systemStore as any).currentWorkspaceId
  if (!workspaceId) {
    window['$message'].error('Please select a workspace first')
    return
  }
  if (!addUserForm.value.username.trim() || !addUserForm.value.password.trim()) {
    window['$message'].error('Username and password are required')
    return
  }
  const res = await createWorkspaceUserApi(workspaceId, {
    username: addUserForm.value.username.trim(),
    password: addUserForm.value.password.trim(),
    nickname: addUserForm.value.nickname.trim() || undefined
  })
  if (res && res.code === 200) {
    window['$message'].success('User added to workspace')
    addUserForm.value.username = ''
    addUserForm.value.password = ''
    addUserForm.value.nickname = ''
    showAddUserModal.value = false
  }
}

onMounted(async () => {
  if (!systemStore.getWorkspaces || systemStore.getWorkspaces.length === 0) {
    await refreshWorkspaces()
  }
})
</script>

<style scoped lang="scss">
.go-workspace-controls {
  gap: 10px;
}

.go-workspace-controls-label {
  font-size: 12px;
  opacity: 0.85;
  white-space: nowrap;
}
</style>

