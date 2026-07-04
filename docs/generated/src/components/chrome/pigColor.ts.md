---
source: src/components/chrome/pigColor.ts
source_hash: fecdbfcd8955902c9c84ca66c293b279a54d5a6dd530adeb7a59ab013c8685d8
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Pig Color Utilities

`src/components/chrome/pigColor.ts`

> A collection of pure helper functions that translate a game guinea pig's fur color data into the color names, spot maps, and hex swatches that the PigSvg component and UI swatches expect. It provides a deterministic hash so each pig's spot appearance is stable across renders.

### Data flow
The module maps the game's lowercase `furColor` names (from `GuineaPig.appearance.furColor`) onto the capitalized keys PigSvg understands via `FUR_COLORS` and `FUR_NAME_OVERRIDES` (e.g. `tortoiseshell` → `Tortoise`).

### Key logic
- `h32` computes a cheap deterministic 32-bit hash of a string (used on `pig.id`).
- `toPigColorName` normalizes a furColor into a PigSvg color name, defaulting to `'Cream'` when empty.
- `pigColors` returns the `colors` array for PigSvg. Multi-color types (`Tortoise`, `Tricolor`, `Dalmatian`) expand into 2–3 patch color arrays via `MULTI_COLOR_NAMES`; single colors return a one-element array.
- `pigSpots` produces a deterministic spot map keyed off the pig id hash: ~40% no spots, ~40% one spot, ~20% two spots. Spot color is chosen from `SPOT_COLOR_NAMES` excluding the base fur, and locations come from `SPOT_LOCATIONS` using bit-shifted slices of the hash.
- `furHex` returns the hex for a single furColor name, falling back to `#cbd5e1`.
- `pigSwatches` combines `pigColors` and `pigSpots` into a deduplicated list of hex colors that appear on the pig SVG.

## Exports

- **h32** (function) — `h32(str: string): number`: Cheap deterministic hash of a string to a non-negative integer, used to derive stable spot appearance from a pig id.
- **toPigColorName** (function) — `toPigColorName(furColor: string): string`: Converts a game furColor name to a PigSvg-compatible capitalized color name; applies FUR_NAME_OVERRIDES and defaults to 'Cream'.
- **pigColors** (function) — `pigColors(pig: GuineaPig): string[]`: Returns the PigSvg `colors` array for a pig; multi-color types return 2–3 patch color names, otherwise a single-element array.
- **pigSpots** (function) — `pigSpots(pig: GuineaPig): Partial<Record<'face'|'neck'|'back'|'belly', string>> | undefined`: Deterministic spot map derived from the pig id hash; returns undefined for ~40% of pigs, otherwise 1–2 contrasting spot locations.
- **furHex** (function) — `furHex(furColor: string): string`: Returns the hex color for a furColor name (for swatches), falling back to '#cbd5e1'.
- **pigSwatches** (function) — `pigSwatches(pig: GuineaPig): string[]`: Returns a deduplicated list of hex swatches matching exactly the colors rendered on the pig SVG, including spot colors.

## Internal dependencies

- `../../stores/guineaPigStore`
- `./PigSvg.vue`

## Notes

- Relies on FUR_COLORS exported from PigSvg.vue; color name keys must stay in sync between this file, MULTI_COLOR_NAMES, and PigSvg's palette.
- Spot and color choices are deterministic per pig id via h32; changing the hash or bit-shift logic changes every pig's appearance.
- Unknown color names silently fall back to '#cbd5e1' in furHex and pigSwatches.
