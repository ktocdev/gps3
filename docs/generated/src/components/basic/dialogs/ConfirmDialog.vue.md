---
source: src/components/basic/dialogs/ConfirmDialog.vue
source_hash: 9921dc3c7e5808a194d104066a69805bfef2a3d0e1e911dd555e3ac8c8aa144c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ConfirmDialog

`src/components/basic/dialogs/ConfirmDialog.vue`

> A reusable confirmation dialog component that wraps BaseDialog to present a title, message, and confirm/cancel actions. It exists to standardize confirmation prompts (including danger/warning variants) across the application with consistent styling and accessibility semantics.

## Structure
Renders a `BaseDialog` and passes through sizing and close behavior props. Inside, it builds an `alertdialog` region with a header (title), a content area (default slot falling back to `message`), and a footer containing Cancel and Confirm `Button`s.

## State & Logic
- Generates a unique `titleId` (via `Math.random`) used for `aria-labelledby`.
- `confirmVariant` computed maps the `variant` prop (`danger`/`warning`/default) to the confirm button's variant (`danger`/`warning`/`primary`).
- `buttonSize` computed mirrors the `size` prop onto both buttons.

## Data Flow
- `handleConfirm` emits `confirm` then `update:modelValue(false)` to close.
- `handleCancel` emits `cancel` then `update:modelValue(false)`.
- `handleDialogClose(value)` is bound to BaseDialog's `update:model-value`; when closing (`value` false) it emits `cancel`, then re-emits `update:modelValue` with the value.

## Styling
Scoped-less (`<style>` without scoped) BEM-style classes for header/content/footer using CSS custom properties. Includes responsive footer stacking under 640px and high-contrast border support.

## Internal dependencies

- `./BaseDialog.vue`
- `../Button.vue`
