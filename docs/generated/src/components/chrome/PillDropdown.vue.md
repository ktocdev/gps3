---
source: src/components/chrome/PillDropdown.vue
source_hash: 8cf56714e3765881aacba3cc24f3a845cce039f6663360acbdb6b7751864bf13
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PillDropdown.vue

`src/components/chrome/PillDropdown.vue`

> A layout wrapper component that renders dropdown-style content inside a ParchmentPanel, positioned relative to a triggering pill/button. It provides consistent styling, optional title/icon header, and scrollable content for chrome UI dropdowns.

This is a thin presentational Vue SFC that wraps `ParchmentPanel`. The root `div` gets a positional modifier class based on the `side` prop (`pill-dropdown--left`, `--right`, or `--center`, defaulting to `left`) and an `inlineSize` style from `width` (defaulting to `360px`). It carries a `data-sim-panel="1"` attribute.

### Rendering modes
- **Padded mode** (default, when `noPadding` is falsy): optionally renders a title bar (`.parchment-panel__title`) combining `icon` and `title` when `title` is provided, followed by a scrollable container (`.parchment-panel__scroll`) holding the default slot.
- **No-padding mode** (`noPadding` truthy): renders only the default slot directly inside the panel, with no title or scroll wrapper.

The `accent`, `showGrain`, and `noPadding` props are forwarded to `ParchmentPanel`. All content comes through the default `<slot />`.

## Exports

- **PillDropdown** (component) — `<PillDropdown :side :width :accent :show-grain :no-padding :flex-col :title :icon>`: Dropdown container built on ParchmentPanel. Props: `side?: 'left'|'right'|'center'` (positioning, default 'left'), `width?: string` (default '360px'), `accent?: string`, `showGrain?: boolean`, `noPadding?: boolean` (skips title/scroll wrappers and forwards to panel), `flexCol?: boolean` (declared but unused in template), `title?: string`, `icon?: string`. Has a single default slot for content. No emits.

## Internal dependencies

- `./ParchmentPanel.vue`

## Notes

- The `flexCol` prop is declared but never referenced in the template or styles.
- No `<style>` block is present in this file; the referenced classes (`pill-dropdown`, `pill-dropdown--*`, `parchment-panel__title`, `parchment-panel__scroll`) must be defined in global or external styles.
