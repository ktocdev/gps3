---
source: src/components/debug/ui/DebugNav.vue
source_hash: 8ea95584bfcbe5fda337dce23ee5df942db644c33a931cd90af397621fd6e1fa
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugNav

`src/components/debug/ui/DebugNav.vue`

> A Vue SFC that renders a categorized navigation sidebar/list of tabs for the debug UI. It displays grouped tabs with labels and optional icons, highlights the active tab, and emits selection changes via v-model.

### Rendering
Iterates over the `categories` prop; for each category it renders a group label (`.dbg-nav__group`) and a button (`.dbg-nav__tab`) for every tab within that category. A divider (`.dbg-nav__divider`) is rendered before every category except the first (`i > 0`).

### State & interaction
The active tab is driven by the `modelValue` prop. A tab button gets the `.dbg-nav__tab--active` class when `modelValue === tab.id`. Clicking a tab emits `update:modelValue` with that tab's `id`, supporting `v-model` binding from the parent.

### Data
Each tab optionally renders its `icon` followed by its `label`. Category shape is defined locally by the `TabCategory` interface (`id`, `label`, `tabs`), where `tabs` uses the `Tab` type imported from `TabContainer.vue`.

## Exports

- **DebugNav** (component) — `<DebugNav :categories="TabCategory[]" v-model="string" />`: Props: `categories: TabCategory[]` (each with id, label, and tabs), `modelValue: string` (active tab id). Emits: `update:modelValue` with the selected tab id. Renders grouped, clickable tab buttons with dividers between categories.

## Internal dependencies

- `../../layout/TabContainer.vue (Tab type)`

## Notes

- The `TabCategory` interface is defined locally and not exported; only the component is exported.
- Depends on the `Tab` type import from TabContainer.vue; coupling to that file's type definition.
