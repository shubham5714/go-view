<template>
  <div class="go-project">
    <n-layout position="absolute">
      <layout-header-pro>
        <template #left>
          <img
            class="go-project-brand-logo"
            :src="brandLogo"
            alt="DRX AISOC"
            width="105"
            height="32"
            @click="goToHome"
          />
        </template>
        <template #ri-left>
          <n-space align="center" :wrap="false">
            <n-button
              v-if="isLibraryPage"
              ghost
              type="primary"
              @click="goToHome"
            >
              <template #icon>
                <n-icon>
                  <HomeIcon />
                </n-icon>
              </template>
              Home
            </n-button>
            <n-button
              v-else
              ghost
              type="primary"
              @click="goToLibrary"
            >
              <template #icon>
                <n-icon>
                  <StoreIcon />
                </n-icon>
              </template>
              Library
            </n-button>
            <project-layout-create :collapsed="false" />
          </n-space>
        </template>
      </layout-header-pro>
      <n-layout
        id="go-project-content-top"
        class="content-top"
        position="absolute"
        :native-scrollbar="false"
      >
        <n-layout-content>
          <layout-transition-main>
            <router-view></router-view>
          </layout-transition-main>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProjectLayoutCreate } from './layout/components/ProjectLayoutCreate'
import { LayoutHeaderPro } from '@/layout/components/LayoutHeaderPro'
import { LayoutTransitionMain } from '@/layout/components/LayoutTransitionMain/index'
import { useDesignStore } from '@/store/modules/designStore/designStore'
import { PageEnum } from '@/enums/pageEnum'
import { icon } from '@/plugins'
import desktopDarkLogo from '@/assets/images/brand/desktop-dark.png'
import desktopLightLogo from '@/assets/images/brand/desktop-logo.png'

const { StoreIcon } = icon.carbon
const { HomeIcon } = icon.ionicons5
const designStore = useDesignStore()
const route = useRoute()
const router = useRouter()

const brandLogo = computed(() =>
  designStore.getDarkTheme ? desktopDarkLogo : desktopLightLogo
)

const isLibraryPage = computed(
  () => route.name === PageEnum.BASE_HOME_TEMPLATE_MARKET_NAME
)

const goToLibrary = () => {
  router.push({ name: PageEnum.BASE_HOME_TEMPLATE_MARKET_NAME })
}

const goToHome = () => {
  router.push({ name: PageEnum.BASE_HOME_ITEMS_NAME })
}
</script>

<style lang="scss" scoped>
@include go(project) {
  .content-top {
    top: $--header-height;
    margin-top: 1px;
  }
  &-brand-logo {
    width: 105px;
    height: 32px;
    display: block;
    object-fit: fill;
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>
