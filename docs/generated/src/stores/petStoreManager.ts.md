---
source: src/stores/petStoreManager.ts
source_hash: 2380fb9066c9ce0d51ac4e17f1a1742589b33622045e0c73fe3d0dc13fd2302c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Pet Store Manager Store

`src/stores/petStoreManager.ts`

> A Pinia store that manages the pet store's available guinea pig pool, active game sessions, and the Stardust Sanctuary. It handles procedural generation of guinea pigs (with weighted rarity traits and preferences sourced from the Supplies Store), adoption timers, session lifecycle, sanctuary transfers, pairing validation, bond preservation, and granting starter inventory to new players.

## State
- `availableGuineaPigs`: pool of store guinea pigs (target size 8, generated in bonded pairs by `habitat`).
- `activeGameSession`: current session `{ id, startedAt, guineaPigIds[], sessionDuration }` or null.
- `sanctuaryGuineaPigs` / `maxSanctuarySlots` (10): Phase 3 sanctuary storage.
- `settings`: empty placeholder object.

## Computed
- `activeSessionGuineaPigs` resolves session IDs against the guinea pig store.
- `sanctuaryCount`, `availableSanctuarySlots`, `canAddToSanctuary` gate sanctuary capacity.
- `canAccessStore` is true only when there is no active session or it has zero guinea pigs.

## Generation
Weighted arrays (`weightedBreeds`, `weightedFurColors`, `weightedFurPatterns`) drive `weightedRandom` selection with rarity tiers. `generateRandomGuineaPig` builds a full `GuineaPig` object: personality, needs (with specific starting values), stats, appearance (fur/eye color logic accounts for hairless breeds and multi-color patterns), consumption limits, adoption timer (2–5 day random duration), and randomized poop offset. `generateRandomPreferences` pulls real food item IDs from the Supplies Store (returns empty if catalog not loaded). `generateRandomGuineaPigs` creates a batch and assigns 2 per habitat as bonded pairs sharing adoption timers.

## Session flow
`startGameSession` validates count (1–2) and pairing, restores bonds if applicable, moves guinea pigs from pool/sanctuary into the guinea pig store collection, replenishes the pool, creates the session, sets the active pair, resets habitat to starter state, initializes positions/needs, resumes the needs controller, increments player progression, grants starter inventory on first adoption, and starts the game controller.

## Sanctuary
`moveToSanctuary` requires 85% friendship, moves the guinea pig (and its cagemate) out of the active session, resets needs, freezes friendship, saves bonds, and ends the session if empty. `moveFromSanctuary` reactivates a guinea pig, resets habitat/bedding/poop/bowls, and moves any current active cagemate into the sanctuary.

## Other
`processAdoptionTimers` replaces expired store guinea pigs (preserving habitat slot). `validatePairing` enforces same-origin pairing rules. `saveBonds`/`restoreBondsIfExists` persist and restore inter-guinea-pig relationships. `giveStarterInventory` seeds inventory and habitat items. The store is persisted to localStorage under `gps2-pet-store-manager`.

## Exports

- **usePetStoreManager** (store) — `defineStore('petStoreManager', setup, { persist })`: Setup-style Pinia store. Exposes state (availableGuineaPigs, activeGameSession, settings, sanctuaryGuineaPigs, maxSanctuarySlots), computed (activeSessionGuineaPigs, sanctuaryCount, availableSanctuarySlots, canAddToSanctuary, canAccessStore), UI data arrays (furColors, furPatterns, breeds, eyeColors, activities, habitatFeatures, weighted arrays, getRarity), and methods (generateRandomGuineaPigs, replenishGuineaPigPool, startGameSession, initializeStore, processAdoptionTimers, getAdoptionTimeRemaining, formatAdoptionTimer, moveToSanctuary, moveFromSanctuary, validatePairing, saveBonds, restoreBondsIfExists).
- **GameSession** (type) — `interface GameSession { id: string; startedAt: number; guineaPigIds: string[]; sessionDuration: number }`: Shape of an active game session record.

## Internal dependencies

- `./guineaPigStore`
- `./loggingStore`
- `./playerProgression`
- `./gameController`
- `./needsController`
- `./habitatConditions`
- `./inventoryStore`
- `./suppliesStore`
- `../utils/servingSystem`

## Notes

- Preference generation and guinea pig creation silently return empty preferences if the Supplies Store catalog is not loaded; initializeStore and giveStarterInventory call initializeCatalog defensively.
- Guinea pigs are always managed in bonded pairs of 2 sharing a habitat number and adoption timer; several methods carefully re-assign habitat/timer to prevent pairs collapsing (see processAdoptionTimers replacement comment and initializeStore migration logic).
- moveToSanctuary uses non-null assertions (activeGameSession.value!) inside the cagemate branch, assuming an active session exists when a cagemate was found.
- PetStoreSettings interface is currently empty; settings is a placeholder.
- Target pool size is 8, but replenishGuineaPigPool's doc comment says 10 (stale comment); actual targetCount is 8.
- Persisted to localStorage under key 'gps2-pet-store-manager', so state survives reloads and initializeStore branches on existing data.
- startGameSession clears all bonds via guineaPigStore.clearAllBonds() after setting the active pair, and re-initializes positions because resetToStarterHabitat clears them.
- Extensive cross-store coupling: mutates guineaPigStore.collection directly, calls gameController start/stop, needsController, habitatConditions, inventoryStore, playerProgression.
