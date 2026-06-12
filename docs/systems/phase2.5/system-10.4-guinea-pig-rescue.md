# Guinea Pig Rescue System - System 10.4

**Phase 2.5: Interactive Feedback Enhancement**
**Status:** ➡️ **Moved to Phase 5 [System 22](../phase5/system-22-interaction-enhancement.md)**

> **⚠️ Note:** This system has been consolidated into Phase 5 **[System 22: Interaction Enhancement System](../phase5/system-22-interaction-enhancement.md)** as Component 2 (Guinea Pig Rescue System). Systems 10.3, 10.4, and 10.5 have been combined into System 22 for cohesive interaction feedback. Please refer to System 22 for the complete specification.

## Overview
Safety net system that automatically rescues guinea pigs when wellness drops critically low, applying financial consequences while offering players a meaningful choice between continuing with penalties or starting fresh with significant trade-offs.

## Core Purpose
- **Prevent permanent guinea pig loss**: Players never permanently lose their active guinea pigs
- **Meaningful consequences**: Financial penalties create stakes without devastating loss
- **Player agency**: Fresh Start option provides escape route with informed trade-offs
- **Learning opportunity**: System teaches importance of guinea pig care

## Rescue Mechanics

### Trigger Conditions
**Wellness Threshold**: When any active guinea pig's wellness drops below **15%**

**Rescue Actions**:
1. **Immediate session end**: Game automatically ends active session
2. **Both guinea pigs rescued**: If 2 guinea pigs are active, BOTH return to store
3. **Needs fully restored**: All rescued guinea pigs have all 11 needs reset to 100%
4. **Financial penalty**: Money deducted (configurable, default: $200)
5. **Balance floor**: Balance cannot go negative (caps at $0 if can't afford penalty)
6. **Needs processing paused**: System automatically pauses needs processing
7. **Rescue notification**: Modal dialog explains what happened and offers choices

**Stardust Sanctuary Integration** (System 6.95 REDESIGN):
- **Guinea pigs in Stardust Sanctuary remain in Sanctuary** - Only active guinea pigs are rescued
- **Active guinea pigs stay active** - With permanent adoption model, rescued guinea pigs' wellness is restored but they remain in your care (no returns to store)
- **Sanctuary guinea pigs unaffected** - Wellness remains frozen at 100%, no rescue needed
- **No guinea pigs removed** - Permanent adoption means rescue restores wellness but never removes guinea pigs
- **Log message**: "[Name] received emergency care. Rescue fee: $200 💔"

### Why Both Guinea Pigs?
- **Simpler logic**: All-or-nothing approach
- **Stronger consequence**: Encourages attentive care of all guinea pigs
- **Prevents exploitation**: Can't strategically neglect one guinea pig
- **Realistic roleplay**: Store wouldn't leave one guinea pig alone

## Warning System

### Warning Levels
Integrated with Phase 2.5 System 1 (Enhanced Activity Messages) warning infrastructure

**Level 1 - Warning** (Wellness 20-30%):
- **Message**: "Guinea pig needs urgent care! If wellness drops below 15%, the store will rescue them."
- **Frequency**: Every 60 seconds (throttled)
- **Category**: `environmental` with warning severity
- **Visual**: ⚠️ emoji, yellow border in activity feed

**Level 2 - Critical** (Wellness 15-20%):
- **Message**: "⚠️ CRITICAL: Guinea pig will be rescued if wellness drops below 15%!"
- **Frequency**: Every 30 seconds (throttled)
- **Category**: `environmental` with critical severity
- **Visual**: 🚨 emoji, red border in activity feed

**Throttling**:
- Separate warning timestamp tracking per wellness level
- Prevents message spam while maintaining urgency
- More frequent warnings as situation worsens

## Fresh Start System

### Availability
**Always offered** after every rescue, regardless of balance

**Rationale**:
- Prevents "stuck" feeling with awkwardly low balances ($50, $100, $150)
- Allows players to pursue different strategies
- Meaningful choice: money vs. emotional attachment

### What Gets Reset

**✅ Preserved**:
- **First 3 favorite guinea pigs** (free slots 1-3) - **LEGACY SYSTEM**
- **ALL Stardust Sanctuary guinea pigs** (System 6.95 REDESIGN)
- **ALL purchased Sanctuary slots** (System 6.95 REDESIGN)
- **Active guinea pigs remain active** (System 6.95 REDESIGN)
- **Total game sessions** (statistics)
- **Total play time** (statistics)

**❌ Lost**:
- **Money reset to $1,000** (fresh start amount)
- **All owned items** (cleared)
- **All consumables** (cleared)
- **All achievements** (cleared)
- **Favorite slots 4-10** (if purchased) - **LEGACY SYSTEM**
- **⚠️ Guinea pigs in slots 4-10** (permanently lost!) - **LEGACY SYSTEM**

**System 6.95 REDESIGN Changes**:
- Fresh Start preserves ALL Stardust Sanctuary guinea pigs (not just first 3)
- Preserves ALL purchased Sanctuary slots (investments protected)
- Active guinea pigs remain active (permanent adoption model)
- Log message: "Fresh Start! Currency reset to $1,000. Your X Stardust Sanctuary residents are safe! ✨"

### Economic Impact
Losing purchased favorite slots represents significant investment:
- Slot 4: $50
- Slot 5: $100
- Slot 6: $200
- Slot 7: $400
- Slot 8: $800
- Slot 9: $1,600
- Slot 10: $3,200
- **Total for all slots: $6,350**

**Design intent**: Fresh Start is NOT a free retry - it has real emotional and economic consequences

### Warning Display

When player chooses Fresh Start, confirmation dialog shows:

**If no extra slots (3 favorites or fewer)**:
```
You'll receive $1,000 to start over
✅ All your favorite guinea pigs will be preserved
❌ All items will be lost
❌ All achievements will be reset
This cannot be undone!
```

**If extra slots purchased (4-10 favorites)**:
```
You'll receive $1,000 to start over
✅ First 3 favorite slots preserved
⚠️ **Favorite slots 4-10 will be LOST**
⚠️ **Guinea pigs in lost slots will be gone forever**

**You will lose these favorites:**
• Marshmallow (slot 4)
• Nugget (slot 5)
• Cookie (slot 6)
• Pepper (slot 7)

❌ All items will be lost
❌ All achievements will be reset

This cannot be undone!
```

**Button Styling**: "Start Fresh" uses `danger` variant (red) to emphasize seriousness

## Debug Controls

### Location
**Needs System Debug Panel** (`NeedsDebug.vue`)

### Controls

**Rescue System Toggle**:
- Checkbox input with label
- Text: "Enable Rescue System (rescues at <15% wellness)"
- Default: ON (enabled)
- Persisted in needsController settings
- Disables rescue trigger when OFF (warnings still appear)

**Rescue Threshold Slider**:
- Component: `SliderField`
- Label: "Rescue Threshold"
- Range: 5% to 30%
- Step: 5%
- Default: 15%
- Shows current value with % suffix
- Show min/max: true

**Rescue Penalty Slider**:
- Component: `SliderField`
- Label: "Rescue Penalty"
- Range: $50 to $500
- Step: $50
- Default: $200
- Shows current value with $ prefix
- Show min/max: true

**Test Rescue Button**:
- Component: `Button`
- Variant: `danger`
- Size: `sm`
- Text: "🚨 Test Rescue (force trigger)"
- Full-width: true
- Immediately triggers **REAL** rescue regardless of wellness
- Session ends, needs reset, money deducted
- Useful for end-to-end testing of rescue system

**Preview Rescue Dialog Button**:
- Component: `Button`
- Variant: `tertiary`
- Size: `sm`
- Text: "👁️ Preview Rescue Dialog"
- Full-width: true
- Opens rescue dialog in **preview mode** with mock data
- Badge displays "PREVIEW - No Simulation Impact"
- No consequences to simulation (session continues normally)
- Useful for testing dialog UX, styling, and text without disrupting gameplay

### Debug Use Cases
- **Development testing**: Quickly test rescue and Fresh Start flows
- **Balance testing**: Adjust penalty and threshold to find optimal values
- **Relaxed gameplay**: Disable rescue for stress-free play
- **Tutorial creation**: Control when rescue happens for demonstration

## Technical Implementation

### NeedsController Extensions

**State Variables**:
```typescript
const rescueSystemEnabled = ref<boolean>(true)
const rescueThreshold = ref<number>(15)
const rescueWarningThreshold = ref<number>(20)
const rescuePenalty = ref<number>(200)
const lastRescueWarningTime = ref<number>(0)
const lastCriticalWarningTime = ref<number>(0)
```

**Rescue Trigger Logic** (in processBatchUpdate):
```typescript
// After calculateWellness()
if (rescueSystemEnabled.value && wellness < rescueThreshold.value) {
  triggerRescue(guineaPigId)
  return // Stop further processing, rescue initiated
}

// Warning system integration
const currentTime = Date.now()

if (wellness <= rescueWarningThreshold.value && wellness > rescueThreshold.value) {
  // Critical warning (15-20%)
  if (currentTime - lastCriticalWarningTime.value >= 30000) {
    loggingStore.addEnvironmentalEvent(
      '⚠️ CRITICAL: Guinea pig will be rescued if wellness drops below 15%!',
      '🚨',
      { wellness, threshold: rescueThreshold.value }
    )
    lastCriticalWarningTime.value = currentTime
  }
} else if (wellness <= 30 && wellness > rescueWarningThreshold.value) {
  // Regular warning (20-30%)
  if (currentTime - lastRescueWarningTime.value >= 60000) {
    loggingStore.addEnvironmentalEvent(
      'Guinea pig needs urgent care! If wellness drops below 15%, the store will rescue them.',
      '⚠️',
      { wellness, threshold: rescueThreshold.value }
    )
    lastRescueWarningTime.value = currentTime
  }
}
```

**Rescue Method**:
```typescript
function triggerRescue(guineaPigId: string): void {
  const petStoreManager = usePetStoreManager()
  const guineaPigStore = useGuineaPigStore()
  const playerProgression = usePlayerProgression()

  // Pause needs processing (system pause, not manual)
  pauseProcessing(false)

  // Get all active guinea pigs in session
  const rescuedIds = petStoreManager.activeGameSession?.guineaPigIds || []
  const rescuedPigs = rescuedIds
    .map(id => guineaPigStore.getGuineaPig(id))
    .filter(Boolean) as GuineaPig[]

  // Reset needs for all rescued guinea pigs
  rescuedIds.forEach(id => guineaPigStore.resetGuineaPigNeeds(id))

  // Save balance before penalty
  const previousBalance = playerProgression.currency

  // Apply financial penalty (capped at $0)
  const penalty = rescuePenalty.value
  const actualDeduction = playerProgression.deductCurrency(penalty, 'rescue_penalty')

  // End the game session
  petStoreManager.endSession()

  // Emit rescue event to UI layer
  const { emitRescue } = useRescueSystem()
  emitRescue({
    rescuedGuineaPigs: rescuedPigs,
    penaltyAmount: penalty,
    previousBalance,
    currentBalance: playerProgression.currency
  })

  // Log rescue in activity feed
  const names = rescuedPigs.map(gp => gp.name).join(' and ')
  loggingStore.addEnvironmentalEvent(
    `🚨 Guinea pig rescue triggered! ${names} returned to store. Wellness fell below ${rescueThreshold.value}%`,
    '🚨',
    {
      guineaPigIds: rescuedIds,
      wellness: calculateWellness(guineaPigId),
      penalty: actualDeduction
    }
  )
}
```

### PlayerProgression Extensions

**Fresh Start Method**:
```typescript
function freshStart(): void {
  const petStoreManager = usePetStoreManager()
  const logging = getLoggingStore()

  // Preserve only first 3 favorites
  const preservedFavorites = petStoreManager.favoriteGuineaPigs.slice(0, 3)
  const lostFavorites = petStoreManager.favoriteGuineaPigs.slice(3)

  // Reset economic progression
  currency.value = 1000
  totalCurrencyEarned.value = 1000
  ownedItems.value = {}
  consumables.value = {}
  unlockedAchievements.value = []
  favoriteSlotsPurchased.value = 0

  // Reset favorite system
  petStoreManager.maxFavoriteSlots = 3
  petStoreManager.favoriteGuineaPigs = preservedFavorites

  // Statistics preserved (totalGameSessions, totalPlayTime)

  // Log fresh start
  logging.addAchievement(
    'Fresh start! Your first 3 favorites are safe. 🌟',
    '🔄'
  )

  // Log lost favorites if any
  if (lostFavorites.length > 0) {
    const lostNames = lostFavorites.map(gp => gp.name).join(', ')
    logging.addEnvironmentalEvent(
      `Favorite slots 4-${3 + lostFavorites.length} lost: ${lostNames}`,
      '😢',
      { lostCount: lostFavorites.length, lostNames }
    )
  }
}
```

**Helper Method**:
```typescript
function getFavoritesInExtraSlots(): GuineaPig[] {
  const petStoreManager = usePetStoreManager()
  return petStoreManager.favoriteGuineaPigs.slice(3)
}
```

**Modified deductCurrency** (prevent negative):
```typescript
function deductCurrency(amount: number, reason: string): number {
  if (amount <= 0) return 0

  const actualDeduction = Math.min(amount, currency.value)
  currency.value = Math.max(0, currency.value - amount) // Floor at $0

  const logging = getLoggingStore()
  logging.addPlayerAction(
    `Currency -$${actualDeduction} (${reason}) 💸`,
    '💸',
    {
      attemptedDeduction: amount,
      actualDeduction,
      reason,
      newBalance: currency.value
    }
  )

  return actualDeduction
}
```

### Rescue Event Composable

**File**: `src/composables/useRescueSystem.ts`

```typescript
import { ref } from 'vue'
import type { GuineaPig } from '../stores/guineaPigStore'

export interface RescueEvent {
  rescuedGuineaPigs: GuineaPig[]
  penaltyAmount: number
  previousBalance: number
  currentBalance: number
}

// Global reactive state (singleton pattern)
const rescueEvent = ref<RescueEvent | null>(null)
const showRescueDialog = ref(false)
const showFreshStartDialog = ref(false)

export function useRescueSystem() {
  function emitRescue(event: RescueEvent) {
    rescueEvent.value = event
    showRescueDialog.value = true
  }

  function closeRescueDialog() {
    showRescueDialog.value = false
  }

  function openFreshStartDialog() {
    showRescueDialog.value = false
    showFreshStartDialog.value = true
  }

  function closeFreshStartDialog() {
    showFreshStartDialog.value = false
    rescueEvent.value = null
  }

  function confirmFreshStart() {
    const playerProgression = usePlayerProgression()
    playerProgression.freshStart()
    closeFreshStartDialog()
  }

  return {
    rescueEvent,
    showRescueDialog,
    showFreshStartDialog,
    emitRescue,
    closeRescueDialog,
    openFreshStartDialog,
    closeFreshStartDialog,
    confirmFreshStart
  }
}
```

## Dialog Components

### RescueDialog.vue

**Purpose**: Inform player about rescue and offer choices

**Layout**:
```
┌─────────────────────────────────────┐
│ 🚨 Guinea Pig Rescue                │
├─────────────────────────────────────┤
│ Your guinea pig's wellness dropped  │
│ below 15% and they have been        │
│ rescued by the store.               │
│                                     │
│ Rescued: Cocoa, Mocha               │
│                                     │
│ Previous balance: $450              │
│ Rescue penalty: -$200               │
│ Current balance: $250               │
│                                     │
│ Their needs have been restored to   │
│ 100% and they're safe in the store. │
│                                     │
│ You can start a new session or use  │
│ Fresh Start to reset your progress. │
├─────────────────────────────────────┤
│           [Continue Playing]        │
│            [Fresh Start]            │
└─────────────────────────────────────┘
```

**Props**:
```typescript
interface Props {
  modelValue: boolean
  rescuedGuineaPigs: GuineaPig[]
  penaltyAmount: number
  previousBalance: number
  currentBalance: number
  isPreview?: boolean // Debug preview mode
}
```

**Features**:
- Lists rescued guinea pigs by name
- Shows financial impact clearly
- Non-blocking: Player must make a choice
- "Continue Playing" = primary button (green)
- "Fresh Start" = warning button (yellow/orange)
- **Preview Mode**: When `isPreview` is true, displays `Badge` with "PREVIEW - No Simulation Impact" in header (variant: `info`, size: `sm`)

### FreshStartDialog.vue

**Purpose**: Confirm Fresh Start with clear warning about lost favorites

**Layout** (with extra favorites):
```
┌─────────────────────────────────────┐
│ Start Fresh?                        │
├─────────────────────────────────────┤
│ You'll receive $1,000 to start over │
│                                     │
│ ✅ First 3 favorite slots preserved │
│                                     │
│ ⚠️ Favorite slots 4-10 will be LOST│
│ ⚠️ Guinea pigs in lost slots will  │
│    be gone forever                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ You will lose these favorites:  │ │
│ │ • Marshmallow (slot 4)          │ │
│ │ • Nugget (slot 5)               │ │
│ │ • Cookie (slot 6)               │ │
│ │ • Pepper (slot 7)               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ❌ All items will be lost           │
│ ❌ All achievements will be reset   │
│                                     │
│ This cannot be undone!              │
├─────────────────────────────────────┤
│ [Cancel]       [Start Fresh]        │
└─────────────────────────────────────┘
```

**Props**:
```typescript
interface Props {
  modelValue: boolean
  favoritesInExtraSlots: GuineaPig[] // Favorites in slots 4-10
  isPreview?: boolean // Debug preview mode
}
```

**Features**:
- Conditional content based on favorite count
- Prominent warning box for lost favorites
- Lists specific guinea pig names that will be lost
- "Start Fresh" button uses `danger` variant (red)
- Cannot be closed without choosing (closeOnBackdrop: false)
- **Preview Mode**: When `isPreview` is true, displays `Badge` with "PREVIEW - No Simulation Impact" in header (variant: `info`, size: `sm`)

## Integration Points

### Debug Panel Integration (Phase 2.5)

**File**: `src/components/debug/NeedsDebug.vue`

For Phase 2.5, the rescue dialogs are integrated directly into the debug panel for testing:

```vue
<template>
  <div class="needs-debug">
    <!-- Existing needs controls -->

    <!-- Rescue System Debug Section -->
    <div class="panel panel--bordered panel--compact">
      <h4>Rescue System</h4>

      <label>
        <input
          type="checkbox"
          v-model="rescueSystemEnabled"
        />
        Enable Rescue System (rescues at <15% wellness)
      </label>

      <div v-if="rescueSystemEnabled">
        <SliderField
          v-model="rescueThreshold"
          label="Rescue Threshold"
          :min="5"
          :max="30"
          :step="5"
          suffix="%"
          :show-min-max="true"
        />

        <SliderField
          v-model="rescuePenalty"
          label="Rescue Penalty"
          :min="50"
          :max="500"
          :step="50"
          prefix="$"
          :show-min-max="true"
        />

        <Button
          variant="danger"
          size="sm"
          full-width
          @click="testRescue"
        >
          🚨 Test Rescue (force trigger)
        </Button>

        <Button
          variant="tertiary"
          size="sm"
          full-width
          @click="previewRescueDialog"
        >
          👁️ Preview Rescue Dialog
        </Button>
      </div>
    </div>

    <!-- Rescue Dialogs (for testing) -->
    <RescueDialog
      v-model="showRescueDialog"
      :rescued-guinea-pigs="rescueEvent?.rescuedGuineaPigs || []"
      :penalty-amount="rescueEvent?.penaltyAmount || 0"
      :previous-balance="rescueEvent?.previousBalance || 0"
      :current-balance="rescueEvent?.currentBalance || 0"
      :is-preview="isPreviewMode"
      @continue="handleContinuePlaying"
      @fresh-start="handleOpenFreshStart"
    />

    <FreshStartDialog
      v-model="showFreshStartDialog"
      :favorites-in-extra-slots="favoritesInExtraSlots"
      :is-preview="isPreviewMode"
      @confirm="handleConfirmFreshStart"
      @cancel="handleCancelFreshStart"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNeedsController } from '../../stores/needsController'
import { usePlayerProgression } from '../../stores/playerProgression'
import { useRescueSystem } from '../../composables/useRescueSystem'
import RescueDialog from '../basic/dialogs/RescueDialog.vue'
import FreshStartDialog from '../basic/dialogs/FreshStartDialog.vue'
import Button from '../basic/Button.vue'
import SliderField from '../basic/SliderField.vue'

const needsController = useNeedsController()
const playerProgression = usePlayerProgression()

const {
  rescueEvent,
  showRescueDialog,
  showFreshStartDialog,
  closeRescueDialog,
  openFreshStartDialog,
  closeFreshStartDialog,
  confirmFreshStart
} = useRescueSystem()

const rescueSystemEnabled = computed({
  get: () => needsController.rescueSystemEnabled,
  set: (value) => { needsController.rescueSystemEnabled = value }
})

const rescueThreshold = computed({
  get: () => needsController.rescueThreshold,
  set: (value) => { needsController.rescueThreshold = value }
})

const rescuePenalty = computed({
  get: () => needsController.rescuePenalty,
  set: (value) => { needsController.rescuePenalty = value }
})

const favoritesInExtraSlots = computed(() =>
  playerProgression.getFavoritesInExtraSlots()
)

const isPreviewMode = ref(false)

function testRescue() {
  isPreviewMode.value = false
  needsController.testRescue() // Manually trigger REAL rescue for testing
}

function previewRescueDialog() {
  isPreviewMode.value = true
  const { emitRescue } = useRescueSystem()

  // Mock data for preview
  const mockGuineaPigs = [
    { id: 'preview-1', name: 'Sample Guinea Pig 1', breed: 'American' },
    { id: 'preview-2', name: 'Sample Guinea Pig 2', breed: 'Abyssinian' }
  ]

  emitRescue({
    rescuedGuineaPigs: mockGuineaPigs,
    penaltyAmount: rescuePenalty.value,
    previousBalance: 450,
    currentBalance: 250
  })
}

function handleContinuePlaying() {
  if (isPreviewMode.value) {
    // Preview mode: just close dialog, no consequences
    closeRescueDialog()
    isPreviewMode.value = false
  } else {
    // Real rescue: close dialog normally
    closeRescueDialog()
  }
}

function handleOpenFreshStart() {
  openFreshStartDialog()
}

function handleConfirmFreshStart() {
  if (isPreviewMode.value) {
    // Preview mode: just close dialogs, no Fresh Start executed
    closeFreshStartDialog()
    isPreviewMode.value = false
  } else {
    // Real Fresh Start: execute it
    confirmFreshStart()
    isPreviewMode.value = false
  }
}

function handleCancelFreshStart() {
  closeFreshStartDialog()
  if (isPreviewMode.value) {
    isPreviewMode.value = false
  }
}
</script>
```

### Future GameView Integration (Later Phase)

When GameView is created in a future phase, integration will be simple:

1. Import `useRescueSystem` composable
2. Add `<RescueDialog>` and `<FreshStartDialog>` to template
3. Automatic rescue will trigger based on wellness threshold
4. No changes needed to rescue system logic

## User Experience Flows

### Flow 1: Rescue with Sufficient Funds
1. Player is playing with 2 guinea pigs (Cocoa and Mocha)
2. Wellness drops to 28% → Warning appears in activity feed
3. Player busy elsewhere, misses warning
4. Wellness drops to 17% → Critical warning appears
5. Wellness drops to 14% → **Rescue triggered**
6. Session ends immediately
7. Both guinea pigs' needs reset to 100%
8. Balance: $500 - $200 = $300
9. Rescue dialog appears explaining situation
10. Player reads they have $300 remaining
11. Player decides that's enough, clicks "Continue Playing"
12. Dialog closes, can start new session

### Flow 2: Rescue with Insufficient Funds
1. Player down to last $80
2. Wellness drops below 15%
3. Rescue triggered
4. Attempted penalty: $200, actual deduction: $80 (all available funds)
5. Balance: $0
6. Rescue dialog shows: Previous $80, Penalty $200, Current $0
7. Player realizes they can't afford to continue effectively
8. Player clicks "Fresh Start"
9. Fresh Start dialog appears
10. Player has 5 favorites (slots 1-5)
11. Dialog warns they'll lose slots 4-5 (Peanut and Butterscotch)
12. Player hesitates, considers keeping favorites
13. Player confirms Fresh Start
14. Balance restored to $1,000
15. Only Cocoa, Mocha, Truffle remain in favorites (slots 1-3)
16. Peanut and Butterscotch are gone forever
17. Activity feed: "Fresh start! Your first 3 favorites are safe. 🌟"
18. Activity feed: "Favorite slots 4-5 lost: Peanut, Butterscotch 😢"

### Flow 3: Rescue Decision - Emotional vs. Economic
1. Player has 10 favorite slots (maximum)
2. Has invested $6,350 to unlock all slots
3. Has 10 beloved guinea pigs saved
4. Gets rescued, balance drops to $175
5. Considers Fresh Start for fresh $1,000
6. Fresh Start dialog shows they'll lose slots 4-10 (7 guinea pigs!)
7. Sees list of 7 names they'd lose forever
8. Realizes $6,350 + 7 guinea pigs > $1,000 - $175 = $825
9. Decides to continue with $175 despite difficulty
10. **Design success**: Emotional attachment creates meaningful choice

### Flow 4: Debug Testing - Test Rescue Button
1. Developer testing rescue flow
2. Opens Needs System Debug panel
3. Sets rescue threshold to 30% (easier to trigger)
4. Sets rescue penalty to $100 (lower penalty for testing)
5. Clicks "🚨 Test Rescue (force trigger)"
6. Rescue immediately triggered regardless of wellness
7. **Real rescue**: Session ends, needs reset, money deducted
8. Can test dialog flow, Fresh Start, etc.
9. Can toggle "Enable Rescue System" OFF to disable for other testing

### Flow 5: Debug Testing - Preview Dialogs Only
1. Developer wants to test dialog UX without consequences
2. Opens Needs System Debug panel
3. Clicks "Preview Rescue Dialog" button
4. Rescue dialog appears with mock data (sample guinea pigs, balances)
5. **Preview mode**: Badge shows "PREVIEW - No Simulation Impact"
6. Can click through to Fresh Start dialog
7. Confirming Fresh Start in preview mode just closes dialogs
8. **No impact**: Session continues, no money deducted, needs unchanged
9. Can test dialog styling, text, button interactions safely

## Balance Considerations

### Rescue Penalty Tuning
**Default: $200**

**Rationale**:
- Starting money: $1,000
- **Adoption cost: $50 per guinea pig** ($50 for 1, $100 for 2)
- Penalty should hurt but not devastate
- $200 = meaningful consequence, not game-ending (2x adoption cost for pair)
- With $1,000 start minus $100 adoption = $900
- Can survive 2-3 rescues before considering Fresh Start
- Penalty is 4x single adoption cost, 2x pair adoption cost
- Economic relationship: Rescue cost = 2x session start cost

**Adjustment Factors**:
- If players rescue too often without consequence → Increase penalty
- If players feel stuck after single rescue → Decrease penalty
- Balance against earning rates (when implemented)

### Rescue Threshold Tuning
**Default: 15%**

**Rationale**:
- Wellness calculation uses weighted needs (40% critical, 35% environmental, 25% maintenance)
- 15% wellness = severe neglect across multiple needs
- Prevents accidental rescue from single low need
- Warnings at 20-30% give ample time to respond

**Adjustment Factors**:
- If rescues feel premature → Lower threshold (10%)
- If players can't recover from warnings → Raise threshold (20%)
- Monitor warning-to-rescue time window

### Fresh Start Economics
**Reset to $1,000**

**Pros**:
- Same as starting amount (familiar)
- Enough to recover and start new strategy
- Higher than likely post-rescue balances

**Cons of Higher/Lower**:
- Too high ($2,000+): Removes consequence, encourages farming rescues
- Too low ($500): Fresh Start still feels punishing, not "fresh"

**Losing Slots 4-10**:
- $6,350 total investment
- Strong deterrent against casual Fresh Start
- Creates meaningful choice: money vs. favorites
- Preserving slots 1-3 ensures some safety

## Phase 2.5 Implementation Scope

**Current Phase Focus**: Debug panel implementation only

**Implemented in Phase 2.5**:
- ✅ Rescue system logic in needsController.ts
- ✅ Fresh Start logic in playerProgression.ts
- ✅ Rescue dialog components (RescueDialog.vue, FreshStartDialog.vue)
- ✅ useRescueSystem composable for event coordination
- ✅ Debug controls in NeedsDebug.vue (toggle, test button, threshold sliders)
- ✅ Test Rescue button to manually trigger rescue and test dialog flow

**NOT Implemented in Phase 2.5** (Future Phases):
- ❌ Automatic rescue trigger during gameplay (rescue system enabled but only via debug)
- ❌ GameView integration (no GameView exists yet)
- ❌ Warning system display in activity feed (System 1 dependency)
- ❌ Production gameplay with automatic rescue

**Implementation Strategy**:
- Build complete rescue system infrastructure
- Test via debug panel "Test Rescue" button
- Rescue logic ready for future GameView integration
- Manual testing of rescue flow, Fresh Start, and dialog UX
- When GameView is created in future phase, simply integrate useRescueSystem composable

## Testing Scenarios

### Rescue Trigger Tests (via Debug Panel)
- [ ] Wellness drops to exactly 15% → Rescue triggered
- [ ] Wellness drops to 14.9% → Rescue triggered
- [ ] Wellness at 15.1% → No rescue (warning only)
- [ ] Rescue with 1 guinea pig → Only that guinea pig rescued
- [ ] Rescue with 2 guinea pigs → Both rescued
- [ ] Needs reset to 100% for all rescued guinea pigs
- [ ] Session ends after rescue
- [ ] Needs processing paused after rescue

### Financial Tests
- [ ] Balance $1,000, penalty $200 → Balance becomes $800
- [ ] Balance $150, penalty $200 → Balance becomes $0 (not negative)
- [ ] Balance $0, penalty $200 → Balance stays $0
- [ ] Activity feed shows attempted vs. actual deduction

### Warning Tests
- [ ] Wellness 25% → Warning every 60 seconds (not more frequent)
- [ ] Wellness 18% → Critical warning every 30 seconds (not more frequent)
- [ ] Wellness 35% → No warnings
- [ ] Wellness recovers above 20% → Warnings stop
- [ ] Warnings appear in activity feed with appropriate styling

### Fresh Start Tests
- [ ] Fresh Start with 3 favorites → All 3 preserved
- [ ] Fresh Start with 7 favorites → Only first 3 preserved
- [ ] Fresh Start resets money to $1,000
- [ ] Fresh Start clears all items
- [ ] Fresh Start clears all consumables
- [ ] Fresh Start clears all achievements
- [ ] Fresh Start resets favorite slots to 3
- [ ] Fresh Start preserves totalGameSessions
- [ ] Fresh Start preserves totalPlayTime
- [ ] Activity feed logs Fresh Start and lost favorites

### Dialog Tests
- [ ] Rescue dialog shows correct guinea pig names
- [ ] Rescue dialog shows correct balance calculations
- [ ] Fresh Start dialog shows favorites in slots 4-10
- [ ] Fresh Start dialog hides lost favorites section if ≤3 favorites
- [ ] Fresh Start confirmation requires explicit choice (can't dismiss)
- [ ] "Continue Playing" closes rescue dialog and allows new session
- [ ] "Cancel" in Fresh Start returns to game without changes

### Debug Control Tests
- [ ] Toggle rescue system OFF → No rescue triggered even below 15%
- [ ] Rescue threshold slider changes rescue point
- [ ] Rescue penalty slider changes penalty amount
- [ ] Test Rescue button triggers rescue immediately
- [ ] Debug settings persist across page refreshes

## Future Enhancements

### Potential Additions
- **Rescue count tracking**: Show total rescues in statistics
- **Rescue achievement**: "Rescued 5 times" milestone (ironic achievement)
- **Graduated penalties**: First rescue $100, second $200, third $400
- **Time-based penalty reduction**: Penalty decreases if playing well for X days
- **Favorite insurance**: Pay money to protect extra favorite slots from Fresh Start
- **Partial Fresh Start**: Reset money but keep items for higher cost
- **Tutorial integration**: Special handling for first rescue (reduced penalty, explanation)

### Rescue Alternatives Considered
- **Permanent guinea pig loss**: Too punishing, kills engagement
- **Temporary sickness**: Less clear consequence, more complex recovery
- **No rescue system**: Negative wellness could break simulation realism
- **Rescue without penalty**: No stakes, encourages neglect

### Fresh Start Alternatives Considered
- **Lose all favorites**: Too devastating, destroys long-term investment
- **Keep all favorites**: Removes meaningful choice, Fresh Start becomes exploit
- **Graduated loss (lose 1 favorite per Fresh Start)**: More complex, less predictable
- **Pay to Fresh Start**: Defeats purpose (already have money problems)

## Success Metrics

### Player Behavior
- **Rescue frequency**: Should be rare (<5% of sessions)
- **Fresh Start usage**: Should be occasional, not routine
- **Warning response rate**: Players should usually recover after warnings
- **Favorite slot purchasing post-rescue**: Shows confidence in avoiding future rescues

### System Health
- **Balance after rescue**: Should usually remain positive
- **Fresh Start regret**: Minimal complaints about losing favorites (clear warnings)
- **Rescue system disable rate**: Low (most players engage with system)
- **Tutorial clarity**: Players understand rescue mechanics quickly

## Documentation References
- [Enhanced Activity Messages](system-1-enhanced-activity-messages.md) - Warning system integration
- [Needs System](../phase2/system-7-needs-system.md) - Wellness calculation
- [Pet Store Manager](../phase2/system-6.5-pet-store-manager.md) - Session management
- [Player Progression](../phase2/system-6.9-guinea-pig-favorites.md) - Favorite slot mechanics
