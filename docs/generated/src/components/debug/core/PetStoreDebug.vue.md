---
source: src/components/debug/core/PetStoreDebug.vue
source_hash: 30759a3f8c459a0de6e471eefca5ef38c7594a6f193ec747eede62ad67457629
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PetStoreDebug.vue

`src/components/debug/core/PetStoreDebug.vue`

> A debug panel component that displays all guinea pigs in the pet store—both active session pigs and inactive available pigs—grouped by habitat, and shows detailed inspection info (appearance, personality, need decay modifiers) for a selected guinea pig. It exists to give developers visibility into pet store state and per-pig computed attributes.

## Layout
Renders a two-column `DebugPanelRow`. The left `DebugPanel` ("🐹 Guinea Pigs") shows two `DebugSection`s: "Active" pigs (from `petStoreManager.activeSessionGuineaPigs`) and "In Pet Store" pigs (from `petStoreManager.availableGuineaPigs`), each grouped by habitat number. Clicking an active pig calls `selectActivePig` (also invokes `guineaPigStore.selectGuineaPig`); clicking an inactive pig just sets `selectedGuineaPig`. The right `DebugPanel` ("🔍 Guinea Pig Info") shows the selected pig's appearance stats, a `PersonalityPanel`, and computed need decay rate modifiers, or an empty message.

## State & reactivity
- `selectedGuineaPig` ref holds the currently inspected pig.
- `currentTime` ref is updated every second via a `setInterval` (started `onMounted`, cleared `onUnmounted`) to keep adoption timer displays reactive.
- `totalGuineaPigCount`, `activeGuineaPigsByHabitat`, and `inactiveGuineaPigsByHabitat` are computed. The grouping computeds build a `Map<habitatNumber, GuineaPig[]>` (defaulting habitat to 0) and return entries sorted by habitat number.

## Selection maintenance
A `watch` (immediate) on `availableGuineaPigs` keeps the selection valid: reuse the pig if still in the store pool, keep it if still active, otherwise default to the first active pig (via `selectActivePig`) or the first available pig.

## Helpers
Rarity helpers (`getBreedRarity`, `shouldShowRarityBadge`, `getRarityBadgeVariant`, `getRarityBadgeText`) use `petStoreManager.getRarity`/`weightedBreeds` to conditionally render rarity badges for very-rare/ultra-rare breeds. Decay modifier functions from `utils/personalityDecay` translate personality traits into decay multipliers, CSS classes, and effect text. `getAdoptionTimerDisplay` formats remaining adoption time.

## Exports

- **PetStoreDebug** (component) — `<PetStoreDebug /> (no props, no emits)`: Vue SFC debug panel showing guinea pigs grouped by habitat (active and in-store) and a detail inspector for the selected pig. Takes no props and emits no events; reads from petStoreManager and guineaPigStore stores.

## Internal dependencies

- `../../../stores/petStoreManager`
- `../../../stores/guineaPigStore`
- `../../basic/Badge.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugPanelRow.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugBadge.vue`
- `../ui/DebugStatRow.vue`
- `../environment/PersonalityPanel.vue`
- `../../../utils/personalityDecay`

## Notes

- Active pigs are sourced from `petStoreManager.activeSessionGuineaPigs`, not the available pool, because `startGameSession()` removes them from `availableGuineaPigs`.
- A 1-second `setInterval` drives `currentTime` reactivity for adoption timers; it is cleared on unmount to avoid leaks.
- The selection-maintenance watch only triggers on changes to `availableGuineaPigs`; changes solely to `activeSessionGuineaPigs` do not re-run it.
- Uses non-scoped `<style>`, so class rules (including generic `.decay-modifier--*` classes) leak globally.
