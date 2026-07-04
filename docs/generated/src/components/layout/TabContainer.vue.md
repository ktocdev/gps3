---
source: src/components/layout/TabContainer.vue
source_hash: 83b0739475090dc6dcb22961f701c59bf9eacc8007860bb4b01fbfa9c1e5f83b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# TabContainer.vue

`src/components/layout/TabContainer.vue`

> A reusable, accessible tabbed interface component that renders a tablist of buttons and corresponding content panels. It supports keyboard navigation, v-model binding for the active tab, styling variants, and named slots for panel content.

## Structure
The template renders a `nav` with `role="tablist"` containing a button per tab (with optional icon and badge), and a content area with one `tabpanel` per tab. Each panel exposes a named slot keyed by `tab.id`, passing slot props `tab` and `active`. Inactive panels are marked `hidden` and hidden via CSS (`.tab-container__panel--active` toggles display).

## State & Data Flow
- `activeTab` (ref) holds the current tab id; `previousTab` (ref) tracks the prior one.
- `enabledTabs` (computed) filters out disabled tabs, used for keyboard navigation cycling.
- `setActiveTab(tabId)` validates the tab exists and is not disabled, updates state, then emits `update:modelValue` and `tab-change` (with new and previous ids).
- A `watch` on `props.modelValue` (immediate) syncs external changes into `activeTab` by calling `setActiveTab`.
- `onMounted` sets the initial active tab from `modelValue` or the first enabled tab, and attaches a `keydown` listener to the nav element via `document.querySelector`.

## Keyboard Navigation
`handleKeydown` handles Arrow keys (Right/Down = next, Left/Up = previous), Home (first tab), and End (last tab), cycling through `enabledTabs`.

## Styling
Scoped-less `<style>` block using BEM naming and CSS custom properties. Mobile-first: tab text labels are hidden below 641px (icons only). Supports `compact` and `pills` variants, `bottom` position, high-contrast, reduced-motion, and focus-visible media queries.

## Exports

- **TabContainer** (component) — `<TabContainer :tabs="Tab[]" v-model="string" :variant="'default'|'compact'|'pills'" :position="'top'|'bottom'" />`: Tabbed container component. Props: `tabs` (Tab[], required), `modelValue` (string, active tab id), `variant` (default 'default'), `position` (default 'top'). Emits: `update:modelValue(tabId)` and `tab-change(tabId, previousTabId)`. Provides a named slot per tab id with slot props `{ tab, active }`. Exposes via `defineExpose`: `setActiveTab`, `getNextTab`, `getPreviousTab`, and `activeTab` (computed).
- **Tab** (type) — `interface Tab { id: string; label: string; icon?: string; badge?: string | number; disabled?: boolean; panelClass?: string }`: Shape of an individual tab descriptor passed into the `tabs` prop.

## Internal dependencies

- `vue`

## Notes

- `onMounted` uses `document.querySelector('.tab-container__nav')` which selects the first matching element in the entire document — multiple TabContainer instances on the same page will attach the listener to the wrong nav.
- The `keydown` listener added in `onMounted` is never removed (no `onUnmounted` cleanup), a potential memory leak.
- The immediate `watch` on `modelValue` runs before `onMounted`; it calls `setActiveTab` which emits events during initialization when a `modelValue` is provided.
- `getTabClasses`/`getPanelClasses` do not apply the `position` modifier class (`tab-container--bottom`) to the root element, though CSS defines those styles.
- Variant classes are applied to tab buttons but the `--pills`/`--compact` styling relies on those class names being present.
