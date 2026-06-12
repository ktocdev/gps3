# Unified Layout & Component Framework - System 2

**Phase 1: Foundation & Infrastructure**

## Overview
Combined development approach for Systems 2-4 with region-based construction, providing CSS foundation, component library, and responsive design system.

## CSS Styling Foundation

### Core Methodology
- **BEM methodology** for consistent class naming
- **CSS custom properties** in `src/styles/variables.css`
- **Theming system** with dark mode and light mode support
- **Mobile-first breakpoint strategy** with landscape mobile (768px+) foundation
- **Global CSS only** (no scoped styles) for consistency and reusability
- **Logical CSS Properties** for internationalization and RTL language support:
  - Use `margin-block-start/end` instead of `margin-top/bottom`
  - Use `margin-inline-start/end` instead of `margin-left/right`
  - Use `inline-size` instead of `width`, `block-size` instead of `height`
  - Use `inset-inline-start/end` instead of `left/right`
  - Use logical border radius properties for consistent corner rounding
- **Container Queries** for component-specific responsive design
- **Responsive layout regions** using CSS Grid/Flexbox with logical properties

## Adaptive Navigation System

### Navigation Modes
- **Desktop/Tablet:** Full bottom navigation bar with complete controls
- **Mobile Landscape (height < 500px):** Bottom nav collapses into Floating Action Button (FAB)

### Mobile Layout (Planned)
- **Three-column layout:** Fixed top nav (50-60px), left sidebar (15%), main habitat (60-65%), right TextInfoPanel (25-30%)
- **FAB positioning:** Bottom-right corner with expandable menu (radial/slide-up/overlay options)
- **Container-query integration:** Components adapt to allocated container space
- **Primary FAB actions:** Most common interactions (guinea pig interaction, urgent needs)

## Region-Based Development Strategy

1. **Step 1:** Responsive layout framework foundation with OrientationModal
2. **Step 2:** Navigation regions (top nav, adaptive bottom nav/FAB)
3. **Step 3:** Core content regions (habitat grid, info panels, activity feed)
4. **Step 4:** Iterative component development as regions are populated

## Component Library Status

### ✅ Implemented Components

| Component | Type | Location | Description |
|-----------|------|----------|-------------|
| **Button** | Basic Form | `src/components/basic/Button.vue` | Variants: primary, secondary, tertiary, danger, warning. Sizes: sm, md, lg |
| **Select** | Basic Form | `src/components/basic/Select.vue` | Dropdown with TypeScript support and form integration |
| **TabContainer** | Layout | `src/components/layout/TabContainer.vue` | ARIA-compliant tabs with icons and badges |
| **ActivityFeed** | Game | `src/components/game/ActivityFeed.vue` | Real-time activity stream with controls |
| **GameController Debug** | Debug | `src/components/debug/GameController.vue` | Game controller testing interface |
| **SystemMonitor Debug** | Debug | `src/components/debug/SystemMonitor.vue` | Error tracking and system monitoring |
| **LoggingSystem Debug** | Debug | `src/components/debug/LoggingSystem.vue` | Logging system debug interface |

### 📋 Planned Components

**Basic Form Components:** Toggle, Checkbox, Input, ProgressBar, Slider, DatePicker, RadioButton, TextArea

**Game Components:** NeedBar, HappinessIndicator, PreferenceTracker, StatsDisplay, FriendshipMeter, GridCell, GridContainer, HabitatItem, GuineaPigSprite, HabitatStatusDisplay, FoodSelector, ResourceCounter, CurrencyDisplay

**Layout Components:** NavigationHeader, BottomMenu, FloatingActionButton, FABMenu, SidePanel, FloatingMenu, Accordion, PageHeader, LayoutRegionContainer

**Modal System:** Modal, ConfirmationModal, FormModal, TutorialModal, SettingsModal, InfoModal, OrientationModal

**Debug Components:** NeedControl, WellnessDebugger, HabitatDebugger, ResponsiveDetector, DeviceTypeIndicator, ValueAdjuster, FeatureToggle

*Note: Game components will be implemented incrementally in Phases 2-4 alongside their corresponding systems.*

## Component Standards
- Consistent prop interfaces and TypeScript definitions
- Component documentation and usage examples
- Theming integration with CSS variables
- Built with responsive design principles using logical properties
- International-ready design with automatic RTL language support
- Semantic CSS that responds to content flow rather than physical directions

## Responsive Layout Controller

### Core Functionality
- Device type detection (mobile, tablet, desktop)
- Orientation monitoring (portrait, landscape) with throttled resize events
- Screen size tracking with performance optimization (100-200ms throttling)
- Breakpoint management and layout state updates
- Adaptive navigation switching (bottom nav ↔ FAB based on screen height)

### Container-Query Integration
- Container observation setup for major layout regions (habitat, text-panel, layout-region)
- Component-level responsive behavior coordination with global layout changes
- Performance-optimized container resize detection with debouncing
- Context-aware component sizing that responds to allocated container space rather than viewport

## Mobile Portrait Handling (Planned)
- **OrientationModal:** Full-screen rotation prompt for mobile portrait mode with automatic game pause
- **Game resume:** Preserves manual pause state on landscape rotation

## UI Implementation Strategy
- Build visual framework using implemented component library
- Connect functionality as systems are developed in Phases 2-4
- Maintain consistent styling patterns through shared CSS systems

## Integration Points
- **Game Controller Store:** State management and responsive control
- **Logging System:** Activity feed display and debug logging
- **All Future Systems:** Provide UI components and responsive framework

## Implementation Progress

### CSS Foundation & Style Systems ✅ COMPLETED

**Core Architecture:**
- **Design Tokens** (`src/styles/variables.css`) - Complete design system with pink/green accents, Gaegu/Inter typography, logical properties
- **Base Foundation** (`src/styles/base.css`) - CSS reset, typography hierarchy, BEM utilities, mobile-first responsive foundation
- **Panel System** (`src/styles/panel.css`) - Component architecture with variants (primary, secondary, muted, debug, compact)

**Specialized Systems:**
- **Stats Grid** (`src/styles/stats.css`) - Statistical displays with alternating backgrounds and semantic color variants
- **Text Utilities** (`src/styles/text-utilities.css`) - Semantic color classes (success, error, muted) used across 6+ components
- **Form Styling** (`src/styles/forms.css`) - Input, form-group, search, and filter control styling
- **Alert System** (`src/styles/alerts.css`) - Alert components with semantic variants and container layouts

**Integration:** All systems globally imported in `main.ts`, eliminating 100+ lines of duplicate styles across debug components and providing consistent UI patterns ready for Phase 2 development.

### Component Implementation & Integration ✅ COMPLETED

**Implemented Components:**
- **Button Component** - Full variant system (primary, secondary, tertiary, danger, warning) with sizes and TypeScript support
- **Select Component** - Dropdown with form integration and proper value binding
- **TabContainer Component** - ARIA-compliant tabs with icons, badges, and keyboard navigation
- **ActivityFeed Component** - Real-time activity stream with pause/clear controls and responsive design

**Debug Interface Development:**
- **Debug Dashboard** (`src/views/DebugView.vue`) - TabContainer organizing three specialized debug interfaces
- **Game Controller Debug** - Button/Select integration, panel layouts, stats grids for game state testing
- **System Monitor Debug** - Form controls, alert systems, performance metrics with error tracking
- **Logging System Debug** - Activity feed integration, real-time logging, and system diagnostics

**Integration Benefits:**
- **Component Interoperability** - All components work seamlessly together with consistent styling
- **Shared Architecture** - Panel, stats, form, and alert systems provide unified UI patterns
- **TypeScript Integration** - Complete type safety and IntelliSense across all components
- **Phase 2 Ready** - Component library prepared for main game interface development

## Architecture Evolution

### CSS System Growth
The CSS architecture evolved from 3 planned systems to 7 implemented systems during Phase 1:

**Foundation:** `variables.css`, `base.css`, `panel.css` (planned)
**Added:** `stats.css`, `text-utilities.css`, `forms.css`, `alerts.css` (emerged organically)

### Key Benefits
- **Global import strategy** - All styles universally available via `main.ts`
- **Eliminated duplication** - 100+ lines of duplicate styles removed from debug components
- **Pattern consistency** - Unified statistical displays, forms, and alerts across application
- **Phase 2 ready** - Pre-built styling patterns accelerate future development

### Patterns Established
- **Stats grids** for data display, **alert systems** for notifications, **form controls** for input styling, **text utilities** for semantic colors

**Recommendation:** Continue organic evolution approach, extracting shared patterns as they emerge while maintaining global import strategy.