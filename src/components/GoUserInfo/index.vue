<template>
  <n-dropdown
    trigger="hover"
    @select="handleSelect"
    :show-arrow="true"
    :options="options"
  >
    <div class="user-info-box">
      <n-avatar round size="small" class="user-avatar">
        <n-icon size="18" :component="PersonOutlineIcon" />
      </n-avatar>
      <n-text class="user-name" depth="3">{{ displayName }}</n-text>
    </div>
  </n-dropdown>
</template>

<script lang="ts" setup>
import { h, ref, computed, toRefs } from 'vue'
import { NAvatar, NText, NIcon } from 'naive-ui'
import { renderIcon } from '@/utils'
import { SystemStoreUserInfoEnum } from '@/store/modules/systemStore/systemStore.d'
import { logout, renderLang } from '@/utils'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { icon } from '@/plugins'

const { PersonOutlineIcon, LogOutOutlineIcon } = icon.ionicons5

const systemStore = useSystemStore()
const { getUserInfo } = toRefs(systemStore)

const displayName = computed(() => {
  const info = getUserInfo.value
  return (
    info?.[SystemStoreUserInfoEnum.NICK_NAME] ||
    info?.[SystemStoreUserInfoEnum.USER_NAME] ||
    'User'
  )
})

const renderUserInfo = () => {
  return h(
    'div',
    {
      style: 'display: flex; align-items: center; padding: 8px 12px;'
    },
    [
      h(
        NAvatar,
        {
          round: true,
          size: 'small',
          style: 'margin-right: 12px;'
        },
        {
          default: () => h(NIcon, { size: 18, component: PersonOutlineIcon })
        }
      ),
      h('div', null, [
        h(NText, { depth: 2 }, { default: () => displayName.value })
      ])
    ]
  )
}

const options = ref([
  {
    label: 'My Profile',
    key: 'info',
    type: 'render',
    render: renderUserInfo
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: renderLang('global.logout'),
    key: 'logout',
    icon: renderIcon(LogOutOutlineIcon)
  }
])

const handleSelect = (key: string) => {
  if (key === 'logout') {
    logout()
  }
}
</script>

<style lang="scss" scoped>
.user-info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .user-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  .user-avatar {
    flex-shrink: 0;
  }
}
</style>
