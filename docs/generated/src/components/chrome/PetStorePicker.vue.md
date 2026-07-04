---
source: src/components/chrome/PetStorePicker.vue
source_hash: 430cb870c2e90faab59a2e1756f01502e94c0d08a728c1415294b76fed46988b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PetStorePicker.vue

`src/components/chrome/PetStorePicker.vue`

> A chrome-layer Vue component that presents the pet-store adoption screen where the player picks a bonded pair of guinea pigs (grouped by habitat) and adopts them to start a game session. It renders habitat cards with animated pigs, live preview slots for the selected pair, inline name editing, and an adoption certificate confirmation flow.

### Data source
Uses `usePetStoreManager()`. The `habitats` computed groups `petStoreManager.availableGuineaPigs` by their `habitat` field into a `Map`, sorts by key, and produces `{ id, label, pigs }` objects with at most 2 pigs each (a bonded pair).

### Selection & CTA
`selectedHabitat` (id or null) drives `selectedPigs`, `selectedNames`, and `slotPigs` (two-element array padded with null). Clicking a habitat toggles selection via `select`; `clearSelection` resets. A rotating hint (`IDLE_HINTS` cycled by `hintTimer` every 3.2s) shows when nothing is selected; otherwise `ctaHint` announces the selected pair. `adopt()` validates via `petStoreManager.validatePairing(ids)`, sets `errorMessage` on failure, or opens the `AdoptionCertificate`. `confirmAdopt()` calls `petStoreManager.startGameSession(ids)`.

### Pig walking animation
A per-pig state machine (`pigWalk` record of `WalkState`) drives idle/walk cycles. `initWalk` seeds start X positions (deterministic via `h32(pigId)`) and facing; `scheduleIdle`/`startWalk` alternate using `walkTimers` (setTimeout). `pigStyleMap` exposes `--pig-x`, `--pig-facing`, `--pig-walk-dur` CSS vars consumed by the hutch stage. A `watch(habitats, ...)` (immediate) initializes walk state for new pigs.

### Inline naming
`customNames` holds local, non-persisted name overrides keyed by pig id. `startEdit`/`commitName`/`displayName` manage editing in the preview slots via the local `v-focus` directive. Escape/blur/enter handlers commit or cancel.

### Presentation helpers
`disposition` picks the highest personality trait label. `ACCENTS` palette rotates per habitat via `hutchVars`; `selectedTint`/`slotVars` tint the preview portrait. Color helpers (`pigColors`, `pigSpots`, `pigSwatches`) come from `pigColor`. Cleanup clears timers on unmount.

## Exports

- **PetStorePicker** (component) — `<PetStorePicker />`: Vue SFC (script setup). No props or emits. Self-contained pet-store adoption screen that reads/writes the pet store manager store and renders PetStoreBackdrop, PigSvg, and AdoptionCertificate (listening to its @start and @cancel events).

## Internal dependencies

- `./PigSvg.vue`
- `./PetStoreBackdrop.vue`
- `./AdoptionCertificate.vue`
- `./pigColor`
- `../../stores/petStoreManager`
- `../../stores/guineaPigStore`

## Notes

- Custom name edits are stored only in local `customNames` and are NOT persisted to the store; they affect preview slot display but adoption still uses store pig data.
- 2D chrome always renders every pig as breed 'American' regardless of the pig's actual breed (breed art deferred).
- Walk animation relies on CSS transition of `inset-inline-start` timed to `--pig-walk-dur`; timers must stay in sync with the transition duration or pigs may snap.
- `adopt()` only opens the certificate; the game session is not created until `confirmAdopt()` runs after certificate confirmation.
- `hintTimer` and all `walkTimers` are cleared in onUnmounted to avoid leaks.
- Habitat key defaults to -1 when a pig has no `habitat` value, grouping all such pigs together.
