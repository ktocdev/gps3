---
source: src/components/chrome/PigSvg.vue
source_hash: 5a6f279e197ede80e67420d749ec6656e38f31ebcf99310b9bdc70b4de7cfaaf
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigSvg Component

`src/components/chrome/PigSvg.vue`

> A Vue SFC that renders a stylized guinea pig as an inline SVG. It supports five breeds with distinct body silhouettes and fur textures, layered fur color patches, named per-region spots, configurable eye color, and optional blinking/walking animations. It also exports shared color/type constants used elsewhere in the app.

### Module-level exports
The first `<script>` block exports `FUR_COLORS` (named-color → hex map across common/uncommon/rare tiers), `EYE_COLORS`, and the `Breed` and `SpotKey` types.

### Props & derived state
The `<script setup>` block defines props: `breed`, `colors` (array of color names/hex), `spots` (partial per-region overrides), `eye`, `size`, `uid`, and `walking`, all with defaults. `hex` maps each color name through `FUR_COLORS` (falling through to the raw string). `c0`/`c1`/`c2` are base body, saddle/ear patch, and rear/face patch colors respectively; `earColor`, `saddleColor`, `rearColor` derive from them.

`bodyPath` selects one of five hardcoded SVG path constants (`BODY_PATH`, `TEDDY_PATH`, `ABYSSINIAN_PATH`, `PERUVIAN_PATH`) based on breed. `clipId` builds a unique clipPath id from `uid`. `svgH` scales height to a 180×120 viewBox. `eyeHex` resolves eye color. `spotHex` resolves each named spot to hex.

`footColor` returns black only when the base body, belly spot, or rear color is black; otherwise a pink default. `blinkDelay` uses a small string-hash (`h32uid`) of `uid` to give each pig a staggered blink animation delay.

### Fur textures
`shade()` lightens/darkens a hex color; `furDark`/`furLight` derive from `c0`. `rand()` is a deterministic sine-based pseudo-random generator. `abyFur` computes an array of short radiating fur strokes (only for Abyssinian) emanating from `ABY_CENTERS` rosette whorls. `ABY_TUFTS` and `TUFTS` are static tuft position arrays for Abyssinian and Teddy.

### Template
Renders shadow ellipse, breed-specific coat elements (Silkie back coat, Abyssinian tufts, Peruvian skirt/locks), the body path, a clipped group with color patches + named spots + breed textures, ears, feet (hidden for Peruvian), animated eye, blush, nose, and mouth. `<style>` defines blink, walking-step foot animations, and a reduced-motion override.

## Exports

- **PigSvg** (component) — `<PigSvg :breed :colors :spots :eye :size :uid :walking />`: Default SFC export. Props: breed ('American'|'Abyssinian'|'Peruvian'|'Teddy'|'Silkie', default 'American'), colors (string[], default ['Orange']), spots (Partial<Record<'face'|'neck'|'back'|'belly',string>>), eye (string, default 'black'), size (number, default 110), uid (string, default 'default'), walking (boolean, default false). Emits none. Renders an SVG guinea pig.
- **FUR_COLORS** (constant) — `Record<string, string>`: Named fur color → hex map organized into common/uncommon/rare tiers.
- **EYE_COLORS** (constant) — `Record<string, string>`: Named eye color → hex map (brown, black, red, blue, pink).
- **Breed** (type) — `type Breed = 'American' | 'Abyssinian' | 'Peruvian' | 'Teddy' | 'Silkie'`: Union of supported guinea pig breeds.
- **SpotKey** (type) — `type SpotKey = 'face' | 'neck' | 'back' | 'belly'`: Union of named spot region keys.

## Internal dependencies

- `vue`

## Notes

- clipId is derived from the uid prop; passing duplicate uids on the same page produces duplicate clipPath ids, which can cause clipping conflicts.
- colors array positions are semantic: index 0 = base body, 1 = saddle/ear patch, 2 = rear/face patch. Order matters.
- Unknown color/eye names silently fall through to the raw string value as if it were a hex/CSS color.
- abyFur strokes are only generated for the Abyssinian breed; the computed returns an empty array otherwise.
- footColor darkens feet to black only when base body, belly spot, or rear color is black — a black saddle alone does not.
- The <style> block is unscoped (global), so the .pig-eye/.pig-foot/keyframe rules leak to the whole document.
