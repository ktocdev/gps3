# GPS2 Project Guidelines

## Quick Reference

**File Formatting:** Always end files with newline
**Vue:** `<script setup lang="ts">`, composition API, reusable components
**CSS:** Mobile-first, BEM methodology, logical properties, global styles only
**State:** Pinia + composables, persistence enabled
**Build:** `npm run build` before commits

## Code Standards

### Vue Components
- `<script setup lang="ts">` syntax required
- Composition API patterns only
- Create reusable components in `src/components/`
- Consistent prop interfaces and emit patterns

### TypeScript & File Structure
- Strict TypeScript settings, explicit types for readability
- Views: `src/views/` | Components: `src/components/` | Router: `src/router/index.ts`
- PascalCase for component file names

## Organization Strategy

**Principle:** Organize by function, not file type. Start simple, reorganize at 8-10+ files.

### Folder Structure
```
src/
├── components/     → /basic/, /game/, /layout/, /debug/
├── stores/         → /core/, /systems/, /ui/
└── composables/    → /game/, /ui/, /data/
```

**Reorganization:** File threshold → Function-based grouping → Update imports → Document changes

## CSS Standards

### Core Methodology
- **Mobile-first** responsive design with `min-width` media queries
- **BEM naming:** `.block__element--modifier`
- **Global styles only** - No scoped styles
- **CSS Variables** in `src/styles/variables.css`

### Logical Properties (Required)
Replace physical properties for RTL support:
- `margin-block-start/end` not `margin-top/bottom`
- `margin-inline-start/end` not `margin-left/right`
- `inline-size` not `width`, `block-size` not `height`
- `inset-inline/block-start/end` not `top/right/bottom/left`

### Text Styling
**Avoid semantic HTML:** No `<strong>`, `<b>`, `<i>`, `<em>`, `<small>`
**Use BEM classes:** `.text-label`, `.text-label--muted`, `.text-label--accent`

### Container Queries
- Use `@container` for component-responsive design
- Descriptive names: `text-panel`, `habitat-container`, `layout-region`

## Development

### Commands
- `npm run dev` - Development server
- `npm run build` - Production build + TypeScript check (run before commits)
- `npm run preview` - Preview production build

### Documentation Navigation
**Start:** PROJECT_PLAN.md → DEVELOPMENT_PHASES.md → SYSTEM_INTEGRATION.md
**Implementation:** docs/systems/phase{1-5}/ (Foundation → Core → World → Interactions → Polish)
**Game Design:** docs/game-design/ (wellness, happiness, preferences, habitat, activity-feed)
**Updates:** Phase-specific files, maintain cross-references, update PROJECT_PLAN.md links