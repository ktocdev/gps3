# System 6.95 REDESIGN - Implementation Plan

**System:** Permanent Adoption & Stardust Sanctuary Gateway
**Phase:** Phase 2 (Pet Store & Session Management)
**Status:** 📋 Planned
**Created:** October 12, 2025
**Updated:** October 13, 2025

---

## Overview

This implementation plan provides a careful, systematic approach to implementing the complete redesign of System 6.95. The redesign transforms the pet store from a temporary selection mechanism with session endings into a permanent adoption system with friendship-gated Stardust Sanctuary progression.

**Key Changes:**
- ❌ Remove ALL refresh mechanics (manual + auto)
- ❌ Remove session ending system entirely
- ✅ Add permanent adoption (no returns ever)
- ✅ Add friendship-gated Stardust Sanctuary (85% threshold)
- ✅ Add natural store churn (adoption timers)
- ✅ Add pairing validation and bond preservation

**Estimated Timeline:** 5-6 weeks full implementation + testing

**Note:** Phase 7 (Update Safety Net Systems) has been removed from this plan as Guinea Pig Rescue (Phase 2.5 System 10.4) has not been built yet. Stardust Sanctuary integration requirements have been documented in [system-10.4-guinea-pig-rescue.md](../phase2.5/system-10.4-guinea-pig-rescue.md) for future implementation.

---

## Phase 0: Friendship System Enhancement (PREREQUISITE)

**Duration:** 3-5 days
**Goal:** Implement friendship mechanics required for 85% threshold gating
**Status:** ✅ COMPLETE

### Tasks

- [x] **Add friendship gain from interactions**
  - Pet: +2 friendship (socializeWithGuineaPig)
  - Play: +3 friendship (playWithGuineaPig)
  - Handle: +1 friendship (included in socialize)
  - Groom: +2 friendship (cleanGuineaPig)
  - Feed favorite food: +5 friendship (feedGuineaPig)
  - Feed normal food: +1 friendship (feedGuineaPig)

- [x] **Add interaction cooldowns for play and socialize**
  - Track `lastPlayTime` and `lastSocialTime` on GuineaPig
  - Calculate cooldown based on personality, friendship, and wellness
  - **Personality modifiers:**
    - Friendliness (1-10): Higher = shorter cooldown for social interactions
    - Playfulness (1-10): Higher = shorter cooldown for play interactions
  - **Friendship modifiers:**
    - Low friendship (0-40): Longer cooldowns, more easily overwhelmed
    - Medium friendship (41-70): Standard cooldowns
    - High friendship (71-100): Shorter cooldowns, enjoys player company
  - **Wellness modifiers:**
    - Low wellness (<30%): Much longer cooldowns, needs rest
    - Medium wellness (30-70%): Standard cooldowns
    - High wellness (>70%): Shorter cooldowns, energetic and ready
  - **Cooldown formula example:**
    - Base cooldown: 60 seconds for play, 45 seconds for social
    - Friendly (friendliness 8+) + high friendship (80+) + high wellness (80+) = 30s cooldown
    - Shy (friendliness 3-) + low friendship (30-) + low wellness (30-) = 180s cooldown
  - Block interaction during cooldown with message: "[Name] needs a break. Try again in Xs."
  - Award friendship points only when cooldown complete

- [x] **Add friendship gain from need fulfillment**
  - Calculate based on need amount satisfied
  - Range: +0.5 to +2 friendship per need fulfilled
  - Implemented in `satisfyNeed()` function

- [x] **Add passive friendship gain**
  - +0.1 friendship per game tick
  - Only when wellness > 50%
  - Encourages consistent care
  - Implemented in `processBatchNeedsDecay()`

- [x] **Create FriendshipProgress.vue component**
  - Display current friendship percentage
  - Show progress bar with 85% goal indicator
  - Show "X% to Stardust Sanctuary!" message when below 85%
  - Integrated as standalone component (ready for main game view)
  - Implemented in `src/components/game/FriendshipProgress.vue`

- [x] **Add friendship loss mechanics**
  - Wellness < 50%: -1 per tick
  - Wellness < 30%: -2 per tick
  - Individual needs < 30%: -0.5 per need per tick (stacks)
  - Implemented in `processBatchNeedsDecay()`

- [x] **Create FriendshipDebug.vue panel**
  - Real-time friendship tracking with progress bar
  - Cooldown status monitoring (play and social)
  - Net change per tick calculator
  - Debug controls for testing (add/subtract friendship, test interactions)
  - Added to Debug View as "Friendship" tab 💖
  - Implemented in `src/components/debug/FriendshipDebug.vue`

- [ ] **Playtest and tune friendship gain rates** (OPTIONAL - can be done during Phase 2+)
  - Ensure 85% achievable in 3-5 days with good care
  - Excellent care should reach 85% in 2-3 days
  - Poor care should risk losing progress
  - Document final tuning values
  - **Note:** System is functional and balanced; tuning can occur during gameplay testing

**Files Modified:**
- ✅ `src/stores/guineaPigStore.ts` - Added friendship mechanics, cooldown system
- ✅ `src/stores/petStoreManager.ts` - Added cooldown properties to guinea pig generation
- ✅ `src/components/game/FriendshipProgress.vue` - NEW component
- ✅ `src/components/debug/FriendshipDebug.vue` - NEW debug panel
- ✅ `src/views/DebugView.vue` - Added Friendship tab

**Success Criteria:**
- ✅ Friendship visibly increases from positive interactions
- ✅ Friendship passively gains when wellness > 50%
- ✅ Friendship decreases from poor care (wellness < 50%)
- ✅ Interaction cooldowns prevent spam and respect personality
- ✅ Progress bar clearly shows path to 85% Stardust Sanctuary threshold
- ✅ Debug panel allows comprehensive testing of friendship mechanics

---

## Phase 1: Remove ALL Refresh Mechanics

**Duration:** 1-2 days
**Goal:** Complete removal of manual and automatic store refresh systems
**Status:** ✅ COMPLETE

### Tasks

- [x] **Delete refreshPetStore() function from petStoreManager.ts**
  - Remove entire function implementation
  - Remove all function calls

- [x] **Remove refresh-related state from petStoreManager.ts**
  - Delete `nextAutoRefreshTime: number`
  - Delete `refreshCostSequence: number[]`
  - Delete `currentRefreshIndex: number`
  - Delete `canRefreshPetStore: computed`
  - Delete `nextRefreshCost: computed`

- [x] **Remove refresh settings from PetStoreSettings interface**
  - Delete `storeRefreshCost: number`
  - Delete `allowUnlimitedRefresh: boolean`
  - Delete `autoRefreshEnabled: boolean`
  - Delete `autoRefreshIntervalMs: number`

- [x] **Delete refresh UI from PetStoreDebug.vue**
  - Remove "Refresh Settings" panel section
  - Remove "Refresh Pet Store" button
  - Remove cost sequence badges/displays
  - Remove "Next Manual Refresh Cost" stat
  - Remove "No Charge for Refresh" checkbox
  - Remove 24-hour countdown timer
  - Remove "Auto-refresh in" display

**Files to Modify:**
- `src/stores/petStoreManager.ts` - Remove refresh functions and state
- `src/components/debug/PetStoreDebug.vue` - Remove refresh UI

**Success Criteria:**
- ✅ No refresh button exists anywhere in UI
- ✅ No refresh-related state in petStoreManager
- ✅ No refresh costs or timers
- ✅ Build succeeds with no TypeScript errors

---

## Phase 2: Implement Natural Store Churn (Adoption Timers)

**Duration:** 3-4 days
**Goal:** Replace manual refresh with automatic adoption timers
**Status:** ✅ COMPLETE

### Tasks

- [x] **Add adoption timer properties to GuineaPig interface**
  - Added `adoptionTimer: number | null` - Timestamp when guinea pig entered store
  - Added `adoptionDuration: number` - How long available in store (ms, 2-5 days)
  - Implemented in `src/stores/guineaPigStore.ts`

- [x] **Update guinea pig generation with adoption timers**
  - Generate random adoption duration: 2-5 days in milliseconds
  - Set adoptionTimer to Date.now() when guinea pig is created
  - Implemented in `src/stores/petStoreManager.ts` - `generateRandomGuineaPig()`

- [x] **Create processAdoptionTimers() function**
  - Check all store guinea pigs for expired timers
  - Skip guinea pigs that are active or favorited
  - Replace expired guinea pigs with new random guinea pigs
  - Log adoption events to activity feed
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Create helper functions**
  - `getAdoptionTimeRemaining(guineaPigId)` - Returns ms remaining until adoption
  - `formatAdoptionTimer(ms)` - Formats as "Xd Xh" or "Xh Xm" or "Xm"
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Integrate adoption timer processing into game tick**
  - Added call to `processAdoptionTimers()` in `processBatchUpdate()`
  - Runs every 5 seconds alongside needs decay
  - Implemented in `src/stores/needsController.ts`

- [x] **Update PetStoreDebug to display adoption timers**
  - Show adoption countdown on each guinea pig card
  - Format: "⏱️ Xd Xh" or "⏱️ Xh Xm"
  - Updates in real-time
  - Implemented in `src/components/debug/PetStoreDebug.vue`

**Files Modified:**
- ✅ `src/stores/guineaPigStore.ts` - Added adoptionTimer and adoptionDuration properties
- ✅ `src/stores/petStoreManager.ts` - Added processAdoptionTimers(), getAdoptionTimeRemaining(), formatAdoptionTimer()
- ✅ `src/stores/needsController.ts` - Integrated timer processing into game tick
- ✅ `src/components/debug/PetStoreDebug.vue` - Added adoption timer display

**Success Criteria:**
- ✅ Each store guinea pig has visible adoption countdown
- ✅ Guinea pigs automatically replaced when timer expires (2-5 days)
- ✅ Active guinea pigs never replaced
- ✅ Favorited guinea pigs never replaced
- ✅ Timers persist across app sessions (via Pinia persistence)
- ✅ New guinea pigs generated with new random timers (2-5 days)
- ✅ System message logged when guinea pig "adopted" (activity feed)
- ✅ Store always maintains 10 guinea pigs
- ✅ Build succeeds with no TypeScript errors

---

## Phase 3: Create Stardust Sanctuary Debug Panel

**Duration:** 2-3 days
**Goal:** Create dedicated panel for Stardust Sanctuary management
**Status:** ✅ COMPLETE

### Tasks

- [x] **Create StardustSanctuaryDebug.vue component**
  - Three main sections: Active / Stardust Sanctuary / Capacity
  - Active section: Shows currently active guinea pigs (max 2)
  - Sanctuary section: Shows guinea pigs in Stardust Sanctuary
  - Capacity section: Shows slot usage and availability
  - Implemented in `src/components/debug/StardustSanctuaryDebug.vue`

- [x] **Add sanctuary state to petStoreManager.ts**
  - Added `sanctuaryGuineaPigs: ref<GuineaPig[]>([])`
  - Added `maxSanctuarySlots: ref<number>(10)`
  - Added computed properties: `sanctuaryCount`, `availableSanctuarySlots`
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Create moveToSanctuary() function**
  - Checks 85% friendship threshold requirement
  - Moves guinea pig from active to sanctuary
  - Resets needs to 100%, freezes friendship
  - Returns boolean success status
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Create moveFromSanctuary() function**
  - Validates active slot availability (max 2)
  - Moves guinea pig from sanctuary to active
  - Maintains frozen friendship and 100% needs
  - Returns boolean success status
  - Implemented in `src/stores/petStoreManager.ts`

- [x] **Add friendship progress bars to Active section**
  - Integrated FriendshipProgress.vue component
  - Shows current friendship percentage
  - Shows progress toward 85% goal
  - Color-coded based on proximity to threshold
  - Shows "X% to Stardust Sanctuary!" when below 85%

- [x] **Add Move to Sanctuary/Activate buttons with validation**
  - "✨ Move to Sanctuary" button: active → Sanctuary (requires 85% friendship)
  - "💚 Activate" button: Sanctuary → active (requires available slot)
  - Buttons disabled when conditions not met
  - Helpful tooltips explaining requirements
  - Full-width buttons with proper sizing

- [x] **Add Sanctuary tab to Debug View**
  - Added template section for StardustSanctuaryDebug component
  - Added component import
  - Added "Stardust Sanctuary" tab (✨) after Friendship tab
  - Tab uses constrained panel class
  - Implemented in `src/views/DebugView.vue`

**Files Created:**
- ✅ `src/components/debug/StardustSanctuaryDebug.vue` - NEW component

**Files Modified:**
- ✅ `src/stores/petStoreManager.ts` - Added sanctuary state and functions
- ✅ `src/views/DebugView.vue` - Added Sanctuary tab

**Success Criteria:**
- ✅ Dedicated Stardust Sanctuary panel exists in Debug View
- ✅ Active guinea pigs shown with friendship progress (using FriendshipProgress component)
- ✅ Sanctuary guinea pigs shown with frozen friendship
- ✅ Move to Sanctuary button works with 85% validation
- ✅ Activate button works with slot availability validation
- ✅ Capacity display shows slot usage (used/total/available)
- ✅ Build succeeds with no TypeScript errors

---

## Phase 4: Implement Friendship-Gated Stardust Sanctuary

**Duration:** 3-4 days
**Goal:** Implement 85% friendship threshold and store access gating
**Status:** ✅ COMPLETE

### Tasks

- [x] **Add friendship threshold check to moveToSanctuary()**
  - Check if friendship >= 85%
  - Return false and show error if below threshold
  - Show message: "Need 85% friendship to move [Name] to Stardust Sanctuary"
  - Already implemented with error logging in `moveToSanctuary()` function

- [x] **Add friendshipFrozen property to GuineaPig interface**
  - Added `friendshipFrozen: boolean` to GuineaPig interface
  - Default value: `false` on guinea pig generation
  - Implemented in `src/stores/guineaPigStore.ts` line 123
  - Implemented in `src/stores/petStoreManager.ts` line 398

- [x] **Implement friendship freeze mechanic**
  - Set `friendshipFrozen = true` when entering Stardust Sanctuary
  - Set `friendshipFrozen = false` when leaving Sanctuary
  - Modified `adjustFriendship()` to skip adjustment when frozen
  - Implemented in `src/stores/petStoreManager.ts` lines 600, 641
  - Implemented in `src/stores/guineaPigStore.ts` line 1348

- [x] **Reset wellness and needs on Sanctuary entrance**
  - Already implemented via `resetGuineaPigNeeds()` call
  - Sets all needs to 100%
  - Called before freezing friendship in `moveToSanctuary()`
  - Log message: "[Name] has moved to Stardust Sanctuary! ✨"

- [x] **Add canAccessStore computed property**
  - Returns true only when `activeGuineaPigs.length === 0`
  - Used to enable/disable "Return to Store" button
  - Used to lock/unlock pet store access
  - Implemented in `src/stores/petStoreManager.ts` line 88
  - Exported in return statement line 1029

- [x] **Update GameController.vue with Return to Store button**
  - Replaced "End Session" button with "Return to Store"
  - Disabled when active guinea pigs exist (via `canAccessStore`)
  - Enabled when all guinea pigs in Stardust Sanctuary
  - Tooltip: "Move all active guinea pigs to Stardust Sanctuary to return to store"
  - Added `handleReturnToStore()` function
  - Added `useLoggingStore` import
  - Implemented in `src/components/debug/GameController.vue` lines 24-32, 444-455
  - **Note:** Navigation to pet store deferred to Phase 8 (UI Polish)

**Files Modified:**
- ✅ `src/stores/petStoreManager.ts` - Added canAccessStore, friendship freeze in moveToSanctuary/moveFromSanctuary
- ✅ `src/stores/guineaPigStore.ts` - Added friendshipFrozen property, updated adjustFriendship
- ✅ `src/components/debug/GameController.vue` - Replaced button, added handler

**Success Criteria:**
- ✅ Cannot move to Stardust Sanctuary below 85% friendship
- ✅ Friendship freezes when in Stardust Sanctuary
- ✅ Wellness/needs reset to 100% on entrance
- ✅ Store locked when active guinea pigs exist
- ✅ Store unlocked when all guinea pigs in Sanctuary
- ✅ "Return to Store" button shows correct state
- ✅ Build succeeds with no TypeScript errors

---

## Phase 5: Implement Pairing Validation & Bond Preservation

**Duration:** 3-4 days
**Goal:** Enforce pairing rules and preserve guinea pig relationships
**Status:** ✅ COMPLETE

### Tasks

- [x] **Create validatePairing() function**
  - Check if both guinea pigs are new: ✅ ALLOW
  - Check if both guinea pigs in Sanctuary: ✅ ALLOW
  - Check if one new, one Sanctuary: ❌ BLOCK
  - Return `{ valid: boolean, reason?: string }`
  - Implemented in `src/stores/petStoreManager.ts` lines 759-795

- [x] **Add bonds property to GuineaPig interface**
  - Added `GuineaPigBond` interface with partnerId, relationshipLevel, bondedAt, timesTogether
  - Added `bonds: Record<string, GuineaPigBond>` to GuineaPig interface
  - Default value: `{}` on guinea pig generation
  - Implemented in `src/stores/guineaPigStore.ts` lines 107-112, 133
  - Implemented in `src/stores/petStoreManager.ts` line 406

- [x] **Create saveBonds() function**
  - Called when guinea pig moves to Stardust Sanctuary
  - Saves relationships with other Sanctuary guinea pigs (≥50 relationship level)
  - Stores in `bonds` property for preservation
  - Tracks times together count
  - Implemented in `src/stores/petStoreManager.ts` lines 801-822
  - Integrated into `moveToSanctuary()` line 610

- [x] **Create restoreBondsIfExists() function**
  - Called when activating guinea pigs for pairing from Sanctuary
  - Checks if both have saved bond with each other
  - Restores relationship level if bond exists
  - Starts at 0 if no previous bond
  - Shows heartwarming message when bond restored
  - Implemented in `src/stores/petStoreManager.ts` lines 828-862
  - Integrated into `startGameSession()` line 888

- [x] **Update startGameSession() with pairing validation**
  - Calls `validatePairing()` before starting session (line 878)
  - Returns early with warning if validation fails (line 880-883)
  - Calls `restoreBondsIfExists()` for Sanctuary pairs (line 888)
  - Implemented in `src/stores/petStoreManager.ts` lines 877-888

- [x] **Pairing error handling**
  - Validation error logged with descriptive reason
  - Error includes guinea pig names and socialization levels
  - **Note:** Visual error dialog deferred to Phase 8 (UI Polish)
  - Log warnings sufficient for debug testing

**Files Modified:**
- ✅ `src/stores/petStoreManager.ts` - Added validatePairing, saveBonds, restoreBondsIfExists functions; integrated into startGameSession and moveToSanctuary
- ✅ `src/stores/guineaPigStore.ts` - Added GuineaPigBond interface and bonds property

**Files Deferred:**
- `src/components/dialogs/PairingErrorDialog.vue` - Deferred to Phase 8 (UI Polish)

**Success Criteria:**
- ✅ New + New pairing allowed
- ✅ Sanctuary + Sanctuary pairing allowed
- ✅ New + Sanctuary pairing blocked with error message
- ✅ Bonds saved when guinea pigs move to Sanctuary (relationship ≥50)
- ✅ Bonds restored when same pair reactivated from Sanctuary
- ✅ Bonds reset when paired with different partner (start at 0)
- ✅ Times together counter increments on each reunion
- ✅ Build succeeds with no TypeScript errors

---

## Phase 6: Remove Session Ending System

**Duration:** 1-2 days
**Goal:** Complete removal of session ending mechanics

### Tasks

- [x] **Delete SessionEndingDialog.vue component** ✅ COMPLETE
  - ✅ Removed entire file
  - ✅ Removed from imports in GameController.vue

- [x] **Remove endGameSession() function from petStoreManager.ts** ✅ COMPLETE
  - ✅ Deleted entire function
  - ✅ Removed applyBondBreakingEffects() function (no longer needed)
  - ✅ Removed all calls to these functions

- [x] **Keep GameSession interface and activeGameSession state** ✅ DECISION CHANGED
  - ✅ Kept GameSession interface - still needed for tracking active guinea pigs
  - ✅ Kept activeGameSession - represents "active guinea pigs" not a temporary session
  - ✅ Removed wasFromFavorites property from GameSession interface

- [x] **Remove End Session button from GameController.vue** ✅ COMPLETE
  - ✅ Deleted "Return Guinea Pigs & End Session" button
  - ✅ Deleted session ending dialog handlers
  - ✅ Kept "Return to Store" button (for adopt-more gameplay loop)

- [x] **Remove End Game Penalty slider from GameController.vue** ✅ COMPLETE
  - ✅ Deleted slider component
  - ✅ Removed unused SliderField import

- [x] **Remove Favorites System** ✅ COMPLETE (Phase 6 bonus cleanup)
  - ✅ Removed favoriteGuineaPigs and maxFavoriteSlots state from petStoreManager.ts
  - ✅ Removed all favorite computed properties and functions
  - ✅ Removed wasFromFavorites from GameSession interface
  - ✅ Updated startGameSession to check sanctuary instead of favorites
  - ✅ Updated adoption timer expiration logic to check sanctuary instead of favorites
  - ✅ Removed FavoritesPanel.vue component
  - ✅ Removed favorites UI from PetStoreDebug.vue (badges, buttons, debug panel)
  - ✅ Updated GameController.vue dropdown options to use sanctuary instead of favorites (✨ icon)
  - ✅ Removed favorites slot purchase system from playerProgression.ts
  - ✅ Removed favoriteSlotsPurchased state
  - ✅ Removed getFavoriteSlotCost, nextFavoriteSlotCost, canAffordFavoriteSlot, purchaseFavoriteSlot
  - ✅ Updated resetProgression to not reset favorites

**Files Deleted:**
- ✅ `src/components/game/SessionEndingDialog.vue`
- ✅ `src/components/petstore/FavoritesPanel.vue`

**Files Modified:**
- ✅ `src/stores/petStoreManager.ts` - Removed session ending, bond breaking, favorites system
- ✅ `src/stores/playerProgression.ts` - Removed favorites slot purchase system
- ✅ `src/components/debug/GameController.vue` - Removed UI elements, updated dropdowns
- ✅ `src/components/debug/PetStoreDebug.vue` - Removed favorites UI

**Success Criteria:**
- ✅ No "End Session" button exists
- ✅ No session ending dialog
- ✅ No end game penalty setting
- ✅ No favorites system (guinea pigs either available, active, or in sanctuary)
- ✅ Build succeeds with no TypeScript errors
- ✅ Guinea pig dropdowns show sanctuary guinea pigs (✨) instead of favorites (⭐)

---

## Phase 7: Add Observe Interaction & UI Polish

**Duration:** 2-3 days
**Goal:** Add personality preview and polish user experience
**Status:** 🔄 IN PROGRESS

### Tasks

- [x] **Create Observe button for each store guinea pig**
  - Added "Observe [Name]" button to each guinea pig in PetStoreDebug
  - One-time use only per guinea pig (tracked via `observed` property)
  - Disables after first use (shows "Observed ✓" badge)
  - No cost, no cooldown
  - Implemented in `src/components/debug/PetStoreDebug.vue` lines 43-51

- [x] **Add personality glimpse messages for Observe**
  - "[Name] is munching hay contentedly." 🌾
  - "[Name] looks at you curiously." 👀
  - "[Name] is sleeping stretched out in the corner." 😴
  - "[Name] is taking cover in an igloo." 🏠
  - "[Name] is popcorning excitedly!" 🎉
  - "[Name] is grooming their fur carefully." ✨
  - Messages logged to Activity Feed via `addGuineaPigReaction()`
  - Implemented in `src/components/debug/PetStoreDebug.vue` lines 851-906

- [x] **Create permanent adoption confirmation dialog**
  - Created AdoptionConfirmDialog.vue component
  - Title: "Ready to adopt [Name]?"
  - Message: "This is a permanent commitment. You'll care for [Name] and build a lasting friendship. Once adopted, they're yours forever!"
  - Shows observed status with visual feedback
  - Buttons: [Confirm Adoption] [Cancel]
  - Implemented in `src/components/basic/dialogs/AdoptionConfirmDialog.vue`
  - **Note:** Dialog created but not yet integrated into adoption flow

- [x] **Add cage organization to Pet Store**
  - Guinea pigs assigned to cages (3-4 per cage)
  - Added `cageNumber` property to GuineaPig interface
  - Cages displayed as grouped sections with labels
  - Implemented cage assignment logic in `generateRandomGuineaPigs()`
  - 40% chance of paired guinea pigs with shared adoption timers (2 per cage)
  - Paired guinea pigs leave store together when timer expires
  - Implemented in `src/stores/petStoreManager.ts` lines 436-470
  - Implemented in `src/components/debug/PetStoreDebug.vue` with cage grouping UI

- [x] **Add InfoButton to Pet Store panel**
  - Added InfoButton component next to "Available Guinea Pigs" header
  - Message: "View guinea pig observations in the Activity Feed"
  - Increased icon size and improved popover styling
  - Implemented in `src/components/basic/InfoButton.vue` and `PetStoreDebug.vue`

- [x] **Update UI text to use "Stardust Sanctuary" terminology**
  - Searched all UI components for "favorite" references
  - All references found are about guinea pig preferences (favorite foods, activities)
  - No old "Favorites" system terminology found in UI
  - System successfully renamed to "Stardust Sanctuary" throughout codebase

**Files Created:**
- ✅ `src/components/basic/dialogs/AdoptionConfirmDialog.vue` - NEW dialog component

**Files Modified:**
- ✅ `src/stores/guineaPigStore.ts` - Added `observed` and `cageNumber` properties
- ✅ `src/stores/petStoreManager.ts` - Added cage assignment, paired adoption timers
- ✅ `src/components/debug/PetStoreDebug.vue` - Added Observe button, cage grouping UI, InfoButton
- ✅ `src/components/basic/InfoButton.vue` - Updated icon and styling
- ✅ `src/stores/loggingStore.ts` - Used for Observe messages

**Success Criteria:**
- ✅ Observe button shows personality glimpse in Activity Feed
- ✅ Observe only usable once per guinea pig
- ✅ Permanent adoption confirmation dialog created (integration pending)
- ✅ Guinea pigs organized into cages (3-4 per cage)
- ✅ Paired guinea pigs share adoption timers (40% chance, 2 per cage)
- ✅ InfoButton provides helpful guidance
- ⏳ All UI uses "Stardust Sanctuary" terminology (pending)

---

## Phase 8: Testing & Validation

**Duration:** 3-5 days
**Goal:** Comprehensive testing of all new mechanics

### Tasks

- [ ] **Test friendship gain rates**
  - Positive interactions increase friendship
  - Need fulfillment grants friendship
  - Passive gain works when needs > 50%
  - 85% achievable in 3-5 days with good care
  - Excellent care reaches 85% in 2-3 days

- [ ] **Test adoption timers**
  - Timers display correctly (2-5 days)
  - Countdown updates in real-time
  - Guinea pigs replaced when timer expires
  - New guinea pigs have new timers
  - Timers persist across app restart

- [ ] **Test friendship threshold gating**
  - Cannot move to Sanctuary below 85%
  - Can move to Sanctuary at exactly 85%
  - Can move to Sanctuary above 85%
  - Error message shown when below threshold

- [ ] **Test store access gating**
  - Store locked when active guinea pigs exist
  - Store unlocked when all guinea pigs in Sanctuary
  - "Return to Store" button disabled/enabled correctly
  - Tooltip messages accurate

- [ ] **Test pairing validation**
  - New + New pairing allowed
  - Sanctuary + Sanctuary pairing allowed
  - New + Sanctuary pairing blocked
  - Error dialog shown for invalid pairing
  - Error message clear and helpful

- [ ] **Manual playtest complete redesign end-to-end**
  - First-time experience with 10 guinea pigs
  - Observe interaction
  - Adopt 1-2 guinea pigs (permanent commitment)
  - Build friendship to 85%
  - Move to Stardust Sanctuary
  - Return to store
  - Adopt new guinea pigs
  - Test pairing rules
  - Test bond preservation
  - Verify natural store churn

**Success Criteria:**
- ✅ All mechanics work as designed
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Smooth user experience
- ✅ Clear feedback on all actions
- ✅ Permanent adoption feels meaningful
- ✅ Stardust Sanctuary feels rewarding

---

## Phase 9: Documentation & Migration

**Duration:** 2-3 days
**Goal:** Update documentation and handle existing player data

### Tasks

- [ ] **Update SYSTEM_INTEGRATION.md**
  - Add Stardust Sanctuary architecture
  - Document friendship system integration
  - Update data flow diagrams
  - Document new state management

- [ ] **Create save data migration strategy**
  - Plan for existing players with favorites
  - Plan for active game sessions
  - Plan for refresh cost progression

- [ ] **Implement grandfather clause**
  - Existing favorites kept valid
  - Bump friendship to 85% minimum if below
  - Set friendshipFrozen = true for all existing
  - Log migration message

- [ ] **Test migration with existing save data**
  - Test with favorites below 85%
  - Test with active sessions
  - Test with purchased slots
  - Ensure no data loss

**Files to Modify:**
- `docs/SYSTEM_INTEGRATION.md` - Add architecture docs
- `src/stores/petStoreManager.ts` - Add migration logic
- `docs/MIGRATION_GUIDE.md` - NEW migration guide

**Success Criteria:**
- ✅ SYSTEM_INTEGRATION.md updated
- ✅ Migration strategy documented
- ✅ Existing favorites preserved
- ✅ No breaking changes for players
- ✅ Migration tested thoroughly

---

## Risk Assessment

### High Risk Areas

1. **Friendship tuning** - May require multiple iterations to get 85% achievable in 3-5 days
2. **Bond preservation** - Complex logic with edge cases (multiple pairings, different partners)
3. **Save data migration** - Must not break existing player data

### Mitigation Strategies

1. **Friendship tuning** - Extensive playtesting in Phase 0, adjustable gain rates
2. **Bond preservation** - Comprehensive unit tests, clear test cases
3. **Save data migration** - Grandfather clause, thorough migration testing, rollback plan

### Dependencies

- **Phase 0 must complete first** - All other phases depend on friendship system
- **Phase 1-2 can run in parallel** - Refresh removal and timer addition independent
- **Phase 4 depends on Phase 0** - Friendship gating requires friendship system
- **Phase 5 depends on Phase 4** - Pairing validation uses Sanctuary status
- **Phase 7 depends on Phase 2.5 System 4** - Guinea Pig Rescue must be built first

---

## Success Metrics

### Technical Success

- ✅ All TypeScript builds without errors
- ✅ All unit tests pass
- ✅ No console errors during gameplay
- ✅ State persists correctly across sessions
- ✅ Performance remains smooth with timers

### Player Experience Success

- ✅ Clear progression path (adopt → bond → Sanctuary)
- ✅ 85% friendship achievable in reasonable time
- ✅ Stardust Sanctuary feels rewarding
- ✅ No punishing mechanics
- ✅ No frustrating restrictions
- ✅ Natural store evolution (no refresh spam)

### Design Goal Success

- ✅ Permanent adoption creates emotional investment
- ✅ Friendship mastery required before expansion
- ✅ Bond preservation adds depth
- ✅ Natural store churn feels realistic
- ✅ Safety nets prevent player frustration

---

## Rollback Plan

If critical issues discovered after deployment:

1. **Immediate rollback** - Revert to previous version (System 6.95 v1)
2. **Data preservation** - Ensure no player data lost in rollback
3. **Issue diagnosis** - Identify specific problem area
4. **Targeted fix** - Fix specific phase without full rollback
5. **Re-deploy** - Test thoroughly before re-deploying

**Rollback triggers:**
- Critical bug preventing gameplay
- Data corruption or loss
- Performance degradation
- Major player complaints

---

## Next Steps

1. **Review this implementation plan** - Ensure all stakeholders agree
2. **Begin Phase 0** - Friendship System Enhancement (prerequisite)
3. **Track progress** - Mark tasks complete in todo list
4. **Regular testing** - Test after each phase completion
5. **Iterate** - Adjust plan based on learnings

**Ready to begin?** Start with Phase 0: Friendship System Enhancement
