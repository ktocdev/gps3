<template>
  <div
    class="pill-dropdown"
    :class="`pill-dropdown--${side ?? 'left'}`"
    :style="{ inlineSize: width ?? '360px' }"
    data-sim-panel="1"
  >
    <ParchmentPanel
      :accent="accent"
      :show-grain="showGrain"
      :no-padding="noPadding"
      :flex-col="flexCol"
      :style="flexCol ? { maxBlockSize: '70vh' } : undefined"
    >
      <template v-if="title && !noPadding">
        <div class="parchment-panel__title">{{ icon }} {{ title }}</div>
      </template>
      <slot />
    </ParchmentPanel>
  </div>
</template>

<script setup lang="ts">
import ParchmentPanel from './ParchmentPanel.vue'

defineProps<{
  side?: 'left' | 'right' | 'center'
  width?: string
  accent?: string
  showGrain?: boolean
  noPadding?: boolean
  flexCol?: boolean
  title?: string
  icon?: string
}>()
</script>
