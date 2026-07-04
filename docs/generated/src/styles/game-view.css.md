---
source: src/styles/game-view.css
source_hash: beb70bd96443474dd9b86ff9269dcf55e73d926425c57fb392f6df5ab35d3ca1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Game View Styles

`src/styles/game-view.css`

> This CSS file provides styling for the main 3D game container in the gps3 application. It defines the canvas wrapper layout, cursor states for different interaction modes, fullscreen behavior, and mobile-specific optimizations for touch and landscape orientations.

### Canvas Wrapper
The `.game-view__canvas-wrapper` establishes a relative-positioned container at 100% width and 70vh height, using the `--color-bg-canvas` CSS variable for background. It hides overflow and disables mobile tap highlighting. The nested `canvas` element fills the wrapper completely with a pointer cursor, disabling text selection, touch callouts, and tap highlights for a native app feel.

### Cursor States
Two modifier classes override the cursor: `.game-view__canvas--placing` sets a crosshair (for placement mode) and `.game-view__canvas--petting` sets a grab cursor (for petting interaction). Both use `!important`.

### Fullscreen Mode
When the parent has `.game-view--fullscreen`, the canvas wrapper expands to fill the viewport (100vw) with height calculated as viewport height minus a 52px header and the mobile safe-area inset. It provides both a `100vh` fallback and a `100dvh` dynamic-viewport value, removes border radius, and sets `touch-action: none` to prevent scrolling during canvas interaction.

### Landscape Mobile
A media query targeting short landscape screens (max-height 500px) reduces the assumed header height from 52px to 40px in the fullscreen height calculation.

## Exports

- **.game-view__canvas-wrapper** (style) — `.game-view__canvas-wrapper`: Relative-positioned 3D canvas container, full width and 70vh tall, with hidden overflow and disabled mobile tap highlighting.
- **.game-view__canvas--placing** (style) — `.game-view__canvas--placing`: Cursor modifier applying a crosshair cursor for placement mode.
- **.game-view__canvas--petting** (style) — `.game-view__canvas--petting`: Cursor modifier applying a grab cursor for petting interaction.
- **.game-view--fullscreen** (style) — `.game-view--fullscreen .game-view__canvas-wrapper`: Fullscreen variant that fills the viewport minus a header offset and safe-area inset, using dvh units and disabling touch scrolling.

## Internal dependencies

- `--color-bg-canvas (CSS custom property)`

## Notes

- Header height offsets (52px default, 40px landscape) are hardcoded and must stay in sync with the actual header component height.
- Uses logical properties (inline-size/block-size) rather than width/height.
- Relies on the `--color-bg-canvas` CSS variable being defined elsewhere.
- Cursor modifiers use `!important`, which will override other cursor rules.
