<template>
  <div class="go-edit-page-tabs" @mousedown.stop @click.stop>
    <div class="tabs-scroll">
      <button
        v-for="(page, index) in pages"
        :key="page.id"
        type="button"
        class="page-tab"
        :class="{ active: page.id === currentPageId }"
        @mousedown.stop
        @click.stop="onSelect(page.id)"
        @dblclick.stop="startRename(page.id, page.name)"
      >
        <template v-if="renamingId === page.id">
          <input
            ref="renameInputRef"
            class="rename-input"
            v-model="renameValue"
            @blur="commitRename"
            @keydown.enter.prevent="commitRename"
            @keydown.esc.prevent="cancelRename"
            @click.stop
            @mousedown.stop
          />
        </template>
        <template v-else>
          <span class="tab-label" :title="page.name">{{ page.name }}</span>
          <span
            v-if="index > 0"
            class="tab-close"
            title="Delete page"
            @click.stop="onDelete(page.id)"
            @mousedown.stop
          >
            <n-icon size="12" :component="CloseIcon" />
          </span>
        </template>
      </button>
      <button class="tab-add" type="button" title="Add page" @mousedown.stop @click.stop="onAdd">
        <n-icon size="14" :component="AddIcon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { icon } from '@/plugins'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { goDialog } from '@/utils'

const { AddIcon, CloseIcon } = icon.ionicons5
const chartEditStore = useChartEditStore()

onMounted(() => {
  chartEditStore.ensurePagesInitialized()
})

// Read state directly so tab UI stays in sync with page switches
const pages = computed(() => chartEditStore.pages)
const currentPageId = computed(() => chartEditStore.currentPageId)

const renamingId = ref<string | null>(null)
const renameValue = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

const onSelect = (id: string) => {
  if (renamingId.value) return
  if (!id || id === chartEditStore.currentPageId) return
  chartEditStore.switchPage(id)
}

const onAdd = () => {
  chartEditStore.addPage()
}

const onDelete = (id: string) => {
  const page = pages.value.find(p => p.id === id)
  goDialog({
    message: `Delete page "${page?.name || ''}"? This cannot be undone.`,
    onPositiveCallback: () => {
      chartEditStore.deletePage(id)
    }
  })
}

const startRename = (id: string, name: string) => {
  renamingId.value = id
  renameValue.value = name
  nextTick(() => {
    const el = renameInputRef.value
    if (el) {
      el.focus()
      el.select()
    }
  })
}

const commitRename = () => {
  if (!renamingId.value) return
  chartEditStore.renamePage(renamingId.value, renameValue.value)
  renamingId.value = null
}

const cancelRename = () => {
  renamingId.value = null
}
</script>

<style lang="scss" scoped>
@include go('edit-page-tabs') {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 8px;
  position: relative;
  /* Keep below canvas scrollbars; do not cover .edit-screens */
  z-index: 1;

  .tabs-scroll {
    display: flex;
    align-items: center;
    gap: 2px;
    overflow-x: auto;
    max-width: 100%;
    padding: 2px 0;
    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background-color: rgba(144, 146, 152, 0.45);
    }
  }

  .page-tab {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 140px;
    height: 26px;
    padding: 0 10px;
    border-radius: 4px 4px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: none;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    font-size: 12px;
    color: inherit;
    font-family: inherit;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      .tab-close {
        opacity: 1;
      }
    }

    &.active {
      background: rgba(255, 255, 255, 0.12);
      font-weight: 600;
    }

    .tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
    }

    .tab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0.35;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      &:hover {
        opacity: 1;
      }
    }

    .rename-input {
      width: 90px;
      height: 18px;
      font-size: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.35);
      color: inherit;
      padding: 0 4px;
      outline: none;
    }
  }

  .tab-add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.06);
    }
  }
}
</style>
