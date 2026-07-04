---
source: src/styles/storefront.css
source_hash: a353e8fb6f635046108c98c88747a3177bdcb8e0418027ecd7de8528691290b7
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Storefront Styles

`src/styles/storefront.css`

> This stylesheet defines the visual design for the GPS3 Supplies Store storefront UI. It renders a themed, wooden general-store aesthetic — including a hanging beam, storefront awnings/department tabs, aisle headers, wood shelves, and item crate cards — using CSS custom properties (design tokens) for colors, spacing, typography, shadows, and radii. It was ported from the gps2-design SuppliesStore component and shared GPS2 design elements.

The file is a plain BEM-style CSS stylesheet with no logic; all styling is driven by `var(--token)` design tokens defined elsewhere.

### Structure
- **`.storefront`**: scrollable root container with a warm gold vertical gradient background and heading font.
- **`.storefront__beam*`**: the wooden beam the awnings hang from, with grain (repeating-linear-gradient) and rivet decorations (`--start`/`--end` modifiers).
- **`.storefront__window` / `.storefront__awnings`**: positioning for a window strip SVG overlaid by centered awning tabs.
- **`.awning-tab*`**: department tab buttons styled as striped awnings with a scalloped SVG edge and a label pill. Interactive states use `margin-block-start` and canopy `block-size` transitions — inactive 48px, hover 56px, active 64px — creating a springy pull-down effect. Uses `--awning-accent`/`--awning-soft` overridable vars.
- **`.storefront__aisle*`**: aisle header row containing a rotated wooden `aisle-plaque` (with grain/rivet decorations), large title, a flexible divider `rule`, and a coin badge.
- **`.storefront__tagline`**: italic subheading.
- **`.storefront__shelves` / `wood-shelf*`**: shelf rows using a 4-column grid; wood boards with grain hairlines, underside shadow, angled brackets (clip-path), and rotated price tags.
- **`.supply-crate*`**: item cards styled as wooden crates with slats, corner studs, an 'owned' badge, emoji face, name/blurb card, price pill, and sell/buy action buttons with hover/active/disabled states. Tilt controlled by `--crate-tilt`.
- **`.storefront__toast*`**: fixed centered purchase-feedback toast with Vue transition classes (`storefront-toast-enter/leave`).

### Responsive
A `max-width: 760px` media query shrinks awning tabs (flex-fill), reduces label/icon sizes, tightens padding, and collapses the shelf grid to 2 columns.

## Exports

- **.storefront** (style) — `.storefront`: Root scrollable container with gold gradient background.
- **.storefront__beam** (style) — `.storefront__beam / __beam-grain / __beam-rivet(--start|--end)`: Wooden hanging beam with grain and rivet decorations.
- **.awning-tab** (style) — `.awning-tab (+ __canopy, __scallop, __label, __icon; --active modifier)`: Department tab button styled as an awning with springy hover/active height transitions; supports --awning-accent/--awning-soft custom properties.
- **.aisle-plaque** (style) — `.aisle-plaque (+ __grain, __rivet--start/--end)`: Rotated wooden signage plaque used in the aisle header.
- **.storefront__aisle** (style) — `.storefront__aisle / __aisle-title / __aisle-rule / __coins / __tagline`: Aisle header row with title, divider rule, coin badge, and tagline.
- **.wood-shelf** (style) — `.wood-shelf (+ __board, __grain-line--1/2/3, __underside, __bracket--start/--end, __tag)`: Wooden shelf board with grain lines, brackets, and price tag.
- **.supply-crate** (style) — `.supply-crate (+ __slats, __stud--tl/tr/bl/br, __owned, __face, __emoji, __card, __name, __blurb, __footer, __price, __sell, __buy)`: Crate-styled item card with tilt (--crate-tilt), owned badge, and sell/buy buttons with interactive states.
- **.storefront__toast** (style) — `.storefront__toast (+ __toast-message, storefront-toast-enter/leave transition classes)`: Fixed centered purchase-feedback toast with Vue transition classes.

## Notes

- Relies entirely on external CSS custom properties (--color-*, --space-*, --font-*, --shadow-*, --radius-*) that must be defined in a global token stylesheet.
- Instance-level custom properties --awning-accent, --awning-soft, and --crate-tilt are expected to be set inline by the consuming components.
- Transition classes storefront-toast-enter-active/leave-active/enter-from/leave-to follow Vue's <Transition name="storefront-toast"> naming convention.
- Uses logical properties (inline-size, block-size, inset-inline, etc.) throughout for writing-mode/RTL awareness.
