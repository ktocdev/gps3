---
source: src/constants/supplies.ts
source_hash: cab06f60a10ba7dbf0b0f4641e4f68c555c45f5ec61f96625e28a306b37e7fd8
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Supplies & Habitat Constants

`src/constants/supplies.ts`

> Centralized configuration module (Phase 3) that consolidates magic numbers and tunable values for the guinea pig habitat/supplies simulation, including quality tiers, habitat condition thresholds, consumption/capacity rules, poop cleanliness effects, environmental decay rates, chew item degradation, tracking limits, and starter habitat item positions. It also provides small helper functions for clamping and classifying condition values.

This file exports a series of `as const` constant objects grouped by domain:

- **QUALITY_ORDER** maps `cheap`/`average`/`premium` to numeric ranks, with derived `QualityLevel` type.
- **HABITAT_CONDITIONS** holds default starting values (cleanliness, bedding, hay, water), min/max bounds (0–100), warning (40) and critical (20) thresholds, and a reset value.
- **CONSUMPTION** defines hay handfuls per bag/rack capacity, default absorbency/decay, food capacity, and water consumption min/max plus minimum drinkable level.
- **POOP_CONSTANTS** defines cleanliness reduction range per poop and recovery per removal.
- **DECAY** provides per-second base decay rates for bedding, cleanliness, hay, and food (computed from per-minute fractions), quality multipliers, activity-based additional decay (movement/eating/drinking), speed presets (REALISTIC→DEBUG), and a default speed (12/NORMAL).
- **CHEW_DEGRADATION** defines per-use degradation rates by chew type and safety/condition thresholds plus a habitat penalty.
- **TRACKING** caps condition history snapshots at 100.
- **STARTER_HABITAT_POSITIONS** maps starter item ids to grid x/y coordinates.

### Helper functions
- `clampCondition` clamps a value into [CONDITION_MIN, CONDITION_MAX].
- `calculatePoopCleanlinessReduction` returns a random integer within the poop reduction range.
- `isWarningLevel` / `isCriticalLevel` classify a condition value against the thresholds.

## Exports

- **QUALITY_ORDER** (constant) — `{ cheap: 1; average: 2; premium: 3 }`: Numeric ranking of quality tiers.
- **QualityLevel** (type) — `keyof typeof QUALITY_ORDER`: Union type of quality tier keys ('cheap' | 'average' | 'premium').
- **HABITAT_CONDITIONS** (constant) — `object`: Default condition values, min/max bounds, warning/critical thresholds, and reset value.
- **CONSUMPTION** (constant) — `object`: Hay, bedding, food, and water consumption/capacity constants.
- **POOP_CONSTANTS** (constant) — `object`: Cleanliness reduction range per poop and recovery per removal.
- **DECAY** (constant) — `object`: Per-second decay rates, quality multipliers, activity decay, speed presets, and default speed.
- **CHEW_DEGRADATION** (constant) — `object`: Per-use degradation rates by chew type, safety/condition thresholds, and habitat penalty.
- **TRACKING** (constant) — `{ CONDITION_HISTORY_MAX: 100 }`: Maximum number of condition history snapshots to keep.
- **STARTER_HABITAT_POSITIONS** (constant) — `Record<string, { x: number; y: number }>`: Grid coordinates for starter habitat items.
- **clampCondition** (function) — `(value: number) => number`: Clamps a value between CONDITION_MIN and CONDITION_MAX.
- **calculatePoopCleanlinessReduction** (function) — `() => number`: Returns a random integer within the poop cleanliness reduction range.
- **isWarningLevel** (function) — `(value: number) => boolean`: True when value is below warning threshold but at/above critical threshold.
- **isCriticalLevel** (function) — `(value: number) => boolean`: True when value is below the critical threshold.

## Notes

- DECAY.QUALITY_MULTIPLIERS includes a 'colorful-premium' key not present in QUALITY_ORDER/QualityLevel, so quality keys differ between these two constants.
- Decay rates are expressed as fractional points per second (e.g. 1/(5*60)); they are intended to be scaled by a speed multiplier from SPEED_PRESETS.
