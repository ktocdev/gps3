---
source: src/components/basic/dialogs/BaseDialog.vue
source_hash: 813e484e89c503bf4c67ce9ec00b7298abdfeed4c05bf5236b17aac2b50b746c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# BaseDialog

`src/components/basic/dialogs/BaseDialog.vue`

> A reusable modal dialog wrapper built on the native HTML `<dialog>` element. It provides v-model-driven open/close control, backdrop and escape-key close behavior, body scroll locking with scrollbar-width compensation (supporting nested dialogs), and a parchment-themed styled content container.

## Behavior
The component renders a native `<dialog>` with a `.base-dialog__content` wrapper containing a default slot for arbitrary dialog content.

### Open/close control
A `watch` on `props.modelValue` opens the dialog via `showModal()` (also calling `lockScroll()`) when set true and the dialog isn't already open, or calls `close()` + `unlockScroll()` when set false. On mount, if `modelValue` is already true, it opens immediately.

### Emits
The native `close` event triggers `handleClose`, which emits `update:modelValue` (false) and `close`. Backdrop clicks are detected in `handleDialogClick` by comparing `event.target === dialogRef.value`; if `closeOnBackdrop` is enabled it calls `handleClose`. A `cancel` event listener (`handleEscape`) calls `event.preventDefault()` when `closeOnEscape` is false, suppressing the native escape-close.

### Scroll locking
Module-level `openDialogCount` tracks the number of open dialogs so nested dialogs share one scroll lock. On the first lock it computes scrollbar width, stores original body `overflow`/`paddingRight` in data attributes, sets `overflow: hidden`, and compensates padding. On the last unlock it restores and cleans up.

### Cleanup
`onUnmounted` removes the `cancel` listener and unlocks scroll if the dialog was still open.

### Styling
Styles are global (non-scoped) using CSS custom properties for a parchment theme, with size modifier classes, `::backdrop` styling, fadeIn/slideUp animations, and reduced-motion / high-contrast media queries.

## Exports

- **BaseDialog** (component) — `<BaseDialog v-model size close-on-backdrop close-on-escape>`: Modal dialog component. Props: `modelValue: boolean` (required, v-model), `size?: 'sm'|'md'|'lg'` (default 'md'), `closeOnBackdrop?: boolean` (default true), `closeOnEscape?: boolean` (default true). Emits: `update:modelValue(value: boolean)` and `close()`. Exposes a default slot for content.

## Internal dependencies

- `vue`

## Notes

- `openDialogCount` is module-level and shared across all BaseDialog instances to coordinate scroll locking for nested dialogs.
- `dialogSizeClass` is computed once at setup from `props.size` and is not reactive to size changes.
- Styles are global (non-scoped `<style>`) and rely on CSS variables like `--panel-bg-top`, `--space-8`, `--transition-fast` being defined elsewhere.
- Depends on native `<dialog>` element support (showModal/close, ::backdrop, cancel event).
- Body scroll lock mutates `document.body` styles directly and stores originals in dataset attributes; an unmount while open triggers unlock to avoid a leaked lock.
