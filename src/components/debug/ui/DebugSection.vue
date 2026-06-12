<template>
  <div class="dbg-section">
    <h4 v-if="title" class="dbg-section__title">{{ title }}</h4>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
