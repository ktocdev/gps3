---
source: src/stores/guineaPigStore.ts
source_hash: 6e2ead06d7564e0994450e0aa3281ce4a86da852094ca4081bea55b9b9ff475e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Guinea Pig Store

`src/stores/guineaPigStore.ts`

> This Pinia store is the central entity manager for guinea pigs in the GPS2 simulation game. It owns the collection of all guinea pigs, tracks which up-to-two are 'active' (in the habitat), and implements the core simulation mechanics: needs decay over time, player interactions (feeding, watering, playing, etc.), friendship/relationship tracking, consumption limits, interaction rejection/cooldowns, personality-based behavior modifiers, manual movement control, and the active social bonding system between pairs of guinea pigs.

### State
- `collection`: `{ guineaPigs: Record<id, GuineaPig>, activeGuineaPigIds: string[], lastUpdated }` — persisted to localStorage.
- `settings`: decay toggles/rates, max collection size, breeding flag.
- `selectedGuineaPigId`: System 17 selection for interaction/manual control.
- `activeBonds`: a `Map<string, ActiveBond>` (System 21) with custom serializer converting Map↔array for persistence. `ensureActiveBondsIsMap()` guards against deserialization producing a plain object.

### Computed
`allGuineaPigs` (annotated with `isActive`), `guineaPigCount`, `hasGuineaPigs`, `canAddMoreGuineaPigs`, `activeGuineaPigs` (array), `activeGuineaPig` (first, backward compat), `activeGuineaPigPair` (only when exactly 2), `canAddActiveGuineaPig`.

### Needs decay
`needsDecayRates` are calibrated for per-minute application via `deltaTimeMs`. `processNeedsDecay` applies base rate × global multiplier × personality modifier (`getPersonalityDecayModifier`), plus a bonding-tier social modifier (`getSocialDecayModifierFromBonding`). `processBatchNeedsDecay` iterates active guinea pigs, desynchronizes initial timestamps with a random offset, and applies passive friendship gain/loss based on wellness (from `useNeedsController`) plus penalties for critically low needs.

### Interactions
Each interaction method (`feedGuineaPig`, `giveWater`, `cleanGuineaPig`, `playWithGuineaPig`, `socializeWithGuineaPig`, `rearrangeCage`, `provideBedding`, `provideChewToy`, `trimNails`, `provideShelter`, `sootheToSleep`) mutates needs via `satisfyNeed`/`adjustNeed`, awards friendship, logs a generated message, and updates interaction counters. Feeding enforces a combined 5-serving non-hay consumption limit and honors favorite/disliked food preferences. Play/social check cooldowns via `checkInteractionCooldown`.

### Rejection & cooldowns
System 2.5 rejection logic (`calculateRejectionProbability`, `calculateRejectionCooldown`, `applyRejectionPenalty`, `attemptInteraction`) computes accept/reject rolls from wellness, friendliness, friendship.

### Bonding (System 21)
Create/query/update bonds, track bonding level/tier/history/proximity; reactivity is triggered by replacing the Map on each mutation.

### Other
Manual control setters, habitat sensitivity thresholds by cleanliness trait, save/load, and collection validation/migration (old single-active-id → pair array).

## Exports

- **useGuineaPigStore** (store) — `defineStore('guineaPigStore', setup, { persist })`: Pinia setup store managing the guinea pig collection, active pair, needs decay, interactions, friendship, consumption limits, rejection cooldowns, social bonds, and manual control. Persisted to localStorage under key 'gps2-guinea-pig-store' with a custom serializer for the activeBonds Map.
- **GuineaPig** (type) — `interface GuineaPig`: Core entity: identity, gender/breed, personality, preferences, needs, stats, appearance, friendship, relationships/bonds, consumption limits, interaction rejection state, cooldown timestamps, adoption/habitat metadata, and manual control state.
- **GuineaPigPersonality** (type) — `interface GuineaPigPersonality`: Five 1-10 traits: friendliness, playfulness, curiosity, boldness, cleanliness.
- **GuineaPigPreferences** (type) — `interface GuineaPigPreferences`: Arrays for favoriteFood, dislikedFood, favoriteActivity, habitatPreference.
- **GuineaPigNeeds** (type) — `interface GuineaPigNeeds`: Ten 0-100 need values (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, chew) where 100=satisfied.
- **GuineaPigStats** (type) — `interface GuineaPigStats`: weight, age, level, experience, overallMood.
- **GuineaPigAppearance** (type) — `interface GuineaPigAppearance`: furColor, furPattern, eyeColor, size.
- **GuineaPigBond** (type) — `interface GuineaPigBond`: Phase 5 preserved bond: partnerId, relationshipLevel, bondedAt, timesTogether.
- **ActiveBond** (type) — `interface ActiveBond`: System 21 active social bond between two guinea pigs with bondingLevel/tier, compatibilityScore, proximityTime, and bondingHistory.
- **BondingEvent** (type) — `interface BondingEvent`: A single positive bonding change record with type, timestamp, description.
- **ConsumptionLimit / ConsumptionLimits** (type) — `interface ConsumptionLimit; interface ConsumptionLimits`: Per-food-type consumed/limit tracking; non-hay foods share a combined limit of 5.
- **InteractionRejection** (type) — `interface InteractionRejection`: Tracks last rejection time, cooldown end time, rejection count, and cooldown flag.
- **FeedResult / InteractionResult** (type) — `interface FeedResult; interface InteractionResult`: Return-value shapes describing success, rejection, message, and penalties/cooldowns.
- **FoodType** (type) — `type FoodType = 'fruit'|'vegetables'|'pellets'|'treats'|'hay'|'greens'|'herbs'`: Union of feedable food categories.
- **InteractionType** (type) — `type InteractionType = 'play'|'social'`: Union of rejectable interaction types.
- **NeedType** (type) — `type NeedType = 'hunger'|...|'chew'`: Union of all need keys.

## Internal dependencies

- `./loggingStore`
- `./needsController`
- `./habitatConditions`
- `../utils/messageGenerator`
- `../utils/compatibility`
- `../utils/bondingProgression`
- `pinia`
- `vue`

## Notes

- `activeBonds` is a Map but persisted as an array; every read path calls `ensureActiveBondsIsMap()` to repair post-deserialization objects, and mutations replace the Map to trigger reactivity — do not mutate in place expecting reactivity.
- `processNeedsDecay` references a `happiness` need in its special-case branch and calls `processHappinessDecay`, but `happiness` is not a key in `needsDecayRates` or `GuineaPigNeeds`, so this branch is effectively dead code.
- `needsDecayRates` comments describe per-second calibration but the code converts deltaTime to minutes and multiplies by the rate directly — read comments carefully against actual formula.
- Interactions and decay have side effects on the shared `loggingStore`, `needsController` (wellness), and `habitatConditions` (position init); many logging calls were intentionally removed to prevent message spam.
- `adjustFriendship` is a no-op when `friendshipFrozen` is true (Stardust Sanctuary/Phase 4).
- `feedGuineaPig` enforces a single combined 5-serving limit across all non-hay foods (not per-type despite per-type ConsumptionLimit structure); hay is unlimited and untracked.
- `updateGuineaPig` strips `id` and `birthDate` from updates to keep them immutable.
- `validateCollection` migrates legacy `activeGuineaPigId` (single) to `activeGuineaPigIds` (array) and prunes invalid/dangling IDs.
- Lazy `getLoggingStore()` pattern avoids Pinia initialization ordering issues; `useNeedsController`/`useHabitatConditions` are called inline within functions rather than at store setup.
- Adding a second active guinea pig auto-creates bonds via `ensureBondsExist`; `getAllBonds`/`getBondsForGuineaPig` also lazily create bonds if none exist and 2+ are active.
