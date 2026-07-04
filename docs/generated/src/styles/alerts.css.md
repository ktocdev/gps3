---
source: src/styles/alerts.css
source_hash: 4026e2e00302e73da148e6eff666a4029fc570cda5f84c759ee27f96fcbf2a00
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Alert Component Styles

`src/styles/alerts.css`

> A CSS stylesheet defining visual styles for alert components, including a list container, individual alert items with severity variants (info, warning, error), and empty-state messages. It exists to provide consistent styling for alert/notification UI elements across the application.

Defines styles built on CSS custom properties (design tokens) for spacing, radii, font sizes, and colors.

### Layout
- `.alerts-list` — a vertical flex container with `var(--space-2)` gap between items.

### Alert Items
- `.alert-item` — base padding, small border radius, small font size.
- `.alert-item--info` — blue-tinted background/border with `--color-primary` text.
- `.alert-item--warning` — uses `--color-warning-bg` and `--color-warning` with amber-tinted border.
- `.alert-item--error` — uses `--color-error-bg` and `--color-error` with red-tinted border.

### Empty States
- `.no-errors, .no-alerts` — centered, padded text using `--color-success`, indicating an all-clear/empty state.

Colors mix hardcoded `rgba()` values (for borders/info background) with CSS variables for the rest.

## Exports

- **.alerts-list** (style) — `.alerts-list`: Vertical flex container for a list of alert items with spacing gap.
- **.alert-item** (style) — `.alert-item`: Base styling for an individual alert (padding, radius, font size).
- **.alert-item--info** (style) — `.alert-item--info`: Info-severity variant with blue tint and primary color text.
- **.alert-item--warning** (style) — `.alert-item--warning`: Warning-severity variant with amber background/text tokens.
- **.alert-item--error** (style) — `.alert-item--error`: Error-severity variant with red background/text tokens.
- **.no-errors, .no-alerts** (style) — `.no-errors, .no-alerts`: Empty-state message styling, centered with success color.

## Notes

- Relies on globally-defined CSS custom properties (--space-*, --radius-sm, --font-size-sm, --color-primary, --color-warning, --color-warning-bg, --color-error, --color-error-bg, --color-success) which must be defined elsewhere.
- Info variant background/border and some borders use hardcoded rgba() values rather than design tokens, so they won't adapt to token/theme changes.
