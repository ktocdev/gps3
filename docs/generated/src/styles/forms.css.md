---
source: src/styles/forms.css
source_hash: 373d1428e2f5e7699343b0ebf55160b96c0de3a74b1ece07074f68e6fdd1863c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Form Component Styles

`src/styles/forms.css`

> A global CSS stylesheet defining reusable form-related component classes for the gps3 project. It provides consistent styling for form groups, inputs, labels, filter controls, and dividers using CSS custom properties (design tokens) for spacing, colors, typography, and other visual attributes.

This stylesheet defines a set of BEM-ish and utility CSS classes for building forms. Styling relies entirely on CSS custom properties (e.g. `--space-*`, `--color-*`, `--font-size-*`, `--radius-*`) presumably defined elsewhere in the project's design token system.

### Key class groups
- **`.form-group` / `.form-group--action`**: vertical flex containers with gap and bottom margin for grouping a label and input.
- **`.input` / `.input:focus` / `.input--sm`**: base input styling with padding, border, radius, and a pink focus ring (`rgba(236, 72, 153, 0.1)`); the `--sm` modifier reduces size and sets a min inline size of 140px.
- **`.search-input`, `.filter-controls`**: layout containers using flex column.
- **Inline vs block fields**: `.form-field-inline` lays out label + input horizontally (with pointer cursor), while `.form-field-block` stacks them vertically.
- **`.form-field` naming convention**: `.form-field`, `.form-field__label`, `.form-field__input`, and `.form-field__input--readonly` provide an alternative BEM-style set, including a read-only variant with a distinct background.
- **`.form-label`**: standalone label styling.
- **`.divider`**: a horizontal divider using a bottom border and vertical margin.

The file is purely declarative CSS with no logic; there are overlapping/redundant conventions (`.form-group label`, `.form-label`, `.form-field__label`) reflecting multiple naming approaches coexisting.

## Exports

- **.form-group** (style) — `.form-group / .form-group--action`: Vertical flex containers for grouping form label and controls with gap and bottom margin.
- **.input** (style) — `.input, .input:focus, .input--sm`: Base input field styling with border, radius, and pink focus ring; `--sm` modifier for smaller compact inputs.
- **.form-field-inline** (style) — `.form-field-inline`: Horizontal label+input layout with pointer cursor; nested `.input` has margin reset.
- **.form-field-block** (style) — `.form-field-block`: Vertical stacked field layout (label above input).
- **.form-field** (style) — `.form-field, .form-field__label, .form-field__input, .form-field__input--readonly`: BEM-style field convention including label, input, and read-only input variant.
- **.form-label** (style) — `.form-label`: Standalone label styling with medium weight and small font size.
- **.search-input** (style) — `.search-input`: Flex column container for search input layout.
- **.filter-controls** (style) — `.filter-controls`: Flex column container for filter controls with gap and bottom margin.
- **.divider** (style) — `.divider`: Horizontal divider using bottom border and vertical margin.

## Notes

- Relies on CSS custom properties (design tokens like --space-*, --color-*, --font-size-*, --radius-*, --transition-fast) defined elsewhere; class rendering breaks if those tokens are missing.
- Inconsistent token references: uses both `--color-border-medium`/`--color-border-primary`, `--color-bg-primary`/`--color-background-secondary`, and `--color-text`/`--color-text-primary`, suggesting mixed naming conventions across the codebase.
- The focus ring color is a hardcoded pink rgba value rather than a token.
- Multiple overlapping label conventions coexist (`.form-group label`, `.form-label`, `.form-field__label`).
