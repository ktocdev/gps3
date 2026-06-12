<template>
  <div v-if="tooltip" class="button-wrapper">
    <button
      :class="buttonClasses"
      :disabled="disabled"
      :type="type"
      @click="handleClick"
    >
      <slot></slot>
    </button>
    <span :class="tooltipClasses">{{ tooltip }}</span>
  </div>
  <button
    v-else
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'segmented'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  selected?: boolean
  iconOnly?: boolean
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false,
  selected: false,
  iconOnly: false,
  tooltip: '',
  tooltipPosition: 'top'
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const base = 'button'
  const variant = `button--${props.variant}`
  const size = `button--${props.size}`
  const fullWidth = props.fullWidth ? 'button--full-width' : ''
  const disabled = props.disabled ? 'button--disabled' : ''
  const selected = props.selected && props.variant === 'segmented' ? 'button--selected' : ''
  const iconOnly = props.iconOnly ? 'button--icon-only' : ''

  return [base, variant, size, fullWidth, disabled, selected, iconOnly].filter(Boolean).join(' ')
})

const tooltipClasses = computed(() => {
  const base = 'button__tooltip'
  const position = `button__tooltip--${props.tooltipPosition}`
  return [base, position].join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style>
/* Button Component - BEM Methodology */

/* Base Button Styles */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-decoration: none;
  border: 1px solid transparent;
  border-start-start-radius: var(--radius-md);
  border-start-end-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  line-height: var(--line-height-tight);
}

.button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:disabled,
.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(40%) brightness(0.95);
  box-shadow: none !important;
  transform: none !important;
}

/* Button Variants */

/* Primary Variant (Pink) */
.button--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--primary:active:not(:disabled) {
  background-color: var(--color-primary-active);
  border-color: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary Variant (Light Green) */
.button--secondary {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: var(--color-text-inverse);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
  border-color: var(--color-secondary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--secondary:active:not(:disabled) {
  background-color: var(--color-secondary-active);
  border-color: var(--color-secondary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Tertiary Variant (Neutral/Outline) */
.button--tertiary {
  background-color: transparent;
  border-color: var(--color-border-medium);
  color: var(--color-text-primary);
}

.button--tertiary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.button--tertiary:active:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  transform: translateY(0);
}

/* Danger Variant */
.button--danger {
  background-color: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-text-inverse);
}

.button--danger:hover:not(:disabled) {
  background-color: var(--color-error-hover);
  border-color: var(--color-error-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--danger:active:not(:disabled) {
  background-color: var(--color-error-active);
  border-color: var(--color-error-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Warning Variant - Orange (now uses CSS variables) */
.button--warning {
  background-color: var(--color-warning);
  border-color: var(--color-warning);
  color: var(--color-text-inverse);
}

.button--warning:hover:not(:disabled) {
  background-color: var(--color-warning-hover);
  border-color: var(--color-warning-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--warning:active:not(:disabled) {
  background-color: var(--color-warning-active);
  border-color: var(--color-warning-active);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Button Sizes */

/* Small Size - Mobile First */
.button--sm {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  font-size: var(--font-size-sm);
  min-block-size: 40px; /* iOS minimum touch target */
  border-start-start-radius: var(--radius-base);
  border-start-end-radius: var(--radius-base);
  border-end-start-radius: var(--radius-base);
  border-end-end-radius: var(--radius-base);
}

/* Medium Size (Default) - Mobile First */
.button--md {
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  font-size: var(--font-size-base);
  min-block-size: 44px; /* iOS minimum touch target */
}

/* Large Size - Mobile First */
.button--lg {
  padding-block: var(--space-4);
  padding-inline: var(--space-6);
  font-size: var(--font-size-lg);
  min-block-size: 48px; /* iOS minimum touch target */
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  border-end-end-radius: var(--radius-lg);
}

/* Button Modifiers */

/* Full Width */
.button--full-width {
  inline-size: 100%;
  white-space: break-spaces;
}

/* Enhanced styling for larger screens */
@media (min-width: 641px) {
  /* Add any larger screen enhancements here if needed */
}

/* Focus visible for better accessibility */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .button {
    border-width: 2px;
  }
}

/* Segmented Variant - for exclusive selection button groups */
.button--segmented {
  background-color: var(--color-bg-secondary);
  border: none;
  border-radius: 0;
  color: var(--color-text-secondary);
  border-inline-end: 1px solid var(--color-border-medium);
}

.button--segmented:last-child {
  border-inline-end: none;
}

.button--segmented:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  transform: none;
  box-shadow: none;
}

.button--segmented:active:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  transform: none;
}

.button--segmented.button--selected {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
}

.button--segmented.button--selected:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.button--segmented.button--selected:active:not(:disabled) {
  background-color: var(--color-primary-active);
}

/* Icon-Only Variant - Compact square button for icons */
.button--icon-only {
  padding-block: var(--space-2);
  padding-inline: var(--space-2);
  inline-size: auto;
  aspect-ratio: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
}

.button--icon-only.button--sm {
  padding-block: var(--space-1);
  padding-inline: var(--space-1);
  font-size: var(--font-size-base);
}

.button--icon-only.button--lg {
  padding-block: var(--space-3);
  padding-inline: var(--space-3);
  font-size: var(--font-size-xl);
}

/* Tooltip System */
.button-wrapper {
  position: relative;
  display: inline-flex;
  inline-size: fit-content;
}

/* Disabled buttons within wrapper fill the wrapper */
.button-wrapper > .button:disabled,
.button-wrapper > .button--disabled {
  inline-size: 100%;
}

/* Apply border-radius to wrapper when button is disabled (prevents background bleeding outside rounded corners) */
.button-wrapper:has(.button:disabled),
.button-wrapper:has(.button--disabled) {
  border-start-start-radius: var(--radius-md);
  border-start-end-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
}

.button__tooltip {
  position: absolute;
  background-color: var(--color-neutral-900);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  border-start-start-radius: var(--radius-base);
  border-start-end-radius: var(--radius-base);
  border-end-start-radius: var(--radius-base);
  border-end-end-radius: var(--radius-base);
  white-space: nowrap;
  pointer-events: none;
  z-index: var(--z-index-tooltip);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.button-wrapper:hover .button__tooltip,
.button-wrapper:focus-within .button__tooltip,
.button-wrapper:has(button:disabled):hover .button__tooltip {
  opacity: 1;
}

/* Tooltip Positions */
.button__tooltip--top {
  inset-block-end: calc(100% + var(--space-2));
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.button__tooltip--top::after {
  content: '';
  position: absolute;
  inset-block-start: 100%;
  inset-inline-start: 50%;
  margin-inline-start: calc(-1 * var(--space-1));
  border-inline-start: var(--space-1) solid transparent;
  border-inline-end: var(--space-1) solid transparent;
  border-block-start: var(--space-1) solid var(--color-neutral-900);
}

.button__tooltip--bottom {
  inset-block-start: calc(100% + var(--space-2));
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.button__tooltip--bottom::after {
  content: '';
  position: absolute;
  inset-block-end: 100%;
  inset-inline-start: 50%;
  margin-inline-start: calc(-1 * var(--space-1));
  border-inline-start: var(--space-1) solid transparent;
  border-inline-end: var(--space-1) solid transparent;
  border-block-end: var(--space-1) solid var(--color-neutral-900);
}

.button__tooltip--left {
  inset-inline-end: calc(100% + var(--space-2));
  inset-block-start: 50%;
  transform: translateY(-50%);
}

.button__tooltip--left::after {
  content: '';
  position: absolute;
  inset-inline-start: 100%;
  inset-block-start: 50%;
  margin-block-start: calc(-1 * var(--space-1));
  border-block-start: var(--space-1) solid transparent;
  border-block-end: var(--space-1) solid transparent;
  border-inline-start: var(--space-1) solid var(--color-neutral-900);
}

.button__tooltip--right {
  inset-inline-start: calc(100% + var(--space-2));
  inset-block-start: 50%;
  transform: translateY(-50%);
}

.button__tooltip--right::after {
  content: '';
  position: absolute;
  inset-inline-end: 100%;
  inset-block-start: 50%;
  margin-block-start: calc(-1 * var(--space-1));
  border-block-start: var(--space-1) solid transparent;
  border-block-end: var(--space-1) solid transparent;
  border-inline-end: var(--space-1) solid var(--color-neutral-900);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .button:hover:not(:disabled) {
    transform: none;
  }

  .button:active:not(:disabled) {
    transform: none;
  }

  .button__tooltip {
    transition: none;
  }
}</style>