<template>
  <BaseDialog
    :model-value="modelValue"
    :size="size"
    :close-on-backdrop="closeOnBackdrop"
    :close-on-escape="closeOnEscape"
    @update:model-value="handleDialogClose"
  >
    <div
      class="confirm-dialog__modal"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="confirm-dialog__header">
        <h3 :id="titleId" class="confirm-dialog__title">{{ title }}</h3>
      </div>

      <div class="confirm-dialog__content">
        <slot>
          <p>{{ message }}</p>
        </slot>
      </div>

      <div class="confirm-dialog__footer">
        <Button
          @click="handleCancel"
          variant="tertiary"
          :size="buttonSize"
        >
          {{ cancelText }}
        </Button>
        <Button
          @click="handleConfirm"
          :variant="confirmVariant"
          :size="buttonSize"
        >
          {{ confirmText }}
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseDialog from './BaseDialog.vue'
import Button from '../Button.vue'

interface Props {
  modelValue: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true
})

const emit = defineEmits<Emits>()

// Generate unique ID for aria-labelledby
const titleId = `confirm-dialog-title-${Math.random().toString(36).substr(2, 9)}`

const confirmVariant = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'primary'
  }
})

const buttonSize = computed(() => props.size)

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleDialogClose(value: boolean) {
  if (!value) {
    emit('cancel')
  }
  emit('update:modelValue', value)
}
</script>

<style>
/* Confirm Dialog Component - Extends base Dialog */

/* Modal container - inherits sizing from Dialog component */
.confirm-dialog__modal {
  /* Base Dialog handles all positioning, backdrop, and animations */
}

/* Header */
.confirm-dialog__header {
  padding-block-start: var(--space-6);
  padding-block-end: var(--space-4);
  padding-inline: var(--space-6);
  border-block-end: 1px solid var(--color-border-light);
}

.confirm-dialog__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

/* Content */
.confirm-dialog__content {
  padding: var(--space-6);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.confirm-dialog__content p {
  margin: 0;
}

.confirm-dialog__content p:not(:last-child) {
  margin-block-end: var(--space-4);
}

/* Footer */
.confirm-dialog__footer {
  padding-block-start: var(--space-4);
  padding-block-end: var(--space-6);
  padding-inline: var(--space-6);
  border-block-start: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* Mobile styles */
@media (max-width: 640px) {
  .confirm-dialog__footer {
    padding-block-start: var(--space-3);
    padding-block-end: var(--space-5);
    flex-direction: column-reverse;
  }

  .confirm-dialog__footer .button {
    inline-size: 100%;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .confirm-dialog__header,
  .confirm-dialog__footer {
    border-width: 2px;
  }
}
</style>