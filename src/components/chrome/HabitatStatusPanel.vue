<template>
  <div class="habitat-status-panel">
    <div
      v-for="meter in meters"
      :key="meter.key"
      class="chrome-meter"
      :style="{
        '--meter-bg': palette(meter.value).bg,
        '--meter-border': palette(meter.value).border,
        '--meter-text': palette(meter.value).text
      }"
    >
      <div class="chrome-meter__head">
        <span class="chrome-meter__label"><span>{{ meter.emoji }}</span>{{ meter.label }}</span>
        <span class="chrome-meter__value">{{ Math.round(meter.value) }}%</span>
      </div>
      <div class="chrome-meter__track">
        <div class="chrome-meter__fill" :style="{ width: `${meter.value}%`, background: meter.color }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHabitatConditions } from '../../stores/habitatConditions'

const habitatConditions = useHabitatConditions()

const meters = computed(() => [
  { key: 'water', label: 'Water', emoji: '💧', value: habitatConditions.waterLevel, color: 'var(--color-need-thirst)' },
  { key: 'hay', label: 'Hay Freshness', emoji: '🌾', value: habitatConditions.hayFreshness, color: 'var(--color-need-hunger)' },
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧹', value: habitatConditions.cleanliness, color: 'var(--color-green)' },
  { key: 'bedding', label: 'Bedding', emoji: '🛏️', value: habitatConditions.beddingFreshness, color: 'var(--color-violet-mid)' },
  { key: 'overall', label: 'Overall', emoji: '🏠', value: habitatConditions.overallCondition, color: 'var(--color-ivy)' }
])

interface MeterPalette {
  bg: string
  border: string
  text: string
}

function palette(value: number): MeterPalette {
  if (value <= 20) return { bg: '#fde2e2', border: 'var(--color-red-500)', text: 'var(--color-red-800)' }
  if (value <= 40) return { bg: '#fde9c8', border: 'var(--color-gold-500)', text: 'var(--color-gold-800)' }
  if (value <= 70) return { bg: 'var(--chrome-entry-bg)', border: '#a8a29e', text: 'var(--color-wood-border)' }
  return { bg: 'var(--color-green-100)', border: 'var(--color-green)', text: 'var(--color-green-900)' }
}
</script>

<style>
.habitat-status-panel {
  display: grid;
  gap: var(--space-2);
}
</style>
