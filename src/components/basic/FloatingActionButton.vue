<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :aria-label="ariaLabel"
    type="button"
    @click="handleClick"
  >
    <span v-if="icon" class="floating-action-button__icon">{{ icon }}</span>
    <span
      v-if="label && showLabel !== 'never'"
      :class="labelClasses"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  label?: string
  showLabel?: 'always' | 'hover' | 'never'
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'info'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  ariaLabel: string
  disabled?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: 'hover',
  variant: 'primary',
  position: 'bottom-right',
  size: 'md',
  pulse: false,
  disabled: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const base = 'floating-action-button'
  const variant = `floating-action-button--variant-${props.variant}`
  const position = `floating-action-button--position-${props.position}`
  const size = `floating-action-button--size-${props.size}`
  const pulse = props.pulse ? 'floating-action-button--pulse' : ''
  const disabled = props.disabled ? 'floating-action-button--disabled' : ''

  return [base, variant, position, size, pulse, disabled].filter(Boolean).join(' ')
})

const labelClasses = computed(() => {
  const base = 'floating-action-button__label'
  const visible = props.showLabel === 'always' ? 'floating-action-button__label--visible' : ''
  return [base, visible].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style>
/* Floating Action Button Component - BEM Methodology */

/* === Base Styles === */
.floating-action-button {
  position: fixed !important; /* Force fixed positioning */
  z-index: 9999; /* Ensure above all content */

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: var(--radius-full);

  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);

  cursor: pointer;
  transition: all var(--transition-fast);

  box-shadow: var(--shadow-lg);

  /* Prevent text selection */
  user-select: none;
  -webkit-user-select: none;

  /* Ensure button is always visible */
  pointer-events: auto;
}

.floating-action-button:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.floating-action-button:active {
  transform: scale(0.95);
}

.floating-action-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* === Position Variants - Mobile First === */
.floating-action-button--position-bottom-right {
  inset-block-end: var(--space-4);
  inset-inline-end: var(--space-4);

  /* Safe area support */
  inset-block-end: max(var(--space-4), env(safe-area-inset-bottom, var(--space-4)));
  inset-inline-end: max(var(--space-4), env(safe-area-inset-right, var(--space-4)));
}

.floating-action-button--position-bottom-left {
  inset-block-end: var(--space-4);
  inset-inline-start: var(--space-4);

  inset-block-end: max(var(--space-4), env(safe-area-inset-bottom, var(--space-4)));
  inset-inline-start: max(var(--space-4), env(safe-area-inset-left, var(--space-4)));
}

.floating-action-button--position-top-right {
  inset-block-start: var(--space-4);
  inset-inline-end: var(--space-4);

  inset-block-start: max(var(--space-4), env(safe-area-inset-top, var(--space-4)));
  inset-inline-end: max(var(--space-4), env(safe-area-inset-right, var(--space-4)));
}

.floating-action-button--position-top-left {
  inset-block-start: var(--space-4);
  inset-inline-start: var(--space-4);

  inset-block-start: max(var(--space-4), env(safe-area-inset-top, var(--space-4)));
  inset-inline-start: max(var(--space-4), env(safe-area-inset-left, var(--space-4)));
}

/* === Size Variants - Mobile First === */
.floating-action-button--size-sm {
  inline-size: 48px;
  block-size: 48px;
  font-size: var(--font-size-lg);
}

.floating-action-button--size-md {
  inline-size: 48px;
  block-size: 48px;
  font-size: var(--font-size-lg);
}

.floating-action-button--size-lg {
  inline-size: 56px;
  block-size: 56px;
  font-size: var(--font-size-xl);
}

/* === Color Variants === */
.floating-action-button--variant-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-primary:hover {
  background-color: var(--color-primary-hover);
}

.floating-action-button--variant-primary:active {
  background-color: var(--color-primary-active);
}

.floating-action-button--variant-secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-secondary:hover {
  background-color: var(--color-secondary-hover);
}

.floating-action-button--variant-secondary:active {
  background-color: var(--color-secondary-active);
}

.floating-action-button--variant-warning {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
}

.floating-action-button--variant-warning:hover {
  background-color: var(--color-warning-hover);
}

.floating-action-button--variant-danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-danger:hover {
  background-color: var(--color-error-hover);
}

.floating-action-button--variant-info {
  background-color: var(--color-info);
  color: var(--color-text-inverse);
}

.floating-action-button--variant-info:hover {
  background-color: var(--color-info-hover);
}

/* === Disabled State === */
.floating-action-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* === Pulse Animation === */
@keyframes floating-action-button-pulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0.7;
  }
  50% {
    box-shadow: 0 0 0 12px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
}

.floating-action-button--pulse {
  position: relative;
}

.floating-action-button--pulse::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  animation: floating-action-button-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .floating-action-button {
    transition: none;
  }

  .floating-action-button:hover {
    transform: none;
  }

  .floating-action-button:active {
    transform: none;
  }

  .floating-action-button--pulse::before {
    animation: none;
  }
}

/* === Label Styles - Mobile First === */
.floating-action-button__label {
  position: absolute;
  inset-inline-end: 100%;
  margin-inline-end: var(--space-3);

  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);

  padding-block: var(--space-2);
  padding-inline: var(--space-3);

  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-medium);

  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;

  box-shadow: var(--shadow-md);

  /* Hidden by default (for hover mode) */
  opacity: 0;
  transform: translateX(8px);
  transition: all var(--transition-fast);
  pointer-events: none;
}

/* Show label on hover/focus */
.floating-action-button:hover .floating-action-button__label,
.floating-action-button:focus-visible .floating-action-button__label {
  opacity: 1;
  transform: translateX(0);
}

/* Always visible variant */
.floating-action-button__label--visible {
  opacity: 1;
  transform: translateX(0);
}

/* Label arrow (optional enhancement) */
.floating-action-button__label::after {
  content: '';
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 100%;
  transform: translateY(-50%);

  border-width: 6px;
  border-style: solid;
  border-color: transparent;
  border-inline-start-color: var(--color-border-medium);
}

/* === Icon Styles === */
.floating-action-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* === Enhanced for Larger Screens === */
@media (min-width: 769px) {
  /* Larger sizes on desktop */
  .floating-action-button--size-md {
    inline-size: 56px;
    block-size: 56px;
    font-size: var(--font-size-xl);
  }

  .floating-action-button--size-lg {
    inline-size: 64px;
    block-size: 64px;
    font-size: var(--font-size-2xl);
  }

  /* More spacing on desktop */
  .floating-action-button--position-bottom-right,
  .floating-action-button--position-bottom-left {
    inset-block-end: var(--space-6);
    inset-block-end: max(var(--space-6), env(safe-area-inset-bottom, var(--space-6)));
  }

  .floating-action-button--position-bottom-right,
  .floating-action-button--position-top-right {
    inset-inline-end: var(--space-6);
    inset-inline-end: max(var(--space-6), env(safe-area-inset-right, var(--space-6)));
  }

  .floating-action-button--position-bottom-left,
  .floating-action-button--position-top-left {
    inset-inline-start: var(--space-6);
    inset-inline-start: max(var(--space-6), env(safe-area-inset-left, var(--space-6)));
  }

  .floating-action-button--position-top-right,
  .floating-action-button--position-top-left {
    inset-block-start: var(--space-6);
    inset-block-start: max(var(--space-6), env(safe-area-inset-top, var(--space-6)));
  }

  /* Larger label font on desktop */
  .floating-action-button__label {
    font-size: var(--font-size-sm);
  }
}

/* Touch devices - always show label if showLabel !== 'never' */
@media (hover: none) and (pointer: coarse) {
  .floating-action-button__label:not(.floating-action-button__label--never) {
    opacity: 1;
    transform: translateX(0);
  }
}

/* === Dark Mode Support === */
@media (prefers-color-scheme: dark) {
  .floating-action-button__label {
    background-color: var(--color-bg-tertiary);
    border-color: var(--color-border-dark);
  }

  .floating-action-button__label::after {
    border-inline-start-color: var(--color-border-dark);
  }
}
</style>
