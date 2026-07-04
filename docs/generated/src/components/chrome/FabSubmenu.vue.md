---
source: src/components/chrome/FabSubmenu.vue
source_hash: 0e8a58b05d6f597a9dc6de33e6686a4a2ca9ef646a64140eba2480a003d9466e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FabSubmenu

`src/components/chrome/FabSubmenu.vue`

> A Vue 3 SFC that renders a themed floating-action-button submenu as a grid of action tiles inside a ParchmentPanel. It displays available actions (with icons and labels), handles disabled/"coming soon" states, and emits selection/close events when a tile is tapped.

### Rendering
The entire component is wrapped in `v-if="show"`. When shown, it renders a `.fab-submenu` container with theme CSS variables applied, containing a `ParchmentPanel` (accent set to the theme stripe color, no animate, grain enabled).

If `actions` is empty, it shows an empty-state message (`emptyMessage` prop or the default `'Nothing available.'`). Otherwise it renders a `.fab-submenu__grid` of `<button>` tiles, one per action.

### Tiles
Each tile is keyed by `action.id`, gets a rotation transform via `tiltFor(i)`, is disabled when `action.disabled` is truthy (with a `title` of 'Coming soon' and a 'Soon' tag span), and shows the action's `icon` and `label`. Clicking calls `select(action.id)`.

### Theming
`colors` is a computed lookup into `FAB_THEMES` keyed by the `theme` prop. `themeVars` maps those colors (`stripe`, `deep`, `soft`) to CSS custom properties (`--fab-stripe`, `--fab-deep`, `--fab-soft`) bound to the container style.

### Tilt
`TILTS` is a fixed array of four rotation degrees; `tiltFor(i)` cycles through them via modulo to give tiles a slightly varied rotation.

### Events
`select(actionId)` emits both `select` (with the action id) and `close`.

## Exports

- **FabSubmenu** (component) — `<FabSubmenu :show :theme :actions :empty-message @select @close />`: Props: `show: boolean`, `theme: FabTheme`, `actions: FabAction[]`, `emptyMessage?: string`. Emits: `select` (payload `actionId: string`) and `close` (no payload). Selecting a tile emits both `select` then `close`.

## Internal dependencies

- `./ParchmentPanel.vue`
- `./fabThemes (FAB_THEMES, FabAction, FabTheme)`

## Notes

- `select()` always emits `close` alongside `select`, so the parent will receive a close event on every tile selection.
- Disabled tiles are prevented from clicking natively via the `disabled` attribute; the 'Soon' tag and 'Coming soon' title appear only for disabled actions.
- Tilt rotations are hardcoded to a 4-value cycle regardless of tile count.
