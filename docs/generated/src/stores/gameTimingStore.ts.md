---
source: src/stores/gameTimingStore.ts
source_hash: 283b2a993910e4b9d12beb758a5296c1e6b13d36d66f8f64b48e7b4c4b60224a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Game Timing Store

`src/stores/gameTimingStore.ts`

> A Pinia store that owns the central game loop for the Guinea Pig Simulation. It drives all time-based game systems (needs, autonomous AI behavior, environmental decay, item effectiveness recovery, and bonding progression) by running a repeating interval tick, tracking elapsed game time and performance metrics.

## Timing loop
Uses `setInterval` at `intervalMs` (default 1000ms) to call `processGameTick`. On each tick it computes `deltaTime` since `lastUpdate`, clamps it to `maxDeltaTime` (30s) to avoid large jumps after sleep, and only processes systems when `useGameController().isGameActive` is true (otherwise it just advances `lastUpdate` to prevent delta accumulation).

## Per-tick work
When active it: calls `needsController.processBatchUpdate()`; runs autonomous AI via cached `useGuineaPigBehavior` composables per guinea pig (skipped entirely in `gameViewStore.mode === '3d'`), passing per-pig thresholds from `autonomySettingsStore`; prunes cached behavior composables for pigs no longer active; applies `habitatConditions.applyEnvironmentalDecay(deltaSeconds)`; applies `applyEffectivenessRecovery()` at most once per hour via `lastEffectivenessRecovery`; and runs `processAllBonds(deltaTime)`. It then updates `totalGameTime`, `updateCount`, a rolling `averageUpdateTime` (10% weight), and logs a performance warning if a tick exceeds 100ms.

## Lifecycle control
`startGameLoop` desynchronizes recent `lastPoopTime` values (adding random 0-30s offset for pigs whose last poop was within 1 minute, to prevent synchronized pooping on load) and starts the interval. `stopGameLoop`/`pauseGameLoop` clear it; `resumeGameLoop` resets `lastUpdate`, calls `resumeMovement()` on all cached behaviors, then restarts. `setIntervalMs` validates 1000-60000ms and restarts the loop if running.

## Utilities
`getGameTime` / `getGameTimeFormatted` expose elapsed time; `resetStats` zeroes metrics; `stats` is a computed summary. `loggingStore` is lazily resolved via `getLoggingStore()`.

## Persistence
Persisted to `sessionStorage` under key `gps2-game-timing`.

## Exports

- **useGameTimingStore** (store) — `useGameTimingStore(): Store`: Pinia setup store 'gameTiming'. State: isRunning, intervalMs, lastUpdate, totalGameTime, updateCount, averageUpdateTime, lastUpdateDuration, maxDeltaTime. Computed: stats. Actions: startGameLoop, stopGameLoop, pauseGameLoop, resumeGameLoop, setIntervalMs, resetStats, getGameTime, getGameTimeFormatted.

## Internal dependencies

- `./loggingStore`
- `./needsController`
- `./gameController`
- `./gameViewStore`
- `./habitatConditions`
- `./guineaPigStore`
- `./autonomySettingsStore`
- `../composables/game/useGuineaPigBehavior`
- `../utils/bondingProgression`
- `pinia`
- `vue`

## Notes

- The `behaviorComposables` Map and `gameLoopInterval` are module/closure-level (not reactive refs) and are not persisted; behavior caches must be recreated after reload.
- AI behavior is completely skipped when `gameViewStore.mode === '3d'` — 3D mode is expected to handle behavior elsewhere via use3DBehavior.
- Effectiveness recovery is throttled to once per real hour via `lastEffectivenessRecovery` (a non-persisted, non-exported ref), so it resets on reload.
- `startGameLoop` mutates guinea pig `lastPoopTime` on start with a random offset for pigs pooped within the last minute — a side effect intended to break save-synchronized pooping.
- behavior.tick() errors are caught and logged as warnings but do not stop the loop; the whole tick is also wrapped in a try/catch that logs 'game_tick_error'.
- Delta accumulation is intentionally prevented while paused/inactive by advancing lastUpdate each tick.
