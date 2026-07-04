---
source: src/components/chrome/PigInfoPanel.vue
source_hash: 9098de31649c6aaab1e5fedf95921fbbdfbd0acefa604838cb5681b6fe4f2f06
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigInfoPanel.vue

`src/components/chrome/PigInfoPanel.vue`

> A presentational Vue component that displays detailed information about a single guinea pig, including its breed/gender/fur, its friendship level with the user, and its bonding levels with other active guinea pigs.

## Structure
The component renders three sections separated by dividers:

1. **Info** — breed, gender (formatted as ♂ Male / ♀ Female), and fur (computed via `furLabel`).
2. **User Friendship** — a percentage value (rounded), a progress bar whose fill width is bound to `guineaPig.friendship`, and rows showing last interaction (relative time) and total interactions.
3. **Bonds** — rendered only when `bonds.length > 0`; iterates over other active guinea pigs showing a colored bond progress bar, rounded percentage, and tier label.

## Data flow
Takes a single `guineaPig` prop of type `GuineaPig`. Reads from `useGuineaPigStore()` to compute bonds.

- `furLabel`: capitalizes and concatenates `appearance.furColor` and `appearance.furPattern`.
- `bonds`: filters `guineaPigStore.activeGuineaPigs` to exclude the current pig, then maps each to bond data via `guineaPigStore.getBond(...)`. Defaults level to 0 and tier to `'neutral'` when no bond exists. Maps tier (`bonded`/`friends`/`neutral`) to a label and CSS color variable.
- `relTime`: formats a timestamp (or null → '—') into a relative string ('just now', 'Xm ago', 'Xh ago', 'Xd ago').

Styling uses BEM-like class names with CSS custom properties; the `<style>` block is non-scoped (global).

## Internal dependencies

- `../../stores/guineaPigStore`

## Notes

- The `<style>` block is not scoped, so its class rules are global.
- Some styles referenced in the template (e.g. `pig-info__section-header`, `pig-info__bar-track`, `pig-info__bar-fill`, `pig-info__bond-track`, `pig-info__bond-fill`, `pig-info__row`, `pig-info__divider`, `pig-info__tier`) are not defined in this file's `<style>` block and must come from elsewhere.
- `relTime` uses `Date.now()` at render time but is not reactive to time passing; it only recomputes when dependencies change.
