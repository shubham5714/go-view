import { ref } from 'vue'

/** Bumped on PDF export so the editor remounts charts with prefetched datasets. */
export const exportRenderNonce = ref(0)

/** True while PDF/image export is capturing — blocks editor hover/select chrome. */
export const isExportingCanvas = ref(false)

export const bumpExportRenderNonce = () => {
  exportRenderNonce.value += 1
}
