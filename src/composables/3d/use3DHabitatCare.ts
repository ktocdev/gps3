import { ref, computed } from 'vue'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { guineaPigMessages } from '../../data/guineaPigMessages'
import type { ReactionMessage } from '../../data/guineaPigMessages'

export interface ActionStat {
  label: string
  value: string | number
}

/**
 * Composable for managing habitat care actions
 * Handles clean, quick clean, water refill, and hay management dialogs
 */
export function use3DHabitatCare() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const guineaPigStore = useGuineaPigStore()

  /**
   * Show care reaction chat bubble for all active guinea pigs
   */
  function showCareReaction(careType: 'cageClean' | 'beddingRefresh' | 'waterRefill' | 'hayRackFill' | 'bowlFill') {
    const activeGuineaPigs = guineaPigStore.activeGuineaPigs
    if (activeGuineaPigs.length === 0) return

    const messages = guineaPigMessages.care[careType]

    activeGuineaPigs.forEach(guineaPig => {
      const reaction = messages[Math.floor(Math.random() * messages.length)] as ReactionMessage

      document.dispatchEvent(new CustomEvent('show-chat-bubble', {
        detail: { guineaPigId: guineaPig.id, reaction },
        bubbles: true
      }))
    })
  }

  // Dialog state
  const showCleanCageDialog = ref(false)
  const showHayManagementDialog = ref(false)
  const showActionResultDialog = ref(false)

  // Action result dialog content
  const actionResultIcon = ref('')
  const actionResultTitle = ref('')
  const actionResultMessage = ref('')
  const actionResultStats = ref<ActionStat[]>([])

  // Computed properties for clean cage dialog
  const habitatDirtiness = computed(() => habitatConditions.dirtiness)
  const beddingNeeded = computed(() => habitatConditions.calculateBeddingNeeded())
  const beddingAvailable = computed(() => habitatConditions.getTotalBeddingAvailable())

  // ============================================================================
  // FAB Subaction Handlers
  // ============================================================================

  /**
   * Open clean habitat dialog
   */
  function fabCleanHabitat() {
    showCleanCageDialog.value = true
  }

  /**
   * Handle clean cage dialog confirmation
   */
  function handleCleanCageConfirm(beddingType: string) {
    const result = habitatConditions.cleanCage(beddingType)
    if (result.success) {
      console.log(`[use3DHabitatCare] Clean habitat: ${result.message}`)
      loggingStore.addPlayerAction(result.message, '🧹')
      showCareReaction('cageClean')
    } else {
      console.warn(`[use3DHabitatCare] Clean habitat failed: ${result.message}`)
    }
  }

  /**
   * Quick clean - remove poops without bedding change
   */
  function fabQuickClean() {
    const result = habitatConditions.quickClean()
    console.log(`[use3DHabitatCare] Quick clean: ${result.message}`)

    // Log player action
    if (result.success) {
      loggingStore.addPlayerAction(result.message, '🧽')
      if (result.poopsRemoved > 0) {
        showCareReaction('cageClean')
      }
    }

    // Show result dialog
    actionResultIcon.value = '🧹'
    actionResultTitle.value = 'Quick Clean Complete!'
    actionResultMessage.value = result.poopsRemoved === 0
      ? 'The habitat was already clean!'
      : ''
    actionResultStats.value = result.poopsRemoved > 0
      ? [
          { label: 'Poops Removed', value: result.poopsRemoved },
          { label: 'Cleanliness Boost', value: `+${Math.min(20, result.poopsRemoved * 5)}%` }
        ]
      : []
    showActionResultDialog.value = true
  }

  /**
   * Refill water bottle
   */
  function fabRefillWater() {
    const previousLevel = habitatConditions.waterLevel
    habitatConditions.refillWater()
    const amountFilled = 100 - previousLevel
    console.log('[use3DHabitatCare] Water refilled')

    // Log player action
    if (amountFilled >= 1) {
      loggingStore.addPlayerAction(`Refilled water bottle (+${amountFilled.toFixed(0)}%)`, '💧')
      showCareReaction('waterRefill')
    }

    // Show result dialog
    actionResultIcon.value = '💧'
    actionResultTitle.value = 'Water Refilled!'
    actionResultMessage.value = amountFilled < 1
      ? 'The water bottle was already full!'
      : ''
    actionResultStats.value = amountFilled >= 1
      ? [
          { label: 'Water Added', value: `${amountFilled.toFixed(0)}%` },
          { label: 'Water Level', value: '100%' }
        ]
      : [{ label: 'Water Level', value: '100%' }]
    showActionResultDialog.value = true
  }

  /**
   * Open hay management dialog
   */
  function fabFillHay() {
    showHayManagementDialog.value = true
  }

  return {
    // Dialog state
    showCleanCageDialog,
    showHayManagementDialog,
    showActionResultDialog,

    // Action result content
    actionResultIcon,
    actionResultTitle,
    actionResultMessage,
    actionResultStats,

    // Computed for clean cage dialog
    habitatDirtiness,
    beddingNeeded,
    beddingAvailable,

    // Chat bubble helper
    showCareReaction,

    // FAB handlers
    fabCleanHabitat,
    handleCleanCageConfirm,
    fabQuickClean,
    fabRefillWater,
    fabFillHay
  }
}
