---
source: src/types/physics3d.ts
source_hash: 4d3d89aba8809f91c260c1d55f35b2d03acd27c924d711b7098bccfde0a365ed
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# 3D Physics Types

`src/types/physics3d.ts`

> This file defines the TypeScript types and default configuration presets for the 3D physics system used to simulate habitat items (such as a ball or stick) that can be pushed by a guinea pig, clicked by the user, or locked in place. It centralizes the shared physics vocabulary and preset values for the habitat simulation.

The file declares two union types describing item behavior: `PhysicsState` ('free' | 'controlled' | 'locked') captures the current simulation mode of an item, and `RollAxis` ('x' | 'z' | 'perpendicular') describes how an item rotates while moving.

Two interfaces model physics data: `PhysicsItemConfig` holds tuning parameters (damping, bounceMultiplier, collisionRadius, rollAxis, pushStrength, clickStrength), and `PhysicsItem` is the runtime state combining an `id`, a `velocity` (typed as `Vector3D` from `./movement3d`), a `state`, and its `config`.

Finally, `PHYSICS_PRESETS` is a constant record mapping item type names ('ball', 'stick') to concrete `PhysicsItemConfig` values, providing default physics tuning for each item type.

## Exports

- **PhysicsState** (type) — `type PhysicsState = 'free' | 'controlled' | 'locked'`: Union describing an item's physics mode: 'free' (natural physics), 'controlled' (constrained during play), or 'locked' (disabled during chewing).
- **RollAxis** (type) — `type RollAxis = 'x' | 'z' | 'perpendicular'`: Union describing how an item rotates when moving: around the X axis, Z axis, or perpendicular to velocity (ball-like).
- **PhysicsItemConfig** (type) — `interface PhysicsItemConfig { damping: number; bounceMultiplier: number; collisionRadius: number; rollAxis: RollAxis; pushStrength: number; clickStrength: number }`: Configuration for initializing a physics item, including velocity decay, bounce, collision distance, roll behavior, and push/click impulse strengths.
- **PhysicsItem** (type) — `interface PhysicsItem { id: string; velocity: Vector3D; state: PhysicsState; config: PhysicsItemConfig }`: Runtime state for a physics-enabled item, linking a habitat item id to its current velocity, physics state, and config.
- **PHYSICS_PRESETS** (constant) — `const PHYSICS_PRESETS: Record<string, PhysicsItemConfig>`: Default physics configurations keyed by item type; currently defines 'ball' and 'stick' presets.

## Internal dependencies

- `./movement3d`
