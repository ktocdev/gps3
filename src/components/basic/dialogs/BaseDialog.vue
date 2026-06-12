<template>
  <dialog
    ref="dialogRef"
    class="base-dialog"
    :class="dialogSizeClass"
    @close="handleClose"
    @click="handleDialogClick"
  >
    <div class="base-dialog__content">
      <slot></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  size?: 'sm' | 'md' | 'lg'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true
})

const emit = defineEmits<Emits>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const dialogSizeClass = `base-dialog--${props.size}`

// Track open dialog count for nested dialogs (module-level)
let openDialogCount = 0

function lockScroll() {
  if (openDialogCount === 0) {
    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Store original values in data attributes
    document.body.dataset.scrollLockPaddingRight = document.body.style.paddingRight
    document.body.dataset.scrollLockOverflow = document.body.style.overflow

    // Apply scroll lock with scrollbar compensation
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }
  openDialogCount++
}

function unlockScroll() {
  openDialogCount--
  if (openDialogCount === 0) {
    // Restore original values
    document.body.style.overflow = document.body.dataset.scrollLockOverflow || ''
    document.body.style.paddingRight = document.body.dataset.scrollLockPaddingRight || ''

    // Clean up data attributes
    delete document.body.dataset.scrollLockPaddingRight
    delete document.body.dataset.scrollLockOverflow
  }
}

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleDialogClick(event: MouseEvent) {
  // Close on backdrop click (clicking outside the dialog content)
  if (props.closeOnBackdrop && dialogRef.value && event.target === dialogRef.value) {
    handleClose()
  }
}

// Watch modelValue to open/close the native dialog
watch(() => props.modelValue, (isOpen) => {
  if (!dialogRef.value) return

  if (isOpen && !dialogRef.value.open) {
    lockScroll()
    dialogRef.value.showModal()
  } else if (!isOpen && dialogRef.value.open) {
    dialogRef.value.close()
    unlockScroll()
  }
})

// Handle escape key (native dialog already handles this, but we need to emit)
function handleEscape(event: Event) {
  if (!props.closeOnEscape) {
    event.preventDefault()
  }
}

onMounted(() => {
  if (dialogRef.value) {
    dialogRef.value.addEventListener('cancel', handleEscape)

    // Open immediately if modelValue is true
    if (props.modelValue) {
      lockScroll()
      dialogRef.value.showModal()
    }
  }
})

onUnmounted(() => {
  if (dialogRef.value) {
    dialogRef.value.removeEventListener('cancel', handleEscape)
  }
  // Ensure scroll is unlocked if component unmounts while open
  if (props.modelValue) {
    unlockScroll()
  }
})
</script>

<style>
/* Base Dialog Component - Uses native <dialog> element */

/* Native dialog element */
.base-dialog {
  padding: 0;
  border: none;
  background-color: transparent;
  max-inline-size: 100%;
  max-block-size: calc(100vh - var(--space-8));
  overflow: visible;
  /* Center the dialog vertically and horizontally */
  position: fixed;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

/* Native backdrop (::backdrop pseudo-element) */
.base-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn var(--transition-fast);
}

/* Dialog content wrapper */
.base-dialog__content {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  border-end-end-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow-y: auto;
  max-block-size: calc(100vh - var(--space-8));
  animation: slideUp var(--transition-normal);
}

/* Size modifiers */
.base-dialog--sm .base-dialog__content {
  inline-size: 100%;
  max-inline-size: 400px;
}

.base-dialog--md .base-dialog__content {
  inline-size: 100%;
  max-inline-size: 500px;
}

.base-dialog--lg .base-dialog__content {
  inline-size: 100%;
  max-inline-size: 600px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(var(--space-4));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced for larger screens */
@media (min-width: 641px) {
  /* Dialog already has good defaults for desktop */
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .base-dialog::backdrop,
  .base-dialog__content {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .base-dialog__content {
    border-width: 2px;
  }
}
</style>
