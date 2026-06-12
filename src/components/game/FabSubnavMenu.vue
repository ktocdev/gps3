<script setup lang="ts">
/**
 * FAB Subnav Menu - Grid popover for FAB sub-actions
 * Displays a themed grid of icon+label buttons anchored to a FAB
 */

import { watch, onMounted, onUnmounted } from 'vue'
import { usePopover } from '../../composables/ui/usePopover'

export interface FabSubnavAction {
  id: string
  icon: string
  label: string
}

const props = defineProps<{
  /** Whether the menu is visible */
  show: boolean
  /** X coordinate to anchor the menu (viewport coords) */
  anchorX: number
  /** Y coordinate to anchor the menu (viewport coords) */
  anchorY: number
  /** Array of actions to display */
  actions: FabSubnavAction[]
  /** Theme variant: 'pink' | 'green' | 'violet' | 'yellow' | 'orange' | 'cyan' */
  theme?: 'pink' | 'green' | 'violet' | 'yellow' | 'orange' | 'cyan'
}>()

const emit = defineEmits<{
  /** Emitted when an action is selected */
  select: [actionId: string]
  /** Emitted when the menu should close */
  close: []
}>()

// Use popover for smart positioning
const { floatingEl, floatingStyles, updatePosition } = usePopover({
  offset: 12,
  placement: 'top',
  padding: 16
})

// Update position when anchor changes
watch(
  () => [props.anchorX, props.anchorY],
  ([x, y]) => {
    updatePosition(x, y)
  },
  { immediate: true }
)

// Handle action click
function handleActionClick(actionId: string) {
  emit('select', actionId)
  emit('close')
}

// Handle click outside
function handleClickOutside(event: MouseEvent) {
  if (!props.show) return
  const target = event.target as HTMLElement
  if (floatingEl.value && !floatingEl.value.contains(target)) {
    emit('close')
  }
}

// Handle escape key
function handleKeydown(event: KeyboardEvent) {
  if (!props.show) return
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="floatingEl"
      class="fab-subnav"
      :class="theme ? `fab-subnav--${theme}` : ''"
      :style="floatingStyles"
    >
      <div class="fab-subnav__grid">
        <button
          v-for="action in actions"
          :key="action.id"
          class="fab-subnav__item"
          @click="handleActionClick(action.id)"
        >
          <span class="fab-subnav__icon">{{ action.icon }}</span>
          <span class="fab-subnav__label">{{ action.label }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>
