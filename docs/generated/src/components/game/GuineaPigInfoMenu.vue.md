---
source: src/components/game/GuineaPigInfoMenu.vue
source_hash: 9b86783de67ffad12b5ad42ffee28ec89a1c56e56a4d9d9a0de91983f91adc02
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GuineaPigInfoMenu.vue

`src/components/game/GuineaPigInfoMenu.vue`

> A floating popover component that displays a single guinea pig's name and all its need bars, plus controls to take or release direct control of that guinea pig. It is teleported to the document body and positioned near a clicked point using Floating UI.

### Rendering
The entire menu is wrapped in a `<Teleport to="body">` and positioned via `floatingStyles` applied to a template ref `floatingEl`. It shows a header (guinea pig name + close button), a scrollable list of need bars, and an actions section.

### Positioning
Uses the `usePopover` composable (with `offset: 10`) which returns `floatingEl`, `floatingStyles`, and `updatePosition`. A `watch` on `props.position` (immediate) calls `updatePosition(pos.x, pos.y)` whenever the position changes, driving Floating UI placement.

### Needs display
`needsList` is a computed array mapping ten needs (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, chew) from `props.guineaPig.needs` to `{ key, label, value }`. Each renders a labeled bar whose fill width equals the value percentage and whose color class comes from `getNeedColorClass`. The rounded value is shown alongside.

### Color thresholds
`getNeedColorClass(value)` returns `--satisfied` (≥60), `--good` (≥40), `--medium` (≥30), else `--critical`, mirroring NeedRow thresholds.

### Actions
When `isControlled` is false, a 'Take Control' button emits `take-control`. When true, it shows a controlling status/hint and a 'Release' button (with `timeRemaining` seconds) that emits `release-control`. The close button emits `close`.

## Exports

- **GuineaPigInfoMenu** (component) — `<GuineaPigInfoMenu :guineaPig :position :isControlled? :timeRemaining? @close @take-control @release-control />`: Props: `guineaPig: GuineaPig`, `position: { x: number; y: number }`, optional `isControlled?: boolean`, optional `timeRemaining?: number`. Emits: `close`, `take-control`, `release-control`. Renders a teleported floating info menu with need bars and control actions.

## Internal dependencies

- `../../stores/guineaPigStore (GuineaPig type)`
- `../../composables/ui/usePopover`

## Notes

- Component is teleported to <body>, so it renders outside the parent's DOM subtree; parent must handle outside-click/close logic externally.
- `void floatingEl` is used purely to suppress an unused-variable warning; the ref is consumed by the template.
- Color class thresholds intentionally match NeedRow; changing them here diverges from that component.
- The 'good' need color uses `--color-text-muted` (grey), which is unusual for a bar fill.
