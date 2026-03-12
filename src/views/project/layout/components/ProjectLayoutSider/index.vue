<template>
  <n-layout-sider
    class="go-project-sider"
    bordered
    collapse-mode="width"
    show-trigger="bar"
    :collapsed="collapsed"
    :native-scrollbar="false"
    :collapsed-width="getAsideCollapsedWidth"
    :width="asideWidth"
    @collapse="collapsed = true"
    @expand="collapsed = false"
  >
    <div class="go-project-sider-flex">
      <aside>
        <div class="go-project-brand">
          DRX EYE
        </div>
        <div class="go-project-workspace-wrapper go-project-library-wrapper">
          <div class="go-project-workspace-title">
            <n-icon size="16" class="go-project-workspace-icon">
              <DuplicateOutlineIcon />
            </n-icon>
            <span>Library</span>
          </div>
          <n-button size="small" block @click="goToLibrary">
            Browse templates
          </n-button>
        </div>
        <div class="go-project-workspace-wrapper">
          <div class="go-project-workspace-title">
            <n-icon size="16" class="go-project-workspace-icon">
              <DuplicateOutlineIcon />
            </n-icon>
            <span>My workspaces</span>
          </div>
          <n-menu
            :value="selectedWorkspaceId"
            :options="workspaceMenuOptions"
            :collapsed-width="getAsideCollapsedWidth"
            :collapsed-icon-size="16"
            :root-indent="8"
            :indent="8"
            :accordion="false"
            @update:value="onWorkspaceChange"
          />
        </div>
        <div class="go-project-workspace-wrapper go-project-members-wrapper" v-if="memberMenuOptions.length">
          <div class="go-project-workspace-title">
            <n-icon size="16" class="go-project-workspace-icon">
              <PersonOutlineIcon />
            </n-icon>
            <span>Workspace members</span>
          </div>
          <n-menu
            :value="null"
            :options="memberMenuOptions"
            :collapsed-width="getAsideCollapsedWidth"
            :collapsed-icon-size="16"
            :root-indent="8"
            :indent="8"
            :accordion="false"
          />
        </div>
      </aside>
    </div>
  </n-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { asideWidth } from '@/settings/designSetting'
import { useSettingStore } from '@/store/modules/settingStore/settingStore'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { PageEnum } from '@/enums/pageEnum'
import { fetchWorkspacesApi, fetchWorkspaceMembersApi } from '@/api/path'
import { icon } from '@/plugins'

const { DuplicateOutlineIcon, PersonOutlineIcon } = icon.ionicons5

const collapsed = ref<boolean>(false)
const { getAsideCollapsedWidth } = toRefs(useSettingStore())

const systemStore = useSystemStore()
const router = useRouter()

const workspaceMenuOptions = computed(() =>
  (systemStore.getWorkspaces || []).map(ws => ({
    key: ws.id,
    label: ws.name
  }))
)

const selectedWorkspaceId = computed({
  get: () => systemStore.getCurrentWorkspaceId,
  set: (val: string | undefined) => {
    if (val) {
      ;(systemStore as any).setItem('currentWorkspaceId', val)
    }
  }
})

const goToLibrary = () => {
  router.push({ name: PageEnum.BASE_HOME_TEMPLATE_MARKET_NAME })
}

const members = ref<any[]>([])

const memberMenuOptions = computed(() =>
  members.value.map(m => ({
    key: m.userId,
    label: m.nickname || m.username
  }))
)

const loadMembers = async (workspaceId: string | undefined) => {
  if (!workspaceId) {
    members.value = []
    return
  }
  const res = await fetchWorkspaceMembersApi(workspaceId)
  if (res && res.data) {
    members.value = res.data
  } else {
    members.value = []
  }
}

const onWorkspaceChange = (key: string) => {
  selectedWorkspaceId.value = key
  loadMembers(key)
  // If user is currently on the Library view, switch back to the normal project list for the selected workspace
  const current = router.currentRoute.value
  if (current.name === PageEnum.BASE_HOME_TEMPLATE_MARKET_NAME) {
    router.push({ name: PageEnum.BASE_HOME_ITEMS_NAME })
  }
}

const watchWidth = () => {
  const Width = document.body.clientWidth
  if (Width <= 950) {
    collapsed.value = true
  } else collapsed.value = false
}

onMounted(async () => {
  window.addEventListener('resize', watchWidth)
  // Ensure workspaces are loaded and a default is selected
  if (!systemStore.getWorkspaces || systemStore.getWorkspaces.length === 0) {
    const res = await fetchWorkspacesApi()
    if (res && res.data) {
      ;(systemStore as any).setItem('workspaces', res.data)
      if (!systemStore.getCurrentWorkspaceId && res.data.length > 0) {
        ;(systemStore as any).setItem('currentWorkspaceId', res.data[0].id)
      }
    }
  }
  await loadMembers((systemStore as any).currentWorkspaceId)
})

onUnmounted(() => {
  window.removeEventListener('resize', watchWidth)
})
</script>

<style lang="scss" scoped>
$siderHeight: 100vh;

@include go(project) {
  &-sider {
    @include fetch-bg-color('aside-background-color');
    &-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      margin-top: 30px;
      margin-bottom: 20px;
    }
    &-flex {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      height: $siderHeight;
      padding: 16px 12px;
    }
  }
  &-layout-sider {
    height: $siderHeight;
  }
  .content-top {
    top: $--header-height;
    margin-top: 1px;
  }

  .go-project-workspace-wrapper {
    width: 100%;
    @include fetch-bg-color('card-background-color');
    border-radius: 8px;
    padding: 12px 10px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .go-project-workspace-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.75;
    margin-bottom: 8px;
  }

  .go-project-workspace-icon {
    opacity: 0.9;
  }

  .go-project-brand {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
    text-align: center;
    width: 100%;
  }

  :deep(.n-menu-item) {
    border-radius: 6px;
    margin-bottom: 4px;
    padding-inline: 8px !important;
    font-size: 13px;
  }

  :deep(.n-menu-item.n-menu-item--selected) {
    font-weight: 600;
  }
}
</style>

