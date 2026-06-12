<!--
  Guinea Pig Simulation Game (GPS2)
  Copyright (c) 2025 ktocdev. All Rights Reserved.

  This file is part of the GPS2 proprietary software.
  Unauthorized copying, modification, or distribution is strictly prohibited.
-->
<template>
  <div class="habitat-sidebar activity-feed-sidebar">
    <div class="habitat-sidebar__header activity-feed-sidebar__header">
      <h3>📜 Activity Feed</h3>
      <div class="activity-feed-sidebar__controls">
        <Button
          variant="tertiary"
          size="sm"
          @click="togglePause"
          :aria-label="isPaused ? 'Resume activity feed' : 'Pause activity feed'"
        >
          {{ isPaused ? '▶️' : '⏸️' }}
        </Button>
        <Button
          variant="danger"
          size="sm"
          @click="clearFeed"
          aria-label="Clear activity feed"
        >
          Clear All
        </Button>
      </div>
    </div>

    <div class="activity-feed-sidebar__content">
      <ActivityFeed
        :max-messages="maxMessages"
        :hide-header="true"
        :auto-scroll="autoScroll"
        :height="height"
        :compact="compact"
        :categories="categories"
        :is-paused-external="isPaused"
        @toggle-pause="togglePause"
        @clear="clearFeed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLoggingStore, type MessageCategory } from '../../../../stores/loggingStore'
import ActivityFeed from '../../ui/ActivityFeed.vue'
import Button from '../../../basic/Button.vue'

interface Props {
  maxMessages?: number
  autoScroll?: boolean
  height?: string
  compact?: boolean
  categories?: MessageCategory[]
}

withDefaults(defineProps<Props>(), {
  maxMessages: 100,
  autoScroll: true,
  height: '100%',
  compact: false,
  categories: () => ['player_action', 'guinea_pig_reaction', 'autonomous_behavior', 'environmental', 'achievement']
})

const loggingStore = useLoggingStore()
const isPaused = ref(false)

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const clearFeed = () => {
  loggingStore.clearMessages()
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.activity-feed-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-feed-sidebar__controls {
  display: flex;
  gap: var(--space-2);
}

.activity-feed-sidebar__content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
