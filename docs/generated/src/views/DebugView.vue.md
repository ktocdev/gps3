---
source: src/views/DebugView.vue
source_hash: 8d7b7aa4dcac57262a38f49adc95b27d6a4a464b1359793bef51233d80979696
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugView

`src/views/DebugView.vue`

> A top-level view that provides a categorized debug/developer interface for the game. It composes the game chrome, a debug header, and a dropdown-style tab navigation, conditionally rendering one of several debug panels based on the currently active tab.

## Structure
The template renders `GameHeader` (game chrome), `DebugHeader`, and `DebugNav` at the top. `DebugNav` receives the `tabCategories` list and binds `activeTab` via `v-model`. Below, a `<main>`/`<section>` region conditionally renders one debug panel component via `v-if` based on the string value of `activeTab`.

## State & Data Flow
- `activeTab` is a `ref<string>` defaulting to `'controller'` (Game Controller panel shown first).
- `tabCategories` is a static array of `TabCategory` objects, each grouping several `Tab` definitions (id, label, icon, panelClass) into named categories: Core Systems, Gameplay Systems, Environment Systems, and Prototypes.
- When the user selects a tab in `DebugNav`, `activeTab` updates and the matching panel component renders. The mapping is by string id: controller, pet-store, sanctuary, friendship, bonding, inventory, habitat, habitat-status, model-viewer.

## Theming
`useDebugTheme()` is called to apply a light/dark debug theme to `<html>` while the view is mounted.

## Notes on behavior
A code comment clarifies there is no navigation-driven pause; simulation play/pause state is controlled from the header and persists across tabs.

## Styling
Scoped-less `<style>` sets flex column layout, full-height main area, and a max width of 1440px on the panels container for readability. The visual skin is noted to live in `styles/debug.css`.

## Exports

- **DebugView** (component) — `<DebugView />`: Default-exported Vue SFC (script setup). Takes no props and emits no events. Renders debug chrome, header, categorized tab navigation, and one of several conditionally-rendered debug panels driven by the internal `activeTab` ref.

## Internal dependencies

- `../components/chrome/GameHeader.vue`
- `../components/debug/ui/DebugHeader.vue`
- `../components/debug/ui/DebugNav.vue`
- `../composables/useDebugTheme`
- `../components/layout/TabContainer.vue`
- `./GameControllerView.vue`
- `./PetStoreDebugView.vue`
- `./InventoryDebugView.vue`
- `../components/debug/gameplay/FriendshipDebug.vue`
- `../components/debug/gameplay/BondingDebug.vue`
- `../components/debug/core/StardustSanctuaryDebug.vue`
- `../components/debug/environment/HabitatToolsDebug.vue`
- `../components/debug/environment/HabitatStatusDebug.vue`
- `../components/debug/prototypes/ModelViewerDebug.vue`

## Notes

- The `TabCategory` interface is defined locally here, while the `Tab` type is imported from TabContainer.vue.
- Panel-to-tab mapping relies on exact string matching between `activeTab` and each tab's `id`; the `<style>` block is not scoped, so its rules apply globally.
- `useDebugTheme()` has a side effect of modifying `<html>` theme classes for the lifetime of the mounted view.
