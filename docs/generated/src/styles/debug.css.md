---
source: src/styles/debug.css
source_hash: 1ed736725752a7a5a16a0c9ebd19452a77ad90203f4308e648fee1a4e9f0a731
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Debug Dashboard Skin

`src/styles/debug.css`

> A CSS stylesheet that provides the visual skin for the GPS3 debug dashboard. Every rule is scoped under `.debug-view` so the debug styling never leaks into the shared game chrome (basic/* components). It restyles both debug-specific BEM classes (`dbg-*`) and existing shared classes (`.panel`, `.button`, `.stats-grid`, form controls) when rendered inside the debug view.

### Theming
The `.debug-view` root defines a set of `--dbg-*` custom properties for surface colors (page, panel, strip, nav, control, active-tab backgrounds/text). A `[data-theme="dark"] .debug-view` override flips those `--dbg-*` values for dark mode while relying on semantic tokens (from themes.css) for text/border colors. This keeps the "panel lighter than page" hierarchy consistent in both themes.

### Sections
- **Header** (`.dbg-header`, `__awning`, `__row`, `__title`, `__subtitle`, `__util`): a parchment gradient header that intentionally stays parchment even in dark mode as a brand anchor, with a striped awning strip.
- **Status pill** (`.dbg-pill`, `__dot`, `--paused`): Live/Paused indicator with a colored dot.
- **Category nav** (`.dbg-nav`, `__group`, `__tab`, `__tab--active`, `__divider`): tab bar with active state using pink accent.
- **Layout** (`.dbg-main`, `--with-side`, `.dbg-panels`, `.dbg-side`): a CSS grid that collapses the 360px side column below 1100px; `.dbg-side` is sticky.
- **Panels**: restyles the shared `.panel` BEM structure, neutralizes legacy decorative variants (`--accent`, `--border-primary/secondary`), and supports an accent edge via `--accent` custom property.
- **Sections, Stats, Badges**: restyles `.dbg-section`, `.stats-grid`/`.stat-item`, and status badges (`--ok/warn/err/info`) using semantic status tokens.
- **Buttons**: restyles shared `.button` and variants (primary/secondary/warning/danger) plus `.btn-row`.
- **Form controls**: labels, inputs, readonly state, and a segmented `.toggle-group`.
- **Slider** (`.dbg-slider` and children): custom range input using `--pct` for fill and `--accent` for thumb/track color, with webkit/moz thumb styling.
- **Scrollbars**: thin webkit scrollbar styling scoped to the debug view.

## Internal dependencies

- `src/styles/themes.css (semantic color tokens and [data-theme="dark"] flipping)`
- `design token custom properties (--color-*, --space-*, --font-*, --radius-*, --transition-* — defined elsewhere in the styles system)`

## Notes

- All selectors are scoped under `.debug-view` by design to prevent leaking into shared game components.
- The header (`.dbg-header`) deliberately keeps its parchment gradient in dark mode as a brand anchor and is not overridden by the dark theme block.
- Relies on runtime-set custom properties: `--accent` (accent edge / slider color, set inline or via DebugPanel/DebugSlider props) and `--pct` (slider fill percentage, set by DebugSlider JS).
- Uses `:has(> .panel__header)` selector — depends on browser `:has()` support.
- Restyles pre-existing shared classes (`.panel`, `.button`, `.stats-grid`, `.stat-item`, `.toggle-group`, form fields), so it is tightly coupled to those components' markup/BEM structure.
