---
source: src/views/PetStoreDebugView.vue
source_hash: 2fd123c695b3be3f96fe02e0dac44c029a07aab26634b7a9e45ae0efe7abb2ca
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PetStoreDebugView

`src/views/PetStoreDebugView.vue`

> A route-level view component that renders the PetStoreDebug debugging component. It acts as a thin wrapper for exposing the pet store debug tooling as a page in the application.

This is a minimal Vue single-file component using the `<script setup>` composition API with TypeScript. It imports the `PetStoreDebug` component from `../components/debug/core/PetStoreDebug.vue` and renders it directly in the template with no props, state, or logic of its own. All functionality is delegated to the imported `PetStoreDebug` component.

## Exports

- **PetStoreDebugView** (component) — `<PetStoreDebugView />`: Default SFC export. Takes no props and emits no events. Renders a single `<PetStoreDebug />` component.

## Internal dependencies

- `../components/debug/core/PetStoreDebug.vue`
