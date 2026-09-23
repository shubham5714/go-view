import { http } from '@/api/http'
import { httpErrorHandle } from '@/utils'
import { RequestHttpEnum, ModuleTypeEnum } from '@/enums/httpEnum'
import { LoginResult } from './system'

// * 登录
export const loginApi = async (data: object) => {
  try {
    const res = await http(RequestHttpEnum.POST)<LoginResult>(`${ModuleTypeEnum.SYSTEM}/login`, data)
    return res
  } catch (err) {
    httpErrorHandle()
  }
}

// * 注册
export const signupApi = async (data: object) => {
  try {
    const res = await http(RequestHttpEnum.POST)(`${ModuleTypeEnum.SYSTEM}/signup`, data)
    return res
  } catch (err) {
    httpErrorHandle()
  }
}

// * 注册邮箱验证码
export const requestSignupEmailCodeApi = async (data: { email: string }) => {
  try {
    const res = await http(RequestHttpEnum.POST)(`${ModuleTypeEnum.SYSTEM}/signup/request-email-code`, data)
    return res
  } catch (err) {
    httpErrorHandle()
  }
}

// * 登出
export const logoutApi = async () => {
  try {
    const res = await http(RequestHttpEnum.GET)(`${ModuleTypeEnum.SYSTEM}/logout`)
    return res
  } catch (err) {
    httpErrorHandle()
  }
}

// * 获取 oss 上传接口
export const ossUrlApi = async (data: object) => {
  try {
    const res = await http(RequestHttpEnum.GET)<{
      /**
       * bucket 地址
       */
      bucketURL?: string
    }>(`${ModuleTypeEnum.SYSTEM}/getOssInfo`, data)
    return res
  } catch (err) {
    httpErrorHandle()
  }
}

// * MFA 验证（Google Authenticator TOTP）
export const verifyMfaApi = async (data: { username: string; code: string }) => {
  try {
    const res = await http(RequestHttpEnum.POST)<LoginResult>(`${ModuleTypeEnum.SYSTEM}/login/mfa-verify`, data)
    return res
  } catch (err) {
    httpErrorHandle()
  }
}

// * AI-SOC SSO handoff exchange
export const exchangeSsoCodeApi = async (data: { code: string }) => {
  try {
    const res = await http(RequestHttpEnum.POST)<{
      token: string
      tokenName: string
      tenantId: string
      userinfo: {
        id?: string
        username?: string
        nickname?: string
      }
    }>(`${ModuleTypeEnum.SYSTEM}/sso/exchange`, data)
    return res
  } catch (err: any) {
    const msg =
      err?.response?.data?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'SSO exchange request failed'
    window['$message']?.error?.(msg)
    throw new Error(msg)
  }
}
