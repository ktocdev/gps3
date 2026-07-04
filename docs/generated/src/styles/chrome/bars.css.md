---
source: src/styles/chrome/bars.css
source_hash: caa8c4a3c1e0c5c97f4dcd16a3927e24a6daed3f0d078e48106ed46211128cf1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Wood Plank Bars

`src/styles/chrome/bars.css`

> This stylesheet defines the visual styling for the game's wood-plank-themed chrome bars: the main game header (with brand, navigation tabs, coins, help, and pause controls) and the simulation top bar. It provides the decorative wood-grain and rivet effects along with the tactile pill-style buttons used throughout these bars.

### Shared wood elements
`.wood-bar` is a positioning container. `.wood-bar__grain` overlays a repeating linear-gradient to simulate wood grain, and `.wood-bar__rivet` renders small circular gold/dark radial-gradient dots. Both decorative layers are `pointer-events: none`.

### Game header
`.game-header` is a flex bar with wood-gradient background, top/bottom wood borders, layered box-shadows, and `z-index: 20`. Sub-elements include `__brand`/`__brand-icon`/`__title` (heading font, gold color), `__nav` and `__tab` (pill-shaped tactile navigation buttons with a `::before` sheen overlay, hover/active transforms, and an `--active` modifier using pink gradient). Utility area (`__util`) holds `__coins` (amber pill with icon), `__help` (circular button), and `__pause` (green pill with a `--paused` gold modifier and disabled state).

### Sim top bar
`.sim-topbar` is a flex wood-gradient bar with `z-index: 40`, rivet corner positioning helpers (`--tl/--tr/--bl/--br`), a `__slot` element, and a centered `__center` flex region.

### Data flow
Styling is driven entirely by CSS custom properties (colors, spacing, radii, shadows, fonts) defined elsewhere in the design system. State-driven appearance is handled via modifier classes (`--active`, `--paused`) and pseudo-classes (`:hover`, `:active`, `:focus`, `:disabled`), which the consuming components toggle.

## Exports

- **.wood-bar** (style) — `.wood-bar, .wood-bar__grain, .wood-bar__rivet`: Positioning container with decorative wood-grain gradient overlay and circular rivet dots (both non-interactive).
- **.game-header** (style) — `.game-header + __brand/__brand-icon/__title/__nav/__tab/__util/__coins/__coins-icon/__help/__pause`: Wood-plank header bar with brand block, pill navigation tabs (with sheen ::before, --active modifier), coin display, circular help button, and pause button (--paused modifier, disabled state).
- **.sim-topbar** (style) — `.sim-topbar + __rivet--tl/tr/bl/br/__slot/__center`: Wood-plank simulation top bar (z-index 40) with corner rivet position helpers, a slot element, and a centered flex region.

## Internal dependencies

- `CSS custom properties: --color-wood-*, --color-gold-*, --color-pill-*, --color-pink*, --color-green-*, --radius-full, --space-2/3, --font-family-heading, --font-weight-bold, --shadow-cta-header, --shadow-amber-pill, --shadow-confirm`

## Notes

- Depends on design-token CSS variables defined in other stylesheets; those must be loaded for correct rendering.
- `.game-header__tab` includes explicit resets (text-decoration, border-radius, outline-offset) to override anchor styles bleeding through RouterLink.
- z-index values (header 20, sim-topbar 40) establish stacking order relative to other chrome.
