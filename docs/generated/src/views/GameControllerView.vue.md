---
source: src/views/GameControllerView.vue
source_hash: 5aec6f6850ed051b06d16a1a97222de469f6505604150bbd4ffbf759c2354b44
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GameControllerView

`src/views/GameControllerView.vue`

> A thin route-level view wrapper that renders the GameController debug component. It exists to expose the GameController as a routable page in the application.

This is a minimal Vue single-file component. Its template renders a single `<GameController />` component with no props, slots, or event handling. The `<script setup>` block simply imports `GameController` from `../components/debug/core/GameController.vue`. It holds no local state, defines no props or emits, and contains no logic of its own — all behavior is delegated to the imported component.

## Exports

- **GameControllerView** (component) — `<GameControllerView />`: Default SFC export. A wrapper view with no props or emits that renders the GameController debug component.

## Internal dependencies

- `../components/debug/core/GameController.vue`
