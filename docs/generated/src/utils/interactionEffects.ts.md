---
source: src/utils/interactionEffects.ts
source_hash: ae97a2aa702a00e9dc32d9d14971b3071967e801a553f24c1437c842d0a29c5a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Interaction Effects

`src/utils/interactionEffects.ts`

> Defines the static configuration data for player-to-guinea-pig interactions in System 20, mapping each interaction type to its need impacts, friendship gain, and cooldown. Also provides lookup helpers for effect data, display names, and emojis used in the activity feed and UI.

The file exports an `InteractionEffect` interface describing the shape of each interaction's data: `needsImpact` (a partial record of `NeedType` to numeric deltas), `friendshipGain`, `cooldownTime` in seconds, and an optional `duration`.

The core data is `interactionEffects`, a `Map<string, InteractionEffect>` keyed by interaction type string. Entries are grouped into Basic Interactions (`pet`, `hold`, `hand-feed`, `gentle-wipe`, `clip-nails`), Communication (`talk-to`, `sing-to`, `call-name`), and Play (`peek-a-boo`, `wave-hand`, `show-toy`). Some interactions apply negative need impacts (e.g. `clip-nails` reduces comfort) or use long cooldowns to prevent spam.

Three helper functions provide lookups: `getInteractionEffect` retrieves the effect object from the Map (or `undefined`), while `getInteractionName` and `getInteractionEmoji` use inline local `Record` objects to return a human-readable label or emoji, falling back to the raw type string or a generic 🤝 emoji respectively.

## Exports

- **InteractionEffect** (type) — `interface InteractionEffect { needsImpact: Partial<Record<NeedType, number>>; friendshipGain: number; cooldownTime: number; duration?: number }`: Shape of a single interaction's effect data: per-need impacts, friendship gain, cooldown in seconds, and optional animation duration.
- **interactionEffects** (constant) — `const interactionEffects: Map<string, InteractionEffect>`: Map of interaction type keys to their effect configuration, covering basic, communication, and play interactions.
- **getInteractionEffect** (function) — `(interactionType: string) => InteractionEffect | undefined`: Returns the effect data for a given interaction type, or undefined if not found.
- **getInteractionName** (function) — `(interactionType: string) => string`: Returns a friendly display name for the interaction, falling back to the raw type string.
- **getInteractionEmoji** (function) — `(interactionType: string) => string`: Returns an emoji for the interaction type, defaulting to 🤝 if unmapped.

## Internal dependencies

- `../stores/guineaPigStore`

## Notes

- The name and emoji maps are hardcoded inline and must be kept in sync with the keys in `interactionEffects`.
- `duration` is defined in the interface but marked for future use and is not set on any current entry.
