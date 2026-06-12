<template>
  <Teleport to="body">
    <div
      v-if="isVisible && popoverPosition"
      class="habitat-item-popover habitat-item-popover--visible"
      :style="popoverStyle"
      @mouseenter="handlePopoverMouseEnter"
      @mouseleave="handlePopoverMouseLeave"
    >
      <div class="habitat-item-popover__content">
        <div class="habitat-item-popover__header">
          <span class="habitat-item-popover__title">{{ title }}</span>
        </div>

        <div v-if="metadata.length > 0 || $slots.default" class="habitat-item-popover__metadata">
          <div
            v-for="(item, index) in metadata"
            :key="index"
            class="habitat-item-popover__metadata-item"
          >
            <span class="habitat-item-popover__metadata-label">{{ item.label }}:</span>
            <span class="habitat-item-popover__metadata-value">{{ item.value }}</span>
          </div>
          <slot></slot>
        </div>

        <div v-if="actions.length > 0" class="habitat-item-popover__actions">
          <button
            v-for="(action, index) in actions"
            :key="index"
            class="habitat-item-popover__action-button"
            :class="`habitat-item-popover__action-button--${action.variant || 'default'}`"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

interface PopoverMetadata {
  label: string
  value: string | number
}

interface PopoverAction {
  label: string
  variant?: 'default' | 'warning' | 'danger'
  onClick: () => void
}

interface Props {
  title: string
  metadata?: PopoverMetadata[]
  actions?: PopoverAction[]
  isHovered: boolean
  targetElement?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  metadata: () => [],
  actions: () => [],
  targetElement: null
})

const isVisible = ref(false)
const popoverPosition = ref<{ top: number; left: number } | null>(null)
const isPopoverHovered = ref(false)
let hideTimeout: number | null = null

// Get position of target element (the item being hovered)
function updatePopoverPosition() {
  if (!props.targetElement) return

  const rect = props.targetElement.getBoundingClientRect()
  popoverPosition.value = {
    top: rect.top - 10, // Position above element with small gap
    left: rect.left + rect.width / 2 // Center horizontally
  }
}

// Handle popover hover state
function handlePopoverMouseEnter() {
  isPopoverHovered.value = true
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

function handlePopoverMouseLeave() {
  isPopoverHovered.value = false
  // Hide immediately when leaving popover
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  isVisible.value = false
}

// Show popover after short delay when hovered
watch(() => props.isHovered, (hovered) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (hovered) {
    // Show after 300ms delay
    hideTimeout = window.setTimeout(() => {
      updatePopoverPosition()
      isVisible.value = true
    }, 300)
  } else {
    // Hide after 200ms grace period (allows moving to popover)
    // But only if the popover itself is not being hovered
    hideTimeout = window.setTimeout(() => {
      // Don't hide if user has moved mouse to the popover
      if (!isPopoverHovered.value) {
        isVisible.value = false
      }
    }, 200)
  }
})

// Update position on scroll or resize
onMounted(() => {
  window.addEventListener('scroll', updatePopoverPosition, true)
  window.addEventListener('resize', updatePopoverPosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePopoverPosition, true)
  window.removeEventListener('resize', updatePopoverPosition)
  // Clean up any pending timeout to prevent memory leaks
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
})

const popoverStyle = computed(() => {
  if (!popoverPosition.value) return {}
  return {
    position: 'fixed' as const,
    top: `${popoverPosition.value.top}px`,
    left: `${popoverPosition.value.left}px`,
    transform: 'translate(-50%, -100%)' // Center horizontally, position above
  }
})

function handleAction(action: PopoverAction) {
  action.onClick()
  isVisible.value = false
}
</script>

<style>
.habitat-item-popover {
  /* Position set via inline style (fixed positioning) */
  z-index: 10000;
  pointer-events: auto;
  opacity: 1;
}

.habitat-item-popover--visible {
  /* Visibility handled by v-if in template */
}

.habitat-item-popover__content {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-inline-size: 180px;
  white-space: nowrap;
}

.habitat-item-popover__header {
  margin-block-end: var(--space-2);
  padding-block-end: var(--space-2);
  border-block-end: 1px solid var(--color-border-default);
}

.habitat-item-popover__title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.habitat-item-popover__metadata {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-block-end: var(--space-2);
}

.habitat-item-popover__metadata-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}

.habitat-item-popover__metadata-label {
  color: var(--color-text-muted);
}

.habitat-item-popover__metadata-value {
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.habitat-item-popover__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-block-start: var(--space-2);
  border-block-start: 1px solid var(--color-border-default);
}

.habitat-item-popover__action-button {
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.habitat-item-popover__action-button:hover {
  background: var(--color-bg-primary);
  border-color: var(--color-primary);
}

.habitat-item-popover__action-button--warning {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning-text);
}

.habitat-item-popover__action-button--warning:hover {
  background: var(--color-warning);
  color: var(--color-text-inverse);
}

.habitat-item-popover__action-button--danger {
  background: var(--color-error-bg);
  border-color: var(--color-error);
  color: var(--color-error-text);
}

.habitat-item-popover__action-button--danger:hover {
  background: var(--color-error);
  color: var(--color-text-inverse);
}
</style>
