---
source: src/utils/personalityDecay.ts
source_hash: 3f704ccc8a52b2023d2208e4795eb05d40dffc06ab64389e6e95f4c532440bed
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Personality Decay Modifiers

`src/utils/personalityDecay.ts`

> A collection of pure utility functions that compute how a guinea pig's personality traits (friendliness, playfulness, curiosity, boldness, cleanliness) modify the decay rate of various needs. Shared between the read-only info view (PetStoreDebug) and the editor form (GuineaPigEditor) to keep modifier math and display formatting consistent.

Each `get*DecayModifier` function takes a trait value (nominally 1-10, centered on 5) and returns a formatted 2-decimal string representing a multiplier around 1.0. The formulas vary by trait: social uses ±0.04 per point, play ±0.06, stimulation ±0.08, boldness -0.05 (inverse), and hygiene -0.06 (inverse). Boldness and hygiene subtract, so higher trait values yield slower decay.

`getDecayModifierClass` maps a modifier string to a CSS class: `decay-modifier--slower` (<0.9), `decay-modifier--faster` (>1.1), or `decay-modifier--normal` otherwise. `getDecayEffectText` formats a modifier as a percentage change string like `(+40%)`, `(-30%)`, or `(±0%)`. `capitalize` is a small string helper that uppercases the first character and lowercases the rest.

## Exports

- **capitalize** (function) — `(str: string) => string`: Returns the string with the first character uppercased and the remainder lowercased.
- **getSocialDecayModifier** (function) — `(friendliness: number) => string`: Computes social need decay multiplier: 1 + (friendliness - 5) * 0.04, formatted to 2 decimals.
- **getPlayDecayModifier** (function) — `(playfulness: number) => string`: Computes play need decay multiplier: 1 + (playfulness - 5) * 0.06, formatted to 2 decimals.
- **getStimulationDecayModifier** (function) — `(curiosity: number) => string`: Computes stimulation need decay multiplier: 1 + (curiosity - 5) * 0.08, formatted to 2 decimals.
- **getBoldnessDecayModifier** (function) — `(boldness: number) => string`: Computes boldness-related decay multiplier: 1 - (boldness - 5) * 0.05, formatted to 2 decimals (inverse relationship).
- **getHygieneDecayModifier** (function) — `(cleanliness: number) => string`: Computes hygiene need decay multiplier: 1 - (cleanliness - 5) * 0.06, formatted to 2 decimals (inverse relationship).
- **getDecayModifierClass** (function) — `(modifier: string) => string`: Returns a CSS class name based on the parsed modifier value: '--slower' (<0.9), '--faster' (>1.1), or '--normal'.
- **getDecayEffectText** (function) — `(modifier: string) => string`: Returns a parenthesized percentage-change label such as '(+40%)', '(-30%)', or '(±0%)'.

## Notes

- Modifier functions return formatted strings, not numbers; downstream helpers (getDecayModifierClass, getDecayEffectText) parse them back with parseFloat.
- Boldness and hygiene use inverse formulas (subtraction), so higher trait values decrease the modifier below 1.
- getDecayEffectText's exact-1.0 branch only fires on strict equality after formatting; the class thresholds (0.9/1.1) and effect-text sign thresholds do not align with each other.
