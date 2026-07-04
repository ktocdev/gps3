---
source: src/styles/base.css
source_hash: d53b2770997f56ebd7c8631658bb5804e019c1da3902ff08095be070a64187a1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Base Styles

`src/styles/base.css`

> Global CSS reset, base element styling, and typography defaults for the application. It imports Google Fonts and the design token/theme files, then applies consistent styling to core HTML elements using CSS custom properties (design tokens).

### Imports
Brings in Google Fonts (Caveat, Gaegu, Nunito, Roboto) via a remote stylesheet, then imports `./tokens.css` (design token source of truth, synced by whole-file copy from gps2-design) and `./themes.css`.

### Reset & Base
Applies `box-sizing: border-box` to all elements and pseudo-elements, zeroes default margins, and sets `html` to full height with a 16px root font-size and text-size-adjust disabled. `body` uses token-driven line-height, font-family, font-size, weight, colors, and enables font smoothing.

### Typography
Headings `h1`–`h6` use heading font-family/weight, tight line-height, and progressively smaller font sizes with token-based bottom margins. Paragraphs, lists (`ul`/`ol`/`li`), and horizontal rules get consistent token-based spacing.

### Interactive & Code
Links are colored with the primary token, animate color on hover (with underline), and get an accessible focus outline. `code`/`pre` use the mono font and tertiary background; `pre code` resets inner styling. Form elements inherit font/color, buttons show pointer cursors and dimmed disabled state, and `fieldset`/`legend` are reset.

### Focus & Media
Global `:focus` outline is applied but removed when `:focus-visible` is not matched. Images are made fluid and block-level. Two `min-width` media queries (640px, 1024px) scale up `h1`–`h3` font sizes via `calc()` multipliers.

## Internal dependencies

- `./tokens.css`
- `./themes.css`

## Notes

- Depends entirely on CSS custom properties (design tokens) defined in tokens.css and themes.css; those imports must load for correct rendering.
- tokens.css is documented as a whole-file copy synced from gps2-design/src/styles/tokens.css — do not edit locally without syncing.
- Relies on a remote Google Fonts import which requires network access at load time.
- Uses logical properties (margin-block-end, padding-inline-start, border-start-start-radius, etc.) throughout for writing-mode awareness.
