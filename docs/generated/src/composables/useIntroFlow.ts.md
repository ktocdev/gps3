---
source: src/composables/useIntroFlow.ts
source_hash: b6dd8fe30c9845d415a2f8481bd12dae8bea59e9519888db3bc2a172359d9039
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useIntroFlow composable

`src/composables/useIntroFlow.ts`

> A Vue composable that tracks whether the intro splash has already been shown during the current page load, ensuring it plays only once per session and not again on in-app navigation.

This file defines a module-scoped reactive `introSeen` ref (initialized to `false`) that lives outside the composable function, so its state is shared across all callers and persists for the lifetime of the page load. The `useIntroFlow` function returns the shared `introSeen` ref along with a `markIntroSeen` setter that flips it to `true`. Because the state is module-scoped rather than created per-call, the intro splash plays once (before the pet store picker) and does not replay when navigating away and back. A full page reload re-imports the module and resets `introSeen` to `false`.

## Exports

- **useIntroFlow** (composable) — `useIntroFlow(): { introSeen: Ref<boolean>, markIntroSeen: () => void }`: Returns the shared reactive `introSeen` boolean ref and a `markIntroSeen` function that sets `introSeen.value` to `true`.

## Internal dependencies

- `vue`

## Notes

- `introSeen` is module-scoped (singleton), so all consumers share the same state and it survives component unmount/remount; only a full page reload resets it.
