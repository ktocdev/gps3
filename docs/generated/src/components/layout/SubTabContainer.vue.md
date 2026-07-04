---
source: src/components/layout/SubTabContainer.vue
source_hash: 767dbb7ef8109fc6f0c218083872159faffc4c57bcfee5759f8c9951ee97182e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SubTabContainer.vue

`src/components/layout/SubTabContainer.vue`

> A reusable Vue 3 component that renders a nested pill-style tab navigation with optional content panels. It supports keyboard/touch interaction, ARIA tab semantics, badges, icons, and a buttons-only mode where no content panels are rendered. It is a controlled component driven by v-model.

### Structure
The template renders a `nav[role=tablist]` containing a `button[role=tab]` for each entry in the `tabs` prop. Each button shows an optional icon, a label, and an optional badge. When `buttonsOnly` is false, a content region renders a `[role=tabpanel]` per tab, each exposing a named slot (`tab.id`) with slot props `{ tab, active }`. Panels use the `hidden` attribute to toggle visibility for non-active tabs.

### State & Data Flow
The component is fully controlled: `activeTab` is a computed derived from `props.modelValue` (defaulting to `''`) — there is no internal selection state. On mount, if no `modelValue` is set and tabs exist, it emits `update:modelValue` with the first non-disabled tab's id to auto-select.

`setActiveTab(tabId)` looks up the tab and only emits `update:modelValue` and `tab-change` (with new id and previous id) if the tab exists, is not disabled, and differs from the current value.

### Touch Handling
`handleTouchStart` adds a `touching` class for visual feedback. `handleTouchEnd` removes the class, calls `preventDefault()` to suppress the synthetic click, and invokes `setActiveTab`.

### Styling
Mobile-first CSS uses container queries: tab text is hidden below 401px (icon-only), and font/padding scale at 601px. Includes custom scrollbar styling, hover suppression on touch devices, high-contrast, reduced-motion, and print styles (nav hidden, all panels shown).

## Exports

- **SubTabContainer** (component) — `<SubTabContainer :tabs :modelValue :align :buttonsOnly v-model />`: Primary default export. Props: `tabs: SubTab[]` (required), `modelValue?: string` (default `''`, v-model), `align?: 'start' | 'end'` (default `'start'`, declared but not used in logic/template), `buttonsOnly?: boolean` (default `false`). Emits: `update:modelValue(value: string)` and `tab-change(tabId: string, previousTabId: string | null)`. Provides a named slot per tab id with slot props `{ tab, active }`.
- **SubTab** (type) — `interface SubTab { id: string; label: string; icon?: string; badge?: string | number; disabled?: boolean }`: Exported interface describing a single tab definition used in the `tabs` prop.

## Internal dependencies

- `vue`

## Notes

- The `align` prop is declared but never referenced in the template, script logic, or CSS — it currently has no effect.
- Component is fully controlled with no internal fallback state; if the parent ignores `update:modelValue`, selection will not change.
- `handleTouchEnd` calls `preventDefault()` to avoid double-firing selection alongside the `@click` handler on touch devices.
- Auto-selection of the first enabled tab only runs once in `onMounted`; if `tabs` load asynchronously after mount with an empty `modelValue`, no tab will be auto-selected.
