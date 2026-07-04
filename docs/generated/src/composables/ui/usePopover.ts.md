---
source: src/composables/ui/usePopover.ts
source_hash: 72140ccb7a5ca4cdb3353ba71e96c3c03ab27c9ad8ab363d544087af13ed7d53
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# usePopover

`src/composables/ui/usePopover.ts`

> A Vue composable that provides smart popover positioning using Floating UI. It positions a floating element relative to arbitrary viewport coordinates (e.g., click position) using a virtual reference element, applying flip and shift middleware to keep the popover within the viewport.

The composable wraps `useFloating` from `@floating-ui/vue`. It accepts options for `offset` (default 10), `placement` (default `'bottom'`), and `padding` (default 8).

### State
- `floatingEl`: a template ref for the floating DOM element.
- `virtualReference`: an internal ref holding `{ x, y }` click coordinates.
- `virtualEl`: a computed virtual element implementing `getBoundingClientRect()` based on `virtualReference`, treated as a zero-size point reference for Floating UI.

### Positioning
`useFloating` is configured with the given `placement` and a middleware chain of `offset(offsetValue)`, `flip()`, and `shift({ padding })`. `whileElementsMounted: autoUpdate` keeps the position updated as elements mount/scroll/resize. It exposes the resulting `floatingStyles`.

### API
`updatePosition(x, y)` sets `virtualReference` to the given coordinates, causing the popover to reposition. The composable returns `floatingEl`, `floatingStyles`, and `updatePosition` for use in a component template.

## Exports

- **usePopover** (composable) — `usePopover(options?: UsePopoverOptions): UsePopoverReturn`: Creates a popover positioning system. Returns `floatingEl` (ref to attach to floating element), `floatingStyles` (computed CSS to apply), and `updatePosition(x, y)` to set the reference coordinates. Accepts optional `offset`, `placement`, and `padding`.
- **UsePopoverOptions** (type) — `interface UsePopoverOptions { offset?: number; placement?: 'top'|'bottom'|'left'|'right'; padding?: number }`: Options controlling offset distance, preferred placement, and viewport edge padding.
- **UsePopoverReturn** (type) — `interface UsePopoverReturn { floatingEl: Ref<HTMLElement|null>; floatingStyles: Ref<CSSProperties>; updatePosition: (x: number, y: number) => void }`: The return shape of usePopover.

## Internal dependencies

- `vue`
- `@floating-ui/vue`

## Notes

- Positioning uses a virtual reference point with zero width/height; the popover positions relative to a single coordinate, not an actual DOM anchor element.
- `updatePosition` expects viewport coordinates (e.g., `event.clientX`/`clientY`).
