import cloneDeep from 'lodash/cloneDeep'
import { getUUID } from '@/utils/utils'
import { defaultTheme, globalThemeJson } from '@/settings/chartThemes/index'
import { previewScaleType } from '@/settings/designSetting'
import {
  ChartEditStoreEnum,
  ChartEditStorage,
  CanvasPageType,
  EditCanvasConfigType
} from '@/store/modules/chartEditStore/chartEditStore.d'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'

/** Fields shared across all pages (project-level) */
export const SHARED_CANVAS_FIELDS: (keyof EditCanvasConfigType)[] = [
  'width',
  'height',
  'previewScaleType',
  'projectName',
  'remarks'
]

export const createDefaultEditCanvasConfig = (): EditCanvasConfigType =>
  ({
    projectName: undefined,
    remarks: '',
    width: 1920,
    height: 1080,
    filterShow: false,
    hueRotate: 0,
    saturate: 1,
    contrast: 1,
    brightness: 1,
    opacity: 1,
    rotateZ: 0,
    rotateX: 0,
    rotateY: 0,
    skewX: 0,
    skewY: 0,
    blendMode: 'normal',
    background: undefined,
    backgroundImage: undefined,
    selectColor: true,
    chartThemeColor: defaultTheme || 'dark',
    chartCustomThemeColorInfo: undefined,
    chartThemeSetting: globalThemeJson,
    vChartThemeName: 'vScreenVolcanoBlue',
    previewScaleType: previewScaleType
  }) as EditCanvasConfigType

/** Blank page using shared size/adaptation from `sharedConfig` */
export const createBlankCanvasPage = (
  sharedConfig: EditCanvasConfigType,
  name = 'Page 1'
): CanvasPageType => {
  const config = createDefaultEditCanvasConfig()
  for (const key of SHARED_CANVAS_FIELDS) {
    if (sharedConfig[key] !== undefined) {
      ;(config as any)[key] = sharedConfig[key]
    }
  }
  return {
    id: getUUID(),
    name,
    editCanvasConfig: config,
    componentList: []
  }
}

export const syncSharedFieldsToPages = (
  pages: CanvasPageType[],
  shared: EditCanvasConfigType
): void => {
  for (const page of pages) {
    for (const key of SHARED_CANVAS_FIELDS) {
      if (shared[key] !== undefined) {
        ;(page.editCanvasConfig as any)[key] = shared[key]
      }
    }
  }
}

/**
 * Normalize legacy (single-canvas) or v2 content into multi-page ChartEditStorage.
 */
export const migrateToMultiPage = (raw: Record<string, any> | ChartEditStorage): ChartEditStorage => {
  const data = raw || {}
  const requestGlobalConfig = data[ChartEditStoreEnum.REQUEST_GLOBAL_CONFIG] || data.requestGlobalConfig
  const editCanvasConfig: EditCanvasConfigType =
    data[ChartEditStoreEnum.EDIT_CANVAS_CONFIG] ||
    data.editCanvasConfig ||
    createDefaultEditCanvasConfig()
  const componentList: Array<CreateComponentType | CreateComponentGroupType> =
    data[ChartEditStoreEnum.COMPONENT_LIST] || data.componentList || []

  if (Array.isArray(data.pages) && data.pages.length > 0) {
    const pages: CanvasPageType[] = data.pages.map((p: CanvasPageType, index: number) => ({
      id: p.id || getUUID(),
      name: p.name || `Page ${index + 1}`,
      editCanvasConfig: p.editCanvasConfig
        ? ({ ...createDefaultEditCanvasConfig(), ...p.editCanvasConfig } as EditCanvasConfigType)
        : cloneDeep(editCanvasConfig),
      componentList: Array.isArray(p.componentList) ? p.componentList : []
    }))
    syncSharedFieldsToPages(pages, editCanvasConfig)

    let currentPageId: string = data.currentPageId
    if (!currentPageId || !pages.find(p => p.id === currentPageId)) {
      currentPageId = pages[0].id
    }
    const current = pages.find(p => p.id === currentPageId)!

    return {
      version: 2,
      [ChartEditStoreEnum.EDIT_CANVAS_CONFIG]: {
        ...createDefaultEditCanvasConfig(),
        ...current.editCanvasConfig,
        width: editCanvasConfig.width ?? current.editCanvasConfig.width,
        height: editCanvasConfig.height ?? current.editCanvasConfig.height,
        previewScaleType: editCanvasConfig.previewScaleType ?? current.editCanvasConfig.previewScaleType
      },
      [ChartEditStoreEnum.REQUEST_GLOBAL_CONFIG]: requestGlobalConfig,
      [ChartEditStoreEnum.COMPONENT_LIST]: current.componentList,
      pages,
      currentPageId
    }
  }

  // Legacy single-canvas → one page
  const page = createBlankCanvasPage(editCanvasConfig, 'Page 1')
  page.editCanvasConfig = cloneDeep(editCanvasConfig)
  page.componentList = cloneDeep(componentList)

  return {
    version: 2,
    [ChartEditStoreEnum.EDIT_CANVAS_CONFIG]: editCanvasConfig,
    [ChartEditStoreEnum.REQUEST_GLOBAL_CONFIG]: requestGlobalConfig,
    [ChartEditStoreEnum.COMPONENT_LIST]: componentList,
    pages: [page],
    currentPageId: page.id
  }
}
