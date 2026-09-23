<template>
  <div class="go-sso-page">
    <n-spin :show="true" description="Signing you in from AI-SOC…" />
    <p v-if="error" class="go-sso-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exchangeSsoCodeApi } from '@/api/path'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { SystemStoreEnum, SystemStoreUserInfoEnum } from '@/store/modules/systemStore/systemStore.d'
import { PageEnum } from '@/enums/pageEnum'
import { ResultEnum } from '@/enums/httpEnum'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const error = ref<string | null>(null)

const aiSocUrl = (import.meta.env.VITE_AI_SOC_URL as string | undefined)?.replace(/\/$/, '') || ''

onMounted(async () => {
  const code = String(route.query.code || '').trim()
  const next = String(route.query.next || PageEnum.BASE_HOME_ITEMS).trim() || PageEnum.BASE_HOME_ITEMS

  if (!code) {
    error.value = 'Missing SSO code. Open GoView from AI-SOC → Dashboards → GoView.'
    if (aiSocUrl) {
      window.setTimeout(() => {
        window.location.href = `${aiSocUrl}/dashboards/goview`
      }, 1500)
    }
    return
  }

  try {
    const res = await exchangeSsoCodeApi({ code })
    if (!res || res.code !== ResultEnum.SUCCESS || !res.data) {
      throw new Error((res as any)?.msg || 'SSO exchange failed')
    }

    const data = res.data as any
    const token = data.token || data.tokenValue
    const tokenName = data.tokenName || 'satoken'
    const userinfo = data.userinfo || {}
    const tenantId = data.tenantId

    systemStore.setItem(SystemStoreEnum.USER_INFO, {
      [SystemStoreUserInfoEnum.USER_TOKEN]: token,
      [SystemStoreUserInfoEnum.TOKEN_NAME]: tokenName,
      [SystemStoreUserInfoEnum.USER_ID]: userinfo.id,
      [SystemStoreUserInfoEnum.USER_NAME]: userinfo.username,
      [SystemStoreUserInfoEnum.NICK_NAME]: userinfo.nickname || userinfo.username
    } as any)

    if (tenantId) {
      ;(systemStore as any).setItem('currentTenantId', tenantId)
      // Back-compat for list/create hooks still reading currentWorkspaceId
      ;(systemStore as any).setItem('currentWorkspaceId', tenantId)
      ;(systemStore as any).setItem('workspaces', [
        { id: tenantId, accountId: '', name: 'Current tenant', status: 'ACTIVE', createdTime: '' }
      ])
    }

    router.replace(next.startsWith('/') ? next : `/${next}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'SSO failed'
  }
})
</script>

<style scoped>
.go-sso-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.go-sso-error {
  color: #d03050;
  max-width: 420px;
  text-align: center;
}
</style>
