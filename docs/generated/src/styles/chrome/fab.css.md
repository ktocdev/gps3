---
source: src/styles/chrome/fab.css
source_hash: 6aab466032d9c81fe8223c5109b0287e8e7b0d2b6e546ac66b00ddcdb20508b9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FAB Cluster Styles

`src/styles/chrome/fab.css`

> Stylesheet defining the visual appearance of the floating action button (FAB) cluster rendered as a wooden rail with gold plaque-style buttons at the bottom-center of the screen, plus a parchment grid submenu popover. Part of the app's chrome UI theming.

## Layout

Defines `.fab-cluster`, an absolutely-positioned, bottom-center flex column with `pointer-events: none` (children re-enable). `.fab-cluster__rail` renders a decorative wooden horizontal bar via layered gradients and inset shadows. `.fab-cluster__row` is the interactive flex row of buttons with gap spacing and `pointer-events: auto`.

## Plaque buttons

`.fab-plaque` wraps each button. Decorative sub-elements include `__peg` (a mounting peg), `__awning` (striped canopy), four `__stud--tl/tr/bl/br` corner rivets, and `__grain` (wood grain overlay). `.fab-plaque__button` is the gold-gradient clickable surface using a `--tilt` custom property for rotation, with spring-like hover (lift + rotate) and active (press) transforms. `__inner`, `__disc` (icon circle), and `__label` handle content layout.

## Submenu

`.fab-submenu` is an absolutely-positioned popover above the cluster, animated via `chrome-fab-pop` keyframes (defined elsewhere). `.fab-submenu__grid` is a 3-column grid of `.fab-submenu__tile` items, each with hover transforms. `--disabled` modifier greys out and disables inert actions; `__tile-tag` shows a corner badge; `__tile-icon` and `__tile-label` render tile content.

## Theming

Relies heavily on CSS custom properties for colors (`--color-wood-*`, `--color-gold-*`, `--fab-stripe`, `--fab-deep`, `--fab-soft`), radii, shadows, and typography, using logical properties (inset-inline/block) throughout.

## Exports

- **.fab-cluster** (style) — `.fab-cluster`: Root bottom-center absolutely-positioned flex container for the FAB rail; pointer-events disabled at root.
- **.fab-cluster__rail** (style) — `.fab-cluster__rail`: Decorative wooden horizontal rail behind the buttons.
- **.fab-cluster__row** (style) — `.fab-cluster__row`: Interactive flex row holding plaque buttons; re-enables pointer events.
- **.fab-plaque** (style) — `.fab-plaque + __peg/__button/__awning/__stud/__grain/__inner/__disc/__label`: Plaque button and its decorative/content sub-elements. Button uses --tilt for rotation and spring hover/active transforms.
- **.fab-submenu** (style) — `.fab-submenu + __grid/__tile/__tile--disabled/__tile-tag/__tile-icon/__tile-label`: Parchment popover with a 3-column tile grid, disabled-state modifier, and per-tile badge/icon/label styles.

## Internal dependencies

- `CSS custom properties: --color-wood-mid/dark/shadow/border, --color-gold-50/100/200/800, --fab-stripe/deep/soft, --radius-base/full, --shadow-rivet, --font-family-heading, --font-weight-bold, --font-size-xs`
- `chrome-fab-pop keyframes (defined in another stylesheet)`

## Notes

- The `chrome-fab-pop` animation used by `.fab-submenu` is not defined in this file and must exist elsewhere.
- `.fab-plaque__button` reads a `--tilt` custom property (default 0deg) expected to be set inline per-button for varied rotation.
- Root `.fab-cluster` sets `pointer-events: none`; only `.fab-cluster__row` re-enables interaction.
