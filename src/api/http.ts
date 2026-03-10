import axiosInstance from './axios'
import {
  RequestHttpEnum,
  ContentTypeEnum,
  RequestBodyEnum,
  RequestDataTypeEnum,
  RequestContentTypeEnum,
  RequestParamsObjType
} from '@/enums/httpEnum'
import type { RequestGlobalConfigType, RequestConfigType } from '@/store/modules/chartEditStore/chartEditStore.d'

const PRIVATE_WORKER_ENDPOINT = 'https://astran8n.dpdns.org/webhook/1209ead2-ccc0-4b54-88da-2892515e2058'

export const get = <T = any>(url: string, params?: object) => {
  return axiosInstance<T>({
    url: url,
    method: RequestHttpEnum.GET,
    params: params,
  })
}

export const post = <T = any>(url: string, data?: object, headersType?: string) => {
  return axiosInstance<T>({
    url: url,
    method: RequestHttpEnum.POST,
    data: data,
    headers: {
      'Content-Type': headersType || ContentTypeEnum.JSON
    }
  })
}

export const patch = <T = any>(url: string, data?: object, headersType?: string) => {
  return axiosInstance<T>({
    url: url,
    method: RequestHttpEnum.PATCH,
    data: data,
    headers: {
      'Content-Type': headersType || ContentTypeEnum.JSON
    }
  })
}

export const put = <T = any>(url: string, data?: object, headersType?: ContentTypeEnum) => {
  return axiosInstance<T>({
    url: url,
    method: RequestHttpEnum.PUT,
    data: data,
    headers: {
      'Content-Type': headersType || ContentTypeEnum.JSON
    }
  })
}

export const del = <T = any>(url: string, params?: object) => {
  return axiosInstance<T>({
    url: url,
    method: RequestHttpEnum.DELETE,
    params
  })
}

// Get request function, default is GET
export const http = (type?: RequestHttpEnum) => {
  switch (type) {
    case RequestHttpEnum.GET:
      return get

    case RequestHttpEnum.POST:
      return post

    case RequestHttpEnum.PATCH:
      return patch

    case RequestHttpEnum.PUT:
      return put

    case RequestHttpEnum.DELETE:
      return del

    default:
      return get
  }
}
const prefix = 'javascript:'
// Escape / evaluate dynamic input strings
export const translateStr = (target: string | Record<any, any>) => {
  if (typeof target === 'string') {
    if (target.startsWith(prefix)) {
      const funcStr = target.split(prefix)[1]
      let result
      try {
        result = new Function(`${funcStr}`)()
      } catch (error) {
        console.log(error)
        window['$message'].error('js内容解析有误！')
      }
      return result
    } else {
      return target
    }
  }
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      const subTarget = target[key]
      target[key] = translateStr(subTarget)
    }
  }
  return target
}

/**
 * Custom data request helper used by chart components.
 * @param targetParams Request config defined on the component
 * @param globalParams Global request config
 */
export const customizeHttp = (targetParams: RequestConfigType, globalParams: RequestGlobalConfigType) => {
  if (!targetParams || !globalParams) {
    return
  }
  // Global config
  const {
    // Global base URL
    requestOriginUrl,
    // Global request params
    requestParams: globalRequestParams
  } = globalParams

  // Target component config (takes precedence over global)
  const {
    // Request path
    requestUrl,
    // Default / SQL
    requestContentType,
    // Data source type
    requestDataType,
    // HTTP method: get/post/delete/put/patch
    requestHttpType,
    // Body type: none / form-data / x-www-form-urlencoded / json / xml
    requestParamsBodyType,
    // SQL request payload
    requestSQLContent,
    // Request params: params / cookie / header / body (keyed by body type)
    requestParams: targetRequestParams,
    // Whether to proxy this request through the Private Worker
    useProxy
  } = targetParams

  // Skip static data requests
  if (requestDataType === RequestDataTypeEnum.STATIC) return

  if (!requestUrl) {
    return
  }

  // Build headers
  let headers: RequestParamsObjType = {
    ...globalRequestParams.Header,
    ...targetRequestParams.Header
  }
  headers = translateStr(headers)

  // Body data
  let data: RequestParamsObjType | FormData | string = {}
  // Query params
  let params: RequestParamsObjType = { ...targetRequestParams.Params }
  params = translateStr(params)
  // For form-based body types
  let formData: FormData = new FormData()
  // Body type handling

  switch (requestParamsBodyType) {
    case RequestBodyEnum.NONE:
      break

    case RequestBodyEnum.JSON:
      headers['Content-Type'] = ContentTypeEnum.JSON
      // JSON body can also use 'javascript:' for dynamic values
      data = translateStr(targetRequestParams.Body['json'])
      if (typeof data === 'string') data = JSON.parse(data)
      // JSON assign to data
      break

    case RequestBodyEnum.XML:
      headers['Content-Type'] = ContentTypeEnum.XML
      // XML string assign to data
      data = translateStr(targetRequestParams.Body['xml'])
      break

    case RequestBodyEnum.X_WWW_FORM_URLENCODED: {
      headers['Content-Type'] = ContentTypeEnum.FORM_URLENCODED
      const bodyFormData = targetRequestParams.Body['x-www-form-urlencoded']
      for (const i in bodyFormData) formData.set(i, translateStr(bodyFormData[i]))
      // FormData assign to data
      data = formData
      break
    }

    case RequestBodyEnum.FORM_DATA: {
      headers['Content-Type'] = ContentTypeEnum.FORM_DATA
      const bodyFormUrlencoded = targetRequestParams.Body['form-data']
      for (const i in bodyFormUrlencoded) {
        formData.set(i, translateStr(bodyFormUrlencoded[i]))
      }
      // FormData assign to data
      data = formData
      break
    }
  }

  // SQL handling
  if (requestContentType === RequestContentTypeEnum.SQL) {
    headers['Content-Type'] = ContentTypeEnum.JSON
    data = requestSQLContent
  }

  try {
    const url = new Function('return `' + `${requestOriginUrl}${requestUrl}`.trim() + '`')() as string

    // Private Worker mode: send a request description to the worker so it can call the target URL
    if (useProxy) {
      // Normalize body to a plain object to avoid sending raw FormData to the worker
      let body: any = null
      if (data instanceof FormData) {
        body = {}
        data.forEach((v, k) => {
          body[k] = v as any
        })
      } else {
        body = data
      }
      return axiosInstance({
        url: PRIVATE_WORKER_ENDPOINT,
        method: RequestHttpEnum.POST,
        data: {
          request: {
            url,
            method: requestHttpType,
            headers,
            params,
            body
          }
        }
      })
    }

    return axiosInstance({
      url,
      method: requestHttpType,
      data,
      params,
      headers
    })
  } catch (error) {
    console.log(error)
    window['$message'].error('URL地址格式有误！')
  }
}
