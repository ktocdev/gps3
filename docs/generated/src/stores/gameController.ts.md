---
source: src/stores/gameController.ts
source_hash: ca567706eec96b6471a0986a386043f1fb54e5b38ab8cb5df1baf9abdde81398
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Game Controller Store

`src/stores/gameController.ts`

> A Pinia store that manages the top-level game lifecycle state (intro, playing, paused, stopped) and global game settings for the Guinea Pig Simulator. It coordinates state transitions across related stores (game timing, needs processing, guinea pig collection) and persists game state and settings to localStorage.

## State
- `gameState`: reactive object holding `currentState` ('intro' | 'playing' | 'paused' | 'stopped'), `pauseReason`, `hasGuineaPig`, `isFirstTimeUser`, and `lastSaveTimestamp`.
- `settings`: reactive object for `tutorial` (mode, isGlobalFirstTime, completed), `performance.mode`, and `errorReporting.enabled` (defaults to `import.meta.env.DEV`).

## Lazy store access
To avoid circular dependencies, `useLoggingStore` and `useGuineaPigStore` are accessed lazily via `getLoggingStore()` / `getGuineaPigStore()` cached locals. `useGameTimingStore` and `useNeedsController` are called inline within action bodies.

## State transitions
`isValidTransition` enforces an allowed transition map (intro→playing; playing→paused/stopped; paused→playing/stopped; stopped→intro/playing). `setState` validates the transition (logging an error and returning false if invalid), updates `currentState`/`pauseReason`/`lastSaveTimestamp`, and logs a themed player-action message via the logging store.

## Lifecycle actions
- `startGame`: requires a guinea pig, transitions to playing, and starts the game timing loop.
- `pauseGame(reason)`: transitions to paused, pauses timing and needs processing; when already paused, applies a reason-priority override (manual > visibility > navigation > orientation).
- `resumeGame`: transitions back to playing and resumes timing and needs processing.
- `stopGame`: transitions to stopped and stops the timing loop.
- `newGame(clearGuineaPigs)`: resets gameState to intro and optionally clears the guinea pig collection.
- `setGuineaPigCreated` / `createGuineaPig`: mark first-time-user complete, transition to playing, log an achievement, and delegate creation to the guinea pig store.

## Sync & init
`syncGameStateWithGuineaPigs` mirrors `hasGuineaPigs` into game state. `initializeStore` syncs state or starts a fresh session based on existing guinea pig data.

## Settings
Setters for tutorial mode/completion, performance mode, error reporting toggle, and a shallow `updateSettings` merge.

## Exports

- **useGameController** (store) — `defineStore('gameController', setup, { persist })`: Pinia setup store. Exposes state (`gameState`, `settings`), computed (`isGameActive`, `isPaused`, `isManuallyPaused`, `isOrientationPaused`, `isVisibilityPaused`, `hasGuineaPig`, `activeGuineaPig`), actions (`setState`, `startGame`, `pauseGame`, `resumeGame`, `stopGame`, `newGame`, `setGuineaPigCreated`, `createGuineaPig`), settings mutators (`updateSettings`, `setTutorialMode`, `setTutorialCompleted`, `setPerformanceMode`, `toggleErrorReporting`), `initializeStore`, and sync helpers (`syncGameStateWithGuineaPigs`, `syncGameStateWithSaveManager`). Persisted to localStorage under key `gps2-game-controller`.

## Internal dependencies

- `./loggingStore`
- `./gameTimingStore`
- `./guineaPigStore`
- `./needsController`
- `pinia`
- `vue`

## Notes

- Lazy store resolution via cached locals is intentional to avoid circular dependencies; `getGuineaPigStore`/`getLoggingStore` must be called inside functions, not at module scope.
- `setState` returns false and logs to both console and the logging store on invalid transitions rather than throwing.
- `pauseGame` when already paused only upgrades `pauseReason` per a fixed priority (manual > visibility > navigation > orientation); other reasons are ignored.
- `gameState.hasGuineaPig` is a persisted flag but `hasGuineaPig` computed derives live from the guinea pig store's `hasGuineaPigs`; the two can diverge until `syncGameStateWithGuineaPigs` runs.
- `newGame` mutates the guinea pig store's collection directly (guineaPigs, activeGuineaPigId, lastUpdated) when clearing.
- `syncGameStateWithSaveManager` is a placeholder that currently just calls `syncGameStateWithGuineaPigs`.
- `errorReporting.enabled` defaults to `import.meta.env.DEV`, but persisted state will override this default on reload.
