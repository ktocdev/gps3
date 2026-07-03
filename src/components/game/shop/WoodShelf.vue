<template>
  <div class="wood-shelf">
    <slot />
    <div class="wood-shelf__board" aria-hidden="true">
      <div class="wood-shelf__grain-line wood-shelf__grain-line--1"></div>
      <div class="wood-shelf__grain-line wood-shelf__grain-line--2"></div>
      <div class="wood-shelf__grain-line wood-shelf__grain-line--3"></div>
      <div class="wood-shelf__underside"></div>
      <div class="wood-shelf__bracket wood-shelf__bracket--start"></div>
      <div class="wood-shelf__bracket wood-shelf__bracket--end"></div>
      <div v-if="label" class="wood-shelf__tag">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>()
</script>
