<template>
  <div class="chrome-feed">
    <div v-if="messages.length === 0" class="chrome-feed__empty">💭 No activity yet...</div>
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="chrome-feed__entry"
      :style="{ '--entry-accent': categoryAccent(msg.category) }"
    >
      <div class="chrome-feed__time">{{ formatTime(msg.timestamp) }}</div>
      <div class="chrome-feed__text">
        <span class="chrome-feed__emoji">{{ msg.emoji || '📝' }}</span>
        <span>{{ msg.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLoggingStore, type MessageCategory } from '../../stores/loggingStore'

const loggingStore = useLoggingStore()

// Newest first, capped for render performance
const messages = computed(() => [...loggingStore.activityMessages].reverse().slice(0, 50))

const CATEGORY_ACCENTS: Record<MessageCategory, string> = {
  player_action: 'var(--color-green)',
  guinea_pig_reaction: 'var(--color-pink)',
  autonomous_behavior: 'var(--color-wood-dark)',
  environmental: 'var(--color-cyan-600)',
  achievement: 'var(--color-wood-amber)',
  system: 'var(--color-violet-deep)'
}

function categoryAccent(category: MessageCategory): string {
  return CATEGORY_ACCENTS[category] || 'var(--color-wood-dark)'
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}
</script>
