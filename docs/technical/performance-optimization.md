# Performance Optimization Guide

**Technical Documentation - Guinea Pig Simulation**

## Overview

This guide provides performance optimization strategies specifically designed for the guinea pig simulation game, focusing on efficient game loop management, responsive UI performance, and resource optimization for web-based pet simulation gameplay.

**Architecture Context:** The game uses a **single-session model** with automatic persistence:
- **Session State**: Active game data that resets on game end (guinea pig needs, habitat conditions)
- **Persistent State**: Data that survives sessions (currency, items, pet store inventory)
- **Automatic Persistence**: Pinia persist plugin handles all data persistence
- **Performance Focus**: Optimize reactive updates and game loop efficiency

See [Pet Store & Game Session Manager](../systems/phase2/system-6.5-pet-store-manager.md) for architecture details.

## Game Loop Optimization

### setInterval Best Practices

The game uses `setInterval` for core timing functionality. Proper implementation prevents memory leaks and ensures consistent performance:

```typescript
// Game Controller Store - Proper interval management
interface GameLoop {
  intervalId: number | null;
  lastTickTime: number;
  targetFPS: number;
  isPaused: boolean;
}

class GameController {
  private gameLoop: GameLoop = {
    intervalId: null,
    lastTickTime: 0,
    targetFPS: 1, // 1 second intervals for needs decay
    isPaused: false
  };

  startGameLoop(): void {
    if (this.gameLoop.intervalId) {
      this.stopGameLoop(); // Prevent multiple intervals
    }

    const intervalMs = 1000 / this.gameLoop.targetFPS;
    this.gameLoop.intervalId = setInterval(() => {
      if (!this.gameLoop.isPaused) {
        this.processGameTick();
      }
    }, intervalMs);
  }

  stopGameLoop(): void {
    if (this.gameLoop.intervalId) {
      clearInterval(this.gameLoop.intervalId);
      this.gameLoop.intervalId = null;
    }
  }

  // Critical: Always cleanup on component unmount
  cleanup(): void {
    this.stopGameLoop();
  }
}
```

### Frame Rate Management

Different systems require different update frequencies for optimal performance:

```typescript
// Multi-speed interval system
interface IntervalSystem {
  needsDecay: number;      // Every 5 seconds
  habitatConditions: number; // Every 10 seconds
  autonomousBehavior: number; // Every 2 seconds
  uiUpdates: number;       // Every 1 second
}

const INTERVAL_RATES = {
  NEEDS_DECAY: 5000,        // 5 seconds
  HABITAT_CONDITIONS: 10000, // 10 seconds
  AUTONOMOUS_BEHAVIOR: 2000, // 2 seconds
  UI_UPDATES: 1000          // 1 second
} as const;

// Staggered execution prevents performance spikes
let tickCounter = 0;

function processGameTick(): void {
  tickCounter++;

  // UI updates every tick (1 second)
  updateUIElements();

  // Autonomous behavior every 2 ticks
  if (tickCounter % 2 === 0) {
    processAutonomousBehavior();
  }

  // Needs decay every 5 ticks
  if (tickCounter % 5 === 0) {
    processNeedsDecay();
  }

  // Habitat conditions every 10 ticks
  if (tickCounter % 10 === 0) {
    processHabitatConditions();
  }
}
```

### Pause/Resume Optimization

Efficient pause state management prevents unnecessary processing:

```typescript
// Enhanced pause functionality
interface PauseState {
  isManuallyPaused: boolean;
  isOrientationPaused: boolean;
  pauseStartTime: number;
  accumulatedPauseTime: number;
}

function isPaused(): boolean {
  return this.pauseState.isManuallyPaused || this.pauseState.isOrientationPaused;
}

function pause(reason: 'manual' | 'orientation'): void {
  const wasAlreadyPaused = this.isPaused();

  if (reason === 'manual') {
    this.pauseState.isManuallyPaused = true;
  } else {
    this.pauseState.isOrientationPaused = true;
  }

  if (!wasAlreadyPaused) {
    this.pauseState.pauseStartTime = Date.now();
  }
}

function resume(reason: 'manual' | 'orientation'): void {
  if (reason === 'manual') {
    this.pauseState.isManuallyPaused = false;
  } else {
    this.pauseState.isOrientationPaused = false;
  }

  if (!this.isPaused() && this.pauseState.pauseStartTime > 0) {
    this.pauseState.accumulatedPauseTime += Date.now() - this.pauseState.pauseStartTime;
    this.pauseState.pauseStartTime = 0;
  }
}
```

## Batch Processing Strategies

### Efficient Needs Decay Calculation

Process all needs in a single batch operation to minimize store updates:

```typescript
// Needs Controller Store - Batch processing
interface NeedsUpdate {
  needId: string;
  currentValue: number;
  decayAmount: number;
  newValue: number;
}

function batchUpdateNeeds(): void {
  const updates: NeedsUpdate[] = [];
  const currentTime = Date.now();

  // Calculate all updates first
  for (const [needId, need] of this.needs.entries()) {
    const decayAmount = this.calculateDecayAmount(need, currentTime);
    const newValue = Math.max(0, need.currentValue - decayAmount);

    if (decayAmount > 0) {
      updates.push({
        needId,
        currentValue: need.currentValue,
        decayAmount,
        newValue
      });
    }
  }

  // Apply all updates in single batch
  if (updates.length > 0) {
    this.applyNeedsUpdates(updates);
    this.recalculateWellnessRating();
    this.checkFriendshipPenalties();
    this.generateActivityMessages(updates);
  }
}

function applyNeedsUpdates(updates: NeedsUpdate[]): void {
  // Single reactive update for all needs
  updates.forEach(update => {
    this.needs.get(update.needId)!.currentValue = update.newValue;
    this.needs.get(update.needId)!.lastUpdate = Date.now();
  });
}
```

### Wellness Rating Calculation Optimization

Efficient wellness calculation with caching to prevent excessive recalculation:

```typescript
// Cached wellness calculation
interface WellnessCache {
  lastCalculatedValue: number;
  lastCalculatedTime: number;
  isDirty: boolean;
}

class WellnessCalculator {
  private cache: WellnessCache = {
    lastCalculatedValue: 100,
    lastCalculatedTime: 0,
    isDirty: true
  };

  calculateWellnessRating(): number {
    const now = Date.now();

    // Return cached value if recent and not dirty
    if (!this.cache.isDirty && (now - this.cache.lastCalculatedTime) < 1000) {
      return this.cache.lastCalculatedValue;
    }

    // Calculate wellness as average of all needs
    const allNeeds = Array.from(this.needs.values());
    const wellness = allNeeds.reduce((sum, need) => sum + need.currentValue, 0) / allNeeds.length;

    // Update cache
    this.cache.lastCalculatedValue = wellness;
    this.cache.lastCalculatedTime = now;
    this.cache.isDirty = false;

    return wellness;
  }

  markWellnessDirty(): void {
    this.cache.isDirty = true;
  }
}
```

### Habitat Condition Update Batching

Efficient habitat condition processing with minimal state updates:

```typescript
// Habitat Conditions Store - Batch updates
interface HabitatUpdate {
  condition: string;
  oldValue: number;
  newValue: number;
  changeReason: string;
}

function batchUpdateHabitatConditions(): void {
  const updates: HabitatUpdate[] = [];
  const currentTime = Date.now();

  // Bedding freshness decay
  const beddingDecay = this.calculateBeddingDecay(currentTime);
  if (beddingDecay > 0) {
    const newFreshness = Math.max(0, this.beddingFreshness - beddingDecay);
    updates.push({
      condition: 'beddingFreshness',
      oldValue: this.beddingFreshness,
      newValue: newFreshness,
      changeReason: 'natural_decay'
    });
  }

  // Water consumption
  const waterConsumption = this.calculateWaterConsumption();
  if (waterConsumption > 0) {
    const newWaterLevel = Math.max(0, this.waterLevel - waterConsumption);
    updates.push({
      condition: 'waterLevel',
      oldValue: this.waterLevel,
      newValue: newWaterLevel,
      changeReason: 'guinea_pig_drinking'
    });
  }

  // Apply updates and check thresholds
  if (updates.length > 0) {
    this.applyHabitatUpdates(updates);
    this.checkHabitatThresholds();
    this.updateGuineaPigNeedsFromHabitat();
  }
}
```

## Responsive Performance Optimization

### Event Throttling and Debouncing

Prevent excessive layout recalculations during window resize and orientation changes:

```typescript
// Throttled resize handling
class ResponsiveController {
  private resizeThrottleId: number | null = null;
  private orientationDebounceId: number | null = null;

  private readonly RESIZE_THROTTLE_MS = 150;
  private readonly ORIENTATION_DEBOUNCE_MS = 300;

  setupEventListeners(): void {
    // Throttled resize events
    window.addEventListener('resize', this.throttledResize.bind(this));

    // Debounced orientation events
    window.addEventListener('orientationchange', this.debouncedOrientationChange.bind(this));
    screen.orientation?.addEventListener('change', this.debouncedOrientationChange.bind(this));
  }

  private throttledResize(): void {
    if (this.resizeThrottleId) return;

    this.resizeThrottleId = setTimeout(() => {
      this.handleResize();
      this.resizeThrottleId = null;
    }, this.RESIZE_THROTTLE_MS);
  }

  private debouncedOrientationChange(): void {
    if (this.orientationDebounceId) {
      clearTimeout(this.orientationDebounceId);
    }

    this.orientationDebounceId = setTimeout(() => {
      this.handleOrientationChange();
      this.orientationDebounceId = null;
    }, this.ORIENTATION_DEBOUNCE_MS);
  }

  private handleResize(): void {
    // Batch DOM measurements
    const measurements = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };

    // Single update with all measurements
    this.updateLayoutState(measurements);
  }
}
```

### CSS Media Queries with JavaScript Enhancement

Efficient breakpoint detection using CSS with minimal JavaScript:

```typescript
// Efficient breakpoint management
class BreakpointManager {
  private mediaQueries: Map<string, MediaQueryList> = new Map();
  private currentBreakpoint: string = 'mobile';

  setupBreakpoints(): void {
    const breakpoints = {
      mobile: '(max-width: 767px)',
      tablet: '(min-width: 768px) and (max-width: 1023px)',
      desktop: '(min-width: 1024px)',
      mobileLandscape: '(max-height: 500px) and (orientation: landscape)'
    };

    Object.entries(breakpoints).forEach(([name, query]) => {
      const mql = window.matchMedia(query);
      this.mediaQueries.set(name, mql);

      // Use addEventListener for better performance
      mql.addEventListener('change', (e) => {
        if (e.matches) {
          this.handleBreakpointChange(name);
        }
      });

      // Check initial state
      if (mql.matches) {
        this.currentBreakpoint = name;
      }
    });
  }

  private handleBreakpointChange(newBreakpoint: string): void {
    if (this.currentBreakpoint === newBreakpoint) return;

    const oldBreakpoint = this.currentBreakpoint;
    this.currentBreakpoint = newBreakpoint;

    // Single state update for breakpoint change
    this.updateBreakpointState(oldBreakpoint, newBreakpoint);
  }
}
```

## Component Re-render Optimization

### Minimizing Vue Component Re-renders

Strategies to prevent excessive component updates during responsive changes:

```typescript
// Optimized component reactive patterns
import { computed, readonly, shallowRef } from 'vue';

// Use shallowRef for objects that change infrequently
const gameState = shallowRef({
  isPlaying: false,
  isPaused: false,
  currentBreakpoint: 'mobile'
});

// Computed properties for derived state
const shouldShowFAB = computed(() => {
  return gameState.value.currentBreakpoint === 'mobileLandscape';
});

const isGameActive = computed(() => {
  return gameState.value.isPlaying && !gameState.value.isPaused;
});

// Readonly state to prevent accidental mutations
const readonlyGameState = readonly(gameState);

// Batch state updates
function updateGameState(updates: Partial<typeof gameState.value>): void {
  gameState.value = { ...gameState.value, ...updates };
}

// Example: Efficient need bar component
const NeedBar = defineComponent({
  props: {
    needValue: { type: Number, required: true },
    needType: { type: String, required: true }
  },
  setup(props) {
    // Computed properties prevent unnecessary re-renders
    const needPercentage = computed(() => Math.round(props.needValue));
    const needClass = computed(() => `need-bar need-bar--${props.needType}`);
    const needStyle = computed(() => ({
      '--need-percentage': `${needPercentage.value}%`
    }));

    return { needPercentage, needClass, needStyle };
  }
});
```

### Efficient State Update Patterns

Minimize reactive updates by batching changes and using shallow comparisons:

```typescript
// Guinea Pig Store - Efficient state updates
class GuineaPigStore {
  // Use Map for efficient updates
  private needs = new Map<string, Need>();
  private reactions = shallowRef<Reaction[]>([]);

  // Batch preference updates
  updatePreferences(preferences: Partial<GuineaPigPreferences>): void {
    const currentPrefs = this.guineaPig.preferences;
    const hasChanges = Object.entries(preferences).some(
      ([key, value]) => currentPrefs[key as keyof GuineaPigPreferences] !== value
    );

    if (hasChanges) {
      this.guineaPig.preferences = { ...currentPrefs, ...preferences };
      this.generatePreferenceDiscoveryMessage(preferences);
    }
  }

  // Efficient reaction updates
  addReaction(reaction: Reaction): void {
    // Limit reaction history for memory efficiency
    const newReactions = [reaction, ...this.reactions.value].slice(0, 50);
    this.reactions.value = newReactions;
  }

  // Batch need updates from external systems
  updateNeedsFromHabitat(habitatEffects: Map<string, number>): void {
    let hasUpdates = false;

    for (const [needId, effect] of habitatEffects) {
      const need = this.needs.get(needId);
      if (need && effect !== 0) {
        need.currentValue = Math.max(0, Math.min(100, need.currentValue + effect));
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      this.markWellnessDirty();
    }
  }
}
```

## Resource Management Efficiency

### Inventory Tracking Optimization

Prevent excessive state updates during resource management:

```typescript
// Inventory Store - Efficient resource tracking
interface ResourceChangeBuffer {
  bedding: number;
  currency: number;
  items: Map<string, number>;
}

class InventoryStore {
  private changeBuffer: ResourceChangeBuffer = {
    bedding: 0,
    currency: 0,
    items: new Map()
  };

  private bufferTimeout: number | null = null;
  private readonly BUFFER_FLUSH_DELAY = 100; // 100ms batching

  // Buffered resource updates
  updateBedding(amount: number): void {
    this.changeBuffer.bedding += amount;
    this.scheduleBufferFlush();
  }

  updateCurrency(amount: number): void {
    this.changeBuffer.currency += amount;
    this.scheduleBufferFlush();
  }

  updateItemQuantity(itemId: string, amount: number): void {
    const current = this.changeBuffer.items.get(itemId) || 0;
    this.changeBuffer.items.set(itemId, current + amount);
    this.scheduleBufferFlush();
  }

  private scheduleBufferFlush(): void {
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }

    this.bufferTimeout = setTimeout(() => {
      this.flushChangeBuffer();
    }, this.BUFFER_FLUSH_DELAY);
  }

  private flushChangeBuffer(): void {
    // Apply all buffered changes in single update
    if (this.changeBuffer.bedding !== 0) {
      this.bedding += this.changeBuffer.bedding;
    }

    if (this.changeBuffer.currency !== 0) {
      this.currency += this.changeBuffer.currency;
    }

    for (const [itemId, change] of this.changeBuffer.items) {
      const current = this.items.get(itemId) || 0;
      this.items.set(itemId, current + change);
    }

    // Clear buffer
    this.changeBuffer = {
      bedding: 0,
      currency: 0,
      items: new Map()
    };

    this.bufferTimeout = null;

    // Single notification for all changes
    this.notifyInventoryUpdate();
  }
}
```

### Memory Management for Game Loops

Prevent memory leaks and manage object lifecycle efficiently:

```typescript
// Memory-efficient object pooling
class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  acquire(): T {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.createFn();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }

  cleanup(): void {
    this.available.length = 0;
    this.inUse.clear();
  }
}

// Example: Activity message pooling
const activityMessagePool = new ObjectPool(
  () => ({ id: '', message: '', timestamp: 0, category: 'action' }),
  (msg) => { msg.id = ''; msg.message = ''; msg.timestamp = 0; }
);

// Usage in activity feed
function addActivityMessage(message: string, category: string): void {
  const msg = activityMessagePool.acquire();
  msg.id = generateId();
  msg.message = message;
  msg.timestamp = Date.now();
  msg.category = category;

  this.addToFeed(msg);

  // Release after display timeout
  setTimeout(() => {
    activityMessagePool.release(msg);
  }, 30000); // 30 seconds
}
```

## Performance Monitoring

### Performance Metrics Collection

Track key performance indicators for optimization:

```typescript
// Performance monitoring system
interface PerformanceMetrics {
  gameLoopTiming: number[];
  componentRenderCount: number;
  memoryUsage: number;
  lastMeasurement: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    gameLoopTiming: [],
    componentRenderCount: 0,
    memoryUsage: 0,
    lastMeasurement: 0
  };

  measureGameLoopPerformance(callback: () => void): void {
    const start = performance.now();
    callback();
    const duration = performance.now() - start;

    // Keep last 100 measurements
    this.metrics.gameLoopTiming.push(duration);
    if (this.metrics.gameLoopTiming.length > 100) {
      this.metrics.gameLoopTiming.shift();
    }

    // Log warning if performance degrades
    if (duration > 16) { // >16ms indicates potential 60fps issues
      console.warn(`Slow game loop: ${duration.toFixed(2)}ms`);
    }
  }

  getPerformanceReport(): string {
    const avgTiming = this.metrics.gameLoopTiming.reduce((a, b) => a + b, 0) / this.metrics.gameLoopTiming.length;
    const maxTiming = Math.max(...this.metrics.gameLoopTiming);

    return `
      Average game loop: ${avgTiming.toFixed(2)}ms
      Max game loop: ${maxTiming.toFixed(2)}ms
      Component renders: ${this.metrics.componentRenderCount}
      Memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB
    `;
  }
}
```

## Session State Management Performance

### End Game Performance

Efficient state reset when ending game sessions:

```typescript
// Pet Store Manager - Efficient session cleanup
class PetStoreManager {
  async endGameSession(): Promise<void> {
    if (!this.activeGameSession) return;

    // Batch all cleanup operations
    const cleanupTasks = [
      // Reset guinea pig needs (session state)
      this.resetGuineaPigNeeds(),

      // Clear habitat conditions (session state)
      this.clearHabitatConditions(),

      // Clear activity feed (session state)
      this.clearActivityFeed(),

      // Update progression (persistent state)
      this.updatePlayerProgression()
    ];

    // Execute all cleanup in parallel
    await Promise.all(cleanupTasks);

    // Single state update for session end
    this.activeGameSession = null;

    // Pinia persist plugin automatically saves persistent state
  }

  private resetGuineaPigNeeds(): Promise<void> {
    const guineaPigStore = useGuineaPigStore();

    // Batch reset all needs for active guinea pigs
    const resetPromises = this.activeGameSession!.guineaPigIds.map(id =>
      guineaPigStore.resetNeedsForGuineaPig(id)
    );

    return Promise.all(resetPromises).then(() => {});
  }
}
```

### Pet Store Refresh Performance

Optimize guinea pig generation and replacement:

```typescript
// Efficient pet store refresh with 10 guinea pigs
class PetStoreManager {
  async refreshPetStore(): Promise<void> {
    // Generate all 10 guinea pigs in parallel
    const newGuineaPigs = await Promise.all(
      Array.from({ length: 10 }, () =>
        this.generateRandomGuineaPig()
      )
    );

    // Single reactive update with all new guinea pigs
    this.availableGuineaPigs = newGuineaPigs;
    this.lastRefreshTimestamp = Date.now();

    // Pinia persist plugin automatically persists the change
  }

  private async generateRandomGuineaPig(): Promise<GuineaPig> {
    // Efficient random generation with minimal allocations
    return {
      id: this.generateId(),
      name: this.randomName(),
      breed: this.randomBreed(),
      // ... other properties
      preferences: this.generateRandomPreferences()
    };
  }
}
```

### Persistent vs Session State Optimization

Separate concerns for optimal performance:

```typescript
// PlayerProgression Store - Only persistent data
export const usePlayerProgression = defineStore('playerProgression', () => {
  // Persistent state (survives sessions)
  const currency = ref(1000);
  const ownedItems = ref(new Map<string, OwnedItem>());
  const achievements = ref<string[]>([]);

  // Efficient updates with minimal reactivity
  function updateCurrency(amount: number): void {
    currency.value += amount;
    // Pinia persist automatically saves
  }

  return { currency, ownedItems, achievements, updateCurrency };
}, {
  persist: {
    key: 'gps2-player-progression',
    storage: localStorage
    // All properties persist by default
  }
});

// Guinea Pig Store - Mix of session and persistent
export const useGuineaPigStore = defineStore('guineaPig', () => {
  // All data persists, but needs reset on game end (manual reset)
  const collection = ref<GuineaPigCollection>({
    guineaPigs: {},
    activeGuineaPigIds: [],
    lastUpdated: Date.now()
  });

  function resetSessionData(): void {
    // Only reset session-specific data (needs, wellness)
    collection.value.activeGuineaPigIds.forEach(id => {
      const gp = collection.value.guineaPigs[id];
      if (gp) {
        gp.needs = getDefaultNeeds();
        gp.stats.wellness = 100;
      }
    });
  }

  return { collection, resetSessionData };
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage
  }
});
```

## Best Practices Summary

1. **Always clean up intervals** - Use proper cleanup in component unmount
2. **Batch state updates** - Group related changes into single reactive updates
3. **Throttle expensive operations** - Use throttling/debouncing for resize and orientation events
4. **Cache computed values** - Prevent unnecessary recalculations with smart caching
5. **Use shallow comparisons** - Minimize deep equality checks in reactive systems
6. **Pool objects** - Reuse objects for frequently created/destroyed items
7. **Monitor performance** - Track metrics to identify bottlenecks early
8. **Optimize for mobile** - Consider battery and performance constraints on mobile devices
9. **Separate state concerns** - Keep session and persistent state in appropriate stores
10. **Leverage automatic persistence** - Trust Pinia persist plugin, avoid manual save/load operations
11. **Batch session cleanup** - Use parallel operations when ending game sessions
12. **Optimize pet store refresh** - Generate all guinea pigs concurrently

These optimization strategies ensure the guinea pig simulation maintains smooth, responsive performance across all devices while providing rich, real-time pet simulation gameplay with efficient state management.