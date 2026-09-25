import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { nextTick, toRaw } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { getInstanceByDom } from 'echarts/core'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import type { CanvasPageType } from '@/store/modules/chartEditStore/chartEditStore.d'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'
import {
  canvasCut,
  downloadTextFile,
  JSONStringify,
  waitForPageDataReady,
  bumpExportRenderNonce,
  isExportingCanvas
} from '@/utils'

const chartEditStore = useChartEditStore()

type PreparedExport = {
  range: HTMLElement
  watermark: HTMLElement | null
  scaleTemp: number
}

let isExporting = false

const prepareExportRange = (): PreparedExport | null => {
  if (isExporting) {
    window['$message'].warning('Export already in progress')
    return null
  }

  chartEditStore.setTargetSelectChart(undefined)

  const range = document.querySelector('.go-edit-range') as HTMLElement
  if (!range) {
    window['$message'].error('Export failed!')
    return null
  }

  isExporting = true
  isExportingCanvas.value = true
  chartEditStore.setTargetHoverChart(undefined)
  const watermark = document.getElementById('go-edit-watermark')
  const scaleTemp = chartEditStore.getEditCanvas.scale
  chartEditStore.setScale(1, true)
  if (watermark) watermark.style.display = 'none'

  return { range, watermark, scaleTemp }
}

const restoreExportRange = (prepared: PreparedExport) => {
  if (prepared.watermark) prepared.watermark.style.display = 'none'
  chartEditStore.setScale(prepared.scaleTemp, true)
  chartEditStore.setTargetHoverChart(undefined)
  chartEditStore.setTargetSelectChart(undefined)
  isExportingCanvas.value = false
  isExporting = false
}

const settlePaint = (ms = 500) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** Turn off ECharts / CSS / carousel animations so capture is not mid-tween. */
const disableExportAnimations = (
  list: Array<CreateComponentType | CreateComponentGroupType>
) => {
  for (const item of list) {
    if ((item as CreateComponentGroupType).isGroup) {
      disableExportAnimations((item as CreateComponentGroupType).groupList || [])
      continue
    }
    const comp = item as CreateComponentType
    if (comp.styles?.animations?.length) {
      comp.styles.animations = []
    }
    const opt = comp.option as Record<string, any> | undefined
    if (!opt) continue
    opt.animation = false
    opt.animationDuration = 0
    opt.animationDurationUpdate = 0
    if ('isCarousel' in opt) opt.isCarousel = false
    if (opt.animationNormal && typeof opt.animationNormal === 'object') {
      opt.animationNormal = {}
    }
  }
}

/** Wait for Vue flush, ECharts `finished`, then a short settle. */
const waitForChartsReady = async (root: HTMLElement) => {
  await nextTick()
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })

  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[_echarts_instance_]'))
  await Promise.all(
    nodes.map(el => {
      const inst = getInstanceByDom(el)
      if (!inst) return Promise.resolve()
      return new Promise<void>(resolve => {
        let settled = false
        const done = () => {
          if (settled) return
          settled = true
          try {
            inst.off('finished', done)
          } catch {
            /* ignore */
          }
          resolve()
        }
        inst.on('finished', done)
        // Already-idle charts may not re-emit; fall back shortly.
        window.setTimeout(done, 1200)
      })
    })
  )

  await settlePaint(400)
}

const capturePageCanvas = async (range: HTMLElement, background?: string) => {
  return html2canvas(range, {
    backgroundColor: background || '#ffffff',
    allowTaint: true,
    useCORS: true,
    scale: 2
  })
}

/** Export project JSON + PNG at actual canvas size */
export const exportHandle = () => {
  downloadTextFile(JSONStringify(chartEditStore.getStorageInfo() || []), undefined, 'json')

  const prepared = prepareExportRange()
  if (!prepared) return

  setTimeout(() => {
    canvasCut(prepared.range, () => restoreExportRange(prepared))
  }, 600)
}

/** Export all pages to a single PDF (fetch-before-mount → remount → capture) */
export const exportPdfHandle = async () => {
  const prepared = prepareExportRange()
  if (!prepared) return

  chartEditStore.ensurePagesInitialized()
  chartEditStore.flushCurrentPage()

  const pages = chartEditStore.getPages
  const originalPage = pages.find(p => p.id === chartEditStore.getCurrentPageId)
  const originalPageSnapshot: CanvasPageType | null = originalPage
    ? cloneDeep(toRaw(originalPage))
    : null

  let loadingMsg = window['$message'].loading('Exporting PDF…', { duration: 0 })
  const setLoading = (text: string) => {
    // Update in place — destroy()+recreate leaves duplicate toasts in Naive UI
    loadingMsg.content = text
  }

  try {
    const { width, height, projectName } = chartEditStore.getEditCanvasConfig
    const pdfWidth = (width * 25.4) / 96
    const pdfHeight = (height * 25.4) / 96
    const pdf = new jsPDF({
      orientation: width >= height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
      compress: true
    })

    const requestGlobalConfig = chartEditStore.getRequestGlobalConfig
    let totalFailed = 0

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const pageLabel =
        pages.length > 1
          ? `Exporting PDF (${i + 1}/${pages.length}): ${page.name}`
          : 'Exporting PDF'

      setLoading(`${pageLabel} — fetching data…`)

      const prefetchedList = cloneDeep(toRaw(page.componentList || []))
      totalFailed += await waitForPageDataReady(
        prefetchedList,
        requestGlobalConfig,
        message => setLoading(`${pageLabel} — ${message}`)
      )

      // Prefetch clones only — never mutates saved page data
      disableExportAnimations(prefetchedList)

      setLoading(`${pageLabel} — rendering…`)
      chartEditStore.setTargetSelectChart(undefined)
      chartEditStore.setTargetHoverChart(undefined)
      chartEditStore.applyPageToActive({
        id: page.id,
        name: page.name,
        editCanvasConfig: cloneDeep(toRaw(page.editCanvasConfig)),
        componentList: prefetchedList
      })
      chartEditStore.setScale(1, true)
      bumpExportRenderNonce()

      const range = (document.querySelector('.go-edit-range') as HTMLElement) || prepared.range
      await waitForChartsReady(range)
      // Clear again in case remount/layout left a hover frame painted
      chartEditStore.setTargetHoverChart(undefined)
      chartEditStore.setTargetSelectChart(undefined)
      await nextTick()

      const canvas = await capturePageCanvas(range, chartEditStore.getEditCanvasConfig.background)

      if (i > 0) {
        pdf.addPage([pdfWidth, pdfHeight], width >= height ? 'landscape' : 'portrait')
      }
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfWidth, pdfHeight)
    }

    pdf.save(`${projectName?.trim() || 'dashboard'}.pdf`)
    if (totalFailed > 0) {
      window['$message'].warning(
        `PDF exported with ${totalFailed} data fetch failure(s). Some charts may show saved data.`
      )
    } else {
      window['$message'].success(
        pages.length > 1 ? `PDF exported (${pages.length} pages)!` : 'PDF exported successfully!'
      )
    }
  } catch (error) {
    console.error(error)
    window['$message'].error('PDF export failed!')
  } finally {
    if (originalPageSnapshot) {
      chartEditStore.applyPageToActive(originalPageSnapshot)
      bumpExportRenderNonce()
      await nextTick()
    }
    loadingMsg.destroy()
    restoreExportRange(prepared)
  }
}
