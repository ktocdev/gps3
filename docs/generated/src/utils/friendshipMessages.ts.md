---
source: src/utils/friendshipMessages.ts
source_hash: ce67f3a689dcfd48d6191a2dab1d34ccdb498353b4324f776ba07544c2391a7c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Friendship Messages Utilities

`src/utils/friendshipMessages.ts`

> Provides shared helper functions that translate numeric bonding/friendship percentage values into qualitative, emoji-prefixed human-readable status messages. Used to describe companion-to-companion bonds and player-to-guinea-pig relationships throughout the app.

The file defines an internal `FriendshipThreshold` interface (`min` number and `message` string) and two exported functions.

`getBondStrengthMessage(bondingLevel)` maps a companion bond percentage to one of nine descriptive messages using a descending list of thresholds (95 down to 0). It iterates the thresholds and returns the first whose `min` the value meets or exceeds; a fallback returns the last (lowest) message.

`getPlayerFriendshipMessage(friendship)` works identically but with a ten-entry threshold list (90 down to 0) and player-relationship-oriented wording.

Both functions are pure, stateless, and depend only on their numeric input.

## Exports

- **getBondStrengthMessage** (function) — `(bondingLevel: number): string`: Returns a qualitative, emoji-prefixed message describing companion-to-companion bond strength based on a percentage, using thresholds at 95/85/71/60/45/31/20/10/0.
- **getPlayerFriendshipMessage** (function) — `(friendship: number): string`: Returns a qualitative, emoji-prefixed message describing a player-to-guinea-pig friendship based on a percentage, using thresholds at 90/80/70/60/50/40/30/20/10/0.

## Notes

- The `FriendshipThreshold` interface is internal and not exported.
- Threshold lists must remain sorted in descending order of `min` for the first-match iteration to work correctly.
- The two functions use different threshold breakpoints (bond: 95/85/71... vs friendship: multiples of 10).
