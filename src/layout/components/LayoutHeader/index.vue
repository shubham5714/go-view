<template>
  <n-layout-header bordered class="go-header">
    <header class="go-header-box" :class="{ 'is-project': isProject }">
      <div class="header-item left">
        <n-space>
          <slot name="left"></slot>
        </n-space>
      </div>
      <div class="header-item center">
        <slot name="center"></slot>
      </div>
      <div class="header-item right">
        <n-space>
          <slot name="ri-left"> </slot>
          <slot name="ri-right"> </slot>
        </n-space>
      </div>
    </header>
  </n-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PageEnum } from '@/enums/pageEnum'

const route = useRoute()

const isProject = computed(() => {
  return route.path.startsWith(PageEnum.BASE_HOME)
})
</script>

<style lang="scss" scoped>
@include go(header) {
  &-box {
    display: flex;
    justify-content: space-between;
    &.is-project {
      grid-template-columns: none;
      padding-left: 20px;
    }
    .header-item {
      display: flex;
      align-items: center;
      &.left {
        justify-content: start;
      }
      &.center {
        justify-content: center;
      }
      &.right {
        justify-content: end;
      }
    }
    height: $--header-height;
    padding: 0 20px 0 60px;
  }
}
</style>
