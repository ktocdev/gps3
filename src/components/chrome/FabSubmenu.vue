<template>
  <template v-if="show">
    <div class="fab-submenu__backdrop" @click="emit('close')"></div>
    <div class="fab-submenu" :style="themeVars">
      <ParchmentPanel :accent="colors.stripe" :animate="false" show-grain>
        <div v-if="actions.length === 0" class="chrome-inv__empty">
          {{ emptyMessage ?? 'Nothing available.' }}
        </div>
        <div v-else class="fab-submenu__grid">
          <button
            v-for="(action, i) in actions"
            :key="action.id"
            class="fab-submenu__tile"
            :class="{ 'fab-submenu__tile--disabled': action.disabled }"
            :style="{ transform: `rotate(${tiltFor(i)}deg)` }"
            :disabled="action.disabled"
            :title="action.disabled ? 'Coming soon' : undefined"
            @click="select(action.id)"
          >
            <span v-if="action.disabled" class="fab-submenu__tile-tag">Soon</span>
            <span class="fab-submenu__tile-icon">{{ action.icon }}</span>
            <span class="fab-submenu__tile-label">{{ action.label }}</span>
          </button>
        </div>
      </ParchmentPanel>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ParchmentPanel from './ParchmentPanel.vue'
import { FAB_THEMES, type FabAction, type FabTheme } from './fabThemes'

const props = defineProps<{
  show: boolean
  theme: FabTheme
  actions: FabAction[]
  emptyMessage?: string
}>()

const emit = defineEmits<{
  select: [actionId: string]
  close: []
}>()

const colors = computed(() => FAB_THEMES[props.theme])

const themeVars = computed(() => ({
  '--fab-stripe': colors.value.stripe,
  '--fab-deep': colors.value.deep,
  '--fab-soft': colors.value.soft
}))

const TILTS = [-1.2, 0.9, -0.5, 1.4]

function tiltFor(i: number): number {
  return TILTS[i % TILTS.length]
}

function select(actionId: string) {
  emit('select', actionId)
  emit('close')
}
</script>
