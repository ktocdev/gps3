---
source: src/components/chrome/FabCluster.vue
source_hash: 4992235c8c8c70cad2aa7ef0349dc1e64b912e3e1fab84b73a37bc3815db61bd
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FabCluster.vue

`src/components/chrome/FabCluster.vue`

> A Vue SFC that renders a horizontal cluster of floating action button (FAB) plaques, managing which single plaque is open and forwarding action events to its parent.

## Structure
Renders a `.fab-cluster` root div (tagged `data-tutorial="fabs"`) containing a decorative rail and a row of `FabPlaque` components, one per entry in the `fabs` prop, keyed by `fab.theme`.

## State & Logic
- `openFab` (ref) tracks which theme's plaque is currently open; only one can be open at a time.
- `toggle(theme)` opens the given plaque or closes it if already open.
- Each `FabPlaque` receives `open` (true when its theme matches `openFab`), and emits `toggle`, `close` (sets `openFab` to null), and `action` (re-emitted upward as `action` with the fab's theme and action id).
- `onDocumentMouseDown` implements click-outside dismissal: when a plaque is open and a mousedown occurs outside `rootRef`, it closes the plaque.

## Lifecycle
The document `mousedown` listener is added on mount and removed on unmount.

## Exports

- **FabCluster** (component) — `<FabCluster :fabs="FabConfig[]" @action="(theme, actionId) => void" />`: Primary export. Props: `fabs: FabConfig[]` (list of FAB configurations to render). Emits: `action: [theme: FabTheme, actionId: string]` when a child plaque triggers an action.

## Internal dependencies

- `./FabPlaque.vue`
- `./fabThemes`

## Notes

- Adds a global document-level mousedown listener for click-outside behavior; cleaned up on unmount.
- Only one FAB plaque can be open at a time via the shared `openFab` ref.
