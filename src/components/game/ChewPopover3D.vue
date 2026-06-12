<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="floatingEl"
      class="chew-popover"
      :style="floatingStyles"
    >
      <div class="chew-popover__header">
        <span class="chew-popover__icon">{{ chewData?.itemEmoji }}</span>
        <span class="chew-popover__title">{{ chewData?.itemName }}</span>
        <button class="chew-popover__close" @click="$emit('close')">×</button>
      </div>

      <!-- Durability Bar -->
      <div class="chew-popover__durability">
        <div class="chew-popover__durability-label">
          <span>Durability</span>
          <span class="chew-popover__durability-status" :class="statusClass">
            {{ durabilityStatus }}
          </span>
        </div>
        <div class="chew-popover__bar-container">
          <div
            class="chew-popover__bar"
            :class="barColorClass"
            :style="{ width: `${chewData?.durability ?? 0}%` }"
          ></div>
        </div>
        <div class="chew-popover__durability-value">
          {{ Math.round(chewData?.durability ?? 0) }}%
        </div>
      </div>

      <!-- Metadata -->
      <div class="chew-popover__metadata">
        <div class="chew-popover__metadata-item">
          <span class="chew-popover__metadata-label">Times used:</span>
          <span class="chew-popover__metadata-value">{{ chewData?.usageCount ?? 0 }}</span>
        </div>
        <div class="chew-popover__metadata-item">
          <span class="chew-popover__metadata-label">Last used:</span>
          <span class="chew-popover__metadata-value">{{ lastUsedText }}</span>
        </div>
      </div>

      <!-- Warning for unsafe chews -->
      <div v-if="isUnsafe" class="chew-popover__warning">
        ⚠️ This chew is worn out and unsafe for guinea pigs!
      </div>

      <!-- Actions - only show discard when unsafe -->
      <div v-if="isUnsafe" class="chew-popover__actions">
        <button
          class="chew-popover__action chew-popover__action--discard"
          @click="$emit('discard')"
        >
          🗑️ Discard Unsafe Chew
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { usePopover } from '../../composables/ui/usePopover'
import type { ChewPopoverData } from '../../composables/3d/use3DChewPopover'
import { CHEW_DEGRADATION } from '../../constants/supplies'

interface Props {
  show: boolean
  position: { x: number; y: number }
  chewData: ChewPopoverData | null
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  discard: []
}>()

// Use Floating UI for smart positioning
const { floatingEl, floatingStyles, updatePosition } = usePopover({ offset: 10 })
void floatingEl // Prevent unused variable warning - used in template

// Update position when props change
watch(
  () => props.position,
  (pos) => {
    if (pos) {
      updatePosition(pos.x, pos.y)
    }
  },
  { immediate: true }
)

const isUnsafe = computed(() => {
  if (!props.chewData) return false
  return props.chewData.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD
})

const durabilityStatus = computed(() => {
  if (!props.chewData) return 'Unknown'
  const durability = props.chewData.durability
  if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'Unsafe'
  if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'Degraded'
  if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'Worn'
  return 'Good'
})

const statusClass = computed(() => {
  if (!props.chewData) return ''
  const durability = props.chewData.durability
  if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'chew-popover__durability-status--unsafe'
  if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'chew-popover__durability-status--degraded'
  if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'chew-popover__durability-status--worn'
  return 'chew-popover__durability-status--good'
})

const barColorClass = computed(() => {
  if (!props.chewData) return ''
  const durability = props.chewData.durability
  if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'chew-popover__bar--unsafe'
  if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'chew-popover__bar--degraded'
  if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'chew-popover__bar--worn'
  return 'chew-popover__bar--good'
})

const lastUsedText = computed(() => {
  if (!props.chewData) return 'Never'
  const timeSinceUse = Date.now() - props.chewData.lastUsedAt
  const minutesAgo = Math.floor(timeSinceUse / 60000)
  const hoursAgo = Math.floor(minutesAgo / 60)

  if (hoursAgo > 0) return `${hoursAgo}h ago`
  if (minutesAgo > 0) return `${minutesAgo}m ago`
  return 'Just now'
})
</script>

<style>
.chew-popover {
  z-index: 1000;
  min-inline-size: 220px;
  max-inline-size: 280px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.chew-popover__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

.chew-popover__icon {
  font-size: var(--font-size-lg);
}

.chew-popover__title {
  flex: 1;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.chew-popover__close {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.chew-popover__close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Durability Section */
.chew-popover__durability {
  padding: var(--space-3);
  border-block-end: 1px solid var(--color-border-light);
}

.chew-popover__durability-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.chew-popover__durability-status {
  font-weight: var(--font-weight-medium);
}

.chew-popover__durability-status--good {
  color: var(--color-accent-green-600);
}

.chew-popover__durability-status--worn {
  color: var(--color-accent-yellow-600);
}

.chew-popover__durability-status--degraded {
  color: var(--color-warning);
}

.chew-popover__durability-status--unsafe {
  color: var(--color-error);
}

.chew-popover__bar-container {
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-block-end: var(--space-1);
}

.chew-popover__bar {
  block-size: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.chew-popover__bar--good {
  background-color: var(--color-accent-green-500);
}

.chew-popover__bar--worn {
  background-color: var(--color-accent-yellow-500);
}

.chew-popover__bar--degraded {
  background-color: var(--color-warning);
}

.chew-popover__bar--unsafe {
  background-color: var(--color-error);
}

.chew-popover__durability-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: end;
}

/* Metadata */
.chew-popover__metadata {
  padding: var(--space-2) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.chew-popover__metadata-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
}

.chew-popover__metadata-label {
  color: var(--color-text-muted);
}

.chew-popover__metadata-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Warning */
.chew-popover__warning {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-error-bg);
  color: var(--color-error);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

/* Actions */
.chew-popover__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-block-start: 1px solid var(--color-border-light);
}

.chew-popover__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chew-popover__action--discard {
  background-color: var(--color-error);
  color: white;
}

.chew-popover__action--discard:hover {
  background-color: var(--color-error-dark);
}
</style>
