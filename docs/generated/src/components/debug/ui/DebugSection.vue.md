---
source: src/components/debug/ui/DebugSection.vue
source_hash: 94744fe5a2a80c39d4b33ef53a6a7eed3da42928b57784e10991a55ba9aa83d0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugSection

`src/components/debug/ui/DebugSection.vue`

> A lightweight presentational wrapper component used in the debug UI to group related content under an optional titled section.

This is a minimal Vue 3 SFC using `<script setup>`. It renders a container `<div>` with class `dbg-section`. When the optional `title` prop is provided, an `<h4>` with class `dbg-section__title` is rendered above the default slot content. The default `<slot />` renders any child content passed into the component. There is no reactive state, no emits, and no logic beyond conditional rendering of the title.

## Exports

- **DebugSection** (component) — `<DebugSection :title?="string">...</DebugSection>`: Debug UI section wrapper. Props: `title?: string` (optional heading shown as an h4). Exposes a default slot for section content. No emits.
