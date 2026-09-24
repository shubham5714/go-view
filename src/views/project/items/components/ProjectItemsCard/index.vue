<template>
  <div v-if="cardData" class="go-items-list-card">
    <n-card hoverable size="small">
      <div class="list-content">
        <!-- 顶部按钮 -->
        <div class="list-content-top">
          <mac-os-control-btn
            class="top-btn"
            :hidden="['remove']"
            @close="deleteHandle"
            @resize="resizeHandle"
         ></mac-os-control-btn>
        </div>
        <!-- 中间 -->
        <div class="list-content-img" @click="resizeHandle">
          <n-image
            object-fit="contain"
            height="180"
            preview-disabled
            :src="`${cardData.image}?time=${new Date().getTime()}`"
            :alt="cardData.title"
            :fallback-src="requireErrorImg()"
         ></n-image>
        </div>
      </div>
      <template #action>
        <div class="list-footer">
          <n-text class="list-footer-title" :title="cardData.title || cardData.id || 'Untitled'">
            {{ cardData.title || cardData.id || 'Untitled' }}
          </n-text>
          <div class="list-footer-meta">
            <div class="list-footer-status">
              <n-badge
                class="go-animation-twinkle"
                dot
                :color="cardData.release ? '#34c749' : '#fcbc40'"
              ></n-badge>
              <n-text depth="3" class="list-footer-status-text">
                {{
                  cardData.release
                    ? $t('project.release')
                    : $t('project.unreleased')
                }}
              </n-text>
            </div>
            <div class="list-footer-actions">
              <template v-for="item in fnBtnList" :key="item.key">
                <template v-if="item.key === 'select'">
                  <n-dropdown
                    trigger="hover"
                    placement="bottom"
                    :options="selectOptions"
                    :show-arrow="true"
                    @select="handleSelect"
                  >
                    <n-button size="small" ghost>
                      <template #icon>
                        <component :is="item.icon"></component>
                      </template>
                    </n-button>
                  </n-dropdown>
                </template>

                <n-button
                  v-else
                  size="small"
                  ghost
                  @click="handleSelect(item.key)"
                >
                  <template #icon>
                    <component :is="item.icon"></component>
                  </template>
                  <span>{{ item.labelText }}</span>
                </n-button>
              </template>
            </div>
          </div>
        </div>
      </template>
    </n-card>
    <div v-if="isLocked" class="locked-badge">
      <n-tag size="small" type="warning">Locked</n-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, PropType, computed } from 'vue'
import { renderIcon, renderLang, requireErrorImg } from '@/utils'
import { icon } from '@/plugins'
import { MacOsControlBtn } from '@/components/Tips/MacOsControlBtn'
import { Chartype } from '../../index.d'
const {
  EllipsisHorizontalCircleSharpIcon,
  TrashIcon,
  CreateIcon,
  BrowsersOutlineIcon,
  SendIcon
} = icon.ionicons5

const emit = defineEmits(['preview', 'delete', 'resize', 'edit', 'release'])

const props = defineProps({
  cardData: Object as PropType<Chartype>
})

const isLocked = computed(() => props.cardData?.locked === true)

const fnBtnList = reactive([
  {
    labelText: 'Edit',
    key: 'edit',
    icon: renderIcon(CreateIcon)
  },
  {
    labelText: 'More',
    key: 'select',
    icon: renderIcon(EllipsisHorizontalCircleSharpIcon)
  }
])

const selectOptions = ref([
  {
    label: renderLang('global.r_preview'),
    key: 'preview',
    icon: renderIcon(BrowsersOutlineIcon)
  },
  {
    label: props.cardData?.release
      ? renderLang('global.r_unpublish')
      : renderLang('global.r_publish'),
    key: 'release',
    icon: renderIcon(SendIcon)
  },
  {
    label: renderLang('global.r_delete'),
    key: 'delete',
    icon: renderIcon(TrashIcon)
  }
])

const handleSelect = (key: string) => {
  if (isLocked.value && key === 'preview') {
    window['$message'].error('This project is locked and cannot be previewed')
    return
  }
  switch (key) {
    case 'preview':
      previewHandle()
      break
    case 'delete':
      deleteHandle()
      break
    case 'release':
      releaseHandle()
      break
    case 'edit':
      editHandle()
      break
  }
}

// 预览处理
const previewHandle = () => {
  emit('preview', props.cardData)
}

// 删除处理
const deleteHandle = () => {
  emit('delete', props.cardData)
}

// 编辑处理
const editHandle = () => {
  if (isLocked.value) {
    window['$message'].error('This project is locked and cannot be edited')
    return
  }
  emit('edit', props.cardData)
}

// 编辑处理
const releaseHandle = () => {
  if (isLocked.value) {
    window['$message'].error('This project is locked and cannot be published')
    return
  }
  emit('release', props.cardData)
}

// 放大处理
const resizeHandle = () => {
  if (isLocked.value) {
    window['$message'].error('This project is locked and cannot be edited')
    return
  }
  emit('resize', props.cardData)
}
</script>

<style lang="scss" scoped>
$contentHeight: 180px;
@include go('items-list-card') {
  position: relative;
  border-radius: $--border-radius-base;
  border: 1px solid rgba(0, 0, 0, 0);
  @extend .go-transition;
  &:hover {
    @include hover-border-color('hover-border-color');
  }
  .list-content {
    margin-top: 20px;
    margin-bottom: 5px;
    cursor: pointer;
    border-radius: $--border-radius-base;
    @include background-image('background-point');
    @extend .go-point-bg;
    &-top {
      position: absolute;
      top: 10px;
      left: 10px;
      height: 22px;
    }
    &-img {
      height: $contentHeight;
      @extend .go-flex-center;
      @extend .go-border-radius;
      @include deep() {
        img {
          @extend .go-border-radius;
        }
      }
    }
  }
  .list-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    line-height: 1.3;
    min-width: 0;

    &-title {
      display: block;
      width: 100%;
      min-width: 0;
      font-weight: 500;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    &-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    &-status-text {
      font-size: 12px;
    }

    &-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  }
  .locked-badge {
    position: absolute;
    top: 8px;
    right: 12px;
    z-index: 2;
  }
}
</style>
