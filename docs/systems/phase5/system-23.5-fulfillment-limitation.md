# System 23.5: Fulfillment Limitation System

**Phase:** 5 - Polish & Enhancement
**Status:** 📋 Planned (Moved from Phase 2.5 System 10.2.5)
**Dependencies:** System 10.1 (Personality), System 10.2 (Preferences), System 7 (Needs), System 8 (Needs Controller), System 23 (Enrichment & Resource Management)

## Overview

The Fulfillment Limitation System prevents exploitation of user-to-guinea pig interactions by introducing realistic consumption limits and interaction rejection mechanics. This system adds depth to gameplay by requiring strategic timing and wellness management.

**Note:** This system was originally part of Phase 2.5 (System 10.2.5) but has been moved to Phase 5 as System 23.5 due to its focus on strategic resource management gameplay, which fits naturally between System 23 (Enrichment & Resource Management) and System 24 (Progression & Economy).

## Core Mechanics

### 0. Serving-Based Food Items

**Purpose:** Some food items are purchased in multi-serving packs to balance cost and realism

#### Pack-Based Items

**Fruits (6 servings per pack):**
- **Strawberries** - 6 strawberries per pack, 1 strawberry per serving
  - Price: $6 per pack ($1 per serving)
  - Category: Fruit (1 serving per hunger cycle limit)
  - Satisfaction: 15-20 hunger per serving

- **Tomatoes** - 6 tomatoes per pack, 1 tomato per serving
  - Price: $9 per pack ($1.50 per serving)
  - Category: Vegetable (3 servings per hunger cycle limit)
  - Satisfaction: 12-18 hunger per serving

**Basic Treats (6 servings per pack):**
- **Carrot Chips** - 6 chips per pack, 1 chip per serving
  - Price: $12 per pack ($2 per serving)
  - Category: Treat (1 serving per hunger cycle limit)
  - Satisfaction: 10 hunger + 15 happiness

- **Apple Slices** - 6 slices per pack, 1 slice per serving
  - Price: $12 per pack ($2 per serving)
  - Category: Treat (1 serving per hunger cycle limit)
  - Satisfaction: 10 hunger + 15 happiness

- **Dried Herbs** - 6 servings per pack
  - Price: $15 per pack ($2.50 per serving)
  - Category: Treat (1 serving per hunger cycle limit)
  - Satisfaction: 5 hunger + 20 happiness

**Special Treats (1 per purchase):**
- **Premium Treat Box** - Single-use special treat
  - Price: $25 per treat
  - Category: Treat (1 serving per hunger cycle limit)
  - Satisfaction: 15 hunger + 25 happiness + special visual effects

- **Gourmet Veggie Mix** - Single-use premium food
  - Price: $20 per treat
  - Category: Treat (1 serving per hunger cycle limit)
  - Satisfaction: 20 hunger + 20 happiness + glow effect

#### Inventory Management

**Pack Tracking:**
```typescript
interface FoodItem {
  id: string
  name: string
  category: 'fruit' | 'vegetables' | 'pellets' | 'treats' | 'hay'
  packSize: number // Number of servings per purchase
  servingsRemaining: number // Current servings left
  pricePerPack: number
  pricePerServing: number // Calculated: pricePerPack / packSize
  hungerSatisfaction: number
  happinessSatisfaction?: number
}

// Example: Strawberries
{
  id: 'strawberries',
  name: 'Strawberries',
  category: 'fruit',
  packSize: 6,
  servingsRemaining: 6,
  pricePerPack: 6.00,
  pricePerServing: 1.00,
  hungerSatisfaction: 18,
  happinessSatisfaction: 5
}
```

**Purchase Flow:**
```typescript
function purchaseFoodItem(itemId: string): PurchaseResult {
  const item = getStoreItem(itemId)
  const player = getPlayerInventory()

  // Check if player can afford the pack
  if (player.money < item.pricePerPack) {
    return { success: false, reason: 'Insufficient funds' }
  }

  // Deduct pack price
  player.money -= item.pricePerPack

  // Add item to inventory with full servings
  const inventoryItem = {
    ...item,
    servingsRemaining: item.packSize
  }

  player.inventory.push(inventoryItem)

  return {
    success: true,
    message: `Purchased ${item.name} (${item.packSize} servings) for $${item.pricePerPack}`
  }
}
```

**Feeding Flow:**
```typescript
function feedGuineaPig(guineaPigId: string, itemId: string): FeedResult {
  const item = getInventoryItem(itemId)
  const guineaPig = getGuineaPig(guineaPigId)

  // Check consumption limit for this cycle
  if (!canConsumeFood(guineaPig, item.category)) {
    return {
      success: false,
      reason: `${item.category} limit reached for this hunger cycle`
    }
  }

  // Check if servings remain
  if (item.servingsRemaining <= 0) {
    return {
      success: false,
      reason: 'No servings remaining. Purchase more from the store.'
    }
  }

  // Consume 1 serving
  item.servingsRemaining -= 1

  // Remove from inventory if depleted
  if (item.servingsRemaining === 0) {
    removeFromInventory(itemId)
  }

  // Apply hunger satisfaction
  satisfyNeed(guineaPigId, 'hunger', item.hungerSatisfaction)
  if (item.happinessSatisfaction) {
    satisfyNeed(guineaPigId, 'happiness', item.happinessSatisfaction)
  }

  // Track consumption
  trackConsumption(guineaPigId, item.category)

  return {
    success: true,
    message: `Fed 1 serving of ${item.name} (${item.servingsRemaining} servings remaining)`,
    servingsRemaining: item.servingsRemaining
  }
}
```

**UI Display:**
```vue
<!-- InventorySidebar.vue - Food item display -->
<div class="inventory-item">
  <span class="inventory-item__name">{{ item.name }}</span>
  <span class="inventory-item__count">{{ item.servingsRemaining }}/{{ item.packSize }}</span>
  <button
    class="button button--sm"
    :disabled="item.servingsRemaining === 0"
    @click="feedGuineaPig(item.id)"
  >
    Feed (1 serving)
  </button>
</div>

<!-- Store display -->
<div class="store-item">
  <span class="store-item__name">{{ item.name }}</span>
  <span class="store-item__pack-info">Pack of {{ item.packSize }}</span>
  <span class="store-item__price">${{ item.pricePerPack }}</span>
  <span class="store-item__price-per-serving">${{ item.pricePerServing }}/serving</span>
  <button class="button button--sm" @click="purchaseItem(item.id)">
    Buy Pack
  </button>
</div>
```

**Economic Balance:**
- **Pack items** more cost-effective than single purchases
- **Special treats** premium pricing for premium effects
- **Vegetables cheaper per serving** than fruits (reflects real-world costs)
- **Basic treats** mid-tier pricing (convenience + happiness)
- **Inventory management** adds strategic depth (buy in bulk vs immediate need)

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

## Realism Guidelines Documentation

**Purpose:** Document realistic guinea pig behaviors and care practices to guide game design decisions

### Feeding Realism

**Real-World Guinea Pig Diet:**
- **Hay:** 80% of diet, unlimited access (prevents dental issues, aids digestion)
- **Pellets:** 1/8 cup daily per guinea pig (~2-3 servings)
- **Vegetables:** 1 cup daily per guinea pig (~4-6 servings)
- **Fruits:** Occasional treats only (2-3 times per week, high sugar)
- **Treats:** Very limited (1-2 times per week maximum)

**Game Implementation:**
- Hunger cycle = ~4 minutes (compressed timescale)
- Consumption limits reflect proportional serving ratios
- Hay remains unlimited (realistic + prevents starvation)
- Fruit/treats intentionally limited (teaches proper care)

### Behavioral Realism

**Guinea Pig Natural Behaviors:**
- **Social animals:** Need companionship (2+ guinea pigs ideal)
- **Crepuscular:** Most active dawn/dusk (moderate activity all day)
- **Prey animals:** Hide when scared, avoid handling when stressed
- **Vocalizations:** Wheek (excited/hungry), purr (content), chirp (alert)
- **Movement:** Popcorn (happy jump), zoomies (playful running)

**Stress & Wellness:**
- **Low wellness:** Guinea pig becomes withdrawn, less social, hides more
- **Recovery:** Requires rest, food, water, shelter (not immediate)
- **Rejection:** Realistic response to stress (animals avoid interaction when unwell)
- **Bonding:** Takes time, built through consistent positive care

### Care Realism

**Essential Care Requirements:**
- **Space:** Minimum 7.5 sq ft per guinea pig (habitat size matters)
- **Companionship:** Guinea pigs are social, should not live alone
- **Nail trimming:** Every 4-6 weeks (prevents overgrowth injuries)
- **Grooming:** Weekly brushing (long-haired breeds need daily)
- **Cage cleaning:** Spot clean daily, full clean weekly
- **Health checks:** Regular weight monitoring, behavior observation

**Game Simplifications:**
- Compressed timescale (minutes instead of hours/days)
- Simplified needs (11 core needs vs complex real requirements)
- Instant need satisfaction (vs gradual improvement)
- Abstracted illness mechanics (health need vs specific diseases)

### Interaction Realism

**Realistic Guinea Pig Responses:**
- **Trust-based:** New guinea pigs are wary, bonded ones are affectionate
- **Energy-dependent:** Tired guinea pigs avoid play/handling
- **Mood-influenced:** Stressed guinea pigs hide, happy ones explore
- **Personality-driven:** Some guinea pigs are naturally bold or shy

**Unrealistic for Gameplay:**
- **Instant teleportation:** Guinea pigs move instantly (simplified movement)
- **Perfect obedience:** Guinea pigs always eat when fed (player convenience)
- **Rapid bonding:** Friendship builds faster than real-world (game pacing)
- **No aggression:** Guinea pigs don't fight (prevents negative gameplay)

### Documentation Structure

**Guidelines Categories:**
1. **Diet & Nutrition** - Feeding schedules, food types, portions
2. **Behavior & Wellness** - Natural behaviors, stress responses, activity patterns
3. **Care Requirements** - Daily tasks, grooming, health monitoring
4. **Social Dynamics** - Companionship needs, pair bonding, territory
5. **Game Abstractions** - Where gameplay diverges from reality (and why)

**Usage:**
- Reference during feature design (ensure realism where appropriate)
- Balance realism with fun gameplay (educate without overwhelming)
- Document intentional abstractions (explain simplifications)
- Update as new systems added (living document)

**Related Systems:**
- System 10.1 (Personality) - Reflects real guinea pig personality variation
- System 10.2 (Preferences) - Based on real guinea pig food preferences
- System 21 (Social Bonding) - Models real companion bonding
- System 23.5 (Fulfillment Limitation) - Enforces realistic feeding limits

---

## Notes

- This system reinforces the need to maintain high wellness for successful interactions
- Low wellness creates interaction challenges (guinea pig needs rest/care)
- High wellness enables easier interactions (guinea pig feels good, more willing)
- Low wellness rejection is realistic behavior (sick/tired animals avoid activity)
- Strategic players will aim for high wellness (>70) for easiest interactions
- Consumption limits prevent "spam feeding" to rapidly boost hunger
- Hay as unlimited food ensures guinea pig can always eat (realistic behavior)
- Realism guidelines ensure game balance respects real guinea pig care practices
