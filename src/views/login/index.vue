<template>
  <!-- 登录 -->
  <div class="go-login-box">
    <div class="go-login-box-bg">
      <aside class="bg-img-box">
        <transition-group name="list-complete">
          <template v-for="item in bgList" :key="item">
            <div class="bg-img-box-li list-complete-item">
              <n-collapse-transition :appear="true" :show="showBg">
                <img :src="getImageUrl(item, 'chart/charts')" alt="chart" />
              </n-collapse-transition>
            </div>
          </template>
        </transition-group>
      </aside>
    </div>
    <layout-header></layout-header>
    <div class="go-login">
      <div class="login-account">
        <div class="login-account-container">
          <n-collapse-transition :appear="true" :show="show">
            <n-card
              class="login-account-card"
              :title="showSignup ? 'Create a new account' : $t('login.desc')"
            >
              <div class="login-account-top">
                <img
                  class="login-account-top-logo"
                  src="~@/assets/images/login/input.png"
                  alt="展示图片"
                />
              </div>
              <!-- Login form -->
              <n-form
                v-if="!showSignup"
                ref="formRef"
                label-placement="left"
                size="large"
                :model="formInline"
                :rules="rules"
              >
                <n-form-item path="username">
                  <n-input
                    v-model:value="formInline.username"
                    type="email"
                    maxlength="64"
                    :placeholder="$t('global.form_account')"
                    @keydown.enter="handleSubmit"
                  >
                    <template #prefix>
                      <n-icon size="18">
                        <PersonOutlineIcon></PersonOutlineIcon>
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>
                <n-form-item path="password">
                  <n-input
                    v-model:value="formInline.password"
                    type="password"
                    maxlength="16"
                    show-password-on="click"
                    :placeholder="$t('global.form_password')"
                    @keydown.enter="handleSubmit"
                  >
                    <template #prefix>
                      <n-icon size="18">
                        <LockClosedOutlineIcon></LockClosedOutlineIcon>
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>
                <n-form-item>
                  <div class="flex justify-between">
                    <div class="flex-initial">
                      <n-checkbox v-model:checked="autoLogin">{{
                        $t('login.form_auto')
                      }}</n-checkbox>
                    </div>
                  </div>
                </n-form-item>
                <n-form-item>
                  <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
                    <n-button
                      type="primary"
                      @click="handleSubmit"
                      size="large"
                      :loading="loading"
                      block
                    >
                      {{ $t('login.form_button') }}
                    </n-button>
                    <n-button
                      type="default"
                      size="large"
                      ghost
                      block
                      @click="handleSignupWithGoogle"
                    >
                      Sign in with Google (coming soon)
                    </n-button>
                    <n-button
                      type="tertiary"
                      size="large"
                      block
                      @click="() => (showSignup = true)"
                    >
                      Create a new account
                    </n-button>
                  </div>
                </n-form-item>
              </n-form>

              <!-- Signup form -->
              <n-form
                v-else
                ref="signupFormRef"
                label-placement="left"
                size="large"
                :model="signupForm"
                :rules="signupRules"
              >
                <n-form-item path="username">
                  <n-input
                    v-model:value="signupForm.username"
                    type="email"
                    maxlength="64"
                    placeholder="Email address"
                  >
                    <template #prefix>
                      <n-icon size="18">
                        <PersonOutlineIcon></PersonOutlineIcon>
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>
                <n-form-item path="password">
                  <n-input
                    v-model:value="signupForm.password"
                    type="password"
                    maxlength="16"
                    show-password-on="click"
                    placeholder="Password"
                  >
                    <template #prefix>
                      <n-icon size="18">
                        <LockClosedOutlineIcon></LockClosedOutlineIcon>
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>
                <n-form-item path="confirmPassword">
                  <n-input
                    v-model:value="signupForm.confirmPassword"
                    type="password"
                    maxlength="16"
                    show-password-on="click"
                    placeholder="Confirm password"
                  >
                    <template #prefix>
                      <n-icon size="18">
                        <LockClosedOutlineIcon></LockClosedOutlineIcon>
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>
                <n-form-item path="code">
                  <div style="display: flex; width: 100%; gap: 8px">
                    <n-input
                      v-model:value="signupForm.code"
                      maxlength="6"
                      placeholder="Verification code"
                    />
                    <n-button type="primary" tertiary @click="handleSendSignupCode">
                      Send code
                    </n-button>
                  </div>
                </n-form-item>
                <n-form-item>
                  <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
                    <n-button
                      type="primary"
                      @click="handleSignup"
                      size="large"
                      :loading="loading"
                      block
                    >
                      Sign up
                    </n-button>
                    <n-button
                      type="default"
                      size="large"
                      ghost
                      block
                      @click="handleSignupWithGoogle"
                    >
                      Sign up with Google (coming soon)
                    </n-button>
                    <n-button
                      type="tertiary"
                      size="large"
                      block
                      @click="() => (showSignup = false)"
                    >
                      Back to login
                    </n-button>
                  </div>
                </n-form-item>
              </n-form>
            </n-card>
          </n-collapse-transition>
        </div>
      </div>
    </div>

    <!-- MFA enrollment / verification modal -->
    <n-modal
      v-model:show="showMfaModal"
      preset="dialog"
      :title="mfaMode === 'enroll' ? 'Set up multi-factor authentication' : 'Multi-factor authentication'"
    >
      <div v-if="mfaMode === 'enroll'">
        <p style="margin-bottom: 8px">
          Multi-factor authentication is required. Scan the QR code below with your authenticator app
          (Google Authenticator, Authy, etc.), then enter the 6-digit code.
        </p>
        <p style="margin-bottom: 8px">
          <strong>Account:</strong>
          {{ pendingUsername }}
        </p>
        <div style="display: flex; justify-content: center; margin: 12px 0">
          <img
            v-if="mfaOtpauthUrl"
            :src="qrImageUrl"
            alt="MFA QR code"
            style="width: 160px; height: 160px"
          />
        </div>
        <p style="margin-bottom: 16px; word-break: break-all">
          <strong>Secret (fallback):</strong>
          {{ mfaSecret }}
        </p>
      </div>
      <div v-else>
        <p style="margin-bottom: 12px">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>
      <n-input
        v-model:value="mfaCode"
        placeholder="123456"
        maxlength="6"
        style="margin-bottom: 16px"
      />
      <template #action>
        <n-button @click="showMfaModal = false">Cancel</n-button>
        <n-button type="primary" :loading="loading" @click="handleVerifyMfa">Verify</n-button>
      </template>
    </n-modal>

    <div class="go-login-box-footer">
      <layout-footer></layout-footer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, computed } from 'vue'
import shuffle from 'lodash/shuffle'
import { carouselInterval } from '@/settings/designSetting'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { SystemStoreUserInfoEnum, SystemStoreEnum } from '@/store/modules/systemStore/systemStore.d'
import { GoThemeSelect } from '@/components/GoThemeSelect'
import { LayoutHeader } from '@/layout/components/LayoutHeader'
import { LayoutFooter } from '@/layout/components/LayoutFooter'
import { PageEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { icon } from '@/plugins'
import { routerTurnByName } from '@/utils'
import { loginApi, fetchWorkspacesApi, verifyMfaApi, signupApi, requestSignupEmailCodeApi } from '@/api/path'

const { PersonOutlineIcon, LockClosedOutlineIcon } = icon.ionicons5

const formRef = ref()
const signupFormRef = ref()
const loading = ref(false)
const autoLogin = ref(true)
const show = ref(false)
const showBg = ref(false)
const systemStore = useSystemStore()

const t = window['$t']

const formInline = reactive({
  username: '',
  password: '',
})

const signupForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
})

const showSignup = ref(false)

const showMfaModal = ref(false)
const mfaCode = ref('')
const pendingUsername = ref('')
const mfaMode = ref<'enroll' | 'verify'>('verify')
const mfaSecret = ref('')
const mfaOtpauthUrl = ref('')

const qrImageUrl = computed(() => {
  if (!mfaOtpauthUrl.value) return ''
  const base = 'https://api.qrserver.com/v1/create-qr-code/'
  const params = new URLSearchParams({
    size: '160x160',
    data: mfaOtpauthUrl.value,
  })
  return `${base}?${params.toString()}`
})

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const rules = {
  username: {
    required: true,
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!value) {
        return new Error(t('global.form_account'))
      }
      if (!emailPattern.test(value)) {
        return new Error('Please enter a valid email address')
      }
      return true
    }
  },
  password: {
    required: true,
    message: t('global.form_password'),
    trigger: 'blur',
  },
}

const signupRules = {
  username: {
    required: true,
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!value) {
        return new Error('Please enter an email address')
      }
      if (!emailPattern.test(value)) {
        return new Error('Please enter a valid email address')
      }
      return true
    }
  },
  password: {
    required: true,
    message: 'Please enter a password',
    trigger: 'blur',
  },
  confirmPassword: {
    required: true,
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!value) {
        return new Error('Please confirm your password')
      }
      if (value !== signupForm.password) {
        return new Error('Passwords do not match')
      }
      return true
    }
  },
  code: {
    required: true,
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!value) {
        return new Error('Please enter the verification code')
      }
      if (!/^\d{6}$/.test(value)) {
        return new Error('Verification code must be 6 digits')
      }
      return true
    }
  },
}

// 定时器
const shuffleTimiing = ref()

// 背景图
const bgList = ref([
  'bar_y',
  'bar_x',
  'line_gradient',
  'line',
  'funnel',
  'heatmap',
  'pie',
  'radar',
])

// 处理url获取
const getImageUrl = (name: string, folder: string) => {
  return new URL(`../../assets/images/${folder}/${name}.png`, import.meta.url).href
}

// 打乱图片顺序
const shuffleHandle = () => {
  shuffleTimiing.value = setInterval(() => {
    bgList.value = shuffle(bgList.value)
  }, carouselInterval)
}

// 登录
const handleSubmit = async (e: Event) => {
  e.preventDefault()
  formRef.value.validate(async (errors: any) => {
    if (!errors) {
      const { username, password } = formInline
      loading.value = true
      // 提交请求
      const res = await loginApi({
        username,
        password
      })
      if (res && res.data) {
        const data: any = res.data
        // Enrollment required: user has no MFA yet; start setup flow
        if (data.enrollmentRequired) {
          pendingUsername.value = data.username || username
          mfaMode.value = 'enroll'
          mfaSecret.value = data.secret || ''
          mfaOtpauthUrl.value = data.otpauthUrl || ''
          showMfaModal.value = true
          loading.value = false
          return
        }
        // MFA already enabled: require verification only
        if (data.mfaRequired) {
          pendingUsername.value = data.username || username
          mfaMode.value = 'verify'
          mfaSecret.value = ''
          showMfaModal.value = true
          loading.value = false
          return
        }

        const { tokenValue, tokenName } = data.token
        const { nickname, username, id } = data.userinfo

        // 存储到 pinia 
        systemStore.setItem(SystemStoreEnum.USER_INFO, {
          [SystemStoreUserInfoEnum.USER_TOKEN]: tokenValue,
          [SystemStoreUserInfoEnum.TOKEN_NAME]: tokenName,
          [SystemStoreUserInfoEnum.USER_ID]: id,
          [SystemStoreUserInfoEnum.USER_NAME]: username,
          [SystemStoreUserInfoEnum.NICK_NAME]: nickname,
          t
        })

        // 无论之前是谁登录，重置当前工作空间，避免跨账号残留
        ;(systemStore as any).setItem('currentWorkspaceId', undefined)

        // 拉取并设置工作空间
        const wsRes = await fetchWorkspacesApi()
        if (wsRes && wsRes.data) {
          ;(systemStore as any).setItem('workspaces', wsRes.data)
          // 默认始终选择新账号的第一个工作空间
          if (wsRes.data.length > 0) {
            ;(systemStore as any).setItem('currentWorkspaceId', wsRes.data[0].id)
          }
        }

        window['$message'].success(t('login.login_success'))
        routerTurnByName(PageEnum.BASE_HOME_NAME, true)
      }
      loading.value = false
    } else {
      window['$message'].error(t('login.login_message'))
    }
  })
}

const handleVerifyMfa = async () => {
  if (!pendingUsername.value) {
    window['$message'].error('No pending MFA login')
    return
  }
  if (!mfaCode.value.trim()) {
    window['$message'].error('Please enter the verification code')
    return
  }
  loading.value = true
  const res = await verifyMfaApi({
    username: pendingUsername.value,
    code: mfaCode.value.trim()
  })
  if (res && res.data) {
    const { tokenValue, tokenName } = res.data.token
    const { nickname, username, id } = res.data.userinfo

    systemStore.setItem(SystemStoreEnum.USER_INFO, {
      [SystemStoreUserInfoEnum.USER_TOKEN]: tokenValue,
      [SystemStoreUserInfoEnum.TOKEN_NAME]: tokenName,
      [SystemStoreUserInfoEnum.USER_ID]: id,
      [SystemStoreUserInfoEnum.USER_NAME]: username,
      [SystemStoreUserInfoEnum.NICK_NAME]: nickname,
      t
    })

    ;(systemStore as any).setItem('currentWorkspaceId', undefined)

    const wsRes = await fetchWorkspacesApi()
    if (wsRes && wsRes.data) {
      ;(systemStore as any).setItem('workspaces', wsRes.data)
      if (wsRes.data.length > 0) {
        ;(systemStore as any).setItem('currentWorkspaceId', wsRes.data[0].id)
      }
    }

    window['$message'].success(t('login.login_success'))
    showMfaModal.value = false
    mfaCode.value = ''
    pendingUsername.value = ''
    routerTurnByName(PageEnum.BASE_HOME_NAME, true)
  }
  loading.value = false
}

const handleSignup = async (e: Event) => {
  e.preventDefault()
  signupFormRef.value.validate(async (errors: any) => {
    if (!errors) {
      const { username, password, code } = signupForm
      loading.value = true
      const res: any = await signupApi({
        username,
        password,
        code
      })
      loading.value = false
      if (!res) return
      // Non-200 codes are already surfaced globally by axios interceptors
      if (res.code !== 200) return

      const data = res.data as any
      // New user signup returns MFA enrollment payload so we can open the modal immediately
      if (data && data.enrollmentRequired) {
        pendingUsername.value = data.username || username
        mfaMode.value = 'enroll'
        mfaSecret.value = data.secret || ''
        mfaOtpauthUrl.value = data.otpauthUrl || ''
        showMfaModal.value = true
        window['$message'].success('Account created successfully, please complete MFA setup')
        return
      }

      window['$message'].success('Account created successfully, please log in')
    } else {
      window['$message'].error('Please fix the errors in the signup form')
    }
  })
}

const handleSignupWithGoogle = () => {
  window['$message'].info('Google sign up is not yet available')
}

const handleSendSignupCode = async () => {
  const email = signupForm.username.trim()
  if (!email) {
    window['$message'].error('Please enter your email address first')
    return
  }
  if (!emailPattern.test(email)) {
    window['$message'].error('Please enter a valid email address')
    return
  }
  loading.value = true
  const res: any = await requestSignupEmailCodeApi({ email })
  loading.value = false
  if (res && res.code === 200) {
    window['$message'].success('Verification code sent to your email')
  }
}

onMounted(() => {
  setTimeout(() => {
    show.value = true
  }, 300)

  setTimeout(() => {
    showBg.value = true
  }, 100)

  shuffleHandle()
})
</script>

<style lang="scss" scoped>
$width: 450px;
$go-login-height: 100vh;
$account-img-height: 210px;
$footer-height: 50px;

* {
  box-sizing: border-box;
}
@include go(login-box) {
  height: $go-login-height;
  overflow: hidden;
  @include background-image('background-image');
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    height: $--header-height;
  }
  &-divider {
    margin: 0;
    padding-top: 0;
  }

  @include go(login) {
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -$--header-height;
    height: $go-login-height;
    width: 100vw;
    .login-account {
      display: flex;
      flex-direction: column;
      align-items: center;
      &-container {
        width: $width;
      }

      &-card {
        @extend .go-background-filter;
        @include fetch-bg-color('filter-color');
        box-shadow: 0 0 20px 5px rgba(40, 40, 40, 0.3);
      }

      &-top {
        padding-top: 10px;
        text-align: center;
        height: $account-img-height;
        margin-bottom: 20px;
      }
    }
  }

  &-footer {
    z-index: 2;
    position: fixed;
    width: 100%;
    bottom: 0;
  }

  &-bg {
    z-index: 0;
    position: fixed;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    /* subtle dark overlay so chart images stay visible */
    background: rgba(0, 0, 0, 0.35);
    .bg-img-box {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-content: center;
      gap: 16px;
      padding: 24px;
      .bg-img-box-li {
        flex-shrink: 0;
        transition: transform 0.6s ease;
        img {
          display: block;
          width: 180px;
          height: 120px;
          object-fit: cover;
          border-radius: 2 * $--border-radius-base;
          opacity: 0.9;
        }
      }
      /* animate position when list reorders */
    }
  }
}

/* move animation when shuffle reorders (transition-group adds .list-complete-move) */
:deep(.list-complete-move) {
  transition: transform 0.6s ease;
}
@media only screen and (max-width: 1200px) {
  .go-login-box-bg .bg-img-box .bg-img-box-li img {
    width: 140px;
    height: 94px;
  }
  .go-login-box-footer {
    position: relative;
  }
}
</style>
