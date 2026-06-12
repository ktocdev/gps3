# Habitat Debug Development Plan

**Phase 3: Game World & Environment**
**Strategic Priority Shift:** Deprioritizing remainder of Phase 2.5 to focus on habitat foundation

## Strategic Rationale

Building the habitat in the debug panel first provides several critical advantages:

1. **Visual development environment** - See habitat conditions, items, and guinea pig interactions in real-time
2. **Natural eating patterns** - Guinea pigs can interact with placed items (hay rack, food dish) more realistically than artificial debug controls
3. **Integration testing** - Test how habitat conditions affect needs, wellness, and behavior
4. **Foundation for Phase 3** - The debug panel becomes the prototype for the actual habitat UI
5. **Better testing environment** - More realistic than debug panels alone for enhanced interactions and activity logs

## Phase 1: Habitat Conditions Store & Basic UI (System 11) ✅ **COMPLETED**

**Goal:** Create the foundational habitat conditions tracking system with debug panel

**Status:** Implemented and tested (Build successful - 283.63 KB JS, 85.99 KB CSS)

### Store Implementation ✅

Created `src/stores/habitatConditions.ts` (Pinia store) - 326 lines

#### Core State (0-100 Scale)
- **Cleanliness level** - Decreases with poop accumulation, restored by cleaning
  - Poop accumulation tracked per grid cell (small overlays, not full cell occupation)
  - Cleaning action removes all poop overlays from habitat grid
- **Bedding freshness** - Time-based decay rate varies by bedding quality, refreshed using bedding resource
- **Hay freshness** - Time-based decay (faster than bedding), critical for hunger satisfaction
- **Water level** - Decreases when guinea pig drinks, refilled for free

#### Resource Management
- **Bedding inventory** - Consumable resource with quality tiers affecting absorbency and longevity
  - **Cheap Bedding** - Low cost, lower absorbency, faster decay rate
  - **Average Bedding** - Balanced cost/performance, standard absorbency (starting resource: 2-3 units)
  - **Premium Bedding** - Higher cost, superior absorbency, slower decay rate
  - **Colorful Premium Bedding** - Premium quality + visual habitat color changes + wellness boost
- **Hay inventory** - Consumable resource, essential for hunger satisfaction
- **Consumption tracking** - Monitor usage rates and patterns across different bedding qualities
- **Inventory integration** - Connect to existing inventory system

#### Decay Mechanisms
- **Time-based decay** - Gradual deterioration aligned with game tick
- **Activity-based changes** - Rapid changes from guinea pig actions
- **Cross-condition dependencies** - Poor cleanliness accelerates bedding/hay decay
- **Maintenance actions** - Player interventions that improve conditions

#### Store State Structure
```typescript
interface HabitatConditionsState {
  // Core conditions (0-100)
  cleanliness: number
  beddingFreshness: number
  hayFreshness: number
  waterLevel: number

  // Tracking and history
  lastCleaningTime: number
  lastBeddingRefresh: number
  lastHayRefill: number
  lastWaterRefill: number
  conditionHistory: HabitatSnapshot[]

  // Resource management
  currentBedding: {
    type: string          // Bedding type (Cheap, Average, Premium, Colorful)
    quality: 'cheap' | 'average' | 'premium' | 'colorful-premium'
    absorbency: number    // Multiplier affecting cleanliness decay (cheap: 0.8x, average: 1x, premium: 1.3x, colorful: 1.3x)
    decayRate: number     // Bedding freshness decay modifier (cheap: 1.2x faster, average: 1x, premium: 0.7x, colorful: 0.7x)
    color?: string        // For colorful bedding: habitat visual color theme
  }
  beddingInventory: {
    cheap: number
    average: number       // Starts with 2-3 units
    premium: number
    colorfulPremium: { [color: string]: number }  // e.g., { blue: 1, pink: 2 }
  }
  currentHayBag: {
    type: string          // Hay variety (Timothy, Orchard Grass, etc.)
    handfulsRemaining: number  // 0-20 handfuls per bag
    bagId: string         // Reference to inventory item
  } | null
  consumptionRates: ConsumptionData

  // Debug testing flags
  freeResourcesEnabled: boolean  // When true, unlimited resources for testing

  // Alerts and notifications
  activeAlerts: HabitatAlert[]
  notificationSettings: AlertPreferences
}

interface HabitatSnapshot {
  timestamp: number
  cleanliness: number
  beddingFreshness: number
  hayFreshness: number
  waterLevel: number
}
```

### HabitatDebug Component ✅

Created `src/components/debug/HabitatDebug.vue` - 457 lines
Created `src/views/HabitatDebugView.vue` - 7 lines

#### Panel Layout Structure
- Single-column responsive layout (consistent with other debug panels)
- Panel system using existing design patterns (accent, bordered, compact variants)
- Constrained width below 1440px for readability
- Mobile-first responsive design

#### Condition Management Panel
**Core Features:**
- **Condition Sliders** - Manual adjustment of all 4 habitat conditions (0-100)
- **Real-time Status Display** - Color-coded progress bars with urgency indicators
  - Green (80-100): Good condition
  - Yellow (40-79): Warning state
  - Red (0-39): Critical condition
- **Current Values** - Numeric display with percentage
- **Last Maintenance** - Timestamp for each condition's last update

**Quick Action Buttons:**
- **Clean Cage** - Cleanliness → 100%, remove accumulated waste
- **Refresh Bedding** - Bedding freshness → 100%, consume bedding resource from inventory (effectiveness varies by bedding quality)
  - Cheap: Faster cleanliness decay (0.8x absorbency), faster bedding decay (1.2x)
  - Average: Standard performance (1x absorbency, 1x decay)
  - Premium: Better cleanliness retention (1.3x absorbency), slower bedding decay (0.7x)
  - Colorful Premium: Premium performance + visual habitat color + wellness bonus
- **Refill Hay Rack** - Add handful of hay from selected inventory bag, restore hay freshness based on hay type quality (standard bags: 20 handfuls)
- **Use Mini-Hay Bale** - Add 3 handfuls (premium treat option from supplies store)
  - More hunger satisfying per handful
  - Depletes faster (guinea pigs love it and eat more)
  - Provides play/enrichment bonus
  - Adds friendship points toward player (special treat appreciation)
- **Refill Water** - Water level → 100%, free action (infinite resource)

#### Resource Management Panel
**Inventory Display:**
- **Bedding Inventory** - Display all bedding types with quantities and quality indicators
  - Cheap Bedding: X units (low cost, faster decay)
  - Average Bedding: X units (starting: 2-3 units)
  - Premium Bedding: X units (slower decay, better absorbency)
  - Colorful Premium Bedding: X units by color (blue, pink, purple, green, etc.)
- **Current Bedding** - Show active bedding type, quality stats, and color (if colorful)
- **Bedding Selection** - Choose which bedding type to use for next refresh
- **Hay Bag Status** - Current bag type, handfuls remaining (X/20), critical shortage warnings when bag empty
- **Mini-Hay Bales** - Premium treat supplies, count in inventory, provides 3 handfuls per use
  - Higher hunger satisfaction per handful (1.5x vs regular hay)
  - Depletes faster (consumed more quickly due to tastiness)
  - +stimulation bonus when eaten
  - +friendship points when served (special treat appreciation)
- **Hay Selection** - Choose which hay bag from inventory to use for refilling
- **Quick Controls** - Add/consume resources for testing (standard hay bags, mini-bales, all bedding types)
- **Integration Button** - Jump to InventoryDebug for purchasing

**Debug Testing Controls:**
- **Enable Free Resources** - Checkbox toggle for unlimited resources (for testing without Supplies Store)
  - When enabled: All resources become unlimited (bedding, hay, mini-bales)
  - When enabled: No inventory depletion on use (resources remain at current levels)
  - When enabled: Visual indicator shows "FREE RESOURCES MODE" active
  - When disabled: Normal resource consumption and inventory tracking resumes
  - Purpose: Allows full habitat testing before Supplies Store system is implemented

**Resource Consumption:**
- **Usage Rates** - Display current consumption rates
- **Predictions** - Estimated time until resource depletion
- **Alert Thresholds** - Configure warning/critical levels

#### Decay Rate Controls
**Testing Features:**
- **Time Scale Adjustment** - Speed up/slow down decay for testing
- **Individual Decay Rates** - Adjust each condition's decay speed independently
- **Pause Decay** - Freeze all decay for static testing
- **Reset to Defaults** - Restore normal decay rates

#### Condition History Panel
**Visualization:**
- **Timeline Display** - Last hour of condition changes
- **Multi-line Chart** - All 4 conditions on single graph
- **Event Markers** - Show maintenance actions on timeline
- **Export Data** - Download history for analysis

#### Alert Testing Panel
**Notification Controls:**
- **Trigger Alerts** - Manually fire warning/critical notifications
- **Alert Preview** - View all possible alert messages
- **Threshold Testing** - Adjust alert trigger points
- **Alert History** - Log of recent notifications

### DebugView Integration ✅

Updated `src/views/DebugView.vue`

#### Add New Category ✅
Added "Environment Systems" category to `tabCategories`:
```typescript
{
  id: 'environment',
  label: 'Environment Systems',
  tabs: [
    {
      id: 'habitat',
      label: 'Habitat Debug',
      icon: '🏠',
      panelClass: 'tab-container__panel--constrained'
    }
  ]
}
```

#### Component Registration ✅
- Imported `HabitatDebugView`
- Added to template with `v-if="activeTab === 'habitat'"`
- Environment category navigation tab added

## Phase 2: Basic Habitat Grid & Item Placement (System 12 Foundation)

**Goal:** Visual habitat grid with drag-and-drop item placement

### Grid System Implementation

Create `src/stores/habitatItems.ts` (Pinia store)

#### Grid Data Structure
```typescript
interface HabitatItemsState {
  // Grid configuration - size varies by guinea pig count
  gridWidth: number   // 1 guinea pig: 6 cells (small cage), 2 guinea pigs: 10 cells (large cage)
  gridHeight: number  // 1 guinea pig: 4 cells (small cage), 2 guinea pigs: 6 cells (large cage)
  gridCells: GridCell[][]
  guineaPigCount: number  // Determines cage size

  // Placed items
  placedItems: PlacedItem[]

  // Poop tracking
  poopLocations: PoopLocation[]  // Each poop is 1/4 cell, can have multiple per cell

  // Item library
  availableItems: HabitatItem[]

  // Tracking
  itemUsageHistory: ItemUsageEvent[]
}

interface GridCell {
  x: number
  y: number
  occupied: boolean  // True if item occupies this cell
  itemId: string | null
  accessible: boolean
  stackedItems?: string[]  // IDs of stacked items (bed -> toy/chew -> shelter top)
  poopCount: number  // Number of poops in this cell (each poop = 1/4 cell visually)
}

interface PoopLocation {
  cellX: number
  cellY: number
  subPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'  // 1/4 cell positioning
  timestamp: number
}

interface PlacedItem {
  id: string
  itemId: string // Reference to item definition
  gridPosition: { x: number, y: number }
  gridSize: { width: number, height: number }  // 1x1, 2x1, 2x2, etc.
  effectiveness: number // 0-100, decreases over time
  durability: number // 0-100, wear from use
  lastUsed: number // timestamp
  usageCount: number
  noveltyBonus: number // Freshness bonus for recently placed items

  // Stacking properties
  isStackable: boolean  // Can this item be part of a stack?
  stackLayer?: 'bottom' | 'middle' | 'top'  // bed=bottom, toy/chew=middle, shelter-top=top
  stackedWith?: string[]  // IDs of items stacked with this one

  // Food container specific properties
  foodContents?: {
    hayHandfuls?: number        // Rack: 0-4, Bowl: 0-1, Plate: 0-3
    leafyGreensHandfuls?: number // Rack: 0, Bowl: 0-1, Plate: 0-2
    veggies?: FoodItem[]        // Rack: 0, Bowl: 0-1 piece (can combine with hay or greens), Plate: 0-3 pieces
    pellets?: FoodItem[]        // Optional supplement
  }
}

interface HabitatItem {
  id: string
  name: string
  type: 'essential' | 'enrichment' | 'comfort' | 'toy'
  category: 'food' | 'water' | 'shelter' | 'play' | 'sleep'
  gridSize: { width: number, height: number }  // Examples: bowl=1x1, plate=2x2, small-shelter=2x1, large-shelter=2x2
  baseEffectiveness: number
  durabilityDecayRate: number
  needsSatisfied: string[] // Array of need types
  cost: number
  defaultPlacement?: { x: number, y: number }

  // Stacking properties
  isStackable: boolean
  stackLayer?: 'bottom' | 'middle' | 'top'
  compatibleStackLayers?: string[]  // Which layers can stack with this item

  // Food container specific properties
  foodContainer?: {
    type: 'rack' | 'bowl' | 'plate'
    hayCapacity: number              // Rack: 4, Bowl: 1, Plate: 3
    leafyGreensCapacity: number      // Rack: 0, Bowl: 1 handful, Plate: 2 handfuls
    veggieCapacity: number           // Rack: 0, Bowl: 1 piece (can add to hay or greens), Plate: 3 pieces
    allowsVeggieWithMain: boolean    // Rack: false, Bowl: true (1 veggie piece can accompany hay or greens), Plate: true
    allowsMixedFoods: boolean        // Rack: false, Bowl: partial (hay or greens + 1 veggie), Plate: true (all combinations)
  }
}
```

#### Cage Size Based on Guinea Pig Count

**1 Guinea Pig - Small Cage:**
- Grid dimensions: 6 cells wide × 4 cells tall = **24 total cells**
- Guinea pig occupies: 1 cell
- Starting items occupy: ~6-8 cells
- Free movement space: ~15-17 cells (66-70% free space)
- Realistic representation of minimum recommended cage size

**2 Guinea Pigs - Large Cage:**
- Grid dimensions: 10 cells wide × 6 cells tall = **60 total cells**
- Guinea pigs occupy: 2 cells
- Starting items occupy: ~10-14 cells
- Free movement space: ~44-48 cells (73-80% free space)
- Realistic representation of recommended cage size for pair

**Guinea Pig Size:**
- Each guinea pig = 1 cell (same as food bowl)
- Guinea pigs can move to any accessible cell
- Cannot occupy cells with non-stackable items

#### Default Starting Items

**Small Cage (1 Guinea Pig) - 6×4 grid:**
1. **Water Bottle** - Top-right (5,0) - 1×1 cell, full
2. **Food Bowl** - Bottom-left (0,3) - 1×1 cell, pre-filled with 1 handful of hay
3. **Hay Rack** - Bottom-center (2,3) - 1×1 cell, pre-filled with 4 handfuls of hay
4. **Small Shelter** - Center-right (4,1) - 2×1 cells (2 cells total)
5. **Small Chew Toy** - Center-left (1,1) - 1×1 cell

**Large Cage (2 Guinea Pigs) - 10×6 grid:**
1. **Water Bottle** - Top-right (9,0) - 1×1 cell, full
2. **Food Bowl** - Bottom-left (0,5) - 1×1 cell, pre-filled with 1 handful of hay
3. **Hay Rack** - Bottom-center (4,5) - 1×1 cell, pre-filled with 4 handfuls of hay
4. **Small Shelter** - Center-right (7,2) - 2×1 cells (2 cells total)
5. **Large Shelter** - Center-left (1,2) - 2×2 cells (4 cells total)
6. **Small Chew Toy** - Mid-left (2,4) - 1×1 cell

#### Starting Resources & Inventory
New game begins with essential supplies to get player started:
- **Average Bedding** - 2-3 units (standard quality, balanced absorbency and longevity)
- **Extra Hay** - 1 full bag (20 handfuls, player's choice of hay type or default Timothy)
- **Hay Rack & Bowl** - Both pre-filled with hay (ready for immediate guinea pig care)
- **Currency** - Starting money for additional purchases from pet store/supplies store

#### Item Sizes & Grid Occupation

**Food Containers:**
- **Hay Rack:** 1×1 cell, holds 4 handfuls of hay (hay only)
- **Food Bowl:** 1×1 cell, holds 1 handful of hay OR 1 other food (not mixed)
- **Food Plate (Upgrade):** 2×2 cells (4 cells total), holds 3 handfuls of hay + multiple other foods simultaneously

**Shelters:**
- **Small Shelter:** 2×1 cells (2 cells horizontal)
- **Large Shelter:** 2×2 cells (4 cells total)
- **Shelter Top (Stackable):** Same footprint as base item, placed on top layer

**Beds, Toys, Chews:**
- **Small Bed:** 1×1 cell (stackable - bottom layer)
- **Large Bed:** 2×1 cells (stackable - bottom layer)
- **Small Chew Toy:** 1×1 cell (stackable - middle layer)
- **Large Toy:** 2×1 cells (stackable - middle layer)

**Other:**
- **Water Bottle:** 1×1 cell (attached to wall, not stackable)
- **Guinea Pig:** 1×1 cell (moves freely to accessible cells)
- **Poop:** 1/4 cell visual (4 poops can fit in one cell, positioned in quadrants)

#### Item Stacking System

**Stacking is Optional - All items can be placed independently:**
- **Beds** - Can be placed alone OR stacked with toys/chews/shelter tops
- **Toys/Chews** - Can be placed alone OR stacked with beds/shelter tops
- **Shelter Tops** - Can be placed alone OR stacked with beds/toys/chews
- **Standalone Shelters** - Cannot be stacked (always independent items)
- **Food/Water** - Cannot be stacked (always independent items)

**When Stacking (Optional):**
- **Layer Preference:** Bed (bottom) → Toy/Chew (middle) → Shelter Top (top)
- **Footprint Matching:** All stacked items must have same grid footprint (1×1 or 2×1 or 2×2)
- **Flexible Combinations:** Any valid combination of stackable items works
- **Stack Height:** Maximum 3 items stacked together

**Valid Stacking Examples:**
- Bed alone (1×1)
- Toy alone (1×1)
- Shelter top alone (1×1)
- Bed (1×1) + Toy (1×1)
- Bed (1×1) + Shelter top (1×1)
- Toy (1×1) + Shelter top (1×1)
- Bed (1×1) + Toy (1×1) + Shelter top (1×1)
- Large bed (2×1) + Large shelter top (2×1)

**Invalid Stacking:**
- Mismatched footprints: Small bed (1×1) + Large shelter top (2×2)
- More than 3 items in one stack
- Stacking food/water/standalone shelters

**Stacking Benefits:**
- **Space efficiency:** More items in limited cage space (especially critical in small 6×4 cage)
- **Enhanced benefits:** Certain combinations provide bonuses (bed + shelter top = +30% sleep quality)
- **Realistic design:** Mimics real guinea pig cage setups with multi-level hideouts
- **Strategic depth:** Players optimize vertical space while maintaining variety

#### Food Types & Daily Requirements

**Food Categories:**
1. **Hay** - Unlimited, always available (primary food source)
2. **Leafy Greens** - Daily requirement: Maximum 2 handfuls/day (romaine lettuce, green leaf lettuce, kale, spinach, etc.)
3. **Veggies** - Treats: Maximum 3 pieces/day total (cherry tomato, carrot slice, cucumber slice, bell pepper piece, etc.)
4. **Pellets** - Optional supplement (small amount if offered)

**Preferences:**
- Guinea pigs have **leafy greens likes/dislikes** (separate from veggie preferences)
- Guinea pigs have **veggie likes/dislikes** (cherry tomatoes, carrots, cucumbers, etc.)
- Hay preferences already exist (Timothy, Orchard Grass, etc.)

**Serving Sizes:**
- **Leafy greens:** Served in "handfuls" (loose greens like a handful of romaine)
- **Veggies:** Served in "pieces" (1 cherry tomato, 1 slice of carrot, 1 cucumber slice)
- **Hay:** Served in "handfuls" from hay bags

#### Food Serving Methods
Different food containers with varying capacities and food type support:

**Hay Rack (1×1 cell):**
- **Capacity:** 4 handfuls of hay only
- **Food Types:** Hay only (dedicated hay dispenser)
- **Usage:** Primary hay source, encourages natural grazing behavior
- **Refill:** Add 1 handful at a time (or 3 from mini-bale)
- **Strategic Value:** Highest capacity for hay, but can't serve other foods, space-efficient

**Food Bowl (1×1 cell):**
- **Capacity:** (1 handful of hay OR 1 handful of leafy greens) + optional 1 piece of veggie
- **Food Types:** Can hold hay OR leafy greens as base, plus can add 1 veggie piece on top
- **Usage:** Versatile, allows simple combination serving
- **Refill:** Must empty hay/greens before switching, but can always add 1 veggie piece
- **Strategic Value:** Flexibility for different food types, can provide greens + veggie treat in one bowl, space-efficient
- **Examples:**
  - Bowl with 1 handful of romaine lettuce + 1 cherry tomato
  - Bowl with 1 handful of hay + 1 carrot slice
  - Bowl with 1 handful of romaine lettuce (no veggie)
  - Bowl with 1 cherry tomato only (veggie treat without greens/hay)

**Food Plate (2×2 cells - Purchasable Upgrade):**
- **Capacity:** 3 handfuls of hay + 2 handfuls of leafy greens + 3 pieces of veggies simultaneously
- **Food Types:** Hay + leafy greens + veggies all at once (mixed servings)
- **Usage:** Premium feeding solution, allows complete variety in one location
- **Refill:** Can add different food types without emptying
- **Strategic Value:** Convenience and variety, reduces refill frequency, supports complete nutrition in one spot
- **Trade-off:** Takes up 4 cells - significant space commitment in small cage (17% of small cage!)
- **Example:** Plate with 3 handfuls hay + 2 handfuls romaine + 1 cherry tomato + 1 carrot slice + 1 cucumber piece

#### Placement Validation

**Basic Rules:**
- **Grid bounds checking** - Items must fit within grid dimensions
- **Overlap prevention** - No items can occupy same cells (except stacking)
- **Accessibility rules** - Items must be reachable from at least one adjacent cell
- **Guinea pig movement** - Must maintain pathways for guinea pig to navigate

**Stacking Validation (When Player Chooses to Stack):**
- **Footprint matching** - All stacked items must have identical grid footprint
- **Layer preference** - Visual layer order: bed (bottom) → toy/chew (middle) → shelter top (top)
- **Flexible stacking** - Any combination of stackable items works (bed+toy, toy+shelter, bed+shelter, all three, etc.)
- **One item per layer type** - Each layer can only have one item
- **Independence** - All stackable items can also be placed alone without stacking

**Item-Specific Constraints:**
- **Water bottles** - Must be against a wall (edge cell)
- **Food plates** - Need 2×2 clear space, cannot be stacked
- **Shelters** - Need entrance side accessible (at least one adjacent cell open)
- **Non-stackable items** - Food containers, water bottles, standalone shelters block stacking

### HabitatDebug Grid Visualization Enhancement

#### Grid Display Panel
**Visual Habitat Grid:**
- **CSS Grid Layout** - Responsive to guinea pig count:
  - 1 guinea pig: 6×4 grid (24 cells total)
  - 2 guinea pigs: 10×6 grid (60 cells total)
- **Habitat Background Color** - Visual theme based on current bedding:
  - Cheap/Average/Premium (no color): Default neutral background
  - Colorful Blue: Soft blue tinted background
  - Colorful Pink: Soft pink tinted background
  - Colorful Purple: Soft purple tinted background
  - Colorful Green: Soft green tinted background
  - Colorful Yellow: Soft yellow tinted background
  - Colorful Orange: Soft orange tinted background
- **Cell Rendering** - Each cell shows:
  - Occupied/empty state
  - Item visual representation (icon or sprite via Iconify)
  - Effectiveness color coding (green/yellow/red)
  - Grid coordinates (in dev mode)
  - **Food container contents** - Visual indicators for hay handfuls and other foods
  - **Poop accumulation** - Small text-based indicators (not full cell) overlaid on cells with waste
- **Responsive Sizing** - Grid scales to available space
- **Visual Feedback** - Hover states, valid/invalid placement indicators

**Poop Visualization:**
- **Size:** Each poop = 1/4 cell visual (25% of cell area)
- **Positioning:** Up to 4 poops per cell in quadrants:
  - Top-left quadrant
  - Top-right quadrant
  - Bottom-left quadrant
  - Bottom-right quadrant
- **Small Overlay Indicators** - Rendered as small text/icon overlays, NOT blocking cell usage
- **Text-Based Display** - Use small text characters or tiny icons (much smaller than guinea pig/items)
- **Accumulation Display** - As poops accumulate, cell fills with tiny indicators in quadrants
- **Icon Options** - Iconify icon families for tiny poop indicators:
  - Material Design Icons (mdi): `mdi:circle-small` size xs
  - Carbon Icons (carbon): `carbon:dot-mark` size xs
  - Simple text: Small brown/dark circles or periods
  - Visual size: ~6-8px (compared to guinea pig/item ~40-60px)
- **Visual Hierarchy** - Poop indicators much smaller than guinea pig (1/4 size) to avoid visual clutter
- **Cleanliness Correlation** - More poop accumulation = lower cleanliness value = more quadrants filled
- **Cleaning Effect** - Cage cleaning removes all poop indicators, returns cells to clean state

**Food Container Visualization:**
- **Hay Level Indicators** - Visual representation of handfuls remaining
  - Hay Rack (1×1): 0-4 handfuls (progress bar or fill indicator)
  - Food Bowl (1×1): 0-1 handful (full/empty state)
  - Food Plate (2×2): 0-3 handfuls (progress bar or fill indicator spanning 4 cells)
- **Food Type Icons** - Show what's currently in container (hay, veggie, treat)
- **Capacity Warnings** - Color coding for low/empty containers
- **Mixed Food Display** - Plate (2×2) shows multiple food types simultaneously across its 4-cell footprint

**Item Stacking Visualization:**
- **Layered Display** - Stacked items shown with visual depth/layers
- **Bottom Layer (Bed)** - Base foundation visible
- **Middle Layer (Toy/Chew)** - Rendered on top of bed
- **Top Layer (Shelter Top)** - Roof/cover rendered above all
- **Visual Cues** - Shading, borders, or z-index to show stacking depth
- **Hover Details** - Show all stacked items in tooltip when hovering over stacked cell

**Grid Controls:**
- **Guinea Pig Count Toggle** - Switch between 1 pig (6×4 small cage) and 2 pigs (10×6 large cage)
- **Grid Size Manual Adjustment** - Fine-tune dimensions (4×4 to 12×8) for testing
- **Show Grid Lines** - Toggle cell boundaries
- **Show Coordinates** - Toggle grid position labels
- **Show Stacking Layers** - Toggle visual layer indicators for debugging stacks
- **Reset Layout** - Restore default item positions for current cage size

#### Drag & Drop Interface
**Item Movement:**
- **Click-and-Drag** - Move existing items to new positions
- **Visual Dragging** - Item follows cursor with transparency
- **Drop Validation** - Green outline for valid positions, red for invalid
- **Auto-Snap** - Items snap to grid cells on drop
- **Cancel Drag** - ESC key or drag outside grid

**Placement Feedback:**
- **Valid Position** - Green cell highlighting
- **Invalid Position** - Red cell highlighting with tooltip explaining why
- **Adjacency Indicators** - Show accessible cells when dragging
- **Synergy Highlights** - Show beneficial proximity (bed near shelter)

#### Item Management Panel
**Available Items List:**
- **Item Catalog** - Scrollable list of all habitat items
- **Category Filters** - Filter by type (essential, enrichment, comfort, toys)
- **Quick Add** - Click to add item to grid (place in first valid position)
- **Item Details** - Hover for stats (effectiveness, durability, cost)

**Placed Items Management:**
- **Active Items List** - All currently placed items
- **Item Statistics:**
  - Current effectiveness (0-100%)
  - Durability remaining (0-100%)
  - Last used timestamp
  - Usage count
  - Novelty bonus (freshness)
  - **Food container contents** (if applicable):
    - Hay handfuls: X/4 (rack), X/1 (bowl), X/3 (plate)
    - Other foods: List of vegetables/treats currently in container
- **Quick Actions:**
  - Remove from grid
  - Reset effectiveness
  - Reset durability
  - Teleport to position
  - **Refill container** (for food items) - Add hay handfuls or other foods
  - **Empty container** (for food items) - Clear all contents

**Item Effectiveness Panel:**
- **Visual Effectiveness Indicators** - Color-coded status for each item
  - Green (80-100%): Fresh/effective
  - Yellow (40-79%): Wearing/stale
  - Red (0-39%): Worn/very stale
- **Staleness Tracking** - Time since last novelty refresh
- **Usage Frequency** - Heatmap showing most/least used items
- **Rotation Recommendations** - Suggest which items to rotate

## Phase 3: Guinea Pig Interaction with Habitat Items

**Goal:** Guinea pigs autonomously use placed items based on needs

### Autonomous Item Usage System

#### Need-Based Item Selection
**Item Selection AI:**
- **Hunger** → Hay rack (if hay fresh > 40%), Food dish (if food present)
- **Thirst** → Water bottle (if water level > 0%)
- **Shelter** → Shelters, hideouts (preference-based selection)
- **Play/Stimulation** → Toys, tunnels, chew items
- **Comfort** → Beds, soft hideouts, cozy shelters
- **Social** → Multi-guinea pig items, shared spaces

**Selection Priority Algorithm:**
1. Check need urgency (lowest need gets priority)
2. Find items that satisfy that need
3. Filter by availability (not in use, accessible)
4. Rank by preference match (guinea pig preferences)
5. Rank by effectiveness (fresher/better items preferred)
6. Rank by proximity (closer items preferred)
7. Select highest-ranked item

#### Usage Patterns & Behaviors
**Realistic Interaction:**
- **Approach Animation** - Guinea pig moves to item's grid position
- **Interaction Duration** - Varies by item type and need urgency
  - Hay eating: 10-15 seconds (partial consumption)
  - Water drinking: 3-5 seconds
  - Shelter hiding: 30-60 seconds (longer if stressed)
  - Toy play: 15-30 seconds
  - Bed sleeping: 60-300 seconds (based on energy need)
- **Need Satisfaction** - Item usage increases corresponding need value
- **Effectiveness Impact** - Better items provide faster/greater satisfaction

**Usage Tracking:**
- **Item Usage Counter** - Increment each time item is used
- **Last Used Timestamp** - Record when guinea pig last interacted
- **Cumulative Duration** - Total time spent with each item
- **Preference Learning** - Track which items are favorites (used more often)

#### Eating Pattern Integration
**Natural Eating Mechanics:**
- **Hay Eating (Unlimited):**
  - Duration: 10-15 seconds per eating session
  - Consumption: 30-70% hunger satisfaction (partial, realistic)
  - Hay depletion: Each eating session consumes 1 handful from container
  - Frequency: Multiple eating sessions throughout day
  - Critical dependency: Requires hay freshness above personality threshold AND handfuls in container > 0
  - Empty container: Guinea pig cannot eat autonomously from that container

- **Leafy Greens Eating (Daily Requirement: 2 handfuls):**
  - Duration: 8-12 seconds per handful
  - Consumption: 15-25% hunger satisfaction per handful
  - Daily limit: Maximum 2 handfuls/day (hard limit, nutritional balance)
  - Preference impact: Liked greens eaten eagerly, disliked greens eaten reluctantly or refused
  - Examples: Romaine lettuce, green leaf lettuce, kale (small amounts), spinach (small amounts)
  - Can be served in bowl (1 handful) or plate (2 handfuls)

- **Veggie Eating (Treats: Max 3 pieces/day):**
  - Duration: 5-8 seconds per piece
  - Consumption: 5-15% hunger satisfaction per piece (smaller than greens)
  - Daily limit: Maximum 3 pieces total across all veggie types
  - Preference impact: Liked veggies provide stimulation/wellness bonus, disliked veggies may be refused
  - Examples: Cherry tomato (1 piece), carrot slice (1 piece), cucumber slice (1 piece), bell pepper piece (1 piece)
  - Can be served alone, with hay, or with leafy greens in bowl

- **Food Bowl Eating:**
  - Capacity: (1 handful of hay OR 1 handful of leafy greens) + optional 1 piece of veggie
  - Can serve hay with veggie, greens with veggie, or just veggie alone
  - Must empty hay/greens before switching between them, but veggie can be added anytime
  - Examples: "Romaine + cherry tomato", "Hay + carrot slice", "Cherry tomato only"

- **Food Plate Eating (Premium):**
  - Capacity: 3 handfuls of hay + 2 handfuls of leafy greens + 3 pieces of veggies simultaneously
  - Guinea pig can choose from variety autonomously (will prioritize based on preferences and needs)
  - Supports complete daily nutrition in one location (hay + 2 handfuls greens + veggie treats)
  - Convenience reduces player micromanagement

**Consumption Limits:**
- **Hay** - Unlimited, always available (primary food source)
- **Leafy Greens** - Maximum 2 handfuls/day (hard limit, nutritional requirement)
- **Veggies** - Maximum 3 pieces/day total (hard limit, prevents overfeeding treats)
- **Cooldown Periods** - Time between eating sessions (~30-60 minutes)
- **Hunger Threshold** - Won't eat if hunger > 80%
- **Preference Filtering** - Won't eat disliked foods even if hungry (may skip disliked leafy greens or veggies)

### HabitatDebug Guinea Pig Activity Enhancement

#### Guinea Pig Position Tracking Panel
**Real-Time Location:**
- **Grid Position Display** - Show guinea pig's current cell (x, y)
- **Visual Indicator** - Guinea pig sprite/icon on grid
- **Movement Path** - Show last 10 positions (trail visualization)
- **Target Destination** - Highlight where guinea pig is heading

**Activity State:**
- **Current Action** - Display active interaction
  - "Eating hay from hay rack"
  - "Drinking water"
  - "Hiding in small shelter"
  - "Playing with chew toy"
  - "Sleeping on cozy bed"
  - "Wandering" (exploring)
- **Duration Timer** - How long current action has been happening
- **Action Progress** - Visual progress bar for timed actions

#### Item Usage History Panel
**Recent Interactions (Last 10):**
- **Timestamp** - When interaction occurred
- **Item Name** - Which item was used
- **Duration** - How long interaction lasted
- **Need Satisfied** - Which need was addressed
- **Effectiveness** - How much need value increased
- **Preference Match** - Whether item matched guinea pig's preferences

**Usage Statistics:**
- **Most Used Items** - Ranked list of favorites
- **Least Used Items** - Items being ignored (rotation candidates)
- **Average Session Duration** - Per item type
- **Total Usage Time** - Cumulative time with each item

#### Eating Status Visualization Panel
**Current Eating State:**
- **Eating Active** - Boolean indicator (is guinea pig currently eating?)
- **Eating Duration Timer** - Real-time countdown (10-15s for hay)
- **Partial Consumption Tracker** - Show 30-70% progress bar
- **Hunger Satisfaction** - How much hunger has increased this session
- **Food Type** - What's being consumed (hay, veggie, treat)

**Eating Cycle Tracking:**
- **Last Meal Timestamp** - When guinea pig last ate
- **Time Until Next Meal** - Estimated next eating session
- **Daily Consumption Log:**
  - Hay sessions: Count and total duration (unlimited)
  - Leafy greens: Handfuls consumed / 2 recommended (e.g., "1/2 handfuls")
  - Veggies: Pieces consumed / 3 max (e.g., "2/3 pieces")
- **Consumption Limits Status:**
  - Leafy greens available today: 2-X handfuls remaining (hard limit)
  - Veggies available today: 3-X pieces remaining (hard limit)

**Hay Rack Dependency:**
- **Hay Freshness Level** - Current hay rack freshness %
- **Handfuls Remaining** - X/20 handfuls in current bag
- **Autonomous Eating Status:**
  - Green: "Can eat autonomously" (freshness > 40% AND handfuls > 0)
  - Yellow: "Hay getting stale or low" (freshness 20-40% OR handfuls < 5)
  - Red: "Cannot eat - hay rack empty/stale" (freshness < 20% OR handfuls = 0)
- **Alert Indicator** - Critical warning when hay prevents feeding

#### Preference-Based Usage Patterns
**Preference Matching:**
- **Item Preference Score** - How well item matches guinea pig's preferences
- **Usage Frequency Correlation** - Show relationship between preference and usage
- **Effectiveness Multiplier** - Preferred items provide bonus satisfaction (1.25x)
- **Favorite Item Highlighting** - Visual indicator on preferred items in grid

#### Personality-Based Habitat Sensitivity (New Trait)

**Cleanliness Trait (1-10)** - New 5th personality trait affecting habitat condition tolerance:

**Picky/Particular (High Cleanliness 7-10):**
- **Finicky about freshness** - Reduced tolerance for stale hay, old bedding, dirty habitat
- **Higher standards** - Comfort need decays faster when habitat conditions drop below 60%
- **Hay freshness threshold** - Won't eat hay below 60% freshness (vs 40% baseline)
- **Bedding sensitivity** - Bedding freshness below 50% causes comfort penalties
- **Cleanliness stress** - Cage cleanliness below 50% causes anxiety (-5 to -10 comfort/hour)
- **Activity messages:**
  - "Guinea pig wrinkles nose at the stale hay"
  - "Guinea pig seems uncomfortable with the messy cage"
  - "Guinea pig appreciates the fresh, clean habitat!"

**Piggy/Unbothered (Low Cleanliness 1-3):**
- **Tolerant of mess** - Will eat hay down to 20% freshness (vs 40% baseline)
- **Unfazed by dirt** - Comfort need unaffected until cleanliness drops below 30%
- **Not picky** - Bedding freshness doesn't impact comfort until below 25%
- **Easy-going** - No stress penalties from habitat conditions unless critical (< 20%)
- **Activity messages:**
  - "Guinea pig happily munches the hay without concern"
  - "Guinea pig doesn't seem bothered by the messy cage"
  - "Guinea pig is content in any conditions"

**Moderate Cleanliness (4-6):**
- **Baseline behavior** - Standard thresholds (40% hay, 40% bedding, 40% cleanliness)
- **Balanced tolerance** - Neither finicky nor unbothered

**Cleanliness Modifiers:**
```typescript
// Hay freshness eating threshold
hayFreshnessThreshold = {
  picky (7-10): 60%      // Won't eat below this
  moderate (4-6): 40%    // Baseline
  piggy (1-3): 20%       // Very tolerant
}

// Comfort penalty from poor cleanliness
if (cleanliness < cleanlinessThreshold) {
  const cleanlinessPersonality = guineaPig.personality.cleanliness
  if (cleanlinessPersonality >= 7) {
    // Picky: starts penalties at 50%, severe at 30%
    comfortPenalty = (50 - cleanliness) * 0.3
  } else if (cleanlinessPersonality <= 3) {
    // Piggy: only penalized below 30%, mild penalties
    comfortPenalty = cleanliness < 30 ? (30 - cleanliness) * 0.1 : 0
  } else {
    // Moderate: baseline penalties starting at 40%
    comfortPenalty = (40 - cleanliness) * 0.2
  }
}

// Bedding freshness comfort impact
if (beddingFreshness < beddingThreshold) {
  if (cleanlinessPersonality >= 7) {
    // Picky: uncomfortable with bedding < 50%
    beddingPenalty = (50 - beddingFreshness) * 0.2
  } else if (cleanlinessPersonality <= 3) {
    // Piggy: only cares below 25%
    beddingPenalty = beddingFreshness < 25 ? (25 - beddingFreshness) * 0.1 : 0
  }
}
```

**Debug Panel Display:**
- **Cleanliness Trait Slider** - Adjust 1-10 for testing
- **Current Thresholds Display** - Show active hay/bedding/cleanliness thresholds based on personality
- **Penalty Visualization** - Real-time comfort penalties from habitat conditions
- **Personality Type Label:**
  - "Picky Princess" (9-10)
  - "Particular Pig" (7-8)
  - "Balanced" (4-6)
  - "Easy-Going" (2-3)
  - "Total Piggy" (1)

## Phase 4: Advanced Features & Polish

**Goal:** Complete habitat ecosystem with realistic behaviors

### Enhanced Item Interactions

#### Bed-Shelter Proximity Bonus System
**Proximity Detection:**
- **Adjacent Cell Checking** - Detect bed-shelter combinations within 1 grid space
- **Bonus Calculation** - +30% enhanced benefits when combined
- **Visual Feedback** - UI indicators showing active synergies
- **Effect Display** - Show "Enhanced Rest Area" status

**Enhanced Benefits (Need Satisfaction Bonuses):**
- **Energy (Sleep)** - +30-50% faster energy restoration when resting in bed near shelter
- **Comfort** - +20-30% comfort satisfaction from feeling secure while resting
- **Security (Shelter Need)** - Enhanced sense of safety during sleep (+25% shelter satisfaction)
- **Stimulation (for Shy Guinea Pigs)** - Low boldness guinea pigs gain +10-15% stimulation from "cozy hideaway" appeal
- **Overall Wellness** - Combined effect contributes +5-10% to overall wellness during rest periods

**Personality Interactions:**
- **Low Boldness (1-3):** Maximum benefit (+50% energy, +30% comfort, +15% stimulation) - shy guinea pigs love secure sleeping spots
- **High Boldness (7-10):** Reduced benefit (+30% energy, +20% comfort, no stimulation bonus) - confident guinea pigs care less about security
- **Moderate Boldness (4-6):** Standard benefit (+40% energy, +25% comfort, +5% stimulation)

#### Item Rotation System
**Staleness Tracking:**
- **Novelty Duration** - Items remain "fresh" for configurable period (7-14 days)
- **Effectiveness Decay** - Gradual reduction after novelty period ends
- **Boredom Factor** - Repeated use accelerates staleness
- **Visual Staleness Indicators** - Color shift from green → yellow → red

**Storage & Rotation Mechanics:**
- **Item Storage** - Remove items to habitat inventory
- **Storage Capacity** - Limited slots encourage strategic planning
- **Reintroduction Bonus** - Stored items regain partial novelty when replaced
- **Rotation Recommendations** - System suggests optimal rotation timing

**Novelty Refresh:**
- **New Item Bonus** - 100% effectiveness for first week
- **Rotation Bonus** - 75% effectiveness when reintroduced after storage
- **Familiarity Penalty** - Continuous use reduces to 50% effectiveness over time

#### Quality & Durability System
**Item Quality Tiers:**
- **Basic** - 100% base effectiveness, faster durability decay
- **Standard** - 125% base effectiveness, normal durability decay
- **Premium** - 150% base effectiveness, slower durability decay

**Durability Mechanics:**
- **Usage-Based Wear** - Durability decreases with each interaction
- **Decay Rates** - Varies by item type and quality tier
- **Visual Wear Indicators** - Items show damage states
- **Replacement Timing** - Items below 20% durability need replacement
- **Disposal** - Remove worn items from habitat

### HabitatDebug Advanced Testing Features

#### Simulation Testing Panel
**Time Acceleration:**
- **24-Hour Simulation** - Fast-forward through full day cycle
- **Condition Decay Testing** - Watch all conditions deteriorate
- **Resource Depletion** - Simulate bedding/hay running out
- **Item Wear Simulation** - Accelerate durability decay

**Multi-Guinea Pig Testing:**
- **Add Second Guinea Pig** - Test with 2 guinea pigs (maximum allowed)
- **Shared Resource Consumption** - Faster decay with multiple residents
- **Item Competition** - Guinea pigs compete for items
- **Social Interaction** - Shared item usage patterns

**Emergency Scenarios:**
- **Empty Hay Rack** - Test critical failure (no autonomous feeding)
- **All Resources Depleted** - Simultaneous bedding/hay shortage
- **Critical Cleanliness** - Maximum filth conditions
- **Item Failure** - All items at 0% effectiveness

#### Integration Testing Panel
**Needs System Integration:**
- **Habitat → Needs Flow** - Show how conditions affect needs
- **Low Cleanliness Test** - Slower comfort need recovery
- **Empty Hay Impact** - Hunger cannot be satisfied autonomously
- **Stale Hay Test** - Reduced hunger satisfaction (50-70% effectiveness)
- **Water Depletion** - Thirst satisfaction blocked

**Wellness Integration:**
- **Wellness Calculation** - Show habitat's contribution to overall wellness
- **Penalty Visualization** - Poor conditions reduce wellness score
- **Recovery Testing** - Good conditions support needs recovery

**Activity Feed Integration:**
- **Message Testing** - Trigger all habitat-related messages
- **Event Logging** - Verify maintenance actions logged correctly
- **Interaction Messages** - Test guinea pig item usage descriptions

#### Analytics & Monitoring Panel
**Performance Metrics:**
- **Update Frequency** - Tick rate for condition updates
- **Performance Impact** - CPU/memory usage monitoring
- **Optimization Testing** - Batch processing validation

**Balance Validation:**
- **Decay Rate Analysis** - Are conditions balanced?
- **Resource Consumption** - Are costs reasonable?
- **Item Effectiveness** - Are bonuses working correctly?
- **Difficulty Tuning** - Adjust for appropriate challenge

**Data Export:**
- **Condition History CSV** - Export timeline data
- **Item Usage Statistics** - Export interaction logs
- **Resource Consumption Report** - Export bedding/hay usage
- **Balance Report** - Summary of decay rates, costs, effectiveness

## Technical Implementation Details

### File Structure
```
src/stores/
├── habitatConditions.ts      (Phase 1 - Core conditions tracking)
├── habitatItems.ts            (Phase 2 - Grid and item placement)

src/components/debug/
├── HabitatDebug.vue           (Phase 1-4 - Main debug component)

src/views/
├── HabitatDebugView.vue       (Phase 1 - Debug view wrapper)

src/composables/
├── useHabitatConditions.ts    (Optional - Reusable condition logic)
├── useHabitatGrid.ts          (Optional - Grid interaction logic)
```

### Files to Update
```
src/views/DebugView.vue               (Add habitat tab to navigation)
src/stores/needsController.ts         (Integrate habitat conditions)
src/stores/guineaPigStore.ts          (Add eating state, item interaction, position tracking)
src/stores/inventory.ts               (Bedding/hay resource consumption)
```

### Design Patterns (Consistent with Existing)

#### Component Structure
- **Script Setup** - `<script setup lang="ts">` composition API
- **TypeScript** - Explicit types for all props, emits, state
- **Pinia Stores** - State management via stores, not component state
- **Composables** - Reusable logic extracted to composables when appropriate
- **Icon Component** - Use `<Icon>` component with Iconify for all icons
  - Supports multiple icon families via `family` prop (flowbite, mdi, carbon, heroicons, lucide, etc.)
  - Default family: `flowbite`
  - Can specify full icon name with family prefix: `icon="mdi:circle-small"`
  - Or use family prop: `family="mdi" icon="circle-small"`

#### Layout Patterns
- **Single-Column** - Mobile-first, responsive layout
- **Panel System** - Consistent panel components:
  - `panel--compact` - Reduced padding
  - `panel--accent` - Highlighted panel
  - `panel--bordered` - Visible borders
- **Constrained Width** - Max 1440px for readability
- **Container Queries** - Component-responsive design

#### UI Components
- **SliderField** - Range input with value display
- **Button** - Smart disable states with tooltips
- **InfoButton** - Contextual help tooltips
- **ProgressBar** - Visual value representation with color coding

#### Color-Coded Status
- **Good (Green)** - 80-100% values
- **Warning (Yellow)** - 40-79% values
- **Critical (Red)** - 0-39% values
- **Urgency Data Attributes** - `data-need-urgency="good|warning|critical"`

#### Action Button States
- **Disabled When:**
  - Game paused (`gameController.isPaused`)
  - System paused (e.g., `needsController.processingEnabled === false`)
  - Insufficient resources
  - Invalid state
- **Tooltip Feedback** - Explain why action is disabled

## Integration with Existing Systems

### Needs System Integration

#### Habitat Conditions Affect Needs
**Cleanliness Impact:**
- Low cleanliness (< 40%) → Comfort need decays 25% faster
- Very low cleanliness (< 20%) → Comfort need decays 50% faster
- Cleanliness affects guinea pig's personal cleanliness need

**Hay Rack Impact (Critical):**
- Hay freshness > 40% AND handfuls > 0 → Autonomous hunger satisfaction enabled
- Hay freshness 20-40% OR handfuls 1-5 → Reduced hunger satisfaction (70% effectiveness)
- Hay freshness < 20% OR handfuls = 0 → No autonomous hunger satisfaction
- Empty hay bag (0 handfuls) → Guinea pig relies on hand feeding only, freshness immediately drops to 0%

**Bedding Impact:**
- Fresh bedding (> 80%) → Comfort need bonus (+5-10 points/hour)
- Stale bedding (< 40%) → Comfort need penalty (-5-10 points/hour)
- Bed + fresh bedding → Enhanced sleep quality (faster energy recovery)

**Water Impact:**
- Water level > 20% → Autonomous thirst satisfaction enabled
- Water level < 20% → Warning notification
- Water level = 0% → No autonomous thirst satisfaction

#### Wellness Calculation Input
**Habitat Contribution to Wellness:**
```typescript
habitatWellnessScore = (
  (cleanliness * 0.25) +
  (beddingFreshness * 0.20) +
  (hayFreshness * 0.35) + // Highest weight - critical for survival
  (waterLevel * 0.20)
) / 100

// Habitat contributes 15-25% to overall wellness
totalWellness = needsScore * 0.60 + habitatScore * 0.20 + friendshipScore * 0.20
```

**Poor Conditions Penalties:**
- Any condition < 40% → Wellness penalty (-5 to -15 points)
- Multiple conditions < 40% → Compound penalties
- Critical condition (< 20%) → Severe wellness penalty (-20 to -30 points)

### Inventory System Integration

#### Resource Consumption
**Bedding Management:**
- **Purchase from Store** - Via existing inventory/store system, multiple quality tiers
  - **Cheap Bedding** - Lowest cost, basic performance (0.8x absorbency, 1.2x decay rate)
  - **Average Bedding** - Mid-tier pricing, balanced performance (1x absorbency, 1x decay) - **Starting resource: 2-3 units**
  - **Premium Bedding** - Higher cost, superior performance (1.3x absorbency, 0.7x decay)
  - **Colorful Premium Bedding** - Premium cost, premium performance + visual effects + stimulation/wellness bonus
    - Available colors: Blue, Pink, Purple, Green, Yellow, Orange
    - Each color changes habitat visual theme
    - +5-10% stimulation satisfaction bonus contributing to overall wellness
- **Consumption on Use** - Each bedding refresh consumes 1 bedding unit of selected type (unless Free Resources enabled)
- **Quality Effects** - Better bedding = slower cleanliness decay + longer bedding freshness
- **Inventory Tracking** - Separate tracking for each bedding quality tier
- **Cost Pressure** - Strategic choice: cheap & frequent vs premium & infrequent replacement
- **Free Resources Mode (Debug)** - When enabled in debug panel, unlimited bedding without depletion

**Hay Management:**
- **Purchase from Store** - Multiple hay types with different costs/preferences (bags of 20 handfuls)
- **Mini-Hay Bales** - Premium treat option from supplies store: adds 3 handfuls with special benefits
  - Higher hunger satisfaction (1.5x per handful vs regular hay)
  - Faster depletion (guinea pigs consume more eagerly)
  - Stimulation bonus when eaten (+5-10 stimulation points)
  - Friendship bonus when served (+2-5 friendship points for the special treat)
- **Consumption on Use** - Each hay refill adds 1 handful to food container (or 3 from mini-bale), depletes current bag by corresponding amount (unless Free Resources enabled)
- **Container-Specific Capacities:**
  - Hay Rack: Holds 4 handfuls max (hay only, dedicated hay dispenser)
  - Food Bowl: Holds 1 handful max (hay OR other food, not mixed)
  - Food Plate: Holds 3 handfuls max (hay AND other foods simultaneously)
- **Handful Depletion** - Each guinea pig eating session consumes 1 handful from any container (unless Free Resources enabled)
- **Critical Resource** - Essential for hunger satisfaction
- **Type Selection** - Choose which hay bag from inventory to use for refilling, or use mini-bale for special treat benefits
- **Empty Bag** - When handfuls reach 0, bag is depleted and must switch to new bag or purchase more
- **Free Resources Mode (Debug)** - When enabled in debug panel, unlimited hay/mini-bales without depletion

#### Quick Purchase Integration
**Debug Panel Convenience:**
- **Quick Add Resources** - Add bedding/hay directly (for testing)
- **Enable Free Resources** - Toggle for unlimited resources (bypasses Supplies Store dependency)
  - Allows complete habitat testing before store integration
  - Resources still tracked but never depleted
  - Visual indicator in panel when active
- **Jump to Store** - Button to open InventoryDebug/PetStoreDebug (when implemented)
- **Real Consumption** - Resources consumed from inventory (unless Free Resources enabled)
- **Cost Tracking** - Monitor spending on habitat maintenance (when store integrated)

#### Replacement of FeedingDebug
The Habitat Debug panel completely replaces the existing FeedingDebug functionality:

**Features Migrated from FeedingDebug:**
- Food serving (now via food containers in habitat grid)
- Hay management (now via hay rack/bowl/plate with handful tracking)
- Feeding tracking (now via eating cycle tracking panel)
- Daily limits (now enforced via leafy greens and veggie limits)

**New Capabilities Beyond FeedingDebug:**
- Visual habitat grid with item placement
- Multiple food container types with different capacities
- Leafy greens vs veggie distinction with separate limits
- Habitat conditions affecting feeding (hay freshness, cleanliness)
- Guinea pig position and autonomous eating from containers
- Preference-based food selection from multiple options

**Cleanup Steps (Phase 5):**
1. Remove `src/components/debug/FeedingDebug.vue`
2. Remove `src/views/FeedingDebugView.vue`
3. Update `src/views/DebugView.vue` to remove feeding tab from navigation
4. Archive any unique feeding debug features not yet in habitat debug
5. Update documentation to reference Habitat Debug for feeding testing

### Activity Feed Integration

#### Habitat Maintenance Messages
**Cleaning Actions:**
- "You cleaned the habitat - sparkling clean!" (cleanliness → 100%)
- "Habitat desperately needed cleaning - much better now"
- "Quick habitat tidy-up completed"

**Bedding Refresh:**
- "You added fresh [cheap/average/premium] bedding - habitat smells wonderful!"
- "New [bedding type] bedding feels cozy and soft"
- "You added colorful [color] bedding - habitat looks amazing! (+stimulation bonus)"
- "The habitat is now [blue/pink/purple/green/yellow/orange] - so pretty!"
- "Bedding refreshed - ready for comfortable rest"
- "Premium bedding will last longer and keep the habitat cleaner"

**Hay Refill:**
- "You added a handful of fresh [hay type] to the [hay rack/food bowl/food plate] ([X]/20 handfuls remaining in bag)"
- "You added a mini-hay bale to the [container] - a special treat! (+3 handfuls)"
- "[Container] now holds [X]/[capacity] handfuls of hay"
- "Critical: You added hay just in time - [container] was empty!"
- "You opened a new bag of [hay type] hay (20/20 handfuls)"
- "Food bowl is full - must empty before adding different food type"
- "Food plate now contains: [list of foods] - variety buffet!"

**Water Refill:**
- "Water bottle refilled - fresh and clean"
- "You topped up the water supply"

#### Guinea Pig Interaction Messages
**Item Usage:**
- "[Guinea pig name] munches hay from the [hay rack/food bowl/food plate] contentedly (1 handful consumed, [X] remaining)"
- "[Guinea pig name] devours the mini-bale hay eagerly - so delicious! (+stimulation, +friendship)"
- "[Guinea pig name] is extra happy about the mini-bale treat - you're the best!"
- "[Guinea pig name] eats [vegetable] from the [food bowl/food plate]"
- "[Guinea pig name] snacks on [treat] from the [food plate]"
- "[Guinea pig name] chooses hay over the veggie - prefers hay today"
- "[Guinea pig name] drinks from the water bottle"
- "[Guinea pig name] hides in the [shelter name]"
- "[Guinea pig name] plays with the [toy name] excitedly"
- "[Guinea pig name] settles onto the [bed name] for a nap"

**Eating Patterns:**
- "[Guinea pig name] nibbles hay slowly, enjoying each bite (10s duration)"
- "[Guinea pig name] chomps a piece of [vegetable] eagerly (5s duration)"
- "[Guinea pig name] devours the [treat] in seconds (2s duration)"
- "[Guinea pig name] searches for food but the [hay rack/food bowl] is empty!"
- "[Guinea pig name] heads to the food plate and chooses from the buffet"
- "The food bowl still contains [food type] - can't add [different food] until emptied"

**Condition-Based:**
- "[Guinea pig name] looks uncomfortable in the dirty habitat"
- "[Guinea pig name] seems happy with the fresh bedding"
- "[Guinea pig name] loves the colorful [color] bedding - so cheerful! (+stimulation)"
- "[Guinea pig name] appreciates the premium bedding comfort"
- "[Guinea pig name] can't drink - water bottle is empty!"

## Testing & Validation

### Testing Scenarios

#### Critical Path Testing
1. **Empty Hay Rack Emergency**
   - Set hay freshness to 0%
   - Verify guinea pig cannot eat autonomously
   - Verify critical alert triggered
   - Test hand-feeding as fallback
   - Refill hay rack and verify eating resumes

2. **Low Cleanliness Impact**
   - Set cleanliness to 30%
   - Monitor comfort need decay rate
   - Verify 25% faster decay
   - Clean habitat and verify normal decay resumes

3. **Resource Depletion**
   - Set bedding inventory to 0
   - Attempt bedding refresh
   - Verify action blocked
   - Purchase bedding and verify refresh works

4. **Multiple Guinea Pigs**
   - Add 2 guinea pigs to habitat (maximum allowed)
   - Monitor resource consumption rates
   - Verify conditions decay faster
   - Test item competition and sharing

#### Integration Testing
1. **Needs ↔ Habitat Conditions**
   - Poor habitat → Slower need recovery
   - Good habitat → Faster need recovery
   - Empty hay → Hunger stuck
   - Empty water → Thirst stuck

2. **Inventory ↔ Habitat Resources**
   - Purchase bedding → Inventory increases
   - Refresh bedding → Inventory decreases
   - Purchase hay → Inventory increases
   - Refill hay rack → Inventory decreases

3. **Activity Feed ↔ Habitat Events**
   - All maintenance actions logged
   - Guinea pig interactions logged
   - Critical alerts logged
   - Eating sessions logged with durations

#### Balance Validation
1. **Decay Rates**
   - Cleanliness: Reasonable time between cleanings (3-5 days)?
   - Bedding: Appropriate longevity (5-7 days)?
   - Hay: Frequent enough refills without being annoying (2-3 days)?
   - Water: Regular refilling but not excessive (1-2 days)?

2. **Resource Costs**
   - Bedding cost vs longevity: Fair economic pressure?
   - Hay cost vs consumption: Balanced budget impact?
   - Emergency scenarios: Can player recover from mistakes?

3. **Item Effectiveness**
   - Bed-shelter bonus: Noticeable improvement (30%)?
   - Staleness decay: Encourages rotation without forcing it?
   - Preference matching: Meaningful gameplay impact (25% bonus)?

#### Edge Case Testing
1. **Simultaneous Resource Depletion**
   - Empty hay + empty water + no bedding + low cleanliness
   - Verify alerts prioritize correctly (hay most critical)
   - Test recovery path

2. **Extreme Values**
   - All conditions at 0%
   - All conditions at 100%
   - Negative values (shouldn't happen)
   - Values > 100 (shouldn't happen)

3. **Rapid State Changes**
   - Quick succession of maintenance actions
   - Multiple guinea pigs using same item simultaneously
   - Pause/resume during actions
   - Fast-forward time simulation

### Success Criteria

#### Phase 1 Complete When: ✅ **ALL CRITERIA MET**
- ✅ All 4 habitat conditions tracked and persisted
- ✅ Condition sliders adjust values correctly
- ✅ Quick action buttons work (clean, refresh, refill)
- ✅ Resource consumption decrements inventory (with free resources mode for testing)
- ✅ Decay mechanisms function correctly (time-based tracking implemented)
- ✅ Condition history visualized (snapshot system in place)
- ✅ Overall condition computed and color-coded status indicators working

#### Phase 2 Complete When:
- ✅ Habitat grid renders correctly (6×4 for 1 guinea pig, 10×6 for 2 guinea pigs)
- ✅ All default items placed correctly (5 for small cage, 6 for large cage)
- ✅ Drag-and-drop item movement works
- ✅ Placement validation prevents invalid positions
- ✅ Item effectiveness displayed accurately
- ✅ Item durability tracked
- ✅ Available items list populated

#### Phase 3 Complete When:
- ✅ Guinea pigs select items based on needs
- ✅ Guinea pig position displayed on grid
- ✅ Eating durations tracked correctly (10s hay, 5-8s veggies, 2-3s treats)
- ✅ Partial consumption calculated (30-70% for hay)
- ✅ Daily consumption limits enforced (2 veggies, 1 treat max)
- ✅ Empty hay rack prevents autonomous eating
- ✅ Item usage history logged
- ✅ Preference-based effectiveness bonuses applied

#### Phase 4 Complete When:
- ✅ Bed-shelter proximity bonuses work (+30%)
- ✅ Item staleness tracking functional
- ✅ Rotation system with storage working
- ✅ Quality/durability system implemented
- ✅ 24-hour simulation testing passed
- ✅ Multi-guinea pig scenarios validated
- ✅ All integration tests passing
- ✅ Balance validation complete

## Future Enhancements & Phase 3 Transition

### From Debug Panel → Production UI
**The habitat debug panel becomes the foundation for:**
1. **Player-Facing Habitat View** - Main game screen showing guinea pig in habitat
2. **Item Shop Integration** - Purchase items from store and place in habitat
3. **Habitat Customization** - Themes, decorations, aesthetic choices
4. **Advanced Features** - Multiple guinea pigs, seasonal decorations, events

### Phase 3 Full Habitat System
**Building upon this foundation:**
- Visual guinea pig sprites with animations
- Realistic movement pathfinding through grid
- Advanced item interactions (multi-step behaviors)
- Environmental effects (temperature, lighting)
- Habitat expansion and upgrades
- Community features (habitat sharing, competitions)

### Autonomous Behavior Foundation (Phase 4)
**Habitat enables autonomy:**
- Guinea pigs choose items autonomously based on needs
- Natural behavior patterns emerge from item variety
- Item rotation creates dynamic environment requiring player engagement
- Resource management creates ongoing gameplay loop
- Foundation for full autonomous guinea pig AI

## Development Timeline Estimate

**Phase 1: Habitat Conditions** - 2-3 development sessions
- Session 1: Store implementation, basic state management
- Session 2: HabitatDebug component, condition sliders, status display
- Session 3: Quick actions, resource integration, testing

**Phase 2: Grid & Items** - 2-3 development sessions
- Session 1: Grid store, data structures, default items
- Session 2: Grid visualization, CSS layout
- Session 3: Drag-and-drop, placement validation

**Phase 3: Guinea Pig Interactions** - 3-4 development sessions
- Session 1: Item selection AI, needs integration
- Session 2: Eating patterns, consumption mechanics
- Session 3: Position tracking, activity display
- Session 4: Usage history, preference integration

**Phase 4: Advanced Features** - 2-3 development sessions
- Session 1: Proximity bonuses, staleness tracking
- Session 2: Quality/durability system
- Session 3: Testing tools, simulation, polish

**Phase 5: Cleanup & Migration** - 1 development session
- Remove FeedingDebug component and view (replaced by Habitat Debug)
- Update DebugView.vue to remove feeding tab
- Migrate any unique feeding debug features to habitat debug if needed
- Clean up unused feeding-related code

**Total: 10-14 development sessions** (approximately 2-3 weeks at normal pace)

## Success Metrics

### Functional Metrics
- All habitat conditions update correctly on tick
- Resource consumption accurately tracked and persisted
- Guinea pigs interact with items autonomously
- Eating patterns realistic (durations, partial consumption, limits)
- Empty hay rack prevents feeding (critical dependency verified)

### Integration Metrics
- Habitat conditions affect needs system correctly
- Inventory integration seamless (purchase, consume, track)
- Activity feed logs all habitat events appropriately
- Wellness calculation includes habitat contribution

### User Experience Metrics (Debug Panel)
- Fast iteration testing (adjust values, see immediate effects)
- Clear visual feedback (color coding, urgency indicators)
- Comprehensive monitoring (history, analytics, logs)
- Realistic simulation (24-hour cycles, multiple guinea pigs)

### Technical Metrics
- Performance: 60fps grid rendering with 2 guinea pigs (maximum allowed)
- Memory: < 50MB additional memory for habitat system
- Persistence: All state saves/loads correctly
- Reliability: No crashes during extended testing sessions
