---
source: src/components/chrome/PigDrawer.vue
source_hash: 98bee0927c39a36e6f60345d1b047f9692d1c0a370c483c7a67f4f6c070f1c88
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigDrawer.vue

`src/components/chrome/PigDrawer.vue`

> A tabbed drawer component that displays a single guinea pig's information, switching between an Info panel and a Needs panel. It also integrates with the guided tutorial so the tour can programmatically flip between tabs while narrating.

## Structure
The template renders a tab bar (`pig-drawer__tabs`) with buttons generated from a static `tabs` array (Info and Needs). Clicking a tab sets the reactive `activeTab` ref. The content area conditionally renders `PigInfoPanel` (passed the full `guineaPig`) when `activeTab === 'info'`, otherwise `PigNeedsPanel` (passed `guineaPig.needs`).

## State
- `tabs`: a `const` array of `{ id, icon, label }` objects for `info` and `needs`.
- `activeTab`: a `ref` typed as `'info' | 'needs'`, defaulting to `'info'`.

## Tutorial integration
On mount it registers a panel handler under the key `pig-drawer-tab` with the tutorial store; on unmount it unregisters the same handler. The handler `tutorialTabHandler` accepts a `boolean | string` value and, when it equals `'info'` or `'needs'`, sets `activeTab` accordingly — allowing the guided tour to control which tab is shown.

## Tutorial targeting
The Needs tab button gets a `data-tutorial="pig-needs-tab"` attribute so the tour can highlight it.

## Exports

- **PigDrawer** (component) — `<PigDrawer :guinea-pig="GuineaPig" />`: Tabbed drawer for a guinea pig. Props: `guineaPig` (GuineaPig, required). No emits. Renders Info/Needs panels and registers a tutorial panel handler.

## Internal dependencies

- `./PigInfoPanel.vue`
- `./PigNeedsPanel.vue`
- `../../stores/guineaPigStore`
- `../../stores/tutorialStore`

## Notes

- Registers/unregisters a tutorial panel handler under the fixed key 'pig-drawer-tab'; the tutorial store can flip the active tab externally.
- The handler signature accepts `boolean | string` but only reacts to the exact strings 'info' or 'needs'.
