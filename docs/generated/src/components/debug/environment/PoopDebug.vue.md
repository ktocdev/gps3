---
source: src/components/debug/environment/PoopDebug.vue
source_hash: 3bdd8486fc23e58e85b578e5b3751870dc7ca599fcf51d191020bac1fb2b2315
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PoopDebug.vue

`src/components/debug/environment/PoopDebug.vue`

> A debug panel component that displays poop-related status for active guinea pigs and the habitat, and provides a control to manually trigger a poop event. It exists as part of the debug/environment tooling to inspect and manipulate the poop/hygiene systems during development.

## Structure
Renders per-guinea-pig `DebugSection`s (one for each `guineaPigStore.activeGuineaPigs`) showing time since last poop, time until next poop, and a fixed 30-second interval. Each section includes a 'Force Poop Now' `Button`. A separate 'Habitat Poop Stats' section shows total poop count and a hygiene impact badge. When no guinea pigs are active, a fallback message is shown.

## State & Data Flow
Uses four Pinia stores: `guineaPigStore`, `habitatConditions`, `suppliesStore`, and `loggingStore`. Computed `hasActiveGuineaPigs` gates the main template; `totalPoops` reads `habitatConditions.poops.length`.

## Time Calculations
`getTimeSinceLastPoop` and `getTimeUntilNextPoop` compute values from `Date.now()` against each guinea pig's `lastPoopTime`, using the local `POOP_INTERVAL_MS` constant (30000ms, said to match the behavior system).

## Manual Poop
`triggerManualPoop` reads the guinea pig's position from `habitatConditions.guineaPigPositions`, converts it via `positionToGridCoords`, then `gridToSubgridWithOffset`, adds a poop through `habitatConditions.addPoop`, detects nearby location context via `detectNearbyLocation`, generates a message with `MessageGenerator.generateAutonomousPoopMessage`, logs it via `loggingStore.addEnvironmentalEvent`, and resets the guinea pig's `lastPoopTime`.

## Hygiene
`getHygieneImpact` returns a descriptive label based on `totalPoops`, and `getHygieneBadgeVariant` maps count thresholds to badge variants ('ok'/'warn'/'err').

## Exports

- **PoopDebug** (component) — `<PoopDebug />`: Vue SFC debug component with no props or emits. Displays poop status per active guinea pig plus habitat-wide hygiene stats, and exposes a manual poop trigger button.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../../../stores/habitatConditions`
- `../../../stores/suppliesStore`
- `../../../stores/loggingStore`
- `../../../utils/messageGenerator`
- `../../../utils/locationDetection`
- `../../basic/Button.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugStatRow.vue`
- `../ui/DebugBadge.vue`

## Notes

- Time-based displays (`getTimeSinceLastPoop`, `getTimeUntilNextPoop`) compute from `Date.now()` on render and are not reactive to time passing unless something else triggers re-render.
- `POOP_INTERVAL_MS` (30000) is hardcoded here and expected to match the behavior system; a divergence would make the displayed 'Next Poop In' inaccurate.
- `triggerManualPoop` mutates `guineaPig.lastPoopTime` directly on the store object.
- Falls back to grid coordinates `{ row: 1, col: 1 }` when a guinea pig has no recorded position.
