---
source: src/stores/playerProgression.ts
source_hash: 24fc6e4f64ee9a4bf2ed257000d9f2ffa1f2cbd22a05cde5940c261d2ca661dc
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Player Progression Store

`src/stores/playerProgression.ts`

> A Pinia store that tracks persistent player-level progression data for the guinea pig simulation game, including currency, lifetime statistics (earnings, play time, sessions, guinea pigs adopted), owned items, consumables, and unlocked achievements. It exists to maintain player state that persists across game sessions via localStorage.

## State
Uses the Pinia setup-store syntax. Core reactive refs: `currency` (default 1000), `totalCurrencyEarned` (default 1000), `ownedItems` (record of `OwnedItem`), `consumables` (record of counts), `totalGameSessions`, `totalPlayTime` (ms), `guineaPigsAdopted`, and `unlockedAchievements` (string array).

## Computed
`formattedCurrency` and `formattedTotalEarned` produce dollar-prefixed, locale-formatted strings. `formattedPlayTime` converts `totalPlayTime` (ms) into an `Xh Ym Zs` style string, omitting larger units when zero.

## Actions
- `updateCurrency(amount)` — adds `amount` to currency; if positive also adds to `totalCurrencyEarned`; logs a player action.
- `deductCurrency(amount, reason)` — ignores non-positive amounts, deducts up to available balance (clamped via `Math.min`), logs the deduction.
- `incrementGameSessions()` — increments session count and logs.
- `addPlayTime(milliseconds)` — accumulates play time and logs.
- `incrementGuineaPigsAdopted(count=1)` — increments adopted count and logs.
- `resetProgression()` — restores all state to defaults and logs.
- `initializeStore()` — logs initialization info.

## Logging
A lazily-instantiated `loggingStore` (via `getLoggingStore`) is used so `useLoggingStore` is only resolved on first use. Actions call `addPlayerAction` or `logInfo`.

## Persistence
Configured with `persist` using key `gps2-player-progression` in `localStorage`.

## Exports

- **usePlayerProgression** (store) — `usePlayerProgression(): Store`: Pinia store 'playerProgression' exposing state (currency, totalCurrencyEarned, ownedItems, consumables, totalGameSessions, totalPlayTime, guineaPigsAdopted, unlockedAchievements), computed getters (formattedCurrency, formattedTotalEarned, formattedPlayTime), and actions (updateCurrency, deductCurrency, incrementGameSessions, addPlayTime, incrementGuineaPigsAdopted, resetProgression, initializeStore).
- **OwnedItem** (type) — `interface OwnedItem { itemId: string; purchasedAt: number; timesUsed: number }`: Describes an owned item record with purchase timestamp and usage count.

## Internal dependencies

- `./loggingStore`
- `pinia`
- `vue`

## Notes

- `deductCurrency` clamps deductions to available balance so currency never goes negative from this action, but `updateCurrency` accepts negative amounts and can push currency below zero.
- The logging store is lazily resolved to avoid initialization order issues; every action after the first triggers logging side effects.
- Persisted via localStorage under key 'gps2-player-progression', so state survives reloads; `resetProgression` must be called to clear it in-memory (persisted copy updates through the plugin).
