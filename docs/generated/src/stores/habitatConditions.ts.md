---
source: src/stores/habitatConditions.ts
source_hash: 71243ea10dd05de8e1f0183a39f5bd89e74909228296796ad6e8775c1194db1a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Habitat Conditions Store

`src/stores/habitatConditions.ts`

> A Pinia store (setup-style) that manages the entire state of a guinea pig habitat: cleanliness/dirtiness, bedding freshness, hay freshness, water levels, poop tracking, placed items and their positions, guinea pig positions, item usage/effectiveness history, and an environmental decay system. It coordinates with the supplies and inventory stores to consume resources and delegates food bowl/hay rack/water bottle management to the useHabitatContainers composable. It is persisted to localStorage with custom Map serialization.

## Core State
Tracks `cleanliness`, `beddingFreshness`, `hayFreshness`, `dirtiness` as 0-100 refs. `waterLevel` is a computed derived from per-bottle levels via `getAggregateWaterLevel()`. Timestamps track last cleaning/bedding/hay/water refresh, and `conditionHistory` keeps up to `TRACKING.CONDITION_HISTORY_MAX` snapshots.

## Container Delegation
Food bowls, hay racks, and water bottles are managed by the `useHabitatContainers()` composable singleton; its refs and methods are destructured and re-exported. `afterHydrate` re-syncs deserialized Maps back into the composable's singleton refs to fix a post-refresh empty-Map bug.

## Resource Consumption
`cleanCage` computes bedding needed from `dirtiness`, consumes bedding from inventory (partial or full clean), resets conditions and clears poop. `consumeBedding` walks inventory consumables sorted partial-first, decrements `amountRemaining`, removes empty bags, and updates `currentBedding` (including color derivation). `refreshBedding`/`refillHay` pull items from inventory (mark opened, useItem) and reset freshness. `quickClean` removes poop without bedding.

## Poop & Conditions
`addPoop`/`removePoop` mutate `poops` and adjust cleanliness/dirtiness. `updateCondition` clamps and sets individual conditions; `resetHabitatConditions` restores all to 100% and refills bottles; `resetToStarterHabitat` returns non-starter items to inventory and restores default starter items/positions.

## Items
`addItemToHabitat` marks inventory instance placed, generates a placement ID, tracks position + usage, and initializes water bottles. `debugAddItemToHabitat` bypasses inventory. `removeItemFromHabitat` reverses this and resets effectiveness.

## Decay & Activity (System 16)
`applyEnvironmentalDecay(deltaSeconds)` degrades bedding (quality-weighted), cleanliness, hay racks, and food bowls scaled by `decaySpeedMultiplier`. `recordGuineaPigActivity` adds activity-based decay.

## Water, Positions, Usage
Water consumption (`consumeWater`, `hasWaterAvailable`, `getWaterBottlePosition`), guinea pig position tracking on a 14x10 grid (`findEmptyCell`, `initializeGuineaPigPosition`, `moveGuineaPigTo`, with visual offsets for overlaps), and item effectiveness history (`recordItemUsage`, `getItemEffectiveness`, `applyEffectivenessRecovery`, `resetItemEffectiveness`).

## Persistence
Custom serializer converts Maps (itemPositions, bowlContents, hayRackContents, waterBottles, guineaPigPositions, itemUsageHistory) to arrays and back via mapSerialization utils.

## Exports

- **useHabitatConditions** (store) — `defineStore('habitatConditions', setup, { persist })`: Pinia setup store exposing habitat state (cleanliness, beddingFreshness, hayFreshness, waterLevel, dirtiness, timestamps, conditionHistory, currentBedding, currentHayBag, activeAlerts, notificationSettings, habitatItems, itemPositions, poops, guineaPigPositions, itemUsageHistory, decaySpeedMultiplier), computed getters (overallCondition, needsAttention, criticalConditions, waterLevel), and many actions for cleaning, resource consumption, item/position/water/decay/usage management. Also re-exports container methods from useHabitatContainers.

## Internal dependencies

- `./suppliesStore`
- `./inventoryStore`
- `../constants/supplies`
- `../utils/mapSerialization`
- `../composables/useHabitatContainers`
- `../utils/placementId`

## Notes

- `waterLevel` is a computed from per-bottle aggregate; do not treat it as a writable ref — set water via updateCondition('waterLevel') or refillWater which iterate bottles.
- afterHydrate manually re-assigns deserialized Maps into the useHabitatContainers singleton refs to fix a bug where composable refs pointed to empty Maps after page refresh — critical coupling with the composable singleton.
- habitatItems stores placement IDs (base itemId + instanceId), not base item IDs; use getBaseItemId for inventory operations. Legacy starter items may be stored as bare itemIds.
- applyEnvironmentalDecay calls useHabitatContainers() again inside the function rather than using the destructured methods, relying on singleton identity.
- consumeBedding mutates inventory instances directly (amountRemaining, isOpened) and splices empty bags/items out of inventoryStore arrays — side effects on another store.
- grid dimensions (14x10) are hardcoded constants, not reactive.
- currentHayBag has no upper limit on handfulsRemaining; refillHay adds unlimited.
- debugAddItemToHabitat bypasses inventory entirely and is intended for the debug panel only.
