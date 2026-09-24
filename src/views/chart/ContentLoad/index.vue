<template>
  <n-modal
    :show="showModal"
    :close-on-esc="false"
    :mask-closable="false"
    :auto-focus="false"
    transform-origin="center"
  >
    <div class="go-editor-boot">
      <span class="go-editor-boot__ring" :style="{ '--go-loading-color': themeColor }"></span>
      <p class="go-editor-boot__title">Loading editor</p>
      <p class="go-editor-boot__subtitle">Preparing your dashboard…</p>
      <n-progress
        class="go-editor-boot__progress"
        type="line"
        :show-indicator="false"
        :height="3"
        :border-radius="2"
        :color="themeColor"
        :rail-color="'rgba(255,255,255,0.08)'"
        :percentage="displayPercentage"
      />
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useChartLayoutStore } from '@/store/modules/chartLayoutStore/chartLayoutStore'
import { useDesignStore } from '@/store/modules/designStore/designStore'

const chartLayoutStore = useChartLayoutStore()
const designStore = useDesignStore()
const showModal = ref(false)
const percentage = ref(0)

const themeColor = computed(() => designStore.getAppTheme)
const displayPercentage = computed(() => Math.max(percentage.value, showModal.value ? 8 : 0))

watch(
  () => chartLayoutStore.getPercentage,
  newValue => {
    if (newValue === 0) {
      setTimeout(() => {
        percentage.value = 0
        showModal.value = false
      }, 280)
      return
    }
    percentage.value = newValue
    showModal.value = true
  }
)
</script>

<style lang="scss" scoped>
.go-editor-boot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
  padding: 28px 24px 24px;
  border-radius: 12px;
  background: rgba(22, 22, 24, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);

  &__ring {
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    margin-bottom: 16px;
    border-radius: 50%;
    border: 2.5px solid rgba(255, 255, 255, 0.12);
    border-top-color: var(--go-loading-color, #51d6a9);
    animation: go-editor-boot-spin 0.75s linear infinite;
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: rgba(255, 255, 255, 0.92);
  }

  &__subtitle {
    margin: 6px 0 18px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
  }

  &__progress {
    width: 100%;
  }
}

@keyframes go-editor-boot-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
