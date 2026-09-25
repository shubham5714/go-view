<template>
  <div
    v-if="loading"
    class="chart-data-fetch-indicator"
    title="Refreshing data…"
    aria-label="Refreshing data"
    role="status"
  >
    <span class="chart-data-fetch-indicator__dot"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isComponentDataFetching } from '@/hooks/useComponentDataFetchStatus.hook'

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
})

const loading = computed(() => isComponentDataFetching(props.componentId))
</script>

<style lang="scss" scoped>
.chart-data-fetch-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
    animation: chart-data-fetch-blink 1s ease-in-out infinite;
  }
}

@keyframes chart-data-fetch-blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(0.85);
  }
}
</style>
