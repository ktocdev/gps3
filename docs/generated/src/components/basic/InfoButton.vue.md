---
source: src/components/basic/InfoButton.vue
source_hash: 8fb52b732846b4f323b846ccb638b49a2fe0435e9bb34eee9e3fe81aee0253ab
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InfoButton.vue

`src/components/basic/InfoButton.vue`

> A small circular info button that toggles a positioned popover displaying a message. Used to provide contextual help/information triggered by clicking an info icon.

## Structure
The component renders a wrapper `div` containing a `button` (with an `info-circle-solid` Icon) and a conditionally-rendered popover `div` shown when `isOpen` is true.

## State
- `isOpen` (ref boolean): controls popover visibility, toggled by clicking the button.
- `buttonRef` / `popoverRef`: template refs to the button and popover elements, used for click-outside detection and focus management.

## Behavior
- `togglePopover` flips `isOpen` on button click.
- `closePopover` sets `isOpen` to false.
- `handleClickOutside` (document click listener) closes the popover when a click occurs outside both the button and popover.
- `handleKeyDown` (document keydown listener) closes the popover on `Escape` and returns focus to the button.
- Listeners are added in `onMounted` and removed in `onBeforeUnmount`.
- `popoverClasses` computes the base class plus a position modifier (`info-button__popover--{position}`).

## Accessibility
The button exposes `aria-label`, `aria-expanded`, and `aria-haspopup`; the popover uses `role="status"` with `aria-live="polite"`.

## Styling
Scoped-less `<style>` block defines the circular button appearance and popover positioning variants (top/bottom/left/right) each with an arrow pseudo-element, using CSS custom properties.

## Exports

- **InfoButton** (component) — `<InfoButton :message="string" :position?="'top'|'bottom'|'left'|'right'" :aria-label?="string" />`: Vue SFC (script setup). Props: `message` (required string, popover text), `position` (optional, default 'top'), `ariaLabel` (optional, default 'More information'). Emits: none. Renders an info icon button toggling a positioned popover.

## Internal dependencies

- `./Icon.vue`
- `vue`

## Notes

- Registers global document-level click and keydown listeners; relies on onBeforeUnmount cleanup to avoid leaks.
- Popover has a fixed inline-size of 300px (max 400px), not driven by props.
- Styling depends on external CSS custom properties (--color-primary, --space-*, --radius-md, etc.) being defined globally.
