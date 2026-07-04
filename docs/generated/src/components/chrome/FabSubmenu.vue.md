---
source: src/components/chrome/FabSubmenu.vue
source_hash: 20332da475bcdafe9393f7d395726493e69ec6312771a1dc630df7ed10df227b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FabSubmenu

`src/components/chrome/FabSubmenu.vue`

> A Vue SFC that renders a themed submenu panel for a floating action button (FAB). It displays a grid of action tiles (or an empty message) inside a ParchmentPanel and emits events when an action is selected.

### Rendering
The component only renders when the `show` prop is truthy. It wraps content in a `ParchmentPanel` (with `accent` set to the theme stripe color, `animate` disabled, and grain shown).

When `actions` is empty, it shows an empty-state message using `emptyMessage` or the fallback `'Nothing available.'`. Otherwise it renders a `.fab-submenu__grid` with one `<button>` tile per action.

### Tile behavior
Each tile shows the action's `icon` and `label`. Disabled actions get a `--disabled` class, are `disabled`, display a `title` of `'Coming soon'`, and render a `Soon` tag. Each tile is rotated slightly via inline `transform` using `tiltFor(i)`.

### Theming
`colors` resolves the active theme from `FAB_THEMES[props.theme]`. `themeVars` maps the theme's `stripe`, `deep`, and `soft` colors to CSS custom properties (`--fab-stripe`, `--fab-deep`, `--fab-soft`) applied to the root element.

### Interaction
`select(actionId)` emits both `select` (with the action id) and `close`. `tiltFor(i)` cycles through the fixed `TILTS` array `[-1.2, 0.9, -0.5, 1.4]` using modulo.

## Exports

- **FabSubmenu** (component) — `<FabSubmenu :show :theme :actions :empty-message @select @close />`: Props: `show: boolean`, `theme: FabTheme`, `actions: FabAction[]`, `emptyMessage?: string`. Emits: `select` (actionId: string) and `close` (no payload). Selecting an action emits both `select` and `close`.

## Internal dependencies

- `./ParchmentPanel.vue`
- `./fabThemes`

## Notes

- `select` always emits `close` in addition to `select`, so consumers can't get a select without an accompanying close.
- Tilt values are a fixed 4-element array cycled by index modulo; more than 4 actions repeat the tilt pattern.
