---
source: src/styles/chrome/panels.css
source_hash: 1e77b501170e7422ee6d5f281014292b6b05ce503e6d7dd137035d07a0e161fb
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Chrome Panels Styles

`src/styles/chrome/panels.css`

> A CSS stylesheet defining the visual appearance of various UI panel components within the game's chrome (UI shell), including the activity feed, habitat status meters, pig need rows, the pig drawer with tabs and info sections, and the inventory grid. It provides a consistent parchment/wood-themed aesthetic driven by shared CSS custom properties.

This file is organized into several themed sections, each styling a distinct panel widget using BEM-style class naming.

### Activity feed
`.chrome-feed` is a scrollable flex column (max 360px) holding `.chrome-feed__entry` cards with a left accent border driven by `--entry-accent`, plus `__empty`, `__time`, `__text`, and `__emoji` sub-elements.

### Meters & need rows
`.chrome-meter` and `.need-row` both render labeled progress bars with a `__track`/`__fill` structure and inset-shadowed gradient tracks. Need rows support urgency states via the `[data-need-urgency]` attribute selector (`satisfied`, `good`, `medium`, `critical`), each overriding `--need-bg`, `--need-border`, and `--need-text` custom properties. Comment notes these can also be set inline by PigNeedsPanel.vue.

### Pig drawer
`.pig-drawer__tabs` and `.pig-drawer__tab` (with `--active` modifier) form a tabbed header; `.pig-drawer__content` is the scrollable body. `.pig-info__*` classes style section headers, dividers, key/value rows, and animated bars (`__bar-track`/`__bar-fill`, `__bond-track`/`__bond-fill` with a `--bond-color` variable) plus a `__tier` badge.

### Inventory grid
`.chrome-inv__grid` is a 3-column grid of `.chrome-inv__tile` buttons with hover lift/rotate animation, plus `--selected` (pink outline) and `--readonly` modifiers and emoji/name/count/empty sub-elements.

Colors, radii, fonts, and spacing all reference global design-token CSS variables (`--color-*`, `--radius-*`, `--font-*`, `--space-*`, `--chrome-*`, `--panel-bg-*`).

## Exports

- **panels.css** (style) — `.chrome-feed, .chrome-meter, .need-row, .pig-drawer__*, .pig-info__*, .chrome-inv__*`: Global (unscoped) CSS class definitions for chrome panel widgets: activity feed entries, status meters, need rows with urgency data-attribute states, the pig drawer tabs/info, and the inventory tile grid.

## Internal dependencies

- `CSS custom properties defined elsewhere (design tokens: --color-*, --radius-*, --font-size-*, --font-weight-*, --font-family-*, --space-*, --chrome-*, --panel-bg-*)`

## Notes

- Need-row urgency styling relies on a `data-need-urgency` attribute being set on `.need-row` elements (by NeedRow.vue) or inline CSS variables (by PigNeedsPanel.vue).
- Many colors/sizes are entirely token-driven; missing global variable definitions will break the intended appearance.
- Component-level fallback variables (--entry-accent, --meter-border, --need-bg, --bond-color, --tile-soft, --tile-deep) are expected to be supplied inline by the consuming Vue components.
