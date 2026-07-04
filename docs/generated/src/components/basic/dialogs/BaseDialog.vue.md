---
source: src/components/basic/dialogs/BaseDialog.vue
source_hash: 1ca823c5f04fac5e2aeb26b7b3148cf0b131fd0b93e4aee08c3467f61a4e700b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# BaseDialog

`src/components/basic/dialogs/BaseDialog.vue`

> A reusable modal dialog component built on the native HTML `<dialog>` element. It provides v-model-controlled open/close behavior, backdrop and escape-key dismissal, body scroll locking (with scrollbar-width compensation and nested-dialog support), and a themed parchment-styled content wrapper with size variants.

### Rendering
Renders a native `<dialog>` element with a `base-dialog__content` wrapper containing a default slot. The dialog receives a size modifier class computed once from the `size` prop.

### Open/close flow
A `watch` on `modelValue` calls `dialogRef.showModal()` when opening and `dialogRef.close()` when closing, guarding against redundant calls via the native `open` property. On mount, if `modelValue` is already true, the dialog opens immediately.

### Closing
The native `close` event triggers `handleClose`, which emits `update:modelValue(false)` and `close`. Backdrop clicks are detected in `handleDialogClick` by checking `event.target === dialogRef.value` (only when `closeOnBackdrop`). A `cancel` event listener (`handleEscape`) calls `event.preventDefault()` when `closeOnEscape` is false to block escape-key dismissal.

### Scroll locking
Module-level `openDialogCount` tracks nested dialogs across all instances. `lockScroll` (only on first open) computes scrollbar width, stashes original `body` overflow/padding in data attributes, sets `overflow:hidden` and compensating `paddingRight`. `unlockScroll` restores them when the count returns to zero. On unmount, scroll is unlocked if still open.

### Styling
Scoped-free `<style>` centers the dialog via fixed positioning + transform, styles the `::backdrop`, applies a parchment gradient content panel with size variants (sm/md/lg max-widths), fade-in/slide-up animations, and respects reduced-motion and high-contrast media queries.

## Exports

- **BaseDialog** (component) — `<BaseDialog v-model size? closeOnBackdrop? closeOnEscape?>`: Modal dialog component. Props: `modelValue: boolean` (required, controls open state), `size?: 'sm'|'md'|'lg'` (default 'md'), `closeOnBackdrop?: boolean` (default true), `closeOnEscape?: boolean` (default true). Emits: `update:modelValue(value: boolean)` and `close`. Exposes a default slot for content.

## Internal dependencies

- `vue`

## Notes

- `openDialogCount` is a module-level variable shared across all BaseDialog instances to coordinate scroll locking for nested/multiple dialogs; if lock/unlock calls become unbalanced the count can drift and leave the body scroll-locked.
- `dialogSizeClass` is computed once at setup from the initial `size` prop and is not reactive to later prop changes.
- The native `<dialog>` already handles escape-key closing; `handleEscape` only prevents it when `closeOnEscape` is false, and the resulting `close` event still emits via `handleClose`.
- Requires CSS custom properties (e.g. `--panel-bg-top`, `--space-8`, `--transition-fast`) to be defined globally for correct styling.
- Backdrop-click detection relies on the click target being the dialog element itself, which depends on the content wrapper filling the dialog padding area.
