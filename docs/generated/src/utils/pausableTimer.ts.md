---
source: src/utils/pausableTimer.ts
source_hash: 0f67d028d280c81a0117f43aa48439f4395713f60385099eefbcb75d0352bf37
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Pausable Timer Utility

`src/utils/pausableTimer.ts`

> Provides a promise-based delay function that respects the game's paused state, so timed operations only advance while the game is actively running. It exists to allow game logic to wait for real elapsed play time rather than wall-clock time that would continue during pauses.

The file exports a single function, `pausableDelay`, which returns a `Promise<void>` that resolves after a specified duration of active (non-paused) game time.

### How it works
When called, it captures the current game controller via `useGameController()` and initializes `remainingTime` to the requested duration and `startTime` to `Date.now()`.

The internal `checkAndWait` function runs a recursive polling loop:
- If `gameController.isGameActive` is false (paused), it reschedules itself after 100ms without decrementing `remainingTime`.
- If active, it computes `elapsed` since the last check, resets `startTime`, and subtracts `elapsed` from `remainingTime` — but only if `elapsed < 200ms` (a guard so time accumulated while paused, which comes back in larger chunks, isn't subtracted).
- When `remainingTime <= 0`, the promise resolves.
- Otherwise it schedules the next check at `Math.min(remainingTime, 100)` ms.

This polling approach effectively pauses the countdown whenever the game is inactive and resumes it when active, with roughly 100ms granularity.

## Exports

- **pausableDelay** (function) — `pausableDelay(durationMs: number): Promise<void>`: Returns a promise that resolves after `durationMs` of active game time has elapsed, pausing the countdown whenever `gameController.isGameActive` is false.

## Internal dependencies

- `../stores/gameController`

## Notes

- Timer resolution is limited to ~100ms polling granularity, so delays are approximate.
- The `elapsed < 200` guard is a heuristic to avoid subtracting time that accumulated during a pause; if a single active tick somehow exceeds 200ms, that elapsed time will not be subtracted.
- Uses `setTimeout` polling rather than a single timer, incurring repeated timer scheduling for the duration of the delay.
- Calls `useGameController()` inside the promise executor, so it depends on a Pinia instance being active at call time.
