import { ref, nextTick } from 'vue'
import { UploadCustomRequestOptions } from 'naive-ui'
import { FileTypeEnum } from '@/enums/fileTypeEnum'
import { readFile, goDialog, JSONParse } from '@/utils'
import { useSync } from '@/views/chart/hooks/useSync.hook'

export const useFile = () => {
  const importUploadFileListRef = ref()
  const { updateComponent } = useSync()
  // 上传-前置
  //@ts-ignore
  const importBeforeUpload = ({ file }) => {
    importUploadFileListRef.value = []
    const type = file.file.type
    if (type !== FileTypeEnum.JSON && type !== FileTypeEnum.TXT) {
      window['$message'].warning('Only JSON format files are supported. Please upload again!')
      return false
    }
    return true
  }

  // 上传-导入
  const importCustomRequest = (options: UploadCustomRequestOptions) => {
    const { file } = options
    nextTick(() => {
      if (file.file) {
        readFile(file.file).then((fileData: any) => {
          goDialog({
            message: 'Please select import method:',
            positiveText: 'Add (Can be undone)',
            negativeText: 'Replace (Cannot be undone)',
            negativeButtonProps: { type: 'info', ghost: false },
            // 新增
            onPositiveCallback: async () => {
              try {
                fileData = JSONParse(fileData)
                await updateComponent(fileData, false, true)
                window['$message'].success('Import successful!')
              } catch (error) {
                console.log(error)
                window['$message'].error('Component import failed. Please check file integrity!')
              }
            },
            // 覆盖
            onNegativeCallback: async () => {
              try {
                fileData = JSONParse(fileData)
                await updateComponent(fileData, true, true)
                window['$message'].success('Import successful!')
              } catch (error) {
                console.log(error)
                window['$message'].error('Component import failed. Please check file integrity!')
              }
            }
          })
        })
      } else {
        window['$message'].error('Import failed. Please check the data or contact the administrator!')
      }
    })
  }

  return {
    importUploadFileListRef,
    importBeforeUpload,
    importCustomRequest
  }
}
