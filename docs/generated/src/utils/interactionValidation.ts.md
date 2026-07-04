---
source: src/utils/interactionValidation.ts
source_hash: 2267243c6a37f72e385550b96b1a79c62c9cd5df515d8d491ac1c4d2a168380a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Interaction Validation Utilities

`src/utils/interactionValidation.ts`

> A collection of pure utility functions that determine whether and how successfully a player can interact with a guinea pig. It computes interaction success rates based on wellness, personality (boldness), friendship, habitat quality, and interaction type, then resolves interaction attempts into success/failure outcomes with reaction messages and cooldowns.

### Wellness tiers & base rates
`getWellnessTier` maps a wellness percentage into one of five tiers (excellent/good/fair/poor/critical). `getSuccessRateForWellness` converts a tier into a base success probability (0.95 down to 0.20).

### Modifiers
Three modifier functions adjust the base rate: `getInteractionTypeModifier` (+15% for essential care, -10% for physical handling, +10% for comfort), `getPersonalityModifier` (based on `guineaPig.personality.boldness`: -10% shy, +10% bold), and `getFriendshipModifier` (based on friendship value, +15% down to -15%).

### validateInteraction
Combines the base rate plus all modifiers, then subtracts for poor habitat quality (-20% below 50, -10% below 70), clamps to [0,1], and applies a three-factor rejection system: (1) wellness < 50 forces rejection of physical interactions (`low_wellness`); (2) habitat < 50 flags `dirty_habitat`; (3) shy + low friendship physical interactions flagged `too_shy` (capped at 20%); plus a legacy `tired` reason below 30 wellness. Care interactions are always accepted (≥90% success) when wellness < 50, clearing any rejection reason. `canInteract` is always `true` — attempts are always allowed but may fail.

### attemptInteraction
Runs `validateInteraction`, rolls `Math.random()` against the success rate, builds a `MessageContext`, and calls `generateReactionMessage`. On failure it assigns a cooldown scaled by wellness tier (30s to 2min).

### checkNeedWarning
Standalone helper returning 'critical' (≤15), 'warning' (≤30), or null.

## Exports

- **InteractionValidation** (type) — `interface InteractionValidation { canInteract: boolean; successRate: number; wellnessTier; rejectionReason?; reactionMessage? }`: Result of validating an interaction, including success rate, wellness tier, and optional rejection reason.
- **InteractionAttempt** (type) — `interface InteractionAttempt { success: boolean; reactionMessage: ReactionMessage; cooldownMs?: number }`: Outcome of an attempted interaction with reaction message and optional cooldown.
- **getWellnessTier** (function) — `(wellness: number) => 'excellent'|'good'|'fair'|'poor'|'critical'`: Maps a wellness percentage to a tier using fixed thresholds (80/60/40/20).
- **getSuccessRateForWellness** (function) — `(wellnessTier: string) => number`: Returns the base success probability for a wellness tier; defaults to 0.70.
- **getInteractionTypeModifier** (function) — `(interactionType: string) => number`: Returns a success modifier by interaction category: care +0.15, handling -0.10, comfort +0.10, else 0.
- **getPersonalityModifier** (function) — `(guineaPig: GuineaPig) => number`: Returns -0.10 for boldness ≤3, +0.10 for boldness ≥8, else 0.
- **getFriendshipModifier** (function) — `(friendship: number) => number`: Returns a success modifier based on friendship value (+0.15 to -0.15).
- **validateInteraction** (function) — `(guineaPig: GuineaPig, wellness: number, interactionType: string, habitatQuality?: number) => InteractionValidation`: Computes final success rate and rejection reason from wellness, modifiers, habitat, and personality. Always returns canInteract=true.
- **attemptInteraction** (function) — `(guineaPig: GuineaPig, wellness: number, interactionType: 'feed'|'play'|'socialize'|'general', preferenceLevel?, habitatQuality?: number) => InteractionAttempt`: Validates then rolls for success, generates a reaction message, and assigns a wellness-based cooldown on failure.
- **checkNeedWarning** (function) — `(needValue: number) => 'warning'|'critical'|null`: Returns 'critical' for ≤15, 'warning' for ≤30, otherwise null.

## Internal dependencies

- `../stores/guineaPigStore`
- `../data/guineaPigMessages`

## Notes

- `canInteract` is hardcoded to `true`; validation only affects success probability, never blocks the attempt.
- `attemptInteraction` uses `Math.random()`, so it is non-deterministic and has side-effect-free but unpredictable output.
- The `interactionType` string categories used in `validateInteraction`/`getInteractionTypeModifier` (e.g. 'pet', 'hold', 'clean') differ from the narrower literal union `'feed'|'play'|'socialize'|'general'` accepted by `attemptInteraction`, so most category-specific modifiers won't trigger when called via `attemptInteraction`.
- Care interactions with wellness < 50 override all rejection logic, forcing ≥90% success and clearing the rejection reason.
