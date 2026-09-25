<template>
  <div v-if="pages.length > 1" class="go-preview-page-tabs" @mousedown.stop @click.stop>
    <button
      v-for="page in pages"
      :key="page.id"
      type="button"
      class="page-tab"
      :class="{ active: page.id === currentPageId }"
      @mousedown.stop
      @click.stop="onSelect(page.id)"
    >
      {{ page.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'

const chartEditStore = useChartEditStore()
const pages = computed(() => chartEditStore.pages)
const currentPageId = computed(() => chartEditStore.currentPageId)

const onSelect = (id: string) => {
  if (!id || id === chartEditStore.currentPageId) return
  chartEditStore.switchPage(id)
}
</script>

<style lang="scss" scoped>
@include go('preview-page-tabs') {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(20, 20, 24, 0.85);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  max-width: min(90vw, 720px);
  overflow-x: auto;

  .page-tab {
    flex-shrink: 0;
    height: 28px;
    padding: 0 14px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    &.active {
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      font-weight: 600;
    }
  }
}
</style>
