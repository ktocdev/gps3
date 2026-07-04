---
source: src/components/game/ChatBubble3D.vue
source_hash: f0f34b416e659354716b1fe91b75b4681e9b51f3f80f77ac3e6b1e34aa19446c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ChatBubble3D

`src/components/game/ChatBubble3D.vue`

> A presentational Vue SFC that renders an absolutely-positioned speech bubble (with optional emoji and variant-based styling) over a game canvas, typically pointing down toward a guinea pig. It exists to display short contextual messages at pixel coordinates within the canvas wrapper.

## Rendering
The component renders a `div.chat-bubble-3d` only when `isVisible` is truthy (`v-if`). It applies a variant modifier class and an inline `left`/`top` position style. Inside, it shows an optional emoji `<span>` (only when `emoji` is provided) followed by the `message` text.

## Logic
Two computed properties drive the template:
- `chatBubbleModifierClass` — produces `chat-bubble-3d--{variant}` based on the `variant` prop.
- `positionStyle` — maps `position.x`/`position.y` to `left`/`top` pixel values.

Props use `withDefaults`: `variant` defaults to `'neutral'` and `isVisible` defaults to `true`.

## Styling
Extensive scoped-less (`<style>` without scoped) CSS defines the bubble appearance using CSS custom properties (parchment fill, panel borders, wood colors). The bubble is `position: absolute` with `transform: translate(-50%, -100%)` to anchor above and centered on the given point, `pointer-events: none`, and `z-index: 100`. `::after` and `::before` pseudo-elements draw a downward-pointing tail (outline + parchment fill). An enter animation (`chat-bubble-3d-enter`) fades/scales the bubble in, disabled under `prefers-reduced-motion`. Variant classes adjust `--bubble-fill`, background, and text color (positive/neutral/negative/warning/critical). A mobile media query (`max-width: 480px`) reduces padding, wraps content, and shrinks fonts.

## Exports

- **ChatBubble3D** (component) — `<ChatBubble3D :message :emoji? :variant? :position :isVisible? />`: Speech bubble overlay component. Props: `message: string` (required text), `emoji?: string` (optional leading emoji), `variant?: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'` (defaults 'neutral', controls color styling), `position: { x: number; y: number }` (required pixel coordinates for left/top), `isVisible?: boolean` (defaults true, gates rendering). No emits.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is global (not `scoped`); the `chat-bubble-3d` class names and keyframes leak into the global stylesheet.
- Relies on many external CSS custom properties (e.g. `--panel-bg-bot`, `--panel-border`, `--color-wood-border`, `--color-danger`, `--color-critical`, spacing/font tokens) that must be defined elsewhere.
- Positioning assumes the component is placed inside a positioned canvas wrapper; coordinates are absolute pixels relative to that ancestor.
- `pointer-events: none` means the bubble never captures clicks.
