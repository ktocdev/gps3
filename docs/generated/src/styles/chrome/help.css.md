---
source: src/styles/chrome/help.css
source_hash: 8a3e719ab1a23c01993756638a38adbcc67c4d013611e0db3995b966dabad217
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Help Center Styles (help.css)

`src/styles/chrome/help.css`

> Defines the visual styling for the Live Mode Help center overlay rendered by HelpOverlay.vue. It creates a full-screen parchment-themed notice-board layout with a topic rail and a content panel, using design tokens from tokens.css. The file is a port from the gps2-design prototype.

## Structure
Styles are organized around a BEM-style `.help-overlay` block. The root `.help-overlay` is a fixed full-screen flex container (z-index 1090) with a translucent brown backdrop and blur. Inside, `.help-overlay__board` is the centered parchment panel (max 960×640) with a gradient background, thick border, and decorative corner studs (`__stud--tl/tr/bl/br`) plus a striped `__awning` header strip.

## Layout
The `__titlebar` holds the `__title` (with icon) and `__actions` buttons (`__btn`, with an accent gold variant `__btn--accent` for the replay-tutorial CTA). The `__body` is a two-column CSS grid: a fixed 232px `__rail` of topic tabs (`__tab`, with `__tab--active` state) and a flexible `__content` panel with a header (`__content-head`, `__content-icon`, `__content-title`) and `__blocks` container.

## Content blocks
Multiple block types are styled for rendering help content: `__lede` (callout intro), `__h`/`__p` (headings/paragraphs), `__list`/`__list-item` (three-column emoji/label/text grid), `__steps`/`__step`/`__step-num` (numbered steps), `__grid`/`__grid-item` (auto-fill card grid with color swatch accent), `__keys`/`__key-row`/`__key-combo`/`__kbd` (keyboard shortcut display), and `__tip` (gold highlighted tip box).

## Animations & responsive
Three keyframes (`help-overlay-fade`, `help-overlay-scale`, `help-overlay-panel`) drive entry animations for the backdrop, board, and content panel. A media query at max-width 700px collapses the vertical rail into a horizontal scrollable strip above the content.

## Theming
Uses a `--help-accent` custom property (fallback `--color-gold`) applied to the awning stripes, active tab border, content icon, step numbers, and lede border — allowing per-topic accent theming. `--help-swatch` similarly accents grid items.

## Exports

- **help.css** (style) — `.help-overlay and BEM descendants`: Stylesheet for HelpOverlay.vue. Provides the .help-overlay block plus elements: __board, __awning, __stud(--tl/tr/bl/br), __titlebar, __title, __title-icon, __actions, __btn(--accent), __body, __rail, __tab(--active), __tab-emoji, __content, __content-head/-icon/-title, __blocks, __lede, __h, __p, __list/-item/-emoji/-label/-text, __steps/__step/-num, __grid/-item/-emoji, __keys/__key-row/-combo/-join, __kbd, __key-text, __tip/-icon/-label.

## Internal dependencies

- `src/styles/tokens.css`

## Notes

- Relies on CSS custom properties defined elsewhere (tokens.css): spacing, fonts, colors, radii, shadows, plus panel-specific tokens (--panel-bg-top/-bot/-border/-shadow), chrome tokens (--chrome-entry-bg/-border), and wood/gold color scales.
- Uses runtime-set custom properties --help-accent and --help-swatch (with fallbacks) for per-topic theming, presumably applied inline by HelpOverlay.vue.
- z-index is fixed at 1090 — intentionally above chrome dropdowns but below the tutorial spotlight.
- Uses logical properties (inline-size, block-size, inset-inline/block) and color-mix(), requiring modern browser support.
