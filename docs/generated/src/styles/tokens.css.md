---
source: src/styles/tokens.css
source_hash: aa6bf61f315d49bef396f66349908bc11419e74c1d550893e50c3938aba1e79e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Design Tokens

`src/styles/tokens.css`

> This CSS file defines the GPS2 design system's single source of truth for design tokens as CSS custom properties on the `:root` selector. It centralizes color palettes, semantic color aliases, game-specific colors, typography, spacing, radii, shadows, z-index layers, and transitions so the rest of the application can reference consistent design values.

All tokens are declared as CSS custom properties under `:root`, making them globally available. `color-scheme: light` pins the app to light mode.

### Structure
- **Color palettes**: Numbered scales (50–900) for pink, green, violet, yellow, cyan, neutral, gold (amber→orange), red, and blue.
- **Semantic colors**: Action (`--color-primary*`, `--color-secondary*`), status (success, warning, error/danger/critical, info), background/text, and border tokens — mostly aliased to raw palette steps.
- **Wood surfaces**: Structural UI browns (`--color-wood-*`).
- **Needs**: Game-specific need colors (hunger, thirst, energy, shelter, play, social, stimulation, comfort, hygiene, nails, chew), with comments noting divergence from prod `variables.css`.
- **Item accents**: Habitat supply identification colors (water, chew, food container, igloo).
- **Game colors**: Named accents for panel headers, awnings, action boards, plus soft label tints and gold-pill chrome aliases intended to be retinted by `themes.css` (low-stim mode).
- **Typography**: Font families (Gaegu, Nunito, Roboto, mono), font sizes (4xs–5xl), weights, and line heights.
- **Spacing**: Raw `--space-*` steps and semantic `--spacing-*` aliases.
- **Border radius**: `--radius-*` scale plus logical `--border-radius-*` properties.
- **Shadows**: Elevation (`--shadow-sm`–`xl`) and many component-specific shadows (rivet, ball, badge, disc, cta, pill, frame, crate, shelf, etc.).
- **Parchment panel**: PanelShell recipe tokens including a repeating-linear-gradient paper grain.
- **Z-index**: Layering scale (dropdown through tooltip).
- **Transitions**: fast/normal/slow easing durations.

## Exports

- **:root tokens** (style) — `:root { --color-*, --font-*, --space-*, --radius-*, --shadow-*, --z-index-*, --transition-* }`: A global set of CSS custom properties defining the GPS2 design system. Consumed across the app via var() references.

## Notes

- Comments reference a design-source view (gps2-design/src/views/TokensView.vue) and note where several need/item colors intentionally diverge from a prod variables.css.
- Several aliases (e.g. --color-*-soft, --color-pill-*) are deliberately dedicated aliases rather than raw palette steps so themes.css can retint them for low-stim mode; changing them to raw palette values would break that override.
- color-scheme: light pins UA controls to light mode — dark mode is not supported.
- Font families assume 'Gaegu', 'Nunito', and 'Roboto' are loaded elsewhere; this file only declares the family names.
