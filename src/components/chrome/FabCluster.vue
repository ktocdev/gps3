<template>
  <div class="fab-cluster">
    <div class="fab-cluster__rail" aria-hidden="true"></div>
    <div class="fab-cluster__row">
      <FabPlaque
        v-for="fab in fabs"
        :key="fab.theme"
        :fab="fab"
        :open="openFab === fab.theme"
        @toggle="toggle(fab.theme)"
        @close="openFab = null"
        @action="(id) => emit('action', fab.theme, id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FabPlaque from './FabPlaque.vue'
import type { FabConfig, FabTheme } from './fabThemes'

defineProps<{
  fabs: FabConfig[]
}>()

const emit = defineEmits<{
  action: [theme: FabTheme, actionId: string]
}>()

const openFab = ref<FabTheme | null>(null)

function toggle(theme: FabTheme) {
  openFab.value = openFab.value === theme ? null : theme
}
</script>
