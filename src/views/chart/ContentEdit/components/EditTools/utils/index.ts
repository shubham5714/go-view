import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { nextTick } from 'vue'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { canvasCut, downloadTextFile, JSONStringify, waitForPageDataReady } from '@/utils'

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
  const watermark = document.getElementById('go-edit-watermark')
  const scaleTemp = chartEditStore.getEditCanvas.scale
  chartEditStore.setScale(1, true)
  if (watermark) watermark.style.display = 'none'

  return { range, watermark, scaleTemp }
}

const restoreExportRange = (prepared: PreparedExport) => {
  if (prepared.watermark) prepared.watermark.style.display = 'none'
  chartEditStore.setScale(prepared.scaleTemp, true)
  isExporting = false
}

const settlePaint = (ms = 500) => new Promise<void>(resolve => setTimeout(resolve, ms))

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

/** Export all pages to a single PDF (sequential fetch → capture per page) */
export const exportPdfHandle = async () => {
  const prepared = prepareExportRange()
  if (!prepared) return

  chartEditStore.ensurePagesInitialized()
  chartEditStore.flushCurrentPage()

  const pages = chartEditStore.getPages
  const originalPageId = chartEditStore.getCurrentPageId
  let loadingMsg = window['$message'].loading(
    pages.length > 1 ? `Exporting PDF (1/${pages.length})…` : 'Exporting PDF…',
    { duration: 0 }
  )

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

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      if (pages.length > 1 && i > 0) {
        loadingMsg.destroy()
        loadingMsg = window['$message'].loading(
          `Exporting PDF (${i + 1}/${pages.length}): ${page.name}…`,
          { duration: 0 }
        )
      }

      // Switch to this page (mounts only its components); keep export scale at 1
      if (page.id !== chartEditStore.getCurrentPageId) {
        chartEditStore.switchPage(page.id)
        chartEditStore.setScale(1, true)
      }
      await nextTick()
      await settlePaint(200)

      // Re-query range in case DOM remounted
      const range = (document.querySelector('.go-edit-range') as HTMLElement) || prepared.range

      // Fetch this page's data only (parallel within page; sequential across pages)
      await waitForPageDataReady(
        chartEditStore.getComponentList,
        chartEditStore.getRequestGlobalConfig
      )
      await settlePaint(400)

      const background = chartEditStore.getEditCanvasConfig.background
      const canvas = await capturePageCanvas(range, background)

      if (i > 0) {
        pdf.addPage([pdfWidth, pdfHeight], width >= height ? 'landscape' : 'portrait')
      }
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfWidth, pdfHeight)
    }

    pdf.save(`${projectName?.trim() || 'dashboard'}.pdf`)
    window['$message'].success(
      pages.length > 1 ? `PDF exported (${pages.length} pages)!` : 'PDF exported successfully!'
    )
  } catch (error) {
    console.error(error)
    window['$message'].error('PDF export failed!')
  } finally {
    // Restore the page the user was editing
    if (originalPageId && originalPageId !== chartEditStore.getCurrentPageId) {
      chartEditStore.switchPage(originalPageId)
      await nextTick()
    } else {
      chartEditStore.computedScale()
    }
    loadingMsg.destroy()
    restoreExportRange(prepared)
  }
}
