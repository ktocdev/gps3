---
source: src/components/chrome/PigDrawer.vue
source_hash: cdf063a1433713a93248043e9ebbbc847707410b27194910dd05059fd832a868
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigDrawer.vue

`src/components/chrome/PigDrawer.vue`

> A tabbed drawer component that displays details for a single guinea pig, switching between an Info panel and a Needs panel. It also integrates with the tutorial system so the guided tour can programmatically flip between tabs while narrating.

## Structure
Renders a tab bar (`pig-drawer__tabs`) with two hardcoded tabs — `info` (🐹) and `needs` (📊) — followed by a content area (`pig-drawer__content`).

## State & Logic
- `activeTab` is a `ref` initialized to `'info'`. Clicking a tab button sets `activeTab` to that tab's `id`.
- The `tabs` array is a readonly `const` defining tab metadata.
- The content area conditionally renders `PigInfoPanel` (passed the whole `guineaPig`) when `activeTab === 'info'`, otherwise `PigNeedsPanel` (passed `guineaPig.needs`).
- The `needs` tab button gets a `data-tutorial="pig-needs-tab"` attribute for tutorial targeting.

## Tutorial integration
On mount, registers `tutorialTabHandler` under the key `'pig-drawer-tab'` with the tutorial store; on unmount it unregisters it. The handler accepts a `boolean | string` and, when passed `'info'` or `'needs'`, updates `activeTab` — allowing the guided tour to control which tab is shown.

## Exports

- **PigDrawer** (component) — `<PigDrawer :guinea-pig="GuineaPig" />`: Vue SFC. Props: `guineaPig: GuineaPig` (required). No emits. Renders a two-tab drawer (Info/Needs) with internal `activeTab` state and registers a tutorial panel handler under key 'pig-drawer-tab'.

## Internal dependencies

- `./PigInfoPanel.vue`
- `./PigNeedsPanel.vue`
- `../../stores/guineaPigStore`
- `../../stores/tutorialStore`

## Notes

- Registers/unregisters a tutorial panel handler keyed 'pig-drawer-tab' on mount/unmount; the tutorial store can invoke it to switch tabs.
- The tutorial handler accepts `boolean | string` but only acts on the strings 'info' or 'needs'; other values are ignored.
