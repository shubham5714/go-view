<template>
  <div class="go-loading go-flex-center" role="status" aria-label="Loading">
    <span class="go-loading__ring" :style="{ '--go-loading-color': themeColor }"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignStore } from '@/store/modules/designStore/designStore'

const designStore = useDesignStore()
const themeColor = computed(() => designStore.getAppTheme || '#51d6a9')
</script>

<style lang="scss" scoped>
@include go('loading') {
  width: 100%;
  height: 100%;
  min-height: 48px;
  background-color: transparent;

  &__ring {
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2.5px solid rgba(255, 255, 255, 0.12);
    border-top-color: var(--go-loading-color, #51d6a9);
    animation: go-loading-spin 0.75s linear infinite;
  }
}

@keyframes go-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
