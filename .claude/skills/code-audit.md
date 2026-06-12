# Code Audit Skill

## Purpose
Systematic code review process to ensure quality, maintainability, and adherence to project standards.

## When to Use
- After completing a feature branch
- Before merging major changes
- When reviewing GPS2-XX branch work
- Periodically for code health checks

## Audit Process

### 1. TypeScript & Code Quality

**Run Build Check:**
```bash
npm run build
```

**Checklist:**
- [ ] Build passes without TypeScript errors
- [ ] No implicit `any` types
- [ ] No unused imports or variables
- [ ] No unused functions or computed properties
- [ ] Explicit return types on complex functions
- [ ] Proper type annotations on parameters
- [ ] No type assertions (`as`) unless necessary

**Search for Issues:**
```bash
# Find TODO/FIXME comments
grep -r "TODO\|FIXME" src/

# Find console.log statements
grep -r "console.log" src/

# Find magic numbers (review each case)
grep -rE "[^a-zA-Z0-9_](100|200|300|500|1000)[^0-9]" src/
```

### 2. Code Structure & Patterns

**Vue Components:**
- [ ] Using `<script setup lang="ts">` syntax
- [ ] Composition API patterns (no Options API)
- [ ] Props and emits properly typed
- [ ] Computed properties have correct dependencies
- [ ] Reactive updates work correctly
- [ ] Component file names are PascalCase

**Functions & Logic:**
- [ ] Functions are focused and single-purpose
- [ ] Complex logic is extracted to composables
- [ ] Magic numbers replaced with named constants
- [ ] Error handling present where needed
- [ ] Edge cases considered

**State Management:**
- [ ] Pinia stores follow project patterns
- [ ] State is properly reactive
- [ ] Actions are properly typed
- [ ] Getters have correct return types
- [ ] Persistence configured correctly (if needed)

### 3. Memory & Performance

**Check for Leaks:**
- [ ] `setInterval`/`setTimeout` properly cleaned up
- [ ] Event listeners removed in cleanup
- [ ] Watchers stopped when component unmounts
- [ ] Large data structures properly managed
- [ ] No unnecessary re-renders

**Search Patterns:**
```bash
# Find setInterval/setTimeout
grep -r "setInterval\|setTimeout" src/

# Find event listeners
grep -r "addEventListener" src/
```

### 4. Documentation & Comments

**Review:**
- [ ] Complex logic has explanatory comments
- [ ] Functions have JSDoc if non-obvious
- [ ] TODOs are tracked or resolved
- [ ] File headers describe purpose (if complex)
- [ ] No commented-out code (unless temporary)

### 5. Testing Considerations

**Manual Testing:**
- [ ] Feature works as expected
- [ ] Edge cases tested
- [ ] Error states handled gracefully
- [ ] Responsive behavior verified
- [ ] Touch device functionality tested (if applicable)

### 6. Organization & Files

**File Structure:**
- [ ] Files in correct directories (views/, components/, stores/, etc.)
- [ ] Related files grouped logically
- [ ] No duplicate code across components
- [ ] Reusable logic extracted to composables
- [ ] Utilities in utils/ directory

**Import Statements:**
- [ ] Imports are clean and organized
- [ ] No circular dependencies
- [ ] Relative imports use correct paths
- [ ] Unused imports removed

## Scoring Rubric

Rate each category 1-10:
- **TypeScript Quality:** Types, strictness, no errors
- **Code Structure:** Organization, patterns, reusability
- **Memory/Performance:** No leaks, efficient rendering
- **Documentation:** Comments, clarity, maintainability
- **Testing:** Functionality, edge cases, UX

**Overall Score:** Average of all categories

**Quality Levels:**
- 9-10: Excellent - Production ready
- 7-8: Good - Minor improvements needed
- 5-6: Acceptable - Moderate refactoring recommended
- Below 5: Needs work - Significant issues to address

## Output Format

```markdown
## Code Audit Results - [Branch Name]

**Date:** YYYY-MM-DD
**Files Reviewed:** X files
**Overall Score:** X.X/10

### Scores by Category
- TypeScript Quality: X/10
- Code Structure: X/10
- Memory/Performance: X/10
- Documentation: X/10
- Testing: X/10

### Issues Found

#### Critical (must fix)
- Issue description with file:line reference

#### Medium (should fix)
- Issue description with file:line reference

#### Low (nice to have)
- Issue description with file:line reference

### Recommendations
- Actionable improvement suggestions

### Files Audited
- [filename.ts](path/to/filename.ts) - Brief notes
```

## Notes

- Focus on **actual issues** not nitpicks
- Consider **project context** (game dev vs. enterprise)
- Prioritize **functionality** over perfection
- Document **patterns** for future reference
- Be **constructive** in feedback
