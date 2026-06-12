<template>
  <div class="pig-drawer__tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="pig-drawer__tab"
      :class="{ 'pig-drawer__tab--active': activeTab === tab.id }"
      @click="activeTab = tab.id"
    >
      <span>{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </div>
  <div class="pig-drawer__content">
    <PigInfoPanel v-if="activeTab === 'info'" :guinea-pig="guineaPig" />
    <PigNeedsPanel v-else :needs="guineaPig.needs" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PigInfoPanel from './PigInfoPanel.vue'
import PigNeedsPanel from './PigNeedsPanel.vue'
import type { GuineaPig } from '../../stores/guineaPigStore'

defineProps<{
  guineaPig: GuineaPig
}>()

const tabs = [
  { id: 'info', icon: '🐹', label: 'Info' },
  { id: 'needs', icon: '📊', label: 'Needs' }
] as const

const activeTab = ref<'info' | 'needs'>('info')
</script>
