---
source: src/components/layout/CategoryDropdown.vue
source_hash: 97096850b56898f496ac033b960957fef3b699caa196f1b81b668d8045dddaca
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# CategoryDropdown.vue

`src/components/layout/CategoryDropdown.vue`

> A Vue 3 SFC that renders a labeled dropdown button grouping a set of tabs. It lets the user pick one tab from a category via a menu, exposing the selection through v-model. Used within the layout/tab navigation to collapse multiple tabs under a single category selector.

## Structure
The template has three parts: a trigger button showing the `categoryLabel` and an arrow, a dropdown menu (rendered when `isOpen`) listing each tab as a button with icon, label, and a check mark for the active one, and a full-screen overlay (mobile) that closes the dropdown on click.

## State & logic
- `isOpen` (ref) controls menu/overlay visibility.
- `isActiveCategory` (computed) is true when the current `modelValue` matches any tab in this category, driving the `--active` styling on the trigger.
- `toggleDropdown` flips `isOpen`; `closeDropdown` sets it false.
- `selectTab(tabId)` emits `update:modelValue` with the tab id and closes the dropdown.

## Data flow
Parent supplies `categoryLabel`, `tabs`, and `modelValue`. Selecting a tab emits `update:modelValue` (v-model). The active tab is highlighted based on `modelValue === tab.id`.

## Lifecycle side effects
On mount, a global `keydown` listener is added to close the dropdown on Escape; it is removed on unmount.

## Styling
Scoped-less global `<style>` block using BEM class names and CSS custom properties (design tokens). Includes slide-in and fade-in keyframe animations for the menu and overlay.

## Internal dependencies

- `./TabContainer.vue`

## Notes

- The `<style>` block is not scoped, so its global BEM class names could collide with other components sharing the same names.
- The `keydown` listener is attached to `document`; correctly removed on unmount to avoid leaks.
- Imports the `Tab` type from TabContainer.vue, creating a coupling to that component's type definition.
- Clicking outside is handled only via the overlay element, not a document-level click listener.
