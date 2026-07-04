---
source: src/utils/compatibility.ts
source_hash: 597abc0b6e13932f74803a6982e5dad20770da6c639e21b942eb67ff46ae8928
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Guinea Pig Compatibility Calculation

`src/utils/compatibility.ts`

> This utility module calculates a hidden 0-100 compatibility score between two guinea pigs based on their gender, personality traits, and breed. The score is used to influence bonding speed and interaction harmony in the game, and is intentionally hidden from players.

The module centers on `calculateCompatibility`, which sums contributions from several private helper functions and clamps the result to 0-100.

### Scoring components
- **Gender** (`calculateGenderCompatibility`): Male-Female = 25, Female-Female = 15, Male-Male = 5.
- **Friendliness**: both ≥7 gives 20, complementary (one ≥7, other ≤3) gives 10, both ≤3 gives -5, otherwise 5.
- **Boldness**: both in 4-7 range gives 15, extreme mismatch (one ≥8, other ≤3) gives -10, diff ≤2 gives 8, else 0.
- **Playfulness**: diff ≤3 gives 10, diff ≥7 gives -5, else 3.
- **Curiosity**: both ≥7 gives 10, both ≤3 gives 3, else 5.
- **Cleanliness**: both in 4-7 range gives 10, diff ≥7 gives -5, diff ≤2 gives 5, else 0.
- **Breed** (`calculateBreedCompatibility`): same breed gives 10, similar breed family gives 5, else 0.

### Breed families
`isSimilarBreedFamily` uses a hardcoded `breedFamilies` map (grouped by coat/size: short-haired, long-haired, rex breeds) and lowercases breed names before lookup. It returns false if either breed is missing from the map.

### Helper exports
`getCompatibilityDescription` maps a numeric score to a human-readable string band. `getCompatibilityBreakdown` returns an object with the total plus each individual component score for debugging.

## Exports

- **calculateCompatibility** (function) — `(gp1: GuineaPig, gp2: GuineaPig) => number`: Returns the total compatibility score (0-100) by summing gender, five personality trait, and breed contributions, then clamping.
- **getCompatibilityDescription** (function) — `(score: number) => string`: Maps a numeric score to a descriptive band string (Excellent/Very good/Good/Moderate/Fair/Low). Intended for debug/testing; hidden from players.
- **getCompatibilityBreakdown** (function) — `(gp1: GuineaPig, gp2: GuineaPig) => { total: number; gender: number; friendliness: number; boldness: number; playfulness: number; curiosity: number; cleanliness: number; breed: number }`: Returns an object with the total score plus each individual component score for debugging purposes.

## Internal dependencies

- `../stores/guineaPigStore`

## Notes

- The `total` in `getCompatibilityBreakdown` is clamped to 0-100, so it may not equal the arithmetic sum of the individual (unclamped) component values.
- Individual trait scores can be negative (e.g. -10, -5), so raw sums are only clamped once in `calculateCompatibility`.
- Breed matching is case-insensitive (breeds lowercased), but breed equality in `calculateBreedCompatibility` is case-sensitive (`breed1 === breed2`).
- Breeds not present in the hardcoded `breedFamilies` map yield no family bonus.
