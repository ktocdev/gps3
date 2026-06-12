<template>
  <div class="parchment-banner">
    <ParchmentPanel :accent="accent">
      <div class="parchment-banner__row">
        <span v-if="icon" class="parchment-banner__icon">{{ icon }}</span>
        <span><slot /></span>
        <button
          class="parchment-banner__cancel"
          type="button"
          title="Cancel"
          aria-label="Cancel"
          @click="emit('cancel')"
        >✕</button>
      </div>
    </ParchmentPanel>
  </div>
</template>

<script setup lang="ts">
import ParchmentPanel from './ParchmentPanel.vue'

defineProps<{
  accent?: string
  icon?: string
}>()

const emit = defineEmits<{
  cancel: []
}>()
</script>
