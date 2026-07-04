---
source: src/styles/stats.css
source_hash: 59816c28ab34eefc83b0abbc56b0e99c2522929358f7437410482964ce0bac9b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Stats Component Styles

`src/styles/stats.css`

> A stylesheet defining the visual presentation of stats components — a bordered, striped list of label/value rows — plus a set of semantic text-color utility classes. It relies on CSS custom properties (design tokens) for colors, spacing, radii, and typography.

Defines a `.stats-grid` container as a vertical flex layout with a dark border, rounded corners, and hidden overflow. Inside, `.stat-item` rows use space-between flex alignment with block/inline padding and a light bottom border (removed on the last child). Rows are zebra-striped via `:nth-child(odd)` (tertiary background) and `:nth-child(even)` (secondary background).

`.stat-label` and `.stat-value` set Roboto typography with base font size; labels use secondary text color and medium weight, values use primary text color, semibold weight, and capitalized text. Value modifier classes (`--error`, `--warning`, `--success`, `--muted`) override the value color.

A separate group of `.text--*` utility classes (`success`, `error`, `warning`, `info`, `muted`) provides standalone semantic text coloring for use outside the stat-value context. All colors, spacing, radii, and font tokens come from CSS variables.

## Exports

- **.stats-grid** (style) — `.stats-grid`: Bordered, rounded, vertical flex container for stat rows with hidden overflow.
- **.stat-item** (style) — `.stat-item`: A single stat row: space-between flex layout with padding and bottom border; zebra-striped via nth-child; last child has no bottom border.
- **.stat-label** (style) — `.stat-label`: Roboto, base size, medium weight, secondary text color for stat labels.
- **.stat-value** (style) — `.stat-value`: Roboto, base size, semibold, primary color, capitalized text for stat values.
- **.stat-value--error / --warning / --success / --muted** (style) — `.stat-value--*`: Color modifiers overriding stat value color with error, warning, success, or muted tokens.
- **.text--success / --error / --warning / --info / --muted** (style) — `.text--*`: Semantic text-color utility classes for use outside stat-value context.

## Notes

- Depends on CSS custom properties (e.g. --color-border-dark, --color-bg-tertiary, --space-2, --font-size-base) defined elsewhere in the global stylesheet.
- Requires the 'Roboto' font family to be loaded externally.
- Zebra striping is index-based via nth-child, so reordering or filtering rows in the DOM affects background colors.
