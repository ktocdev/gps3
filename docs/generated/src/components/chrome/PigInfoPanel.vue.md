---
source: src/components/chrome/PigInfoPanel.vue
source_hash: 566b9a7ec9898c7b34d8d28d0aa49710f74c0fafacb033305a7a684a61cb1777
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigInfoPanel.vue

`src/components/chrome/PigInfoPanel.vue`

> A presentational Vue SFC that displays detailed information about a single guinea pig, including its basic attributes, its friendship level with the user, and its bonding relationships with other active guinea pigs.

## Structure
The template renders three logical sections:

1. **Info** — shows the pig's `breed`, `gender` (rendered as ♂ Male / ♀ Female), and fur (from the computed `furLabel`).
2. **User Friendship** — shows a rounded friendship percentage, a progress bar whose width is bound to `guineaPig.friendship`, the relative time of `lastInteraction` (via `relTime`), and `totalInteractions`.
3. **Bonds** — conditionally rendered (`v-if="bonds.length > 0"`), it iterates over the computed `bonds` array to show a bar and tier label for each bond with other active pigs.

## State & data flow
- Accepts a single `guineaPig` prop of type `GuineaPig`.
- Uses `useGuineaPigStore()` to read `activeGuineaPigs` and call `getBond(id, otherId)`.
- `furLabel` capitalizes `appearance.furColor` and `appearance.furPattern`.
- `bonds` maps over all active pigs except the current one, fetching each bond, defaulting `bondingLevel` to 0 and `bondingTier` to `'neutral'`. It maps the tier to a label and CSS color via a lookup object (`bonded`/`friends`/`neutral`).
- `relTime` converts a timestamp into a human-friendly relative string (just now / Xm / Xh / Xd ago), returning '—' for null.

Styling is unscoped (`<style>` without scoped) and relies heavily on CSS custom properties for spacing, fonts, and colors.

## Exports

- **PigInfoPanel** (component) — `<PigInfoPanel :guineaPig="GuineaPig" />`: Displays info, user friendship, and inter-pig bonds for one guinea pig. Props: `guineaPig: GuineaPig` (required). No emits. No slots.

## Internal dependencies

- `../../stores/guineaPigStore`

## Notes

- Style block is not scoped, so class rules like `.pig-info__rows` leak globally.
- The tier lookup object in `bonds` has no fallback beyond the three keys; an unexpected `bondingTier` value would yield `undefined` for `tierMeta` and throw on access.
- `relTime` uses `Date.now()` at render time and is not reactive to time passing without a re-render.
