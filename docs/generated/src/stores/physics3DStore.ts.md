---
source: src/stores/physics3DStore.ts
source_hash: 701e0e626fbc8ec963670382b0df5beb2da206c99ebefd8370429d46448910e0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Physics 3D Store

`src/stores/physics3DStore.ts`

> A Pinia store that manages physics simulation state for habitat items (such as a ball or stick) in the gps3 application. It maintains a registry of physics-enabled items, each with velocity, a physics state, and configuration, providing methods to register items, mutate their velocity, and control their simulation state.

## State
The store holds a single reactive `physicsItems` ref containing a `Map<string, PhysicsItem>` keyed by item ID. Each `PhysicsItem` includes an `id`, a `velocity` vector `{x, y, z}`, a `state` (`'free' | 'controlled' | 'locked'`), and a `config`.

## Item management
`addPhysicsItem` registers a new item, resolving config either from a `PHYSICS_PRESETS` key (string) or a provided `PhysicsItemConfig` object; if the preset is unknown it warns and returns without adding. New items start with zero velocity and `'free'` state. `removePhysicsItem`, `getPhysicsItem`, `getAllPhysicsItems`, `hasPhysics`, and `clearAll` provide standard registry access and cleanup.

## State management
`setPhysicsState` updates an item's `state`; when set to `'locked'`, velocity is reset to zero.

## Velocity management
`setVelocity` replaces the velocity vector, `addVelocity` accumulates a delta onto the existing velocity, and `applyDamping` multiplies each velocity component by the item's `config.damping`. All three are no-ops when the item is missing or in the `'locked'` state.

Many methods log activity to the console (add, remove, state changes, clear).

## Exports

- **usePhysics3DStore** (store) — `usePhysics3DStore(): Store`: Pinia store (setup style, id 'physics3D') exposing state `physicsItems` (Map ref) and methods: `addPhysicsItem(id, configOrPreset)`, `removePhysicsItem(id)`, `getPhysicsItem(id)`, `getAllPhysicsItems()`, `hasPhysics(id)`, `clearAll()`, `setPhysicsState(id, state)`, `setVelocity(id, velocity)`, `addVelocity(id, delta)`, `applyDamping(id)`.

## Internal dependencies

- `../types/physics3d`
- `pinia`
- `vue`

## Notes

- Velocity mutation methods (`setVelocity`, `addVelocity`, `applyDamping`) silently do nothing when an item's state is `'locked'`.
- `setPhysicsState` zeroes velocity as a side effect only when transitioning to `'locked'`.
- `addPhysicsItem` silently returns (with a console warning) if given an invalid preset key.
- Numerous methods emit `console.log`/`console.warn` side effects.
