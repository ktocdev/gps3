---
source: src/utils/bondingProgression.ts
source_hash: c79e451533db14d2b67fc4b1b528fec03af07111e1bfa60b79f5b6242688817f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Bonding Progression System

`src/utils/bondingProgression.ts`

> Implements System 21 (Social Bonding) progression logic, increasing bonding levels between pairs of guinea pigs over time based on proximity, mutual wellness, and compatibility. It periodically advances bonds, detects tier changes, emits milestone messages to the activity feed, and provides per-tier gameplay benefit modifiers.

## Store access
Store instances (`guineaPigStore`, `loggingStore`, `needsController`) and the `areGuineaPigsNear` behavior helper are lazily initialized and cached via module-level variables through `getStores()`, avoiding repeated Pinia initialization.

## Progression logic
`processBondingProgression(bond, deltaTimeMs)` computes a `bondingIncrease` for a single bond:
1. Recent social interactions are noted as handled elsewhere (in `useSocialBehaviors`), not computed here.
2. Proximity: if both guinea pigs are within distance 2, adds 1 point per 10 seconds of `deltaTimeMs`, and records proximity minutes via `updateProximityTime`.
3. Wellness bonus: if both guinea pigs' wellness (via `calculateWellness`) exceed 70, adds 1 point per elapsed day.
4. The total is multiplied by `bond.compatibilityScore / 100`.

If `bondingIncrease > 0`, it calls `updateBondingLevel`, then compares the new tier (`getBondingTier`) against the prior tier and, if changed, emits a milestone message.

## Milestones
`generateTierMilestoneMessage` produces contextual activity feed text/emoji for neutral→friends, friends→bonded, and neutral→bonded transitions, posting via `loggingStore.addPlayerAction`.

## Benefits
`getBondingTierBenefits(bondingLevel)` returns `socialDecayModifier`, `proximityBonus`, and `interactionFrequency` based on three tiers (neutral 0–30, friends 31–70, bonded 71+).

## Batch processing
`processAllBonds(deltaTimeMs)` iterates all bonds from `getAllBonds()` and runs progression on each; intended to be called from the game timing loop.

## Exports

- **processBondingProgression** (function) — `(bond: ActiveBond, deltaTimeMs: number): void`: Processes bonding progression for a single bond using proximity, wellness, and compatibility, updates the bonding level, and emits tier milestone messages when the tier changes.
- **getBondingTierBenefits** (function) — `(bondingLevel: number): { socialDecayModifier: number; proximityBonus: number; interactionFrequency: number }`: Returns gameplay modifier values for social need decay, proximity satisfaction bonus, and autonomous interaction frequency based on the bond's tier.
- **processAllBonds** (function) — `(deltaTimeMs: number): void`: Fetches all active bonds and runs processBondingProgression on each; called from the game timing loop.

## Internal dependencies

- `../stores/guineaPigStore`
- `../stores/loggingStore`
- `../composables/game/useSocialBehaviors`
- `../stores/needsController`

## Notes

- Uses module-level cached store instances; assumes Pinia is active when first called and reuses the same instances for the app lifetime.
- Tier advancement check reads `bond.bondingLevel` after calling `updateBondingLevel`, relying on the bond object being mutated reactively rather than using a returned value.
- `generateTierMilestoneMessage` takes `loggingStore` as `any`, bypassing type checking.
- Proximity check uses a hardcoded distance threshold of 2; wellness threshold is hardcoded at 70.
- `generateTierMilestoneMessage` only emits messages for upward transitions; other tier changes produce no message.
