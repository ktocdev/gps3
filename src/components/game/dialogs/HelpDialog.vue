<template>
  <BaseDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="md">
    <div class="help-dialog">
      <div class="help-dialog__header">
        <h2 class="help-dialog__title">Help & Controls</h2>
      </div>

      <div class="help-dialog__content">
        <section class="help-dialog__section">
          <h4 class="help-dialog__section-title">Camera Controls</h4>
          <div class="help-dialog__shortcuts">
            <div class="help-dialog__shortcut"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> <span>Pan camera</span></div>
            <div class="help-dialog__shortcut"><kbd>Arrows</kbd> <span>Pan camera (when not controlling)</span></div>
            <div class="help-dialog__shortcut"><kbd>Q</kbd><kbd>E</kbd> <span>Rotate view</span></div>
            <div class="help-dialog__shortcut"><kbd>Drag</kbd> <span>Rotate view</span></div>
            <div class="help-dialog__shortcut"><kbd>Shift</kbd>+<kbd>Drag</kbd> <span>Pan camera</span></div>
            <div class="help-dialog__shortcut"><kbd>Scroll</kbd> <span>Zoom in/out</span></div>
            <div class="help-dialog__shortcut"><kbd>Z</kbd><kbd>X</kbd> <span>Zoom in/out</span></div>
            <div class="help-dialog__shortcut"><kbd>R</kbd> <span>Reset camera</span></div>
          </div>
        </section>

        <section class="help-dialog__section">
          <h4 class="help-dialog__section-title">Guinea Pig Control</h4>
          <div class="help-dialog__shortcuts">
            <div class="help-dialog__shortcut"><kbd>Click</kbd> guinea pig <span>Select & show menu</span></div>
            <div class="help-dialog__shortcut"><kbd>Take Control</kbd> button <span>Control movement</span></div>
            <div class="help-dialog__shortcut"><kbd>Arrows</kbd> <span>Move guinea pig (when controlling)</span></div>
            <div class="help-dialog__shortcut"><kbd>Click</kbd> ground <span>Walk to location</span></div>
            <div class="help-dialog__shortcut"><kbd>Esc</kbd> <span>Release control</span></div>
          </div>
        </section>

        <section class="help-dialog__section">
          <h4 class="help-dialog__section-title">Items & Inventory</h4>
          <div class="help-dialog__shortcuts">
            <div class="help-dialog__shortcut"><kbd>Click</kbd> container <span>View contents</span></div>
            <div class="help-dialog__shortcut"><kbd>Inventory</kbd> panel <span>Place items in habitat</span></div>
            <div class="help-dialog__shortcut"><kbd>Esc</kbd> <span>Cancel placement</span></div>
          </div>
        </section>

        <section class="help-dialog__section">
          <h4 class="help-dialog__section-title">Game Controls</h4>
          <div class="help-dialog__shortcuts">
            <div class="help-dialog__shortcut"><kbd>Space</kbd> <span>Pause / Resume (with dialog)</span></div>
            <div class="help-dialog__shortcut"><kbd>Shift</kbd>+<kbd>Space</kbd> <span>Pause / Resume (silent)</span></div>
            <div class="help-dialog__shortcut"><kbd>Fullscreen</kbd> button <span>Immersive view</span></div>
            <div class="help-dialog__shortcut"><kbd>Esc</kbd> <span>Exit mode / fullscreen</span></div>
          </div>
        </section>
      </div>

      <div class="help-dialog__footer">
        <Button @click="$emit('update:modelValue', false)" variant="primary" size="md">
          Close
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style>
.help-dialog {
  display: flex;
  flex-direction: column;
  min-inline-size: 320px;
}

.help-dialog__header {
  padding: var(--space-4) var(--space-5);
  border-block-end: 1px solid var(--color-border-light);
}

.help-dialog__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.help-dialog__content {
  padding: var(--space-4) var(--space-5);
  overflow-y: auto;
  max-block-size: 60vh;
}

.help-dialog__section {
  margin-block-end: var(--space-4);
}

.help-dialog__section:last-child {
  margin-block-end: 0;
}

.help-dialog__section-title {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.help-dialog__shortcuts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.help-dialog__shortcut {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.help-dialog__shortcut span {
  margin-inline-start: auto;
  color: var(--color-text-muted);
}

.help-dialog__shortcut kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 24px;
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.help-dialog__footer {
  display: flex;
  justify-content: center;
  padding: var(--space-4) var(--space-5);
  border-block-start: 1px solid var(--color-border-light);
}
</style>
