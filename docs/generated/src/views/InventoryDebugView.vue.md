---
source: src/views/InventoryDebugView.vue
source_hash: 6a7dfa6d4723f1f99e6927d8fbf421b9710955de6f90488e3f5bd93c9d02fb21
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryDebugView

`src/views/InventoryDebugView.vue`

> A thin route-level view component that renders the InventoryDebug debugging component. It exists to expose the inventory debug UI as a routable page.

This is a minimal Vue SFC using `<script setup>` with TypeScript. It imports the `InventoryDebug` component from the debug/environment directory and renders it directly in the template with no props, state, or logic of its own. It acts purely as a pass-through wrapper, likely mapped to a route in the application's router.

## Exports

- **InventoryDebugView** (component) — `<InventoryDebugView />`: Route-level Vue component that renders `<InventoryDebug />`. Takes no props and emits no events.

## Internal dependencies

- `../components/debug/environment/InventoryDebug.vue`
