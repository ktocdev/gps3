<template>
  <div
    class="panel"
    :class="{ 'panel--accent-edge': accent }"
    :style="accent ? { '--accent': accent } : undefined"
  >
    <div class="panel__header">
      <h3>{{ title }}</h3>
      <slot name="header-extra">
        <span v-if="anchor" class="dbg-anchor">{{ anchor }}</span>
      </slot>
    </div>
    <div class="panel__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  anchor?: string
  accent?: string
}>()
</script>
