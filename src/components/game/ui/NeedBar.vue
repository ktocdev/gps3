<template>
  <div class="need-bar" :class="needBarClasses">
    <div class="need-bar__header">
      <span class="need-bar__label">{{ formatNeedName(needType) }}</span>
      <span class="need-bar__value" :class="valueClasses">
        {{ value.toFixed(0) }}%
      </span>
    </div>

    <div class="need-bar__track">
      <div
        class="need-bar__fill"
        :class="fillClasses"
        :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
      >
        <div class="need-bar__gradient"></div>
      </div>

      <!-- Threshold indicators -->
      <div class="need-bar__thresholds">
        <div class="need-bar__threshold need-bar__threshold--critical" style="left: 75%"></div>
        <div class="need-bar__threshold need-bar__threshold--warning" style="left: 50%"></div>
        <div class="need-bar__threshold need-bar__threshold--good" style="left: 25%"></div>
      </div>
    </div>

    <div class="need-bar__status">
      <span class="need-bar__status-text" :class="statusClasses">
        {{ statusText }}
      </span>
      <span v-if="showUrgency" class="need-bar__urgency">
        {{ urgencyIcon }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  needType: string
  value: number
  showThresholds?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
}

const props = withDefaults(defineProps<Props>(), {
  showThresholds: true,
  size: 'md',
  variant: 'default'
})

// Computed properties for styling and status
const needBarClasses = computed(() => [
  `need-bar--${props.size}`,
  `need-bar--${props.variant}`,
  `need-bar--${statusLevel.value}`
])

const fillClasses = computed(() => [
  `need-bar__fill--${statusLevel.value}`
])

const valueClasses = computed(() => [
  `need-bar__value--${statusLevel.value}`
])

const statusClasses = computed(() => [
  `need-bar__status--${statusLevel.value}`
])

// Status levels: 100=full, 0=empty
// Green (60-100) → Grey (40-60) → Yellow (30-40) → Red (0-30)
const statusLevel = computed(() => {
  if (props.value < 30) return 'critical'       // Red - Under 30%
  if (props.value < 40) return 'warning'        // Yellow - Under 40%
  if (props.value < 60) return 'moderate'       // Grey - Under 60%
  return 'good'                                 // Green - 60%+
})

const statusText = computed(() => {
  switch (statusLevel.value) {
    case 'critical': return 'Low'
    case 'warning': return 'Getting Low'
    case 'moderate': return 'Okay'
    case 'good': return 'Satisfied'
    default: return 'Unknown'
  }
})

const urgencyIcon = computed(() => {
  switch (statusLevel.value) {
    case 'critical': return '🚨'
    case 'warning': return '⚠️'
    case 'moderate': return '📉'
    case 'good': return '✅'
    default: return ''
  }
})

const showUrgency = computed(() => {
  return ['critical', 'warning'].includes(statusLevel.value)
})

// Utility functions
const formatNeedName = (need: string): string => {
  const needNames: Record<string, string> = {
    hunger: 'Hunger',
    thirst: 'Thirst',
    happiness: 'Happiness',
    cleanliness: 'Cleanliness',
    energy: 'Energy',
    social: 'Social',
    nails: 'Nails',
    chew: 'Chew',
    shelter: 'Shelter'
  }
  return needNames[need] || need.charAt(0).toUpperCase() + need.slice(1)
}
</script>

<style scoped>
.need-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.need-bar:hover {
  border-color: var(--color-border-medium);
  box-shadow: var(--shadow-sm);
}

/* Size variants */
.need-bar--sm {
  padding: 0.5rem;
  gap: 0.25rem;
}

.need-bar--lg {
  padding: 1rem;
  gap: 0.75rem;
}

/* Layout variants */
.need-bar--compact .need-bar__status {
  display: none;
}

.need-bar--detailed .need-bar__thresholds {
  opacity: 1;
}

/* Header */
.need-bar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.need-bar__label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.need-bar__value {
  font-weight: 700;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
}

/* Track and fill */
.need-bar__track {
  position: relative;
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.need-bar--lg .need-bar__track {
  block-size: 12px;
}

.need-bar__fill {
  block-size: 100%;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.need-bar__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  opacity: 0.6;
}

/* Status-based fill colors */
/* Green (60-100) → Grey (40-60) → Yellow (30-40) → Red (0-30) */
.need-bar__fill--good {
  background-color: var(--color-success);
}

.need-bar__fill--moderate {
  background-color: #9ca3af; /* Grey */
}

.need-bar__fill--warning {
  background-color: #eab308; /* Yellow */
}

.need-bar__fill--critical {
  background-color: var(--color-error);
  animation: pulse-critical 2s infinite;
}

/* Status-based value colors */
.need-bar__value--good {
  color: var(--color-success);
}

.need-bar__value--moderate {
  color: #6b7280; /* Grey text */
}

.need-bar__value--warning {
  color: #ca8a04; /* Yellow text */
}

.need-bar__value--critical {
  color: var(--color-error);
  animation: pulse-text 2s infinite;
}

/* Threshold indicators */
.need-bar__thresholds {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  transition: opacity var(--transition-fast);
}

.need-bar:hover .need-bar__thresholds {
  opacity: 0.6;
}

.need-bar__threshold {
  position: absolute;
  top: 0;
  block-size: 100%;
  inline-size: 1px;
  background-color: currentColor;
}

.need-bar__threshold--critical {
  color: var(--color-error);
}

.need-bar__threshold--warning {
  color: var(--color-warning);
}

.need-bar__threshold--good {
  color: var(--color-success);
}

/* Status display */
.need-bar__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.need-bar__status-text {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color var(--transition-fast);
}

.need-bar__status--good {
  color: var(--color-success);
}

.need-bar__status--moderate {
  color: #6b7280; /* Grey */
}

.need-bar__status--warning {
  color: #ca8a04; /* Yellow */
}

.need-bar__status--critical {
  color: var(--color-error);
  animation: pulse-text 2s infinite;
}

.need-bar__urgency {
  font-size: 1rem;
  animation: bounce 1s infinite;
}

/* Status-based container styling */
.need-bar--critical {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.1);
}

.need-bar--warning {
  border-color: var(--color-warning);
}

/* Animations */
@keyframes pulse-critical {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-1px);
  }
}

/* Responsive design */
@container (max-width: 300px) {
  .need-bar__header {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }

  .need-bar__status {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .need-bar__fill,
  .need-bar__value,
  .need-bar__status-text {
    animation: none;
    transition: none;
  }

  .need-bar__urgency {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .need-bar {
    border-width: 2px;
  }

  .need-bar__track {
    border: 1px solid var(--color-border);
  }

  .need-bar__gradient {
    display: none;
  }
}
</style>