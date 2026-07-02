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
    >
      <template v-if="!noPadding">
        <div v-if="title" class="parchment-panel__title">{{ icon }} {{ title }}</div>
        <div class="parchment-panel__scroll"><slot /></div>
      </template>
      <template v-else>
        <slot />
      </template>
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
