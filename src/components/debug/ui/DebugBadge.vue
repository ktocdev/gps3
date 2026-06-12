<template>
  <span class="dbg-badge" :class="`dbg-badge--${variant}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'ok' | 'warn' | 'err' | 'info'
}>()
</script>
