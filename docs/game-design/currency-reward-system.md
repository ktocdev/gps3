# Currency Reward System Design

## Overview
A hybrid currency system that rewards players for keeping guinea pigs happy through passive income generation, with small active bonuses for engagement.

---

## Core Mechanic: Friendship Dividends

**Concept:** Guinea pigs "earn" currency based on their friendship bond with you

**Lore:** Happy guinea pigs at the sanctuary attract visitors who leave donations based on the bond you've built

### Passive Income Formula
```typescript
// For active guinea pigs (not in Stardust Sanctuary)
activeIncome = activePigs.reduce((sum, pig) => {
  const friendshipMultiplier = pig.friendshipPoints / 100  // e.g., 850 points = 8.5x
  const wellnessMultiplier = pig.wellness / 100            // e.g., 80% = 0.8x
  return sum + (friendshipMultiplier * wellnessMultiplier * 20)
}, 0)

// For Stardust Sanctuary guinea pigs (friendship-only, wellness always 100%)
sanctuaryIncome = sanctuaryPigs.reduce((sum, pig) => {
  const friendshipMultiplier = pig.friendshipPoints / 100  // Scales infinitely
  return sum + (friendshipMultiplier * 30)  // Higher base rate for sanctuary
}, 0)

// Total
hourlyIncome = activeIncome + sanctuaryIncome
```

**Example Calculations:**

**Active Guinea Pigs:**
- 1 pig, 200 friendship points, 60% wellness: `(200/100) × (60/100) × 20 = 24/hour`
- 1 pig, 500 friendship points, 80% wellness: `(5.0) × (0.8) × 20 = 80/hour`
- 3 pigs, 300 avg points, 80% wellness each: `(3.0) × (0.8) × 20 × 3 = 144/hour`

**Stardust Sanctuary Guinea Pigs:**
- 1 pig, 850 points (just reached sanctuary): `(850/100) × 30 = 255/hour`
- 1 pig, 1500 points (long-time friend): `(1500/100) × 30 = 450/hour`
- 2 pigs, 1000 avg points: `(10.0) × 30 × 2 = 600/hour`

**Combined Example:**
- 3 active pigs (300 points, 80% wellness): 144/hour
- 2 sanctuary pigs (1000 points average): 600/hour
- **Total:** 744/hour

### Offline Accumulation
- Currency accumulates while player is offline
- **Cap:** 8 hours maximum (prevents feeling forced to check constantly)
- Visual feedback when collecting accumulated income on return
- Tooltip: "Your guinea pigs earned XXX currency while you were away!"

---

## Bonus Systems

### 1. Daily Login Bonus
- **Amount:** +100 currency
- **Frequency:** Once per 24-hour period
- **Purpose:** Encourages daily engagement without being punishing

### 2. Interaction Bonuses
- **Amount:** +5 currency per meaningful action
- **Triggers:**
  - Feeding guinea pigs
  - Cleaning habitat (removing poop)
  - Playing/interacting
  - Grooming/care activities
- **Purpose:** Rewards active engagement with minimal friction

### 3. Friendship Milestone Bonuses
- **Amount:** One-time currency bonuses for friendship milestones
- **Milestones:**
  - 250 points: +100 currency
  - 500 points: +250 currency
  - 850 points (Stardust Sanctuary): +500 currency
  - 1000 points: +500 currency
  - 1500 points: +750 currency
  - 2000 points: +1000 currency
- **Purpose:** Celebrate progression and provide currency boosts for long-term bonds

---

## Progression Examples

### Early Game (First Day)
- **Setup:** 1 guinea pig, 100 friendship points (starting), 60% wellness
- **Hourly income:** `(1.0) × (0.6) × 20 = 12/hour`
- **With interactions:** ~12 + (10 interactions × 5) = 62 currency/hour
- **Daily login:** +100 currency
- **Milestone bonus:** +100 (reached 250 points)
- **First day total:** ~400-500 currency

### Mid Game (Week 1-2)
- **Setup:** 3 guinea pigs, 400 avg friendship points, 80% wellness
- **Hourly income per pig:** `(4.0) × (0.8) × 20 = 64/hour`
- **Total passive:** 64 × 3 = 192/hour
- **With interactions:** ~192 + bonuses = 250/hour
- **Daily total:** ~800-1000 currency
- **Milestone bonuses:** Multiple pigs hitting 500 points = +750 total

### Late Game (Established Sanctuary)
- **Setup:** 3 active pigs (500 points, 85% wellness), 2 sanctuary pigs (1200 points avg)
- **Active income:** `(5.0) × (0.85) × 20 × 3 = 255/hour`
- **Sanctuary income:** `(12.0) × 30 × 2 = 720/hour`
- **Total passive:** 975/hour
- **With active play:** ~1200/hour
- **Daily total:** ~4000-5000 currency

### End Game (Long-Term Players)
- **Setup:** 2 active pigs (800 points, 90% wellness), 5 sanctuary pigs (2000+ points avg)
- **Active income:** `(8.0) × (0.9) × 20 × 2 = 288/hour`
- **Sanctuary income:** `(20.0) × 30 × 5 = 3000/hour`
- **Total passive:** 3288/hour
- **Daily total:** ~10,000+ currency (supports premium gameplay)

---

## Economy Balancing

### Item Pricing Guidelines
- **Starter items:** 50-100 currency (affordable in first hour)
- **Basic supplies:** 100-200 currency (1-2 hours of play)
- **Premium items:** 500-1000 currency (2-3 days of sustained care)
- **Rare/special items:** 1000-2000 currency (week of progression)

### Daily Income Targets
- **Casual player (1-2 hours/day):** 300-400 currency
- **Active player (3-4 hours/day):** 500-700 currency
- **Dedicated player (5+ hours/day):** 700-1000 currency

### Design Goals
- Players can afford 3-5 basic items per day
- Premium purchases feel meaningful but achievable
- No pressure to play constantly (offline accumulation)
- Rewards good care over grinding

---

## Implementation Plan

### Phase 1: Core Passive Income
**Files to modify:**
- `src/stores/playerProgression.ts` - Add currency tracking
- `src/stores/gameController.ts` - Hook into tick system
- `src/stores/needsController.ts` - Calculate total wellness

**New properties:**
```typescript
interface PlayerProgression {
  currency: number
  lastCurrencyUpdate: number // timestamp
  currencyAccumulated: number // offline earnings
  hourlyIncome: number // calculated rate
}
```

**Core logic:**
```typescript
function calculateHourlyIncome(): number {
  const totalWellness = pets.reduce((sum, pet) => sum + pet.wellness, 0)
  const basePay = (totalWellness / 100) * pets.length * 20
  const sanctuaryBonus = sanctuaryPets.length * 10
  return basePay + sanctuaryBonus
}

function updateCurrency(currentTime: number): void {
  const hoursSinceLastUpdate = (currentTime - lastUpdate) / (1000 * 60 * 60)
  const hoursToProcess = Math.min(hoursSinceLastUpdate, 8) // 8 hour cap
  const earned = hourlyIncome * hoursToProcess

  currency += earned
  currencyAccumulated = earned
  lastCurrencyUpdate = currentTime
}
```

### Phase 2: Interaction Bonuses
**Files to modify:**
- `src/stores/needsController.ts` - Award on feed/clean/play
- `src/stores/habitatConditions.ts` - Award on habitat maintenance

**Logic:**
```typescript
function awardInteractionBonus(action: string): void {
  const bonus = 5
  playerProgression.currency += bonus
  // Optional: Show floating "+5" notification
}
```

### Phase 3: Daily Login & UI
**Files to modify:**
- `src/stores/playerProgression.ts` - Track last login
- `src/components/game/ui/CurrencyDisplay.vue` - New component
- `src/views/HomeView.vue` - Show currency and hourly rate

**UI Elements:**
- Currency counter in header/corner
- "Hourly Income: XXX/hr" indicator
- Offline earnings notification on login
- Tooltip explaining income sources

### Phase 4: Friendship-Based Income Calculation
**Files to modify:**
- `src/stores/playerProgression.ts` - Update income calculation
- `src/stores/guineaPigStore.ts` - Access friendship points
- `src/stores/stardustSanctuary.ts` - Track sanctuary pigs separately

**Logic:**
```typescript
function calculateHourlyIncome(): number {
  const activePigs = guineaPigStore.activeGuineaPigs
  const sanctuaryPigs = stardustSanctuary.sanctuaryPigs

  // Active guinea pigs: friendship × wellness
  const activeIncome = activePigs.reduce((sum, pig) => {
    const friendshipMult = pig.friendshipPoints / 100
    const wellnessMult = pig.wellness / 100
    return sum + (friendshipMult * wellnessMult * 20)
  }, 0)

  // Sanctuary pigs: friendship only (higher rate)
  const sanctuaryIncome = sanctuaryPigs.reduce((sum, pig) => {
    const friendshipMult = pig.friendshipPoints / 100
    return sum + (friendshipMult * 30)
  }, 0)

  return activeIncome + sanctuaryIncome
}
```

### Phase 5: Friendship Milestone Bonuses
**Files to modify:**
- `src/stores/playerProgression.ts` - Track milestones awarded
- `src/stores/guineaPigStore.ts` - Trigger on friendship gain

**Logic:**
```typescript
interface MilestoneBonus {
  points: number
  currency: number
  awarded: boolean
}

const MILESTONES: MilestoneBonus[] = [
  { points: 250, currency: 100 },
  { points: 500, currency: 250 },
  { points: 850, currency: 500 }, // Stardust Sanctuary unlock
  { points: 1000, currency: 500 },
  { points: 1500, currency: 750 },
  { points: 2000, currency: 1000 }
]

function checkFriendshipMilestones(pig: GuineaPig): void {
  const petMilestones = playerProgression.friendshipMilestones.get(pig.id) || []

  MILESTONES.forEach(milestone => {
    const alreadyAwarded = petMilestones.includes(milestone.points)
    if (!alreadyAwarded && pig.friendshipPoints >= milestone.points) {
      playerProgression.currency += milestone.currency
      petMilestones.push(milestone.points)
      // Show notification: "Friendship milestone! +${milestone.currency} currency"
    }
  })

  playerProgression.friendshipMilestones.set(pig.id, petMilestones)
}
```

---

## UI/UX Considerations

### Visual Feedback
- **Currency display:** Always visible (top-right corner or header)
- **Income rate:** Show "XXX/hr" with tooltip breakdown
- **Offline earnings:** Modal or notification when returning
- **Interaction rewards:** Optional floating "+5" text

### Tooltips
- Currency icon: "Total currency available for purchases"
- Hourly rate: "Your guinea pigs earn currency based on their happiness"
- Offline earnings: "Your guinea pigs earned XXX while you were away!"

### Accessibility
- Don't make players feel pressured to check constantly
- Offline cap prevents FOMO
- Daily login is bonus, not requirement
- All content achievable through normal play

---

## Future Expansion Ideas

### Crystal Currency (Premium)
- Optional: Add second currency (crystals) for cosmetic items
- Earned through achievements/milestones
- Never required for gameplay, only cosmetics

### Special Events
- Holiday bonuses: 2x currency weekends
- Care challenges: Bonus currency for sustained high wellness
- Community goals: Shared rewards for player base

### Progression Milestones
- Achievement bonuses (one-time rewards)
- Unlock new income sources at milestones
- Prestige system for long-term players

---

## Notes for Refinement

**Questions to address:**
- Should there be a currency cap to prevent infinite hoarding?
- Do we need a "bank" vs "wallet" system?
- Should offline accumulation show breakdown (per pig)?
- Visual style for currency icon/display?
- Sound effects for earning currency?

**Balance testing needed:**
- Monitor actual player income rates
- Adjust multiplier (currently 20) based on item pricing
- Test offline accumulation feels fair (8 hour cap)
- Ensure interaction bonuses feel rewarding but not grindy
