---
source: src/styles/utilities.css
source_hash: 7d67d95e2e325faf3630b0274b89b8279a60c7bf75d9f47b3d1bc09c9abe5805
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# CSS Utility Classes

`src/styles/utilities.css`

> A global stylesheet providing reusable utility classes for accessibility, layout, flexbox, spacing, gaps, text styling, button groups, grids, sidebars, and custom scrollbars. It exists to offer a Tailwind-like set of atomic and component-level helper classes built on top of the project's CSS custom properties (design tokens).

This file defines a broad collection of single-purpose and component utility classes, relying heavily on CSS custom properties like `--space-*`, `--color-*`, `--font-*`, and `--radius-*` (defined elsewhere in the project).

### Categories
- **Accessibility/interaction**: `.sr-only` (visually-hidden but screen-reader accessible) and `.no-select` (disables text selection with vendor prefixes).
- **Layout**: `.container` centers content with a max width of 1200px and responsive padding at 640px and 1024px breakpoints, using logical properties (`inline-size`, `padding-inline`).
- **Text**: `.text-label` and modifiers (`--muted`, `--accent`), `.text-center`, `.text-muted`.
- **Flexbox**: display, direction (with both `flex-column` and `flex-col` aliases), wrap, justify-content, align-items, align-self, flex grow/shrink, and `.flex-1`/`.flex-auto`/etc.
- **Gaps**: `.gap-*`, `.gap-x-*`, `.gap-y-*` scales mapped to spacing tokens.
- **Spacing**: margin-block-start (`.mt-*`), margin-block-end (`.mb-*`), and padding (`.p-*`) using logical properties.
- **Button groups**: `.button-group` and modifiers (compact, spacious, vertical, alignment, segmented), `.button-group-container`, `.controls-grid`, `.button-with-badge`.
- **Grids**: `.guinea-pigs-grid` (responsive 1→2 columns at 768px), `.controls-grid` (auto-fit).
- **Sidebar**: `.habitat-sidebar` and elements, with responsive behavior below 768px.
- **Responsive gaps**: `.gap-responsive` variants that change at 640/641px.
- **Scrollbar**: `.custom-scrollbar` styling for both WebKit and Firefox.

## Exports

- **.sr-only** (style) — `.sr-only`: Visually hides an element while keeping it accessible to screen readers.
- **.container** (style) — `.container`: Centered content wrapper, max 1200px, with responsive inline padding at 640px and 1024px.
- **.flex utilities** (style) — `.flex, .flex-column/.flex-col, .justify-*, .items-*, .self-*, .flex-1, .grow, .shrink, etc.`: A set of flexbox atomic classes for display, direction, wrap, alignment, and flex sizing.
- **.gap-* / .gap-x-* / .gap-y-*** (style) — `.gap-0 through .gap-16`: Gap, row-gap, and column-gap utilities mapped to --space-* tokens.
- **spacing utilities** (style) — `.mt-*, .mb-*, .p-*`: Margin-block-start, margin-block-end, and padding utilities using logical properties and spacing tokens.
- **.button-group** (style) — `.button-group and modifiers`: Flex container for buttons with compact/spacious/vertical/alignment/segmented variants.
- **.controls-grid** (style) — `.controls-grid, .controls-grid--compact`: Auto-fit grid layout for control elements.
- **.guinea-pigs-grid** (style) — `.guinea-pigs-grid`: Responsive grid, single column expanding to two columns at 768px.
- **.habitat-sidebar** (style) — `.habitat-sidebar and elements`: 360px scrollable sidebar that becomes full-width and top-bordered below 768px.
- **.custom-scrollbar** (style) — `.custom-scrollbar`: Thin custom scrollbar styling for WebKit and Firefox.

## Internal dependencies

- `CSS custom properties (--space-*, --color-*, --font-*, --radius-*) defined in other stylesheets`

## Notes

- Relies entirely on CSS custom properties defined elsewhere; classes will render incorrectly if those tokens are not loaded.
- `.w-full` sets `inline-size: auto` rather than `100%`, which likely does not match its name's expected full-width behavior.
- Provides duplicate direction aliases `.flex-column` and `.flex-col`.
- Uses logical properties (inline-size, margin-block-start, padding-inline) throughout, affecting behavior under different writing modes.
