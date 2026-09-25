import { onUnmounted } from 'vue';
import html2canvas from 'html2canvas'
import { getUUID, httpErrorHandle, fetchRouteParamsLocation, base64toFile, JSONStringify, JSONParse, migrateToMultiPage } from '@/utils'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { EditCanvasTypeEnum, ChartEditStoreEnum, ProjectInfoEnum, ChartEditStorage, CanvasPageType } from '@/store/modules/chartEditStore/chartEditStore.d'
import { useChartHistoryStore } from '@/store/modules/chartHistoryStore/chartHistoryStore'
import { StylesSetting } from '@/components/Pages/ChartItemSetting'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { useChartLayoutStore } from '@/store/modules/chartLayoutStore/chartLayoutStore'
import { ChartLayoutStoreEnum } from '@/store/modules/chartLayoutStore/chartLayoutStore.d'
import { fetchChartComponent, fetchConfigComponent, createComponent } from '@/packages/index'
import { saveInterval } from '@/settings/designSetting'
import throttle from 'lodash/throttle'
// 接口状态
import { ResultEnum } from '@/enums/httpEnum'
// 接口
import { saveProjectApi, fetchProjectApi, uploadFile, updateProjectApi } from '@/api/path'
// 画布枚举
import { SyncEnum } from '@/enums/editPageEnum'
import { CreateComponentType, CreateComponentGroupType, ConfigType } from '@/packages/index.d'
import { BaseEvent, EventLife } from '@/enums/eventEnum'
import { PublicGroupConfigClass } from '@/packages/public/publicConfig'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'

/**
 * * 画布-版本升级对旧数据无法兼容的补丁
 * @param object
 */
const canvasVersionUpdatePolyfill = (object: any) => {
  return object
}

/**
 * * 组件-版本升级对旧数据无法兼容的补丁
 * @param newObject
 * @param sources
 */
const componentVersionUpdatePolyfill = (newObject: any, sources: any) => {
  try {
    // 判断是否是组件
    if (sources.id) {
      // 处理事件补丁
      const hasVnodeBeforeMount = 'vnodeBeforeMount' in sources.events
      const hasVnodeMounted = 'vnodeMounted' in sources.events

      if (hasVnodeBeforeMount) {
        newObject.events.advancedEvents.vnodeBeforeMount = sources?.events.vnodeBeforeMount
      }
      if (hasVnodeMounted) {
        newObject.events.advancedEvents.vnodeMounted = sources?.events.vnodeMounted
      }
      if (hasVnodeBeforeMount || hasVnodeMounted) {
        sources.events = {
          baseEvent: {
            [BaseEvent.ON_CLICK]: undefined,
            [BaseEvent.ON_DBL_CLICK]: undefined,
            [BaseEvent.ON_MOUSE_ENTER]: undefined,
            [BaseEvent.ON_MOUSE_LEAVE]: undefined
          },
          advancedEvents: {
            [EventLife.VNODE_MOUNTED]: undefined,
            [EventLife.VNODE_BEFORE_MOUNT]: undefined
          },
          interactEvents: []
        }
      }
      return newObject
    }
  } catch (error) {
    return newObject
  }
}

/**
 * * 合并处理
 * @param newObject 新的模板数据
 * @param sources 新拿到的数据
 * @returns object
 */
const componentMerge = (newObject: any, sources: any, notComponent = false) => {
  // 处理组件补丁
  componentVersionUpdatePolyfill(newObject, sources)

  // 非组件不处理
  if (notComponent) return merge(newObject, sources)
  // 组件排除 newObject
  const option = sources.option
  if (!option) return merge(newObject, sources)

  // 为 undefined 的 sources 来源对象属性将被跳过详见 https://www.lodashjs.com/docs/lodash.merge
  sources.option = undefined
  if (option) {
    return {
      ...merge(newObject, sources),
      option: option
    }
  }
}

// 请求处理
export const useSync = () => {
  const chartEditStore = useChartEditStore()
  const chartHistoryStore = useChartHistoryStore()
  const systemStore = useSystemStore()
  const chartLayoutStore = useChartLayoutStore()
  /**
   * * 组件动态注册
   * @param projectData 项目数据
   * @param isReplace 是否替换数据
   * @returns
   */
  const updateComponent = async (projectData: ChartEditStorage, isReplace = false, changeId = false) => {
    if (isReplace) {
      // 清除列表
      chartEditStore.componentList = []
      // 清除历史记录
      chartHistoryStore.clearBackStack()
      chartHistoryStore.clearForwardStack()
    }

    // Migrate legacy single-canvas → multi-page
    const migrated = migrateToMultiPage(projectData as any)
    projectData = migrated

    // 画布补丁处理
    projectData.editCanvasConfig = canvasVersionUpdatePolyfill(projectData.editCanvasConfig)

    const intComponent = (target: CreateComponentType) => {
      if (!window['$vue'].component(target.chartConfig.chartKey)) {
        window['$vue'].component(target.chartConfig.chartKey, fetchChartComponent(target.chartConfig))
        window['$vue'].component(target.chartConfig.conKey, fetchConfigComponent(target.chartConfig))
      }
    }

    // Register components from all pages
    const allLists = (projectData.pages || []).map(p => p.componentList)
    if (!allLists.length) allLists.push(projectData.componentList || [])
    allLists.forEach(list => {
      list.forEach((e: CreateComponentType | CreateComponentGroupType) => {
        if (e.isGroup) {
          ;(e as CreateComponentGroupType).groupList.forEach(groupItem => {
            intComponent(groupItem)
          })
        } else {
          intComponent(e as CreateComponentType)
        }
      })
    })

    // 创建函数-重新创建是为了处理类种方法消失的问题
    const create = async (
      _componentInstance: CreateComponentType,
      callBack?: (componentInstance: CreateComponentType) => void
    ) => {
      // 补充 class 上的方法
      let newComponent: CreateComponentType = await createComponent(_componentInstance.chartConfig)
      if (_componentInstance.chartConfig.redirectComponent) {
        _componentInstance.chartConfig.dataset && (newComponent.option.dataset = _componentInstance.chartConfig.dataset)
        newComponent.chartConfig.title = _componentInstance.chartConfig.title
        newComponent.chartConfig.chartFrame = _componentInstance.chartConfig.chartFrame
      }
      if (callBack) {
        if (changeId) {
          callBack(componentMerge(newComponent, { ..._componentInstance, id: getUUID() }))
        } else {
          callBack(componentMerge(newComponent, _componentInstance))
        }
      } else {
        if (changeId) {
          chartEditStore.addComponentList(
            componentMerge(newComponent, { ..._componentInstance, id: getUUID() }),
            false,
            true
          )
        } else {
          chartEditStore.addComponentList(componentMerge(newComponent, _componentInstance), false, true)
        }
      }
    }

    const hydrateList = async (
      list: Array<CreateComponentType | CreateComponentGroupType>
    ): Promise<Array<CreateComponentType | CreateComponentGroupType>> => {
      const result: Array<CreateComponentType | CreateComponentGroupType> = []
      for (const comItem of list) {
        if (comItem.isGroup) {
          let groupClass = new PublicGroupConfigClass()
          if (changeId) {
            groupClass = componentMerge(groupClass, { ...comItem, id: getUUID() })
          } else {
            groupClass = componentMerge(groupClass, comItem)
          }
          const targetList: CreateComponentType[] = []
          for (const groupItem of (comItem as CreateComponentGroupType).groupList) {
            await create(groupItem, e => {
              targetList.push(e)
            })
          }
          groupClass.groupList = targetList
          result.push(groupClass)
        } else {
          await create(comItem as CreateComponentType, e => {
            result.push(e)
          })
        }
      }
      return result
    }

    // Merge project-level configs
    componentMerge(chartEditStore.editCanvasConfig, projectData.editCanvasConfig, true)
    componentMerge(chartEditStore.requestGlobalConfig, projectData.requestGlobalConfig, true)

    // Hydrate every page's components, then activate current page
    const pages = projectData.pages || []
    const hydratedPages: CanvasPageType[] = []
    let loadIndex = 0
    const totalComponents = pages.reduce((n, p) => n + (p.componentList?.length || 0), 0) || 1

    for (const page of pages) {
      const hydratedList = await hydrateList(page.componentList || [])
      loadIndex += page.componentList?.length || 0
      const percentage = parseInt((parseFloat(`${loadIndex / totalComponents}`) * 100).toString())
      chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, percentage)
      hydratedPages.push({
        id: page.id,
        name: page.name,
        editCanvasConfig: cloneDeep(page.editCanvasConfig),
        componentList: hydratedList
      })
    }

    const currentPageId = projectData.currentPageId || hydratedPages[0]?.id || ''
    chartEditStore.setPagesFromStorage(hydratedPages, currentPageId)

    const currentPage = hydratedPages.find(p => p.id === currentPageId) || hydratedPages[0]
    if (currentPage) {
      chartEditStore.componentList = []
      for (const item of currentPage.componentList) {
        chartEditStore.addComponentList(item, false, true)
      }
      // Page-specific visuals (size already merged from project editCanvasConfig)
      componentMerge(chartEditStore.editCanvasConfig, currentPage.editCanvasConfig, true)
    }

    chartHistoryStore.clearBackStack()
    chartHistoryStore.clearForwardStack()

    // 清除数量
    chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 0)
  }

  /**
   * * 赋值全局数据
   * @param projectData 项目数据
   * @returns
   */
  const updateStoreInfo = (projectData: {
    id: string,
    projectName: string,
    indexImage: string,
    remarks: string,
    state: number
  }) => {
    const { id, projectName, remarks, indexImage, state } = projectData
    // ID
    chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, id)
    // 名称
    chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_NAME, projectName)
    // 描述
    chartEditStore.setProjectInfo(ProjectInfoEnum.REMARKS, remarks)
    // 缩略图
    chartEditStore.setProjectInfo(ProjectInfoEnum.THUMBNAIL, indexImage)
    // 发布
    chartEditStore.setProjectInfo(ProjectInfoEnum.RELEASE, state === 1)
  }

  // * 数据获取
  const dataSyncFetch = async () => {
    // FIX:重新执行dataSyncFetch需清空chartEditStore.componentList,否则会导致图层重复
    // 切换语言等操作会导致重新执行 dataSyncFetch,此时pinia中并未清空chartEditStore.componentList，导致图层重复
    chartEditStore.componentList = []
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.START)
    // Single editor boot overlay (replaces per-section async spinners)
    chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 1)
    try {
      const res = await fetchProjectApi({ projectId: fetchRouteParamsLocation() })
      if (res && res.code === ResultEnum.SUCCESS) {
        if (res.data) {
          updateStoreInfo(res.data)
          // 更新全局数据
          await updateComponent(JSONParse(res.data.content))
          chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 0)
          return
        }else {
          chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, fetchRouteParamsLocation())
        }
        chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 0)
        setTimeout(() => {
          chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.SUCCESS)
        }, 1000)
        return
      }
      chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 0)
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
    } catch (error) {
      chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 0)
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
      httpErrorHandle()
    }
  }

  // * 数据保存
  const dataSyncUpdate = throttle(async (updateImg = true, showMessage = false) => {
    if(!fetchRouteParamsLocation()) return

    let projectId = chartEditStore.getProjectInfo[ProjectInfoEnum.PROJECT_ID];
    if(projectId === null || projectId === ''){
      window['$message'].error('Data not initialized successfully. Please refresh the page!')
      return
    }

    chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.START)

    // Save dashboard JSON first so the UI can finish quickly
    let params = new FormData()
    params.append('projectId', projectId)
    params.append('content', JSONStringify(chartEditStore.getStorageInfo() || {}))
    const res = await saveProjectApi(params)

    if (res && res.code === ResultEnum.SUCCESS) {
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.SUCCESS)
      if (showMessage) {
        window['$message'].success('Saved successfully')
      }
      // Thumbnail refresh is best-effort and must not block save feedback
      if (updateImg) {
        void (async () => {
          try {
            const range = document.querySelector('.go-edit-range') as HTMLElement
            if (!range) return
            const canvasImage: HTMLCanvasElement = await html2canvas(range, {
              backgroundColor: null,
              allowTaint: true,
              useCORS: true
            })
            const uploadParams = new FormData()
            uploadParams.append(
              'object',
              base64toFile(canvasImage.toDataURL(), `${fetchRouteParamsLocation()}_index_preview.png`)
            )
            const uploadRes = await uploadFile(uploadParams)
            if (uploadRes && uploadRes.code === ResultEnum.SUCCESS) {
              if (uploadRes.data.fileurl) {
                await updateProjectApi({
                  id: fetchRouteParamsLocation(),
                  indexImage: `${uploadRes.data.fileurl}`
                })
              } else {
                await updateProjectApi({
                  id: fetchRouteParamsLocation(),
                  indexImage: `${systemStore.getFetchInfo.OSSUrl}${uploadRes.data.fileName}`
                })
              }
            }
          } catch (e) {
            console.log(e)
          }
        })()
      }
      return
    }
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
    if (showMessage) {
      window['$message'].error('Save failed, please try again')
    }
  }, 1200)

  // * 定时处理
  const intervalDataSyncUpdate = () => {
    // 定时获取数据
    const syncTiming = setInterval(() => {
      dataSyncUpdate()
    }, saveInterval * 1000)

    // 销毁
    onUnmounted(() => {
      clearInterval(syncTiming)
    })
  }

  return {
    updateComponent,
    updateStoreInfo,
    dataSyncFetch,
    dataSyncUpdate,
    intervalDataSyncUpdate
  }
}
