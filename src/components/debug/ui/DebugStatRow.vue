<template>
  <div class="stat-item">
    <span class="stat-label">{{ label }}</span>
    <span class="stat-value" :class="{ 'stat-value--muted': muted }">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  muted?: boolean
}>()
</script>
