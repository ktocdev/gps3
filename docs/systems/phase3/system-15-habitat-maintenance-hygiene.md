# System 15: Habitat Maintenance & Hygiene

**Phase:** 3.15 - Habitat & Environment

## Core System Overview

The Habitat Maintenance & Hygiene System manages environmental cleanliness, resource consumption, and habitat condition tracking. This system creates a comprehensive maintenance gameplay loop where players must actively maintain their guinea pig's living environment through cleaning, bedding management, and water maintenance.

## System Components

### 1. Enhanced Poop System
- **Grid-based placement and accumulation tracking**
- **Dynamic poop generation during guinea pig movement**
- **Individual poop removal interaction (click/touch)**
- **Poop accumulation impact on overall cleanliness**

### 2. Habitat Cleanliness Level (0-100)
- **Decreases with poop accumulation and general cage state**
- **Affects guinea pig cleanliness need satisfaction**
- **Visual feedback through color-coded status indicators**
- **Complete reset via "Clean Cage" interaction**

### 3. Bedding Freshness System (0-100)
- **Gradual decay over time (independent of poop system)**
- **Restored by consuming bedding from inventory**
- **Multiple bedding types with different freshness duration**
- **Affects guinea pig happiness and comfort levels**

### 4. Water Level Tracking (0-100)
- **Decreases when guinea pig drinks to satisfy thirst**
- **Free refill via "Refresh Water" interaction**
- **Empty water bottle prevents thirst satisfaction**
- **Visual water level indicator in habitat display**

## Enhanced Cage Interaction Menu

### Maintenance Options
- **Clean Cage**
  - Removes all accumulated poops from habitat grid
  - Improves overall cleanliness level to 100%
  - Generates activity feed message
  - Affects guinea pig cleanliness need positively

- **Refresh Water**
  - Refills water level to 100% (infinite resource)
  - No cost or inventory consumption
  - Immediate availability for guinea pig drinking
  - Essential for thirst need satisfaction

- **Refresh Bedding**
  - Consumes bedding from player inventory
  - Resets bedding freshness to 100%
  - Different bedding types affect freshness duration
  - Critical for guinea pig happiness maintenance

- **Auto Place Food**
  - Automatically places appropriate food in dish
  - Convenience feature for routine feeding
  - Respects guinea pig preferences when known
  - Generates appropriate activity feed messages

## Resource Management Integration

### Bedding as Consumable Resource
- **Purchased from store with varying costs and quality**
- **Player starts with initial bedding supply**
- **Different bedding types:**
  - Basic wood shavings (lower cost, shorter duration)
  - Premium paper-based (higher cost, longer duration)
  - Botanical hay bedding (medium cost, happiness bonus)
  - Scented options (premium cost, extra freshness)

### Inventory Integration
- **Bedding quantity tracking in player inventory**
- **Low bedding alerts when supply runs low**
- **Auto-purchase options for convenience**
- **Bedding consumption rate varies by guinea pig activity**

### Water as Infinite Resource
- **No purchase or inventory requirement**
- **Encourages proper hydration care**
- **Removes resource pressure from essential needs**
- **Focus remains on more complex bedding management**

## Habitat Conditions Affecting Guinea Pig Needs

### Cross-System Integration
- **Low cleanliness → Impacts guinea pig cleanliness need**
- **Stale bedding → Reduces guinea pig happiness**
- **Empty water bottle → Prevents thirst need satisfaction**
- **Multiple poor conditions → Compounds wellness rating impact**

### Feedback Loop Design
- **Poor habitat conditions create negative wellness pressure**
- **Players must balance multiple maintenance tasks**
- **Proactive care prevents need satisfaction problems**
- **Reactive maintenance becomes more expensive and time-consuming**

## Implementation Details

### Technical Architecture
```typescript
interface HabitatConditions {
  cleanliness: number; // 0-100
  beddingFreshness: number; // 0-100
  waterLevel: number; // 0-100
  poopCount: number; // tracking accumulation
  lastCleanTime: number; // timestamp
  lastBeddingRefresh: number; // timestamp
}

interface MaintenanceActions {
  cleanCage(): void;
  refreshWater(): void;
  refreshBedding(beddingType: string): boolean;
  autoPlaceFood(): void;
  removePoop(gridPosition: {x: number, y: number}): void;
}
```

### Store Integration
- **Habitat Conditions Store (Pinia)**
- **Resource tracking integration with Inventory Store**
- **Cross-system communication with Guinea Pig Store**
- **Activity feed integration for all maintenance events**

### Component Integration
- **HabitatStatusDisplay** - Visual condition indicators
- **ResourceCounter** - Bedding and hay inventory tracking with alerts
- **GridCell** - Individual poop removal interactions
- **MaintenanceMenu** - Cage interaction interface

## Gameplay Mechanics

### Maintenance Gameplay Loop
1. **Monitoring** - Players observe habitat status indicators
2. **Planning** - Anticipate resource needs and maintenance timing
3. **Action** - Perform maintenance tasks proactively
4. **Resource Management** - Purchase and manage bedding supplies
5. **Optimization** - Balance cost, effectiveness, and guinea pig satisfaction

### Strategic Elements
- **Proactive vs Reactive Care**
  - Proactive maintenance prevents need satisfaction problems
  - Reactive care becomes more expensive and time-consuming
  - Early intervention maintains higher guinea pig happiness

- **Resource Budgeting**
  - Balance bedding costs against toys and treats
  - Different bedding types offer cost/benefit tradeoffs
  - Bulk purchasing vs immediate needs management

- **Multi-System Balance**
  - Habitat maintenance complexity beyond direct interactions
  - Environmental management separate from guinea pig needs
  - Holistic care approach for optimal wellness rating

## Activity Feed Integration

### Maintenance Messages
- **Cleaning Events:** "You thoroughly clean the cage - it sparkles!"
- **Bedding Refresh:** "You replace the bedding with fresh botanical hay"
- **Water Refill:** "You refill the water bottle to the brim"
- **Poop Removal:** "You clean up a poop near the food dish"

### Guinea Pig Responses
- **Clean Environment:** "Guinea pig stretches happily in the fresh space"
- **Fresh Bedding:** "Guinea pig burrows contentedly in the new bedding"
- **Clean Water:** "Guinea pig drinks eagerly from the fresh water"
- **Poor Conditions:** "Guinea pig looks uncomfortable in the messy cage"

### Environmental Alerts
- **Low Cleanliness:** "The cage could use a good cleaning"
- **Stale Bedding:** "The bedding freshness is getting low"
- **Empty Water:** "Water level needs attention"
- **Multiple Issues:** "Guinea pig seems unhappy with cage conditions"

## Development Integration Points

### Phase 2 Dependencies
- **Guinea Pig Store** - For need impact calculations
- **Needs Controller Store** - For cross-system need effects
- **Game Loop Integration** - For timing-based decay

### Phase 3 Coordination
- **Habitat Item System** - Grid positioning and item interactions
- **Inventory Store** - Resource management and bedding tracking
- **Activity Feed** - Event logging and player feedback

### Phase 4 Preparation
- **Direct Interaction System** - Maintenance menu integration
- **Guinea Pig Autonomy** - Environmental behavior responses

## Performance Considerations

### Optimization Strategies
- **Efficient condition updates** - Batch processing for multiple conditions
- **Resource tracking optimization** - Minimize inventory state updates
- **Grid-based poop tracking** - Efficient spatial data structures
- **Decay calculation optimization** - Time-based calculations only when needed

### Memory Management
- **Poop object pooling** - Reuse poop entities for performance
- **Event batching** - Group maintenance events for processing
- **State persistence** - Efficient save/load for habitat conditions
- **Visual update throttling** - Update UI indicators at appropriate intervals

## Testing & Debug Integration

### Debug Menu Features
- **HabitatDebugger Component**
  - Manual condition manipulation controls
  - Resource quantity adjustment
  - Poop generation and removal testing
  - Decay rate modification for testing

### Validation Systems
- **Condition boundary testing** - Ensure values stay within 0-100 range
- **Resource consumption validation** - Prevent negative inventory
- **Cross-system integration testing** - Verify need impact calculations
- **Performance stress testing** - High poop count and rapid decay scenarios

## Future Enhancement Opportunities

### Advanced Features (Phase 5+)
- **Seasonal Bedding Types** - Special holiday-themed bedding options
- **Automated Maintenance Tools** - Upgradeable automatic cleaning systems
- **Habitat Themes** - Different visual styles affecting maintenance requirements
- **Multi-Guinea Pig Scaling** - Increased maintenance complexity with multiple pets

### Quality of Life Improvements
- **Maintenance Scheduling** - Automated reminders and planning tools
- **Bulk Actions** - Clean entire habitat sections at once
- **Efficiency Upgrades** - Tools that improve maintenance effectiveness
- **Resource Delivery** - Subscription services for automatic bedding supply

This system creates meaningful environmental management gameplay while supporting the overall wellness-based pet care experience.