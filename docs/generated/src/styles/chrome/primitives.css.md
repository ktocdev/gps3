---
source: src/styles/chrome/primitives.css
source_hash: 1cef4a88ce4dc5916e3a27f53025040e3dc73e195e8b987df5cde696184249f1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Chrome Primitives Stylesheet

`src/styles/chrome/primitives.css`

> Foundational CSS for the GPS3 game chrome, defining the parchment-themed visual primitives (panels, sign pills, dropdowns, banners) and shared keyframes/variables that all other chrome stylesheets build upon.

### CSS custom properties
Defines three `:root` fill/border variables (`--chrome-entry-bg`, `--chrome-entry-border`, `--chrome-divider`) for parchment surfaces not covered by `tokens.css`.

### Keyframes
Two pop-in animations: `chrome-panel-pop` (fade + slide down + scale for panels) and `chrome-fab-pop` (fade + slide up + scale for FABs).

### Parchment panel (`.parchment-panel`)
The primary panel shell with gradient fill, thick border, and decorative sub-elements: `__awning` (striped top bar), corner `__stud` rivets (`--tl/tr/bl/br`), `__sheen`, `__grain`, `__body`, and `__title`. Modifiers `--animate` (applies keyframe) and `--flex-col` (flex column layout with scrollable body).

### Sign pill (`.sign-pill`)
A cream signboard-style clickable trigger tilted via `--tilt`. Includes `--active` and `:hover` transform states, and sub-elements: corner `__rivet`s, wax-seal `__disc`, `__label`, `__badge`, `__caret`, status `__chip`, `__dot`, and `__portrait`. Colors are themable via `--accent`, `--accent-deep`, `--badge-color`, `--chip-color`.

### Pill dropdown (`.pill-dropdown`)
Absolutely-positioned dropdown wrapper below its trigger, constrained to viewport height (`calc(100dvh - 11rem)`). Alignment modifiers `--left`, `--right`, `--center`. Nested rules make an inner `.parchment-panel` and its body flex-column with a pinned title and a scrollable `.parchment-panel__scroll` region.

### Scrollbar theming
Webkit scrollbar styling (wood track + gold thumb) shared across `.parchment-panel__scroll`, `.pig-drawer__content`, `.help-overlay__rail`, and `.help-overlay__content`.

### Parchment banner (`.parchment-banner`)
Centered absolute notice banner with `__row`, `__icon`, and a circular `__cancel` button.

## Exports

- **.parchment-panel** (style) — `.parchment-panel (+ __awning, __stud, __sheen, __grain, __body, __title; --animate, --flex-col)`: Parchment panel shell (PanelShell) with decorative studs, awning, sheen, grain, body, and title sub-elements plus animate/flex-col modifiers.
- **.sign-pill** (style) — `.sign-pill (+ __rivet, __disc, __label, __badge, __caret, __chip, __dot, __portrait; --active)`: Cream signboard trigger pill with rivets, disc, label, badge, chip, and portrait variants; tilt/active/hover states.
- **.pill-dropdown** (style) — `.pill-dropdown (--left, --right, --center)`: Viewport-constrained dropdown wrapper positioned below its trigger, with alignment modifiers and flex layout for nested parchment panels.
- **.parchment-panel__scroll** (style) — `.parchment-panel__scroll`: Scrollable content region with themed webkit scrollbar (shared with pig-drawer and help-overlay).
- **.parchment-banner** (style) — `.parchment-banner (+ __row, __icon, __cancel)`: Centered absolute notice banner for targeting/placement messages with a circular cancel button.
- **chrome-panel-pop** (style) — `@keyframes chrome-panel-pop`: Fade + slide-down + scale entrance animation for panels.
- **chrome-fab-pop** (style) — `@keyframes chrome-fab-pop`: Fade + slide-up + scale entrance animation for FABs.

## Internal dependencies

- `tokens.css (CSS custom properties: --panel-bg-top, --panel-border, --color-* , --shadow-*, --space-*, --font-*, --radius-*)`

## Notes

- Relies heavily on CSS variables defined elsewhere (tokens.css); missing tokens fall back only where `var(x, fallback)` is provided.
- The `.pill-dropdown` max-height offset `calc(100dvh - 11rem)` is hard-coded to account for header + topbar height above the dropdown.
- Scrollbar theming uses `-webkit-scrollbar` pseudo-elements only, so it applies to Chromium/WebKit browsers.
- Scrollbar rules are coupled by selector to `.pig-drawer__content`, `.help-overlay__rail`, and `.help-overlay__content` defined in other chrome files.
- Themable colors flow through `--accent`, `--accent-deep`, `--tilt`, `--badge-color`, `--chip-color` set by consuming components.
