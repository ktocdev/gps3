# Audio & Media Implementation Guide

**Technical Documentation - Guinea Pig Simulation**

## Overview

This guide provides comprehensive strategies for implementing robust audio and media systems in the guinea pig simulation, focusing on Web Audio API management, cross-platform compatibility, mobile browser autoplay policies, and optimized asset delivery for web deployment.

## Web Audio API Context Management

### Audio Context Initialization

Implement robust audio context creation with fallbacks and browser compatibility:

```typescript
// Audio context manager with cross-browser support
class AudioContextManager {
  private context: AudioContext | null = null;
  private isContextSuspended = true;
  private pendingResumePromise: Promise<void> | null = null;
  private userInteractionDetected = false;

  constructor() {
    this.createAudioContext();
    this.setupUserInteractionDetection();
    this.setupVisibilityHandling();
  }

  private createAudioContext(): void {
    try {
      // Cross-browser AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      this.context = new AudioContextClass();
      this.isContextSuspended = this.context.state === 'suspended';

      // Listen for state changes
      this.context.addEventListener('statechange', () => {
        this.isContextSuspended = this.context!.state === 'suspended';
        this.notifyStateChange();
      });

    } catch (error) {
      console.error('Failed to create AudioContext:', error);
    }
  }

  private setupUserInteractionDetection(): void {
    const handleUserInteraction = () => {
      this.userInteractionDetected = true;
      this.resumeContextIfNeeded();

      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Listen for user interactions that can unlock audio
    document.addEventListener('click', handleUserInteraction, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden - suspend audio context to save resources
        this.suspendContext();
      } else {
        // Page visible - resume if user has interacted
        if (this.userInteractionDetected) {
          this.resumeContextIfNeeded();
        }
      }
    });
  }

  private async resumeContextIfNeeded(): Promise<void> {
    if (!this.context || this.context.state !== 'suspended') {
      return;
    }

    // Prevent multiple resume attempts
    if (this.pendingResumePromise) {
      return this.pendingResumePromise;
    }

    this.pendingResumePromise = this.context.resume().then(() => {
      this.pendingResumePromise = null;
      console.log('AudioContext resumed');
    }).catch(error => {
      this.pendingResumePromise = null;
      console.error('Failed to resume AudioContext:', error);
    });

    return this.pendingResumePromise;
  }

  private async suspendContext(): Promise<void> {
    if (!this.context || this.context.state === 'suspended') {
      return;
    }

    try {
      await this.context.suspend();
      console.log('AudioContext suspended');
    } catch (error) {
      console.error('Failed to suspend AudioContext:', error);
    }
  }

  private notifyStateChange(): void {
    // Emit event for other systems to react to audio context state changes
    const event = new CustomEvent('audiocontextchange', {
      detail: {
        state: this.context?.state,
        isAvailable: this.isAvailable()
      }
    });
    document.dispatchEvent(event);
  }

  // Public API
  getContext(): AudioContext | null {
    return this.context;
  }

  isAvailable(): boolean {
    return this.context !== null && this.context.state !== 'closed';
  }

  isSuspended(): boolean {
    return this.isContextSuspended;
  }

  async ensureResumed(): Promise<boolean> {
    if (!this.userInteractionDetected) {
      console.warn('Cannot resume AudioContext without user interaction');
      return false;
    }

    if (!this.context) {
      return false;
    }

    if (this.context.state === 'suspended') {
      await this.resumeContextIfNeeded();
    }

    return this.context.state === 'running';
  }

  async close(): Promise<void> {
    if (this.context && this.context.state !== 'closed') {
      await this.context.close();
    }
  }

  // Audio node creation helpers
  createGainNode(): GainNode | null {
    if (!this.context) return null;
    return this.context.createGain();
  }

  createBufferSource(): AudioBufferSourceNode | null {
    if (!this.context) return null;
    return this.context.createBufferSource();
  }

  createOscillator(): OscillatorNode | null {
    if (!this.context) return null;
    return this.context.createOscillator();
  }

  getCurrentTime(): number {
    return this.context?.currentTime ?? 0;
  }

  getSampleRate(): number {
    return this.context?.sampleRate ?? 44100;
  }
}

// Global audio context manager
export const audioContextManager = new AudioContextManager();
```

### Audio Buffer Management

Implement efficient audio buffer loading and caching:

```typescript
// Audio buffer manager with caching and format fallbacks
class AudioBufferManager {
  private buffers = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer>>();
  private supportedFormats: string[] = [];

  constructor() {
    this.detectSupportedFormats();
  }

  private detectSupportedFormats(): void {
    const audio = document.createElement('audio');

    // Check format support
    const formats = [
      { ext: 'mp3', mime: 'audio/mpeg' },
      { ext: 'ogg', mime: 'audio/ogg; codecs="vorbis"' },
      { ext: 'wav', mime: 'audio/wav' },
      { ext: 'm4a', mime: 'audio/mp4; codecs="mp4a.40.2"' },
      { ext: 'webm', mime: 'audio/webm; codecs="vorbis"' }
    ];

    this.supportedFormats = formats
      .filter(format => audio.canPlayType(format.mime) !== '')
      .map(format => format.ext);

    console.log('Supported audio formats:', this.supportedFormats);
  }

  async loadBuffer(soundId: string, basePath: string): Promise<AudioBuffer | null> {
    // Return cached buffer if available
    if (this.buffers.has(soundId)) {
      return this.buffers.get(soundId)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(soundId)) {
      return this.loadingPromises.get(soundId)!;
    }

    // Start loading process
    const loadingPromise = this.loadBufferInternal(soundId, basePath);
    this.loadingPromises.set(soundId, loadingPromise);

    try {
      const buffer = await loadingPromise;
      this.buffers.set(soundId, buffer);
      return buffer;
    } catch (error) {
      console.error(`Failed to load audio buffer for ${soundId}:`, error);
      return null;
    } finally {
      this.loadingPromises.delete(soundId);
    }
  }

  private async loadBufferInternal(soundId: string, basePath: string): Promise<AudioBuffer> {
    const context = audioContextManager.getContext();
    if (!context) {
      throw new Error('AudioContext not available');
    }

    // Try loading in order of format preference
    const formatPreference = ['mp3', 'ogg', 'wav', 'm4a', 'webm'];
    const availableFormats = formatPreference.filter(format =>
      this.supportedFormats.includes(format)
    );

    let lastError: Error | null = null;

    for (const format of availableFormats) {
      try {
        const url = `${basePath}/${soundId}.${format}`;
        const arrayBuffer = await this.fetchAudioData(url);
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        return audioBuffer;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load ${soundId}.${format}, trying next format...`);
      }
    }

    throw lastError || new Error(`No supported format found for ${soundId}`);
  }

  private async fetchAudioData(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  // Preload multiple sounds
  async preloadSounds(sounds: Array<{ id: string; path: string }>): Promise<void> {
    const loadPromises = sounds.map(sound => this.loadBuffer(sound.id, sound.path));

    const results = await Promise.allSettled(loadPromises);

    const failed = results
      .map((result, index) => ({ result, sound: sounds[index] }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ sound }) => sound.id);

    if (failed.length > 0) {
      console.warn('Failed to preload sounds:', failed);
    }
  }

  getBuffer(soundId: string): AudioBuffer | null {
    return this.buffers.get(soundId) || null;
  }

  hasBuffer(soundId: string): boolean {
    return this.buffers.has(soundId);
  }

  clearCache(): void {
    this.buffers.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    let totalSize = 0;
    for (const buffer of this.buffers.values()) {
      // Estimate size: channels * length * 4 bytes per sample
      totalSize += buffer.numberOfChannels * buffer.length * 4;
    }
    return totalSize;
  }

  // Remove least recently used buffers if cache gets too large
  trimCache(maxSizeBytes: number = 50 * 1024 * 1024): void { // 50MB default
    const currentSize = this.getCacheSize();

    if (currentSize <= maxSizeBytes) {
      return;
    }

    // Simple LRU: remove half of the buffers
    // In a real implementation, you'd track usage timestamps
    const bufferIds = Array.from(this.buffers.keys());
    const toRemove = bufferIds.slice(0, Math.floor(bufferIds.length / 2));

    toRemove.forEach(id => this.buffers.delete(id));

    console.log(`Trimmed audio cache: removed ${toRemove.length} buffers`);
  }
}

// Global audio buffer manager
export const audioBufferManager = new AudioBufferManager();
```

## Mobile Browser Autoplay Policy Handling

### Autoplay Policy Detection

Implement comprehensive autoplay policy detection and handling:

```typescript
// Autoplay policy manager
class AutoplayPolicyManager {
  private autoplayAllowed = false;
  private autoplayTestCompleted = false;
  private pendingAudioQueue: Array<() => void> = [];
  private userInteractionRequired = true;

  constructor() {
    this.detectAutoplaySupport();
    this.setupUserInteractionHandling();
  }

  private async detectAutoplaySupport(): Promise<void> {
    try {
      // Create a silent audio context test
      const context = audioContextManager.getContext();
      if (!context) {
        this.autoplayTestCompleted = true;
        return;
      }

      // Create a short silent audio buffer
      const buffer = context.createBuffer(1, 1, 22050);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);

      // Try to play immediately
      const playPromise = new Promise<void>((resolve, reject) => {
        source.onended = () => resolve();
        source.onerror = () => reject(new Error('Autoplay blocked'));
        source.start(0);
      });

      await playPromise;
      this.autoplayAllowed = true;
      this.userInteractionRequired = false;

    } catch (error) {
      this.autoplayAllowed = false;
      this.userInteractionRequired = true;
    } finally {
      this.autoplayTestCompleted = true;
      this.notifyAutoplayStatus();
    }
  }

  private setupUserInteractionHandling(): void {
    const handleUserInteraction = async () => {
      if (this.userInteractionRequired) {
        await this.unlockAudio();
      }
    };

    // Listen for various user interaction events
    const events = ['click', 'touchstart', 'touchend', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, {
        once: true,
        passive: true
      });
    });
  }

  private async unlockAudio(): Promise<void> {
    try {
      // Ensure audio context is resumed
      await audioContextManager.ensureResumed();

      // Test audio playback
      const context = audioContextManager.getContext();
      if (context && context.state === 'running') {
        this.autoplayAllowed = true;
        this.userInteractionRequired = false;

        // Process any pending audio operations
        this.processPendingAudio();

        this.notifyAutoplayStatus();
        console.log('Audio unlocked successfully');
      }
    } catch (error) {
      console.error('Failed to unlock audio:', error);
    }
  }

  private processPendingAudio(): void {
    while (this.pendingAudioQueue.length > 0) {
      const audioOperation = this.pendingAudioQueue.shift();
      if (audioOperation) {
        try {
          audioOperation();
        } catch (error) {
          console.error('Error processing pending audio:', error);
        }
      }
    }
  }

  private notifyAutoplayStatus(): void {
    const event = new CustomEvent('autoplaystatuschange', {
      detail: {
        allowed: this.autoplayAllowed,
        userInteractionRequired: this.userInteractionRequired,
        testCompleted: this.autoplayTestCompleted
      }
    });
    document.dispatchEvent(event);
  }

  // Public API
  isAutoplayAllowed(): boolean {
    return this.autoplayAllowed;
  }

  requiresUserInteraction(): boolean {
    return this.userInteractionRequired;
  }

  isTestCompleted(): boolean {
    return this.autoplayTestCompleted;
  }

  // Queue audio operation for later execution if autoplay is blocked
  queueAudioOperation(operation: () => void): void {
    if (this.autoplayAllowed) {
      operation();
    } else {
      this.pendingAudioQueue.push(operation);
    }
  }

  // Force unlock attempt (call after user interaction)
  async forceUnlock(): Promise<boolean> {
    await this.unlockAudio();
    return this.autoplayAllowed;
  }

  // Get browser-specific autoplay policy info
  getBrowserAutoplayInfo(): AutoplayInfo {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome')) {
      return {
        browser: 'chrome',
        policy: 'gesture-required',
        description: 'Requires user gesture for audio with sound'
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'safari',
        policy: 'strict',
        description: 'Requires user interaction for any audio playback'
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'firefox',
        policy: 'moderate',
        description: 'Generally allows autoplay for short sounds'
      };
    }

    return {
      browser: 'unknown',
      policy: 'unknown',
      description: 'Autoplay policy varies by browser'
    };
  }
}

// Global autoplay policy manager
export const autoplayPolicy = new AutoplayPolicyManager();

// Interface definitions
interface AutoplayInfo {
  browser: string;
  policy: 'strict' | 'moderate' | 'gesture-required' | 'unknown';
  description: string;
}
```

### User Interaction Audio Unlocking

Implement user-friendly audio unlocking system:

```typescript
// Audio unlock UI manager
class AudioUnlockManager {
  private unlockOverlay: HTMLElement | null = null;
  private isUnlockUIVisible = false;
  private audioEnabled = true;

  constructor() {
    this.setupAutoplayListener();
    this.createUnlockUI();
  }

  private setupAutoplayListener(): void {
    document.addEventListener('autoplaystatuschange', (event: any) => {
      const { allowed, userInteractionRequired, testCompleted } = event.detail;

      if (testCompleted && userInteractionRequired && this.audioEnabled) {
        this.showUnlockUI();
      } else if (allowed) {
        this.hideUnlockUI();
      }
    });
  }

  private createUnlockUI(): void {
    this.unlockOverlay = document.createElement('div');
    this.unlockOverlay.className = 'audio-unlock-overlay';
    this.unlockOverlay.innerHTML = `
      <div class="audio-unlock-content">
        <div class="audio-unlock-icon">🔊</div>
        <h3>Enable Audio</h3>
        <p>Tap anywhere to enable sound effects and guinea pig sounds</p>
        <button class="audio-unlock-button">Enable Audio</button>
        <button class="audio-unlock-skip">Play Without Sound</button>
      </div>
    `;

    // Style the overlay
    Object.assign(this.unlockOverlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10000',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    });

    // Add event listeners
    const enableButton = this.unlockOverlay.querySelector('.audio-unlock-button');
    const skipButton = this.unlockOverlay.querySelector('.audio-unlock-skip');

    enableButton?.addEventListener('click', () => {
      this.handleUnlockAudio();
    });

    skipButton?.addEventListener('click', () => {
      this.handleSkipAudio();
    });

    // Also allow clicking anywhere to unlock
    this.unlockOverlay.addEventListener('click', (event) => {
      if (event.target === this.unlockOverlay) {
        this.handleUnlockAudio();
      }
    });

    document.body.appendChild(this.unlockOverlay);
  }

  private async handleUnlockAudio(): Promise<void> {
    try {
      const success = await autoplayPolicy.forceUnlock();

      if (success) {
        this.hideUnlockUI();

        // Play a brief confirmation sound if available
        this.playUnlockConfirmation();

        // Notify the app that audio is ready
        this.notifyAudioReady();
      } else {
        // Show error message
        this.showUnlockError();
      }
    } catch (error) {
      console.error('Audio unlock failed:', error);
      this.showUnlockError();
    }
  }

  private handleSkipAudio(): void {
    this.audioEnabled = false;
    this.hideUnlockUI();

    // Notify the app that audio is disabled
    this.notifyAudioDisabled();
  }

  private showUnlockUI(): void {
    if (this.unlockOverlay && !this.isUnlockUIVisible) {
      this.unlockOverlay.style.display = 'flex';
      this.isUnlockUIVisible = true;

      // Pause game if it's running
      const gameController = useGameControllerStore();
      gameController.pause('audio-unlock');
    }
  }

  private hideUnlockUI(): void {
    if (this.unlockOverlay && this.isUnlockUIVisible) {
      this.unlockOverlay.style.display = 'none';
      this.isUnlockUIVisible = false;

      // Resume game
      const gameController = useGameControllerStore();
      gameController.resume('audio-unlock');
    }
  }

  private showUnlockError(): void {
    const content = this.unlockOverlay?.querySelector('.audio-unlock-content');
    if (content) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'audio-unlock-error';
      errorMsg.textContent = 'Unable to enable audio. You can continue without sound.';
      errorMsg.style.color = '#ff6b6b';
      errorMsg.style.marginTop = '16px';
      content.appendChild(errorMsg);

      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  }

  private async playUnlockConfirmation(): Promise<void> {
    try {
      // Play a brief confirmation tone
      const context = audioContextManager.getContext();
      if (context) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
      }
    } catch (error) {
      // Confirmation sound failed, but that's okay
      console.warn('Confirmation sound failed:', error);
    }
  }

  private notifyAudioReady(): void {
    const event = new CustomEvent('audioready');
    document.dispatchEvent(event);
  }

  private notifyAudioDisabled(): void {
    const event = new CustomEvent('audiodisabled');
    document.dispatchEvent(event);
  }

  // Public API
  forceShowUnlockUI(): void {
    this.showUnlockUI();
  }

  isUIVisible(): boolean {
    return this.isUnlockUIVisible;
  }

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    if (!enabled) {
      this.hideUnlockUI();
    }
  }
}

// Global audio unlock manager
export const audioUnlockManager = new AudioUnlockManager();
```

## Asset Optimization for Web Delivery

### Audio Asset Compression and Optimization

Implement optimized audio asset management:

```typescript
// Audio asset optimizer
class AudioAssetOptimizer {
  private compressionSettings = {
    mp3: {
      bitrate: 128, // kbps
      quality: 'standard',
      stereo: false // Most game sounds can be mono
    },
    ogg: {
      quality: 5, // 0-10 scale
      bitrate: 'variable'
    },
    fallback: {
      format: 'wav',
      quality: 'low'
    }
  };

  // Audio asset manifest with optimization metadata
  private assetManifest = new Map<string, AudioAssetInfo>();

  async loadAssetManifest(manifestUrl: string): Promise<void> {
    try {
      const response = await fetch(manifestUrl);
      const manifest = await response.json();

      for (const [id, info] of Object.entries(manifest.assets)) {
        this.assetManifest.set(id, info as AudioAssetInfo);
      }

      console.log(`Loaded audio manifest: ${this.assetManifest.size} assets`);
    } catch (error) {
      console.error('Failed to load audio manifest:', error);
    }
  }

  getOptimalAssetUrl(assetId: string): string | null {
    const assetInfo = this.assetManifest.get(assetId);
    if (!assetInfo) {
      console.warn(`Audio asset not found: ${assetId}`);
      return null;
    }

    // Determine best format based on browser support and connection
    const connection = (navigator as any).connection;
    const isSlowConnection = connection?.effectiveType?.includes('2g') ||
                           connection?.saveData;

    // Choose format based on connection and browser support
    let preferredFormat: string;

    if (isSlowConnection) {
      // Use most compressed format for slow connections
      preferredFormat = 'ogg'; // Generally smaller than MP3
    } else {
      // Use best quality for fast connections
      preferredFormat = 'mp3'; // Best compatibility
    }

    // Fallback to any available format
    const availableFormats = Object.keys(assetInfo.formats);
    const selectedFormat = availableFormats.includes(preferredFormat)
      ? preferredFormat
      : availableFormats[0];

    if (!selectedFormat) {
      console.error(`No formats available for ${assetId}`);
      return null;
    }

    return assetInfo.formats[selectedFormat].url;
  }

  // Get asset size for bandwidth estimation
  getAssetSize(assetId: string, format?: string): number {
    const assetInfo = this.assetManifest.get(assetId);
    if (!assetInfo) return 0;

    if (format && assetInfo.formats[format]) {
      return assetInfo.formats[format].size;
    }

    // Return smallest available size
    const sizes = Object.values(assetInfo.formats).map(f => f.size);
    return Math.min(...sizes);
  }

  // Estimate download time
  estimateDownloadTime(assetId: string): number {
    const connection = (navigator as any).connection;
    const effectiveSpeed = connection?.downlink || 1; // Mbps

    const sizeBytes = this.getAssetSize(assetId);
    const sizeMb = sizeBytes / (1024 * 1024);

    return (sizeMb / effectiveSpeed) * 1000; // milliseconds
  }

  // Prioritize assets for preloading
  getPriorityAssets(): string[] {
    const priorities: Array<{ id: string; priority: number }> = [];

    for (const [id, info] of this.assetManifest) {
      priorities.push({ id, priority: info.priority || 5 });
    }

    return priorities
      .sort((a, b) => a.priority - b.priority)
      .map(item => item.id);
  }

  // Get lightweight asset alternatives
  getLightweightAlternatives(): Map<string, string> {
    const alternatives = new Map<string, string>();

    for (const [id, info] of this.assetManifest) {
      if (info.lightweight) {
        alternatives.set(id, info.lightweight);
      }
    }

    return alternatives;
  }

  // Asset loading strategy based on device capabilities
  getLoadingStrategy(): AssetLoadingStrategy {
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';

    if (deviceMemory < 2 || effectiveType.includes('2g')) {
      return {
        strategy: 'minimal',
        maxConcurrent: 2,
        useCompressed: true,
        preloadCount: 5
      };
    } else if (deviceMemory < 4 || effectiveType === '3g') {
      return {
        strategy: 'balanced',
        maxConcurrent: 4,
        useCompressed: true,
        preloadCount: 10
      };
    } else {
      return {
        strategy: 'full',
        maxConcurrent: 8,
        useCompressed: false,
        preloadCount: 20
      };
    }
  }
}

// Audio asset loader with optimization
class OptimizedAudioLoader {
  private optimizer = new AudioAssetOptimizer();
  private loadingQueue: string[] = [];
  private loadingInProgress = new Set<string>();
  private maxConcurrentLoads = 4;

  constructor() {
    this.setupNetworkOptimization();
  }

  private setupNetworkOptimization(): void {
    const strategy = this.optimizer.getLoadingStrategy();
    this.maxConcurrentLoads = strategy.maxConcurrent;

    // Adjust strategy based on network changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        const newStrategy = this.optimizer.getLoadingStrategy();
        this.maxConcurrentLoads = newStrategy.maxConcurrent;
      });
    }
  }

  async loadAsset(assetId: string, priority: number = 5): Promise<AudioBuffer | null> {
    // Check if already loaded
    if (audioBufferManager.hasBuffer(assetId)) {
      return audioBufferManager.getBuffer(assetId);
    }

    // Check if already loading
    if (this.loadingInProgress.has(assetId)) {
      return this.waitForLoad(assetId);
    }

    // Add to queue with priority
    this.addToQueue(assetId, priority);
    return this.processQueue();
  }

  private addToQueue(assetId: string, priority: number): void {
    // Insert based on priority (lower number = higher priority)
    const insertIndex = this.loadingQueue.findIndex(id => {
      // This is simplified - in reality you'd store priority with the ID
      return priority < 5; // Default priority
    });

    if (insertIndex === -1) {
      this.loadingQueue.push(assetId);
    } else {
      this.loadingQueue.splice(insertIndex, 0, assetId);
    }
  }

  private async processQueue(): Promise<AudioBuffer | null> {
    while (this.loadingQueue.length > 0 &&
           this.loadingInProgress.size < this.maxConcurrentLoads) {

      const assetId = this.loadingQueue.shift()!;
      this.loadingInProgress.add(assetId);

      // Start loading (don't await here to allow concurrent loads)
      this.loadAssetInternal(assetId).finally(() => {
        this.loadingInProgress.delete(assetId);
        // Continue processing queue
        this.processQueue();
      });
    }

    // Return the first asset if it's what we're looking for
    // This is simplified - in reality you'd track specific requests
    return null;
  }

  private async loadAssetInternal(assetId: string): Promise<void> {
    try {
      const assetUrl = this.optimizer.getOptimalAssetUrl(assetId);
      if (!assetUrl) {
        throw new Error(`Asset URL not found: ${assetId}`);
      }

      // Extract base path and filename
      const url = new URL(assetUrl);
      const basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
      const filename = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
      const fileId = filename.substring(0, filename.lastIndexOf('.'));

      await audioBufferManager.loadBuffer(fileId, basePath);
    } catch (error) {
      console.error(`Failed to load asset ${assetId}:`, error);
    }
  }

  private async waitForLoad(assetId: string): Promise<AudioBuffer | null> {
    // Wait for the asset to finish loading
    return new Promise((resolve) => {
      const checkLoaded = () => {
        if (audioBufferManager.hasBuffer(assetId)) {
          resolve(audioBufferManager.getBuffer(assetId));
        } else if (this.loadingInProgress.has(assetId)) {
          setTimeout(checkLoaded, 100);
        } else {
          resolve(null); // Loading failed
        }
      };
      checkLoaded();
    });
  }

  // Preload essential assets
  async preloadEssentialAssets(): Promise<void> {
    const essentialAssets = this.optimizer.getPriorityAssets().slice(0, 10);
    const loadPromises = essentialAssets.map(assetId =>
      this.loadAsset(assetId, 1) // High priority
    );

    await Promise.allSettled(loadPromises);
  }

  // Load assets for specific game state
  async loadAssetsForState(gameState: string): Promise<void> {
    const stateAssets = this.getAssetsForState(gameState);
    const loadPromises = stateAssets.map(assetId =>
      this.loadAsset(assetId, 3) // Medium priority
    );

    await Promise.allSettled(loadPromises);
  }

  private getAssetsForState(gameState: string): string[] {
    // Return asset IDs needed for specific game states
    const stateAssetMap: Record<string, string[]> = {
      'intro': ['ui-click', 'ui-success', 'background-music'],
      'playing': ['guinea-pig-chirp', 'guinea-pig-wheek', 'ui-click', 'achievement'],
      'interaction': ['guinea-pig-purr', 'guinea-pig-happy', 'ui-success'],
      'achievement': ['achievement-unlock', 'celebration']
    };

    return stateAssetMap[gameState] || [];
  }
}

// Global optimized audio loader
export const audioLoader = new OptimizedAudioLoader();

// Interface definitions
interface AudioAssetInfo {
  id: string;
  name: string;
  formats: Record<string, {
    url: string;
    size: number;
    bitrate?: number;
    duration?: number;
  }>;
  priority?: number;
  lightweight?: string; // ID of lightweight alternative
  category: 'ui' | 'reaction' | 'ambient' | 'music';
  tags: string[];
}

interface AssetLoadingStrategy {
  strategy: 'minimal' | 'balanced' | 'full';
  maxConcurrent: number;
  useCompressed: boolean;
  preloadCount: number;
}
```

## Advanced Audio Features

### Spatial Audio and Positioning

Implement spatial audio for enhanced immersion:

```typescript
// Spatial audio manager for 3D positioning
class SpatialAudioManager {
  private listener: AudioListener | null = null;
  private spatialSources = new Map<string, PannerNode>();

  constructor() {
    this.initializeListener();
  }

  private initializeListener(): void {
    const context = audioContextManager.getContext();
    if (!context) return;

    this.listener = context.listener;

    // Set default listener position (center of habitat)
    if (this.listener.positionX) {
      // Modern API
      this.listener.positionX.setValueAtTime(0, context.currentTime);
      this.listener.positionY.setValueAtTime(0, context.currentTime);
      this.listener.positionZ.setValueAtTime(0, context.currentTime);

      this.listener.forwardX.setValueAtTime(0, context.currentTime);
      this.listener.forwardY.setValueAtTime(0, context.currentTime);
      this.listener.forwardZ.setValueAtTime(-1, context.currentTime);

      this.listener.upX.setValueAtTime(0, context.currentTime);
      this.listener.upY.setValueAtTime(1, context.currentTime);
      this.listener.upZ.setValueAtTime(0, context.currentTime);
    } else {
      // Legacy API fallback
      (this.listener as any).setPosition?.(0, 0, 0);
      (this.listener as any).setOrientation?.(0, 0, -1, 0, 1, 0);
    }
  }

  createSpatialSource(soundId: string, position: { x: number; y: number; z: number }): AudioNode | null {
    const context = audioContextManager.getContext();
    if (!context) return null;

    // Create panner node for spatial positioning
    const panner = context.createPanner();

    // Configure panner settings
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    // Set position
    this.updateSourcePosition(panner, position);

    this.spatialSources.set(soundId, panner);
    return panner;
  }

  updateSourcePosition(pannerOrId: PannerNode | string, position: { x: number; y: number; z: number }): void {
    const context = audioContextManager.getContext();
    if (!context) return;

    const panner = typeof pannerOrId === 'string'
      ? this.spatialSources.get(pannerOrId)
      : pannerOrId;

    if (!panner) return;

    // Smooth position updates to prevent clicking
    const currentTime = context.currentTime;
    const rampTime = 0.1; // 100ms smooth transition

    if (panner.positionX) {
      // Modern API
      panner.positionX.linearRampToValueAtTime(position.x, currentTime + rampTime);
      panner.positionY.linearRampToValueAtTime(position.y, currentTime + rampTime);
      panner.positionZ.linearRampToValueAtTime(position.z, currentTime + rampTime);
    } else {
      // Legacy API
      (panner as any).setPosition?.(position.x, position.y, position.z);
    }
  }

  updateListenerPosition(position: { x: number; y: number; z: number }): void {
    if (!this.listener) return;

    const context = audioContextManager.getContext();
    if (!context) return;

    const currentTime = context.currentTime;
    const rampTime = 0.05; // Faster for listener updates

    if (this.listener.positionX) {
      this.listener.positionX.linearRampToValueAtTime(position.x, currentTime + rampTime);
      this.listener.positionY.linearRampToValueAtTime(position.y, currentTime + rampTime);
      this.listener.positionZ.linearRampToValueAtTime(position.z, currentTime + rampTime);
    } else {
      (this.listener as any).setPosition?.(position.x, position.y, position.z);
    }
  }

  // Convert grid position to 3D coordinates
  gridToSpatial(gridX: number, gridY: number): { x: number; y: number; z: number } {
    // Assuming 8x8 grid centered at origin
    return {
      x: (gridX - 4) * 0.5, // Scale to reasonable spatial units
      y: 0, // 2D grid, so Y is always 0
      z: (gridY - 4) * 0.5
    };
  }

  removeSpatialSource(soundId: string): void {
    this.spatialSources.delete(soundId);
  }

  cleanup(): void {
    this.spatialSources.clear();
  }
}

// Global spatial audio manager
export const spatialAudio = new SpatialAudioManager();
```

### Audio Effects and Processing

Implement dynamic audio effects:

```typescript
// Audio effects processor
class AudioEffectsProcessor {
  private effectsChain = new Map<string, AudioNode[]>();

  createEffectsChain(effectsId: string, effects: AudioEffect[]): AudioNode | null {
    const context = audioContextManager.getContext();
    if (!context) return null;

    const nodes: AudioNode[] = [];
    let inputNode: AudioNode = context.createGain(); // Input gain

    for (const effect of effects) {
      const effectNode = this.createEffectNode(effect);
      if (effectNode) {
        inputNode.connect(effectNode);
        nodes.push(effectNode);
        inputNode = effectNode;
      }
    }

    this.effectsChain.set(effectsId, nodes);
    return nodes[0]; // Return first node in chain
  }

  private createEffectNode(effect: AudioEffect): AudioNode | null {
    const context = audioContextManager.getContext();
    if (!context) return null;

    switch (effect.type) {
      case 'reverb':
        return this.createReverbNode(effect.parameters);
      case 'lowpass':
        return this.createLowPassFilter(effect.parameters);
      case 'highpass':
        return this.createHighPassFilter(effect.parameters);
      case 'distortion':
        return this.createDistortionNode(effect.parameters);
      case 'delay':
        return this.createDelayNode(effect.parameters);
      case 'compressor':
        return this.createCompressorNode(effect.parameters);
      default:
        return null;
    }
  }

  private createReverbNode(params: any): AudioNode {
    const context = audioContextManager.getContext()!;
    const convolver = context.createConvolver();

    // Create impulse response for reverb
    const length = context.sampleRate * (params.duration || 2);
    const impulse = context.createBuffer(2, length, context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, params.decay || 2);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }

  private createLowPassFilter(params: any): AudioNode {
    const context = audioContextManager.getContext()!;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(params.frequency || 1000, context.currentTime);
    filter.Q.setValueAtTime(params.Q || 1, context.currentTime);
    return filter;
  }

  private createHighPassFilter(params: any): AudioNode {
    const context = audioContextManager.getContext()!;
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(params.frequency || 100, context.currentTime);
    filter.Q.setValueAtTime(params.Q || 1, context.currentTime);
    return filter;
  }

  private createDistortionNode(params: any): AudioNode {
    const context = audioContextManager.getContext()!;
    const waveshaper = context.createWaveShaper();

    // Create distortion curve
    const samples = 44100;
    const curve = new Float32Array(samples);
    const amount = params.amount || 50;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * Math.PI / 180) /
                 (Math.PI + amount * Math.abs(x));
    }

    waveshaper.curve = curve;
    waveshaper.oversample = '4x';
    return waveshaper;
  }

  private createDelayNode(params: any): AudioNode {
    const context = audioContextManager.getContext()!;
    const delay = context.createDelay(params.maxDelay || 1);
    delay.delayTime.setValueAtTime(params.delay || 0.3, context.currentTime);

    // Add feedback if specified
    if (params.feedback) {
      const feedback = context.createGain();
      feedback.gain.setValueAtTime(params.feedback, context.currentTime);
      delay.connect(feedback);
      feedback.connect(delay);
    }

    return delay;
  }

  private createCompressorNode(params: any): AudioNode {
    const context = audioContextManager.getContext()!;
    const compressor = context.createDynamicsCompressor();

    compressor.threshold.setValueAtTime(params.threshold || -50, context.currentTime);
    compressor.knee.setValueAtTime(params.knee || 40, context.currentTime);
    compressor.ratio.setValueAtTime(params.ratio || 12, context.currentTime);
    compressor.attack.setValueAtTime(params.attack || 0.003, context.currentTime);
    compressor.release.setValueAtTime(params.release || 0.25, context.currentTime);

    return compressor;
  }

  getEffectsChain(effectsId: string): AudioNode[] | null {
    return this.effectsChain.get(effectsId) || null;
  }

  removeEffectsChain(effectsId: string): void {
    this.effectsChain.delete(effectsId);
  }

  cleanup(): void {
    this.effectsChain.clear();
  }
}

// Global audio effects processor
export const audioEffects = new AudioEffectsProcessor();

// Interface definitions
interface AudioEffect {
  type: 'reverb' | 'lowpass' | 'highpass' | 'distortion' | 'delay' | 'compressor';
  parameters: Record<string, any>;
}
```

This comprehensive audio and media implementation guide provides robust solutions for managing Web Audio API contexts, handling mobile browser autoplay policies, optimizing asset delivery, and implementing advanced audio features for the guinea pig simulation game.