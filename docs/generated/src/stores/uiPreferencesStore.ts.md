---
source: src/stores/uiPreferencesStore.ts
source_hash: c49995d358edcb35b3cefed5ae6cbb69996899a62ac79d901993f06d4322ee15
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# UI Preferences Store

`src/stores/uiPreferencesStore.ts`

> A Pinia store that manages user interface preferences and customization options for the application. Currently it handles the item placement mode (drag vs select/tap), auto-detecting the best default based on device type, and persists preferences to localStorage. It is designed to expand as more UI features are added.

## State

Defined using Pinia's setup-style store (`defineStore('uiPreferences', ...)`).

- `itemPlacementMode` — a `ref<PlacementMode>` initialized via `getDefaultPlacementMode()`; controls whether inventory items are placed by drag-and-drop (`'drag'`) or tap-to-select (`'select'`).
- `hasManuallySetMode` — a `ref<boolean>` tracking whether the user explicitly changed the mode, used to avoid overriding manual choices during auto-detection.

## Actions

- `initializePreferences()` — if the user hasn't manually set a preference, re-runs `getDefaultPlacementMode()` and updates `itemPlacementMode` when it differs.
- `togglePlacementMode()` — flips between `'drag'` and `'select'` and marks `hasManuallySetMode` true.
- `setPlacementMode(mode)` — sets the mode explicitly and marks `hasManuallySetMode` true.
- `resetPreferences()` — clears manual flag and restores the auto-detected default.

All actions log to the console. The store is configured with `persist` using key `'uiPreferences'` and `localStorage`, so state survives reloads.

## Exports

- **PlacementMode** (type) — `type PlacementMode = 'drag' | 'select'`: Union type describing the two supported item placement modes.
- **useUiPreferencesStore** (store) — `useUiPreferencesStore(): Store`: Pinia store exposing state (`itemPlacementMode`, `hasManuallySetMode`) and actions (`initializePreferences`, `togglePlacementMode`, `setPlacementMode`, `resetPreferences`). Persisted to localStorage under key 'uiPreferences'.

## Internal dependencies

- `pinia`
- `vue`
- `../utils/deviceDetection`

## Notes

- Persistence relies on a Pinia persistence plugin being registered (the `persist` option is plugin-provided, not core Pinia).
- Because state is persisted to localStorage, a previously stored `hasManuallySetMode` may prevent `initializePreferences()` from applying auto-detection on subsequent loads.
- All mutating actions emit `console.log` output as a side effect.
