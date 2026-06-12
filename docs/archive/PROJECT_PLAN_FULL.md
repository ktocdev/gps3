**ARCHIVED 9/14/2025 - Refer to PROJECT_PLAN.MD**

# Guinea Pig Simulation Game - Framework Plan

## Phase 1: Foundation & Infrastructure
1. **Game Controller Store (Pinia)**
   - **Game State Management (Four Primary States):**
     - **INTRO State:** App first loads, no guinea pig exists, or after "New Game"
       - UI: Guinea pig creation form displayed
       - Behavior: Game loop inactive, no needs decay, no autonomous behaviors
       - Transitions: `intro` → `playing` (after guinea pig creation)
     - **PLAYING State:** Guinea pig exists and user is actively playing
       - UI: Full game interface visible (habitat, needs bars, interactions)
       - Behavior: Game loop active, needs decay, autonomous behaviors, all interactions enabled
       - Transitions: `playing` → `paused` (user pause/orientation), `playing` → `stopped` (user quit)
     - **PAUSED State:** User manual pause OR OrientationModal active (mobile portrait)
       - UI: Pause overlay or orientation prompt, game visually frozen
       - Behavior: Game loop suspended, no needs decay, no autonomous behaviors, limited interactions
       - Transitions: `paused` → `playing` (resume/orientation fix), `paused` → `stopped` (quit while paused)
     - **STOPPED State:** User explicitly quits/closes game (future state for cleanup)
       - UI: Optional goodbye screen or immediate app close
       - Behavior: Save final state, cleanup resources, prepare for next session
       - Transitions: `stopped` → `intro` (restart app) or app termination
   - **State Transition Logic & Pause Priority:**
     - **Pause Priority System:** Manual pause overrides orientation pause
     - **State Persistence:** Current state saved to localStorage for recovery
     - **Resume Logic:** Preserve user intent (if manually paused, don't auto-resume on orientation change)
     - **Transition Validation:** Ensure only valid state transitions are allowed
     - **State Recovery:** Detect and handle invalid state combinations on app startup
   - **State Management Structure (TypeScript Interface):**
     ```typescript
     interface GameState {
       currentState: 'intro' | 'playing' | 'paused' | 'stopped'
       pauseReason?: 'manual' | 'orientation' | null
       hasGuineaPig: boolean
       isFirstTimeUser: boolean
       lastSaveTimestamp: number
     }
     ```
   - **Auto-Save Integration with State Management:**
     - **Save Triggers:** State changes, periodic intervals (30s/1m/2m based on settings)
     - **Save Content:** Current state + guinea pig data + needs + preferences + settings
     - **Load on Startup:** Detect existing save → skip intro if guinea pig exists
     - **State-Aware Persistence:** Different save strategies for different states
   - Save/load game functionality with browser persistence
   - New game functionality with data reset
   - Auto-save and auto-load on browser open
   - Settings management foundation (expandable structure for all game preferences)
   - **Initial Settings (Phase 1.1):**
     - **Auto-save enabled/disabled** (default: enabled)
     - **Save frequency** (30 seconds, 1 minute, 2 minutes)
     - **Tutorial Controls** (global user preferences that persist across games):
       - Tutorial mode: 'auto' | 'always_show' | 'never_show' (default: 'auto')
       - Global first-time user detection
       - Manual override controls for tutorial display
     - **Performance mode** (standard/reduced for older devices)
     - **Error reporting enabled/disabled** (default: enabled in development, disabled in production)
       - Captures JavaScript errors, failed save/load operations, performance issues
       - Stores error data locally: timestamp, error type, message, game state summary
       - User privacy control with clear explanation of data collection
   - **Error Handling & State Recovery:**
     - **Corrupted Save Detection:** Fallback to intro state with user notification
     - **State Recovery:** Log state transitions for debugging save/load issues
     - **Error Reporting Integration:** Capture state-related errors with context (current state, transition attempted)
     - **Tutorial System Integration:** State-aware tutorials, persistence across game sessions
     - **First-Time Detection:** Track across all game sessions, not just current guinea pig
   - **Settings Added Later:** Theme selection (after CSS Framework), sound controls (after Sound System), etc.
   - Game session tracking (play time, statistics)

2. **Unified Layout & Component Framework**
   **Combined development approach for Systems 2-4 with region-based construction**

   - **CSS Styling Foundation:**
     - BEM methodology for consistent class naming
     - CSS custom properties in `src/styles/variables.css`
     - Theming system with dark mode and light mode support
     - Mobile-first breakpoint strategy with landscape mobile (768px+) foundation
     - Global CSS only (no scoped styles) for consistency and reusability
     - Responsive layout regions using CSS Grid/Flexbox

   - **Adaptive Navigation System:**
     - **Desktop/Tablet:** Full bottom navigation bar with complete controls
     - **Mobile Landscape (height < 500px):** Bottom nav collapses into Floating Action Button (FAB)
       - **Layout Grid:** Three-column layout with fixed top nav (50-60px height)
       - **Left Navigation:** Fixed sidebar (~200px max width, 15% of screen)
       - **Habitat Container:** Centered main content area (~60-65% of available width)
       - **TextInfoPanel:** Right sidebar (~25-30% of width, 280px minimum for comfortable reading)
       - **FAB Positioning:** Bottom-right corner between TextInfoPanel and habitat with 16px spacing
       - **Container-Query Integration:** Components adapt based on their allocated container size
     - **FAB Implementation:** Bottom-right positioned, expandable to reveal nav controls
     - **FAB Menu Options:** Radial menu, slide-up panel, or contextual overlay
     - **Primary FAB Actions:** Most common interactions (interact with guinea pig, urgent needs)

   - **Region-Based Development Strategy:**
     - **Step 1:** Responsive layout framework foundation with OrientationModal
     - **Step 2:** Navigation regions (top nav, adaptive bottom nav/FAB)
     - **Step 3:** Core content regions (habitat grid, info panels, activity feed)
     - **Step 4:** Iterative component development as regions are populated

   - **Reusable Component Library:**
   - Custom reusable components for all UI elements
   - **Basic Form Components:** Button, Toggle, Checkbox, Input, ProgressBar, Slider, Dropdown/Select, DatePicker, RadioButton, TextArea
   - **Game-Specific Components:**
     - NeedBar (displays individual need with value/color/label)
     - HappinessIndicator (specialized happiness display with boredom alerts and variety tracking)
     - PreferenceTracker (discovered preferences display with visual indicators)
     - PreferenceLearningHint (visual cues for newly discovered preferences)
     - ActivityFeed (scrolling text-based activity stream with timestamps and filtering)
     - TextInfoPanel (container-query responsive text information display with activity feed, stats, and contextual actions)
     - ActivityFeedStream (enhanced activity feed with real-time updates, emoji graphics, and container-query sizing)
     - QuickStatsCard (compact stats summary for narrow layouts with responsive text sizing)
     - ContextualActionSuggester (displays context-aware action suggestions based on guinea pig state)
     - StatsDisplay (guinea pig info card with name, age, gender, coat)
     - FoodSelector (component for selecting specific hay/vegetable/fruit types)
     - BeddingTypeSelector (interface for selecting bedding varieties)
     - GridCell (habitat grid individual cell component)
     - GridContainer (habitat grid layout container with container-query responsive sizing)
     - HabitatItem (draggable/placeable items like food dish, water bottle)
     - MenuCard (interaction menu panels with icons and labels)
     - StatusIndicator (behavior indicators, cleanliness status)
     - HabitatStatusDisplay (cleanliness, bedding freshness, water level indicators)
     - ResourceCounter (bedding inventory count with low-stock alerts)
     - CurrencyDisplay (coins/money display with icon)
     - ItemCard (inventory/store item with image, price, description)
     - ItemRotationManager (interface for managing item storage/rotation)
     - MultiSelectGrid (for selecting multiple items in store/inventory)
     - ActionButton (interaction buttons with cooldown states)
     - InteractionCooldownDisplay (shows when interactions are available again)
     - FriendshipMeter (displays friendship level with trend indicators, wellness penalty alerts)
     - ProgressIndicator (friendship building, preference discovery progress tracking)
     - Timer (countdown/elapsed time display)
     - NotificationBadge (alerts and count indicators)
     - AchievementCard (achievement display with progress)
     - TooltipWrapper (hover/touch information popups)
     - LoadingSpinner (async operation indicator)
     - ErrorMessage (error display with retry options)
     - GuineaPigSprite (guinea pig visual representation - starts as static emoji, later enhanced with animation system)
   - **Layout Components:**
     - NavigationHeader (persistent header with play/pause, new game)
     - BottomMenu (touch-friendly bottom interaction area - desktop/tablet)
     - FloatingActionButton (FAB - adaptive bottom nav for mobile landscape)
     - FABMenu (expandable controls overlay for constrained screens)
     - SidePanel (inventory/store sliding panels)
     - FloatingMenu (context menus for interactions)
     - TabContainer (tabbed interface for settings/menus)
     - Accordion (collapsible content sections)
     - PageHeader (screen titles with back navigation)
     - TextInfoPanel (container-query aware text information display for mobile landscape right sidebar)
     - ActivityFeedStream (scrollable message list with real-time text updates and emoji graphics)
     - QuickStatsCard (compact stats display optimized for narrow text panel layouts)
     - LayoutRegionContainer (container-query wrapper for major layout regions with responsive sizing)
   - **Modal System:**
     - Modal (base modal component)
     - ConfirmationModal ("Start New Game" warning, etc.)
     - FormModal (guinea pig creation form)
     - TutorialModal (onboarding and tip displays)
     - SettingsModal (preferences and configuration)
     - InfoModal (help text and game information)
     - OrientationModal (mobile portrait rotation prompt with game pause)
   - **Debug Components:**
     - DebugPanel (collapsible debug interface)
     - NeedControl (individual need manipulation controls)
     - WellnessDebugger (wellness calculation breakdown and penalty testing)
     - HabitatDebugger (habitat condition manipulation and testing controls)
     - ResponsiveDetector (service component for viewport monitoring)
     - DeviceTypeIndicator (debug component showing current device/orientation state)
     - LogViewer (scrollable log display)
     - ValueAdjuster (debug slider/input for numeric values)
     - FeatureToggle (enable/disable feature flags for testing)
   - Consistent prop interfaces and TypeScript definitions
   - Component documentation and usage examples
   - Theming integration with CSS variables
   - Built with responsive design principles

   - **Responsive Layout Controller:**
     - Device type detection (mobile, tablet, desktop)
     - Orientation monitoring (portrait, landscape) with throttled resize events
     - Screen size tracking with performance optimization (100-200ms throttling)
     - Breakpoint management and layout state updates
     - Adaptive navigation switching (bottom nav ↔ FAB based on screen height)
     - **Container-Query Integration:**
       - Container observation setup for major layout regions (habitat, text-panel, layout-region)
       - Component-level responsive behavior coordination with global layout changes
       - Performance-optimized container resize detection with debouncing
       - Context-aware component sizing that responds to allocated container space rather than viewport

   - **Mobile Portrait Handling:**
     - OrientationModal takeover for mobile portrait mode (< 768px width, height > width)
     - Automatic game pause when orientation modal is active
     - Full-screen rotation prompt with clear user instructions
     - Game resume on landscape rotation (preserves manual pause state)

   - **Complete Game UI Structure with Placeholders:**
     - Game intro screen with guinea pig creation form placeholders
     - Navigation header with play/pause and new game button placeholders
     - Guinea pig stats display area (name, gender, coat, age placeholders)
     - Needs bars/indicators with placeholder data
     - **Habitat status display area (cleanliness, bedding freshness, water level)**
     - Main habitat grid container with container-query responsive sizing and placeholder guinea pig (emoji-based)
     - **Activity feed panel (sidebar or bottom area) for real-time text-based interactions**
     - **Adaptive bottom interaction area:**
       - **Desktop/Tablet:** Full bottom menu with complete interaction controls
       - **Mobile Landscape (height < 500px):** Floating Action Button (FAB) with expandable menu
     - Inventory interface placeholders
     - Store interface placeholders
     - Direct interaction menu placeholders
     - Cage maintenance interaction menu placeholders
     - Guinea pig behavior indicators placeholders
     - Cage cleanliness status placeholders
     - Modal overlay structure for all popups
     - Responsive breakpoints for tablet and desktop layouts
   - **UI Implementation Strategy:**
     - Build complete visual framework using Reusable Component Library
     - Connect real data/functionality as systems are implemented
     - Maintain consistent styling and interaction patterns throughout

5. **Logging System & Activity Feed**
   - Action logs for needs changes
   - Game events history
   - Debug logging capabilities
   - **Natural Language Activity Generation:**
     - Player actions: "You place a cherry tomato in the food dish"
     - Guinea pig reactions: "Guinea pig popcorns excitedly! ✨"
     - Autonomous behaviors: "Guinea pig runs to the water bottle"
     - Environmental events: "The bedding needs refreshing"
   - **Activity Feed Integration:**
     - Real-time activity stream with timestamps
     - Message categorization (actions, reactions, environment)
     - Activity filtering and display options
   - Centralized logging service for all game systems
   - Log level filtering (debug, info, warn, error)
   - Integration hooks for all stores and systems

6. **Debug Menu System**
   - Development-only debug interface using debug components from Reusable Component Library
   - **Debug System Architecture:**
     - Modular debug panels for each game system (needs, wellness, preferences, reactions, habitat, activity feed)
     - Real-time system monitoring and manipulation controls
     - Comprehensive testing interfaces for all game mechanics
     - Performance monitoring and bottleneck identification
   - **Integration Points:**
     - All debug components defined in Section 3 (Reusable Component Library)
     - Each game system includes debug integration hooks
     - Centralized debug state management via DebugPanel component
   - **Development Features:**
     - Only available in development builds
     - Toggle visibility with keyboard shortcut
     - Debug data persistence for testing scenarios
     - Export/import debug configurations
   - **System Testing Capabilities:**
     - End-to-end game flow testing
     - Performance stress testing
     - Data corruption recovery testing
     - Cross-system integration validation

## Phase 2: Core Game Entities & State
5. **Guinea Pig Creation System**
   - Game intro screen with creation form
   - Guinea pig customization options:
     - Name input field
     - Gender selection (sow or boar)
     - Coat type selection
     - Birthdate picker
   - "Set Random" button for automatic generation
   - **Hidden Preference Generation:**
     - Random assignment of food preferences (hay, vegetables, fruits)
     - Random assignment of activity and interaction preferences
     - Preferences stored privately, not displayed to player during creation
   - Form validation and confirmation
   - **New Game Tips & Onboarding:**
     - Welcome message and basic game concept explanation
     - Getting started tips (watch needs bars, interact with guinea pig, keep cage clean)
     - **Tutorial System Integration:**
       - Respects global tutorial preferences from Game Controller Store
       - 'auto' mode: Shows tutorials only for genuinely first-time users
       - 'always_show' mode: Displays all tutorial content regardless of experience
       - 'never_show' mode: Skips all tutorial content
       - Tutorial controls persist across different guinea pig creations
     - Tips on building friendship through positive interactions
     - Guided first interactions (when tutorials are enabled)
   - Logging integration for creation events

6. **Guinea Pig Store (Pinia)**
   - Guinea pig entity with customizable properties (name, gender, coat, birthdate)
   - Core stats/needs structure
   - Age calculation based on birthdate
   - **Individual Preference System:**
     - **Food Preferences:** One preferred and one disliked for each category (hay, vegetables, fruits)
     - **Activity Preferences:** Preferred and disliked play activities and interaction styles
     - **Hidden Discovery:** Preferences not revealed to player initially, discovered through gameplay
     - **Preference Effects:** Preferred items (+10-15 happiness bonus), disliked items (-5-8 happiness penalty)
   - **Guinea Pig Reaction System:**
     - **Current Reaction State:** Tracks active reaction animation and duration
     - **Reaction Triggers:** Based on interactions, preferences, needs levels, and friendship
     - **Reaction Intensity:** Scales with friendship level and care quality
     - **Animation Queue:** Manages multiple reactions and transitions between states
     - **Activity Message Generation:** Converts reactions into natural language for activity feed
   - Persistence configuration
   - Logging integration for state changes and preference discoveries

7. **Needs System Architecture**
   - Base Need class/interface with decay rates
   - Need categories (hunger, thirst, happiness, cleanliness, health, energy, social)
   - Need value ranges (0-100 scale) with critical thresholds (0-25%, 25-50%, etc.)
   - Variable decay rates based on guinea pig age and health
   - Need interdependencies (low health affects other needs)
   - **Detailed Happiness Need System:**
     - **Natural Decay:** happiness decreases over time without stimulation (baseline decay rate)
     - **Boredom System:** accelerated decay if no variety in interactions/toys over time
     - **Excitement Boost:** new toys/interactions provide temporary happiness surge (+15-25 points)
     - **Comfort Maintenance:** familiar items provide steady happiness baseline (slower decay)
     - **Environmental Factors:** fresh bedding, cleanliness, and cage enrichment affect happiness
     - **Variety Requirement:** repeated use of same toys/interactions reduces effectiveness over time
   - **Internal Wellness Rating System (not displayed to player):**
     - Wellness rating calculated as real-time average of all 7 needs (0-100 scale)
     - Wellness threshold system: < 45% triggers friendship penalties
     - Friendship penalty rate: -0.5 to -1 friendship points per game tick when wellness < threshold
     - **Contextual wellness warnings only when approaching penalty threshold (<50%)**
     - **Enhanced friendship meter feedback shows wellness penalty effects**
   - **Friendship System Integration:**
     - Friendship level (0-100) that increases through positive interactions
     - **Friendship can decrease through wellness penalties when overall care is poor**
     - Higher friendship unlocks new user interactions and items
     - Friendship influences guinea pig autonomous behavior and reactions
     - Friendship affects need satisfaction rates (higher friendship = more effective interactions)
     - Wellness-to-friendship feedback loop creates consequences for neglect
   - Seasonal/time-based need variations
   - Debug interface integration for need manipulation
   - Logging integration for need changes

8. **Needs Controller Store (Pinia)**
    - Central needs management
    - Batch processing all needs decay
    - **Internal wellness rating calculation (not exposed to UI)**
    - **Friendship penalty system based on wellness thresholds**
    - Need state change notifications
    - Critical need alerts/warnings
    - **Contextual wellness warnings (only when < 50% threshold)**
    - **Enhanced friendship meter integration for penalty feedback**
    - Debug menu integration for need control
    - Logging integration for need processing events

9. **Habitat Conditions Store (Pinia)**
    - **Cleanliness Level (0-100)** - decreases with poop accumulation, reset by cleaning cage
    - **Bedding Freshness (0-100)** - gradual decay over time, refreshed using bedding resource
    - **Water Level (0-100)** - decreases when guinea pig drinks, refilled for free
    - **Habitat condition change notifications and alerts**
    - **Integration with guinea pig cleanliness and happiness needs**
    - **Resource management for bedding consumption**
    - Habitat maintenance tracking and logging
    - Debug menu integration for condition manipulation
    - Persistence with game state saving

10. **Interval Management System**
    - Main game tick (every 1-5 seconds)
    - Multiple interval speeds for different systems
    - **Enhanced Pause/Resume Functionality:**
      - Respects manual user pause state
      - Respects automatic orientation pause state
      - Combined pause logic (paused if either condition is true)
      - Seamless resume when orientation modal dismisses
    - Background tab handling
    - Logging integration for timing events

11. **Game Loop Integration**
    - Connect needs system with timing
    - **Integrate habitat conditions with game tick system**
    - Synchronize needs decay with game tick
    - **Synchronize habitat condition changes (bedding freshness decay, water consumption)**
    - **Cross-system integration: habitat conditions affecting guinea pig needs**
    - Performance optimization for continuous operation
    - Logging integration for system integration events

## Phase 3: Game World & Environment
12. **Habitat Item System**
    - Grid-based habitat layout for item placement (drag & drop)
    - Item interaction system (guinea pig automatically uses items)
    - **Default habitat items:** water bottle, food dish, hay rack (with multiple hay types), small shelter, small chew toy
    - **Happiness-Focused Items:**
      - **Enrichment Toys:** tunnel systems, exercise wheels, chew toys, climbing platforms
      - **Interactive Items:** puzzle feeders, treat-hiding toys, mirrors, bells
      - **Comfort Items:** soft hideouts, elevated platforms, cozy sleeping areas
      - **Seasonal/Themed Items:** holiday decorations, themed cage setups, special event items
    - **Item Variety & Rotation System:**
      - Items lose effectiveness over time if not rotated (boredom factor)
      - "New" items provide happiness bonus when first introduced
      - Players can store/rotate items to maintain novelty and prevent boredom
      - Item combinations create synergy bonuses (tunnel + platform = exploration bonus)
    - Item effectiveness on different needs with quality/durability system
    - Item wear and replacement needs
    - Special items unlock based on guinea pig age/achievements
    - Item positioning affects effectiveness (water near food, toys in activity area, etc.)
    - Logging integration for item interactions

13. **Inventory & Store System**
    - Player inventory for owned items
    - **Resource inventory for consumables (bedding, food supplies)**
    - Store with purchasable items and currency system
    - Currency earning through guinea pig care and achievements
    - Daily rewards and milestone bonuses
    - Item categories: **hay varieties**, **vegetables**, **fruits (treats)**, **toys/enrichment**, shelter, decoration, **habitat supplies (bedding)**
    - **Expanded Food Categories:**
      - **Hay Types (8 varieties):** Timothy hay, Orchard grass, Meadow hay, Alfalfa hay, Botanical hay, Oat hay, Bermuda grass, Western Timothy
      - **Vegetables (12 varieties):** Bell peppers, carrots, leafy greens, cucumber, cherry tomatoes, broccoli, celery, zucchini, parsley, cilantro, sweet potato, snap peas
      - **Fruits (10 varieties - treats):** Apple, banana, strawberry, blueberry, orange, grape, pear, melon, kiwi, raspberry
    - **Detailed Happiness Item Categories:**
      - **Entertainment Toys:** chew toys, balls, puzzle feeders, interactive toys
      - **Comfort & Shelter:** hideouts, platforms, soft bedding, cozy corners
      - **Activity Items:** tunnels, climbing structures, exercise equipment
      - **Novelty Items:** seasonal decorations, themed accessories, limited-time specials
    - **Preference-Based Shopping:**
      - Players discover which foods their guinea pig prefers through observation
      - Preferred items provide happiness and satisfaction bonuses
      - Multiple purchase options encourage experimentation and discovery
    - **Bedding as consumable resource:**
      - Various bedding types with different costs and freshness duration
      - Starter bedding supply provided at game creation
      - Low bedding alerts and auto-purchase options
    - Item rarity system (common, rare, premium)
    - Limited-time offers and seasonal items
    - Item management (buy, place, remove, sell back)
    - **Resource management (track bedding quantity, consumption rates)**
    - Logging integration for inventory and purchase events

14. **Habitat Maintenance & Hygiene System**
    - **Enhanced poop system** with grid-based placement and accumulation tracking
    - **Habitat cleanliness level** affected by poop accumulation and general cage state
    - **Bedding freshness system** with gradual decay over time
    - **Water level tracking** with guinea pig consumption
    - Click/touch poop removal interaction
    - **Enhanced cage interaction menu** with maintenance options:
      - **Clean Cage** (removes all poops, improves cleanliness level)
      - **Refresh Water** (refills water level to 100% - infinite resource)
      - **Refresh Bedding** (consumes bedding from inventory, resets bedding freshness to 100%)
      - Auto Place Food (automatically places food in dish)
    - **Resource management integration:**
      - Bedding as consumable resource (purchased from store)
      - Player starts with initial bedding supply
      - Water as infinite resource (no purchase required)
    - **Habitat conditions affecting guinea pig needs:**
      - Low cleanliness impacts guinea pig cleanliness need
      - Stale bedding affects guinea pig happiness
      - Empty water bottle prevents drinking to satisfy thirst
    - Logging integration for all habitat maintenance events

## Phase 4: Interactions & Behaviors
15. **Direct Interaction System**
    - User-to-guinea-pig interactions via click/touch menu
    - **Basic Interactions:** pet, clip nails, hold, brush, use pet wipe, hand feed
    - **Communication Interactions (happiness +):** talk to, sing to, whistle to, call name, make kissing sounds
    - **Play Interactions (happiness ++):** play peek-a-boo, wave hand, show toy, gentle tickle, nose boop
    - **Entertainment Interactions (happiness ++):** create obstacle course, hide treats, introduce new toy, rotate cage setup
    - **Care Interactions:** check health, weigh, massage, examine ears, gentle stretches
    - **Training Interactions (happiness +):** teach trick, practice command, reward with treat, clicker training
    - **Bonding Interactions (happiness +):** share snack, read to guinea pig, show photo, gentle humming
    - **Preference Discovery Interactions:**
      - **Share Snack:** Reveals fruit and vegetable preferences through guinea pig reactions (popcorn for favorites, turn away for dislikes)
      - **Offer Treat:** Different treats show varying levels of excitement/disinterest (big popcorn vs. reluctant eating)
      - **Try New Food:** Introducing new hay/vegetables shows clear preference indicators (happy munching vs. nose turn-up)
    - **Reaction-Based Feedback:**
      - **Immediate Visual Response:** Every interaction triggers appropriate guinea pig reaction
      - **Activity Feed Integration:** All interactions generate natural language messages
      - **Preference Learning:** Reactions teach players about individual guinea pig personality through text and (future) animations
      - **Friendship Indicators:** Reaction intensity reflects current relationship strength
    - **Friendship-Gated Advanced Interactions:**
      - High friendship: teach advanced tricks, special cuddle time, guinea pig "conversations"
      - Maximum friendship: guinea pig responds to specific calls, performs learned behaviors on command
    - Interaction effects on specific needs
    - **Friendship Integration:**
      - All positive interactions increase friendship level
      - Friendship level unlocks advanced interactions (special treats, training, tricks)
      - Higher friendship increases interaction effectiveness
      - Friendship-gated premium interactions for bonded guinea pigs
    - Need satisfaction logic (guinea pig won't accept actions if need is already full)
    - Cooldown system for interactions
    - Logging integration for interaction events

16. **Guinea Pig Autonomy System**
    - Autonomous behavior triggered by need thresholds
    - Pathfinding and movement to habitat items
    - Autonomous actions: walk to food/water, hide in shelter, sleep, use items
    - AI decision making based on current need priorities
    - **Friendship-Influenced Behaviors:**
      - **High friendship:** Spontaneous popcorn, zoomies, watch lovingly, investigate player cursor
      - **Medium friendship:** Look at player, chirp greetings, comfortable stretching
      - **Low friendship:** Hide behaviors, avoid eye contact, freeze when approached, warning reactions
      - **Friendship affects:** Willingness to approach interactions and reaction intensity
    - Need satisfaction logic (won't use items if corresponding need is already full)
    - Intermittent poop dropping while moving around cage
    - **Activity Feed Integration:** All autonomous behaviors generate descriptive messages
    - **Static Visual Movement:** Guinea pig emoji moves between grid positions (no animation initially)
    - Animation and visual feedback for autonomous behaviors (future enhancement)
    - Logging integration for autonomy and AI decision events

## Phase 5: Polish & Enhancement
17. **Achievement & Progression System**
    - Achievement tracking for various milestones
    - Guinea pig care achievements (feed X times, clean cage daily)
    - Collection achievements (own all items, unlock all coat colors)
    - Time-based achievements (play for X days straight)
    - Achievement rewards (currency, special items, new features)
    - Progress tracking and statistics
    - Achievement notifications and celebration animations
    - Logging integration for achievement events

18. **Sound System**
    - Audio manager for game sound effects
    - Click/touch interaction sound feedback
    - **Guinea pig reaction sounds:**
      - **Positive:** Chirping, purring, happy wheeks, content munching sounds
      - **Negative:** Angry wheeks, teeth chattering, warning sounds
      - **Neutral:** General movement, eating, drinking sounds
    - **Reaction-Sound Integration:** Each visual reaction paired with authentic guinea pig vocalizations
    - UI interaction sounds (button clicks, menu opens)
    - Background ambient sounds (optional)
    - Volume controls and mute functionality
    - Audio file optimization for web delivery
    - Logging integration for audio events

19. **Settings & Preferences Enhancement**
    - Expand settings as new features are added:
      - Sound settings (master volume, effects, music) - added with Sound System
      - Notification preferences - added with Achievement System
      - Auto-pause when tab inactive - added with Game Controller
      - Performance settings (animation quality, effects) - added with animations
      - Data export/import functionality - added when persistence is mature
    - Advanced preference categories and organization
    - Settings search and categorization for large option sets

20. **Guinea Pig Animation System (Future Enhancement)**
    - **Core Animation Framework:**
      - Replace static emoji GuineaPigSprite with full animation system
      - CSS transforms/transitions for smooth guinea pig movement
      - Sprite-based animation system with multiple frames per reaction
      - Animation state machine with smooth transitions between states
    - **Reaction Animations (Complete Library):**
      - **Positive Reactions (14 types):** Popcorn (small jumps), Big Popcorn (large jumps with twists), Chirp (head movements), Purr (body vibration), Wheek (mouth opening), Lick (tongue animation), Nuzzle (gentle head bump), Look (eye tracking), Watch Lovingly (sustained gaze), Stretch and Yawn (body extension), Zoomies (fast circular running), Run in Circles (playful movement), Happy Munching (chewing animation), Investigate (sniffing animation)
      - **Negative Reactions (10 types):** Angry Wheek (agitated movement), Won't Make Eye Contact (head turn away), Turns Up Nose (dismissive gesture), Hide (retreat to shelter), Warning Bite (aggressive nip), Freeze (motionless), Back Away (reverse movement), Reluctant Eating (slow chewing), Teeth Chattering (jaw movement), Hunched Posture (defensive position)
    - **Movement Animation:**
      - Smooth pathfinding animation using A* algorithm
      - Walking animation cycles for movement between grid positions
      - Idle animation loops for stationary behaviors
      - Sleeping animation with breathing effects
    - **Environmental Interaction Animations:**
      - Eating/drinking animations with mouth movements
      - Using habitat items (entering tunnels, climbing platforms)
      - Poop dropping animation with timing
      - Interaction with toys and enrichment items
    - **Technical Implementation:**
      - **Animation Sprites:** Multiple frame sequences for each reaction and behavior
      - **CSS Animation System:** Transform-based movements with GPU acceleration
      - **State Management:** Animation queue system with priority handling
      - **Performance Optimization:** Efficient sprite rendering and memory management
      - **Mobile Optimization:** Touch-responsive animations with appropriate frame rates
      - **Accessibility Options:** Reduced motion settings for sensitive users
    - **Integration with Existing Systems:**
      - **Activity Feed Complement:** Animations enhance text descriptions rather than replacing them
      - **Sound Synchronization:** Visual animations perfectly timed with guinea pig vocalizations
      - **Preference Discovery:** Visual cues make preference learning more intuitive and engaging
      - **Friendship Scaling:** Animation intensity reflects relationship quality
      - **Debug Integration:** Animation testing and preview capabilities in debug system
    - **Development Considerations:**
      - **Asset Creation:** High-quality sprite sheets for all guinea pig coat types and reactions
      - **Animation Timing:** Smooth transitions that feel natural and responsive
      - **Performance Settings:** User options for animation quality based on device capabilities
      - **Cross-Platform Compatibility:** Consistent animation performance across devices
      - **Future Extensibility:** Animation system designed for easy addition of new reactions and behaviors
    - **User Experience Enhancement:**
      - **Visual Polish:** Transform static simulation into lively, engaging pet experience
      - **Emotional Connection:** Animated reactions create stronger player-pet bond
      - **Preference Clarity:** Visual feedback makes guinea pig personality more apparent
      - **Engagement:** Dynamic animations maintain long-term player interest
      - **Accessibility:** Optional reduced motion for users who need it

## Recommended Development Order:

### Phase 1: Foundation & Infrastructure (Systems 1-4)
1. **Game Controller Store** - Central control system with save/load
2. **Unified Layout & Component Framework** - Region-based development combining CSS foundation, component library, and responsive UI with adaptive FAB navigation
3. **Logging System & Activity Feed** - Centralized logging and natural language activity generation (implement early!)
4. **Debug Menu System** - Development debugging tools (implement early for testing needs!)

### Phase 2: Core Game Entities & Timing (Systems 5-11)
5. **Guinea Pig Creation System** - Intro screen (connect to existing UI placeholders)
6. **Guinea Pig Store** - Entity management (connect to stats display placeholders)
7. **Needs System Architecture** - Core game mechanics with internal wellness system (connect to needs bars, enhanced friendship meter, and debug menu)
8. **Needs Controller Store** - Centralized need processing with wellness calculation and friendship penalties (connect to live needs display, enhanced friendship feedback, and debug controls)
9. **Habitat Conditions Store** - Environmental condition tracking (cleanliness, bedding freshness, water level) with resource management
10. **Interval Management System** - Game timing that drives needs decay, friendship penalties, and habitat condition changes
11. **Game Loop Integration** - Connect needs system with timing for core functionality including wellness-to-friendship feedback and habitat-to-needs integration

### Phase 3: Game World & Environment (Systems 12-14)
12. **Habitat Item System** - Item placement (connect to habitat grid placeholders)
13. **Inventory & Store System** - Item and resource management including bedding (connect to inventory/store UI placeholders)
14. **Habitat Maintenance & Hygiene System** - Enhanced poop system, cleanliness, bedding, and water management (connect to maintenance menu and habitat status display placeholders)

### Phase 4: Interactions & Behaviors (Systems 15-16)
15. **Direct Interaction System** - User-guinea pig interactions (connect to interaction menu placeholders)
16. **Guinea Pig Autonomy System** - AI behavior and pathfinding (connect to behavior indicator placeholders)

### Phase 5: Polish & Enhancement (Systems 17-20)
17. **Achievement & Progression System** - Milestone tracking and rewards
18. **Sound System** - Audio manager and interaction sound feedback
19. **Settings & Preferences System** - User preferences and customization
20. **Guinea Pig Animation System** - Full animation framework replacing static emoji graphics (future enhancement)

## Wellness Rating System - Strategic Design:

**Core Mechanics:**
- **Balanced Care Requirement:** Players must maintain all 7 needs rather than neglecting some for others
- **Consequence Feedback Loop:** Poor overall care damages the guinea pig relationship through wellness penalties
- **Progressive Difficulty:** As friendship decreases, interactions become less effective, creating a downward spiral if neglect continues
- **Recovery Opportunity:** Players can recover by improving overall wellness to stop penalties and rebuild friendship through positive interactions

**Mathematical Foundation:**
- Wellness = Average of all needs (hunger, thirst, happiness, cleanliness, health, energy, social) - **calculated internally**
- Penalty Threshold: Wellness < 45% triggers friendship loss
- Penalty Rate: -0.5 to -1 friendship per game tick (adjustable for game balance)
- **Player Feedback:** Contextual warnings when wellness < 50%, friendship meter shows penalty effects with trend indicators

**Gameplay Impact:**
- **Strategic Depth:** Forces holistic pet care approach rather than selective attention
- **Discovery-Based Learning:** Players learn balanced care through friendship changes and contextual hints
- **Emotional Investment:** Relationship damage creates genuine concern and motivation to improve care
- **Skill Development:** Players develop intuition about guinea pig care through observation and feedback
- **Realistic Simulation:** More natural pet relationship without artificial wellness meters
- **Long-term Engagement:** Relationship recovery provides meaningful progression goals

## Habitat Conditions System - Environmental Management:

**Core Habitat Conditions (separate from guinea pig needs):**
- **Cleanliness Level (0-100):** Decreases as poops accumulate in cage, restored by cleaning cage
- **Bedding Freshness (0-100):** Gradually decays over time, refreshed by consuming bedding resource
- **Water Level (0-100):** Decreases when guinea pig drinks, refilled for free via "Refresh Water"

**Resource Management:**
- **Bedding as Consumable:** Players must purchase bedding from store, various types with different costs/duration
- **Starter Supply:** New players begin with initial bedding inventory to avoid immediate resource pressure
- **Water as Infinite Resource:** No cost to refill water bottle, encourages proper hydration care
- **Strategic Budgeting:** Players must balance bedding costs against other purchases (toys, treats, decorations)

**Environmental Impact on Guinea Pig:**
- **Habitat-to-Needs Integration:** Poor habitat conditions negatively affect specific guinea pig needs
- **Cleanliness Impact:** Low cage cleanliness affects guinea pig's cleanliness need satisfaction
- **Bedding Impact:** Stale bedding reduces guinea pig happiness and comfort
- **Water Impact:** Empty water bottle prevents guinea pig from satisfying thirst need
- **Compound Effect:** Multiple poor habitat conditions can significantly impact wellness rating

**Maintenance Gameplay Loop:**
- **Proactive Care:** Players must anticipate and prevent habitat deterioration
- **Resource Planning:** Managing bedding inventory requires foresight and budgeting
- **Multi-System Balance:** Habitat maintenance adds complexity beyond direct guinea pig interactions
- **Visual Feedback:** Color-coded habitat status indicators help players prioritize maintenance tasks

## Happiness Need System - Entertainment & Enrichment:

**Core Happiness Mechanics:**
- **Natural Decay:** Baseline happiness decrease over time (slower than hunger/thirst)
- **Boredom Acceleration:** Faster decay when using same toys/interactions repeatedly
- **Variety Bonus:** New or rotated items provide happiness boost (+15-25 points)
- **Interaction Scaling:** Different interaction types provide varying happiness benefits (+5 to +20)

**Happiness Sources by Category:**
- **High Impact (+15-20):** New toys, complex play interactions, entertainment activities
- **Medium Impact (+10-15):** Training, bonding activities, environmental changes
- **Low Impact (+5-10):** Basic communication, familiar toy usage, routine comfort

**Item Effectiveness System:**
- **Newness Bonus:** Recently introduced items provide maximum effectiveness
- **Familiarity Decay:** Items become less effective over time (70% → 50% → 30% effectiveness)
- **Rotation Recovery:** Storing and re-introducing items restores some effectiveness
- **Combination Synergy:** Certain item pairings create happiness multipliers

**Environmental Happiness Factors:**
- **Cleanliness Impact:** Dirty cage reduces maximum happiness potential (-20% at very dirty)
- **Bedding Quality:** Fresh bedding maintains baseline happiness, stale bedding accelerates decay
- **Enrichment Density:** More variety in cage setup provides higher baseline happiness
- **Seasonal Elements:** Holiday/themed decorations provide temporary happiness boosts

**Strategic Gameplay Elements:**
- **Budget Management:** Players balance spending on happiness items vs necessities
- **Rotation Planning:** Strategic item storage and rotation to maintain variety
- **Activity Scheduling:** Timing play interactions for maximum happiness impact
- **Investment Strategy:** Higher-quality items maintain effectiveness longer

## Guinea Pig Preferences System - Individual Personality:

**Core Preference Mechanics:**
- **Hidden Generation:** Each guinea pig receives unique preferences during creation (not visible to player)
- **Discovery Learning:** Players learn preferences through observation and experimentation
- **Three-Tier Response:** Preferred (+10-15 bonus), neutral (standard), disliked (-5-8 penalty)
- **Multiple Categories:** Food preferences (hay, vegetables, fruits) and activity preferences

**Food Preference Categories:**

**Hay Varieties (8 types):**
- **Timothy Hay:** Classic, high fiber content
- **Orchard Grass:** Sweet, soft texture
- **Meadow Hay:** Mixed grasses, varied texture
- **Alfalfa Hay:** Rich, high calcium (young/pregnant guinea pigs)
- **Botanical Hay:** Mixed with dried herbs and flowers
- **Oat Hay:** Sweet with seed heads included
- **Bermuda Grass:** Fine texture, mild flavor
- **Western Timothy:** Premium timothy variety

**Vegetables (12 types):**
- **Bell Peppers, Carrots, Leafy Greens, Cucumber**
- **Cherry Tomatoes, Broccoli, Celery, Zucchini**
- **Parsley, Cilantro, Sweet Potato, Snap Peas**

**Fruits (10 types - treats/rewards):**
- **Apple, Banana, Strawberry, Blueberry, Orange**
- **Grape, Pear, Melon, Kiwi, Raspberry**

**Activity Preferences:**
- **Play Styles:** Tunnels, climbing, hiding games, chewing, exploring, puzzle-solving, foraging
- **Interaction Preferences:** Gentle petting, active play, quiet companionship, training sessions, grooming

**Discovery Mechanics:**

**Positive Reactions (High Happiness/Preferred Items/Good Care):**
- **Popcorn** - Small excited jumps in place
- **Big Popcorn** - Large enthusiastic jumps with twists
- **Chirp** - Happy vocalizations
- **Purr** - Contentment sounds during petting
- **Wheek** - Excited food calls
- **Lick** - Affectionate licking of player cursor/hand
- **Nuzzle** - Gentle head bumps against items/cursor
- **Look** - Direct eye contact and attention
- **Watch Lovingly** - Sustained, relaxed gaze
- **Stretch and Yawn** - Comfortable, relaxed stretching
- **Zoomies** - Fast running around the cage
- **Run in Circles** - Playful circular running
- **Happy Munching** - Enthusiastic eating with sounds
- **Investigate** - Curious sniffing and exploration

**Negative Reactions (Low Happiness/Disliked Items/Poor Care):**
- **Angry Wheek** - Distressed or demanding vocalizations
- **Won't Make Eye Contact** - Avoids looking at player cursor
- **Turns Up Nose** - Dismissive head turn away from disliked items
- **Hide** - Retreats to shelter or corner
- **Warning Bite** - Aggressive nip animation (very low friendship)
- **Freeze** - Motionless fear response
- **Back Away** - Moves away from player interactions
- **Reluctant Eating** - Slow, unenthusiastic food consumption
- **Teeth Chattering** - Anxiety/aggression indicator
- **Hunched Posture** - Defensive, uncomfortable positioning

**Reaction Integration:**
- **Learning Progression:** Players build mental map through reaction observation
- **Friendship Integration:** Respecting preferences (positive reactions) strengthens bond
- **Intensity Scaling:** Reaction strength reflects current friendship and care quality

**Strategic Impact:**
- **Personalization:** Each guinea pig feels genuinely individual and unique
- **Replayability:** New guinea pig = completely new set of preferences to discover
- **Shopping Strategy:** Buying preferred items becomes more rewarding than random purchases
- **Care Quality:** Understanding preferences demonstrates attentive, loving care
- **Long-term Engagement:** Preference discovery provides ongoing goals and satisfaction

## Activity Feed System - Text-Based Interaction Communication:

**Core Activity Feed Design:**
- **Non-Obtrusive Placement:** Dedicated panel (sidebar or bottom area) that complements main gameplay
- **Real-Time Updates:** Immediate text feedback for all interactions and behaviors
- **Natural Language:** Human-readable descriptions that feel conversational and engaging
- **Categorized Messages:** Player actions, guinea pig reactions, autonomous behaviors, environmental events

**Activity Message Examples:**

**Player Interactions:**
- "You place a cherry tomato in the food dish"
- "You offer your guinea pig a strawberry treat"
- "You gently pet your guinea pig behind the ears"
- "You clean the cage thoroughly"
- "You refresh the bedding with botanical hay"

**Guinea Pig Reactions (Preference Discovery):**
- "Guinea pig popcorns excitedly! ✨" (favorite food)
- "Guinea pig turns nose up at the broccoli" (disliked food)
- "Guinea pig munches happily - nom nom nom!" (preferred hay)
- "Guinea pig purrs contentedly during petting" (likes affection)
- "Guinea pig wheeks loudly for more treats!" (excited for food)

**Autonomous Behaviors:**
- "Guinea pig runs to the water bottle and drinks"
- "Guinea pig investigates the new tunnel curiously"
- "Guinea pig does zoomies around the cage!"
- "Guinea pig stretches and yawns in the sunbeam"
- "Guinea pig hides in the cozy shelter"

**Environmental Events:**
- "The bedding freshness is getting low"
- "Guinea pig drops a poop near the food dish"
- "Water level needs attention"
- "The cage could use a good cleaning"

**Development Strategy:**
- **Phase 1 (Immediate):** Full text-based system with emoji graphics (🐹 🍎 🏠)
- **Phase 2 (Enhancement):** Add animation system while keeping activity feed as information supplement
- **Integration Benefits:** Activity feed remains valuable even after animations for detailed information and accessibility

**Technical Implementation:**
- **TextInfoPanel Component:** Container-query responsive wrapper for text information display
  - `@container (width > 350px)`: Two-column stats layout with expanded activity feed
  - `@container (width < 250px)`: Compact single-column with abbreviated text and condensed stats
  - `@container (height > 400px)`: Full activity feed with extended message history (20+ messages)
  - `@container (height < 300px)`: Condensed view with only recent messages (5-8 messages)
- **ActivityFeedStream Component:** Enhanced scrollable, filterable message stream
  - Real-time message updates with smooth scroll animations
  - Container-query based message density adjustment
  - Emoji graphics with responsive sizing based on available space
- **Message Categories:** Actions, reactions, environment, achievements with color coding
- **QuickStatsCard Component:** Compact stats display with responsive text sizing
  - Shows critical information (friendship level, urgent needs)
  - Adapts text size and layout based on container width
- **ContextualActionSuggester:** Dynamic action recommendations based on guinea pig state
- **Performance:** Efficient message queuing, display management, and container observation
- **Accessibility:** Screen reader friendly text descriptions with semantic markup

**Gameplay Benefits:**
- **Immediate Feedback:** Players instantly understand what's happening
- **Preference Learning:** Clear text descriptions help discover guinea pig personality
- **Development Speed:** Much faster to implement than animation system
- **Rich Information:** More detailed context than animations alone could provide
- **Accessibility:** Works for all users regardless of visual capabilities

## System Integration & Architecture:

### **Store Communication Patterns:**
- **Game Controller Store** ↔ All other stores (game state, pause/resume, settings)
- **Guinea Pig Store** ↔ Needs Controller Store (entity data, preference discovery)
- **Guinea Pig Store** ↔ Habitat Conditions Store (habitat impact on guinea pig)
- **Needs Controller Store** ↔ Habitat Conditions Store (cross-condition effects)
- **Interval Management** → All stores with time-based updates

### **Component-Store Integration Map:**
- **ActivityFeed** ← All stores (activity message generation)
- **NeedBar, HappinessIndicator** ← Needs Controller Store
- **FriendshipMeter** ← Guinea Pig Store (friendship + wellness penalties)
- **HabitatStatusDisplay, ResourceCounter** ← Habitat Conditions Store
- **PreferenceTracker, PreferenceLearningHint** ← Guinea Pig Store
- **OrientationModal, ResponsiveDetector** ← Game Controller Store (responsive state, pause control)
- **Debug Components** ↔ Respective system stores

### **Event Flow & Dependencies:**
1. **Game Initialization:** Game Controller → UI Framework → Component Library → Logging System
2. **Guinea Pig Creation:** Creation System → Guinea Pig Store → Preferences Generation → Activity Feed
3. **Game Loop:** Interval Management → Needs Controller → Habitat Conditions → Activity Generation → UI Updates
4. **Player Interactions:** Direct Interaction System → Guinea Pig Store → Reaction System → Activity Feed → Sound System
5. **Autonomous Behaviors:** Autonomy System → Pathfinding → Guinea Pig Store → Activity Feed

### **Data Flow Architecture:**
- **Pinia Stores:** Centralized state management with reactive updates
- **Event Bus:** Cross-system communication for loosely coupled components
- **Activity Feed:** Central messaging system for all user-facing events
- **Logging System:** Comprehensive event tracking and debugging support
- **Debug Integration:** Development-time system monitoring and manipulation

### **Cross-System Dependencies:**
- **Phase 1** systems are foundational (no dependencies)
- **Phase 2** systems depend on Phase 1 completion
- **Phase 3** systems require guinea pig entity and needs framework
- **Phase 4** systems need complete game world and habitat system
- **Phase 5** systems enhance existing functionality without breaking dependencies

## Key Technical Considerations:
- Use `setInterval` with proper cleanup for game loops
- Implement efficient batch processing for multiple needs, wellness calculations, and habitat conditions
- Design for extensibility (easy to add new needs/features/habitat conditions)
- Use TypeScript interfaces for strong typing
- Consider performance with frequent state updates including wellness recalculation and habitat condition monitoring
- **Optimize habitat condition updates** - bedding decay, water consumption, cleanliness changes
- **Resource management efficiency** - track bedding inventory without excessive state updates
- **Responsive Performance Optimization:**
  - Throttle resize events (100-200ms) to prevent excessive layout recalculations
  - Debounce orientation changes (300ms) to avoid rapid modal show/hide
  - Use CSS media queries with JavaScript enhancement for efficient breakpoint detection
  - Minimize component re-renders when breakpoints change
- Implement pathfinding algorithm for guinea pig movement (A* or simple grid-based)
- Design behavior decision tree for autonomous actions
- **Future Animation Considerations:** Optimize animations for smooth guinea pig movement (CSS transforms/transitions) - implemented in Phase 5
- Mobile-first responsive design with touch interactions
- Ensure play/pause button is always accessible and visible
- Optimize for both mobile engagement and desktop robustness
- Consider PWA (Progressive Web App) features for mobile installation
- Implement audio context management for cross-browser compatibility
- Handle audio autoplay policies on mobile browsers
- State persistence strategy (localStorage vs IndexedDB for large data)
- Implement proper error boundaries and graceful degradation
- Consider WebGL/Canvas for habitat rendering if performance needed

## Gameplay Enhancement Ideas:
- **Guinea Pig Personality System:** Different personalities affect need priorities and behaviors
- **Seasonal Events:** Special items, decorations, and challenges during holidays
- **Multiple Guinea Pigs:** Allow caring for multiple pets with social interactions
- **Photo Mode:** Take and save pictures of your guinea pig in different poses
- **Daily Challenges:** Special tasks that reward extra currency/items
- **Guinea Pig Aging:** Visual changes and new needs as the pet grows older
- **Weather System:** Environmental changes that affect needs and available items
- **Mini-Games:** Interactive games with the guinea pig for bonding
- **Breeding System:** (Advanced) Raise baby guinea pigs with inherited traits
- **Community Features:** Share photos and compete in care challenges
- **Guinea Pig Genetics System:** Coat colors and patterns with inheritance mechanics
- **Habitat Themes:** Unlock different cage themes (forest, beach, winter, space)
- **Time Acceleration:** Speed up time when guinea pig is sleeping or content
- **Random Events:** Surprise visitors, lost toys, unexpected treats, vet visits
- **Guinea Pig Talents:** Special abilities that develop over time (acrobatics, singing, tricks)
- **Environmental Enrichment:** Interactive toys that provide cognitive stimulation
- **Health System:** Minor ailments that require specific care and vet visits
- **Guinea Pig Diary:** Auto-generated journal entries about daily activities
- **Customizable Sounds:** Record your own voice for guinea pig name calling
- **AR Mode:** (Advanced) Use device camera to place virtual guinea pig in real world
- **Seasonal Coat Changes:** Guinea pig appearance changes with seasons
- **Memory System:** Guinea pig remembers favorite foods, toys, and interaction spots
- **Social Media Integration:** Share achievements and photos to social platforms
- **Guinea Pig Olympics:** Compete in various guinea pig sports and activities

## Potential Conflicts Resolved:
- **FIXED:** Moved interval management from Game Controller to separate system
- **ENHANCED:** Added proper need interdependencies and thresholds
- **IMPROVED:** Made achievement system track meaningful gameplay milestones
- **CLARIFIED:** Separated settings from game controller for better organization