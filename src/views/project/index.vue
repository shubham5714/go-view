<template>
  <div class="go-project">
    <n-layout has-sider position="absolute">
      <n-space vertical>
        <project-layout-sider></project-layout-sider>
      </n-space>
      <n-layout>
        <layout-header-pro>
          <template #left>
            <n-space align="center" :wrap="false" class="go-project-header-left">
              <project-layout-create :collapsed="false" />
              <span class="go-project-tenant-label">Tenant dashboards</span>
            </n-space>
          </template>
        </layout-header-pro>
        <n-layout
          id="go-project-content-top"
          class="content-top"
          position="absolute"
          :native-scrollbar="false"
        >
          <n-layout-content>
            <layout-transition-main>
              <router-view></router-view>
            </layout-transition-main>
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ProjectLayoutSider } from './layout/components/ProjectLayoutSider'
import { ProjectLayoutCreate } from './layout/components/ProjectLayoutCreate'
import { LayoutHeaderPro } from '@/layout/components/LayoutHeaderPro'
import { LayoutTransitionMain } from '@/layout/components/LayoutTransitionMain/index'
</script>

<style lang="scss" scoped>
@include go(project) {
  .content-top {
    top: $--header-height;
    margin-top: 1px;
  }
  &-header-left {
    padding-left: 8px;
  }
  &-tenant-label {
    font-size: 14px;
    opacity: 0.85;
  }
}
</style>
