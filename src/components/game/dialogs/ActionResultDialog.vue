<template>
  <BaseDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm">
    <div class="action-result-dialog">
      <div class="action-result-dialog__icon">{{ icon }}</div>
      <h2 class="action-result-dialog__title">{{ title }}</h2>

      <div v-if="stats.length > 0" class="stats-grid action-result-dialog__stats">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="stat-item"
        >
          <span class="stat-label">{{ stat.label }}:</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>

      <p v-if="message" class="action-result-dialog__message">{{ message }}</p>

      <div class="action-result-dialog__footer">
        <Button @click="$emit('update:modelValue', false)" variant="primary" size="md">
          OK
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'

export interface ActionStat {
  label: string
  value: string | number
}

interface Props {
  modelValue: boolean
  icon: string
  title: string
  message?: string
  stats?: ActionStat[]
}

withDefaults(defineProps<Props>(), {
  stats: () => [],
  message: ''
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style>
.action-result-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  text-align: center;
  min-inline-size: 320px;
}

.action-result-dialog__icon {
  font-size: 3rem;
  line-height: 1;
}

.action-result-dialog__title {
  margin: 0;
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gold-800);
  border-block-end: 2px solid var(--color-wood-amber);
  padding-block-end: var(--space-2);
}

.action-result-dialog__stats {
  inline-size: 100%;
}

.action-result-dialog__message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-wood-dark);
}

.action-result-dialog__footer {
  margin-block-start: var(--space-2);
}
</style>
