---
source: src/utils/placementId.ts
source_hash: b6f7fa98e32922ebe4ca2d4423fc4366a5fe4b0569c9ed724d0331d5b692ebb2
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Placement ID Utilities

`src/utils/placementId.ts`

> A small utility module for creating and parsing placement IDs, which are unique identifiers for items placed in the habitat. Placement IDs use the format `{itemId}::{instanceId}` to allow multiple instances of the same item type to coexist in the habitat.

The module defines a private `PLACEMENT_ID_SEPARATOR` constant (`::`) and four pure helper functions that operate on placement ID strings.

- `generatePlacementId` combines an item ID with an instance ID (auto-generating one via `crypto.randomUUID()` truncated to 8 chars, prefixed `inst_`, when not provided).
- `getBaseItemId` returns the portion before the first separator, or the whole string if no separator is present.
- `getInstanceId` returns the portion after the first separator, or `null` if no separator is present.
- `isPlacementId` checks whether a string contains the separator.

All parsing uses `indexOf` on the first occurrence of the separator, so item IDs containing `::` would be split at their first occurrence. Functions are stateless and have no side effects aside from `crypto.randomUUID()` usage in generation.

## Exports

- **generatePlacementId** (function) — `generatePlacementId(itemId: string, instanceId?: string): string`: Builds a placement ID by joining itemId and instanceId with `::`. If instanceId is omitted, generates one as `inst_` plus the first 8 chars of a random UUID.
- **getBaseItemId** (function) — `getBaseItemId(placementId: string): string`: Returns the item ID portion before the first `::`; returns the input unchanged if no separator is present.
- **getInstanceId** (function) — `getInstanceId(placementId: string): string | null`: Returns the instance ID portion after the first `::`; returns null if no separator is present.
- **isPlacementId** (function) — `isPlacementId(id: string): boolean`: Returns true if the string contains the `::` separator.

## Notes

- Relies on the global `crypto.randomUUID()` API being available in the runtime environment.
- Parsing splits on the first `::` occurrence via indexOf, so item IDs containing `::` are not fully round-trip safe.
