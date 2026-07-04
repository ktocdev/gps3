---
source: src/stores/needsController.ts
source_hash: 138dac8c10243404b71e9eb08a7c27401699e22a533a82b2c6a8d56e69c18922
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Needs Controller Store

`src/stores/needsController.ts`

> A Pinia store that computes and tracks guinea pig 'wellness' from their individual needs, drives periodic batch processing of needs decay, and applies friendship penalties/bonuses based on wellness thresholds. It coordinates the game's core loop timing (pause/resume) and syncs with decay rate settings and game session lifecycle.

## State
- `currentWellness`, `wellnessHistory` (capped at 100 entries), `lastWellnessUpdate` track computed wellness over time.
- `isPenaltyActive`, `currentPenaltyRate`, `penaltyStartTime` track active friendship penalties.
- `lastBatchUpdate`, `processingEnabled`, `manuallyPausedByUser`, `updateIntervalMs` (5000ms) control the processing loop.
- `wellnessThresholds` (penalty 45, warning 50, recovery 55, bonus 75) and `penaltyRates` (severe -1.0, high -0.75, medium -0.5) are tunable config refs.
- `isPausedManually` is a computed that is true when processing is disabled AND the user manually paused.

## Wellness calculation
`calculateWellness` reads a guinea pig's needs and produces a weighted average: critical needs (hunger/thirst/energy/shelter) at 40%, environmental (play/social/comfort) at 35%, maintenance (hygiene/nails/chew) at 25%, clamped 0–100.

## Processing loop
`processBatchUpdate` is the main tick: it early-returns if processing is disabled or the interval hasn't elapsed. It calls `guineaPigStore.processBatchNeedsDecay()`, `petStoreManager.processAdoptionTimers()`, then for each active guinea pig computes wellness, records history, applies friendship effects, and checks warning thresholds. Errors are caught and logged.

## Friendship effects
`applyFriendshipPenalties` decreases friendship (via `getPenaltyRate`) when wellness is below the penalty threshold, and grants a +0.2 bonus when above the bonus threshold, resetting penalty state above the recovery threshold.

## Pause/resume
`pauseProcessing(isManual)` disables processing and optionally sets the manual flag. `resumeProcessing` re-enables it, resets `needsLastUpdate` timestamps to avoid accumulated time deltas, and restores decay rate to 1x if it was 0. `resetState` restores defaults.

## Watchers
Two watchers: one resumes processing when a game session ends while manually paused; another syncs `needsDecayRate` — setting it to 0 marks manual pause, increasing from 0 resumes. Logging store is lazily resolved via `getLoggingStore`.

## Exports

- **useNeedsController** (store) — `defineStore('needsController', setup, { persist })`: Pinia setup store persisted to sessionStorage under key 'gps2-needs-controller'. Exposes wellness state, penalty state, processing controls, threshold/rate config, and methods: calculateWellness, getPenaltyRate, applyFriendshipPenalties, checkThresholds, processBatchUpdate, pauseProcessing, resumeProcessing, resetState, plus computed isPausedManually.

## Internal dependencies

- `./guineaPigStore`
- `./loggingStore`
- `./petStoreManager`
- `pinia`
- `vue`

## Notes

- Persisted only to sessionStorage, so state does not survive across browser sessions.
- The two watchers are registered at store setup time and each eagerly resolves useGuineaPigStore/usePetStoreManager, creating cross-store coupling.
- processBatchUpdate must be driven externally on an interval; the store does not schedule itself.
- currentWellness is overwritten per guinea pig in the loop, so with multiple active guinea pigs it ends up holding the last one's value.
- friendship_penalty_applied and friendship_bonus_applied logging were intentionally removed to prevent per-tick log spam.
- Setting needsDecayRate to 0 is treated as a manual pause; the watcher toggles processingEnabled and manuallyPausedByUser accordingly.
