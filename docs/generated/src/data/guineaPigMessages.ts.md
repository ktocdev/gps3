---
source: src/data/guineaPigMessages.ts
source_hash: 31fd619c0f55c75d677a1a8f0742e9cb6880c7e8917191c0cb040b7a052fa174
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Guinea Pig Reaction Messages

`src/data/guineaPigMessages.ts`

> This file provides a static catalog of contextual reaction messages for guinea pigs and helper functions to select appropriate messages based on interaction context. It centralizes all the text/emoji feedback shown when the player interacts with guinea pigs or when needs reach warning thresholds.

## Structure

The file exports two TypeScript interfaces (`ReactionMessage`, `MessageContext`) and a large frozen data object `guineaPigMessages` (`as const`) organized into top-level categories:

- **feeding** — nested by preference (`favorite`/`neutral`/`disliked`) then wellness tier, plus a `rejected` branch keyed by rejection reason.
- **play** and **socialize** — each with `success` (by wellness tier) and `rejected` (by reason) branches.
- **autonomous** — messages for self-directed eating/activity/habitat/social behavior, keyed by preference or friendship level.
- **care** — arrays for care actions (cageClean, beddingRefresh, waterRefill, hayRackFill, bowlFill).
- **needWarnings** — per-need (hunger, thirst, energy, social, hygiene, shelter, play, comfort, nails, chew) with `warning` and `critical` arrays.
- **wellness** — generic messages per tier, some with explicit `duration`.
- **companion** — companion interaction messages (play, groom, cuddle, sniff).

## Logic

`selectRandomMessage` (private) picks a random entry from a message array.

`generateReactionMessage(context)` resolves a message via a priority chain: (1) rejection reason for feed/play/socialize, (2) preference-based feeding reactions by wellness tier, (3) success reactions for play/socialize/feed, (4) fallback to generic wellness messages by tier.

`generateNeedWarning(needType, severity)` looks up the need category (cast to `any`) and returns a random message for the given severity, or `null` if the need or severity is not found.

## Exports

- **ReactionMessage** (type) — `interface ReactionMessage { message: string; emoji?: string; variant: 'positive'|'neutral'|'negative'|'warning'|'critical'; duration?: number }`: Shape of a single reaction message entry.
- **MessageContext** (type) — `interface MessageContext { interactionType: 'feed'|'play'|'socialize'|'groom'|'general'; wellnessTier: 'excellent'|'good'|'fair'|'poor'|'critical'; preferenceLevel?: ...; needLevel?: number; rejectionReason?: ... }`: Input context used to select a contextual reaction message.
- **guineaPigMessages** (constant) — `const guineaPigMessages = {...} as const`: Frozen catalog of all reaction/warning message arrays organized by category, preference, wellness tier, and rejection reason.
- **generateReactionMessage** (function) — `generateReactionMessage(context: MessageContext): ReactionMessage`: Selects a random reaction message based on rejection reason, feeding preference, interaction success, or a wellness fallback (in that priority order).
- **generateNeedWarning** (function) — `generateNeedWarning(needType: string, severity: 'warning'|'critical'): ReactionMessage | null`: Returns a random warning/critical message for the given need type, or null if the need type or severity is unknown.

## Notes

- `generateNeedWarning` casts `needWarnings` to `any` for dynamic key lookup, so invalid `needType` strings compile but return null at runtime.
- `MessageContext.interactionType` includes 'groom' and 'general', but `generateReactionMessage` has no explicit handling for them — they fall through to the generic wellness fallback.
- `needLevel` in MessageContext is defined but not used by any function here.
- The `autonomous`, `care`, and `companion` message groups are not consumed by either exported function; callers must access `guineaPigMessages` directly for those.
