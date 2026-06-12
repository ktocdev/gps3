---
description: Archive current sprint document and create new sprint with planning questions
---

# New Sprint Command

This command helps you roll over to a new sprint by:
1. Archiving the current SPRINT document
2. Creating a new sprint document with today's date
3. Moving incomplete todos from the old sprint
4. Asking planning questions for the upcoming week

## Instructions

You are helping the user start a new sprint. Follow these steps:

### Step 1: Find Current Sprint
Look for the current sprint document matching pattern `docs/SPRINT-*.md` (not in archive/).

### Step 2: Ask Planning Questions
Before creating the new sprint, ask the user these questions:

1. **What phase/systems are you currently working on?**
   - Example: "Phase 4.5 Polish & Testing" or "Phase 5 System 22"

2. **What major accomplishments were completed in the last sprint?**
   - Ask for 2-5 bullet points of what was finished

3. **What are the high priority tasks for this sprint?**
   - Ask for the top 3-5 tasks to focus on

4. **Are there any critical bugs or blockers?**
   - Ask if there are urgent issues that need addressing

5. **Any specific testing, cleanup, or documentation tasks?**
   - Ask about manual testing, balance adjustments, or doc updates

### Step 3: Archive Current Sprint
Once you have the answers, archive the current sprint:
```bash
git mv docs/SPRINT-YYYY-MM-DD.md docs/archive/SPRINT-YYYY-MM-DD.md
```

### Step 4: Create New Sprint Document
Create a new sprint document at `docs/SPRINT-{TODAY}.md` following this structure:

```markdown
# GPS2 Sprint - {Month DD, YYYY}

**Started:** {Month DD, YYYY}
**Status:** {Current Phase/Status from Question 1}
**Branch:** {Current branch from git status}
**Previous Sprint:** [SPRINT-{old-date}.md](archive/SPRINT-{old-date}.md)

---

## 🎉 **Last Sprint Accomplishments**

{Insert accomplishments from Question 2}

---

## 🔥 **Critical Bugs & Blockers**

{Insert critical items from Question 4, or "None" if empty}

---

## 🎯 **High Priority Tasks**

{Insert high priority tasks from Question 3}

### {Task Category 1}

#### {Task Name} 📋 **Planned**
**Priority:** {HIGH/MEDIUM/LOW}
**Status:** 📋 Not Started

**Goal:** {Brief description}

**Implementation:**
- [ ] {Subtask 1}
- [ ] {Subtask 2}

**Files to Modify:**
- `{file path}` - {What to change}

---

### {Task Category 2}

{Repeat structure}

---

## 🔍 **Testing & Documentation**

{Insert testing/cleanup tasks from Question 5}

---

## 📋 **Incomplete Todos from Last Sprint**

{Copy any incomplete/in-progress tasks from previous sprint}

---

## 📝 **Sprint Completion Criteria**

Before closing this sprint:
- [ ] {Criteria 1}
- [ ] {Criteria 2}
- [ ] {Criteria 3}

---

## 🚀 **Commands**

**Development:**
- `npm run dev` - Start development server
- `npm run build` - Production build (run before commits)
- `npm run preview` - Preview production build

**Git:**
- Current branch: `{branch}`
- Main branch: `main`

---

## 📚 **Documentation Links**

- [Project Plan](PROJECT_PLAN.md)
- [Development Phases](DEVELOPMENT_PHASES.md)
- [System Integration](SYSTEM_INTEGRATION.md)
- [Previous Sprint](archive/SPRINT-{old-date}.md)
```

### Step 5: Parse Incomplete Todos
Read the old sprint document and extract:
- Any tasks marked as 📋 **Planned** or 🚧 **In Progress**
- Critical bugs not yet resolved
- Testing items not completed

Copy these to the "Incomplete Todos from Last Sprint" section.

### Step 6: Confirm with User
Show the user a summary of what was created and ask if they want to make any adjustments.

## Notes

- Use emoji status indicators: 📋 **Planned**, 🚧 **In Progress**, ✅ **Complete**, 🔥 **Critical**
- Group tasks by category (Bug Fixes, Features, Testing, Documentation, etc.)
- Include file paths and specific implementation notes
- Add clear completion criteria
- Link to previous sprint in archive

## Example Usage

User types: `/new-sprint`

Assistant responds:
```
I'll help you start a new sprint! Let me ask you a few planning questions first:

1. What phase/systems are you currently working on?
2. What major accomplishments were completed in the last sprint?
3. What are the high priority tasks for this sprint?
4. Are there any critical bugs or blockers?
5. Any specific testing, cleanup, or documentation tasks?
```

After gathering answers, the assistant:
1. Archives `docs/SPRINT-2025-10-27.md` → `docs/archive/SPRINT-2025-10-27.md`
2. Creates `docs/SPRINT-2025-11-03.md` with the new content
3. Migrates incomplete todos
4. Confirms completion with user
