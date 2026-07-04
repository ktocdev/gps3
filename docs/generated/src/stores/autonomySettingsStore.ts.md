---
source: src/stores/autonomySettingsStore.ts
source_hash: 0d75169a477b4563941ff50217eef64ed74bc99b6c4db16e316503bab3ef319e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Autonomy Settings Store

`src/stores/autonomySettingsStore.ts`

> A Pinia store that persists per-guinea-pig behavior thresholds used by the autonomous AI system. Each threshold defines the satisfaction level below which the AI prioritizes fulfilling a specific need (hunger, thirst, energy, etc.). It provides accessors and mutators for these thresholds, keyed by guinea pig ID, and persists them to sessionStorage.

The store holds a single reactive state object `behaviorThresholds`, a `Record<string, BehaviorThresholds>` keyed by guinea pig ID.

### Data flow
- `getThresholds(id)` lazily initializes a guinea pig's thresholds from `DEFAULT_THRESHOLDS` (spread copy) if absent, then returns them.
- `setThreshold(id, needType, value)` ensures a record exists (initializing from defaults) then updates a single need's threshold.
- `resetThresholds(id)` replaces one guinea pig's thresholds with a fresh copy of defaults.
- `resetAllThresholds()` clears the entire map.
- `removeGuineaPig(id)` deletes a guinea pig's entry, intended for cleanup when a guinea pig is removed.

### Persistence
Uses the pinia-plugin-persistedstate `persist` option with key `gps2-autonomy-settings` and `sessionStorage`, so thresholds survive within a browser session but not across sessions.

### Constants
`DEFAULT_THRESHOLDS` defines the baseline values (hunger 65, thirst 60, energy 60, hygiene 55, shelter 65, chew 75, play 75, social 50), stated to match `useGuineaPigBehavior` defaults.

## Exports

- **BehaviorThresholds** (type) — `interface BehaviorThresholds { hunger: number; thirst: number; energy: number; hygiene: number; shelter: number; chew: number; play: number; social: number }`: Interface describing the per-need threshold values that trigger AI need-satisfaction behavior when a need drops below the value.
- **DEFAULT_THRESHOLDS** (constant) — `const DEFAULT_THRESHOLDS: BehaviorThresholds`: Default threshold values used to initialize or reset a guinea pig's behavior thresholds.
- **useAutonomySettingsStore** (store) — `useAutonomySettingsStore(): Store`: Pinia setup store exposing state `behaviorThresholds` and actions `getThresholds`, `setThreshold`, `resetThresholds`, `resetAllThresholds`, and `removeGuineaPig`. Persisted to sessionStorage under key 'gps2-autonomy-settings'.

## Internal dependencies

- `pinia`
- `vue`

## Notes

- `getThresholds` mutates state (lazy initialization) as a side effect of reading, so calling it on a missing ID adds an entry.
- `getThresholds` returns a direct reference to the stored object, not a copy, so mutating the return value mutates store state.
- Persistence uses sessionStorage, so thresholds are lost when the browser session ends.
- `DEFAULT_THRESHOLDS` is documented as needing to stay in sync with `useGuineaPigBehavior` defaults; there is no enforced coupling.
