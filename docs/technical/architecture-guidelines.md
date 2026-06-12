# Architecture Guidelines

**Technical Documentation - Guinea Pig Simulation**

## Overview

This guide establishes architectural patterns and design principles for building scalable, maintainable systems in the guinea pig simulation. These guidelines ensure consistent development practices across all phases while supporting extensible system design.

## TypeScript Interface Design Patterns

### Core Entity Interfaces

Establish strong typing for all game entities with extensible design:

```typescript
// Base interfaces for extensibility
interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

interface BaseNeed extends BaseEntity {
  name: string;
  currentValue: number; // 0-100
  maxValue: number;
  minValue: number;
  decayRate: number;
  lastDecayTime: number;
  criticalThreshold: number; // Below this triggers urgent behaviors
  category: NeedCategory;
}

// Guinea pig entity with preference system
interface GuineaPig extends BaseEntity {
  name: string;
  gender: 'sow' | 'boar';
  coatType: CoatType;
  birthDate: Date;
  friendship: number; // 0-100
  preferences: GuineaPigPreferences;
  currentPosition: GridPosition;
  currentReaction: Reaction | null;
  personalityTraits: PersonalityTrait[];
}

// Extensible preference system
interface GuineaPigPreferences {
  food: {
    preferredHay: HayType[];
    dislikedHay: HayType[];
    preferredVegetables: VegetableType[];
    dislikedVegetables: VegetableType[];
    preferredFruits: FruitType[];
    dislikedFruits: FruitType[];
  };
  activities: {
    preferredInteractions: InteractionType[];
    dislikedInteractions: InteractionType[];
    preferredToys: ToyType[];
    dislikedToys: ToyType[];
  };
  environment: {
    preferredShelters: ShelterType[];
    preferredBedding: BeddingType[];
    activityLevel: 'low' | 'medium' | 'high';
  };
}
```

### State Management Interfaces

Design consistent state patterns across all Pinia stores.

**Architecture Note:** The game uses a **single-session model** with separate session and persistent state:
- **Session State**: Resets on game end (guinea pig needs, habitat conditions, activity feed)
- **Persistent State**: Survives sessions (currency, owned items, achievements, pet store inventory)
- **Pet Store**: 10 guinea pig pool with swap cooldown management

See `docs/systems/phase2/system-6.5-pet-store-manager.md` for implementation details.

```typescript
// Base store state interface
interface BaseStoreState {
  isInitialized: boolean;
  lastUpdated: number;
  error: string | null;
  isLoading: boolean;
}

// Store action result pattern
interface StoreActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Game Controller Store
interface GameControllerState extends BaseStoreState {
  currentState: GameState;
  pauseReason: PauseReason | null;
  hasGuineaPig: boolean;
  isFirstTimeUser: boolean;
  lastSaveTimestamp: number;
  settings: GameSettings;
  sessionStartTime: number;
  totalPlayTime: number;
}

// Needs Controller Store
interface NeedsControllerState extends BaseStoreState {
  needs: Map<string, Need>;
  wellnessRating: number; // Calculated, not displayed to user
  wellnessThreshold: number; // Friendship penalty threshold
  lastWellnessUpdate: number;
  friendshipPenaltyRate: number;
}

// Consistent action patterns
interface StoreActions {
  // Initialization
  initialize(): Promise<StoreActionResult>;
  resetSessionState(): StoreActionResult;  // Reset session-only data
  resetAll(): StoreActionResult;           // Complete reset

  // State updates
  updateState(updates: Partial<StoreState>): StoreActionResult;
  batchUpdate(updates: BatchUpdate[]): StoreActionResult;

  // Validation
  validate(): ValidationResult;
  sanitize(): StoreActionResult;
}

// Note: Persistence is handled automatically by Pinia persist plugin
// Stores configure persistence in their defineStore options
```

### Component Interface Standards

Establish consistent prop and emit patterns:

```typescript
// Component prop interfaces
interface BaseComponentProps {
  id?: string;
  class?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

// Game component props
interface GameComponentProps extends BaseComponentProps {
  gameState: GameState;
  isVisible?: boolean;
  priority?: ComponentPriority;
}

// Interaction component props
interface InteractionComponentProps extends GameComponentProps {
  guineaPig: GuineaPig;
  availableInteractions: InteractionType[];
  onInteraction: (interaction: InteractionType) => void;
  cooldownState: Map<InteractionType, number>;
}

// Component emit patterns
interface ComponentEmits {
  // State changes
  'update:modelValue': [value: any];
  'state-change': [oldState: any, newState: any];

  // User interactions
  'click': [event: MouseEvent];
  'interaction': [type: string, data?: any];

  // Lifecycle events
  'mounted': [];
  'before-unmount': [];

  // Error handling
  'error': [error: Error, context: string];
}

// Consistent component definition pattern
const ComponentName = defineComponent({
  name: 'ComponentName',
  props: {
    // Use interface-based prop definitions
    ...createPropsFromInterface<ComponentProps>(),
  },
  emits: {
    // Validate emits with type safety
    ...createEmitsFromInterface<ComponentEmits>(),
  },
  setup(props, { emit }) {
    // Implementation
  }
});
```

## Pinia State Management Best Practices

### Store Organization Pattern

Consistent structure across all stores:

```typescript
// Store definition template
export const useExampleStore = defineStore('example', () => {
  // 1. State (reactive refs)
  const state = reactive<ExampleStoreState>({
    isInitialized: false,
    lastUpdated: 0,
    error: null,
    isLoading: false,
    // Store-specific state...
  });

  // 2. Getters (computed properties)
  const isReady = computed(() => state.isInitialized && !state.error);
  const hasRecentUpdate = computed(() => Date.now() - state.lastUpdated < 5000);

  // 3. Actions (functions)
  async function initialize(): Promise<StoreActionResult> {
    try {
      state.isLoading = true;
      state.error = null;

      // Initialization logic...
      await loadPersistedData();
      validateState();

      state.isInitialized = true;
      state.lastUpdated = Date.now();

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: state.error,
        timestamp: Date.now()
      };
    } finally {
      state.isLoading = false;
    }
  }

  function updateState(updates: Partial<ExampleStoreState>): StoreActionResult {
    try {
      Object.assign(state, updates);
      state.lastUpdated = Date.now();
      return { success: true, timestamp: Date.now() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Update failed';
      state.error = errorMsg;
      return { success: false, error: errorMsg, timestamp: Date.now() };
    }
  }

  // 4. Getters for session vs persistent data
  const sessionState = computed(() => ({
    // Data that resets each game session
    // Example: guinea pig needs, habitat conditions
  }));

  const persistentState = computed(() => ({
    // Data that survives sessions
    // Example: currency, owned items, achievements
  }));

  // Note: Actual persistence handled by Pinia persist plugin
  // See store configuration at bottom of file

  // 5. Validation and cleanup
  function validate(): ValidationResult {
    const errors: string[] = [];

    // Validation logic...
    if (!state.isInitialized) {
      errors.push('Store not initialized');
    }

    return {
      isValid: errors.length === 0,
      errors,
      timestamp: Date.now()
    };
  }

  function resetSessionState(): void {
    // Reset only session-specific state
    // Persistent state remains unchanged
  }

  function resetAll(): void {
    // Complete reset including persistent state
    Object.assign(state, {
      isInitialized: false,
      lastUpdated: 0,
      error: null,
      isLoading: false
    });
  }

  // 6. Return store interface
  return {
    // State (readonly for external access)
    state: readonly(state),

    // Getters
    isReady,
    hasRecentUpdate,
    sessionState,
    persistentState,

    // Actions
    initialize,
    updateState,
    validate,
    resetSessionState,
    resetAll,

    // For debugging only
    $dev: import.meta.env.DEV ? { state } : undefined
  };
}, {
  // Pinia persist plugin configuration
  persist: {
    key: 'gps2-example-store',
    storage: localStorage,
    // Optional: specify which paths to persist
    // paths: ['persistentData', 'settings']
  }
});
```

### Cross-Store Communication Patterns

Establish consistent patterns for store interaction:

```typescript
// Event-driven store communication
interface StoreEvent {
  type: string;
  source: string;
  target?: string;
  payload?: any;
  timestamp: number;
}

class StoreEventBus {
  private listeners = new Map<string, Set<(event: StoreEvent) => void>>();

  subscribe(eventType: string, callback: (event: StoreEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  emit(event: StoreEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }
}

// Global event bus instance
export const storeEventBus = new StoreEventBus();

// Store communication example
export const useGuineaPigStore = defineStore('guineaPig', () => {
  // ... store setup ...

  function updateFriendship(change: number): StoreActionResult {
    const oldFriendship = state.friendship;
    state.friendship = Math.max(0, Math.min(100, state.friendship + change));

    // Emit event for other stores
    storeEventBus.emit({
      type: 'friendship-changed',
      source: 'guinea-pig',
      payload: {
        oldValue: oldFriendship,
        newValue: state.friendship,
        change
      },
      timestamp: Date.now()
    });

    return { success: true, timestamp: Date.now() };
  }

  // Listen for wellness changes from needs controller
  storeEventBus.subscribe('wellness-changed', (event) => {
    if (event.payload.wellness < 45) {
      // Apply friendship penalty
      updateFriendship(-0.5);
    }
  });

  return {
    state: readonly(state),
    updateFriendship,
    // ... other exports
  };
});
```

### Store Composition and Modularity

Design stores for composition and reusability:

```typescript
// Composable store modules
export function useStoreBase<T extends BaseStoreState>(
  storeName: string,
  initialState: T
) {
  const state = reactive<T>(initialState);

  const isReady = computed(() => state.isInitialized && !state.error);

  async function initializeBase(): Promise<StoreActionResult> {
    try {
      state.isLoading = true;
      state.error = null;

      // Base initialization logic
      const loadResult = await loadFromStorage(storeName);
      if (loadResult.success && loadResult.data) {
        Object.assign(state, loadResult.data);
      }

      state.isInitialized = true;
      state.lastUpdated = Date.now();

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Initialization failed';
      state.error = errorMsg;
      return { success: false, error: errorMsg, timestamp: Date.now() };
    } finally {
      state.isLoading = false;
    }
  }

  function resetBase(): void {
    Object.assign(state, {
      isInitialized: false,
      lastUpdated: 0,
      error: null,
      isLoading: false
    });
  }

  return {
    state,
    isReady,
    initializeBase,
    resetBase
  };
}

// Store with composition
export const useNeedsStore = defineStore('needs', () => {
  // Compose base functionality
  const base = useStoreBase('needs', {
    isInitialized: false,
    lastUpdated: 0,
    error: null,
    isLoading: false,
    needs: new Map<string, Need>(),
    wellnessRating: 100
  });

  // Add needs-specific functionality
  function updateNeed(needId: string, value: number): StoreActionResult {
    const need = base.state.needs.get(needId);
    if (!need) {
      return {
        success: false,
        error: `Need ${needId} not found`,
        timestamp: Date.now()
      };
    }

    need.currentValue = Math.max(0, Math.min(100, value));
    need.lastDecayTime = Date.now();
    base.state.lastUpdated = Date.now();

    // Recalculate wellness
    recalculateWellness();

    return { success: true, timestamp: Date.now() };
  }

  function recalculateWellness(): void {
    const needs = Array.from(base.state.needs.values());
    const wellness = needs.reduce((sum, need) => sum + need.currentValue, 0) / needs.length;
    base.state.wellnessRating = wellness;

    // Emit wellness change event
    storeEventBus.emit({
      type: 'wellness-changed',
      source: 'needs',
      payload: { wellness },
      timestamp: Date.now()
    });
  }

  return {
    // Base functionality
    ...base,

    // Needs-specific functionality
    updateNeed,
    recalculateWellness
  };
});
```

## Extensible System Design Principles

### Plugin Architecture Pattern

Design systems to support future extensions:

```typescript
// Base plugin interface
interface GamePlugin {
  name: string;
  version: string;
  dependencies: string[];
  initialize(context: GameContext): Promise<PluginResult>;
  cleanup(): void;
  isEnabled(): boolean;
}

// Plugin manager
class PluginManager {
  private plugins = new Map<string, GamePlugin>();
  private enabledPlugins = new Set<string>();

  async registerPlugin(plugin: GamePlugin): Promise<PluginResult> {
    try {
      // Check dependencies
      for (const dep of plugin.dependencies) {
        if (!this.enabledPlugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }

      this.plugins.set(plugin.name, plugin);

      if (plugin.isEnabled()) {
        await this.enablePlugin(plugin.name);
      }

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Plugin registration failed',
        timestamp: Date.now()
      };
    }
  }

  async enablePlugin(pluginName: string): Promise<PluginResult> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return {
        success: false,
        error: `Plugin ${pluginName} not found`,
        timestamp: Date.now()
      };
    }

    try {
      const context = this.createGameContext();
      await plugin.initialize(context);
      this.enabledPlugins.add(pluginName);

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Plugin initialization failed',
        timestamp: Date.now()
      };
    }
  }

  private createGameContext(): GameContext {
    return {
      stores: {
        gameController: useGameControllerStore(),
        guineaPig: useGuineaPigStore(),
        needs: useNeedsStore(),
        // ... other stores
      },
      eventBus: storeEventBus,
      components: new Map(),
      services: new Map()
    };
  }
}

// Example plugin: Seasonal Events
class SeasonalEventsPlugin implements GamePlugin {
  name = 'seasonal-events';
  version = '1.0.0';
  dependencies = ['achievements', 'inventory'];

  async initialize(context: GameContext): Promise<PluginResult> {
    // Register seasonal items
    const inventory = context.stores.inventory;
    await inventory.registerItemCategory('seasonal', {
      name: 'Seasonal Items',
      description: 'Limited-time seasonal decorations and treats',
      isLimited: true
    });

    // Listen for date changes
    context.eventBus.subscribe('date-changed', this.handleDateChange.bind(this));

    return { success: true, timestamp: Date.now() };
  }

  private handleDateChange(event: StoreEvent): void {
    const currentDate = event.payload.date;
    this.checkSeasonalEvents(currentDate);
  }

  private checkSeasonalEvents(date: Date): void {
    // Seasonal logic...
  }

  cleanup(): void {
    // Cleanup logic...
  }

  isEnabled(): boolean {
    return true; // Could check user settings
  }
}
```

### Extensible Need System Architecture

Design the needs system to support future need types:

```typescript
// Base need class for extension
abstract class BaseNeed implements Need {
  constructor(
    public id: string,
    public name: string,
    public currentValue: number = 100,
    public maxValue: number = 100,
    public minValue: number = 0
  ) {}

  abstract calculateDecay(deltaTime: number, context: NeedContext): number;
  abstract getDisplayInfo(): NeedDisplayInfo;
  abstract onCriticalThreshold(): void;

  // Common functionality
  updateValue(amount: number): void {
    this.currentValue = Math.max(
      this.minValue,
      Math.min(this.maxValue, this.currentValue + amount)
    );
  }

  isCritical(): boolean {
    return this.currentValue < this.criticalThreshold;
  }

  getPercentage(): number {
    return (this.currentValue / this.maxValue) * 100;
  }
}

// Specific need implementations
class HungerNeed extends BaseNeed {
  public criticalThreshold = 25;
  public decayRate = 1; // Per hour

  calculateDecay(deltaTime: number, context: NeedContext): number {
    let decay = (this.decayRate * deltaTime) / (1000 * 60 * 60); // Convert to hourly rate

    // Contextual modifiers
    if (context.guineaPig.age < 365) { // Young guinea pig
      decay *= 1.2; // Faster metabolism
    }

    if (context.habitat.temperature < 18) { // Cold environment
      decay *= 1.1; // More energy needed
    }

    return decay;
  }

  getDisplayInfo(): NeedDisplayInfo {
    return {
      displayName: 'Hunger',
      description: 'Your guinea pig needs regular meals',
      icon: '🍽️',
      color: this.getHungerColor(),
      urgency: this.isCritical() ? 'high' : 'normal'
    };
  }

  onCriticalThreshold(): void {
    // Trigger autonomous eating behavior
    storeEventBus.emit({
      type: 'need-critical',
      source: 'hunger-need',
      payload: { needType: 'hunger', value: this.currentValue },
      timestamp: Date.now()
    });
  }

  private getHungerColor(): string {
    if (this.currentValue > 75) return '#22c55e'; // Green
    if (this.currentValue > 50) return '#eab308'; // Yellow
    if (this.currentValue > 25) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }
}

// Need factory for extensibility
class NeedFactory {
  private needTypes = new Map<string, new(...args: any[]) => BaseNeed>();

  registerNeedType(type: string, needClass: new(...args: any[]) => BaseNeed): void {
    this.needTypes.set(type, needClass);
  }

  createNeed(type: string, ...args: any[]): BaseNeed | null {
    const NeedClass = this.needTypes.get(type);
    return NeedClass ? new NeedClass(...args) : null;
  }

  getAvailableNeedTypes(): string[] {
    return Array.from(this.needTypes.keys());
  }
}

// Register built-in needs
const needFactory = new NeedFactory();
needFactory.registerNeedType('hunger', HungerNeed);
needFactory.registerNeedType('thirst', ThirstNeed);
needFactory.registerNeedType('happiness', HappinessNeed);
// ... register other needs

// Future extension example: Social need for multiple guinea pigs
class SocialNeed extends BaseNeed {
  public criticalThreshold = 30;
  public decayRate = 0.5;

  calculateDecay(deltaTime: number, context: NeedContext): number {
    let decay = (this.decayRate * deltaTime) / (1000 * 60 * 60);

    // Social context modifiers
    if (context.otherGuineaPigs?.length === 0) {
      decay *= 1.5; // Loneliness increases social need decay
    }

    return decay;
  }

  getDisplayInfo(): NeedDisplayInfo {
    return {
      displayName: 'Social',
      description: 'Your guinea pig needs companionship',
      icon: '👥',
      color: this.getSocialColor(),
      urgency: this.isCritical() ? 'high' : 'normal'
    };
  }

  onCriticalThreshold(): void {
    storeEventBus.emit({
      type: 'need-critical',
      source: 'social-need',
      payload: { needType: 'social', value: this.currentValue },
      timestamp: Date.now()
    });
  }

  private getSocialColor(): string {
    // Color logic...
    return '#8b5cf6'; // Purple
  }
}

// Register the new need type
needFactory.registerNeedType('social', SocialNeed);
```

## Cross-System Integration Patterns

### Event-Driven Architecture

Establish consistent communication between systems:

```typescript
// System event interface
interface SystemEvent {
  type: string;
  source: string;
  target?: string;
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: number;
  correlationId?: string;
}

// Event manager with priority handling
class GameEventManager {
  private eventQueue = new PriorityQueue<SystemEvent>();
  private subscribers = new Map<string, Set<EventHandler>>();
  private isProcessing = false;

  subscribe(eventType: string, handler: EventHandler): UnsubscribeFunction {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(handler);

    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  emit(event: SystemEvent): void {
    this.eventQueue.enqueue(event, this.getPriority(event.priority));
    this.processEventQueue();
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      while (!this.eventQueue.isEmpty()) {
        const event = this.eventQueue.dequeue();
        await this.processEvent(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(event: SystemEvent): Promise<void> {
    const handlers = this.subscribers.get(event.type);
    if (!handlers) return;

    const promises = Array.from(handlers).map(handler =>
      this.safeHandlerExecution(handler, event)
    );

    await Promise.allSettled(promises);
  }

  private async safeHandlerExecution(
    handler: EventHandler,
    event: SystemEvent
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error(`Event handler error for ${event.type}:`, error);

      // Emit error event
      this.emit({
        type: 'system-error',
        source: 'event-manager',
        payload: {
          originalEvent: event,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        priority: 'high',
        timestamp: Date.now()
      });
    }
  }

  private getPriority(priority: SystemEvent['priority']): number {
    const priorityMap = {
      'critical': 1,
      'high': 2,
      'normal': 3,
      'low': 4
    };
    return priorityMap[priority];
  }
}

// Global event manager
export const gameEventManager = new GameEventManager();

// Integration example: Habitat affecting needs
gameEventManager.subscribe('habitat-condition-changed', async (event) => {
  const { condition, newValue } = event.payload;
  const needsStore = useNeedsStore();

  switch (condition) {
    case 'cleanliness':
      if (newValue < 30) {
        await needsStore.updateNeed('cleanliness', -5);
      }
      break;

    case 'beddingFreshness':
      if (newValue < 20) {
        await needsStore.updateNeed('happiness', -3);
      }
      break;

    case 'waterLevel':
      if (newValue === 0) {
        await needsStore.updateNeed('thirst', -10);
      }
      break;
  }
});

// Integration example: Friendship affecting behavior
gameEventManager.subscribe('friendship-changed', async (event) => {
  const { newValue } = event.payload;
  const autonomyStore = useAutonomyStore();

  // Adjust autonomous behavior based on friendship
  if (newValue > 75) {
    autonomyStore.enableBehavior('spontaneous-popcorn');
    autonomyStore.enableBehavior('player-following');
  } else if (newValue < 25) {
    autonomyStore.disableBehavior('spontaneous-popcorn');
    autonomyStore.enableBehavior('hiding');
  }
});
```

### Service Layer Architecture

Abstract complex operations into reusable services:

```typescript
// Base service interface
interface GameService {
  name: string;
  initialize(): Promise<ServiceResult>;
  cleanup(): void;
  isReady(): boolean;
}

// Preference discovery service
class PreferenceDiscoveryService implements GameService {
  name = 'preference-discovery';
  private discoveredPreferences = new Map<string, Set<string>>();

  async initialize(): Promise<ServiceResult> {
    try {
      // Load discovered preferences from storage
      const saved = localStorage.getItem('discovered-preferences');
      if (saved) {
        const data = JSON.parse(saved);
        this.discoveredPreferences = new Map(data);
      }

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to initialize preference discovery service',
        timestamp: Date.now()
      };
    }
  }

  async discoverPreference(
    guineaPigId: string,
    category: string,
    item: string,
    reaction: Reaction
  ): Promise<PreferenceDiscoveryResult> {
    const key = `${guineaPigId}-${category}`;

    if (!this.discoveredPreferences.has(key)) {
      this.discoveredPreferences.set(key, new Set());
    }

    const discovered = this.discoveredPreferences.get(key)!;
    const isNewDiscovery = !discovered.has(item);

    if (isNewDiscovery) {
      discovered.add(item);

      // Determine preference type from reaction
      const preferenceType = this.analyzeReaction(reaction);

      // Update guinea pig preferences
      const guineaPigStore = useGuineaPigStore();
      await guineaPigStore.updatePreference(category, item, preferenceType);

      // Generate discovery message
      const activityFeed = useActivityFeedStore();
      activityFeed.addMessage({
        type: 'preference-discovery',
        message: this.generateDiscoveryMessage(item, preferenceType),
        timestamp: Date.now()
      });

      // Save discovery
      await this.saveDiscoveries();

      return {
        isNewDiscovery: true,
        preferenceType,
        item,
        category,
        timestamp: Date.now()
      };
    }

    return {
      isNewDiscovery: false,
      item,
      category,
      timestamp: Date.now()
    };
  }

  private analyzeReaction(reaction: Reaction): 'preferred' | 'neutral' | 'disliked' {
    const positiveReactions = ['popcorn', 'big-popcorn', 'happy-munching', 'chirp'];
    const negativeReactions = ['turns-up-nose', 'reluctant-eating', 'back-away'];

    if (positiveReactions.includes(reaction.type)) {
      return 'preferred';
    } else if (negativeReactions.includes(reaction.type)) {
      return 'disliked';
    }

    return 'neutral';
  }

  private generateDiscoveryMessage(item: string, preferenceType: string): string {
    const messages = {
      preferred: `Your guinea pig seems to LOVE ${item} - a new favorite discovered!`,
      disliked: `Your guinea pig doesn't seem interested in ${item}`,
      neutral: `Your guinea pig tried ${item} but seems neutral about it`
    };

    return messages[preferenceType as keyof typeof messages];
  }

  private async saveDiscoveries(): Promise<void> {
    const data = Array.from(this.discoveredPreferences.entries());
    localStorage.setItem('discovered-preferences', JSON.stringify(data));
  }

  cleanup(): void {
    this.discoveredPreferences.clear();
  }

  isReady(): boolean {
    return this.discoveredPreferences !== null;
  }
}

// Service manager
class ServiceManager {
  private services = new Map<string, GameService>();

  async registerService(service: GameService): Promise<ServiceResult> {
    try {
      const result = await service.initialize();
      if (result.success) {
        this.services.set(service.name, service);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to register service ${service.name}`,
        timestamp: Date.now()
      };
    }
  }

  getService<T extends GameService>(name: string): T | null {
    return this.services.get(name) as T || null;
  }

  async cleanupAll(): Promise<void> {
    for (const service of this.services.values()) {
      try {
        service.cleanup();
      } catch (error) {
        console.error(`Error cleaning up service ${service.name}:`, error);
      }
    }
  }
}

// Global service manager
export const serviceManager = new ServiceManager();

// Register services during app initialization
await serviceManager.registerService(new PreferenceDiscoveryService());
```

## Development Best Practices

### Code Organization Standards

Establish consistent file and directory structure:

```typescript
// File naming conventions
/*
Stores: use[EntityName]Store.ts (e.g., useGuineaPigStore.ts)
Components: PascalCase.vue (e.g., NeedBar.vue)
Composables: use[Functionality].ts (e.g., useNeeds.ts)
Services: [name]Service.ts (e.g., preferenceDiscoveryService.ts)
Types: [domain]Types.ts (e.g., guineaPigTypes.ts)
Utils: [functionality]Utils.ts (e.g., validationUtils.ts)
*/

// Import organization
// 1. Vue imports
import { defineComponent, computed, reactive } from 'vue';

// 2. Third-party imports
import { storeToRefs } from 'pinia';

// 3. Local store imports
import { useGuineaPigStore } from '@/stores/guineaPig';
import { useNeedsStore } from '@/stores/needs';

// 4. Local component imports
import NeedBar from '@/components/game/NeedBar.vue';
import InteractionMenu from '@/components/game/InteractionMenu.vue';

// 5. Local utility imports
import { validateGuineaPig } from '@/utils/validation';
import { formatTime } from '@/utils/formatting';

// 6. Type imports (separate group)
import type { GuineaPig, Need, Interaction } from '@/types/gameTypes';
```

### Testing Architecture

Establish testable patterns for all systems:

```typescript
// Testable store pattern
export const useTestableStore = defineStore('testable', () => {
  const state = reactive({
    // ... state definition
  });

  // Testable actions with dependency injection
  const actions = {
    async updateData(
      data: any,
      dependencies: {
        storage?: StorageInterface;
        eventBus?: EventBusInterface;
        validator?: ValidatorInterface;
      } = {}
    ): Promise<StoreActionResult> {
      const storage = dependencies.storage || defaultStorage;
      const eventBus = dependencies.eventBus || gameEventManager;
      const validator = dependencies.validator || defaultValidator;

      // Action implementation using injected dependencies
      try {
        const validationResult = validator.validate(data);
        if (!validationResult.isValid) {
          return {
            success: false,
            error: validationResult.errors.join(', '),
            timestamp: Date.now()
          };
        }

        Object.assign(state, data);
        await storage.save('testable-store', state);

        eventBus.emit({
          type: 'data-updated',
          source: 'testable-store',
          payload: data,
          priority: 'normal',
          timestamp: Date.now()
        });

        return { success: true, timestamp: Date.now() };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Update failed',
          timestamp: Date.now()
        };
      }
    }
  };

  return {
    state: readonly(state),
    ...actions,

    // Test utilities
    $test: import.meta.env.TEST ? {
      setState: (newState: any) => Object.assign(state, newState),
      getState: () => ({ ...state }),
      reset: () => Object.assign(state, initialState)
    } : undefined
  };
});

// Component testing pattern
export default defineComponent({
  name: 'TestableComponent',
  props: {
    // ... props
  },
  setup(props, { emit }) {
    // Dependency injection for testing
    const dependencies = inject('dependencies', {
      stores: {
        guineaPig: useGuineaPigStore(),
        needs: useNeedsStore()
      },
      services: {
        preferenceDiscovery: serviceManager.getService('preference-discovery')
      },
      eventBus: gameEventManager
    });

    // Component logic using dependencies
    const handleInteraction = async (interaction: Interaction) => {
      const result = await dependencies.stores.guineaPig.processInteraction(interaction);

      if (result.success) {
        emit('interaction-success', result);
      } else {
        emit('interaction-error', result.error);
      }
    };

    return {
      handleInteraction,
      // ... other exports
    };
  }
});
```

This architecture ensures consistent, scalable, and maintainable code across all phases of development while supporting future extensibility and testing requirements.