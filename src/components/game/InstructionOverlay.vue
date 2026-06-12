<script setup lang="ts">
defineProps<{
  message: string
  theme: 'pink' | 'green' | 'orange'
}>()
</script>

<template>
  <div
    class="instruction-overlay"
    :class="`instruction-overlay--${theme}`"
  >
    {{ message }}
  </div>
</template>
