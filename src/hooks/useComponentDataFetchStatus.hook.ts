import { computed, reactive } from 'vue'

/** In-flight request counts keyed by component id (not persisted). */
const fetchCountMap = reactive<Record<string, number>>({})

export const beginComponentDataFetch = (componentId: string) => {
  if (!componentId) return
  fetchCountMap[componentId] = (fetchCountMap[componentId] || 0) + 1
}

export const endComponentDataFetch = (componentId: string) => {
  if (!componentId) return
  const next = Math.max(0, (fetchCountMap[componentId] || 0) - 1)
  if (next === 0) {
    delete fetchCountMap[componentId]
  } else {
    fetchCountMap[componentId] = next
  }
}

export const isComponentDataFetching = (componentId: string) => {
  return (fetchCountMap[componentId] || 0) > 0
}

export const useComponentDataFetchLoading = (componentId: string) => {
  return computed(() => isComponentDataFetching(componentId))
}
