---
source: src/utils/messageGenerator.ts
source_hash: a2fac06a4deb15ec14ce8060cec23843b8ec79de3992ac6c160e2f5fc11b467b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Message Generator

`src/utils/messageGenerator.ts`

> This file provides a static utility class and convenience functions for generating randomized, human-readable text messages (with emojis) for a guinea pig care simulation game. It centralizes message templates by category and produces contextual, preference-aware, and action-specific messages used throughout the game's activity/logging system.

The file defines a `MessageTemplate` interface (`message`, optional `emoji`, optional `weight`) and several arrays of hardcoded templates for player actions, guinea pig reactions, autonomous behaviors, environmental events, and achievements. These are collected into `messageTemplates`, a `Record<MessageCategory, MessageTemplate[]>` where `system` is intentionally empty.

### Selection logic
`MessageGenerator.getRandomTemplate` picks a template randomly, supporting weight-based selection when any template defines a `weight` (defaults to 1), otherwise uniform random. Empty arrays return a fallback `"Something happened"`.

### Generation methods
The class exposes many static generators returning `{ message, emoji }`:
- Category generators (`generatePlayerAction`, `generateGuineaPigReaction`, `generateAutonomousBehavior`, `generateEnvironmentalEvent`, `generateAchievement`) either build a custom message from passed args (with intensity/severity modifiers) or fall back to a random template.
- `generatePreferenceReaction` maps a preference level (love/like/neutral/dislike/hate) to reaction phrasing and emoji, optionally prefixing a discovery marker.
- `generateContextualMessage` dispatches by `context.category` to the appropriate generator.
- Action-specific generators (`generateFeedMessage`, `generateWaterMessage`, `generateCleanMessage`, `generatePlayMessage`, `generateChewToyMessage`, `generateTrimNailsMessage`, `generateShelterMessage`, `generateSootheToSleepMessage`, `generateSocializeMessage`, `generateRearrangeCageMessage`, `generateProvideBeddingMessage`) build player-interaction messages, several branching on favorite/disliked/rejected/success flags.
- System 19 autonomous generators (`generateAutonomousEatMessage`, `...EatHay`, `...Drink`, `...Sleep`, `...Groom`, `...Chew`, `...Play`, `...Shelter`, `...Popcorn`, `...Zoomies`, `...Watch`, `...Hide`, `...Poop`) produce self-directed behavior messages, some accepting optional locations/item names.

### Helpers
Private helpers `getArticle` (a/an), `formatFoodForPiece` ("a X piece"), and `cleanFoodName` (strips a trailing "(Bag)" suffix) support food message formatting. Food type detection distinguishes pellets/hay (no "piece" format) from fruits/vegetables.

### Extensibility
`getTemplatesForCategory` and `addTemplate` allow reading and appending templates at runtime.

Seven convenience functions re-export a subset of static methods for direct import.

## Exports

- **MessageGenerator** (function) — `class MessageGenerator (static methods only)`: Static utility class of message-generation methods. Each generator returns `{ message: string; emoji?: string }` (some return required `emoji`). Includes category generators, preference/contextual generators, player action-specific generators, and System 19 autonomous behavior generators, plus `getTemplatesForCategory` and `addTemplate` for extensibility.
- **generatePlayerAction** (function) — `(action?: string, item?: string, customEmoji?: string) => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generatePlayerAction.
- **generateGuineaPigReaction** (function) — `(reaction?: string, intensity?: 'mild'|'moderate'|'strong') => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generateGuineaPigReaction.
- **generateAutonomousBehavior** (function) — `(behavior?: string) => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generateAutonomousBehavior.
- **generateEnvironmentalEvent** (function) — `(event?: string, severity?: 'low'|'medium'|'high') => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generateEnvironmentalEvent.
- **generateAchievement** (function) — `(achievementName: string, description?: string) => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generateAchievement.
- **generatePreferenceReaction** (function) — `(item: string, preference: 'love'|'like'|'neutral'|'dislike'|'hate', isNewDiscovery?: boolean) => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generatePreferenceReaction.
- **generateContextualMessage** (function) — `(context: { category: MessageCategory; action?: string; item?: string; preference?: string; intensity?: string; isFirstTime?: boolean }) => { message: string; emoji?: string }`: Convenience re-export of MessageGenerator.generateContextualMessage. Dispatches to the category-appropriate generator.

## Internal dependencies

- `../stores/loggingStore (MessageCategory type)`

## Notes

- The convenience re-exports assign unbound static methods to constants; since these methods reference `this` (e.g. `this.getRandomTemplate`, `this.cleanFoodName`), `this` still resolves to the `MessageGenerator` class when called via the exported const because they remain bound to the class object reference — but calling them destructured/detached would still work only because `this` is the class. Be cautious if reassigning.
- `messageTemplates.system` is intentionally empty; generating a system-category message via `getRandomTemplate` would return the fallback, but `generateContextualMessage` has no `system` case and returns the default "Something interesting happened".
- `addTemplate` mutates the shared module-level `messageTemplates` object, affecting all consumers globally for the session.
- Food formatting relies on string matching: `foodType.toLowerCase().includes('pellet'|'hay')` determines piece vs. non-piece phrasing, and `cleanFoodName` only strips a trailing "(Bag)" suffix.
- `generateFeedMessage`/`generateAutonomousEatMessage` look up emoji by exact `foodType` key in `foodEmojis`; unmatched types fall back to '🍽️'.
- All randomness uses `Math.random()`, so output is non-deterministic — relevant for testing.
