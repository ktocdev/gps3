---
source: src/components/debug/environment/NeedsPanel.vue
source_hash: 62d513bb55d1ff04fcf533002c4af7d06303ce5ce78ea5fb52a8bcd71969c159
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# NeedsPanel Debug Component

`src/components/debug/environment/NeedsPanel.vue`

> A debug panel Vue SFC that displays and allows editing of all guinea pig needs values for every active guinea pig in the game. It provides sliders to set individual need levels and a button to replenish all needs to 100%, intended for use in the debug environment view.

## Rendering
When at least one guinea pig is active (`hasActiveGuineaPigs`), it renders a `DebugPanel` containing one column per active guinea pig from `guineaPigStore.activeGuineaPigs`. Each pig shows its name and three `DebugSection` groups: Critical Needs (hunger, thirst, energy), Environmental Needs (shelter, hygiene, chew), and Wellness Needs (play, social, comfort, nails). Each need renders a `DebugSlider` bound to the rounded current need value, colored via a `--color-need-<need>` CSS variable. When no guinea pigs are active, a warning panel with a prompt to start a game is shown instead.

## State & Data Flow
The component reads from `useGuineaPigStore()`. Slider values reflect `guineaPig.needs[need]` (rounded). The `DebugSlider` emits absolute values; `adjustNeed` converts the new absolute value into a delta relative to the current value and calls `guineaPigStore.adjustNeed(id, need, delta)`. `replenishAllNeeds` iterates all needs and adjusts each by the delta required to reach 100.

## Helpers
- `formatNeedName` capitalizes the first letter for display.
- Need category arrays (`criticalNeeds`, `environmentalNeeds`, `wellnessNeeds`) are static local constants.

## Layout
Uses CSS container queries (`container-name: needs-panel`); pigs stack vertically below 640px and lay out in side-by-side flex columns with divider borders above 640px.

## Exports

- **NeedsPanel** (component) — `<NeedsPanel />`: Debug SFC with no props or emits. Reads guinea pig data from the guinea pig store and mutates needs via store methods.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../../basic/Button.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugSlider.vue`

## Notes

- Slider emits absolute values, but the store's `adjustNeed` expects a delta; the component computes `newValue - currentValue` to bridge this.
- Both `adjustNeed` and `replenishAllNeeds` fetch the guinea pig via `guineaPigStore.getGuineaPig(id)` and silently return if not found.
- The `--color-need-<need>` CSS variables must exist for each need name for accents to render correctly.
