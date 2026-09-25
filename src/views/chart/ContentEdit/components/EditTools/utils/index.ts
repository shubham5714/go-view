import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { canvasCut, downloadTextFile, JSONStringify } from '@/utils'

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

/** Export project JSON + PNG at actual canvas size */
export const exportHandle = () => {
  downloadTextFile(JSONStringify(chartEditStore.getStorageInfo() || []), undefined, 'json')

  const prepared = prepareExportRange()
  if (!prepared) return

  setTimeout(() => {
    canvasCut(prepared.range, () => restoreExportRange(prepared))
  }, 600)
}

/** Export canvas to PDF sized to the designed width × height */
export const exportPdfHandle = async () => {
  const prepared = prepareExportRange()
  if (!prepared) return

  const loadingMsg = window['$message'].loading('Exporting PDF…', { duration: 0 })

  try {
    await new Promise(resolve => setTimeout(resolve, 600))

    const { width, height, background, projectName } = chartEditStore.getEditCanvasConfig
    const canvas = await html2canvas(prepared.range, {
      backgroundColor: background || '#ffffff',
      allowTaint: true,
      useCORS: true,
      scale: 2
    })

    const pdfWidth = (width * 25.4) / 96
    const pdfHeight = (height * 25.4) / 96
    const pdf = new jsPDF({
      orientation: width >= height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
      compress: true
    })

    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${projectName?.trim() || 'dashboard'}.pdf`)
    window['$message'].success('PDF exported successfully!')
  } catch (error) {
    console.error(error)
    window['$message'].error('PDF export failed!')
  } finally {
    loadingMsg.destroy()
    restoreExportRange(prepared)
  }
}
