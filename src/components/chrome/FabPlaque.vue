<template>
  <div class="fab-plaque" :style="themeVars">
    <div class="fab-plaque__peg" aria-hidden="true"></div>
    <button
      class="fab-plaque__button"
      :style="{ '--tilt': `${tilt}deg` }"
      :title="fab.label"
      @click="emit('toggle')"
    >
      <span class="fab-plaque__awning" aria-hidden="true"></span>
      <span class="fab-plaque__stud fab-plaque__stud--tl" aria-hidden="true"></span>
      <span class="fab-plaque__stud fab-plaque__stud--tr" aria-hidden="true"></span>
      <span class="fab-plaque__stud fab-plaque__stud--bl" aria-hidden="true"></span>
      <span class="fab-plaque__stud fab-plaque__stud--br" aria-hidden="true"></span>
      <span class="fab-plaque__grain" aria-hidden="true"></span>
      <span class="fab-plaque__inner">
        <span class="fab-plaque__disc">{{ fab.icon }}</span>
        <span class="fab-plaque__label">{{ fab.label }}</span>
      </span>
    </button>
    <FabSubmenu
      :show="open"
      :theme="fab.theme"
      :actions="fab.actions"
      :empty-message="fab.emptyMessage"
      @select="(id) => emit('action', id)"
      @close="emit('close')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FabSubmenu from './FabSubmenu.vue'
import { FAB_THEMES, type FabConfig } from './fabThemes'

const props = defineProps<{
  fab: FabConfig
  open: boolean
}>()

const emit = defineEmits<{
  toggle: []
  close: []
  action: [actionId: string]
}>()

const TILT_BY_THEME = { pink: -1.2, green: 0.8, violet: -0.6, orange: 1.1, cyan: -0.4 } as const

const tilt = computed(() => TILT_BY_THEME[props.fab.theme] ?? 0)

const themeVars = computed(() => {
  const colors = FAB_THEMES[props.fab.theme]
  return {
    '--fab-stripe': colors.stripe,
    '--fab-deep': colors.deep,
    '--fab-soft': colors.soft
  }
})
</script>
