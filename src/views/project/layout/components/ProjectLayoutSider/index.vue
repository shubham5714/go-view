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
          Vscreen
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
        <div class="go-project-workspace-wrapper go-project-library-wrapper">
          <div class="go-project-workspace-title">
            <n-icon size="16" class="go-project-workspace-icon">
              <DuplicateOutlineIcon />
            </n-icon>
            <span>Projects</span>
          </div>
          <n-button size="small" block secondary @click="goToProjects">
            My dashboards
          </n-button>
        </div>
      </aside>
    </div>
  </n-layout-sider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { asideWidth } from '@/settings/designSetting'
import { useSettingStore } from '@/store/modules/settingStore/settingStore'
import { PageEnum } from '@/enums/pageEnum'
import { icon } from '@/plugins'

const { DuplicateOutlineIcon } = icon.ionicons5

const collapsed = ref<boolean>(false)
const { getAsideCollapsedWidth } = toRefs(useSettingStore())
const router = useRouter()

const goToLibrary = () => {
  router.push({ name: PageEnum.BASE_HOME_TEMPLATE_MARKET_NAME })
}

const goToProjects = () => {
  router.push({ name: PageEnum.BASE_HOME_ITEMS_NAME })
}

const watchWidth = () => {
  const Width = document.body.clientWidth
  if (Width <= 950) {
    collapsed.value = true
  } else collapsed.value = false
}

onMounted(() => {
  window.addEventListener('resize', watchWidth)
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
    &-flex {
      display: flex;
      flex-direction: column;
      height: $siderHeight;
    }
  }
  &-brand {
    padding: 20px 16px 8px;
    font-weight: 600;
    font-size: 16px;
  }
  &-workspace-wrapper {
    padding: 12px 16px;
  }
  &-workspace-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 13px;
    opacity: 0.85;
  }
}
</style>
