---
source: src/components/basic/InfoButton.vue
source_hash: 6303472e3c5381a56e1a90c53bd23b8bad48502771696f691c1e331b875ae242
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InfoButton

`src/components/basic/InfoButton.vue`

> A small circular info button that toggles a positioned popover displaying an informational message. It provides accessible attributes and handles click-outside and Escape-key dismissal.

## Structure
The component renders a wrapper `div` containing a `button` (with an info-circle `Icon`) and, conditionally, a popover `div` shown when `isOpen` is true.

## State
- `isOpen` (ref) — controls popover visibility.
- `buttonRef` / `popoverRef` — template refs to the button and popover elements, used for click-outside detection and focus management.
- `popoverClasses` (computed) — builds class list combining base `info-button__popover` with a position modifier derived from `props.position`.

## Behavior
- `togglePopover` flips `isOpen` on button click.
- `closePopover` sets `isOpen` to false.
- `handleClickOutside` closes the popover when a click occurs outside both the button and popover.
- `handleKeyDown` closes the popover on `Escape` and returns focus to the button.
- Document-level `click` and `keydown` listeners are added on mount and removed before unmount.

## Accessibility
The button exposes `aria-label`, `aria-expanded`, and `aria-haspopup`. The popover uses `role="status"` and `aria-live="polite"`.

## Styling
Scoped-less (global) CSS defines the circular button and four popover positions (top/bottom/left/right), each with a directional arrow via `::after`, using CSS custom properties for colors and spacing.

## Exports

- **InfoButton** (component) — `<InfoButton :message="string" :position?="'top'|'bottom'|'left'|'right'" :aria-label?="string" />`: Vue SFC (script setup). Props: `message` (required string, popover text), `position` (optional, default 'top'), `ariaLabel` (optional, default 'More information'). No emitted events.

## Internal dependencies

- `./Icon.vue`
- `vue`

## Notes

- Registers global document `click` and `keydown` listeners for the lifetime of the component; relies on onBeforeUnmount cleanup.
- The `<style>` block is not scoped, so class definitions are global.
- Depends on CSS custom properties (e.g. --color-primary, --space-*) being defined elsewhere.
- Popover width is fixed at 300px (max 400px), which may overflow on narrow layouts regardless of position.
