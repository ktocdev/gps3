<template>
  <div class="logging-system">
    <h2>Activity Feed</h2>
    <div class="panel-grid">
    <!-- Test Controls Panel -->
    <div class="panel panel--compact panel--primary">
      <div class="panel__header">
        <h3>Logging System Test Controls</h3>
      </div>
      <div class="panel__content">
        <!-- Activity Message Generation -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Activity Messages</h4>
          </div>
          <div class="panel__content">
            <div class="button-group">
              <Button @click="testPlayerAction" variant="primary" size="sm">👆 Player Action</Button>
              <Button @click="testGuineaPigReaction" variant="secondary" size="sm">🐹 GP Reaction</Button>
              <Button @click="testAutonomousBehavior" variant="tertiary" size="sm">🎯 Autonomous</Button>
              <Button @click="testEnvironmentalEvent" variant="secondary" size="sm">🌿 Environment</Button>
              <Button @click="testAchievement" variant="primary" size="sm">🏆 Achievement</Button>
              <Button @click="testPreferenceReaction" variant="tertiary" size="sm">✨ Preference</Button>
            </div>
          </div>
        </div>

        <!-- Message Templates Testing -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Template Testing</h4>
          </div>
          <div class="panel__content">
            <div class="button-group-container">
              <Select
                v-model="selectedCategory"
                label="Category:"
                :options="categoryOptions"
              />
              <div class="form-group">
                <label for="custom-message-input">Custom Message:</label>
                <input
                  id="custom-message-input"
                  v-model="customMessage"
                  type="text"
                  placeholder="Enter custom message..."
                  class="input"
                />
              </div>
              <div class="button-group">
                <Button @click="testCustomMessage" variant="primary" size="sm">Send Custom</Button>
                <Button @click="testRandomTemplate" variant="secondary" size="sm">Random Template</Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Testing -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Bulk Testing</h4>
          </div>
          <div class="panel__content">
            <div class="button-group-container">
              <Select
                v-model="bulkCount"
                label="Message Count:"
                :options="[5, 10, 25, 50, 100]"
              />
              <Select
                v-model="bulkInterval"
                label="Interval (ms):"
                :options="[100, 250, 500, 1000, 2000]"
              />
              <div class="button-group">
                <Button @click="startBulkTest" :disabled="isBulkTesting" variant="primary" size="sm">
                  {{ isBulkTesting ? 'Running...' : 'Start Bulk Test' }}
                </Button>
                <Button @click="stopBulkTest" :disabled="!isBulkTesting" variant="danger" size="sm">Stop</Button>
              </div>
              <div v-if="isBulkTesting" class="text-label text-label--muted">
                Progress: {{ bulkProgress }}/{{ bulkCount }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Activity Feed Panel -->
    <div class="panel panel--compact panel--secondary">
      <div class="panel__header">
        <h3>Live Activity Feed</h3>
      </div>
      <div class="panel__content">
        <ActivityFeed
          :max-messages="100"
          :show-header="true"
          :auto-scroll="true"
          height="500px"
        />
      </div>
    </div>

    <!-- Statistics Panel -->
    <div class="panel panel--compact panel--muted">
      <div class="panel__header">
        <h3>Logging Statistics</h3>
      </div>
      <div class="panel__content">
        <!-- Message Counts -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Message Counts</h4>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Activity Messages:</span>
                <span class="stat-value">{{ loggingStore.activityMessages.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Messages:</span>
                <span class="stat-value">{{ loggingStore.state.messages.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Debug Messages:</span>
                <span class="stat-value">{{ loggingStore.debugMessages.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Recent Messages:</span>
                <span class="stat-value">{{ loggingStore.recentMessages.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>By Category</h4>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div
                v-for="(messages, category) in loggingStore.messagesByCategory"
                :key="category"
                class="stat-item"
              >
                <span class="stat-label">{{ formatCategoryName(category) }}:</span>
                <span class="stat-value">{{ messages.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Display -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h4>Current Settings</h4>
          </div>
          <div class="panel__content">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Max Messages:</span>
                <span class="stat-value">{{ loggingStore.state.settings.maxMessages }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Retention Hours:</span>
                <span class="stat-value">{{ loggingStore.state.settings.messageRetentionHours }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoggingStore, type MessageCategory } from '../../../stores/loggingStore'
import { MessageGenerator } from '../../../utils/messageGenerator'
import Button from '../../basic/Button.vue'
import Select from '../../basic/Select.vue'
import ActivityFeed from '../../game/ui/ActivityFeed.vue'

const loggingStore = useLoggingStore()

// Test state
const selectedCategory = ref<MessageCategory>('player_action')
const customMessage = ref('')
const bulkCount = ref(10)
const bulkInterval = ref(500)
const isBulkTesting = ref(false)
const bulkProgress = ref(0)
let bulkTestInterval: number | null = null

// Options
const categoryOptions = computed(() => [
  { label: '👆 Player Action', value: 'player_action' },
  { label: '🐹 Guinea Pig Reaction', value: 'guinea_pig_reaction' },
  { label: '🎯 Autonomous Behavior', value: 'autonomous_behavior' },
  { label: '🌿 Environmental', value: 'environmental' },
  { label: '🏆 Achievement', value: 'achievement' },
  { label: '⚙️ System', value: 'system' }
])


// Activity message test functions
const testPlayerAction = () => {
  const { message, emoji } = MessageGenerator.generatePlayerAction()
  loggingStore.addPlayerAction(message, emoji, { test: true })
}

const testGuineaPigReaction = () => {
  const { message, emoji } = MessageGenerator.generateGuineaPigReaction()
  loggingStore.addGuineaPigReaction(message, emoji, { test: true })
}

const testAutonomousBehavior = () => {
  const { message, emoji } = MessageGenerator.generateAutonomousBehavior()
  loggingStore.addAutonomousBehavior(message, emoji, { test: true })
}

const testEnvironmentalEvent = () => {
  const { message, emoji } = MessageGenerator.generateEnvironmentalEvent()
  loggingStore.addEnvironmentalEvent(message, emoji, { test: true })
}

const testAchievement = () => {
  const achievements = [
    'First Pet', 'Happy Guinea Pig', 'Excellent Caretaker',
    'Preference Detective', 'Clean Home Master', 'Guinea Pig Whisperer'
  ]
  const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)]
  const { message, emoji } = MessageGenerator.generateAchievement(randomAchievement)
  loggingStore.addAchievement(message, emoji, { test: true })
}

const testPreferenceReaction = () => {
  const items = ['carrot', 'apple', 'broccoli', 'strawberry', 'bell pepper']
  const preferences: Array<'love' | 'like' | 'neutral' | 'dislike' | 'hate'> = ['love', 'like', 'neutral', 'dislike', 'hate']

  const randomItem = items[Math.floor(Math.random() * items.length)]
  const randomPreference = preferences[Math.floor(Math.random() * preferences.length)]
  const isNewDiscovery = Math.random() > 0.7

  const { message, emoji } = MessageGenerator.generatePreferenceReaction(randomItem, randomPreference, isNewDiscovery)
  loggingStore.addGuineaPigReaction(message, emoji, {
    test: true,
    item: randomItem,
    preference: randomPreference,
    discovery: isNewDiscovery
  })
}

// Template testing
const testCustomMessage = () => {
  if (!customMessage.value.trim()) return

  if (selectedCategory.value === 'system') {
    loggingStore.logInfo(customMessage.value, { custom: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'player_action') {
    loggingStore.addPlayerAction(customMessage.value, '🧪', { custom: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'guinea_pig_reaction') {
    loggingStore.addGuineaPigReaction(customMessage.value, '🧪', { custom: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'autonomous_behavior') {
    loggingStore.addAutonomousBehavior(customMessage.value, '🧪', { custom: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'environmental') {
    loggingStore.addEnvironmentalEvent(customMessage.value, '🧪', { custom: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'achievement') {
    loggingStore.addAchievement(customMessage.value, '🧪', { custom: true, category: selectedCategory.value })
  }

  customMessage.value = ''
}

const testRandomTemplate = () => {
  const { message, emoji } = MessageGenerator.generateContextualMessage({
    category: selectedCategory.value
  })

  if (selectedCategory.value === 'system') {
    loggingStore.logInfo(message, { template: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'player_action') {
    loggingStore.addPlayerAction(message, emoji, { template: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'guinea_pig_reaction') {
    loggingStore.addGuineaPigReaction(message, emoji, { template: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'autonomous_behavior') {
    loggingStore.addAutonomousBehavior(message, emoji, { template: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'environmental') {
    loggingStore.addEnvironmentalEvent(message, emoji, { template: true, category: selectedCategory.value })
  } else if (selectedCategory.value === 'achievement') {
    loggingStore.addAchievement(message, emoji, { template: true, category: selectedCategory.value })
  }
}

// Bulk testing
const startBulkTest = () => {
  if (isBulkTesting.value) return

  isBulkTesting.value = true
  bulkProgress.value = 0

  const testFunctions = [
    testPlayerAction,
    testGuineaPigReaction,
    testAutonomousBehavior,
    testEnvironmentalEvent,
    testAchievement
  ]

  bulkTestInterval = window.setInterval(() => {
    if (bulkProgress.value >= bulkCount.value) {
      stopBulkTest()
      return
    }

    const randomTest = testFunctions[Math.floor(Math.random() * testFunctions.length)]
    randomTest()
    bulkProgress.value++
  }, bulkInterval.value)
}

const stopBulkTest = () => {
  if (bulkTestInterval) {
    clearInterval(bulkTestInterval)
    bulkTestInterval = null
  }
  isBulkTesting.value = false
  bulkProgress.value = 0
}



const formatCategoryName = (category: string): string => {
  return category.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Cleanup on unmount
import { onUnmounted } from 'vue'

onUnmounted(() => {
  if (bulkTestInterval) {
    clearInterval(bulkTestInterval)
  }
})
</script>

