import { ModuleTypeEnum } from '@/enums/httpEnum'

// 接口白名单（免登录）
export const fetchAllowList = [
  // 登录
  `${ModuleTypeEnum.SYSTEM}/login`,
  // AI-SOC SSO exchange
  `${ModuleTypeEnum.SYSTEM}/sso/exchange`,
  // 注册
  `${ModuleTypeEnum.SYSTEM}/signup`,
  // 注册邮箱验证码
  `${ModuleTypeEnum.SYSTEM}/signup/request-email-code`,
  // 获取 OSS 接口
  `${ModuleTypeEnum.SYSTEM}/getOssInfo`,
]

// 接口黑名单
export const fetchBlockList = []