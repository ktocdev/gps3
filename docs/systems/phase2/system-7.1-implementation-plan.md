# Needs System Architecture - Implementation Plan

**Phase:** Phase 2 (Core Game Entities & Timing)
**Status:** 🔄 In Progress - Phase 1 Complete
**Prerequisites:** Pet Store & Game Session Manager (GPS2-11) ✅
**Created:** September 27, 2025

## Overview

Complete implementation plan for the 10-need guinea pig care system with weighted wellness calculation, friendship penalties, and integrated game timing. This plan breaks down the complex needs architecture into manageable implementation phases.

**Parent Documentation:**
- [Needs System Architecture](system-7-needs-system.md) - Complete system specification (includes happiness mechanics)
- [Needs Controller Store](system-8-needs-controller-store.md) - Controller architecture
- [Wellness System Design](../../game-design/wellness-system.md) - Game design philosophy

## Current State Assessment

### Prerequisites Met ✅
1. **Guinea Pig Store** - Core entity management with needs interface defined
2. **Pet Store Manager** - Game session lifecycle management complete
3. **Game Controller** - State management foundation ready
4. **Player Progression** - Currency and persistent state system ready
5. **Debug Framework** - Tab-based debug system for testing

### Existing Need Interface
```typescript
// Already defined in guineaPigStore.ts
export interface GuineaPigNeeds {
  hunger: number        // 0-100
  thirst: number        // 0-100
  happiness: number     // 0-100
  cleanliness: number   // 0-100
  health: number        // 0-100
  energy: number        // 0-100
  social: number        // 0-100
  nails: number         // 0-100
  chew: number          // 0-100
  shelter: number       // 0-100
}
```

### What's Missing
- ✅ Needs Controller Store for centralized processing (COMPLETED)
- ❌ Need decay logic and timing integration
- ✅ Wellness calculation system (COMPLETED)
- ✅ Friendship penalty mechanism (COMPLETED)
- ❌ Need satisfaction methods
- ❌ Needs debug panel
- ❌ Need-related UI components (future)

## Implementation Phases

### Phase 1: Needs Controller Store Foundation ✅ COMPLETED
**Duration:** 2-3 days (Completed September 27, 2025)
**Goal:** Create centralized needs processing system with wellness calculation

#### Tasks
1. **Create `src/stores/needsController.ts`**
   - Define `NeedsControllerState` interface
   - Implement Pinia store with composition API
   - Add persistence configuration (session-based)

2. **Implement Core State Management**
   ```typescript
   interface NeedsControllerState {
     // Wellness tracking (internal only)
     currentWellness: number
     wellnessHistory: number[]
     lastWellnessUpdate: number

     // Penalty system state
     isPenaltyActive: boolean
     currentPenaltyRate: number
     penaltyStartTime: number | null

     // Processing control
     lastBatchUpdate: number
     processingEnabled: boolean
     updateIntervalMs: number

     // Configuration
     wellnessThresholds: {
       penaltyThreshold: number      // 45%
       warningThreshold: number      // 50%
       recoveryThreshold: number     // 55%
       bonusThreshold: number        // 75%
     }

     penaltyRates: {
       severe: number    // < 25% wellness: -1.0/tick
       high: number      // 25-35%: -0.75/tick
       medium: number    // 35-45%: -0.5/tick
     }
   }
   ```

3. **Implement Weighted Wellness Calculation**
   ```typescript
   function calculateWellness(guineaPigId: string): number {
     const guineaPig = useGuineaPigStore().getGuineaPig(guineaPigId)
     if (!guineaPig) return 100

     const needs = guineaPig.needs

     // Calculate group averages
     const criticalPhysical = (needs.hunger + needs.thirst + needs.energy) / 3
     const externalEnvironment = (needs.social + needs.cleanliness + needs.shelter) / 3
     const maintenance = (needs.chew + needs.nails + needs.health) / 3
     const happiness = needs.happiness

     // Apply weights
     const wellness = (
       (criticalPhysical * 0.40) +
       (externalEnvironment * 0.25) +
       (maintenance * 0.20) +
       (happiness * 0.15)
     )

     return Math.max(0, Math.min(100, wellness))
   }
   ```

4. **Implement Friendship Penalty System**
   ```typescript
   function applyFriendshipPenalties(guineaPigId: string): void {
     const wellness = calculateWellness(guineaPigId)

     if (wellness < state.wellnessThresholds.penaltyThreshold) {
       const penaltyRate = getPenaltyRate(wellness)
       const guineaPigStore = useGuineaPigStore()

       // Apply penalty to friendship
       guineaPigStore.adjustFriendship(guineaPigId, penaltyRate)

       // Update penalty state
       state.isPenaltyActive = true
       state.currentPenaltyRate = penaltyRate

       if (!state.penaltyStartTime) {
         state.penaltyStartTime = Date.now()
       }
     } else if (wellness > state.wellnessThresholds.recoveryThreshold) {
       // Stop penalties
       state.isPenaltyActive = false
       state.currentPenaltyRate = 0
       state.penaltyStartTime = null

       // Apply bonus if wellness is high
       if (wellness > state.wellnessThresholds.bonusThreshold) {
         const guineaPigStore = useGuineaPigStore()
         guineaPigStore.adjustFriendship(guineaPigId, 0.2) // Small bonus
       }
     }
   }

   function getPenaltyRate(wellness: number): number {
     if (wellness < 25) return state.penaltyRates.severe
     if (wellness < 35) return state.penaltyRates.high
     return state.penaltyRates.medium
   }
   ```

5. **Add Batch Processing Method**
   ```typescript
   function processBatchUpdate(): void {
     if (!state.processingEnabled) return

     const guineaPigStore = useGuineaPigStore()
     const activeGuineaPigs = guineaPigStore.activeGuineaPigs

     activeGuineaPigs.forEach(gp => {
       // Calculate wellness
       const wellness = calculateWellness(gp.id)

       // Update wellness tracking
       state.currentWellness = wellness
       state.wellnessHistory.push(wellness)
       if (state.wellnessHistory.length > 100) {
         state.wellnessHistory.shift()
       }

       // Apply friendship penalties if needed
       applyFriendshipPenalties(gp.id)

       // Check thresholds and emit warnings
       checkThresholds(gp.id, wellness)
     })

     state.lastBatchUpdate = Date.now()
     state.lastWellnessUpdate = Date.now()
   }
   ```

#### Deliverables ✅ ALL COMPLETED
- ✅ Working Needs Controller Store (`src/stores/needsController.ts`)
- ✅ Weighted wellness calculation (40/25/20/15 distribution)
- ✅ Friendship penalty system (< 45% triggers penalties)
- ✅ Batch processing framework (5-second intervals)
- ✅ Threshold detection system (warning/penalty/bonus thresholds)
- ✅ Session-based persistence configuration
- ✅ Guinea Pig Store integration (friendship field added)

#### Testing
- Calculate wellness with various need combinations
- Verify weighted group calculations (40/25/20/15)
- Test penalty thresholds (< 45% triggers penalties)
- Verify penalty rates match wellness levels
- Test batch processing with multiple guinea pigs

---

### Phase 2: Need Decay System
**Duration:** 2-3 days
**Goal:** Implement time-based need decay with health-based modifiers

#### Tasks
1. **Define Need Decay Configuration**
   ```typescript
   interface NeedDecayConfig {
     needType: keyof GuineaPigNeeds
     baseDecayRate: number        // Points per hour
     criticalThreshold: number    // Below this = urgent
     healthModifier: number       // Multiplier when health is low
   }

   const needDecayConfigs: Record<string, NeedDecayConfig> = {
     hunger: {
       needType: 'hunger',
       baseDecayRate: 5.0,  // 5 points per hour
       criticalThreshold: 25,
       healthModifier: 1.1
     },
     thirst: {
       needType: 'thirst',
       baseDecayRate: 6.0,  // Faster than hunger
       criticalThreshold: 20,
       healthModifier: 1.15
     },
     energy: {
       needType: 'energy',
       baseDecayRate: 4.0,
       criticalThreshold: 25,
       healthModifier: 1.2
     },
     happiness: {
       needType: 'happiness',
       baseDecayRate: 3.0,  // Slower decay
       criticalThreshold: 30,
       healthModifier: 0.9
     },
     cleanliness: {
       needType: 'cleanliness',
       baseDecayRate: 2.5,
       criticalThreshold: 30,
       healthModifier: 1.0
     },
     social: {
       needType: 'social',
       baseDecayRate: 3.5,
       criticalThreshold: 30,
       healthModifier: 1.0
     },
     shelter: {
       needType: 'shelter',
       baseDecayRate: 2.0,
       criticalThreshold: 35,
       healthModifier: 1.0
     },
     nails: {
       needType: 'nails',
       baseDecayRate: 0.8,  // Very slow growth
       criticalThreshold: 25,
       healthModifier: 1.0
     },
     chew: {
       needType: 'chew',
       baseDecayRate: 3.0,
       criticalThreshold: 30,
       healthModifier: 1.0
     },
     health: {
       needType: 'health',
       baseDecayRate: 1.0,  // Very slow unless sick
       criticalThreshold: 40,
       healthModifier: 1.0
     }
   }
   ```

2. **Implement Decay Processing**
   ```typescript
   function processNeedDecay(guineaPigId: string, deltaTime: number): void {
     const guineaPigStore = useGuineaPigStore()
     const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
     if (!guineaPig) return

     // Process each need
     Object.entries(needDecayConfigs).forEach(([needType, config]) => {
       const currentValue = guineaPig.needs[needType as keyof GuineaPigNeeds]

       // Calculate decay for this time period
       const hoursPassed = deltaTime / (1000 * 60 * 60)
       let decay = config.baseDecayRate * hoursPassed

       // Apply health modifier if health is low
       if (guineaPig.needs.health < 50) {
         decay *= config.healthModifier
       }

       // Apply decay
       const newValue = Math.max(0, currentValue - decay)
       guineaPigStore.updateNeed(guineaPigId, needType as keyof GuineaPigNeeds, newValue)
     })
   }
   ```

3. **Add Need Interdependencies**
   ```typescript
   function processNeedInterdependencies(guineaPigId: string): void {
     const guineaPigStore = useGuineaPigStore()
     const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
     if (!guineaPig) return

     const needs = guineaPig.needs

     // Low health accelerates other need decay
     if (needs.health < 30) {
       const healthPenalty = 0.02 // 2% faster decay per tick
       Object.keys(needs).forEach(needType => {
         if (needType !== 'health') {
           const current = needs[needType as keyof GuineaPigNeeds]
           guineaPigStore.updateNeed(
             guineaPigId,
             needType as keyof GuineaPigNeeds,
             current - healthPenalty
           )
         }
       })
     }

     // Poor cleanliness affects health
     if (needs.cleanliness < 30) {
       const cleanlinessPenalty = 0.01
       guineaPigStore.updateNeed(guineaPigId, 'health', needs.health - cleanlinessPenalty)
     }

     // Low energy reduces interaction effectiveness
     // (handled in interaction system)

     // High happiness provides small resilience bonus
     if (needs.happiness > 80) {
       const happinessBonus = 0.005
       Object.keys(needs).forEach(needType => {
         if (needType !== 'happiness') {
           const current = needs[needType as keyof GuineaPigNeeds]
           guineaPigStore.updateNeed(
             guineaPigId,
             needType as keyof GuineaPigNeeds,
             Math.min(100, current + happinessBonus)
           )
         }
       })
     }
   }
   ```

#### Deliverables
- ✅ Need decay configuration for all 10 needs
- ✅ Time-based decay processing
- ✅ Health-based decay modifiers
- ✅ Need interdependency system

#### Testing
- Test each need's decay rate over time
- Test health modifier impact on decay rates
- Test health impact on other needs
- Verify interdependencies (cleanliness → health)
- Test critical threshold detection

---

### Phase 3: Guinea Pig Store Integration
**Duration:** 2-3 days
**Goal:** Integrate needs processing with guinea pig entity management

#### Tasks
1. **Add Need Manipulation Methods to Guinea Pig Store**
   ```typescript
   // In guineaPigStore.ts

   function updateNeed(
     guineaPigId: string,
     needType: keyof GuineaPigNeeds,
     value: number
   ): void {
     const gp = collection.value.guineaPigs[guineaPigId]
     if (!gp) return

     const oldValue = gp.needs[needType]
     gp.needs[needType] = Math.max(0, Math.min(100, value))
     collection.value.lastUpdated = Date.now()

     // Log significant changes
     if (Math.abs(oldValue - value) > 5) {
       getLoggingStore().logActivity({
         category: 'needs',
         action: 'need_changed',
         details: {
           guineaPigId,
           needType,
           oldValue,
           newValue: gp.needs[needType],
           change: gp.needs[needType] - oldValue
         }
       })
     }
   }

   function satisfyNeed(
     guineaPigId: string,
     needType: keyof GuineaPigNeeds,
     amount: number
   ): boolean {
     const gp = collection.value.guineaPigs[guineaPigId]
     if (!gp) return false

     const oldValue = gp.needs[needType]
     const newValue = Math.min(100, oldValue + amount)
     updateNeed(guineaPigId, needType, newValue)

     getLoggingStore().logActivity({
       category: 'needs',
       action: 'need_satisfied',
       details: {
         guineaPigId,
         needType,
         amount,
         newValue
       }
     })

     return true
   }

   function adjustFriendship(guineaPigId: string, amount: number): void {
     const gp = collection.value.guineaPigs[guineaPigId]
     if (!gp) return

     // Assuming friendship is part of stats or a new field
     const oldFriendship = gp.stats.overallMood // Or add friendship field
     const newFriendship = Math.max(0, Math.min(100, oldFriendship + amount))

     gp.stats.overallMood = newFriendship
     collection.value.lastUpdated = Date.now()

     if (amount < 0) {
       getLoggingStore().logActivity({
         category: 'relationship',
         action: 'friendship_penalty',
         details: {
           guineaPigId,
           penalty: amount,
           newFriendship
         }
       })
     }
   }

   function resetNeeds(guineaPigId: string): void {
     const gp = collection.value.guineaPigs[guineaPigId]
     if (!gp) return

     // Reset all needs to optimal starting values
     gp.needs = {
       hunger: 80,
       thirst: 80,
       happiness: 70,
       cleanliness: 90,
       health: 100,
       energy: 80,
       social: 70,
       nails: 100,
       chew: 80,
       shelter: 80
     }

     collection.value.lastUpdated = Date.now()
   }
   ```

2. **Add Friendship Field to Guinea Pig Entity**
   ```typescript
   // Update GuineaPig interface
   export interface GuineaPig {
     // ... existing fields
     friendship: number  // 0-100: Relationship with player
     // ... rest of fields
   }

   // Update default creation to include friendship
   ```

3. **Connect Needs Controller to Guinea Pig Store**
   ```typescript
   // In needsController.ts

   function processGameTick(deltaTime: number): void {
     if (!state.processingEnabled) return

     const guineaPigStore = useGuineaPigStore()
     const activeGuineaPigs = guineaPigStore.activeGuineaPigs

     activeGuineaPigs.forEach(gp => {
       // Process need decay
       processNeedDecay(gp.id, deltaTime)

       // Process interdependencies
       processNeedInterdependencies(gp.id)

       // Calculate wellness and apply penalties
       processBatchUpdate()
     })
   }
   ```

#### Deliverables
- ✅ Need manipulation methods in Guinea Pig Store
- ✅ Friendship tracking field added
- ✅ Integration between stores
- ✅ Activity logging for need changes

#### Testing
- Test updating individual needs
- Test satisfying needs with various amounts
- Test friendship adjustments
- Verify activity logging works
- Test need reset functionality

---

### Phase 4: Game Timing Integration
**Duration:** 2-3 days
**Goal:** Connect needs processing to game loop with proper timing

#### Tasks
1. **Add Timing Support to Game Controller**
   ```typescript
   // In gameController.ts

   interface GameControllerState {
     // ... existing fields
     gameTickIntervalId: number | null
     gameTickIntervalMs: number  // Default: 5000 (5 seconds)
     lastGameTick: number
   }

   function startGameLoop(): void {
     if (state.gameTickIntervalId) return

     state.gameTickIntervalId = setInterval(() => {
       if (state.currentState === 'playing') {
         const now = Date.now()
         const deltaTime = now - state.lastGameTick

         // Process game tick
         processGameTick(deltaTime)

         state.lastGameTick = now
       }
     }, state.gameTickIntervalMs)

     state.lastGameTick = Date.now()
   }

   function stopGameLoop(): void {
     if (state.gameTickIntervalId) {
       clearInterval(state.gameTickIntervalId)
       state.gameTickIntervalId = null
     }
   }

   function processGameTick(deltaTime: number): void {
     // Delegate to needs controller
     const needsController = useNeedsController()
     needsController.processGameTick(deltaTime)

     // Other game systems will be added here later
   }
   ```

2. **Implement Pause/Resume for Needs**
   ```typescript
   // In needsController.ts

   function pauseProcessing(): void {
     state.processingEnabled = false

     getLoggingStore().logActivity({
       category: 'system',
       action: 'needs_processing_paused',
       details: { timestamp: Date.now() }
     })
   }

   function resumeProcessing(): void {
     state.processingEnabled = true
     state.lastBatchUpdate = Date.now()

     getLoggingStore().logActivity({
       category: 'system',
       action: 'needs_processing_resumed',
       details: { timestamp: Date.now() }
     })
   }
   ```

3. **Connect to Game State Changes**
   ```typescript
   // In gameController.ts

   function startGame(): void {
     state.currentState = 'playing'
     startGameLoop()

     const needsController = useNeedsController()
     needsController.resumeProcessing()
   }

   function pauseGame(reason: PauseReason): void {
     state.currentState = 'paused'
     state.pauseReason = reason

     const needsController = useNeedsController()
     needsController.pauseProcessing()
   }

   function stopGame(): void {
     state.currentState = 'stopped'
     stopGameLoop()

     const needsController = useNeedsController()
     needsController.pauseProcessing()
   }
   ```

4. **Add Configurable Tick Rate**
   ```typescript
   // In needsController.ts

   function setTickRate(intervalMs: number): void {
     const gameController = useGameController()
     gameController.setGameTickInterval(intervalMs)

     getLoggingStore().logActivity({
       category: 'system',
       action: 'tick_rate_changed',
       details: { intervalMs }
     })
   }
   ```

#### Deliverables
- ✅ Game loop with configurable tick rate
- ✅ Pause/resume functionality
- ✅ Integration with game state changes
- ✅ Delta time-based processing

#### Testing
- Test game loop starts on game start
- Test pause stops need processing
- Test resume restarts processing
- Verify delta time calculations
- Test different tick rates

---

### Phase 5: Needs Debug Panel
**Duration:** 2-3 days
**Goal:** Create comprehensive debug interface for needs system testing

#### Tasks
1. **Create `src/components/debug/NeedsDebugPanel.vue`**
   ```vue
   <template>
     <div class="needs-debug-panel">
       <h3>Needs System Debug</h3>

       <!-- Guinea Pig Selection -->
       <div class="debug-section">
         <label>Active Guinea Pig:</label>
         <select v-model="selectedGuineaPigId">
           <option v-for="gp in activeGuineaPigs" :key="gp.id" :value="gp.id">
             {{ gp.name }} ({{ gp.id }})
           </option>
         </select>
       </div>

       <!-- Wellness Display -->
       <div v-if="selectedGuineaPig" class="debug-section">
         <h4>Wellness Calculation</h4>
         <div class="wellness-info">
           <div class="wellness-value">
             Overall Wellness: <strong>{{ wellness.toFixed(1) }}%</strong>
           </div>
           <div class="wellness-breakdown">
             <div>Critical Physical (40%): {{ criticalPhysical.toFixed(1) }}</div>
             <div>External Environment (25%): {{ externalEnvironment.toFixed(1) }}</div>
             <div>Maintenance (20%): {{ maintenance.toFixed(1) }}</div>
             <div>Happiness (15%): {{ happiness.toFixed(1) }}</div>
           </div>
           <div class="penalty-status" :class="penaltyClass">
             {{ penaltyStatus }}
           </div>
         </div>
       </div>

       <!-- Need Sliders -->
       <div v-if="selectedGuineaPig" class="debug-section">
         <h4>Need Values (0 = satisfied, 100 = critical)</h4>
         <div v-for="(value, needType) in selectedGuineaPig.needs"
              :key="needType"
              class="need-control">
           <label>{{ formatNeedName(needType) }}:</label>
           <input
             type="range"
             min="0"
             max="100"
             :value="value"
             @input="updateNeed(needType, $event.target.value)"
           />
           <span class="need-value">{{ value.toFixed(0) }}</span>
           <button @click="satisfyNeed(needType, 20)">+20</button>
           <button @click="satisfyNeed(needType, -20)">-20</button>
         </div>
       </div>

       <!-- Quick Actions -->
       <div class="debug-section">
         <h4>Quick Actions</h4>
         <button @click="setAllNeeds(100)">Set All Needs to 100 (Critical)</button>
         <button @click="setAllNeeds(50)">Set All Needs to 50 (Moderate)</button>
         <button @click="setAllNeeds(0)">Set All Needs to 0 (Satisfied)</button>
         <button @click="resetAllNeeds()">Reset to Defaults</button>
       </div>

       <!-- Processing Controls -->
       <div class="debug-section">
         <h4>Processing Controls</h4>
         <div class="processing-info">
           <div>Processing Enabled: {{ processingEnabled ? 'Yes' : 'No' }}</div>
           <div>Last Update: {{ timeSinceLastUpdate }}s ago</div>
           <div>Tick Rate: {{ tickRate }}ms</div>
         </div>
         <button @click="toggleProcessing()">
           {{ processingEnabled ? 'Pause' : 'Resume' }} Processing
         </button>
         <button @click="forceUpdate()">Force Update Now</button>
       </div>

       <!-- Threshold Testing -->
       <div class="debug-section">
         <h4>Threshold Testing</h4>
         <button @click="testPenaltyThreshold()">Test Penalty Threshold (< 45%)</button>
         <button @click="testWarningThreshold()">Test Warning Threshold (< 50%)</button>
         <button @click="testBonusThreshold()">Test Bonus Threshold (> 75%)</button>
       </div>

       <!-- Wellness History Chart -->
       <div class="debug-section">
         <h4>Wellness History</h4>
         <canvas ref="wellnessChart" width="400" height="200"></canvas>
       </div>
     </div>
   </template>

   <script setup lang="ts">
   import { ref, computed, watch } from 'vue'
   import { useGuineaPigStore } from '@/stores/guineaPigStore'
   import { useNeedsController } from '@/stores/needsController'

   const guineaPigStore = useGuineaPigStore()
   const needsController = useNeedsController()

   const selectedGuineaPigId = ref<string | null>(null)
   const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)

   const selectedGuineaPig = computed(() => {
     if (!selectedGuineaPigId.value) return null
     return guineaPigStore.getGuineaPig(selectedGuineaPigId.value)
   })

   const wellness = computed(() => {
     if (!selectedGuineaPigId.value) return 0
     return needsController.calculateWellness(selectedGuineaPigId.value)
   })

   // ... implementation details
   </script>
   ```

2. **Add Debug Panel to DebugView**
   ```vue
   <!-- In DebugView.vue -->
   <NeedsDebugPanel v-if="activeTab === 'needs'" />
   ```

3. **Add Performance Monitoring**
   ```typescript
   // In needsController.ts

   interface PerformanceMetrics {
     averageProcessingTime: number
     lastProcessingTime: number
     totalUpdates: number
     updatesPerSecond: number
   }

   function trackPerformance(processingTime: number): void {
     // Track metrics for debug display
   }
   ```

#### Deliverables
- ✅ Complete needs debug panel component
- ✅ Visual wellness calculation breakdown
- ✅ Individual need manipulation controls
- ✅ Processing controls (pause/resume/force update)
- ✅ Threshold testing tools
- ✅ Wellness history visualization
- ✅ Performance metrics display

#### Testing
- Test all need manipulation controls
- Verify wellness calculation display
- Test threshold detection visually
- Verify processing controls work
- Test quick action buttons

---

### Phase 6: Need Satisfaction Methods (Future Integration)
**Duration:** 1-2 days (after interaction system exists)
**Goal:** Connect need satisfaction to player interactions

#### Tasks
1. **Define Need Satisfaction Interface**
   ```typescript
   interface NeedSatisfactionMethod {
     needType: keyof GuineaPigNeeds
     interactionType: string
     baseSatisfaction: number
     preferenceBonus: number
     friendshipMultiplier: number
   }
   ```

2. **Implement Satisfaction Calculation**
   ```typescript
   function calculateSatisfaction(
     guineaPigId: string,
     method: NeedSatisfactionMethod
   ): number {
     const guineaPig = useGuineaPigStore().getGuineaPig(guineaPigId)
     if (!guineaPig) return 0

     let satisfaction = method.baseSatisfaction

     // Apply preference bonus if applicable
     // (requires preferences system integration)

     // Apply friendship multiplier
     const friendshipBonus = (guineaPig.friendship / 100) * method.friendshipMultiplier
     satisfaction *= (1 + friendshipBonus)

     return satisfaction
   }
   ```

3. **Create Need Satisfaction Methods**
   - Food items → hunger, thirst
   - Interactions → happiness, social
   - Cleaning → cleanliness
   - Veterinary care → health
   - Rest/sleep → energy
   - Nail clipping → nails
   - Chew items → chew
   - Shelter usage → shelter

#### Deliverables
- ✅ Need satisfaction interface
- ✅ Satisfaction calculation with bonuses
- ✅ Integration points for interaction system
- ✅ Preference system hooks (future)

---

## Technical Requirements

### Performance Considerations
- **Batch processing**: Update all needs simultaneously in single pass
- **Throttled updates**: Game tick at 5-second intervals (adjustable)
- **Efficient calculations**: Cache wellness calculations between ticks
- **Memory management**: Limit wellness history to 100 entries

### State Management
- **Session persistence**: Needs reset when game ends (part of session state)
- **Real-time reactivity**: Needs update immediately visible in UI
- **Store isolation**: Needs Controller doesn't directly modify Guinea Pig Store
- **Event-driven**: Use store event bus for cross-store communication

### Error Handling
- **Graceful degradation**: If needs processing fails, continue game
- **Validation**: Clamp all need values to 0-100 range
- **Null safety**: Check guinea pig exists before processing
- **Recovery**: Automatic resume after errors with logging

## Integration Points

### Existing Systems
- **Guinea Pig Store**: Entity management and state
- **Pet Store Manager**: Game session lifecycle
- **Game Controller**: Game loop and state management
- **Logging Store**: Activity tracking
- **Player Progression**: Currency for purchasing need satisfaction items (future)

### Future Systems (Phase 3-4)
- **Inventory System**: Items for satisfying needs
- **Interaction System**: Direct player interactions affecting needs
- **Habitat System**: Environmental conditions affecting needs
- **Autonomy System**: Guinea pig AI responding to needs

## Success Criteria

### Phase 1 Success ✅ COMPLETED
- [x] Needs Controller Store created and persisted
- [x] Wellness calculation produces correct weighted values
- [x] Friendship penalties apply at < 45% wellness
- [x] Batch processing handles multiple guinea pigs
- [x] Threshold detection works for all levels

### Phase 2 Success
- [ ] All 10 needs decay at appropriate rates
- [ ] Age modifiers affect decay correctly
- [ ] Health impacts other needs when low
- [ ] Interdependencies work (cleanliness → health)
- [ ] Critical thresholds trigger correctly

### Phase 3 Success
- [ ] Guinea Pig Store methods work for all needs
- [ ] Friendship field tracks relationship
- [ ] Activity logging captures need changes
- [ ] Integration between stores is seamless

### Phase 4 Success
- [ ] Game loop processes needs every tick
- [ ] Pause/resume stops/starts processing
- [ ] Delta time calculations are accurate
- [ ] Different tick rates work correctly

### Phase 5 Success
- [ ] Debug panel displays all needs
- [ ] Wellness calculation visible and accurate
- [ ] Need manipulation controls work
- [ ] Processing controls function properly
- [ ] Performance metrics track correctly

### Overall System Success
- [ ] Needs decay naturally over time
- [ ] Wellness calculation reflects need priorities
- [ ] Friendship penalties apply appropriately
- [ ] System performs well with 2 guinea pigs
- [ ] Debug tools enable effective testing
- [ ] No memory leaks or performance issues
- [ ] All activity properly logged

## Testing Strategy

### Unit Testing
- Wellness calculation with various need combinations
- Penalty rate calculation at different wellness levels
- Need decay calculations with modifiers
- Interdependency calculations

### Integration Testing
- Game loop integration with needs processing
- Pause/resume functionality
- Multi-guinea pig processing
- Store communication and event flow

### Performance Testing
- Process 2 guinea pigs for extended period
- Monitor memory usage over time
- Verify batch processing efficiency
- Test with various tick rates

### Manual Testing
- Use debug panel to test all scenarios
- Verify UI responsiveness to need changes
- Test friendship penalty feedback
- Validate activity logging

## Known Limitations & Future Work

### Current Limitations
- No UI components for displaying needs (Phase 5 future work)
- No interaction system for satisfying needs (Phase 4)
- No habitat conditions integration (Phase 3)
- Simple interdependencies (can be expanded)

### Future Enhancements
- More sophisticated interdependency calculations
- Dynamic decay rates based on gameplay
- Seasonal need variations
- Weather/environment effects on needs
- Multi-guinea pig social need interactions
- Learning system adapting to player care patterns

## Documentation Updates

After implementation, update:
- [ ] PROJECT_PLAN.md - Mark needs system as completed
- [ ] DEVELOPMENT_PHASES.md - Update Phase 2 status
- [ ] needs-system.md - Add implementation notes
- [ ] needs-controller-store.md - Add actual implementation details

## References

- [Needs System Architecture](system-7-needs-system.md) - Includes happiness mechanics
- [Needs Controller Store Specification](system-8-needs-controller-store.md)
- [Wellness System Design](../../game-design/wellness-system.md)
- [Preferences System](../../game-design/preferences-system.md)
- [System Integration](../../SYSTEM_INTEGRATION.md)
- [Architecture Guidelines](../../technical/architecture-guidelines.md)