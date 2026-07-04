---
source: src/components/layout/NavigationDropdown.vue
source_hash: 01b80e5dd71dd3fc91a7c34f308a21238d7a8cc8dc7b6baf2d09a3659481e3a8
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# NavigationDropdown

`src/components/layout/NavigationDropdown.vue`

> A Vue 3 SFC providing a mobile-friendly dropdown navigation menu. It displays a trigger button showing the currently selected tab, and when opened, presents categorized lists of tabs for selection. It uses v-model to communicate the selected tab ID with its parent.

## Structure
The template has three parts: a trigger `<button>` showing the current tab's icon and label (with fallbacks `📋` and `'Select View'`) plus a rotating arrow indicator; a dropdown `__menu` (rendered when `isOpen`) that iterates over `categories`, rendering a category label followed by each category's tabs as buttons; and a full-screen `__overlay` (rendered when `isOpen`) that closes the dropdown on click.

## State & Logic
- `isOpen` (ref, default false) controls menu/overlay visibility.
- `currentTab` (computed) searches all categories' tabs for the one matching `modelValue`, returning it or `null`.
- `toggleDropdown`, `closeDropdown` manage `isOpen`.
- `selectTab(tabId)` emits `update:modelValue` and closes the dropdown.
- Active tab items get an `--active` class and a checkmark (`✓`).

## Lifecycle
On mount, a global `keydown` listener is added; pressing `Escape` while open closes the dropdown. The listener is removed on unmount.

## Styling
Mobile-first scoped-style-free CSS (plain `<style>`) using BEM-style class names and CSS custom properties. Includes slide-in and fade-in keyframe animations. Display toggling for desktop is handled externally by parent container queries.

## Exports

- **NavigationDropdown** (component) — `<NavigationDropdown :categories="TabCategory[]" v-model="string" />`: Dropdown navigation component. Props: `categories` (TabCategory[]) and `modelValue` (string, the active tab id). Emits `update:modelValue` with the selected tab id.
- **TabCategory** (type) — `interface TabCategory { id: string; label: string; tabs: Tab[] }`: Interface describing a category grouping of tabs, exported from this file.

## Internal dependencies

- `./TabContainer.vue`
- `vue`

## Notes

- Adds a global `document` keydown listener on mount for Escape-to-close; removed on unmount.
- The `Tab` type is imported from `./TabContainer.vue`, coupling this component to that file's exported type.
- Uses global (non-scoped) `<style>`, so class names and animations are not encapsulated.
- Desktop visibility of the dropdown is not controlled here; it relies on parent container queries (e.g. in DebugView).
