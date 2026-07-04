---
source: src/components/game/SidePanel3D.vue
source_hash: bf69f5a3e57b01ccf199bc321f99ea1790b0be791ea777840b212399d175479b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SidePanel3D

`src/components/game/SidePanel3D.vue`

> A reusable presentational Vue component that renders a collapsible overlay side panel for the 3D game view. It can be docked to the left or right, styled with one of four color variants, and optionally displays internal tab navigation. Content and header extras are injected via slots.

## Structure
The component renders three main parts:

1. **Tab button** (`__tab`) — a floating icon button visible when the panel is collapsed. Clicking it emits `toggle`.
2. **Panel body** (`__body`) — contains a header (icon + title, an optional `header-extra` slot, and a close button that emits `toggle`), optional internal tab navigation, and a content area exposing the default slot.
3. **Internal tabs** — rendered only when `tabs` is a non-empty array. Each tab button emits `update:activeTab` with the tab's `id`, and the button matching `activeTab` gets the `--active` class.

## State & data flow
The component is stateless (props-driven). Visibility is controlled by the `isOpen` prop, which toggles the `--collapsed` modifier class. All interactions bubble up through events (`toggle`, `update:activeTab`) — the parent owns open/close and active-tab state.

## Styling
CSS uses logical properties and BEM-style classes with modifier classes for `side` (left/right), `color` (yellow/violet/pink/green), and collapsed state. Collapsed panels slide off-screen via `translateX(±100%)` transforms. Left panels are 320px wide, right panels 280px. z-index is raised when expanded so it sits above sibling panel tabs. Colors are applied to the tab button and header backgrounds via CSS custom properties.

## Exports

- **SidePanel3D** (component) — `<SidePanel3D :isOpen :side :color :title :icon :tabs? :activeTab? @toggle @update:activeTab>`: Collapsible overlay side panel. Props: isOpen (boolean), side ('left'|'right'), color ('yellow'|'violet'|'pink'|'green'), title (string), icon (string), tabs (TabDefinition[], optional), activeTab (string, optional). Emits: toggle (no payload), update:activeTab (tabId: string). Slots: default (content), header-extra (named).
- **TabDefinition** (type) — `interface TabDefinition { id: string; label: string; icon: string }`: Shape of an internal navigation tab entry passed via the tabs prop.

## Notes

- Purely presentational and stateless — parent must manage isOpen and activeTab state and respond to emitted events.
- Internal tabs only render when tabs is provided and non-empty.
- Relies on global CSS custom properties (--color-*, --spacing-*, --radius-*, --font-*) being defined elsewhere; the <style> block is not scoped, so class names are global.
