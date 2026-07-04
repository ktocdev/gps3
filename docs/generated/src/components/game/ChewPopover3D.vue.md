---
source: src/components/game/ChewPopover3D.vue
source_hash: f2b5109cdd67878257b24d4be37fa115969095e5afdbdcd9f6725b6c2829441b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ChewPopover3D.vue

`src/components/game/ChewPopover3D.vue`

> A Vue SFC that renders a teleported floating popover displaying details about a chew item in the 3D game scene, including its durability, usage metadata, safety status, and a discard action for worn-out chews.

## Rendering
The component teleports its content to `<body>` and renders only when the `show` prop is true. It uses `usePopover({ offset: 10 })` (Floating UI wrapper) to obtain `floatingEl`, `floatingStyles`, and `updatePosition` for smart positioning.

## Positioning
A `watch` on `props.position` (with `immediate: true`) calls `updatePosition(pos.x, pos.y)` whenever the position changes, keeping the floating element anchored.

## Content
The popover shows the chew's emoji, name, a close button, a durability bar, and metadata (times used and last used). The durability percentage drives several computed properties that classify the chew against thresholds from `CHEW_DEGRADATION`:
- `isUnsafe` — true when durability is below `UNSAFE_THRESHOLD`.
- `durabilityStatus` — text label (`Unsafe`/`Degraded`/`Worn`/`Good`).
- `statusClass` and `barColorClass` — corresponding BEM modifier classes for coloring.
- `lastUsedText` — humanized elapsed time since `lastUsedAt` (e.g. `Xh ago`, `Xm ago`, or `Just now`).

When `isUnsafe` is true, a warning banner and a discard action button appear. The close and discard buttons emit `close` and `discard` events respectively.

## Styling
Styling is global (non-scoped `<style>`) using CSS custom properties for a themed 'awning' popover appearance.

## Exports

- **ChewPopover3D** (component) — `<ChewPopover3D :show="boolean" :position="{x,y}" :chewData="ChewPopoverData | null" @close @discard />`: Props: `show` (boolean, controls visibility), `position` ({x,y} anchor coordinates), `chewData` (ChewPopoverData | null with itemEmoji, itemName, durability, usageCount, lastUsedAt). Emits: `close` (close button clicked), `discard` (discard unsafe chew clicked).

## Internal dependencies

- `../../composables/ui/usePopover`
- `../../composables/3d/use3DChewPopover`
- `../../constants/supplies`

## Notes

- Uses non-scoped global `<style>`, so class names could collide across the app.
- `void floatingEl` is present to suppress an unused-variable warning; the ref is actually consumed in the template.
- Durability classification thresholds are entirely driven by `CHEW_DEGRADATION` constants; changing those constants alters status labels and colors.
- `lastUsedText` computes relative time only at render/reactivity time and does not auto-refresh with a timer.
