---
source: src/styles/dialogs.css
source_hash: e1a9b3dfac85c074a40e57caa127d090952fb67900bbf8b1ec0807de7dfb0a29
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Game Dialog Styles

`src/styles/dialogs.css`

> A global stylesheet defining shared layout classes for game action dialogs (`.game-dialog` and its BEM sub-elements) and parchment-themed overrides for generic Button and stats-grid components rendered inside `BaseDialog`. It exists to give FAB action dialogs consistent sizing while re-skinning shared components to match the game's parchment/wood aesthetic.

## Layout classes
The `.game-dialog` block establishes a flex column layout with gap and padding (driven by `--space-*` tokens) and a `min-inline-size` of 320px. Sub-elements follow BEM: `.game-dialog__header` (centered), `.game-dialog__title` (heading font, gold color, amber bottom border), `.game-dialog__content` (flex column), and `.game-dialog__footer` (right-aligned flex row).

## Dialog-scoped overrides
The remaining rules are scoped under `.base-dialog` to re-skin shared components only when rendered inside a dialog, leaving debug views unaffected. `.button` gets a cream gold gradient pill style with wood-dark border and confirm shadow; hover/active states add brightness and a slight translate. Variant overrides: `.button--primary` becomes a pink signboard CTA with white text, `.button--danger` becomes red ink on red-tinted parchment, and disabled buttons drop to 0.55 opacity.

The `.stats-grid` and its `.stat-item`, `.stat-label`, `.stat-value` children are restyled with parchment entry borders/backgrounds and wood-toned label/value colors, using chrome and wood CSS custom properties.

## Exports

- **.game-dialog** (style) — `.game-dialog, .game-dialog__header, .game-dialog__title, .game-dialog__content, .game-dialog__footer`: Layout classes for game action dialogs; apply .game-dialog to the wrapper div inside BaseDialog for consistent sizing.
- **.base-dialog overrides** (style) — `.base-dialog .button, .base-dialog .button--primary, .base-dialog .button--danger, .base-dialog .stats-grid, .base-dialog .stat-item/-label/-value`: Dialog-scoped parchment re-skins for shared Button variants and stats-grid components.

## Internal dependencies

- `CSS custom properties: --space-*, --font-family-heading, --font-size-2xl, --font-weight-bold, --color-gold-*, --color-wood-*, --color-pink-*, --color-red-*, --radius-lg, --shadow-confirm, --chrome-entry-border, --chrome-entry-bg`

## Notes

- Overrides are intentionally scoped under .base-dialog so shared Button and stats-grid components keep their default styling outside dialogs (e.g. debug views).
- Relies on CSS variables defined elsewhere; missing tokens will break the intended appearance.
- Uses logical properties (min-inline-size, border-block-end, padding-block-end) rather than physical ones.
