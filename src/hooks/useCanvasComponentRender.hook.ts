import { reactive } from 'vue'

/**
 * Editor canvas remount nonce per component id.
 * Bumping forces the chart component to remount so dataset changes always paint
 * (vue-echarts / ECharts often keep a stale view after the first imperative setOption).
 */
const renderNonceById = reactive<Record<string, number>>({})

export const getCanvasComponentRenderNonce = (id: string | undefined | null): number => {
  if (!id) return 0
  return renderNonceById[id] || 0
}

export const bumpCanvasComponentRender = (id: string | undefined | null) => {
  if (!id) return
  renderNonceById[id] = (renderNonceById[id] || 0) + 1
}
