---
source: src/components/chrome/FabCluster.vue
source_hash: 6346fc6ef8ceb50ab337a537a50c2462e184a81c3d208d1fc163f9ca9b9ac9ec
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FabCluster.vue

`src/components/chrome/FabCluster.vue`

> A Vue SFC that renders a cluster of floating action button plaques (FabPlaque) along a rail, managing which plaque is currently open and closing the open one on outside clicks.

## Structure
Renders a `.fab-cluster` container with a decorative `.fab-cluster__rail` and a `.fab-cluster__row` that iterates over the `fabs` prop, rendering a `FabPlaque` per config keyed by `fab.theme`.

## State
- `rootRef`: template ref to the root element, used for outside-click detection.
- `openFab`: the currently open FAB's theme, or `null`.

## Logic
- `toggle(theme)`: opens the given FAB, or closes it if already open (toggle behavior). Only one FAB open at a time.
- Each `FabPlaque` receives `open` (true when its theme matches `openFab`), emits `toggle` (routed to `toggle`), `close` (sets `openFab` to null), and `action` (re-emitted upward as `action` with the fab's theme and action id).
- `onDocumentMouseDown`: a document-level mousedown listener that closes the open FAB when a click occurs outside `rootRef`. No-op if nothing is open or the click is inside the root.

## Lifecycle
Adds the `mousedown` listener on mount and removes it on unmount.

## Internal dependencies

- `./FabPlaque.vue`
- `./fabThemes`
