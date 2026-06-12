# System 2.5: Fulfillment Limitation System

**Phase:** 2.5 - Interactive Feedback Enhancement
**Status:** ➡️ **Moved to Phase 5 as [System 23.5](../phase5/system-23.5-fulfillment-limitation.md)**
**Dependencies:** System 1 (Personality), System 2 (Preferences), System 7 (Needs), System 8 (Needs Controller)

> **⚠️ Note:** This system has been moved to Phase 5 as **[System 23.5: Fulfillment Limitation System](../phase5/system-23.5-fulfillment-limitation.md)** due to its focus on strategic resource management, which fits naturally between System 23 (Enrichment & Resource Management) and System 24 (Progression & Economy). Please refer to the Phase 5 version for the most current specification.

## Overview

The Fulfillment Limitation System prevents exploitation of user-to-guinea pig interactions by introducing realistic consumption limits and interaction rejection mechanics. This system adds depth to gameplay by requiring strategic timing and wellness management.

## Core Mechanics

### 1. Consumption Limits (Hunger Cycle Based)

#### Hunger Cycle Definition
- **Cycle period:** Time for hunger to decay from 100% → 25%
- **Base duration:** ~3.75 minutes (75 points ÷ 20 decay rate)
- **Personality modified:** 3-5 minutes depending on friendliness trait
- **Reset trigger:** When hunger is fulfilled back to 100%

#### Consumable Limits Per Cycle
| Food Type   | Servings Per Cycle | Notes                    |
|-------------|-------------------|--------------------------|
| Fruit       | 1                 | High sugar, limited      |
| Vegetables  | 3                 | Primary nutrition source |
| Pellets     | 2                 | Fortified food           |
| Treats      | 1                 | Special reward           |
| Hay         | Unlimited         | Can always be eaten      |

#### Implementation Details
- Track consumption in guinea pig state
- Disable feed buttons when limit reached
- Display "X/Y remaining" counters in UI
- Reset all consumption counters when hunger fulfilled to 100%
- Hay consumption never limited or tracked

### 2. Interaction Rejection System

#### Rejection Probability Calculation

**Base Rejection Rates:**
```
Low friendliness (1-3) + Low friendship (0-30) = 75% base rejection
High friendliness (8-10) + Low friendship (0-30) = 50% base rejection
High friendship (70+) = Minimal rejection regardless of friendliness
```

**Wellness Modifiers:**
```
Wellness < 30:  +30% rejection (too tired, wants to rest)
Wellness 30-50: +15% rejection (low energy, not feeling well)
Wellness > 70:  -30% rejection (healthy, in good mood)
```

**Final Rejection Rate:**
```
rejection_rate = base_rate + wellness_modifier
rejection_rate = clamp(rejection_rate, 0%, 100%)
```

#### Example Scenarios

| Friendliness | Friendship | Wellness | Base | Modifier | Final | Behavior |
|--------------|------------|----------|------|----------|-------|----------|
| 2            | 20         | 25       | 75%  | +30%     | 100%  | Too tired, wants rest |
| 2            | 20         | 80       | 75%  | -30%     | 45%   | Healthy, more willing |
| 9            | 20         | 55       | 50%  | 0%       | 50%   | Moderate chance |
| 9            | 80         | 85       | 10%  | -30%     | 0%    | Healthy & bonded |
| 9            | 80         | 25       | 10%  | +30%     | 40%   | Tired, needs rest |

#### Rejection Consequences

**Cooldown Duration:**
- **Base range:** 30 seconds to 2 minutes
- **Factors:** Personality (friendliness) + friendship + wellness
- **Formula:** `cooldown = 30s + ((100 - friendship) * 0.9) + wellness_modifier`
- **Wellness impact:**
  - High wellness (>70): -15s (recovers faster, in good mood)
  - Low wellness (<30): +15s (needs more recovery time)

**Friendship Penalty:**
- **Range:** -1% to -5% per rejection
- **Calculation:** Randomized, scales with rejection severity
- **Formula:** `penalty = -(1 + random(0, 4))`
- **Applied:** Immediately upon rejection

**UI Behavior:**
- Disable play/socialize buttons during cooldown
- Display rejection message (e.g., "Squeaky ran away! Try again in 1m 20s")
- Show countdown timer on disabled buttons (optional)

### 3. State Management

#### Guinea Pig State Extensions

```typescript
// Added to GuineaPig interface
consumptionLimits: {
  fruit: { consumed: number, limit: number }
  vegetables: { consumed: number, limit: number }
  pellets: { consumed: number, limit: number }
  treats: { consumed: number, limit: number }
}

interactionRejection: {
  lastRejectionTime: number | null
  cooldownEndTime: number | null
  rejectionCount: number
  isOnCooldown: boolean
}

lastHungerResetLevel: number
```

#### Initialization Defaults

```typescript
consumptionLimits: {
  fruit: { consumed: 0, limit: 1 },
  vegetables: { consumed: 0, limit: 3 },
  pellets: { consumed: 0, limit: 2 },
  treats: { consumed: 0, limit: 1 }
}

interactionRejection: {
  lastRejectionTime: null,
  cooldownEndTime: null,
  rejectionCount: 0,
  isOnCooldown: false
}

lastHungerResetLevel: 100
```

## UI Components

### FeedingDebug.vue (New)

**Purpose:** Dedicated feeding panel with consumption tracking

**Features:**
- Food type selector (fruit/vegetables/pellets/treats/hay)
- Consumption counters: "1/3 vegetables remaining"
- Feed button (disabled when limit reached)
- "Fulfill Session Hunger" button (fills hunger to 100%, resets limits)
- Visual indication of disabled state (grayed out, tooltip explanation)

**Layout:**
```
┌─────────────────────────────────┐
│ Feeding Panel                   │
├─────────────────────────────────┤
│ Food Type: [Vegetables ▼]      │
│                                 │
│ Servings Remaining: 2/3         │
│                                 │
│ [Feed Vegetables]               │
│                                 │
│ [Fulfill Session Hunger]        │
└─────────────────────────────────┘
```

### NeedsDebug.vue (Simplified)

**Changes:**
- Remove food selector (moved to FeedingDebug)
- Keep single "Fulfill Need" button
- Keep need type selector
- Fulfilling hunger still counts toward session hunger (shared state)

**Updated Layout:**
```
┌─────────────────────────────────┐
│ Needs Panel                     │
├─────────────────────────────────┤
│ Need Type: [Hunger ▼]          │
│                                 │
│ Current Value: 45%              │
│                                 │
│ [Fulfill Need]                  │
└─────────────────────────────────┘
```

## Technical Implementation

### Store Methods

#### guineaPigStore.ts

**New Methods:**
```typescript
// Consumption tracking
feedGuineaPig(guineaPigId: string, foodType: FoodType): FeedResult
checkConsumptionLimit(guineaPigId: string, foodType: FoodType): boolean
resetConsumptionLimits(guineaPigId: string): void
getRemainingServings(guineaPigId: string, foodType: FoodType): number

// Interaction rejection
attemptInteraction(guineaPigId: string, interactionType: InteractionType): InteractionResult
calculateRejectionProbability(guineaPigId: string): number
applyRejectionPenalty(guineaPigId: string): void
calculateRejectionCooldown(guineaPigId: string): number
isInteractionOnCooldown(guineaPigId: string): boolean
getRemainingCooldown(guineaPigId: string): number
```

**Modified Methods:**
```typescript
// Add consumption limit reset logic when hunger fulfilled to 100%
fulfillNeed(guineaPigId: string, needType: string, amount: number): void
```

### Type Definitions

```typescript
// src/types/guineaPig.ts

export type FoodType = 'fruit' | 'vegetables' | 'pellets' | 'treats' | 'hay'

export type InteractionType = 'play' | 'social'

export interface ConsumptionLimit {
  consumed: number
  limit: number
}

export interface ConsumptionLimits {
  fruit: ConsumptionLimit
  vegetables: ConsumptionLimit
  pellets: ConsumptionLimit
  treats: ConsumptionLimit
}

export interface InteractionRejection {
  lastRejectionTime: number | null
  cooldownEndTime: number | null
  rejectionCount: number
  isOnCooldown: boolean
}

export interface FeedResult {
  success: boolean
  message: string
  hungerGained?: number
  remainingServings?: number
}

export interface InteractionResult {
  success: boolean
  rejected: boolean
  message: string
  cooldownSeconds?: number
  friendshipPenalty?: number
}
```

## Integration with Existing Systems

### System 1: Personality Trait Influences
- **Friendliness:** Base rejection rate modifier
- **Playfulness:** Affects rejection for play interactions specifically
- **Decay rates:** Already affects hunger cycle duration

### System 2: Preferences (Likes/Dislikes)
- Food preferences already implemented
- Consumption limits apply after preference checks
- Disliked foods still count toward consumption limits

### System 7: Needs System
- Hunger need structure already exists
- Consumption fills hunger based on food type
- Wellness calculation already implemented

### System 8: Needs Controller
- Need fulfillment logic present
- Add consumption limit reset on hunger fulfillment
- Wellness values used in rejection calculations

### Future Integration: Phase 3 (Inventory)
- Consumption tracking provides foundation for inventory system
- Food item quantities will replace "servings remaining"
- Purchase history can inform consumption patterns

### Future Integration: Phase 4 (Friendship)
- Rejection penalties affect bonding progression
- Friendship levels influence rejection rates
- Positive interactions during high wellness boost friendship more

## Game Balance Considerations

### Consumption Limits
- **Vegetables (3):** Primary nutrition, allows flexibility
- **Pellets (2):** Fortified food, moderate limit
- **Fruit (1):** High sugar, intentionally restricted
- **Treats (1):** Special reward, very limited
- **Hay (unlimited):** Realistic behavior, always available

### Rejection Mechanics
- **Low friendship + low wellness:** Hardest interactions (doesn't trust + feels bad)
- **Low friendship + high wellness:** Moderate interactions (healthy but wary)
- **High friendship + high wellness:** Easiest interactions (trusts you + feels good)
- **High friendship + low wellness:** Moderate-hard interactions (trusts you but needs rest)

### Strategic Gameplay
- **Timing matters:** Interact when wellness is high (healthy, good mood)
- **Build friendship first:** Reduces rejection rates long-term
- **Manage wellness:** Low wellness increases rejection (guinea pig needs rest)
- **Plan feeding:** Distribute servings across hunger cycle strategically

## Success Criteria

✅ Feed buttons disabled when consumption limits reached
✅ Counters show "X/Y remaining" for each food type
✅ Limits reset when hunger fulfilled to 100%
✅ Play/social interactions rejected based on personality + friendship + wellness
✅ Rejection cooldown prevents spam (30s-2min)
✅ Interaction buttons disabled during cooldown
✅ Rejection messages displayed with clear feedback
✅ Friendship penalty applied on rejection (-1% to -5%)
✅ Wellness modifiers affect both rejection rate and cooldown duration

## Testing Scenarios

### Consumption Limits
1. Feed fruit once → button disabled → fulfill hunger → button enabled
2. Feed vegetables 3 times → button disabled → verify counter accuracy
3. Feed hay multiple times → never disabled → no counter shown
4. Partial consumption (2/3 veggies) → fulfill hunger → resets to 0/3

### Interaction Rejection
1. Low friendliness (2) + low friendship (20) + high wellness (80) → ~100% rejection
2. High friendliness (9) + high friendship (80) + low wellness (25) → ~0% rejection
3. Rejection → verify cooldown applied → buttons disabled → countdown shown
4. Multiple rejections → verify friendship penalty applied correctly
5. Rejection → wait for cooldown → buttons re-enabled → can attempt again

### Edge Cases
1. Hunger at exactly 100% → limits already reset → no double-reset
2. Hunger fulfilled from 24% → verify reset triggers correctly
3. Multiple guinea pigs → verify independent tracking
4. Session reload → verify consumption limits persist
5. Cooldown expires during session pause → verify time calculation correct

## Future Enhancements (Post-Phase 2.5)

- **Visual animations:** Guinea pig runs away on rejection (Phase 3+)
- **Sound effects:** Rejection squeaks, cooldown timer ticks (Phase 5)
- **Advanced preferences:** Liked foods have slightly higher limits (Phase 3)
- **Wellness messages:** "Too tired to play" vs "Too energetic to sit still" (System 5)
- **Friendship bonuses:** High friendship reduces cooldown duration (Phase 4)
- **Personality variations:** Timid guinea pigs have longer cooldowns (Phase 3+)

## Food Serving Guide (UI Component)

**Priority:** MEDIUM
**Category:** Documentation & UX

**Goal:** Create visual food serving guide to help players understand feeding limits and recommendations

**Integration Points:**
- Add info button in InventorySidebar near food category
- Tooltip/popover showing serving guide
- Optional: In-game "Guinea Pig Care Guide" section

**Content Format:**
- **Vegetables:** "Feed 1 cup daily (4-6 servings)"
- **Fruits:** "Feed sparingly as treats (1-2 servings daily)"
- **Pellets:** "Feed 1/8 cup daily (2-3 servings)"
- **Hay:** "Unlimited - always available"

**Files to Create:**
- Component for food serving guide display (modal or popover)
- Markdown documentation for reference

**Files to Modify:**
- [InventorySidebar.vue](../../../src/components/game/habitat/sidebars/InventorySidebar.vue) - Add info button to food section

**Note:** This complements the consumption limits system (System 10.2.5) and provides educational value to players

---

## Notes

- This system reinforces the need to maintain high wellness for successful interactions
- Low wellness creates interaction challenges (guinea pig needs rest/care)
- High wellness enables easier interactions (guinea pig feels good, more willing)
- Low wellness rejection is realistic behavior (sick/tired animals avoid activity)
- Strategic players will aim for high wellness (>70) for easiest interactions
- Consumption limits prevent "spam feeding" to rapidly boost hunger
- Hay as unlimited food ensures guinea pig can always eat (realistic behavior)
