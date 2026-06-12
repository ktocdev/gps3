# CSS Audit Skill

## Purpose
Systematic CSS review to ensure adherence to project standards, maintainability, and responsive design best practices.

## When to Use
- After completing UI/styling work
- Before merging feature branches with CSS changes
- When reviewing GPS2-XX branch work
- When fixing responsive or layout issues

## Project CSS Standards

### Required Practices
1. **Mobile-first** responsive design with `min-width` media queries
2. **BEM naming:** `.block__element--modifier`
3. **Global styles only** - No scoped styles in Vue components
4. **CSS Variables** for colors, spacing, and common values
5. **Logical properties** for internationalization (RTL support)
6. **Container queries** for component-responsive design

### Forbidden Practices
- ❌ Scoped styles (`<style scoped>`)
- ❌ Inline styles (use utility classes or component styles)
- ❌ Physical properties (left/right/top/bottom margins, width/height)
- ❌ Semantic HTML for styling (`<strong>`, `<b>`, `<i>`, `<em>`, `<small>`)
- ❌ Magic numbers (use CSS variables)
- ❌ `!important` (unless absolutely necessary)

## Audit Process

### 1. BEM Methodology Check

**Search for Non-BEM Classes:**
```bash
# Find potential non-BEM class names
# (This is heuristic - review results manually)
grep -r "class=\"[^\"]*[^-_]\"" src/components/
```

**Verify:**
- [ ] Block names are descriptive (`.inventory-sidebar`, `.habitat-visual`)
- [ ] Element names use double underscore (`.sidebar__header`)
- [ ] Modifier names use double dash (`.button--primary`)
- [ ] No single-dash separators within names (use double dash/underscore)
- [ ] No camelCase in CSS classes

### 2. Logical Properties Check

**Physical Properties to Replace:**
- `margin-left/right` → `margin-inline-start/end`
- `margin-top/bottom` → `margin-block-start/end`
- `padding-left/right` → `padding-inline-start/end`
- `padding-top/bottom` → `padding-block-start/end`
- `width` → `inline-size`
- `height` → `block-size`
- `max-width` → `max-inline-size`
- `max-height` → `max-block-size`
- `left/right` → `inset-inline-start/end`
- `top/bottom` → `inset-block-start/end`

**Search for Physical Properties:**
```bash
# Find margin-left/right
grep -r "margin-left\|margin-right" src/

# Find padding-left/right
grep -r "padding-left\|padding-right" src/

# Find width/height (review each - some may be intentional)
grep -r "width:\|height:" src/

# Find left/right/top/bottom positioning
grep -r "left:\|right:\|top:\|bottom:" src/
```

**Verify:**
- [ ] All directional margins use logical properties
- [ ] All directional padding uses logical properties
- [ ] Width/height use logical properties (except where intentional)
- [ ] Positioning uses logical properties

### 3. CSS Variables Check

**Search for Magic Values:**
```bash
# Find hex colors
grep -r "#[0-9a-fA-F]\{3,6\}" src/

# Find pixel values (review each)
grep -r "[0-9]\+px" src/

# Find percentage values (review each)
grep -r "[0-9]\+%" src/
```

**Verify:**
- [ ] Colors use CSS variables (defined in `src/styles/variables.css`)
- [ ] Common spacing values use CSS variables
- [ ] Font sizes use CSS variables or relative units
- [ ] No magic numbers for spacing/sizing

**Check Variables File:**
- [ ] New variables added for new colors/values
- [ ] Variables follow naming convention (`--color-`, `--spacing-`, etc.)
- [ ] Variables are documented/organized

### 4. Mobile-First Responsive Design

**Media Query Check:**
```bash
# Find max-width media queries (review - should be min-width)
grep -r "@media.*max-width" src/

# Find media queries
grep -r "@media" src/
```

**Verify:**
- [ ] Default styles target mobile (smallest screens)
- [ ] Media queries use `min-width` for larger screens
- [ ] Common breakpoint: `@media (min-width: 768px)` for desktop
- [ ] Touch device queries: `@media (hover: none) and (pointer: coarse)`
- [ ] No `max-width` queries (unless specific use case)

### 5. Container Queries

**Search for Container Queries:**
```bash
# Find container queries
grep -r "@container" src/

# Find container-type declarations
grep -r "container-type\|container-name" src/
```

**Verify:**
- [ ] Components use `@container` for internal responsiveness
- [ ] Container names are descriptive (`text-panel`, `habitat-container`)
- [ ] Container queries complement media queries (not replace)
- [ ] Proper fallbacks for browsers without container query support

### 6. Semantic HTML Avoidance for Text Styling

**Search for Semantic Tags:**
```bash
# Find semantic text tags
grep -r "<strong>\|<b>\|<i>\|<em>\|<small>" src/
```

**Verify:**
- [ ] No `<strong>`, `<b>`, `<i>`, `<em>`, `<small>` tags
- [ ] Text styling uses BEM classes (`.text-label`, `.text-label--muted`)
- [ ] Emphasis uses CSS classes, not semantic HTML

### 7. Global Styles Only

**Check for Scoped Styles:**
```bash
# Find scoped style tags
grep -r "<style scoped>" src/
```

**Verify:**
- [ ] No `<style scoped>` tags in Vue components
- [ ] All styles in global stylesheets
- [ ] Component-specific styles use unique BEM block names
- [ ] No style conflicts between components

### 8. Inline Styles Check

**Search for Inline Styles:**
```bash
# Find inline styles
grep -r "style=\"" src/
```

**Verify:**
- [ ] No inline styles (except dynamic values bound with `:style`)
- [ ] Dynamic styles use `:style` binding in Vue
- [ ] Static styles use CSS classes

### 9. Accessibility

**Verify:**
- [ ] `:focus-visible` styles for keyboard navigation
- [ ] Color contrast meets WCAG standards
- [ ] `@media (prefers-reduced-motion)` respected
- [ ] Touch targets are at least 44x44px
- [ ] Hover states have touch equivalents

### 10. CSS Organization

**Verify:**
- [ ] Styles organized by component
- [ ] No duplicate selectors
- [ ] Specificity kept low (avoid deep nesting)
- [ ] No `!important` flags (unless necessary)
- [ ] Consistent formatting and indentation

## Scoring Rubric

Rate each category 1-10:
- **BEM Methodology:** Naming conventions, consistency
- **Logical Properties:** RTL support, proper usage
- **CSS Variables:** No magic values, maintainability
- **Mobile-First:** Responsive design, media queries
- **Global Styles:** No scoped styles, proper organization
- **Accessibility:** Focus states, contrast, motion preferences

**Overall Score:** Average of all categories

**Quality Levels:**
- 9-10: Excellent - Follows all standards
- 7-8: Good - Minor improvements needed
- 5-6: Acceptable - Some refactoring recommended
- Below 5: Needs work - Significant standards violations

## Output Format

```markdown
## CSS Audit Results - [Branch Name]

**Date:** YYYY-MM-DD
**Components Reviewed:** X components
**Overall Score:** X.X/10

### Scores by Category
- BEM Methodology: X/10
- Logical Properties: X/10
- CSS Variables: X/10
- Mobile-First Design: X/10
- Global Styles: X/10
- Accessibility: X/10

### Issues Found

#### Critical (violates standards)
- Issue description with file:line reference
- Suggested fix

#### Medium (should improve)
- Issue description with file:line reference
- Suggested fix

#### Low (nice to have)
- Issue description with file:line reference

### Recommendations
- Actionable improvement suggestions

### Components Audited
- [ComponentName.vue](path/to/ComponentName.vue) - Brief notes
```

## Notes

- **Focus on standards compliance** - These are project requirements
- **Logical properties are required** - Not optional
- **BEM is required** - Not optional
- **Mobile-first is required** - Not optional
- Document **patterns** for future reference
- Be **specific** with file/line references
