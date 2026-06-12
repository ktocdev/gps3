<template>
  <div
    class="parchment-panel"
    :class="{
      'parchment-panel--animate': animate !== false,
      'parchment-panel--flex-col': flexCol
    }"
    :style="{ '--accent': accent ?? 'var(--color-gold)' }"
  >
    <div class="parchment-panel__awning" aria-hidden="true"></div>
    <span class="parchment-panel__stud parchment-panel__stud--tl" aria-hidden="true"></span>
    <span class="parchment-panel__stud parchment-panel__stud--tr" aria-hidden="true"></span>
    <span class="parchment-panel__stud parchment-panel__stud--bl" aria-hidden="true"></span>
    <span class="parchment-panel__stud parchment-panel__stud--br" aria-hidden="true"></span>
    <div class="parchment-panel__sheen" aria-hidden="true"></div>
    <div v-if="showGrain" class="parchment-panel__grain" aria-hidden="true"></div>
    <template v-if="noPadding">
      <slot />
    </template>
    <div v-else class="parchment-panel__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  accent?: string
  noPadding?: boolean
  animate?: boolean
  flexCol?: boolean
  showGrain?: boolean
}>()
</script>
