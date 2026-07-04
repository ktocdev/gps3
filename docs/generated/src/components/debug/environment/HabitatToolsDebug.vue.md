---
source: src/components/debug/environment/HabitatToolsDebug.vue
source_hash: 70240710908df59baf07478d54bdf722b37f329eec16d0284dd205cdd836b229
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HabitatToolsDebug.vue

`src/components/debug/environment/HabitatToolsDebug.vue`

> A debug panel component that aggregates habitat-related debug tools: guinea pig needs display, poop system controls, and a control for adjusting the needs decay rate (simulation speed).

This SFC composes several debug sub-components into a vertical layout. It renders `NeedsPanel` at the top, then a two-column `DebugPanelRow` containing a "Poop System" panel (`PoopDebug`) and a "Decay Speed" panel.

The decay speed panel binds a `DebugSlider` to `guineaPigStore.settings.needsDecayRate` (range 0–2, step 0.05), calling `guineaPigStore.setNeedsDecayRate(v)` on update. A row of preset `Button`s sets fixed rates (0x, 0.1x, 0.5x, 1x, 2x); each button gets a `button--active` class when its value matches the current `needsDecayRate`.

All state comes from `useGuineaPigStore`. The component is purely presentational glue with no local state.

## Exports

- **HabitatToolsDebug** (component) — `<HabitatToolsDebug />`: Debug component with no props or emits. Composes NeedsPanel, PoopDebug, and a decay-rate control bound to the guinea pig store.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../../basic/Button.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugPanelRow.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugSlider.vue`
- `./NeedsPanel.vue`
- `./PoopDebug.vue`

## Notes

- Uses non-scoped `<style>`, so `.button--active`, `.decay-speed-control`, and `.habitat-tools-debug` styles are global.
- Active-button detection relies on exact float equality against preset values (0, 0.1, 0.5, 1, 2); slider adjustments to intermediate values leave all preset buttons inactive.
