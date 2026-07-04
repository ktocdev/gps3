---
source: src/styles/panel.css
source_hash: 5cd64bcb9562d6d7d0747f960dddcf94cac3679e71199f6d1bf9159eded03d64
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Panel Component Styles

`src/styles/panel.css`

> A shared, framework-agnostic CSS stylesheet defining reusable panel UI components using BEM methodology. It provides a base panel block with variants, structural elements, sizes, states, nested subpanels, and layout containers (grids and rows), all built mobile-first with responsive breakpoints and accessibility media queries.

## Structure
The file follows BEM naming: `.panel` is the block, `.panel__*` are elements (header, content, footer, subpanel), and `.panel--*` are modifiers.

### Base & Variants
`.panel` provides background, border, rounded corners, padding, shadow, and a hover state that deepens shadow/border. Variants include `--border-primary` (pink theme), `--border-secondary` (green theme), `--muted` (subtle/reduced opacity), and `--accent` (dashed border with a gradient accent bar via `::before`).

### Structure Elements
`.panel__header` (with heading color rules that adapt to primary/secondary/state variants), `.panel__content` (flex-grow, strips last-child margin), and `.panel__footer` (mobile-first column flex, switching to row on wider screens).

### Sizes & States
Sizes: `--compact`, `--large`, `--bordered`, `--overflow-visible`. States: `--loading` (dimmed, non-interactive, blur overlay via `::after`), `--error`, `--success`, `--warning` — each coloring border, background, and header headings.

### Subpanels
`.panel__subpanel` for nested content with `--warning`, `--error`, `--info`, `--success` themed variants (colored left border), plus `.panel__subpanel-content`, `-text`, and `-text--warning`.

### Layout Containers
`.panel-grid` (auto-fit responsive grid), `.panel-row` (flex column → row), and grid variants `.panel-row--grid`, `--grid-2`, `--grid-3` with column counts adjusting at 769px and 1201px breakpoints.

### Responsive & Accessibility
A `min-width: 769px` breakpoint enlarges padding/radii and switches footers/grids to horizontal layouts. Media queries handle `prefers-contrast: high` (thicker borders) and `prefers-reduced-motion: reduce` (disables transitions/transforms).

### Data Flow
All colors, spacing, radii, shadows, fonts, and transitions are consumed from CSS custom properties (design tokens) defined elsewhere.

## Exports

- **.panel** (style) — `.panel, .panel--border-primary, .panel--border-secondary, .panel--muted, .panel--accent`: Base panel block and its visual variants (border-primary pink, border-secondary green, muted, accent with gradient bar).
- **.panel__header / __content / __footer** (style) — `.panel__header, .panel__content, .panel__footer`: Structural BEM elements for panel layout; header includes heading color rules and footer is mobile-first flex.
- **panel size modifiers** (style) — `.panel--compact, .panel--large, .panel--bordered, .panel--overflow-visible`: Modifiers controlling padding, border weight, and overflow behavior.
- **panel state modifiers** (style) — `.panel--loading, .panel--error, .panel--success, .panel--warning`: State modifiers for loading overlay and error/success/warning coloring.
- **.panel__subpanel** (style) — `.panel__subpanel, .panel__subpanel--warning/error/info/success, .panel__subpanel-content, .panel__subpanel-text`: Nested subpanel element with themed variants and text helpers.
- **.panel-grid / .panel-row** (style) — `.panel-grid, .panel-grid--padded, .panel-row, .panel-row--grid, .panel-row--grid-2, .panel-row--grid-3`: Layout containers for arranging multiple panels in responsive grids or flex rows.

## Internal dependencies

- `CSS custom properties (design tokens): --color-*, --space-*, --radius-*, --shadow-*, --transition-*, --font-size-*, --font-weight-*, --line-height-* (defined in a separate variables/theme stylesheet)`

## Notes

- Relies entirely on externally-defined CSS custom properties; without them all styling breaks.
- `.panel--warning` header uses `--color-gold-700` rather than `--color-warning`, unlike error/success which use their matching token.
- `--grid-2` and `--grid-3` both become 2-column at 769px; only `--grid-3` expands to 3 columns at 1201px.
- `.panel--loading::after` uses a hardcoded rgba white overlay rather than a token.
- Uses logical properties (inset-block, border-block-end, inline-size, etc.) throughout for RTL/writing-mode support.
