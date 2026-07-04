---
source: src/styles/themes.css
source_hash: 3fa7bbdb36361cf6129058c9f8102717ed35318e3eff4167665d2bef39510743
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Theme Overrides

`src/styles/themes.css`

> Defines CSS custom property overrides for two independent theming axes applied via attributes on the `<html>` element: `data-theme="dark"` for the debug dashboard's dark mode, and `data-chrome-theme="low-stim"` for a softened low-stimulation game chrome theme. It re-themes the app purely by overriding semantic tokens, requiring no component changes.

This file contains two attribute-selector rule blocks that override CSS variables defined elsewhere (primitive ramps, base semantic tokens).

### `[data-theme="dark"]`
Sets `color-scheme: dark` and remaps semantic tokens to darker/lifted values by pointing them at existing neutral/color primitive ramps (e.g. `--color-bg-primary` → `--color-neutral-900`). Covers surfaces, text, borders, action/status background tints (as rgba), lifted status foregrounds for contrast, chat bubble alert surfaces (`--color-danger`, `--color-critical`), and heavier elevation shadows (`--shadow-sm` through `--shadow-xl`). Applied by `useDebugTheme` while `DebugView` is mounted; game routes never render dark.

### `[data-chrome-theme="low-stim"]`
Softens the game chrome by overriding wood palette, parchment panel tokens, muted game accent colors (pink, orange, gold, lime, ivy, green, sky, cyan, violet families), storefront awning label soft tints, gold-pill chrome tokens (header tabs, coin badges), gentler depth shadows (`--panel-shadow`, `--shadow-pill`, etc.), and slower transition timings (`--transition-fast/normal/slow`). Chrome components consume these tokens exclusively, so overriding them re-themes all chrome. Some derived tokens reference the muted accents (e.g. `--color-pill-tab-bot: var(--color-gold)`) to keep the palette cohesive.

Notably, primitive ramps, item accents, the 11 need colors (data-vis identity), and the 3D scene are intentionally left untouched in both themes.

## Exports

- **[data-theme="dark"]** (style) — `[data-theme="dark"] { ... }`: Dark-mode semantic token overrides for the debug dashboard: surfaces, text, borders, status tints/foregrounds, alert surfaces, and elevation shadows.
- **[data-chrome-theme="low-stim"]** (style) — `[data-chrome-theme="low-stim"] { ... }`: Low-stimulation game chrome overrides: desaturated wood, calmer parchment, muted accent colors, softened awning/pill tokens, gentler shadows, and slower transitions.

## Notes

- The two axes are independent attributes on `<html>` and can be combined; neither depends on the other.
- Relies on primitive/base tokens (neutral, green, gold, red, blue ramps and base semantic/shadow/transition tokens) being defined elsewhere; this file only overrides.
- `data-theme="dark"` is applied programmatically by `useDebugTheme` only while `DebugView` is mounted — game routes never enter dark mode.
- Several low-stim tokens reference other overridden tokens (e.g. `--color-pill-tab-bot`, `--color-storefront-coin-bot`) so ordering/cascade of the muted accents matters for cohesion.
- Intentionally does NOT theme need colors (data-vis identity), item accents, or the 3D scene.
