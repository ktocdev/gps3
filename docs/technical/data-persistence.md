# Data Persistence - Technical Patterns

**Technical Documentation - Guinea Pig Simulation**

## Overview

Core browser storage patterns and utilities for implementing robust data persistence in a session-based web application. This guide focuses on universal storage mechanics, error handling, and quota management that apply regardless of specific data structures.

**Architecture Context:**
- **Session State**: Resets on game end (guinea pig needs, habitat conditions, activity feed)
- **Persistent State**: Survives sessions (currency, owned items, achievements, statistics)
- **Pet Store State**: 10 guinea pig pool with swap cooldown management

See [Pet Store & Game Session Manager](../systems/phase2/system-6.5-pet-store-manager.md) for implementation-specific state management details.

## Storage Technology Detection

Detect available storage capabilities and recommend optimal storage based on requirements:

```typescript
interface StorageQuota {
  quota: number;
  usage: number;
  available: number;
}

interface StorageRequirements {
  complexQueries: boolean;
  binaryData: boolean;
  largeObjects: boolean;
}

interface StorageRecommendation {
  primary: 'localStorage' | 'indexedDB' | 'memory';
  fallback: 'localStorage' | 'indexedDB' | 'memory' | 'none';
  reasoning: string;
}

class StorageCapabilityDetector {
  private capabilities = new Map<string, boolean>();
  private quotaInfo: StorageQuota | null = null;

  constructor() {
    this.detectCapabilities();
    this.detectStorageQuota();
  }

  private detectCapabilities(): void {
    this.capabilities.set('localStorage', this.testLocalStorage());
    this.capabilities.set('indexedDB', this.testIndexedDB());
    this.capabilities.set('sessionStorage', this.testSessionStorage());
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private testIndexedDB(): boolean {
    try {
      return 'indexedDB' in window && indexedDB !== null;
    } catch (error) {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const testKey = '__sessionStorage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async detectStorageQuota(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.quotaInfo = {
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
      }
    } catch (error) {
      console.warn('Storage quota detection failed:', error);
    }
  }

  hasCapability(storage: string): boolean {
    return this.capabilities.get(storage) ?? false;
  }

  getStorageQuota(): StorageQuota | null {
    return this.quotaInfo;
  }

  recommendStorage(dataSize: number, requirements: StorageRequirements): StorageRecommendation {
    const hasIndexedDB = this.hasCapability('indexedDB');
    const hasLocalStorage = this.hasCapability('localStorage');

    // Large data or complex queries - prefer IndexedDB
    if (dataSize > 5 * 1024 * 1024 || requirements.complexQueries) {
      if (hasIndexedDB) {
        return {
          primary: 'indexedDB',
          fallback: hasLocalStorage ? 'localStorage' : 'memory',
          reasoning: 'Large data size or complex query requirements'
        };
      }
    }

    // Binary data or large objects - prefer IndexedDB
    if (requirements.binaryData || requirements.largeObjects) {
      if (hasIndexedDB) {
        return {
          primary: 'indexedDB',
          fallback: hasLocalStorage ? 'localStorage' : 'memory',
          reasoning: 'Binary data or large object support needed'
        };
      }
    }

    // Small data with simple access patterns - localStorage is fine
    if (dataSize < 1024 * 1024 && !requirements.complexQueries) {
      if (hasLocalStorage) {
        return {
          primary: 'localStorage',
          fallback: hasIndexedDB ? 'indexedDB' : 'memory',
          reasoning: 'Small data size with simple access patterns'
        };
      }
    }

    // Fallback to available storage
    if (hasIndexedDB) {
      return {
        primary: 'indexedDB',
        fallback: hasLocalStorage ? 'localStorage' : 'memory',
        reasoning: 'IndexedDB available as primary option'
      };
    }

    if (hasLocalStorage) {
      return {
        primary: 'localStorage',
        fallback: 'memory',
        reasoning: 'localStorage available as fallback'
      };
    }

    return {
      primary: 'memory',
      fallback: 'none',
      reasoning: 'No persistent storage available'
    };
  }

  isNearQuotaLimit(threshold: number = 0.8): boolean {
    if (!this.quotaInfo) return false;
    const usage = this.quotaInfo.usage / this.quotaInfo.quota;
    return usage > threshold;
  }

  getAvailableSpace(): number {
    return this.quotaInfo?.available ?? 0;
  }
}

export const storageDetector = new StorageCapabilityDetector();
```

## Unified Storage Interface

Abstract storage operations with a unified interface:

```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  exists(key: string): Promise<boolean>;
}

class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'gps_') {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`LocalStorage get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        await this.handleQuotaExceeded(key, value);
      } else {
        throw error;
      }
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.slice(this.prefix.length));
  }

  async size(): Promise<number> {
    let total = 0;
    const keys = await this.keys();
    for (const key of keys) {
      const value = localStorage.getItem(this.prefix + key);
      if (value) {
        total += value.length * 2; // Approximate bytes (UTF-16)
      }
    }
    return total;
  }

  async exists(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  private async handleQuotaExceeded<T>(key: string, value: T): Promise<void> {
    console.warn('LocalStorage quota exceeded, attempting cleanup...');

    const keys = await this.keys();
    const keysWithTimestamps = keys
      .map(k => {
        const item = localStorage.getItem(this.prefix + k);
        try {
          const parsed = JSON.parse(item || '{}');
          return { key: k, timestamp: parsed.timestamp || 0 };
        } catch {
          return { key: k, timestamp: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25% of items
    const toRemove = keysWithTimestamps.slice(0, Math.floor(keysWithTimestamps.length * 0.25));
    for (const item of toRemove) {
      await this.remove(item.key);
    }

    // Try saving again
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      throw new Error('Storage quota exceeded and cleanup failed');
    }
  }
}

class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async size(): Promise<number> {
    let size = 0;
    for (const [key, value] of this.storage) {
      size += key.length * 2;
      size += JSON.stringify(value).length * 2;
    }
    return size;
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
}
```

## Error Handling & Recovery

Implement robust error handling with retry logic:

```typescript
class StorageErrorHandler {
  private errorCounts = new Map<string, number>();
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 5000];

  async handleStorageOperation<T>(
    operation: () => Promise<T>,
    operationType: string,
    key?: string
  ): Promise<T> {
    const errorKey = `${operationType}_${key || 'unknown'}`;
    let lastError: Error;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.errorCounts.delete(errorKey);
        return result;
      } catch (error) {
        lastError = error as Error;

        const errorCount = (this.errorCounts.get(errorKey) || 0) + 1;
        this.errorCounts.set(errorKey, errorCount);

        console.warn(`Storage operation ${operationType} failed (attempt ${attempt + 1}):`, error);

        if (attempt < this.maxRetries - 1) {
          const shouldRetry = this.shouldRetryError(error as Error);

          if (shouldRetry) {
            await this.delay(this.retryDelays[attempt]);
            continue;
          }
        }

        await this.handleSpecificError(error as Error, operationType, key);
      }
    }

    throw new StorageError(
      `Storage operation ${operationType} failed after ${this.maxRetries} attempts`,
      operationType,
      lastError!
    );
  }

  private shouldRetryError(error: Error): boolean {
    // Retry on temporary errors
    if (error.name === 'QuotaExceededError') return true;
    if (error.name === 'UnknownError') return true;
    if (error.message.includes('network')) return true;

    // Don't retry on permanent errors
    if (error.name === 'NotSupportedError') return false;
    if (error.name === 'InvalidStateError') return false;

    return true;
  }

  private async handleSpecificError(error: Error, operationType: string, key?: string): Promise<void> {
    switch (error.name) {
      case 'QuotaExceededError':
        await this.handleQuotaExceeded();
        break;

      case 'NotSupportedError':
        this.notifyStorageIssue('not_supported', 'Storage operation not supported in this browser');
        break;

      case 'InvalidStateError':
        this.notifyStorageIssue('invalid_state', 'Storage system encountered an error');
        break;

      case 'DataError':
        this.notifyStorageIssue('data_corruption', 'Data corruption detected');
        break;

      default:
        this.notifyStorageIssue('unknown', 'Unexpected storage error occurred');
    }
  }

  private async handleQuotaExceeded(): Promise<void> {
    console.warn('Storage quota exceeded, attempting cleanup...');
    this.notifyStorageIssue('quota', 'Storage space is running low. Old data cleaned up.');
  }

  private notifyStorageIssue(type: string, message: string): void {
    const event = new CustomEvent('storage-issue', {
      detail: { type, message, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getErrorStatistics(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  resetErrorCounts(): void {
    this.errorCounts.clear();
  }
}

class StorageError extends Error {
  constructor(
    message: string,
    public operationType: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export const storageErrorHandler = new StorageErrorHandler();
```

## Auto-Save Patterns

Intelligent save timing with visibility and beforeunload handling:

```typescript
class AutoSaveManager {
  private storage: StorageAdapter;
  private saveInterval: number | null = null;
  private saveFrequency = 60000; // 1 minute default
  private lastSaveTime = 0;
  private isEnabled = true;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.setupAutoSave();
    this.setupVisibilityHandling();
    this.setupBeforeUnloadHandling();
  }

  private setupAutoSave(): void {
    this.saveInterval = setInterval(() => {
      if (this.isEnabled && this.shouldAutoSave()) {
        this.performAutoSave();
      }
    }, 30000);
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performImmediateSave();
      }
    });
  }

  private setupBeforeUnloadHandling(): void {
    window.addEventListener('beforeunload', (event) => {
      if (this.hasPendingChanges()) {
        this.performSynchronousSave();

        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    });
  }

  private shouldAutoSave(): boolean {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;
    return timeSinceLastSave >= this.saveFrequency && this.hasPendingChanges();
  }

  private hasPendingChanges(): boolean {
    // Implementation-specific: check if stores have unsaved changes
    return false;
  }

  async performAutoSave(): Promise<void> {
    // Implementation-specific: collect and save state
  }

  async performImmediateSave(): Promise<void> {
    return this.performAutoSave();
  }

  private performSynchronousSave(): void {
    try {
      // Synchronous emergency save using localStorage
      localStorage.setItem('gps_emergency_save', JSON.stringify({ timestamp: Date.now() }));
    } catch (error) {
      console.error('Emergency save failed:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setSaveFrequency(frequency: number): void {
    this.saveFrequency = Math.max(10000, frequency);
  }

  cleanup(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}
```

## Implementation Notes

### State Separation Strategy

**Session State** (clears on game end):
- Guinea pig needs and wellness
- Habitat conditions (cleanliness, bedding, water)
- Activity feed history
- Current game session timing

**Persistent State** (survives sessions):
- Player currency and statistics
- Owned items (non-consumables)
- Unused consumables
- Achievements and progression
- Pet store guinea pig pool

**Pet Store State**:
- 10 guinea pig pool with randomized preferences
- Last refresh timestamp for cooldown management
- Debug mode settings for unlimited refresh

### Storage Recommendations

**For this game:**
- **Primary**: localStorage (data size < 1MB, simple access patterns)
- **Fallback**: Memory storage (session only, no persistence)
- **Future**: Consider IndexedDB if adding complex features (multiple save slots, history tracking)

### Key Patterns

1. **Always use storage adapters** - Never directly call localStorage/IndexedDB
2. **Implement retry logic** - Browser storage can fail temporarily
3. **Monitor quota usage** - Clean up old data proactively
4. **Separate concerns** - Session state separate from persistent state
5. **Handle beforeunload** - Save on page exit attempts
6. **Test degradation** - App should work with memory-only storage

See [Pet Store & Game Session Manager](../systems/phase2/system-6.5-pet-store-manager.md) for specific implementation details of state persistence in the current architecture.