import { ref } from 'vue'

/** Bumped on PDF export so the editor remounts charts with prefetched datasets. */
export const exportRenderNonce = ref(0)

export const bumpExportRenderNonce = () => {
  exportRenderNonce.value += 1
}
