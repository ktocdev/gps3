---
source: src/components/chrome/PetStorePicker.vue
source_hash: ae0e396fbc11637352855ddfdb33342888d8bda9421d4a02a99def741d07c86f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PetStorePicker.vue

`src/components/chrome/PetStorePicker.vue`

> A Vue SFC that renders the pet-store adoption screen where the player browses bonded guinea-pig pairs grouped by habitat, previews a selected pair, optionally renames the pigs, and adopts them to start a game session via an Adoption Certificate confirmation.

## Data flow
Pulls `availableGuineaPigs` from `usePetStoreManager()` and groups them into `habitats` (computed): a `Map` keyed by `pig.habitat`, sorted, sliced to at most 2 pigs each, labeled `Habitat N`.

## Selection
`selectedHabitat` (habitat id or null) drives `selectedPigs`, `selectedNames`, and the two-item `slotPigs` preview. `select()` toggles selection; `clearSelection()` resets. The Adopt CTA is disabled unless a habitat is picked.

## Adoption
`adopt()` validates the pig ids via `petStoreManager.validatePairing()`; on failure sets `errorMessage`, on success shows the `AdoptionCertificate`. `confirmAdopt()` (certificate `@start`) calls `petStoreManager.startGameSession(ids)` to begin play.

## Walking animation
Each pig gets a `WalkState` in `pigWalk` (x%, facing, walking, walkDuration). `initWalk` seeds deterministic start positions using `h32(pigId)`. `startWalk`/`scheduleIdle` form a self-scheduling state machine via `walkTimers` (setTimeout), producing idle/walk cycles; `pigStyleMap` exposes CSS custom props (`--pig-x`, `--pig-facing`, `--pig-walk-dur`). A `watch` on `habitats` (immediate) initializes walk state for new pigs. Timers are cleared on unmount.

## Hints
`IDLE_HINTS` rotate every 3.2s via `hintTimer` (setInterval) while nothing is selected; `ctaHint` shows either the rotating hint or a personalized 'ready to come home' message.

## Inline renaming
`customNames` holds local, non-persisted name overrides keyed by pig id. `startEdit`/`commitName`/`displayName` manage editing state (`editingSlot`, `editingValue`); the `v-focus` local directive auto-focuses/selects the input.

## Presentation helpers
`disposition()` picks the highest personality trait's adjective. `ACCENTS` is a rotating palette; `hutchVars()` and `slotVars()`/`selectedTint` map palette colors to CSS vars. Pigs render via `PigSvg` (always breed 'American'). Extensive inline SVG scenery (igloo, hay rack, water bottle) and a `PetStoreBackdrop`.

## Exports

- **PetStorePicker** (component) — `<PetStorePicker />`: Default SFC export. No props; no emits. Reads/writes the pet store manager store directly. Renders habitat grid, bonded-pair preview slots, adopt CTA, and conditionally the AdoptionCertificate. Side effects flow through petStoreManager.validatePairing and startGameSession.

## Internal dependencies

- `./PigSvg.vue`
- `./PetStoreBackdrop.vue`
- `./AdoptionCertificate.vue`
- `./pigColor`
- `../../stores/petStoreManager`
- `../../stores/guineaPigStore`

## Notes

- Inline name edits (`customNames`) are local-only and never persisted to the store; they display in preview slots but the store's real pig names are what get adopted.
- Habitat grouping keys off `pig.habitat ?? -1` and slices to max 2 pigs per habitat; extra pigs in a habitat are silently dropped.
- All pigs render as breed 'American' regardless of their actual breed ('breed art deferred').
- Walk state machine uses raw setTimeout timers stored in `walkTimers`; relies on onUnmounted cleanup to avoid leaks. `hintTimer` interval also cleared on unmount.
- Adoption is a two-step flow: `adopt()` only validates and shows the certificate; `confirmAdopt()` actually starts the game session.
