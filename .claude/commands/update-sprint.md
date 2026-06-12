---
description: Extract new items from todos.md, add to current sprint, and update todos.md
---

# Update Sprint Command

This command automates the process of:
1. Reading new items from `todos.md`
2. Organizing and prioritizing them (HIGH/MEDIUM/LOW, Future)
3. Adding them to the current sprint document
4. Updating `todos.md` with current sprint/branch info

## Instructions

You are helping the user update the current sprint with new todos. Follow these steps:

### Step 1: Read Current State
1. Find the current sprint document: `docs/SPRINT-*.md` (not in archive/)
2. Get current git branch: `git branch --show-current`
3. Read `todos.md` to find new items (items listed after the "Quick Reference" section)

### Step 2: Analyze and Categorize New Items
Organize new todos by priority:

**HIGH Priority** - Critical bugs, blockers, or major UX issues:
- Bugs that break core functionality
- UI elements not displaying correctly
- Balance issues making the game unplayable
- Data loss or corruption issues

**MEDIUM Priority** - Important improvements and features:
- UX enhancements
- Missing features that were expected
- Non-critical bugs
- Balance tweaks

**LOW Priority** - Nice to have improvements:
- Minor polish items
- Small UX improvements
- Code cleanup

**FUTURE** - Ideas for later sprints:
- New features requiring significant work
- Special effects and animations
- Major system changes
- Ideas that need more planning

### Step 3: Add Items to Current Sprint
Add new items to the current sprint document under appropriate sections:

**For HIGH priority bugs:**
Add to the "🔥 **Critical Bugs & Blockers**" section (create if doesn't exist)

**For MEDIUM/HIGH tasks:**
Add to the "🎯 **High Priority Tasks**" or create a "📋 **Medium Priority Tasks**" section

**For FUTURE items:**
Add to a "🔮 **Future Sprint Items**" section at the bottom

**Format for each item:**
```markdown
#### {Task Name}
**Priority:** {HIGH/MEDIUM/LOW}
**Status:** 📋 Not Started
**Category:** {Bug Fix/Feature/UX/Balance/etc.}

**Description:** {Clear description of the issue/feature}

**Implementation Notes:**
- {Note 1}
- {Note 2}
```

### Step 4: Update Progress Section
Update the sprint document's **Progress** section at the top to reflect new items added.

### Step 5: Update todos.md
Replace the content of `todos.md` with:

```markdown
# GPS2 Todos - Active Sprint

See [docs/SPRINT-{date}.md](docs/SPRINT-{date}.md) for full sprint details.

## Quick Reference

All items have been organized and prioritized in the active sprint document.

**Active Sprint:** {Month DD, YYYY}
**Branch:** {current-branch}

---

## Adding New Todos

When you have new todo items:
1. Add them to this file below this section
2. Run `/update-sprint` to organize and move them to the current sprint

---

{Leave this section empty for future new items}
```

### Step 6: Confirm with User
Provide a summary showing:
- Number of HIGH priority items added
- Number of MEDIUM priority items added
- Number of LOW priority items added
- Number of FUTURE items added
- Updated sprint document path
- Updated todos.md confirmation

## Priority Classification Examples

**HIGH Priority Examples:**
- "Guinea pig needs not displaying correctly"
- "Game crashes when clicking X"
- "Thirst is decaying too fast, guinea pigs can't keep up"
- "Bond progress bar not updating"
- "Critical data not saving"

**MEDIUM Priority Examples:**
- "Add hand-feed confirmation button"
- "Prevent duplicate habitat items"
- "Improve emoji drag/drop UX"
- "Add tooltip for disabled items"

**LOW Priority Examples:**
- "Polish animation timing"
- "Adjust spacing on X panel"
- "Code cleanup in Y file"

**FUTURE Examples:**
- "Add special effects when eating treats (glow, transform, rainbow)"
- "Implement new animation system"
- "Add multiplayer features"
- "Create advanced AI behaviors"

## Notes

- Be intelligent about categorization - read the full context of each item
- Group related items together in the sprint document
- Use clear, descriptive task names
- Add category labels (Bug Fix, Feature, UX, Balance, Polish, etc.)
- Maintain existing sprint structure and formatting
- Don't delete any existing completed tasks from the sprint

## Example Usage

**User types:** `/update-sprint`

**Assistant:**
1. Reads `todos.md` and finds 8 new items
2. Categorizes them:
   - HIGH: 3 items (nails need bug, thirst decay, bond progress bar)
   - MEDIUM: 3 items (hand-feed confirm, duplicate prevention, emoji selection)
   - FUTURE: 2 items (special treat effects, new animations)
3. Adds items to `docs/SPRINT-2025-11-03.md` in appropriate sections
4. Updates `todos.md` with current sprint info
5. Reports summary to user

**Assistant response:**
```
✅ Sprint updated with new todos from todos.md

Added to SPRINT-2025-11-03.md:
- 🔥 3 HIGH priority items (Critical Bugs & Blockers section)
- 📋 3 MEDIUM priority items (Medium Priority Tasks section)
- 🔮 2 FUTURE items (Future Sprint Items section)

Updated todos.md with current sprint info (November 3, 2025 | GPS2-43)

Files modified:
- docs/SPRINT-2025-11-03.md
- todos.md
```
