# Permanent Adoption & Stardust Sanctuary Gateway - System 6.95 Redesign

**Phase:** Phase 2 (Pet Store & Session Management)
**Status:** 📋 **Planned (Complete Redesign)**
**System Number:** 6.95
**Replaces:** system-6.95-session-ending-store-refresh-enhancement.md
**Prerequisites:**
- Pet Store & Game Session Manager (System 6.5) ✅
- Guinea Pig Favorites System (System 6.9) ✅
- Friendship mechanics (currently exists but needs enhancement)

**Created:** October 12, 2025

---

## Core Philosophy

**"Adoption is permanent. Master friendship (85%) to unlock Stardust Sanctuary (meta-save state). Natural store churn replaces manual refresh."**

This system transforms the pet store from a temporary selection mechanism into a **permanent adoption commitment** where:
- **Adoption is forever** - No returns, no abandonments, no "try and discard"
- **Stardust Sanctuary is earned** - 85% friendship threshold gates access to meta-save state where all needs are perfectly met
- **Bonds matter** - Guinea pig relationships are preserved and respected
- **Natural progression** - Store evolves organically through adoption timers
- **Mastery unlocks options** - Must prove bonding ability before acquiring new guinea pigs

---

## Overview

### Current System (System 6.95 v1)
- Session ending with 3 outcomes based on moving to Stardust Sanctuary
- Escalating store refresh costs ($100→$3,200)
- Guinea pigs not in Stardust Sanctuary permanently removed on session end
- Stardust Sanctuary as optional protection mechanism
- Manual and auto store refresh mechanics

### New System (System 6.95 v2)
- **Permanent adoption** - guinea pigs never leave once adopted
- **Friendship-gated Stardust Sanctuary** - must achieve 85% friendship to enter Sanctuary
- **Natural store churn** - adoption timers replace manual refresh entirely
- **Store access gating** - can only return to store when all active guinea pigs in Stardust Sanctuary
- **Bond preservation** - relationships saved when guinea pigs move to Stardust Sanctuary

---

## Terminology

**Stardust Sanctuary** - The meta-save state where guinea pigs are preserved with all needs perfectly met. Think of it as a magical genie bottle where your closest guinea pig friends live in perfect comfort and happiness. Guinea pigs must reach 85% friendship to earn entrance to Stardust Sanctuary.

---

## Part 1: Pet Store & First Experience

### Initial Pet Store Presentation

When a user opens the app for the first time (after intro/tutorial), they are presented with:
- **10 randomly generated guinea pigs** in the pet store
- Each guinea pig has basic info visible (name, breed, appearance)
- Each guinea pig has an **adoption countdown timer** (e.g., "Will be adopted in 3 days")

### "Observe" Interaction

**Purpose:** One-time informative glimpse into a guinea pig's personality

**Mechanics:**
- Button: "Observe [Name]"
- Available once per guinea pig (one-time use)
- No cost, no cooldown, purely informative
- **No gameplay effect** - doesn't change stats, friendship, or behavior

**Example Messages:**
- "Oreo is munching hay contentedly." 🌾
- "Oreo looks at you curiously." 👀
- "Oreo is sleeping stretched out in the corner." 😴
- "Oreo is taking cover in an igloo." 🏠
- "Oreo is popcorning excitedly!" 🎉
- "Oreo is grooming their fur carefully." ✨

**Design Intent:**
- Gives personality preview without revealing preferences
- Helps player make adoption decision based on character
- Creates emotional connection before commitment

### Permanent Adoption

**Selection:**
- Choose 1-2 guinea pigs from the store
- Maximum 2 guinea pigs active at any time

**Commitment:**
- **This is permanent** - once adopted, you keep them forever
- No returns, no abandonments, no "put them back"
- Must work with these guinea pigs to build relationship
- Cannot acquire new guinea pigs until these are in Stardust Sanctuary

**UI Messaging:**
```
"Ready to adopt [Name]?"

This is a permanent commitment. You'll care for [Name]
and build a lasting friendship. Once adopted, they're
yours forever!

[Confirm Adoption] [Cancel]
```

---

## Part 2: Permanent Adoption Mechanics

### No Returns Policy

**Core Rule:** Guinea pigs cannot be returned, abandoned, or removed from the game for any reason except:
1. Guinea Pig Rescue (wellness < 15%) - automatic safety net
2. Fresh Start option (player chooses to reset) - only when out of money

**Why This Matters:**
- Creates real emotional investment
- Encourages thoughtful adoption decisions
- Teaches value of commitment and care
- Makes relationship-building meaningful

### Store Access Gating

**Rule:** The pet store becomes **inaccessible** after adoption until:
- All active guinea pigs (max 2) have been moved to Stardust Sanctuary
- Stardust Sanctuary entrance requires 85% friendship (see Part 3)

**Progression Loop:**
```
Adopt (1-2 guinea pigs)
    ↓
Care for them, build friendship
    ↓
Reach 85% friendship with both
    ↓
Move both guinea pigs to Stardust Sanctuary
    ↓
Store access unlocked
    ↓
Return to store, adopt new guinea pigs (1-2)
    ↓
Repeat...
```

**Design Intent:**
- Forces mastery before expansion
- Prevents "collecting without bonding"
- Creates natural pacing
- Rewards player skill

### Maximum Active Guinea Pigs

**Limit:** 2 active guinea pigs at any time

**Why:**
- Manageable care workload
- Encourages deep relationships over breadth
- Makes each guinea pig feel important
- Prevents overwhelming new players

**With Stardust Sanctuary:**
- Can have 10 total guinea pigs in Stardust Sanctuary (in meta-save state)
- But only 2 can be active in gameplay at once
- Must swap Stardust Sanctuary residents in/out to change active pair

---

## Part 3: Friendship System Integration

### Current Friendship Implementation

**Existing in guineaPigStore.ts:**
- `friendship: number` (0-100 scale)
- Friendship affects interaction success rates
- Some interactions already increase friendship

### Required Enhancements

**Friendship Gain Mechanics:**
Need clear, consistent friendship increases from:
1. **Positive interactions:**
   - Petting, playing, handling
   - +1 to +5 friendship per successful interaction
2. **Need fulfillment:**
   - Feeding, cleaning, grooming
   - +0.5 to +2 friendship per need satisfied
3. **Time together:**
   - Passive friendship gain over time
   - +0.1 friendship per game tick while needs > 50%
4. **Preference discovery:**
   - Giving favorite foods/activities
   - +3 to +5 bonus friendship
5. **Milestone achievements:**
   - First favorite food discovered: +5
   - All needs > 80%: +2
   - Full day of care: +10

**Friendship Loss Mechanics:**
1. **Neglect:**
   - Needs falling below 30%: -1 per tick
   - Wellness below 50%: -2 per tick
2. **Negative interactions:**
   - Failed handling attempts: -1
   - Forced interactions while stressed: -2
3. **Separation:**
   - Time apart (if bonded pair separated): -0.5 per tick

**Tuning Goals:**
- 85% friendship achievable in 3-5 days of good care
- Poor care should risk losing progress
- Excellent care should reach 85% faster (2-3 days)

### 85% Friendship Threshold

**Gate for Moving to Stardust Sanctuary:**
- Must reach ≥85 friendship to unlock "Add to Stardust Sanctuary" button
- This is a **strict requirement** - no exceptions
- Shows as progress bar toward goal (e.g., "73/85 to Stardust Sanctuary")

**Why 85%?**
- High enough to require mastery
- Low enough to be achievable without perfect play
- Creates sense of accomplishment
- "Best friend" level relationship

### UI Requirements

**Friendship Display:**
```
┌─────────────────────────────┐
│ Oreo                        │
│ Friendship: 73%             │
│ ████████████░░░░░ 73/85     │
│ 12% to Stardust Sanctuary!  │
└─────────────────────────────┘
```

**Stardust Sanctuary Button States:**
```
# Below 85%:
[Add to Stardust Sanctuary] (disabled, grayed out)
Tooltip: "Reach 85% friendship to move Oreo to Stardust Sanctuary"

# At 85%+:
[Add to Stardust Sanctuary ⭐] (enabled, highlighted)
Tooltip: "Save Oreo to your Stardust Sanctuary!"
```

---

## Part 4: Stardust Sanctuary Gateway System

### Stardust Sanctuary as Achievement

**Not Protection, But Progression:**
- Current system: Stardust Sanctuary protects guinea pigs from removal
- New system: **Stardust Sanctuary is the GOAL of gameplay**
- Must **earn** the right to enter Stardust Sanctuary through relationship building
- Stardust Sanctuary unlocks the ability to return to store and continue collecting

### Requirements to Move to Stardust Sanctuary

**Strict Gate:**
1. Guinea pig must have ≥85% friendship
2. Must have available Stardust Sanctuary slot (max 10)
3. Guinea pig must be currently active (not already in Stardust Sanctuary)

**Process:**
```typescript
function addToStardustSanctuary(guineaPigId: string): boolean {
  const guineaPig = getGuineaPig(guineaPigId)

  // Check friendship threshold
  if (guineaPig.friendship < 85) {
    showMessage("Need 85% friendship to move " + guineaPig.name + " to Stardust Sanctuary")
    return false
  }

  // Check slot availability
  if (stardustSanctuaryCount >= maxStardustSanctuarySlots) {
    showMessage("No Stardust Sanctuary slots available. Purchase more slots!")
    return false
  }

  // Move to Stardust Sanctuary
  moveToStardustSanctuary(guineaPig)
  return true
}
```

### Stardust Sanctuary (Meta-Save State)

**What Happens When Moved to Stardust Sanctuary:**
1. Guinea pig moves from "active gameplay" to "Stardust Sanctuary storage"
2. **Friendship freezes** at current level (no decay)
3. **Bonds preserved** (relationships with other guinea pigs in Stardust Sanctuary saved)
4. **Progress saved** (preferences learned, skills taught, etc.)
5. **Wellness reset** to 100% (fresh and rested)
6. **Needs reset** to 100% (well cared for in Stardust Sanctuary)

**Stardust Sanctuary Concept:**
- This is a **meta-space** outside active gameplay
- Guinea pigs are "resting" and "safe"
- They maintain all progress but don't actively participate
- Think of it as "your collection" vs "your active pets"

### Friendship Freeze Mechanic

**While in Stardust Sanctuary:**
- Friendship **does not decay**
- Friendship **does not increase**
- Friendship is **frozen** at the level when moved to Stardust Sanctuary

**Example:**
```
Oreo moved to Stardust Sanctuary at 87% friendship
→ Moved to Stardust Sanctuary
→ Time passes (days/weeks)
→ Oreo still at 87% friendship
→ Activated back to gameplay
→ Friendship at 87%, can now increase/decrease again
```

**Design Intent:**
- Rewards achievement (friendship can't be lost)
- Allows long-term collection building
- Prevents anxiety about "losing progress"
- Makes Stardust Sanctuary feel permanent and safe

### Bond Preservation

**When Both Guinea Pigs in Stardust Sanctuary:**
```typescript
interface GuineaPigBond {
  partnerId: string
  relationshipLevel: number  // 0-100
  bondedAt: number          // Timestamp
  timesTogether: number     // Play sessions
}

// Example: Oreo and Peanut are bonded
Oreo.bonds = {
  "peanut-123": {
    partnerId: "peanut-123",
    relationshipLevel: 78,
    bondedAt: 1697234567890,
    timesTogether: 15
  }
}
```

**When Re-Pairing:**
```typescript
function activateFromStardustSanctuary(id1: string, id2: string) {
  const gp1 = getStardustSanctuaryGuineaPig(id1)
  const gp2 = getStardustSanctuaryGuineaPig(id2)

  // Check if they were previously bonded
  if (gp1.bonds[id2]) {
    // Restore bond
    gp1.relationships[id2] = gp1.bonds[id2].relationshipLevel
    gp2.relationships[id1] = gp2.bonds[id1].relationshipLevel
  } else {
    // New pairing, start from 0
    gp1.relationships[id2] = 0
    gp2.relationships[id1] = 0
  }

  setActivePair([gp1, gp2])
}
```

**Design Intent:**
- Respects established relationships
- Allows flexible cage mate swapping
- Doesn't force permanent pairs
- Rewards long-term relationships

### Sanctuary Slots

**Slot Progression:**
- Start with 3 free slots
- Can purchase up to 10 total slots
- Escalating costs (same as current system):
  - Slot 4: $50
  - Slot 5: $100
  - Slot 6: $200
  - Slot 7: $400
  - Slot 8: $800
  - Slot 9: $1,600
  - Slot 10: $3,200

**Why 10 Slots?**
- Manageable collection size
- Enough for variety without being overwhelming
- High enough to feel aspirational
- Creates long-term progression goal

### Store Access Unlock

**Condition:** Can only return to pet store when:
- All active guinea pigs (max 2) have been moved to Stardust Sanctuary
- This means active guinea pig count = 0

**Flow:**
```
Active: [Oreo, Peanut]
Store access: ❌ LOCKED

→ Move Oreo to Stardust Sanctuary (87% friendship)
Active: [Peanut]
Store access: ❌ LOCKED

→ Move Peanut to Stardust Sanctuary (91% friendship)
Active: []
Store access: ✅ UNLOCKED

→ Return to store, adopt new guinea pigs
```

**UI:**
```
[Return to Store] (disabled)
Tooltip: "Move all active guinea pigs to Stardust Sanctuary to return to store"

# When unlocked:
[Return to Store ✨] (enabled, highlighted)
Tooltip: "Choose new guinea pigs from the store!"
```

---

## Part 5: Pairing & Bond Preservation

### Allowed Pairings

**Rule 1: New + New** ✅
- Two freshly adopted guinea pigs can be paired
- Relationship starts at 0
- They build bond from scratch

**Rule 2: Stardust Sanctuary + Stardust Sanctuary** ✅
- Two guinea pigs from Stardust Sanctuary can be paired
- **If previously bonded:** Relationship restored to saved level
- **If first time together:** Relationship starts at 0

**Rule 3: New + Stardust Sanctuary** ❌
- **PROHIBITED**
- New guinea pig has 0 relationship with player
- Guinea pig from Stardust Sanctuary has 85%+ relationship with player
- **Unfair socialization starting point**

**Validation:**
```typescript
function validatePairing(gp1: GuineaPig, gp2: GuineaPig): boolean {
  const gp1IsStardustSanctuary = stardustSanctuaryGuineaPigs.includes(gp1.id)
  const gp2IsStardustSanctuary = stardustSanctuaryGuineaPigs.includes(gp2.id)

  // Both new: OK
  if (!gp1IsStardustSanctuary && !gp2IsStardustSanctuary) return true

  // Both from Stardust Sanctuary: OK
  if (gp1IsStardustSanctuary && gp2IsStardustSanctuary) return true

  // Mixed: NOT ALLOWED
  return false
}
```

**Error Message:**
```
"Cannot pair Oreo (Stardust Sanctuary) with Pepper (new)!

Guinea pigs must start from the same socialization level.
Either adopt two new guinea pigs together, or activate
two guinea pigs from Stardust Sanctuary together."
```

### Bond Mechanics

**Relationship Tracking:**
```typescript
interface GuineaPig {
  // Existing
  friendship: number  // Player ↔ Guinea Pig (0-100)

  // Enhanced
  relationships: Record<string, number>  // Guinea Pig ↔ Guinea Pig (0-100)
  bonds: Record<string, GuineaPigBond>  // Preserved bonds when in Stardust Sanctuary
}
```

**Bond Building:**
- Time together increases relationship
- Playing together increases relationship
- Sharing food increases relationship
- Bonded at 75%+ relationship

**Bond Preservation Flow:**
```
1. Oreo + Peanut active → relationship builds to 78%
2. Move Oreo to Stardust Sanctuary → bond saved (Oreo.bonds["peanut-123"] = 78)
3. Move Peanut to Stardust Sanctuary → bond saved (Peanut.bonds["oreo-456"] = 78)
4. Both in Stardust Sanctuary → bonds preserved
5. Activate Oreo + Cinnamon → Oreo + Cinnamon start at 0 (new pairing)
6. Move Cinnamon to Stardust Sanctuary, activate Oreo + Peanut → bond restored to 78%
```

### Relationship Reset Rules

**When Does Relationship Reset to 0?**
1. New guinea pig paired with another new guinea pig
2. Guinea pig from Stardust Sanctuary paired with another from Stardust Sanctuary for the first time
3. Guinea pig paired with different partner than last time

**When Is Relationship Preserved?**
1. Same two guinea pigs from Stardust Sanctuary re-paired together
2. Bond was previously saved in Stardust Sanctuary

---

## Part 6: Natural Store Churn

### Adoption Timers

**Core Mechanic:** Each guinea pig in the store has a countdown timer showing when they will be "adopted by another family."

**Timer Properties:**
```typescript
interface StoreGuineaPig extends GuineaPig {
  adoptionTimer: number  // Timestamp when guinea pig will be adopted
  adoptionDuration: number  // How long they're available (ms)
}
```

**Timer Generation:**
```typescript
function generateStoreGuineaPig(): StoreGuineaPig {
  const guineaPig = generateRandomGuineaPig()
  const durationDays = random(2, 5)  // 2-5 days
  const durationMs = durationDays * 24 * 60 * 60 * 1000

  return {
    ...guineaPig,
    adoptionTimer: Date.now() + durationMs,
    adoptionDuration: durationMs
  }
}
```

**Timer Display:**
```
┌─────────────────────────────┐
│ Oreo                        │
│ American Short Hair         │
│ Black & White               │
│                             │
│ ⏰ Adopted in 3 days 4 hours│
│ [Observe] [Adopt]           │
└─────────────────────────────┘
```

### Automatic Replacement

**When Timer Expires:**
```typescript
function checkAdoptionTimers() {
  const now = Date.now()

  for (const guineaPig of availableGuineaPigs) {
    if (guineaPig.adoptionTimer <= now) {
      // Replace with new guinea pig
      replaceGuineaPig(guineaPig.id)
    }
  }
}

function replaceGuineaPig(oldId: string) {
  // Remove old guinea pig
  availableGuineaPigs = availableGuineaPigs.filter(gp => gp.id !== oldId)

  // Add new guinea pig
  const newGuineaPig = generateStoreGuineaPig()
  availableGuineaPigs.push(newGuineaPig)

  // Log
  logging.addSystemMessage(
    `A guinea pig found a new home! New guinea pig available in store.`,
    '🏡'
  )
}
```

**Persistence:**
- Adoption timers persist across app sessions
- Check timers on app startup
- Replace expired guinea pigs immediately

### Store Evolution

**Natural Progression:**
- Store gradually evolves over time
- No player action required
- Some guinea pigs stay longer (4-5 days)
- Some guinea pigs adopted quickly (2-3 days)
- Creates sense of living, breathing pet store

**Design Intent:**
- Removes "spam refresh" behavior
- Encourages timely decisions
- Feels more realistic
- No explicit cost or penalty
- Natural scarcity without frustration

### What This Replaces

**Completely Removed:**
- ❌ Manual "Refresh Store" button
- ❌ Escalating refresh costs ($100→$3,200)
- ❌ 24-hour auto-refresh timer
- ❌ `refreshPetStore()` function
- ❌ `nextAutoRefreshTime` state
- ❌ `refreshCostSequence` array
- ❌ `currentRefreshIndex` tracking
- ❌ `canRefreshPetStore` computed
- ❌ Refresh-related UI (buttons, timers, cost displays)

**Why Remove Manual Refresh?**
- Eliminates "shopping" behavior
- Removes economic pressure
- Simplifies system
- More realistic pet store simulation
- Natural pacing through timers

---

## Part 7: Safety Net Systems (Preserved)

### Guinea Pig Rescue

**Trigger:** Wellness < 15% (automatic)

**Behavior:**
```typescript
function checkWellnessRescue() {
  for (const guineaPig of activeGuineaPigs) {
    if (guineaPig.wellness < 15) {
      // Trigger rescue
      triggerRescue(guineaPig)
    }
  }
}

function triggerRescue(guineaPig: GuineaPig) {
  // Charge rescue fee
  playerProgression.deductCurrency(200, 'guinea_pig_rescue')

  // Reset guinea pig
  guineaPig.wellness = 100
  resetAllNeeds(guineaPig)

  // If in Stardust Sanctuary: stays in Stardust Sanctuary
  // If not in Stardust Sanctuary: stays in active, wellness restored

  logging.addSystemMessage(
    `${guineaPig.name} received emergency care. Rescue fee: $200 💔`,
    '🚑'
  )
}
```

**Key Points:**
- **Guinea pigs in Stardust Sanctuary are protected** - rescue doesn't remove them from Stardust Sanctuary
- Guinea pigs not in Stardust Sanctuary are NOT removed (permanent adoption)
- $200 penalty (same as before)
- Guinea pig wellness restored

### Fresh Start

**Trigger:** Player runs out of money (< $0)

**Option Presented:**
```
"You've run out of money!

Fresh Start: Reset to $1,000 and continue playing

Your Stardust Sanctuary will be preserved!
All purchased Stardust Sanctuary slots will be kept!

[Fresh Start] [Cancel]"
```

**Behavior:**
```typescript
function freshStart() {
  // Reset currency
  playerProgression.currency = 1000

  // Preserve Stardust Sanctuary (no change)
  // Preserve Stardust Sanctuary slots (no change)

  // Keep active guinea pigs (permanent adoption)

  logging.addSystemMessage(
    `Fresh Start! Currency reset to $1,000. Your ${stardustSanctuaryCount} guinea pigs in Stardust Sanctuary are safe! ✨`,
    '🎉'
  )
}
```

**Key Points:**
- **Stardust Sanctuary completely preserved**
- **Stardust Sanctuary slots preserved**
- Active guinea pigs remain active
- Only currency resets
- No loss of progress

---

## Part 8: What Gets Removed

### Complete Removal List

**From petStoreManager.ts:**
```typescript
// DELETE these:
refreshPetStore(isAutoRefresh: boolean): void
nextAutoRefreshTime: number
refreshCostSequence: number[]
currentRefreshIndex: number
canRefreshPetStore: computed
allowUnlimitedRefresh: boolean
autoRefreshEnabled: boolean
autoRefreshIntervalMs: number
nextRefreshCost: computed

// DELETE session ending:
endGameSession(): void
activeGameSession: GameSession | null
```

**From UI Components:**

**PetStoreDebug.vue:**
- ❌ "Refresh Store" button
- ❌ Refresh cost display
- ❌ Cost sequence badges
- ❌ "Next Manual Refresh Cost" stat
- ❌ "No Charge for Refresh" checkbox
- ❌ 24-hour countdown timer
- ❌ "Auto-refresh in" display
- ❌ Stardust Sanctuary panel section
- ❌ "Add to Stardust Sanctuary" buttons

**GameController.vue:**
- ❌ "End Session" button
- ❌ "Return Guinea Pigs & End Session" button
- ❌ End Game Penalty slider
- ❌ Session status display

**Components to Delete:**
- ❌ `SessionEndingDialog.vue` (entire component)

---

## Part 9: UI/UX Architecture

### Pet Store (PetStoreDebug.vue)

**Keep:**
- Guinea pig list display
- Adoption selection (1-2 guinea pigs)
- Guinea pig details (name, breed, appearance)

**Remove:**
- Stardust Sanctuary panel
- "Add to Stardust Sanctuary" buttons
- Refresh button
- Refresh cost/timer displays

**Add:**
- **"Observe [Name]" button** per guinea pig
  - One-time use per guinea pig
  - Shows personality glimpse message
  - Disabled after use
- **Adoption timer display** per guinea pig
  - "⏰ Adopted in 3 days 4 hours"
  - Countdown updates live
- **Permanent adoption warning** in adoption flow

**Updated Layout:**
```
┌─────────────────────────────────────────┐
│ Pet Store (10 Guinea Pigs)              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Oreo - American Short Hair          │ │
│ │ Black & White · Brown Eyes          │ │
│ │                                     │ │
│ │ ⏰ Adopted in 3 days 4 hours        │ │
│ │ [Observe] [Adopt]                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Peanut - Abyssinian                 │ │
│ │ Brown · Dark Brown Eyes             │ │
│ │ "Peanut is munching hay"           │ │ (after Observe)
│ │ ⏰ Adopted in 1 day 12 hours        │ │
│ │ [Observed ✓] [Adopt]                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ... (8 more guinea pigs)                │
└─────────────────────────────────────────┘
```

### NEW: Stardust Sanctuary Debug Panel

**New Component:** `StardustSanctuaryDebug.vue`

**Purpose:** Dedicated panel for Stardust Sanctuary management

**Layout:**
```
┌─────────────────────────────────────────┐
│ Stardust Sanctuary (3 / 10 slots)       │
├─────────────────────────────────────────┤
│ Active Guinea Pigs (2 / 2)              │
│ ┌─────────────────────────────────────┐ │
│ │ Oreo - American Short Hair          │ │
│ │ Friendship: 91% ████████████████░░  │ │
│ │ Bond with Peanut: 78%               │ │
│ │ [Deactivate]                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Peanut - Abyssinian                 │ │
│ │ Friendship: 87% ████████████████░   │ │
│ │ Bond with Oreo: 78%                 │ │
│ │ [Deactivate]                        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Stardust Sanctuary (1 / 10)             │
│ ┌─────────────────────────────────────┐ │
│ │ Cinnamon - Peruvian                 │ │
│ │ Friendship: 89% (frozen)            │ │
│ │ Bond with Oreo: 65% (preserved)     │ │
│ │ [Activate]                          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Stardust Sanctuary Slots                │
│ Slots 1-3: Free ✓                       │
│ Slot 4: $50 [Purchase]                  │
│ Slot 5: $100 [Purchase]                 │
│ ... up to Slot 10: $3,200               │
└─────────────────────────────────────────┘
```

**Features:**
- **Active Section:** Shows currently active guinea pigs (max 2)
  - Friendship % with live updates
  - Bond relationships display
  - "Deactivate" button (moves to Stardust Sanctuary)
- **Stardust Sanctuary Section:** Shows guinea pigs in Stardust Sanctuary but inactive
  - Friendship % (frozen)
  - Preserved bonds display
  - "Activate" button (moves to active, requires slot available)
- **Slot Purchase:** Buy additional slots with escalating costs
- **Validation:** Cannot activate if 2 already active

### Game View Updates

**Main Play Area:**

**Add:**
- **Friendship progress bars** for each active guinea pig
```
┌─────────────────────────────────────────┐
│ Oreo                                    │
│ Friendship: 73% ████████████░░░░░       │
│ 12% to Stardust Sanctuary! (Need 85%)   │
└─────────────────────────────────────────┘
```

- **"Add to Stardust Sanctuary" button** per guinea pig
```
# Below 85%:
[Add to Stardust Sanctuary] (disabled, grayed)
Tooltip: "Reach 85% friendship to move Oreo to Stardust Sanctuary"

# At 85%+:
[Add to Stardust Sanctuary ⭐] (enabled, highlighted)
Tooltip: "Move Oreo to your Stardust Sanctuary collection!"
```

- **"Return to Store" button** (replaces "End Session")
```
# Active guinea pigs exist:
[Return to Store] (disabled)
Tooltip: "Move all active guinea pigs to Stardust Sanctuary to return to store"

# All in Stardust Sanctuary (none active):
[Return to Store ✨] (enabled)
Tooltip: "Visit the pet store to adopt new guinea pigs!"
```

**Remove:**
- "End Session" button
- Session timer/duration display

### Pairing Validation UI

**When attempting invalid pairing:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Cannot Pair                          │
├─────────────────────────────────────────┤
│ Cannot pair Oreo (Stardust Sanctuary)   │
│ with Pepper (new guinea pig)!           │
│                                         │
│ Guinea pigs must start from the same    │
│ socialization level.                    │
│                                         │
│ Options:                                │
│ • Adopt two new guinea pigs together    │
│ • Activate two from Stardust Sanctuary  │
│                                         │
│ [OK]                                    │
└─────────────────────────────────────────┘
```

---

## Part 10: Implementation Details

### Phase 1: Friendship System Enhancement (PREREQUISITE)

**Before touching System 6.95, must implement:**

**1. Friendship Gain Methods:**
```typescript
// In guineaPigStore.ts
function increaseFriendshipFromInteraction(
  guineaPigId: string,
  interactionType: string
): void {
  const amounts = {
    'pet': 2,
    'play': 3,
    'handle': 1,
    'groom': 2,
    'feed_sanctuary': 5,
    'feed_normal': 1
  }

  adjustFriendship(guineaPigId, amounts[interactionType] || 1)
}

function increaseFriendshipFromNeed(
  guineaPigId: string,
  needType: string,
  amount: number
): void {
  // +0.5 to +2 based on need fulfillment
  const friendshipGain = amount * 0.02
  adjustFriendship(guineaPigId, friendshipGain)
}

function increaseFriendshipPassive(guineaPigId: string): void {
  const guineaPig = getGuineaPig(guineaPigId)

  // Only if needs are generally satisfied
  const avgNeeds = calculateAverageNeeds(guineaPig)
  if (avgNeeds > 50) {
    adjustFriendship(guineaPigId, 0.1) // Tiny passive gain
  }
}
```

**2. Friendship Display Component:**
```vue
<!-- FriendshipProgress.vue -->
<template>
  <div class="friendship-progress">
    <div class="friendship-progress__header">
      <span class="friendship-progress__label">Friendship</span>
      <span class="friendship-progress__value">{{ friendship }}%</span>
    </div>
    <div class="friendship-progress__bar">
      <div
        class="friendship-progress__fill"
        :style="{ width: `${friendship}%` }"
      ></div>
      <div
        v-if="friendship < 85"
        class="friendship-progress__goal"
        :style="{ left: '85%' }"
      >
        <span class="friendship-progress__goal-label">85%</span>
      </div>
    </div>
    <div v-if="friendship < 85" class="friendship-progress__message">
      {{ 85 - friendship }}% to Stardust Sanctuary!
    </div>
  </div>
</template>
```

**3. Testing & Tuning:**
- Playtest to ensure 85% achievable in 3-5 days
- Adjust gain rates if too slow/fast
- Document friendship mechanics

### Phase 2: Remove Refresh Mechanics

**Files to modify:**

**petStoreManager.ts:**
```typescript
// DELETE:
function refreshPetStore(isAutoRefresh: boolean): void { ... }
const nextAutoRefreshTime = ref(0)
const refreshCostSequence = ref([100, 300, 500, 800, 1600, 3200])
const currentRefreshIndex = ref(0)
const canRefreshPetStore = computed(...)
const nextRefreshCost = computed(...)

// DELETE from settings:
interface PetStoreSettings {
  // Remove:
  storeRefreshCost: number
  allowUnlimitedRefresh: boolean
  autoRefreshEnabled: boolean
  autoRefreshIntervalMs: number
}

// DELETE from persistence:
// Remove all refresh-related state from piniaPluginPersistedstate
```

**PetStoreDebug.vue:**
```vue
<!-- DELETE entire sections: -->
<!-- Refresh Settings panel -->
<!-- "Refresh Pet Store" button -->
<!-- Cost sequence display -->
<!-- "No Charge for Refresh" checkbox -->
<!-- Refresh cost stats -->
```

### Phase 3: Add Natural Store Churn

**petStoreManager.ts additions:**
```typescript
// ADD to GuineaPig interface:
interface StoreGuineaPig extends GuineaPig {
  adoptionTimer: number  // Timestamp when adopted
  adoptionDuration: number  // How long available (ms)
}

// ADD state:
const adoptionTimers = ref<Record<string, number>>({})

// ADD function:
function generateStoreGuineaPig(): StoreGuineaPig {
  const guineaPig = generateRandomGuineaPig()
  const durationDays = Math.floor(Math.random() * 3) + 2 // 2-5 days
  const durationMs = durationDays * 24 * 60 * 60 * 1000
  const adoptionTime = Date.now() + durationMs

  adoptionTimers.value[guineaPig.id] = adoptionTime

  return {
    ...guineaPig,
    adoptionTimer: adoptionTime,
    adoptionDuration: durationMs
  }
}

// ADD function:
function checkAdoptionTimers(): void {
  const now = Date.now()
  const expired: string[] = []

  for (const [id, timer] of Object.entries(adoptionTimers.value)) {
    if (timer <= now) {
      expired.push(id)
    }
  }

  for (const id of expired) {
    replaceAdoptedGuineaPig(id)
  }
}

// ADD function:
function replaceAdoptedGuineaPig(guineaPigId: string): void {
  // Remove old
  availableGuineaPigs.value = availableGuineaPigs.value.filter(
    gp => gp.id !== guineaPigId
  )
  delete adoptionTimers.value[guineaPigId]

  // Add new
  const newGuineaPig = generateStoreGuineaPig()
  availableGuineaPigs.value.push(newGuineaPig)

  // Log
  logging.addSystemMessage(
    `A guinea pig found their forever home! New guinea pig available in the store.`,
    '🏡'
  )
}

// ADD to game tick:
// Call checkAdoptionTimers() every game tick
```

**PetStoreDebug.vue additions:**
```vue
<template>
  <div v-for="guineaPig in sortedAvailableGuineaPigs" :key="guineaPig.id">
    <!-- ... guinea pig info ... -->

    <!-- ADD adoption countdown: -->
    <div class="adoption-timer">
      ⏰ Adopted in {{ formatAdoptionCountdown(guineaPig.adoptionTimer) }}
    </div>
  </div>
</template>

<script setup lang="ts">
function formatAdoptionCountdown(timestamp: number): string {
  const remaining = timestamp - Date.now()
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} days ${hours} hours`
  } else {
    return `${hours} hours`
  }
}
</script>
```

### Phase 4: Implement Stardust Sanctuary Gateway

**petStoreManager.ts modifications:**
```typescript
// MODIFY addToStardustSanctuary to check friendship:
function addToStardustSanctuary(guineaPigId: string): boolean {
  const guineaPigStore = useGuineaPigStore()
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)

  if (!guineaPig) return false

  // ADD friendship check:
  if (guineaPig.friendship < 85) {
    const logging = getLoggingStore()
    logging.logWarn(
      `${guineaPig.name} needs 85% friendship to move to Stardust Sanctuary (currently ${guineaPig.friendship}%)`
    )
    return false
  }

  // Check slot availability
  if (!canAddToStardustSanctuary.value) {
    const logging = getLoggingStore()
    logging.logWarn('No available Stardust Sanctuary slots')
    return false
  }

  // Freeze friendship
  guineaPig.friendshipFrozen = true

  // Save bonds with other guinea pigs in Stardust Sanctuary
  saveBonds(guineaPig)

  // Reset wellness/needs
  guineaPig.wellness = 100
  guineaPigStore.resetGuineaPigNeeds(guineaPigId)

  // Move to Stardust Sanctuary
  const index = availableGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
  if (index !== -1) {
    availableGuineaPigs.value.splice(index, 1)
  }

  stardustSanctuaryGuineaPigs.value.push(guineaPig)

  const logging = getLoggingStore()
  logging.addPlayerAction(
    `${guineaPig.name} moved to Stardust Sanctuary at ${guineaPig.friendship}% friendship! ⭐`,
    '⭐',
    { guineaPigId, friendship: guineaPig.friendship }
  )

  return true
}

// ADD computed:
const canAccessStore = computed(() => {
  // Can only access store when no active guinea pigs
  return activeGuineaPigs.value.length === 0
})
```

**NEW StardustSanctuaryDebug.vue:**
```vue
<template>
  <div class="stardust-sanctuary-debug">
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Stardust Sanctuary ({{ stardustSanctuaryCount }} / {{ maxStardustSanctuarySlots }})</h3>
      </div>

      <div class="panel__content">
        <!-- Active Section -->
        <h4>Active Guinea Pigs ({{ activeCount }} / 2)</h4>
        <div v-for="gp in activeGuineaPigs" :key="gp.id">
          <GuineaPigStardustSanctuaryCard :guineaPig="gp" :isActive="true" />
        </div>

        <!-- Stardust Sanctuary Section -->
        <h4>Stardust Sanctuary ({{ stardustSanctuaryGuineaPigs.length }})</h4>
        <div v-for="gp in stardustSanctuaryGuineaPigs" :key="gp.id">
          <GuineaPigStardustSanctuaryCard :guineaPig="gp" :isActive="false" />
        </div>

        <!-- Slot Purchase -->
        <h4>Stardust Sanctuary Slots</h4>
        <div v-for="slot in slotPurchaseOptions" :key="slot.number">
          <!-- Slot purchase UI -->
        </div>
      </div>
    </div>
  </div>
</template>
```

**GameController.vue updates:**
```vue
<!-- REMOVE -->
<Button @click="handleEndSession">
  End Session
</Button>

<!-- ADD -->
<Button
  @click="handleReturnToStore"
  :disabled="!petStoreManager.canAccessStore"
  :title="storeAccessTooltip"
>
  Return to Store
</Button>

<script setup lang="ts">
const storeAccessTooltip = computed(() => {
  if (petStoreManager.canAccessStore) {
    return 'Visit the pet store to adopt new guinea pigs!'
  } else {
    return `Move all active guinea pigs to Stardust Sanctuary (85% friendship) to return to store`
  }
})

function handleReturnToStore() {
  // Navigate to pet store
  router.push('/pet-store')
}
</script>
```

### Phase 5: Pairing Rules & Bond Preservation

**petStoreManager.ts additions:**
```typescript
// ADD bond preservation:
function saveBonds(guineaPig: GuineaPig): void {
  // Save relationships with other guinea pigs in Stardust Sanctuary
  for (const [partnerId, relationshipLevel] of Object.entries(guineaPig.relationships)) {
    const partner = stardustSanctuaryGuineaPigs.value.find(gp => gp.id === partnerId)
    if (partner) {
      // Both are in Stardust Sanctuary, save bond
      if (!guineaPig.bonds) guineaPig.bonds = {}
      guineaPig.bonds[partnerId] = {
        partnerId,
        relationshipLevel,
        bondedAt: Date.now(),
        timesTogether: 0 // Could track this
      }
    }
  }
}

// ADD pairing validation:
function validatePairing(gp1Id: string, gp2Id: string): {
  valid: boolean
  reason?: string
} {
  const gp1IsStardustSanctuary = stardustSanctuaryGuineaPigs.value.some(f => f.id === gp1Id)
  const gp2IsStardustSanctuary = stardustSanctuaryGuineaPigs.value.some(f => f.id === gp2Id)

  // Both new or both from Stardust Sanctuary: OK
  if (gp1IsStardustSanctuary === gp2IsStardustSanctuary) {
    return { valid: true }
  }

  // Mixed: NOT allowed
  const stardustSanctuaryName = gp1IsStardustSanctuary
    ? getGuineaPig(gp1Id)?.name
    : getGuineaPig(gp2Id)?.name
  const newName = !gp1IsStardustSanctuary
    ? getGuineaPig(gp1Id)?.name
    : getGuineaPig(gp2Id)?.name

  return {
    valid: false,
    reason: `Cannot pair ${stardustSanctuaryName} (Stardust Sanctuary) with ${newName} (new). Guinea pigs must start from the same socialization level.`
  }
}

// MODIFY startGameSession:
function startGameSession(guineaPigIds: string[]): boolean {
  if (guineaPigIds.length === 2) {
    const validation = validatePairing(guineaPigIds[0], guineaPigIds[1])
    if (!validation.valid) {
      const logging = getLoggingStore()
      logging.logError(validation.reason!)
      return false
    }
  }

  // ... rest of existing startGameSession logic

  // Restore bonds if both are sanctuarys
  if (guineaPigIds.length === 2) {
    restoreBondsIfExists(guineaPigIds[0], guineaPigIds[1])
  }

  return true
}

// ADD bond restoration:
function restoreBondsIfExists(id1: string, id2: string): void {
  const guineaPigStore = useGuineaPigStore()
  const gp1 = guineaPigStore.getGuineaPig(id1)
  const gp2 = guineaPigStore.getGuineaPig(id2)

  if (!gp1 || !gp2) return

  // Check if they have saved bond
  if (gp1.bonds && gp1.bonds[id2]) {
    gp1.relationships[id2] = gp1.bonds[id2].relationshipLevel
  } else {
    gp1.relationships[id2] = 0
  }

  if (gp2.bonds && gp2.bonds[id1]) {
    gp2.relationships[id1] = gp2.bonds[id1].relationshipLevel
  } else {
    gp2.relationships[id1] = 0
  }
}
```

### Phase 6: Remove Session Ending

**DELETE files:**
- `src/components/game/SessionEndingDialog.vue`

**petStoreManager.ts:**
```typescript
// DELETE:
function endGameSession(): void { ... }
interface GameSession { ... }
const activeGameSession = ref<GameSession | null>(null)
const settings.endGamePenalty
```

**GameController.vue:**
```vue
<!-- DELETE: -->
<Button @click="handleEndSession">
  Return Guinea Pigs & End Session
</Button>

<SliderField v-model="endGamePenalty" />

<!-- DELETE script functions: -->
function handleEndSession() { ... }
function handleConfirmEndSession() { ... }
function handleCancelEndSession() { ... }
function handleSanctuaryeNonSanctuaryes() { ... }
```

---

## Part 11: Testing Plan

### Unit Tests

**Friendship System:**
- [ ] Friendship increases from positive interactions
- [ ] Friendship increases from need fulfillment
- [ ] Friendship passive gain when needs > 50%
- [ ] Friendship decreases from neglect
- [ ] 85% threshold achievable in 3-5 days with good care

**Moving to Stardust Sanctuary:**
- [ ] Cannot move to Stardust Sanctuary below 85% friendship
- [ ] Can move to Stardust Sanctuary at exactly 85%
- [ ] Can move to Stardust Sanctuary above 85%
- [ ] Friendship freezes when in Stardust Sanctuary
- [ ] Wellness/needs reset when moved to Stardust Sanctuary

**Adoption Timers:**
- [ ] Timers generated correctly (2-5 days)
- [ ] Timers persist across sessions
- [ ] Guinea pigs replaced when timer expires
- [ ] Replacement generates new random guinea pig

**Pairing Validation:**
- [ ] New + New pairing allowed
- [ ] Stardust Sanctuary + Stardust Sanctuary pairing allowed
- [ ] New + Stardust Sanctuary pairing blocked
- [ ] Error message shown for invalid pairing

**Bond Preservation:**
- [ ] Bonds saved when both guinea pigs in Stardust Sanctuary
- [ ] Bonds restored when re-paired
- [ ] Bonds reset when paired with new partner
- [ ] Bonds tracked correctly across multiple pairings

### Integration Tests

**Store Access Gating:**
- [ ] Store locked when active guinea pigs exist
- [ ] Store unlocked when all active moved to Stardust Sanctuary
- [ ] "Return to Store" button disabled correctly
- [ ] "Return to Store" button enabled when unlocked

**Stardust Sanctuary Flow:**
- [ ] Adopt → bond to 85% → move to Stardust Sanctuary → return to store works end-to-end
- [ ] Can adopt new guinea pigs after moving previous ones to Stardust Sanctuary
- [ ] Cannot move to Stardust Sanctuary while below 85%
- [ ] Stardust Sanctuary slots purchasable up to 10

**Safety Nets:**
- [ ] Guinea Pig Rescue preserves guinea pigs in Stardust Sanctuary
- [ ] Guinea Pig Rescue doesn't remove any guinea pigs
- [ ] Fresh Start preserves guinea pigs in Stardust Sanctuary
- [ ] Fresh Start preserves Stardust Sanctuary slots

### Manual Testing Checklist

**First Time Experience:**
- [ ] See 10 guinea pigs in store
- [ ] "Observe" shows personality message
- [ ] "Observe" can only be used once per guinea pig
- [ ] Adoption countdown displays correctly
- [ ] Adoption warning shown on first adoption

**Friendship Building:**
- [ ] Positive interactions increase friendship visibly
- [ ] Friendship progress bar updates in real-time
- [ ] 85% goal indicator shows clearly
- [ ] "Add to Stardust Sanctuary" button disabled until 85%
- [ ] "Add to Stardust Sanctuary" button enabled at 85%+

**Moving to Stardust Sanctuary:**
- [ ] Clicking "Add to Stardust Sanctuary" at 85%+ moves to Stardust Sanctuary
- [ ] Friendship frozen in Stardust Sanctuary
- [ ] Guinea pig removed from active
- [ ] Store access unlocked if last guinea pig moved to Stardust Sanctuary
- [ ] Activity log message shown

**Store Churn:**
- [ ] Adoption timers count down correctly
- [ ] Guinea pigs replaced when timer expires
- [ ] New guinea pigs appear in store
- [ ] Timers persist across app restart

**Pairing:**
- [ ] Can pair two new guinea pigs
- [ ] Can pair two guinea pigs from Stardust Sanctuary
- [ ] Cannot pair new + Stardust Sanctuary (error shown)
- [ ] Bonds restored when re-pairing guinea pigs from Stardust Sanctuary
- [ ] Bonds reset when pairing with new partner

**Stardust Sanctuary Panel:**
- [ ] Active guinea pigs shown correctly
- [ ] Guinea pigs in Stardust Sanctuary shown correctly
- [ ] Friendship % displays (frozen for guinea pigs in Stardust Sanctuary)
- [ ] Bonds display correctly
- [ ] Can activate guinea pigs from Stardust Sanctuary
- [ ] Can deactivate active guinea pigs

**UI/UX:**
- [ ] No refresh button exists
- [ ] No session ending button exists
- [ ] "Return to Store" button works correctly
- [ ] Tooltips accurate and helpful
- [ ] No console errors

---

## Part 12: Success Criteria

### Core Mechanics Working

✅ **Permanent Adoption:**
- Cannot return or abandon guinea pigs
- Must work with adopted guinea pigs
- No removal except rescue/fresh start

✅ **Friendship Gating:**
- 85% friendship required to move to Stardust Sanctuary
- Achievable in 3-5 days with good care
- Friendship freeze in Stardust Sanctuary working

✅ **Store Access Gating:**
- Store locked when active guinea pigs exist
- Store unlocked when all moved to Stardust Sanctuary
- Clear UI feedback

✅ **Natural Store Churn:**
- Adoption timers working
- Guinea pigs replaced automatically
- No manual refresh mechanics

✅ **Pairing Rules:**
- New + New allowed
- Stardust Sanctuary + Stardust Sanctuary allowed
- New + Stardust Sanctuary blocked

✅ **Bond Preservation:**
- Bonds saved in Stardust Sanctuary
- Bonds restored on re-pairing
- Bonds reset with new partners

### Player Experience

✅ **Intuitive:**
- Clear progression path (adopt → bond → Stardust Sanctuary)
- Understand what's required to move to Stardust Sanctuary
- Know when can return to store

✅ **Rewarding:**
- Moving to Stardust Sanctuary feels like achievement
- Building friendship is satisfying
- Collection building is long-term goal

✅ **Fair:**
- No punishing mechanics
- Rescue provides safety net
- Fresh Start preserves progress

✅ **No Frustration:**
- No accidental permanent loss
- No expensive refresh spam
- Natural store evolution

### Technical Quality

✅ **Performance:**
- Adoption timers don't impact performance
- Friendship calculations efficient
- UI updates smoothly

✅ **Persistence:**
- Adoption timers survive restart
- Friendship levels persist
- Bonds saved correctly

✅ **Bug-Free:**
- No edge cases breaking system
- Pairing validation robust
- Stardust Sanctuary system stable

---

## Part 13: Migration Notes

### Existing Save Data

**Current players will have:**
- Guinea pigs in Stardust Sanctuary (some may be below 85% friendship)
- Active game sessions
- Refresh cost progression

**Migration Strategy:**

**Option A: Grandfather existing guinea pigs in Stardust Sanctuary**
```typescript
// On system upgrade, all existing guinea pigs in Stardust Sanctuary are valid
// regardless of friendship level
for (const stardustResident of existingStardustSanctuaryResidents) {
  if (stardustResident.friendship < 85) {
    stardustResident.friendship = 85 // Bump to minimum
  }
  stardustResident.friendshipFrozen = true
}
```

**Option B: Hard reset (aggressive)**
```typescript
// Clear all guinea pigs from Stardust Sanctuary
// Clear active sessions
// Reset to fresh store
// Give compensation (bonus currency, free slots)
```

**Recommendation:** Option A (grandfather existing guinea pigs in Stardust Sanctuary)
- Less disruptive to players
- Preserves emotional investment
- Can still enforce 85% for new guinea pigs moving to Stardust Sanctuary

### Backwards Compatibility

**Not Backwards Compatible:**
This is a **breaking change** that fundamentally alters system behavior.

**Version Strategy:**
1. Mark as major version bump (v2.0)
2. Announce changes clearly
3. Provide migration path
4. Consider beta testing period

### Deprecation Timeline

**Phase 1: Documentation (Week 1)**
- Write new system documentation ✅ (this document)
- Update related system docs
- Create migration guide

**Phase 2: Implementation (Week 2-3)**
- Remove refresh mechanics
- Add adoption timers
- Implement friendship gating
- Create Sanctuaryes panel
- Remove session ending

**Phase 3: Testing (Week 4)**
- Unit tests
- Integration tests
- Manual playtesting
- Balance tuning

**Phase 4: Migration (Week 5)**
- Implement save data migration
- Test migration thoroughly
- Prepare rollback plan

**Phase 5: Release (Week 6)**
- Deploy with version bump
- Monitor for issues
- Gather player feedback
- Iterate as needed

---

## Part 14: Related Systems

### Systems That Need Updates

**System 6.5: Pet Store & Game Session Manager**
- Update to remove session ending
- Add adoption timer mechanics
- Remove refresh logic

**System 6.9: Guinea Pig Stardust Sanctuary**
- Update to add friendship requirement
- Add friendship freeze mechanic
- Add bond preservation
- Create Stardust Sanctuary debug panel

**System 7: Needs System**
- May need to tie into friendship gains
- Consider need satisfaction → friendship link

**Phase 2.5 Systems:**
- **System 1: Personality Traits** - May affect friendship gain rates
- **System 2: Preferences** - Favorite foods/activities increase friendship more
- **System 4: Guinea Pig Rescue** - Update to preserve guinea pigs in Stardust Sanctuary
- **System 5: Activity Messages** - Add friendship milestone messages

### Systems That Benefit

**Future Systems:**
- **Achievement System** - "Moved first guinea pig to Stardust Sanctuary" achievement
- **Bonding System** - Preserved bonds tie in naturally
- **Skills System** - Skills could persist in Stardust Sanctuary

---

## Summary

This redesign **completely transforms** System 6.95 from a "session management with consequences" system to a "permanent adoption with earned progression" system.

### Key Pillars:

1. **Permanent Adoption** - No returns, ever
2. **Friendship-Gated Stardust Sanctuary** - Must earn 85% friendship
3. **Natural Store Churn** - Adoption timers replace manual refresh
4. **Store Access Gating** - Must move all active to Stardust Sanctuary to return
5. **Bond Preservation** - Relationships matter and persist

### What Changes:

- ❌ Remove ALL refresh mechanics (manual + auto)
- ❌ Remove session ending concept entirely
- ❌ Remove Stardust Sanctuary from Pet Store UI
- ✅ Add adoption timers to store guinea pigs
- ✅ Add 85% friendship requirement for moving to Stardust Sanctuary
- ✅ Add store access gating
- ✅ Add bond preservation system
- ✅ Add pairing validation
- ✅ Create dedicated Stardust Sanctuary debug panel

### Estimated Effort:

**Major system overhaul** requiring:
- Complete documentation rewrite ✅ (done)
- Significant code refactoring across multiple stores
- New UI components (StardustSanctuaryDebug.vue)
- Extensive testing and tuning
- Save data migration strategy

**Timeline:** 5-6 weeks full implementation + testing
**Priority:** High - fundamental to game progression loop
**Risk:** Medium - breaking change but well-defined scope
