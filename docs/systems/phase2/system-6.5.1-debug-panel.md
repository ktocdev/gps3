# Pet Store Debug Panel - Implementation Plan

**Phase:** Phase 2 (Core Entities & Timing)
**System:** Pet Store & Game Session Manager (Debug Interface)
**Status:** ✅ **Completed** (Core Implementation)
**Created:** September 27, 2025 | Branch: GPS2-9
**Completed:** September 27, 2025 | Branch: GPS2-10

## Overview

Implementation plan for the Pet Store Debug Panel - a comprehensive testing interface for the pet store and game session management system. This debug panel enables testing of all pet store features before building the player-facing game UI.

**Parent Documentation:** See `system-6.5-pet-store-manager.md` for complete pet store architecture.

## Readiness Assessment

### Prerequisites Met ✅
1. **Guinea Pig Store** - Core complete with persistence (GPS2-7)
2. **Game Controller** - State management foundation ready
3. **Debug Framework** - Tab-based debug system established in DebugView.vue
4. **Debug Panel Pattern** - Established with GuineaPigCreationDebug.vue
5. **Documentation** - Complete architecture plan in save-game-manager-plan.md
6. **TypeScript** - Clean build, no errors

### Current Branch Status
- **Branch:** GPS2-10
- **Prerequisites:** All Phase 2 requirements met
- **Ready:** Yes - can begin implementation immediately

## Tab Responsibilities & State Synchronization

### Game Controller Tab (Primary Control)
**Responsibilities:**
- **Start game sessions** - Select 1-2 guinea pigs from pet store and start game
- **End game sessions** - Return guinea pigs to store, apply penalties
- **Game state management** - Play, pause, resume, stop game
- **Active session monitoring** - View current session info and duration

**Cannot:**
- Generate or manage pet store inventory
- Edit individual guinea pig attributes directly

### Pet Store Tab (Monitoring & Editing)
**Responsibilities:**
- **Pet store management** - Generate, refresh, clear guinea pig pool
- **Guinea pig monitoring** - View all 10 guinea pigs and their states
- **Attribute editing** - Click guinea pig cards to edit name, colors, preferences, needs
- **State synchronization** - See real-time updates when guinea pigs are in active sessions

**Cannot:**
- Start or end game sessions
- Select guinea pigs for gameplay

### Shared State (Synchronized Across Tabs)
Both tabs access the **same guinea pig pool** via PetStoreManager store:
- Guinea pig pool (10 guinea pigs) persists across both tabs
- Active session state visible in both tabs
- When a guinea pig enters a session in Game Controller, its status badge updates in Pet Store tab
- When guinea pig attributes are edited in Pet Store tab, changes reflect immediately in Game Controller
- All changes saved to localStorage via Pinia persistence

### Example Workflow
1. **Pet Store Tab**: Generate 10 random guinea pigs
2. **Game Controller Tab**: See all 10 guinea pigs available, select 2, start game
3. **Pet Store Tab**: See those 2 guinea pigs now show "In Session" badge
4. **Pet Store Tab**: Click one of the in-session guinea pigs to edit its name
5. **Game Controller Tab**: See updated name immediately in active session display
6. **Game Controller Tab**: End game session
7. **Pet Store Tab**: See those 2 guinea pigs return to "In Store" status

## ✅ Implementation Completed

### Phase 1: Core Store Implementation ✅

#### 1.1 ✅ Create PetStoreManager Store

**File:** `src/stores/petStoreManager.ts` ✅ **COMPLETED**

**Responsibilities:** ✅ **ALL IMPLEMENTED**
- ✅ Manage 10-guinea pig pet store inventory
- ✅ Handle game session lifecycle (start/end)
- ✅ Implement cooldown system for pet store refresh
- ✅ Apply end game penalties
- ✅ Persist state across page refreshes
- ✅ Auto-start game when session begins
- ✅ Reset game state on new session
- ✅ Add guinea pigs to collection before setting active

**Key Interfaces:**
```typescript
interface PetStoreState {
  // Pet store inventory (always 10 guinea pigs)
  availableGuineaPigs: GuineaPig[]

  // Cooldown management
  lastRefreshTimestamp: number
  refreshCooldownMs: number // Default: 3600000 (1 hour)

  // Active game session
  activeGameSession: GameSession | null

  // Settings
  settings: {
    endGamePenalty: number      // Default: 50
    allowUnlimitedRefresh: boolean // Default: false (debug mode)
  }
}

interface GameSession {
  id: string
  startedAt: number
  guineaPigIds: string[]    // 1-2 guinea pig IDs
  sessionDuration: number   // Tracked play time in milliseconds
}
```

**Key Methods:**
- `generateRandomGuineaPigs(count: 10)` - Creates 10 random guinea pigs with hidden preferences
- `refreshPetStore()` - Replaces all 10 guinea pigs (checks cooldown unless unlimited refresh enabled)
- `startGameSession(guineaPigIds: string[])` - Creates active game session with 1-2 guinea pigs
- `endGameSession()` - Returns guinea pigs to store, resets needs, applies penalty
- `clearPetStore()` - Debug utility to empty pet store

**Computed Properties:**
- `canRefreshPetStore` - True if cooldown expired or unlimited refresh enabled
- `remainingCooldownMs` - Milliseconds remaining on cooldown (0 if can refresh)
- `activeSessionGuineaPigs` - Array of guinea pigs currently in session
- `formattedCooldown` - Human-readable cooldown time (HH:MM:SS)

**Pinia Configuration:**
```typescript
{
  persist: {
    key: 'gps2-pet-store-manager',
    storage: localStorage
  }
}
```

#### 1.2 Create PlayerProgression Store

**File:** `src/stores/playerProgression.ts`

**Responsibilities:**
- Track currency across game sessions (persistent)
- Manage player statistics (sessions, play time, adoptions)
- Track owned items (skeleton for Phase 3)
- Track consumable inventory (skeleton for Phase 3)
- Track achievements (skeleton for Phase 5)

**Key Interface:**
```typescript
interface PlayerProgression {
  // Currency (persists across sessions)
  currency: number
  totalCurrencyEarned: number

  // Non-consumable inventory (persists - Phase 3)
  ownedItems: Record<string, OwnedItem>

  // Consumable inventory (persists unused quantities - Phase 3)
  consumables: Record<string, number> // itemId -> quantity

  // Statistics
  totalGameSessions: number
  totalPlayTime: number          // Milliseconds
  guineaPigsAdopted: number

  // Achievements (persist - Phase 5)
  unlockedAchievements: string[]
}

interface OwnedItem {
  itemId: string
  purchasedAt: number
  timesUsed: number
}
```

**Key Methods:**
- `updateCurrency(amount: number)` - Add currency (can be negative for deductions)
- `deductCurrency(amount: number, reason: string)` - Explicit deduction with logging
- `incrementGameSessions()` - Increment session counter
- `addPlayTime(milliseconds: number)` - Add to total play time
- `incrementGuineaPigsAdopted()` - Increment adoption counter
- `resetProgression()` - Debug utility to reset all progression (confirmation required)

**Computed Properties:**
- `formattedCurrency` - Currency with formatting (e.g., "$1,234")
- `formattedPlayTime` - Play time in hours:minutes:seconds

**Pinia Configuration:**
```typescript
{
  persist: {
    key: 'gps2-player-progression',
    storage: localStorage
    // All properties persist by default
  }
}
```

#### 1.3 Update Guinea Pig Store

**File:** `src/stores/guineaPigStore.ts`

**New Methods:**
- `resetGuineaPigNeeds(id: string)` - Reset specific guinea pig's needs to default values
- `returnToStore(id: string)` - Mark guinea pig as returned to store (if needed for metadata)

**Integration:**
- Coordinate active guinea pigs with PetStoreManager
- No breaking changes to existing functionality
- Maintain existing persistence configuration

### Phase 2: Debug Panel Component ✅

#### 2.1 ✅ Create PetStoreDebug Component

**File:** `src/components/debug/PetStoreDebug.vue` ✅ **COMPLETED**

**Purpose:** ✅ **IMPLEMENTED** - Guinea pig editor with settings panel and mobile-first responsive design.

**Component Structure:** (Following GuineaPigCreationDebug.vue pattern)

**Panel 1: Pet Store Test Controls**
```html
<div class="panel panel--primary">
  <div class="panel__header">
    <h3>Pet Store Management</h3>
  </div>
  <div class="panel__content">
    <!-- Pet Store Generation Only -->
    <Button @click="generatePetStore">🏪 Generate 10 Guinea Pigs</Button>
    <Button @click="forceRefreshPetStore">🔄 Force Refresh (Bypass Cooldown)</Button>

    <div class="panel__note">
      ℹ️ Note: Start game sessions from Game Controller tab
    </div>
  </div>
</div>
```

**Panel 2: Pet Store State Display**
```html
<div class="panel panel--secondary">
  <div class="panel__header">
    <h3>Pet Store State</h3>
  </div>
  <div class="panel__content">
    <!-- Store Status -->
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Store Status:</span>
        <span class="stat-value">{{ storeStatus }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Available Guinea Pigs:</span>
        <span class="stat-value">{{ availableCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Can Refresh:</span>
        <span class="stat-value">{{ canRefresh ? 'Yes' : 'No' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Cooldown Remaining:</span>
        <span class="stat-value">{{ cooldownDisplay }}</span>
      </div>
    </div>

    <!-- Active Session Info (if exists) -->
    <div v-if="hasActiveSession" class="panel panel--compact">
      <div class="panel__header">
        <h4>Active Game Session</h4>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Session ID:</span>
            <span class="stat-value">{{ sessionId }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Started At:</span>
            <span class="stat-value">{{ sessionStartTime }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">{{ sessionDuration }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Guinea Pigs:</span>
            <span class="stat-value">{{ sessionGuineaPigNames }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Panel 3: Guinea Pigs Grid (Read-Only + Edit)**
```html
<div class="panel panel--muted">
  <div class="panel__header">
    <h3>Pet Store Guinea Pigs (10)</h3>
    <span class="panel__subtitle">View and edit attributes • States sync with Game Controller</span>
  </div>
  <div class="panel__content">
    <div class="guinea-pig-grid">
      <div
        v-for="gp in petStore.availableGuineaPigs"
        :key="gp.id"
        class="guinea-pig-card"
        :class="{
          'guinea-pig-card--in-session': isInActiveSession(gp.id),
          'guinea-pig-card--in-store': !isInActiveSession(gp.id)
        }"
        @click="openEditModal(gp)"
      >
        <div class="guinea-pig-card__emoji">{{ gp.emoji }}</div>
        <div class="guinea-pig-card__name">{{ gp.name }}</div>
        <div class="guinea-pig-card__info">
          {{ gp.breed }} • {{ gp.gender }}
        </div>
        <div class="guinea-pig-card__colors">
          {{ gp.furColor }} • {{ gp.furPattern }}
        </div>
        <div class="guinea-pig-card__age">{{ calculateAge(gp.birthDate) }} days old</div>
        <div
          class="guinea-pig-card__status"
          :class="getStatusClass(gp.id)"
        >
          {{ getStatus(gp.id) }}
        </div>
      </div>
    </div>

    <div class="panel__note">
      💡 Click a guinea pig card to view/edit attributes
    </div>
  </div>
</div>
```

**Panel 4: Player Progression Display**
```html
<div class="panel panel--secondary">
  <div class="panel__header">
    <h3>Player Progression</h3>
  </div>
  <div class="panel__content">
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Currency:</span>
        <span class="stat-value">{{ formattedCurrency }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Earned:</span>
        <span class="stat-value">{{ formattedTotalEarned }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Game Sessions:</span>
        <span class="stat-value">{{ progression.totalGameSessions }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Play Time:</span>
        <span class="stat-value">{{ formattedPlayTime }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Guinea Pigs Adopted:</span>
        <span class="stat-value">{{ progression.guineaPigsAdopted }}</span>
      </div>
    </div>

    <!-- Manual Controls -->
    <div class="button-group">
      <Button @click="addCurrency(100)" size="sm">💰 Add $100</Button>
      <Button @click="deductCurrency(50)" size="sm">💸 Deduct $50</Button>
      <Button @click="resetProgression" variant="danger" size="sm">🔄 Reset Progression</Button>
    </div>
  </div>
</div>
```

**Panel 5: Settings & Overrides**
```html
<div class="panel panel--warning">
  <div class="panel__header">
    <h3>Debug Settings & Overrides</h3>
  </div>
  <div class="panel__content">
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Unlimited Refresh:</span>
        <label class="toggle">
          <input
            type="checkbox"
            v-model="petStore.settings.allowUnlimitedRefresh"
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="stat-item">
        <span class="stat-label">End Game Penalty:</span>
        <div class="number-control">
          <Button @click="adjustPenalty(-10)" size="sm">-</Button>
          <input
            type="number"
            v-model.number="petStore.settings.endGamePenalty"
            min="0"
            max="1000"
          />
          <Button @click="adjustPenalty(10)" size="sm">+</Button>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Refresh Cooldown:</span>
        <Select
          v-model="cooldownPreset"
          :options="cooldownOptions"
          @change="applyCooldownPreset"
        />
      </div>
    </div>

    <Button @click="resetToDefaults" variant="secondary">↩️ Reset to Defaults</Button>
  </div>
</div>
```

**Panel 6: Test Output Log**
```html
<div class="panel panel--debug">
  <div class="panel__header">
    <h3>Test Output Log</h3>
    <Button @click="clearTestLog" variant="tertiary" size="sm">🗑️ Clear</Button>
  </div>
  <div class="panel__content">
    <div class="test-log" ref="testLogContainer">
      <div
        v-for="(logEntry, index) in testLog"
        :key="index"
        class="test-log-entry"
        :class="`test-log-entry--${logEntry.type}`"
      >
        <span class="test-log-timestamp">{{ logEntry.timestamp }}</span>
        <span class="test-log-message">{{ logEntry.message }}</span>
      </div>
      <div v-if="testLog.length === 0" class="test-log-empty">
        No test output yet. Run some tests to see results here.
      </div>
    </div>
  </div>
</div>
```

**Component Script:**
```typescript
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { usePlayerProgression } from '../../stores/playerProgression'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useLoggingStore } from '../../stores/loggingStore'
import Button from '../basic/Button.vue'
import Select from '../basic/Select.vue'

// Store instances
const petStore = usePetStoreManager()
const progression = usePlayerProgression()
const guineaPigStore = useGuineaPigStore()
const loggingStore = useLoggingStore()

// Component state
const selectedGuineaPigIds = ref<string[]>([])
const testLog = ref<TestLogEntry[]>([])
const testLogContainer = ref<HTMLElement>()
const cooldownPreset = ref('1hour')

// Test log interface
interface TestLogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

// Computed properties
const hasActiveSession = computed(() => petStore.activeGameSession !== null)
const canRefresh = computed(() => petStore.canRefreshPetStore)
const cooldownDisplay = computed(() => petStore.formattedCooldown)
// ... more computed properties

// Methods
const generatePetStore = () => {
  petStore.generateRandomGuineaPigs()
  addToTestLog('Generated 10 random guinea pigs', 'success')
}

const forceRefreshPetStore = () => {
  const prevUnlimited = petStore.settings.allowUnlimitedRefresh
  petStore.settings.allowUnlimitedRefresh = true
  petStore.refreshPetStore()
  petStore.settings.allowUnlimitedRefresh = prevUnlimited
  addToTestLog('Force refreshed pet store (cooldown bypassed)', 'warning')
}

// ... more methods

// Utility functions
const addToTestLog = (message: string, type: TestLogEntry['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  testLog.value.push({ timestamp, message, type })

  nextTick(() => {
    if (testLogContainer.value) {
      testLogContainer.value.scrollTop = testLogContainer.value.scrollHeight
    }
  })
}

const calculateAge = (birthDate: number): number => {
  const now = Date.now()
  const ageMs = now - birthDate
  return Math.floor(ageMs / (1000 * 60 * 60 * 24))
}

// Initialize
onMounted(() => {
  addToTestLog('Pet Store Debug Panel initialized', 'info')
})
</script>
```

**Component Styles:**
- Reuse existing debug panel CSS patterns
- Add guinea-pig-grid layout (2 columns, responsive)
- Add guinea-pig-card styling with status badges (clickable cards)
- Add in-session vs in-store visual distinction
- Add number-control styling for penalty adjustments
- Reuse test-log styles from GuineaPigCreationDebug

#### 2.2 ✅ Update GameController Component

**File:** `src/components/debug/GameController.vue` ✅ **COMPLETED**

**Purpose:** ✅ **IMPLEMENTED** - Primary interface for starting/ending game sessions with pet store guinea pigs.

**Key Features Implemented:**
- ✅ Guinea pig selection with gender emoji indicators
- ✅ Session start/end functionality
- ✅ Auto-game start when session begins
- ✅ Game controls disabled when no active session
- ✅ Selection persistence after page refresh

**New Section: Pet Store Game Session Controls**

Add this panel AFTER the existing Game Controls panel:

```html
<div class="panel panel--primary">
  <div class="panel__header">
    <h3>Pet Store Game Session</h3>
  </div>
  <div class="panel__content">
    <!-- Active Session Display -->
    <div v-if="petStoreManager.activeGameSession" class="panel panel--compact">
      <div class="panel__header">
        <h4>Active Session</h4>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Session ID:</span>
            <span class="stat-value">{{ petStoreManager.activeGameSession.id }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Guinea Pigs:</span>
            <span class="stat-value">{{ activeSessionGuineaPigNames }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Started:</span>
            <span class="stat-value">{{ formatTimestamp(petStoreManager.activeGameSession.startedAt) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">{{ activeSessionDuration }}</span>
          </div>
        </div>

        <Button
          @click="endGameSession"
          variant="danger"
          :disabled="!petStoreManager.activeGameSession"
        >
          ⏹️ End Game Session
        </Button>
      </div>
    </div>

    <!-- Guinea Pig Selection (when no active session) -->
    <div v-else class="panel panel--compact">
      <div class="panel__header">
        <h4>Start New Game Session</h4>
      </div>
      <div class="panel__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Available Guinea Pigs:</span>
            <span class="stat-value">{{ petStoreManager.availableGuineaPigs.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Selected:</span>
            <span class="stat-value">{{ selectedGuineaPigIds.length }} / 2</span>
          </div>
        </div>

        <!-- Guinea Pig Selection Checkboxes -->
        <div class="guinea-pig-selection">
          <div
            v-for="gp in petStoreManager.availableGuineaPigs"
            :key="gp.id"
            class="guinea-pig-selection-item"
          >
            <label>
              <input
                type="checkbox"
                :value="gp.id"
                v-model="selectedGuineaPigIds"
                :disabled="selectedGuineaPigIds.length >= 2 && !selectedGuineaPigIds.includes(gp.id)"
              />
              {{ gp.emoji }} {{ gp.name }} ({{ gp.breed }}, {{ gp.gender }})
            </label>
          </div>
        </div>

        <div class="button-group">
          <Button
            @click="startGameSession"
            :disabled="selectedGuineaPigIds.length < 1 || selectedGuineaPigIds.length > 2"
          >
            ▶️ Start Game ({{ selectedGuineaPigIds.length }} selected)
          </Button>
          <Button
            @click="startRandomSession(1)"
            variant="secondary"
          >
            🎲 Start with 1 Random GP
          </Button>
          <Button
            @click="startRandomSession(2)"
            variant="secondary"
          >
            🎲 Start with 2 Random GPs
          </Button>
        </div>

        <div class="panel__note" v-if="petStoreManager.availableGuineaPigs.length === 0">
          ⚠️ No guinea pigs in pet store. Generate guinea pigs in Pet Store tab.
        </div>
      </div>
    </div>
  </div>
</div>
```

**Script additions:**
```typescript
import { usePetStoreManager } from '../../stores/petStoreManager'
import { usePlayerProgression } from '../../stores/playerProgression'

const petStoreManager = usePetStoreManager()
const playerProgression = usePlayerProgression()
const selectedGuineaPigIds = ref<string[]>([])

const activeSessionGuineaPigNames = computed(() => {
  if (!petStoreManager.activeGameSession) return ''
  return petStoreManager.activeSessionGuineaPigs
    .map(gp => gp.name)
    .join(' & ')
})

const activeSessionDuration = computed(() => {
  // Live counter that updates every second
  // Format as HH:MM:SS
})

const startGameSession = () => {
  if (selectedGuineaPigIds.value.length < 1 || selectedGuineaPigIds.value.length > 2) {
    return
  }

  petStoreManager.startGameSession(selectedGuineaPigIds.value)
  selectedGuineaPigIds.value = []

  loggingStore.addPlayerAction(
    `Started game session with ${activeSessionGuineaPigNames.value}`,
    '▶️',
    { guineaPigIds: petStoreManager.activeGameSession!.guineaPigIds }
  )
}

const startRandomSession = (count: 1 | 2) => {
  const available = petStoreManager.availableGuineaPigs
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count).map(gp => gp.id)

  petStoreManager.startGameSession(selected)

  loggingStore.addPlayerAction(
    `Started random game session with ${count} guinea pig(s)`,
    '🎲',
    { guineaPigIds: selected }
  )
}

const endGameSession = () => {
  if (!petStoreManager.activeGameSession) return

  const penalty = petStoreManager.settings.endGamePenalty

  // Confirmation dialog would be nice
  if (confirm(`End game session? Penalty: $${penalty}`)) {
    petStoreManager.endGameSession()

    loggingStore.addPlayerAction(
      'Ended game session',
      '⏹️',
      { penalty }
    )
  }
}
```

### Phase 3: Integration & Views

#### 3.1 Create PetStoreDebugView

**File:** `src/views/PetStoreDebugView.vue`

Simple wrapper component following existing pattern:
```vue
<template>
  <div class="pet-store-debug-view">
    <PetStoreDebug />
  </div>
</template>

<script setup lang="ts">
import PetStoreDebug from '../components/debug/PetStoreDebug.vue'
</script>

<style>
.pet-store-debug-view {
  padding: var(--space-6);
}

@media (max-width: 768px) {
  .pet-store-debug-view {
    padding: var(--space-4);
  }
}
</style>
```

#### 3.2 Update DebugView

**File:** `src/views/DebugView.vue`

Add pet store tab to existing debug interface:
```typescript
// Add to debugTabs array
const debugTabs: Tab[] = [
  {
    id: 'controller',
    label: 'Game Controller',
    icon: '🎮',
  },
  {
    id: 'logging',
    label: 'Logging System',
    icon: '📝',
  },
  {
    id: 'error-tracking',
    label: 'Error Tracking',
    icon: '🐛',
  },
  {
    id: 'pet-store',     // NEW
    label: 'Pet Store',  // NEW
    icon: '🏪',          // NEW
  }
]
```

Add template slot:
```vue
<template #pet-store>
  <PetStoreDebugView />
</template>
```

Add import:
```typescript
import PetStoreDebugView from './PetStoreDebugView.vue'
```

#### 3.3 Initialize Stores in App

**File:** `src/App.vue`

Add store initialization in onMounted hook:
```typescript
import { usePetStoreManager } from './stores/petStoreManager'
import { usePlayerProgression } from './stores/playerProgression'

onMounted(async () => {
  // ... existing initialization

  // Initialize pet store manager
  const petStoreManager = usePetStoreManager()
  petStoreManager.initializeStore()

  // Initialize player progression
  const playerProgression = usePlayerProgression()
  playerProgression.initializeStore()

  // ... rest of initialization
})
```

### Phase 4: Utility Functions

#### 4.1 Random Generation Utilities

Create helper functions for pet store generation (can be in PetStoreManager store):

```typescript
// Random name generator
const guineaPigNames = [
  // Food-themed names
  'Peanut', 'Oreo', 'Cocoa', 'Ginger', 'Butterscotch', 'Cinnamon',
  'Pepper', 'Sugar', 'Honey', 'Mocha', 'Caramel', 'Biscuit',
  'Mochi', 'Truffle', 'Cookie', 'Marshmallow', 'Nugget', 'Pickles',
  'Snickers', 'Waffles', 'Toffee', 'Pudding', 'Brownie', 'Cupcake',
  'Popcorn', 'Nacho', 'Cheddar', 'Olive', 'Peaches', 'Pumpkin',

  // Appearance-themed names
  'Patches', 'Whiskers', 'Fuzzy', 'Squeaky', 'Nibbles', 'Buttons',
  'Snowball', 'Shadow', 'Midnight', 'Dusty', 'Rusty', 'Smokey',
  'Spot', 'Freckles', 'Marble', 'Speckles', 'Domino', 'Checkers',

  // Personality-themed names
  'Bubbles', 'Happy', 'Lucky', 'Sunny', 'Joy', 'Sparkle',
  'Zippy', 'Dash', 'Rocket', 'Turbo', 'Flash', 'Zoom',
  'Cuddles', 'Snuggle', 'Buddy', 'Angel', 'Princess', 'Prince',

  // Nature-themed names
  'Clover', 'Daisy', 'Poppy', 'Rose', 'Lily', 'Willow',
  'Hazel', 'Maple', 'Cedar', 'Fern', 'Sage', 'Basil'
]

function randomName(): string {
  return guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)]
}

// Random breed selector
const breeds = [
  'American', 'Abyssinian', 'Peruvian', 'Silkie',
  'Teddy', 'Rex', 'Texel', 'Coronet'
]

function randomBreed(): string {
  return breeds[Math.floor(Math.random() * breeds.length)]
}

// Random gender selector
function randomGender(): 'sow' | 'boar' {
  return Math.random() > 0.5 ? 'sow' : 'boar'
}

// Random fur color selector
const furColors = [
  // Solid colors
  'white', 'black', 'brown', 'cream', 'orange', 'gray',
  'red', 'gold', 'beige', 'chocolate', 'lilac', 'buff',

  // Multi-color patterns (these are color names, not patterns - always use "self" pattern)
  'tortoiseshell',  // Patches of red/black/cream
  'tricolor',       // Three colors mixed (tortoiseshell + white)
  'dalmatian'       // White with dark spots
]

function randomFurColor(): string {
  return furColors[Math.floor(Math.random() * furColors.length)]
}

// Random fur pattern selector
const furPatterns = [
  'self',           // No pattern overlay (solid color or multi-color as-is)
  'agouti',         // Banded hairs creating ticked appearance
  'dutch',          // White blaze on face, white saddle on body
  'brindle',        // Mixed dark and light hairs creating striped effect
  'roan',           // White hairs mixed with colored hairs
  'satin',          // Shiny, reflective coat
  'himalayan',      // White/cream body with colored points (nose, ears, feet)
  'broken',         // Large patches of color on white background
  'pied',           // Irregular colored patches on white
  'magpie'          // Black and white markings
]

function randomFurPattern(): string {
  return furPatterns[Math.floor(Math.random() * furPatterns.length)]
}

// Logic: When generating a guinea pig
// - If furColor is 'tortoiseshell', 'tricolor', or 'dalmatian' → force furPattern to 'self'
// - Otherwise, use any random furPattern

// Random emoji selector
const guineaPigEmojis = ['🐹', '🐭', '🐁']

function randomEmoji(): string {
  return guineaPigEmojis[Math.floor(Math.random() * guineaPigEmojis.length)]
}

// Hidden preferences generator
function generateRandomPreferences(): GuineaPigPreferences {
  // Comprehensive preference generation
  // See save-game-manager-plan.md for full structure
}

// Age calculator
function calculateAge(birthDate: number): number {
  const now = Date.now()
  const ageMs = now - birthDate
  return Math.floor(ageMs / (1000 * 60 * 60 * 24))
}
```

### Phase 5: Testing & Validation

#### 5.1 Manual Testing Checklist

**Pet Store Generation:**
- [ ] Generate 10 guinea pigs on first launch
- [ ] Each guinea pig has unique name, breed, gender
- [ ] All guinea pigs have hidden preferences generated
- [ ] Pet store persists across page refresh

**Game Session Management:**
- [ ] Start game with 1 random guinea pig
- [ ] Start game with 2 random guinea pigs
- [ ] Start game with manually selected guinea pigs (1-2)
- [ ] Cannot select more than 2 guinea pigs
- [ ] Session displays correct guinea pig names
- [ ] Session duration counter works
- [ ] Active session persists across page refresh

**End Game Flow:**
- [ ] End game returns guinea pigs to pet store
- [ ] End game penalty deducted from currency
- [ ] Guinea pig needs reset to default
- [ ] Session cleared correctly
- [ ] Can start new game after ending previous

**Pet Store Refresh:**
- [ ] Refresh button generates 10 new guinea pigs
- [ ] Cooldown enforced (1 hour default)
- [ ] Cooldown timer displays correctly (HH:MM:SS)
- [ ] Force refresh bypasses cooldown
- [ ] Unlimited refresh mode disables cooldown
- [ ] Cannot refresh during active session

**Player Progression:**
- [ ] Currency persists across sessions
- [ ] Penalty deducted correctly
- [ ] Add $100 button works
- [ ] Deduct $50 button works
- [ ] Statistics increment correctly (sessions, play time, adoptions)
- [ ] Reset progression clears all data (with confirmation)
- [ ] Progression persists across page refresh

**Settings & Overrides:**
- [ ] Toggle unlimited refresh works
- [ ] Adjust end game penalty works (+/- buttons)
- [ ] Cooldown preset selector works (1min, 5min, 1hour, 24hours)
- [ ] Reset to defaults restores original values

**Test Output Log:**
- [ ] All actions log to test output
- [ ] Timestamps display correctly
- [ ] Color coding works (info=blue, success=green, warning=orange, error=red)
- [ ] Auto-scroll to latest entry works
- [ ] Clear log button works

**UI & Responsiveness:**
- [ ] Guinea pig grid displays correctly (2 columns)
- [ ] Status badges show correct state (in store / in session)
- [ ] All panels display correctly on desktop
- [ ] All panels display correctly on tablet
- [ ] All panels display correctly on mobile
- [ ] Tab navigation works smoothly

**Cross-Tab State Synchronization:**
- [ ] Generate guinea pigs in Pet Store tab → See them in Game Controller tab
- [ ] Start session in Game Controller → Status updates in Pet Store tab
- [ ] Edit guinea pig name in Pet Store tab → Name updates in Game Controller active session
- [ ] Edit guinea pig attributes in Pet Store tab → Changes persist
- [ ] End session in Game Controller → Guinea pigs return to "In Store" in Pet Store tab
- [ ] Both tabs show same guinea pig count
- [ ] Both tabs show same active session info
- [ ] Refresh page → Both tabs restore correct state

#### 5.2 TypeScript Validation

**Build Check:**
```bash
npm run build
```

**Expected Results:**
- No TypeScript errors
- No interface mismatches
- All stores properly typed
- All components properly typed
- Clean compilation

**Common Issues to Watch:**
- GuineaPig interface compatibility
- GameSession interface consistency
- Proper typing for computed properties
- Event handler typing in components

## File Summary

### Files to Create (4 files)

1. **`src/stores/petStoreManager.ts`** (~350 lines)
   - Pet store state management
   - Game session lifecycle
   - Cooldown system
   - Random generation utilities

2. **`src/stores/playerProgression.ts`** (~200 lines)
   - Persistent currency management
   - Statistics tracking
   - Owned items & consumables (skeleton)
   - Achievements (skeleton)

3. **`src/components/debug/PetStoreDebug.vue`** (~700 lines)
   - 6-panel debug interface
   - Test controls
   - State display
   - Guinea pig grid
   - Settings overrides
   - Test output log

4. **`src/views/PetStoreDebugView.vue`** (~30 lines)
   - Simple wrapper component
   - Container styling

### Files to Modify (4 files)

1. **`src/components/debug/GameController.vue`** (or `src/views/GameControllerView.vue`)
   - Add Pet Store Game Session panel
   - Add guinea pig selection interface
   - Add start/end session controls
   - Import PetStoreManager and PlayerProgression stores
   - ~150 lines added

2. **`src/stores/guineaPigStore.ts`**
   - Add `resetGuineaPigNeeds(id)` method
   - Add `returnToStore(id)` method (if needed)
   - ~20 lines added

3. **`src/views/DebugView.vue`**
   - Add pet store tab to debugTabs array
   - Add template slot for pet store
   - Add import for PetStoreDebugView
   - ~15 lines added

4. **`src/App.vue`**
   - Add store imports
   - Initialize stores in onMounted
   - ~10 lines added

## Implementation Phases

- **Phase 1:** Core Stores (PetStoreManager, PlayerProgression, GuineaPigStore updates)
- **Phase 2:** Debug Components (PetStoreDebug, GameController integration)
- **Phase 3:** Views & Integration (PetStoreDebugView, DebugView updates, App initialization)
- **Phase 4:** Testing & Validation (Manual testing checklist, TypeScript validation)

## Expected Outcomes

### After Implementation

**Functional:**
- ✅ Fully functional pet store with 10 random guinea pigs
- ✅ Complete game session management (start/end flow)
- ✅ Persistent player progression across sessions
- ✅ Cooldown system with debug override
- ✅ Currency penalty system on game end
- ✅ All state persists correctly across page refreshes

**Debug Interface:**
- ✅ Comprehensive testing interface for all pet store features
- ✅ Visual display of pet store state and active sessions
- ✅ Manual controls for testing edge cases
- ✅ Settings overrides for development
- ✅ Test output log for tracking all operations

**Foundation Ready:**
- ✅ Ready for needs system development (Phase 2 continuation)
- ✅ Ready for habitat conditions implementation (Phase 2)
- ✅ Ready for game UI development (Phase 3)
- ✅ Architecture proven and tested via debug panel

## ✅ Success Criteria Met

### Core Functionality ✅
- ✅ Pet store generates 10 random guinea pigs
- ✅ Game sessions start/end correctly
- ✅ Currency penalty applied on end game
- ✅ Guinea pig needs reset on return to store
- ✅ Cooldown system works correctly
- ✅ All state persists across page refresh
- ✅ Auto-start game when session begins
- ✅ Game controls disabled when no active session
- ✅ Guinea pigs properly added to collection

### Debug Interface ✅
- ✅ Mobile-first responsive 3-panel layout
- ✅ Pet store settings with debug toggles
- ✅ Guinea pig list with selection UI
- ✅ Guinea pig editor with proper form controls
- ✅ Real-time guinea pig attribute editing
- ✅ Gender emoji indicators
- ✅ Proper guinea pig terminology (sow/boar)
- ✅ Form utility styles (checkbox-label, form-field-inline)

### Integration ✅
- ✅ GameController properly integrated
- ✅ PetStoreDebug component working
- ✅ Selection persistence across page refresh
- ✅ No TypeScript errors
- ✅ Clean build achieved
- ✅ All components use shared styles (panel.css, stats.css, forms.css)

## ✅ Completed Implementation Summary

### What Was Accomplished

**Core Pet Store System:**
- ✅ Pet store manager with 10 guinea pig generation
- ✅ Game session lifecycle (start/end with auto-game start)
- ✅ Cooldown system with debug override
- ✅ Currency penalty system
- ✅ Persistent state across page refreshes
- ✅ Guinea pig collection integration

**Debug Interface:**
- ✅ Mobile-first responsive 3-panel layout
- ✅ Pet store settings panel with debug controls
- ✅ Guinea pig selection and editing interface
- ✅ Real-time attribute editing with proper form controls
- ✅ Gender emoji indicators and proper terminology
- ✅ Selection persistence after page refresh

**Form System Enhancements:**
- ✅ Created reusable Slider component
- ✅ Added form utility styles (checkbox-label, form-field-inline)
- ✅ Integrated with existing panel/stats/forms CSS system

**Game Flow Improvements:**
- ✅ Auto-start game when session begins
- ✅ Game controls disabled when no active session
- ✅ Proper game state reset between sessions
- ✅ Guinea pig selection persistence

## Next Steps

**Ready for Phase 2 Continuation:**
1. **Needs System** - Core pet store foundation complete
2. **Habitat Conditions** - Session management proven
3. **Game UI Development** - Debug interface as reference
4. **Phase 3 Planning** - Architecture validated and ready

## Architecture Summary

### Two-Tab Testing Interface

**Game Controller Tab** (Primary game control):
- Select guinea pigs from pet store
- Start game sessions (1-2 guinea pigs)
- End game sessions (return to store + penalty)
- Monitor active session duration
- **No pet store management**

**Pet Store Tab** (Monitoring & editing):
- Generate/refresh/clear guinea pig pool
- View all 10 guinea pigs
- Edit guinea pig attributes (click cards)
- Monitor which guinea pigs are in sessions
- **No game session control**

### Shared Store Architecture
```
PetStoreManager Store (shared)
├── availableGuineaPigs: GuineaPig[10]
├── activeGameSession: GameSession | null
└── settings (penalties, cooldowns)

PlayerProgression Store (shared)
├── currency
├── statistics
└── achievements
```

Both tabs access the **same stores** via Pinia, ensuring:
- Real-time synchronization across tabs
- Single source of truth for all guinea pig data
- Immediate reflection of changes in both interfaces
- Consistent state across page refreshes

## Notes

- Debug panel provides complete testing capability before building game UI
- Two-tab architecture enables testing from both game control and data monitoring perspectives
- State synchronization validates Pinia reactivity across components
- Foundation for Phase 3 inventory and consumables system
- Statistics tracking ready for Phase 5 achievements
- Architecture proven through comprehensive debug testing

**Reference:** See `save-game-manager-plan.md` for complete pet store architecture details.