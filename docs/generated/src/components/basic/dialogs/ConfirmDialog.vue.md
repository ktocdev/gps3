---
source: src/components/basic/dialogs/ConfirmDialog.vue
source_hash: 31313b9225dc0b09e0a190b2e4465d5610e17dbb744c7996f3664c3fb449535d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ConfirmDialog.vue

`src/components/basic/dialogs/ConfirmDialog.vue`

> A confirmation dialog component that wraps BaseDialog to present a titled prompt with confirm and cancel actions. It exists to provide a reusable, accessible alert-style dialog for user confirmation flows across the app.

## Structure
Renders a `BaseDialog` whose visibility is driven by the `modelValue` prop, passing through `size`, `closeOnBackdrop`, and `closeOnEscape`. Inside, a container with `role="alertdialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at a generated `titleId` holds a header (title), content, and footer.

## Content
The content area exposes a default `<slot>` that falls back to rendering the `message` prop inside a `<p>`. The footer contains two `Button` components: a tertiary Cancel button and a confirm button whose variant is derived from `confirmVariant`.

## State & logic
- `titleId` is a one-time random string used for accessibility labeling.
- `confirmVariant` (computed) maps the `variant` prop (`primary`/`danger`/`warning`) to a Button variant, defaulting to `primary`.
- `buttonSize` (computed) mirrors the `size` prop.

## Event flow
- `handleConfirm` emits `confirm` then `update:modelValue(false)`.
- `handleCancel` emits `cancel` then `update:modelValue(false)`.
- `handleDialogClose(value)` emits `cancel` when closing (value is false), then relays `update:modelValue(value)`.

## Exports

- **ConfirmDialog** (component) — `<ConfirmDialog v-model="boolean" :title="string" ... />`: Confirmation dialog SFC. Props: modelValue (boolean, required), title (string, required), message (string, default ''), confirmText (default 'Confirm'), cancelText (default 'Cancel'), variant ('primary'|'danger'|'warning', default 'primary'), size ('sm'|'md'|'lg', default 'md'), closeOnBackdrop (default true), closeOnEscape (default true). Emits: update:modelValue(boolean), confirm(), cancel(). Provides a default slot for custom content, falling back to the message prop.

## Internal dependencies

- `./BaseDialog.vue`
- `../Button.vue`
- `vue`

## Notes

- `titleId` uses Math.random and the deprecated String.prototype.substr; it is generated once per component instance.
- Closing via backdrop or escape (handled by BaseDialog emitting update:modelValue false) triggers a `cancel` emit through handleDialogClose.
- Confirm and cancel handlers both close the dialog by emitting update:modelValue(false), so the parent's v-model determines actual visibility.
