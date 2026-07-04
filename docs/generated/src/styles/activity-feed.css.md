---
source: src/styles/activity-feed.css
source_hash: 6eb46cbc125a26dc3424322c685b45fc09ae1c054892a274e5adcd842aed96f4
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Activity Feed Styles

`src/styles/activity-feed.css`

> CSS stylesheet defining the visual presentation of an activity feed message list, including the empty state, message container, per-category message variants, and inline elements (emoji, text, timestamp). It exists to style components rendering a scrollable feed of categorized game events.

Uses BEM-style class naming under the `activity-feed` block. `.activity-feed__empty` centers muted placeholder text filling the full block size. `.activity-feed__messages` is a vertical flex column with small gaps. `.activity-feed__message` is a flex row with a left (inline-start) accent border, secondary background, rounded corners, and small padding.

### Category variants
Modifier classes override the inline-start border color per message category: `--player_action` (primary), `--guinea_pig_reaction` (secondary), `--autonomous_behavior` (info), `--environmental` (warning), and `--achievement` (pink border plus a pink-50 background).

### Inline elements
`.activity-feed__emoji` and `.activity-feed__time` do not shrink; `.activity-feed__text` flexes to fill remaining space. Timestamp uses muted color. All values reference design-token CSS custom properties (colors, spacing, radii, font sizes).

## Exports

- **.activity-feed__empty** (style) — `.activity-feed__empty`: Centered, muted empty-state message filling full height.
- **.activity-feed__messages** (style) — `.activity-feed__messages`: Vertical flex container for message items with small gap.
- **.activity-feed__message** (style) — `.activity-feed__message`: Individual message row with accent inline-start border and secondary background.
- **.activity-feed__message--player_action** (style) — `.activity-feed__message--player_action`: Primary-colored border variant.
- **.activity-feed__message--guinea_pig_reaction** (style) — `.activity-feed__message--guinea_pig_reaction`: Secondary-colored border variant.
- **.activity-feed__message--autonomous_behavior** (style) — `.activity-feed__message--autonomous_behavior`: Info-colored border variant.
- **.activity-feed__message--environmental** (style) — `.activity-feed__message--environmental`: Warning-colored border variant.
- **.activity-feed__message--achievement** (style) — `.activity-feed__message--achievement`: Pink border with pink-50 background variant.
- **.activity-feed__emoji** (style) — `.activity-feed__emoji`: Non-shrinking emoji element.
- **.activity-feed__text** (style) — `.activity-feed__text`: Flexible message text using primary text color.
- **.activity-feed__time** (style) — `.activity-feed__time`: Non-shrinking muted timestamp.

## Notes

- Relies on CSS custom properties (design tokens) such as --color-primary, --spacing-xs, --radius-sm, --font-size-xs, --color-pink-500, etc., which must be defined globally elsewhere.
- Category modifier names use snake_case (e.g. player_action), implying category values are passed through directly from data.
