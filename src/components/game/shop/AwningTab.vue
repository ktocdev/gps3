<template>
  <button
    class="awning-tab"
    :class="{ 'awning-tab--active': active }"
    type="button"
    :aria-pressed="active"
    :style="{ '--awning-accent': accent, '--awning-soft': soft }"
    @click="$emit('click')"
  >
    <div class="awning-tab__canopy" aria-hidden="true"></div>
    <svg
      class="awning-tab__scallop"
      height="22"
      viewBox="0 0 180 22"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M 4 0 Q 10 24 20 0 Q 40 24 50 0 Q 70 24 80 0 Q 100 24 110 0 Q 130 24 140 0 Q 160 24 170 0 L 176 0 L 176 -2 L 4 -2 Z" />
    </svg>
    <span class="awning-tab__label">
      <span class="awning-tab__icon">{{ icon }}</span>{{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  accent: string
  soft: string
  active: boolean
}>()

defineEmits<{ click: [] }>()
</script>
