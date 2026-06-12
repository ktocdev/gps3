<!--
  Guinea Pig Simulation Game (GPS2)
  Copyright (c) 2025 ktocdev. All Rights Reserved.

  This file is part of the GPS2 proprietary software.
  Unauthorized copying, modification, or distribution is strictly prohibited.
-->
<template>
  <div class="activity-feed">
    <div v-if="showHeader && !hideHeader" class="activity-feed__header">
      <h4>{{ title }}</h4>
      <div class="button-group">
        <Button
          variant="danger"
          size="sm"
          @click="clearFeed"
          aria-label="Clear activity feed"
        >
          Clear All
        </Button>
        <Button
          variant="tertiary"
          size="sm"
          @click="togglePause"
          :aria-label="isPaused ? 'Resume activity feed' : 'Pause activity feed'"
        >
          {{ isPaused ? '▶️' : '⏸️' }}
        </Button>
      </div>
    </div>

    <div
      ref="feedContainer"
      class="activity-feed__container"
      :class="{ 'activity-feed__container--paused': isPaused }"
      :style="{ maxHeight: height }"
      @scroll="handleScroll"
    >
      <div
        v-if="filteredMessages.length === 0"
        class="activity-feed__empty"
      >
        <span class="activity-feed__empty-icon">💭</span>
        <p class="activity-feed__empty-text">
          {{ isPaused ? 'Activity feed is paused' : 'No activity yet...' }}
        </p>
      </div>

      <div
        v-for="message in visibleMessages"
        :key="message.id"
        :class="getMessageClasses(message)"
      >
        <div class="activity-feed__message-time">
          {{ formatTime(message.timestamp) }}
        </div>
        <div class="activity-feed__message-content">
          <span v-if="message.emoji" class="activity-feed__message-emoji">
            {{ message.emoji }}
          </span>
          <span class="activity-feed__message-text">{{ message.message }}</span>
        </div>
      </div>
    </div>

    <div v-if="showLoadMore" class="activity-feed__load-more">
      <Button
        variant="tertiary"
        size="sm"
        @click="loadMoreMessages"
        :disabled="isLoadingMore"
      >
        {{ isLoadingMore ? 'Loading...' : `Load ${remainingCount} more` }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useLoggingStore, type ActivityMessage, type MessageCategory } from '../../../stores/loggingStore'
import Button from '../../basic/Button.vue'

interface Props {
  maxMessages?: number
  showHeader?: boolean
  hideHeader?: boolean
  showFilters?: boolean
  autoScroll?: boolean
  height?: string
  compact?: boolean
  categories?: MessageCategory[]
  title?: string
  isPausedExternal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxMessages: 50,
  showHeader: true,
  hideHeader: false,
  showFilters: true,
  autoScroll: true,
  height: '300px',
  compact: false,
  categories: () => ['player_action', 'guinea_pig_reaction', 'autonomous_behavior', 'environmental', 'achievement'],
  title: 'Activity Feed',
  isPausedExternal: undefined
})

const loggingStore = useLoggingStore()
const feedContainer = ref<HTMLElement>()

// Emit events for parent control
const emit = defineEmits<{
  'toggle-pause': []
  'clear': []
}>()

// State
const isPaused = computed(() => {
  return props.isPausedExternal !== undefined ? props.isPausedExternal : isPausedInternal.value
})
const isPausedInternal = ref(false)
const isLoadingMore = ref(false)
const displayCount = ref(20)
const selectedCategories = ref<MessageCategory[]>([...props.categories])
const isPinnedToTop = ref(true) // Auto-scroll when pinned, disable when user scrolls away

// Computed properties
const filteredMessages = computed(() => {
  if (isPaused.value) {
    return []
  }

  return loggingStore.activityMessages.filter(message =>
    selectedCategories.value.includes(message.category)
  ).slice(-props.maxMessages)
})

const visibleMessages = computed(() => {
  return filteredMessages.value.slice(-displayCount.value).reverse()
})

const showLoadMore = computed(() => {
  return filteredMessages.value.length > displayCount.value
})

const remainingCount = computed(() => {
  return Math.min(20, filteredMessages.value.length - displayCount.value)
})

// Methods
const togglePause = () => {
  if (props.isPausedExternal !== undefined) {
    emit('toggle-pause')
  } else {
    isPausedInternal.value = !isPausedInternal.value
  }
}

const clearFeed = () => {
  if (props.isPausedExternal !== undefined) {
    emit('clear')
  } else {
    loggingStore.clearMessages()
  }
}

const loadMoreMessages = async () => {
  isLoadingMore.value = true
  await nextTick()

  // Simulate loading delay for better UX
  setTimeout(() => {
    displayCount.value += 20
    isLoadingMore.value = false
  }, 200)
}

const scrollToTop = async () => {
  if (!props.autoScroll || !feedContainer.value || !isPinnedToTop.value) return

  await nextTick()
  feedContainer.value.scrollTop = 0
}

// Handle user scroll - unpin when scrolled away from top, re-pin when at top
const handleScroll = () => {
  if (!feedContainer.value) return

  const scrollTop = feedContainer.value.scrollTop
  const threshold = 10 // Small threshold to account for minor scroll differences

  if (scrollTop <= threshold) {
    // User scrolled back to top - re-pin
    isPinnedToTop.value = true
  } else {
    // User scrolled away - unpin
    isPinnedToTop.value = false
  }
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getMessageClasses = (message: ActivityMessage): string => {
  const base = 'activity-feed__message'
  const category = `activity-feed__message--${message.category}`
  const level = `activity-feed__message--${message.level}`

  return [base, category, level].join(' ')
}

// Watch for new messages and auto-scroll to top (newest messages appear at top)
watch(
  () => loggingStore.activityMessages.length,
  () => {
    if (!isPaused.value) {
      scrollToTop()
    }
  },
  { flush: 'post' }
)

// Lifecycle
onMounted(() => {
  scrollToTop()
})
</script>

<style>
/* Activity Feed Component */

/* Base Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  block-size: 100%;
  font-family: var(--font-family-body);
  overflow: hidden;
}

/* When used standalone (with header visible) */
.activity-feed:has(.activity-feed__header) {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  border-end-end-radius: var(--radius-lg);
}

/* Header */
.activity-feed__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

.activity-feed__header h4 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}


/* Container */
.activity-feed__container {
  flex: 1;
  overflow-y: auto;
  padding-block: var(--space-2);
  padding-inline: var(--space-2);
  scroll-behavior: smooth;
}

.activity-feed__container--paused {
  opacity: 0.6;
}

/* Empty State */
.activity-feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  block-size: 100%;
  text-align: center;
  color: var(--color-text-muted);
}

.activity-feed__empty-icon {
  font-size: var(--font-size-3xl);
  margin-block-end: var(--space-2);
}

.activity-feed__empty-text {
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Messages */
.activity-feed__message {
  display: flex;
  flex-direction: column;
  margin-block-end: var(--space-2);
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-start-start-radius: var(--radius-md);
  border-start-end-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.activity-feed__message:hover {
  background-color: var(--color-bg-tertiary);
  box-shadow: var(--shadow-sm);
}

.activity-feed__message-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-block-end: var(--space-1);
  font-family: var(--font-family-mono);
}

.activity-feed__message-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.activity-feed__message-emoji {
  font-size: var(--font-size-lg);
  line-height: 1;
  flex-shrink: 0;
}

.activity-feed__message-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

/* Message Category Variants */
.activity-feed__message--player_action {
  border-inline-start: 3px solid var(--color-primary);
}

.activity-feed__message--guinea_pig_reaction {
  border-inline-start: 3px solid var(--color-secondary);
}

.activity-feed__message--autonomous_behavior {
  border-inline-start: 3px solid var(--color-info);
}

.activity-feed__message--environmental {
  border-inline-start: 3px solid var(--color-warning);
}

.activity-feed__message--achievement {
  border-inline-start: 3px solid var(--color-accent-pink-400);
  background-color: var(--color-primary-bg);
}

.activity-feed__message--system {
  border-inline-start: 3px solid var(--color-neutral-400);
}

/* Load More */
.activity-feed__load-more {
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  text-align: center;
  border-block-start: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .activity-feed__container {
    scroll-behavior: auto;
  }

  .activity-feed__message {
    transition: none;
  }
}
</style>