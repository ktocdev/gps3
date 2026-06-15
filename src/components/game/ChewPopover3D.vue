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
  background: linear-gradient(180deg, var(--panel-bg-top) 0%, var(--panel-bg-bot) 100%);
  border: 3px solid var(--panel-border);
  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadow);
  color: var(--color-wood-border);
  overflow: hidden;
}

/* Striped awning in the chew accent */
.chew-popover::before {
  content: '';
  display: block;
  block-size: 12px;
  background: repeating-linear-gradient(
    90deg,
    #fb923c 0 14px,
    var(--color-gold-50) 14px 28px
  );
  border-block-end: 2px solid var(--panel-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18);
}

.chew-popover__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-block-end: 2px solid var(--color-wood-amber);
}

.chew-popover__icon {
  font-size: var(--font-size-lg);
}

.chew-popover__title {
  flex: 1;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-gold-800);
}

.chew-popover__close {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: 2px solid var(--color-wood-dark);
  background: linear-gradient(180deg, var(--color-gold-50) 0%, var(--color-gold-200) 100%);
  color: var(--color-gold-800);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  cursor: pointer;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-confirm);
  transition: all var(--transition-fast);
}

.chew-popover__close:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

/* Durability Section */
.chew-popover__durability {
  padding: var(--space-3);
  border-block-end: 1px solid rgba(146, 64, 14, 0.28);
}

.chew-popover__durability-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-wood-dark);
  font-weight: var(--font-weight-semibold);
}

.chew-popover__durability-status {
  font-weight: var(--font-weight-medium);
}

.chew-popover__durability-status--good {
  color: var(--color-green-600);
}

.chew-popover__durability-status--worn {
  color: var(--color-yellow-600);
}

.chew-popover__durability-status--degraded {
  color: var(--color-warning);
}

.chew-popover__durability-status--unsafe {
  color: var(--color-error);
}

.chew-popover__bar-container {
  block-size: 8px;
  background: linear-gradient(180deg, var(--color-wood-shadow), var(--color-wood-dark));
  border: 1.5px solid var(--color-wood-border);
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  margin-block-end: var(--space-1);
}

.chew-popover__bar {
  block-size: 100%;
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: width var(--transition-normal);
}

.chew-popover__bar--good {
  background-color: var(--color-green-500);
}

.chew-popover__bar--worn {
  background-color: var(--color-yellow-500);
}

.chew-popover__bar--degraded {
  background-color: var(--color-warning);
}

.chew-popover__bar--unsafe {
  background-color: var(--color-error);
}

.chew-popover__durability-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-border);
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
  color: var(--color-wood-dark);
}

.chew-popover__metadata-value {
  color: var(--color-wood-border);
  font-weight: var(--font-weight-bold);
}

/* Warning */
.chew-popover__warning {
  margin: var(--space-2) var(--space-3);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-red-50);
  border: 1.5px solid var(--color-red-500);
  border-radius: var(--radius-lg);
  color: var(--color-red-500);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

/* Actions */
.chew-popover__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-block-start: 1px solid rgba(146, 64, 14, 0.28);
}

.chew-popover__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chew-popover__action--discard {
  background-color: var(--color-red-50);
  border: 2px solid var(--color-red-500);
  color: var(--color-red-500);
  box-shadow: var(--shadow-confirm);
}

.chew-popover__action--discard:hover {
  background-color: var(--color-red-100);
  transform: translateY(-1px);
}
</style>
