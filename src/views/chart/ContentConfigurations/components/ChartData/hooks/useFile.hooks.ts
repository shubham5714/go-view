import { ref, toRef, nextTick } from 'vue'
import { UploadCustomRequestOptions } from 'naive-ui'
import { FileTypeEnum } from '@/enums/fileTypeEnum'
import { readFile, downloadTextFile, JSONStringify, JSONParse } from '@/utils'

export const useFile = (targetData: any) => {
  const uploadFileListRef = ref()

  //@ts-ignore
  const beforeUpload = ({ file }) => {
    uploadFileListRef.value = []
    const type = file.file.type
    if (type !== FileTypeEnum.JSON && type !== FileTypeEnum.TXT) {
      window['$message'].warning('Only JSON format files are supported. Please upload again!')
      return false
    }
    return true
  }

  // 自定义上传操作
  const customRequest = (options: UploadCustomRequestOptions) => {
    const { file } = options
    nextTick(() => {
      if (file.file) {
        readFile(file.file).then((fileData: any) => {
          targetData.value.option.dataset = JSONParse(fileData)
        })
      } else {
        window['$message'].error('Import failed. Please try again later or contact an administrator!')
      }
    })
  }

  // 下载文件
  const download = () => {
    try {
      window['$message'].success('Downloading, please wait...')
      downloadTextFile(JSONStringify(targetData.value.option.dataset), undefined, 'json')
    } catch (error) {
      window['$message'].error('Download failed. Invalid data!')
    }
  }
  return {
    uploadFileListRef,
    beforeUpload,
    customRequest,
    download
  }
}
