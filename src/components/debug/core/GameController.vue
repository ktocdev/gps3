<template>
  <div class="game-controller">
    <DebugPanelRow :columns="2">
      <!-- Guinea Pig Selection -->
      <DebugPanel
        :title="petStoreManager.activeGameSession ? '🐹 Active Guinea Pigs' : '🐹 Select Guinea Pigs'"
        :anchor="`${[selectedGuineaPig1, selectedGuineaPig2].filter(id => id !== '').length} selected`"
      >
        <div class="game-controller__gp-selection">
          <template v-if="petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0">
            <div class="form-field">
              <label class="form-field__label">Guinea Pig 1</label>
              <input
                type="text"
                :value="getGuineaPigName(selectedGuineaPig1)"
                readonly
                class="form-field__input form-field__input--readonly"
              />
            </div>
            <div v-if="selectedGuineaPig2" class="form-field">
              <label class="form-field__label">Guinea Pig 2</label>
              <input
                type="text"
                :value="getGuineaPigName(selectedGuineaPig2)"
                readonly
                class="form-field__input form-field__input--readonly"
              />
            </div>
          </template>
          <template v-else>
            <Select
              v-model="selectedGuineaPig1"
              :options="guineaPigOptions"
              label="Guinea Pig 1"
              placeholder="Select first guinea pig"
              size="sm"
            />
            <Select
              v-model="selectedGuineaPig2"
              :options="guineaPig2Options"
              label="Guinea Pig 2 (Optional)"
              placeholder="Select second guinea pig"
              size="sm"
            />
          </template>
        </div>
      </DebugPanel>

      <!-- Session Status -->
      <DebugPanel title="📊 Session Status" anchor="read-only">
        <div class="stats-grid">
          <DebugStatRow label="Active Guinea Pigs" :value="guineaPigStore.activeGuineaPigs.length" />
          <DebugStatRow
            label="Session Started"
            :value="petStoreManager.activeGameSession
              ? new Date(petStoreManager.activeGameSession.startedAt).toLocaleString()
              : 'N/A'"
            :muted="!petStoreManager.activeGameSession"
          />
          <DebugStatRow label="Currency" :value="playerProgression.formattedCurrency" />
        </div>
      </DebugPanel>
    </DebugPanelRow>

    <DebugPanelRow :columns="3">
      <!-- Game State & Controls -->
      <DebugPanel title="⏯️ Game State & Controls">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Game State</span>
            <DebugBadge
              :variant="gameController.gameState.currentState === 'playing'
                ? 'ok'
                : gameController.gameState.currentState === 'paused' ? 'warn' : 'info'"
            >
              {{ gameController.gameState.currentState }}
            </DebugBadge>
          </div>
          <DebugStatRow
            label="Pause Reason"
            :value="gameController.gameState.pauseReason || 'None'"
            :muted="!gameController.gameState.pauseReason"
          />
          <DebugStatRow
            label="Orientation Paused"
            :value="String(gameController.isOrientationPaused)"
            :muted="!gameController.isOrientationPaused"
          />
        </div>
      </DebugPanel>

      <!-- System Settings -->
      <DebugPanel title="⚙️ System Settings">
        <div class="game-controller__stack">
          <Select
            v-model="performanceMode"
            @change="updatePerformanceMode"
            :options="performanceOptions"
            label="Performance Mode"
            size="sm"
          />
          <Button @click="gameController.toggleErrorReporting()" variant="tertiary" size="sm">
            {{ gameController.settings.errorReporting.enabled ? 'Disable' : 'Enable' }} Error Reporting
          </Button>
        </div>
      </DebugPanel>

      <!-- Tutorial -->
      <DebugPanel title="🎓 Tutorial">
        <div class="game-controller__stack">
          <Select
            v-model="tutorialMode"
            @change="updateTutorialMode"
            :options="tutorialOptions"
            label="Tutorial Mode"
            size="sm"
          />
          <div class="stats-grid">
            <DebugStatRow
              label="First Time User"
              :value="String(gameController.gameState.isFirstTimeUser)"
              :muted="!gameController.gameState.isFirstTimeUser"
            />
            <DebugStatRow
              label="Tutorial Completed"
              :value="String(gameController.settings.tutorial.completed)"
              :muted="!gameController.settings.tutorial.completed"
            />
          </div>
          <Button @click="replayTutorial" variant="secondary" size="sm">
            🎓 Replay Tutorial
          </Button>
          <Button @click="resetFirstTimeUser" variant="warning" size="sm">
            🔄 Reset First Time User
          </Button>
        </div>
      </DebugPanel>
    </DebugPanelRow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameController } from '../../../stores/gameController'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { usePlayerProgression } from '../../../stores/playerProgression'
import { useTutorialStore } from '../../../stores/tutorialStore'
import Button from '../../basic/Button.vue'
import Select from '../../basic/Select.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugPanelRow from '../ui/DebugPanelRow.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import DebugBadge from '../ui/DebugBadge.vue'

// Stores
const gameController = useGameController()
const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()
const playerProgression = usePlayerProgression()
const tutorialStore = useTutorialStore()
const router = useRouter()

// Pet Store Session State
const selectedGuineaPig1 = ref<string | number>('')
const selectedGuineaPig2 = ref<string | number>('')

// Restore guinea pig selection from active session
watch([() => petStoreManager.activeGameSession], ([session]) => {
  if (session) {
    // Restore selection from active session
    // Active guinea pigs are always valid because they're stored in guineaPigStore.collection
    const sessionGuineaPigIds = session.guineaPigIds || []

    // Set guinea pig selections directly from session
    // They exist in guineaPigStore.collection even if not in available/sanctuary
    selectedGuineaPig1.value = sessionGuineaPigIds[0] || ''
    selectedGuineaPig2.value = sessionGuineaPigIds[1] || ''
  } else if (!session) {
    // No active session, clear selections
    selectedGuineaPig1.value = ''
    selectedGuineaPig2.value = ''
  }
}, { immediate: true })

const getGenderEmoji = (gender: 'male' | 'female') => {
  return gender === 'male' ? '♂️' : '♀️'
}

const getGuineaPigName = (id: string | number) => {
  if (!id) return ''
  const gp = guineaPigStore.collection.guineaPigs[String(id)]
  if (!gp) return 'Unknown'
  const isInSanctuary = petStoreManager.sanctuaryGuineaPigs.some(s => s.id === gp.id)
  const prefix = isInSanctuary ? '✨ ' : '🎮 '
  return `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`
}

const guineaPigOptions = computed(() => {
  // Combine available, sanctuary, and active guinea pigs for selection
  const availableAndSanctuary = [
    ...petStoreManager.availableGuineaPigs,
    ...petStoreManager.sanctuaryGuineaPigs
  ]

  // Add active guinea pigs from guineaPigStore if they're not already in the list
  const activeGuineaPigs = petStoreManager.activeSessionGuineaPigs || []
  const allGuineaPigs = [...availableAndSanctuary]

  for (const activeGp of activeGuineaPigs) {
    if (!allGuineaPigs.some(gp => gp.id === activeGp.id)) {
      allGuineaPigs.push(activeGp)
    }
  }

  return allGuineaPigs.map(gp => {
    const isInSanctuary = petStoreManager.sanctuaryGuineaPigs.some(s => s.id === gp.id)
    const isActive = activeGuineaPigs.some(a => a.id === gp.id)
    const prefix = isInSanctuary ? '✨ ' : isActive ? '🎮 ' : ''
    return {
      label: `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`,
      value: gp.id
    }
  })
})

const guineaPig2Options = computed(() => {
  // Combine available, sanctuary, and active guinea pigs for selection
  const availableAndSanctuary = [
    ...petStoreManager.availableGuineaPigs,
    ...petStoreManager.sanctuaryGuineaPigs
  ]

  // Add active guinea pigs from guineaPigStore if they're not already in the list
  const activeGuineaPigs = petStoreManager.activeSessionGuineaPigs || []
  const allGuineaPigs = [...availableAndSanctuary]

  for (const activeGp of activeGuineaPigs) {
    if (!allGuineaPigs.some(gp => gp.id === activeGp.id)) {
      allGuineaPigs.push(activeGp)
    }
  }

  return allGuineaPigs
    .filter(gp => gp.id !== selectedGuineaPig1.value)
    .map(gp => {
      const isInSanctuary = petStoreManager.sanctuaryGuineaPigs.some(s => s.id === gp.id)
      const isActive = activeGuineaPigs.some(a => a.id === gp.id)
      const prefix = isInSanctuary ? '✨ ' : isActive ? '🎮 ' : ''
      return {
        label: `${prefix}${getGenderEmoji(gp.gender)} ${gp.name} (${gp.breed})`,
        value: gp.id
      }
    })
})

// Settings Management
const tutorialOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'always_show', label: 'Always Show' },
  { value: 'never_show', label: 'Never Show' }
]

const performanceOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'reduced', label: 'Reduced' }
]

const tutorialMode = computed({
  get: () => gameController.settings.tutorial.mode,
  set: (value: string) => gameController.setTutorialMode(value as 'auto' | 'always_show' | 'never_show')
})

const performanceMode = computed({
  get: () => gameController.settings.performance.mode,
  set: (value: string) => gameController.setPerformanceMode(value as 'standard' | 'reduced')
})

// Settings Methods
const updateTutorialMode = () => {
  // Reactive value already updated through computed setter
}

const updatePerformanceMode = () => {
  // Reactive value already updated through computed setter
}

const resetFirstTimeUser = () => {
  gameController.updateSettings({
    tutorial: {
      ...gameController.settings.tutorial,
      isGlobalFirstTime: true
    }
  })
}

// Flag the tour for a relaunch, then head to Live Mode where it runs.
const replayTutorial = () => {
  gameController.setTutorialCompleted(false)
  tutorialStore.requestReplay()
  router.push('/')
}

</script>

<style>
/* Game Controller Styles */
.game-controller {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.game-controller__gp-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.game-controller__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
