<template>
  <div class="info-button-wrapper">
    <button
      ref="buttonRef"
      type="button"
      class="info-button"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="togglePopover"
    >
      <Icon icon="info-circle-solid" family="flowbite" size="md" />
    </button>
    <div
      v-if="isOpen"
      ref="popoverRef"
      :class="popoverClasses"
      role="status"
      aria-live="polite"
    >
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'

interface Props {
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  ariaLabel: 'More information'
})

const isOpen = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)
const popoverRef = ref<HTMLDivElement | null>(null)

const popoverClasses = computed(() => {
  const base = 'info-button__popover'
  const position = `info-button__popover--${props.position}`
  return [base, position].join(' ')
})

const togglePopover = () => {
  isOpen.value = !isOpen.value
}

const closePopover = () => {
  isOpen.value = false
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (!buttonRef.value || !popoverRef.value) return

  const target = event.target as Node
  if (!buttonRef.value.contains(target) && !popoverRef.value.contains(target)) {
    closePopover()
  }
}

// Keyboard handler
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closePopover()
    buttonRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style>
.info-button-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.info-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  border-radius: 50%;
  border: 1.5px solid var(--color-primary);
  background-color: transparent;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.info-button:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  transform: scale(1.1);
}

.info-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.info-button:active {
  transform: scale(0.95);
}

.info-button__popover {
  position: absolute;
  z-index: 1000;
  background-color: var(--color-neutral-900);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: 1.4;
  inline-size: 300px;
  max-inline-size: 400px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  white-space: normal;
}

.info-button__popover--top {
  inset-block-end: calc(100% + var(--space-2));
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.info-button__popover--top::after {
  content: '';
  position: absolute;
  inset-block-start: 100%;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-block-start-color: var(--color-neutral-900);
}

.info-button__popover--bottom {
  inset-block-start: calc(100% + var(--space-2));
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.info-button__popover--bottom::after {
  content: '';
  position: absolute;
  inset-block-end: 100%;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-block-end-color: var(--color-neutral-900);
}

.info-button__popover--left {
  inset-inline-end: calc(100% + var(--space-2));
  inset-block-start: 50%;
  transform: translateY(-50%);
}

.info-button__popover--left::after {
  content: '';
  position: absolute;
  inset-inline-start: 100%;
  inset-block-start: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-inline-start-color: var(--color-neutral-900);
}

.info-button__popover--right {
  inset-inline-start: calc(100% + var(--space-2));
  inset-block-start: 50%;
  transform: translateY(-50%);
}

.info-button__popover--right::after {
  content: '';
  position: absolute;
  inset-inline-end: 100%;
  inset-block-start: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-inline-end-color: var(--color-neutral-900);
}
</style>
