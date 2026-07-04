---
source: src/components/chrome/ParchmentBanner.vue
source_hash: 079f0800c1864cf7a8cfe11a496bf60511d32c920177fa5c7ff028a31099902f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ParchmentBanner

`src/components/chrome/ParchmentBanner.vue`

> A presentational Vue SFC that renders a themed banner using ParchmentPanel, showing an optional icon, slotted content, and a cancel button. It exists to provide a reusable dismissible banner UI element within the app's parchment-styled chrome.

### Structure
The component wraps a `ParchmentPanel` (passing through the `accent` prop) containing a row layout. The row optionally shows an emoji/text `icon`, then the default `<slot />` content, followed by a cancel button (`✕`).

### Props
- `accent` (optional string): forwarded to `ParchmentPanel` to control its accent styling.
- `icon` (optional string): rendered as text before the slot content; the icon span is only shown when `icon` is truthy.

### Events
- `cancel`: emitted when the cancel button is clicked.

### Data flow
Purely presentational — no internal state. Content is provided via the default slot; the parent handles the `cancel` emit for dismissal logic.

## Exports

- **ParchmentBanner** (component) — `<ParchmentBanner :accent? :icon? @cancel>`: Vue SFC banner. Props: `accent?: string` (passed to ParchmentPanel), `icon?: string` (optional leading icon text). Emits: `cancel` (on cancel button click). Provides a default slot for banner content.

## Internal dependencies

- `./ParchmentPanel.vue`
