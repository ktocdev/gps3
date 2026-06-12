# Pet Store & Game Session Manager - System Documentation

**Phase:** Phase 2 (Game Session System)
**Status:** ✅ **Completed**
**Created:** September 27, 2025 | Branch: GPS2-9
**Completed:** September 27, 2025 | Branch: GPS2-11
**Replaces:** Previous save game slot architecture

## Overview

A streamlined single-game session system where guinea pigs are selected from a randomized pet store of 10 guinea pigs. Players can start/end game sessions freely, with guinea pigs returning to the store with reset needs. This approach eliminates permanent deletion concerns and encourages experimentation with different guinea pig combinations.

## Core Concepts

**Pet Store Model:**
- 10 randomly generated guinea pigs available in the "pet store"
- Players select 1-2 guinea pigs to start a game session
- Only one active game session at a time
- Ending a game returns guinea pigs to store with needs reset

**Weighted Rarity System:**
Guinea pig traits are generated using realistic rarity distributions:
- **Breeds:** Range from common to ultra-rare based on real guinea pig availability
- **Colors:** Balanced distribution with special eye color matching
- **Patterns:** Traditional patterns with appropriate rarity weighting

**Smart Eye Color System:**
Pink and red eyes only appear with appropriate light fur colors, creating realistic albino and leucistic appearances.

**Progression Persistence:**
- Currency persists across game sessions
- Non-consumable items persist (habitat furniture, toys, etc.)
- Unused consumables persist (bedding not placed, hay not added, etc.)
- End game penalty: Small currency fine for returning guinea pigs

**Guinea Pig Refresh System:**
- "Swap Guinea Pigs" button replaces entire pet store pool
- 1-hour cooldown between swaps
- Debug mode allows unlimited swaps for testing
- **24-Hour Auto-Refresh:** Guinea pigs automatically refresh daily
  - Timer resets to 24 hours after any refresh (manual or auto)
  - Persistent across sessions - checks on startup if refresh is due
  - Live countdown display showing time until next auto-refresh
  - Can be toggled on/off in debug settings

## Architecture Overview

### 1. PetStoreManager Store (`src/stores/petStoreManager.ts`)

**Manages pet store inventory and game session:**

```typescript
interface PetStoreState {
  // Pet store inventory
  availableGuineaPigs: GuineaPig[] // Always 10 guinea pigs
  lastRefreshTimestamp: number
  refreshCooldownMs: number // Default: 3600000 (1 hour)
  nextAutoRefreshTime: number // Timestamp for next auto-refresh

  // Active game session
  activeGameSession: GameSession | null

  // Settings
  endGamePenalty: number // Currency fine for ending game
  allowUnlimitedRefresh: boolean // Debug mode flag
  autoRefreshEnabled: boolean // Toggle 24-hour auto-refresh
  autoRefreshIntervalMs: number // Default: 86400000 (24 hours)
}

interface GameSession {
  id: string
  startedAt: number
  guineaPigIds: string[] // 1-2 guinea pig IDs
  sessionDuration: number // Tracked play time
}
```

### 2. Persistent Progression Store (`src/stores/playerProgression.ts`)

**Persists across all game sessions:**

```typescript
interface PlayerProgression {
  // Currency (persists across sessions)
  currency: number
  totalCurrencyEarned: number

  // Non-consumable inventory (persists)
  ownedItems: Record<string, OwnedItem>

  // Consumable inventory (persists unused quantities)
  consumables: Record<string, number> // bedding, hay, treats

  // Statistics
  totalGameSessions: number
  totalPlayTime: number
  guineaPigsAdopted: number

  // Achievements (persist)
  unlockedAchievements: string[]
}

interface OwnedItem {
  itemId: string
  purchasedAt: number
  timesUsed: number
}
```

### 3. Game Session State (Resets Each Game)

**State that resets when ending game:**
- Guinea pig needs (all reset to default)
- Guinea pig wellness and friendship
- Habitat conditions (cleanliness, bedding freshness, water level)
- Placed habitat items (consumables removed, non-consumables return to inventory)
- Activity feed history

**State that persists:**
- Player currency (minus end game penalty)
- Owned non-consumable items
- Unused consumable quantities
- Player progression statistics
- Achievements

## User Flows

### Initial App Launch (Empty localStorage)

1. App detects no existing pet store data
2. Generate 10 random guinea pigs with random preferences
3. Display pet store selection interface
4. User selects 1-2 guinea pigs
5. User clicks "Start Game" → Game session begins

### Starting a Game Session

1. Pet store shows 10 available guinea pigs
2. User selects 1-2 guinea pigs (checkboxes)
3. "Start Game" button enabled when 1-2 selected
4. Click Start Game:
   - Create GameSession with selected guinea pig IDs
   - Initialize guinea pig needs to default values
   - Initialize habitat conditions
   - Load game interface

### Ending a Game Session

1. User clicks "End Game & Return Guinea Pigs" button
2. Confirmation dialog shows:
   - Guinea pigs will return to pet store
   - Needs will be reset
   - Currency penalty: `-$X`
   - Items will return to inventory
3. Upon confirmation:
   - Deduct end game penalty from currency
   - Return guinea pigs to pet store
   - Reset guinea pig needs to default
   - Clear habitat conditions
   - Return non-consumables to inventory
   - Persist consumables (unused quantities)
   - Update player statistics
   - Show pet store selection interface

### Refreshing Pet Store (Guinea Pig Swap)

#### Manual Refresh
1. User clicks "Swap Guinea Pigs" button
2. Check cooldown:
   - If on cooldown: Show remaining time
   - If debug mode enabled: Allow swap
   - If cooldown expired: Proceed
3. Confirmation dialog:
   - "This will replace all 10 guinea pigs with new ones"
   - "Current guinea pigs will be permanently lost"
4. Upon confirmation:
   - Generate 10 new random guinea pigs
   - Replace entire availableGuineaPigs array
   - Set lastRefreshTimestamp to now
   - Reset 24-hour auto-refresh timer (if enabled)
   - Show updated pet store

#### 24-Hour Auto-Refresh
1. System checks every minute if auto-refresh is due
2. When `Date.now() >= nextAutoRefreshTime`:
   - Automatically refresh guinea pig pool
   - Set next auto-refresh time to 24 hours from now
   - Log auto-refresh event
3. On app startup:
   - Check if auto-refresh was due while app was closed
   - If due, refresh immediately
   - Restart auto-refresh interval timer
4. Timer behavior:
   - Resets to 24 hours after ANY refresh (manual or auto)
   - Live countdown display updates every second
   - Persists across sessions

## Implementation Steps

### Phase 1: Core Store Implementation

1. **Create PetStoreManager store**
   - Define PetStoreState interface
   - Implement generateRandomGuineaPigs(count: 10)
   - Implement startGameSession(guineaPigIds)
   - Implement endGameSession() with penalty
   - Implement refreshPetStore() with cooldown check
   - Add Pinia persistence configuration
   - Add computed properties for cooldown status

2. **Create PlayerProgression store**
   - Define PlayerProgression interface
   - Implement currency management methods
   - Implement item ownership tracking
   - Implement consumable inventory
   - Implement statistics tracking
   - Add Pinia persistence (separate from game session)

### Phase 2: Guinea Pig Store Integration

1. **Refactor Guinea Pig Store**
   - Remove guinea pig creation methods (no longer needed)
   - Update to work with PetStoreManager
   - Active guinea pigs pulled from game session
   - Needs reset method for returning to store
   - Remove max guinea pig limits (pet store has fixed 10)

2. **Session State Management**
   - Clear method for resetting game session state
   - Initialize method for new game session
   - State coordination with PetStoreManager

### Phase 3: Component Development

1. **Create PetStoreSelection component**
   - Grid display of 10 guinea pigs
   - Show basic info (name, breed, colors, emoji)
   - Multi-select with checkboxes (max 2)
   - "Start Game" button (enabled when 1-2 selected)
   - "Swap Guinea Pigs" button with cooldown display

2. **Create EndGameDialog component**
   - Confirmation dialog for ending game
   - Show currency penalty
   - Explain what resets vs persists
   - Confirm/Cancel buttons

3. **Update GameController component**
   - Add "End Game & Return Guinea Pigs" button
   - Integrate with PetStoreManager
   - Remove guinea pig creation UI (no longer needed)

### Phase 4: Debug Panel Integration

1. **Pet Store Debug Panel**
   - Toggle unlimited refresh mode
   - Force refresh pet store (bypass cooldown)
   - Adjust end game penalty
   - View pet store state
   - Generate specific guinea pig configurations

2. **Player Progression Debug Panel**
   - View/edit currency
   - View owned items
   - View consumable inventory
   - View statistics
   - Reset progression

### Phase 5: Testing & Validation

1. **Game Session Flow**
   - Start game with 1 guinea pig
   - Start game with 2 guinea pigs
   - End game and verify penalty applied
   - Verify guinea pigs returned to store with reset needs
   - Start new game with different guinea pigs

2. **Persistence Testing**
   - Earn currency → end game → verify currency persisted (minus penalty)
   - Purchase items → end game → verify items persisted
   - Use consumables → end game → verify unused quantities persisted
   - Page refresh → verify pet store and progression intact

3. **Guinea Pig Swap Testing**
   - Swap guinea pigs → verify cooldown starts
   - Try swap during cooldown → verify blocked
   - Enable debug mode → verify unlimited swaps
   - Verify pet store completely replaced

## Technical Implementation Details

### Pet Store Generation

```typescript
function generateRandomGuineaPigs(count: 10): GuineaPig[] {
  const guineaPigs: GuineaPig[] = []

  for (let i = 0; i < count; i++) {
    guineaPigs.push({
      id: generateId(),
      name: generateRandomName(),
      breed: randomBreed(),
      colors: randomColors(),
      emoji: randomEmoji(),
      birthDate: Date.now(),

      // Hidden preferences (to be discovered)
      preferences: generateRandomPreferences(),

      // Default needs (will be initialized on game start)
      needs: getDefaultNeeds(),

      // Store metadata
      inStore: true,
      adoptionCount: 0
    })
  }

  return guineaPigs
}
```

### End Game Logic

```typescript
function endGameSession() {
  if (!activeGameSession.value) return

  const penalty = settings.endGamePenalty
  const progression = usePlayerProgression()

  // Apply currency penalty
  progression.deductCurrency(penalty, 'end_game_penalty')

  // Return guinea pigs to store with reset needs
  const guineaPigStore = useGuineaPigStore()
  activeGameSession.value.guineaPigIds.forEach(id => {
    guineaPigStore.resetGuineaPigNeeds(id)
    guineaPigStore.returnToStore(id)
  })

  // Clear habitat (return non-consumables to inventory)
  const habitatStore = useHabitatStore()
  habitatStore.endGameCleanup()

  // Update statistics
  progression.incrementGameSessions()
  progression.addPlayTime(activeGameSession.value.sessionDuration)

  // Clear active session
  activeGameSession.value = null

  // Activity feed
  logActivity('game_session_ended', { penalty })
}
```

### Cooldown Management & Auto-Refresh

```typescript
const canRefreshPetStore = computed(() => {
  if (settings.allowUnlimitedRefresh) return true

  const elapsed = Date.now() - lastRefreshTimestamp.value
  return elapsed >= refreshCooldownMs.value
})

const remainingCooldownMs = computed(() => {
  if (settings.allowUnlimitedRefresh) return 0

  const elapsed = Date.now() - lastRefreshTimestamp.value
  const remaining = refreshCooldownMs.value - elapsed
  return Math.max(0, remaining)
})

const timeUntilAutoRefresh = computed(() => {
  if (!settings.autoRefreshEnabled || nextAutoRefreshTime === 0) return 0
  const remaining = nextAutoRefreshTime - Date.now()
  return Math.max(0, remaining)
})

function refreshPetStore(isAutoRefresh = false) {
  if (!isAutoRefresh && !canRefreshPetStore.value) {
    throw new Error('Pet store refresh on cooldown')
  }

  // Generate new guinea pigs
  availableGuineaPigs.value = generateRandomGuineaPigs(10)
  lastRefreshTimestamp.value = Date.now()

  // Reset auto-refresh timer (24 hours from now)
  if (settings.autoRefreshEnabled) {
    nextAutoRefreshTime = Date.now() + settings.autoRefreshIntervalMs
  }

  const refreshType = isAutoRefresh ? 'auto_refresh' : 'manual_refresh'
  logActivity('pet_store_refreshed', { type: refreshType })
}

function startAutoRefresh() {
  if (!settings.autoRefreshEnabled) return

  // Set next refresh time if not set
  if (nextAutoRefreshTime === 0) {
    nextAutoRefreshTime = Date.now() + settings.autoRefreshIntervalMs
  }

  // Check every minute if it's time to auto-refresh
  autoRefreshInterval = setInterval(() => {
    if (Date.now() >= nextAutoRefreshTime) {
      refreshPetStore(true)
    }
  }, 60000) // Check every minute
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
}
```

## Visual Design

### Pet Store Selection Interface

```
┌─────────────────────────────────────────┐
│ 🏪 Guinea Pig Pet Store                │
│ Select 1-2 guinea pigs to adopt        │
├─────────────────────────────────────────┤
│                                         │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│ │☐GP│ │☑GP│ │☐GP│ │☑GP│ │☐GP│        │
│ └───┘ └───┘ └───┘ └───┘ └───┘        │
│ Name  Name  Name  Name  Name          │
│ Breed Breed Breed Breed Breed         │
│                                         │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│ │☐GP│ │☐GP│ │☐GP│ │☐GP│ │☐GP│        │
│ └───┘ └───┘ └───┘ └───┘ └───┘        │
│ Name  Name  Name  Name  Name          │
│ Breed Breed Breed Breed Breed         │
│                                         │
├─────────────────────────────────────────┤
│ [Start Game] (2 selected)               │
│ [Swap Guinea Pigs] (58m cooldown)      │
└─────────────────────────────────────────┘
```

### End Game Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ ⚠️  End Game & Return Guinea Pigs?    │
├─────────────────────────────────────────┤
│                                         │
│ This will:                              │
│ • Return guinea pigs to pet store      │
│ • Reset their needs                    │
│ • Clear habitat conditions             │
│ • Return items to inventory            │
│                                         │
│ Return Fee: -$50                        │
│                                         │
│ You will keep:                          │
│ ✓ Currency (minus fee)                 │
│ ✓ Purchased items                      │
│ ✓ Unused consumables                   │
│ ✓ Achievements                         │
│                                         │
├─────────────────────────────────────────┤
│ [Cancel] [Confirm & End Game]          │
└─────────────────────────────────────────┘
```

## Expected Outcomes

### Before Implementation:
- ❌ No streamlined game session system
- ❌ Complex multi-slot save game architecture
- ❌ Permanent guinea pig deletion concerns
- ❌ Manual guinea pig creation flow

### After Implementation:
- ✅ Simple single-session game model
- ✅ 10 random guinea pigs always available
- ✅ No guilt about ending games
- ✅ Persistent player progression
- ✅ Encourages experimentation
- ✅ Pet store refresh for variety
- ✅ Clean start/end game flow

## Integration with Existing Systems

### Guinea Pig Store
- Remove creation UI from debug panel
- Add methods for resetting needs
- Add methods for store status (inStore flag)
- Coordinate active guinea pigs with PetStoreManager

### Game Controller
- Add end game button to main controls
- Integrate session state with PetStoreManager
- Update start game logic to check for active session
- Add session duration tracking

### Inventory System (Phase 3)
- Separate consumables from non-consumables
- Track placed vs inventory items
- Return items to inventory on end game
- Persist unused consumables

### Player Progression (New)
- Track currency across sessions
- Track owned items
- Track statistics
- Track achievements

## Settings & Configuration

### PetStoreManager Settings
- `refreshCooldownMs`: 3600000 (1 hour default)
- `endGamePenalty`: 50 (currency fine)
- `allowUnlimitedRefresh`: false (debug mode)
- `autoRefreshEnabled`: false (24-hour auto-refresh toggle)
- `autoRefreshIntervalMs`: 86400000 (24 hours default)
- `guineaPigsInStore`: 10 (fixed)
- `maxGuineaPigsPerGame`: 2

### Debug Mode Overrides
- Unlimited pet store refresh
- Adjustable end game penalty
- Force generate specific guinea pig traits
- Skip cooldowns

## Rarity & Trait Systems

### Weighted Breed Distribution

Guinea pig breeds are generated using weighted rarity based on real-world availability:

**Common Breeds (40% total):**
- American (weight: 100)
- Abyssinian (weight: 100)

**Uncommon Breeds (30% total):**
- Peruvian (weight: 50)
- Teddy (weight: 50)
- Rex (weight: 50)

**Rare Breeds (16% total):**
- Silkie (weight: 20)
- Texel (weight: 20)
- Coronet (weight: 20)
- White Crested (weight: 20)

**Very Rare Breeds (2% total):**
- Alpaca (weight: 5)
- Merino (weight: 5)

**Ultra Rare Breeds (<1% total):**
- Baldwin (weight: 2)
- Skinny Pig (weight: 2)

### Color & Pattern Distribution

**Colors (applies to both fur and skin pigmentation):**
- **Common:** black, white, brown, cream, tortoiseshell, tricolor
- **Uncommon:** orange, gray, red, gold, beige
- **Rare:** chocolate, lilac, buff, dalmatian

**Patterns:**
- **Common:** self, agouti
- **Uncommon:** dutch, brindle, magpie
- **Rare:** roan, satin, himalayan

**Hairless Breed Pattern Restrictions:**

Hairless breeds (Baldwin, Skinny Pig) can only have skin pigmentation patterns and exclude fur-specific patterns:

**Allowed for Hairless:**
- self (solid skin color)
- dutch (pigmentation patches)
- magpie (bicolor split pigmentation)
- dalmatian (pigmented spots)

**Excluded for Hairless:**
- agouti (requires banded fur)
- brindle (requires mixed hair colors)
- roan (requires white/colored hair mixture)
- satin (fur sheen quality)
- himalayan (temperature-sensitive fur pigmentation)

The generation system automatically filters patterns based on breed, ensuring biological accuracy.

### Smart Eye Color System

Eye colors are intelligently selected based on fur color for realistic genetics with rarity:

**Light Fur Colors:** white, cream, beige, gray, lilac, buff
- 25% chance of pink or red eyes (albino/leucistic trait)
- 20% chance of blue eyes (rare but more common with light colors)
- 55% chance of brown or black eyes (common)

**All Other Fur Colors:**
- 10% chance of blue eyes (rare - makes them special finds!)
- 90% chance of brown or black eyes (common)
- 0% chance of pink/red eyes (genetically unrealistic)

This system creates authentic-looking guinea pigs where pink eyes naturally appear with light pigmentation, and blue eyes are rare treasures that are more exciting to find on dark-colored guinea pigs.

### UI Integration

- **Rarity Badges:** Very rare and ultra rare breeds display special badges in the pet store
- **Color Validation:** Eye color selection respects genetic realism
- **Debug Information:** Rarity information available for UI display
- **Consistent Labeling:** Profile displays use generic "Color" and "Pattern" labels (not "Fur Color"/"Fur Pattern") for consistency across all breeds including hairless varieties

## Future Considerations

- **Guinea Pig History**: Track which guinea pigs were previously adopted
- **Favorites System**: Allow marking favorite guinea pigs to prevent swap
- **Store Expansion**: Increase store size as player progresses
- **Special Guinea Pigs**: Rare/special guinea pigs in store rotation
- **Adoption Events**: Temporary themed guinea pig pools
- **Return Bonuses**: Reward players for well-cared-for guinea pigs
- **Store Refresh Cost**: Optional paid refresh for instant swap

## Success Criteria

### Game Session Management
- [ ] Pet store generates 10 random guinea pigs on first launch
- [ ] User can select 1-2 guinea pigs to start game
- [ ] Start Game button enabled only when 1-2 selected
- [ ] End game returns guinea pigs to store with reset needs
- [ ] End game penalty applied to currency
- [ ] Only one active game session at a time

### Persistence
- [ ] Pet store persists across page refreshes
- [ ] Player currency persists (minus penalties)
- [ ] Owned items persist across sessions
- [ ] Unused consumables persist
- [ ] Active game session restores correctly

### Guinea Pig Swap
- [ ] Swap button replaces all 10 guinea pigs
- [ ] 1-hour cooldown enforced
- [ ] Cooldown timer displays remaining time
- [ ] Debug mode allows unlimited swaps
- [ ] Confirmation dialog prevents accidental swaps

### 24-Hour Auto-Refresh
- [x] Auto-refresh toggles on/off in debug settings
- [x] Guinea pigs refresh automatically after 24 hours
- [x] Timer resets to 24 hours after any refresh (manual or auto)
- [x] Live countdown displays time until next auto-refresh
- [x] Auto-refresh check runs on app startup if refresh was due
- [x] Persistent state survives page refreshes
- [x] Smooth countdown updates every second in UI

## Migration Notes

### From Previous Architecture
This system **replaces** the previous multi-slot save game architecture with:
- Simpler single-session model
- No slot management complexity
- No guinea pig availability filtering
- Persistent progression separate from game state
- Encourages experimentation without consequences

### Data Migration
If implementing over existing guinea pig data:
1. Generate initial 10 random guinea pigs for pet store
2. Migrate currency to new PlayerProgression store
3. Clear any existing save game slot data
4. Initialize pet store manager state

## System Integration Notes

### Favorites System Integration (System 6.9)
**Integration Date:** September 29, 2025 | Branch: GPS-15

The Pet Store Manager now integrates with the Guinea Pig Favorites System:

**Store Extensions:**
- Added `favoriteGuineaPigs[]` array to persist favorite guinea pigs
- Added `maxFavoriteSlots` (default: 3, purchasable up to 10)
- `refreshPetStore()` preserves favorites during refresh (backed up and restored)

**Methods:**
- `addToFavorites(guineaPigId)` - Adds guinea pig to favorites with active session awareness
- `removeFromFavorites(guineaPigId)` - Removes from favorites array
- `moveFromFavoritesToStore(guineaPigId)` - Moves favorite back to available pool (blocks if active)

**Active Session Behavior:**
- Guinea pigs can be favorited during active game sessions
- Favoriting doesn't remove active guinea pigs from gameplay
- When session ends, favorited guinea pigs remain in favorites only
- Cannot move active guinea pigs from favorites back to store

**See:** [system-6.9-guinea-pig-favorites.md](./system-6.9-guinea-pig-favorites.md) for complete favorites system documentation.

### Pattern System Updates
**Update Date:** September 28, 2025

**Hairless Breed Pattern Restrictions:**
- Baldwin and Skinny Pig breeds exclude fur-specific patterns
- Excluded patterns: agouti, brindle, roan, satin, himalayan
- Allowed patterns: self, dutch, dalmatian, magpie (skin pigmentation patterns)
- `randomFurPattern()` accepts breed parameter for filtering

**Pattern Additions:**
- Added magpie pattern to pattern arrays and rarities

This streamlined architecture provides better UX, simpler implementation, and encourages players to explore different guinea pig combinations without emotional attachment concerns.