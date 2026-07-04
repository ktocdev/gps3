---
source: src/constants/guineaPigColors.ts
source_hash: 967b11f98dc1fbf9ef49f28cc91c416a2a2aa7afcc38c1cd9111593d1c2bfc7e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Guinea Pig Color Palettes

`src/constants/guineaPigColors.ts`

> Defines realistic color palettes and helper functions for rendering guinea pig 3D models. It centralizes fur, ear, skin, and eye color hex values keyed by named colors, and provides utilities to resolve and randomize colors for a given guinea pig's appearance.

This module is a pure data-and-utility file with no side effects.

### Data
- `FUR_COLOR_PALETTES`: a record mapping fur color names (e.g. `white`, `black`, `tortoiseshell`) to `{ fur, ear, skin }` hex triples, organized into common/uncommon/rare groups.
- `EYE_COLORS`: a record mapping eye color names (`brown`, `black`, `red`, `blue`, `pink`) to hex values.
- `DEFAULT_GUINEA_PIG_COLORS`: a fallback full palette (tan fur, black eye).

### Functions
- `getRandomEyeColor(furColorName)`: returns a random eye color hex. For a hardcoded list of light fur colors, it has a 25% chance of pink/red (split 50/50), a 20% chance of blue, otherwise falls through. All other cases return brown (60%) or black (40%).
- `eyeColorNameToHex(eyeColorName)`: looks up `EYE_COLORS`, defaulting to brown if not found.
- `getGuineaPig3DColors(furColorName, eyeColorName)`: combines a fur palette (defaulting to `tricolor` if the name is unknown) with a resolved eye color into a full `GuineaPig3DColors` object.

Color values are stored as numeric hex literals suitable for Three.js material colors.

## Exports

- **GuineaPigColorPalette** (type) — `interface GuineaPigColorPalette { fur: number; ear: number; skin: number }`: Interface for a fur/ear/skin color triple as hex numbers.
- **GuineaPig3DColors** (type) — `interface GuineaPig3DColors extends GuineaPigColorPalette { eye: number }`: Full palette including an eye color.
- **FUR_COLOR_PALETTES** (constant) — `Record<string, GuineaPigColorPalette>`: Fur color name to {fur, ear, skin} palette map covering common, uncommon, and rare colors.
- **EYE_COLORS** (constant) — `Record<string, number>`: Eye color name (brown, black, red, blue, pink) to hex value map.
- **getRandomEyeColor** (function) — `(furColorName: string) => number`: Returns a randomized eye color hex, weighted differently for a hardcoded set of light fur colors.
- **eyeColorNameToHex** (function) — `(eyeColorName: string) => number`: Resolves an eye color name to hex, defaulting to brown when unknown.
- **getGuineaPig3DColors** (function) — `(furColorName: string, eyeColorName: string) => GuineaPig3DColors`: Returns the full 3D color palette, defaulting fur to tricolor and eye to brown when names are unknown.
- **DEFAULT_GUINEA_PIG_COLORS** (constant) — `GuineaPig3DColors`: Fallback full color palette (tan fur, dark brown ears, light pink skin, black eye).

## Notes

- getRandomEyeColor uses a hardcoded lightColors list ['white','cream','beige','gray','lilac','buff'] to alter eye color probabilities.
- Unknown fur names fall back to the 'tricolor' palette; unknown eye names fall back to 'brown'.
- Color values are numeric hex literals (Three.js style), not CSS strings.
