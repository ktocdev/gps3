---
source: src/components/game/dialogs/PauseOverlay.vue
source_hash: e0e0cf12bdd9f60a2fbbeb8ed7f26e6279d4a4341d796833ef934c372cc642b0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PauseOverlay

`src/components/game/dialogs/PauseOverlay.vue`

> A Vue SFC dialog component that displays a full pause overlay when the game is paused. It presents contextual messaging based on why the game was paused and offers the player options to resume or keep the game paused.

## Structure

Wraps `BaseDialog` (size `md`) with backdrop and escape closing disabled, so the overlay can only be dismissed via its own buttons. The dialog's `modelValue` is proxied through to the parent via `update:modelValue`.

## Contextual content

Three computed properties — `subtitle`, `message`, and `hint` — switch their text based on the `pauseReason` prop (`manual`, `visibility`, `orientation`, `navigation`), each with a default fallback. This drives the header subtitle, body message, and hint line.

## Actions

The footer has two buttons:
- **Resume Game** (`handleResume`): emits `resume` then closes the dialog via `update:modelValue(false)`.
- **Close and Pause** (`handleClose`): only closes the dialog (emits `update:modelValue(false)`), leaving the game paused.

## Styling

Scoped-less `<style>` uses design-token CSS variables for wood/gold theming. Footer buttons stack vertically on small screens and switch to a horizontal row at min-width 641px, where the icon and title also grow.

## Exports

- **PauseOverlay** (component) — `<PauseOverlay v-model="boolean" :pause-reason="'manual'|'visibility'|'orientation'|'navigation'" @resume="..." />`: Pause dialog component. Props: `modelValue: boolean` (dialog visibility), `pauseReason?` (defaults to 'manual', controls displayed text). Emits: `update:modelValue(value: boolean)` and `resume()`.

## Internal dependencies

- `../../basic/dialogs/BaseDialog.vue`
- `../../basic/Button.vue`

## Notes

- Backdrop and escape close are disabled on BaseDialog, so the dialog can only be dismissed through its own buttons.
- Resuming emits both `resume` and `update:modelValue(false)`; closing emits only `update:modelValue(false)` — the component does not track or enforce actual game pause state, which is the parent's responsibility.
