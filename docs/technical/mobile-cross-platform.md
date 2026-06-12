# Mobile & Cross-Platform Development Guide

**Technical Documentation - Guinea Pig Simulation**

## Overview

This guide provides comprehensive strategies for developing a mobile-first, cross-platform guinea pig simulation that delivers optimal performance and user experience across all devices. The focus is on responsive design, touch optimization, Progressive Web App features, and cross-browser compatibility.

## Mobile-First Responsive Design Implementation

### Breakpoint Strategy

Establish a comprehensive breakpoint system that prioritizes mobile experience:

```css
/* CSS Variables for consistent breakpoints */
:root {
  /* Mobile breakpoints */
  --mobile-portrait: 320px;
  --mobile-landscape: 568px;

  /* Tablet breakpoints */
  --tablet-portrait: 768px;
  --tablet-landscape: 1024px;

  /* Desktop breakpoints */
  --desktop-small: 1200px;
  --desktop-large: 1440px;

  /* Critical mobile landscape threshold */
  --mobile-landscape-height: 500px;
}

/* Mobile-first media queries */
/* Base styles: Mobile portrait (320px+) */
.game-container {
  width: 100%;
  min-height: 100vh;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

/* Mobile landscape (height < 500px) */
@media (max-height: 500px) and (orientation: landscape) {
  .game-container {
    flex-direction: row;
    padding: 4px;
  }

  /* Adaptive navigation: Switch to FAB */
  .bottom-navigation {
    display: none;
  }

  .floating-action-button {
    display: block;
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 1000;
  }
}

/* Tablet portrait (768px+) */
@media (min-width: 768px) {
  .game-container {
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .habitat-container {
    flex: 1;
    max-width: 670px;
  }

  .info-panel {
    width: 300px;
    margin-left: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .game-container {
    padding: 24px;
    gap: 24px;
  }

  .navigation-header {
    height: 80px;
  }

  .bottom-navigation {
    height: 80px;
    padding: 0 24px;
  }
}
```

### Container Query Implementation

Use container queries for component-level responsive behavior:

```css
/* Container query setup for major layout regions */
.habitat-container {
  container-type: inline-size;
  container-name: habitat-container;
}

.text-info-panel {
  container-type: size;
  container-name: text-panel;
}

.layout-region {
  container-type: inline-size;
  container-name: layout-region;
}

/* Habitat container responsive behavior */
@container habitat-container (max-width: 400px) {
  .habitat-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }

  .guinea-pig-sprite {
    width: 32px;
    height: 32px;
  }

  .habitat-item {
    width: 24px;
    height: 24px;
  }
}

@container habitat-container (min-width: 600px) {
  .habitat-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
  }

  .guinea-pig-sprite {
    width: 48px;
    height: 48px;
  }

  .habitat-item {
    width: 36px;
    height: 36px;
  }
}

/* Text panel responsive behavior */
@container text-panel (max-width: 250px) {
  .activity-feed {
    font-size: 12px;
    max-height: 150px;
  }

  .stats-display {
    display: none; /* Hide in very narrow containers */
  }

  .quick-stats-card {
    display: block; /* Show compact version */
  }
}

@container text-panel (min-width: 350px) {
  .activity-feed {
    font-size: 14px;
    max-height: 300px;
  }

  .stats-display {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

@container text-panel (min-height: 400px) {
  .activity-feed {
    max-height: 400px;
  }

  .activity-message {
    padding: 8px 12px;
    margin-bottom: 4px;
  }
}
```

### Adaptive Navigation System

Implement navigation that adapts to screen constraints:

```typescript
// Responsive navigation controller
interface NavigationState {
  currentMode: 'bottom-nav' | 'fab' | 'sidebar';
  isExpanded: boolean;
  screenType: 'mobile-portrait' | 'mobile-landscape' | 'tablet' | 'desktop';
  availableSpace: {
    width: number;
    height: number;
  };
}

class AdaptiveNavigationController {
  private state = reactive<NavigationState>({
    currentMode: 'bottom-nav',
    isExpanded: false,
    screenType: 'mobile-portrait',
    availableSpace: { width: 0, height: 0 }
  });

  private resizeObserver: ResizeObserver;
  private mediaQueries = new Map<string, MediaQueryList>();

  constructor() {
    this.setupMediaQueries();
    this.setupResizeObserver();
    this.updateNavigationMode();
  }

  private setupMediaQueries(): void {
    const queries = {
      'mobile-landscape': '(max-height: 500px) and (orientation: landscape)',
      'tablet': '(min-width: 768px) and (min-height: 600px)',
      'desktop': '(min-width: 1024px)'
    };

    Object.entries(queries).forEach(([name, query]) => {
      const mql = window.matchMedia(query);
      this.mediaQueries.set(name, mql);

      mql.addEventListener('change', () => {
        this.updateNavigationMode();
      });
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.state.availableSpace = {
          width: entry.contentRect.width,
          height: entry.contentRect.height
        };
      }
      this.updateNavigationMode();
    });

    // Observe the main game container
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      this.resizeObserver.observe(gameContainer);
    }
  }

  private updateNavigationMode(): void {
    const { width, height } = this.state.availableSpace;

    // Determine screen type
    if (this.mediaQueries.get('desktop')?.matches) {
      this.state.screenType = 'desktop';
      this.state.currentMode = 'bottom-nav';
    } else if (this.mediaQueries.get('tablet')?.matches) {
      this.state.screenType = 'tablet';
      this.state.currentMode = 'bottom-nav';
    } else if (this.mediaQueries.get('mobile-landscape')?.matches) {
      this.state.screenType = 'mobile-landscape';
      this.state.currentMode = 'fab';
    } else {
      this.state.screenType = 'mobile-portrait';
      this.state.currentMode = 'bottom-nav';
    }

    // Additional space-based adjustments
    if (height < 600 && width > 600) {
      this.state.currentMode = 'fab'; // Force FAB in constrained height
    }

    this.applyNavigationMode();
  }

  private applyNavigationMode(): void {
    const bottomNav = document.querySelector('.bottom-navigation');
    const fab = document.querySelector('.floating-action-button');
    const sidebar = document.querySelector('.navigation-sidebar');

    // Reset all navigation elements
    [bottomNav, fab, sidebar].forEach(el => {
      if (el) el.classList.add('hidden');
    });

    // Show appropriate navigation
    switch (this.state.currentMode) {
      case 'bottom-nav':
        bottomNav?.classList.remove('hidden');
        break;
      case 'fab':
        fab?.classList.remove('hidden');
        break;
      case 'sidebar':
        sidebar?.classList.remove('hidden');
        break;
    }
  }

  // Public API for components
  getCurrentMode(): string {
    return this.state.currentMode;
  }

  getScreenType(): string {
    return this.state.screenType;
  }

  toggleFAB(): void {
    if (this.state.currentMode === 'fab') {
      this.state.isExpanded = !this.state.isExpanded;
    }
  }

  getState(): Readonly<NavigationState> {
    return readonly(this.state);
  }
}

// Vue composable for navigation
export function useAdaptiveNavigation() {
  const controller = new AdaptiveNavigationController();

  onMounted(() => {
    controller.updateNavigationMode();
  });

  onUnmounted(() => {
    controller.cleanup();
  });

  return {
    navigationState: controller.getState(),
    getCurrentMode: controller.getCurrentMode.bind(controller),
    getScreenType: controller.getScreenType.bind(controller),
    toggleFAB: controller.toggleFAB.bind(controller)
  };
}
```

## Touch Interaction Optimization

### Touch-Friendly Interface Design

Design interfaces optimized for finger interaction:

```css
/* Touch target sizing */
:root {
  --touch-target-min: 44px; /* iOS minimum */
  --touch-target-comfortable: 48px;
  --touch-target-large: 56px;
  --touch-spacing: 8px;
}

/* Interactive elements sizing */
.interaction-button {
  min-width: var(--touch-target-comfortable);
  min-height: var(--touch-target-comfortable);
  padding: 12px 16px;
  margin: var(--touch-spacing);

  /* Touch feedback */
  transition: transform 0.1s ease, background-color 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.interaction-button:active {
  transform: scale(0.95);
  background-color: var(--color-primary-dark);
}

/* Guinea pig interaction area */
.guinea-pig-sprite {
  min-width: var(--touch-target-large);
  min-height: var(--touch-target-large);
  cursor: pointer;
  position: relative;
}

.guinea-pig-sprite::after {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  /* Visual feedback on hover/touch */
  background: rgba(var(--color-primary-rgb), 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.guinea-pig-sprite:hover::after,
.guinea-pig-sprite:active::after {
  opacity: 1;
}

/* Habitat item interaction */
.habitat-item {
  min-width: 32px;
  min-height: 32px;
  margin: 2px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.habitat-item:active {
  transform: scale(1.1);
}

/* FAB design for mobile landscape */
.floating-action-button {
  width: var(--touch-target-large);
  height: var(--touch-target-large);
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.floating-action-button:active {
  transform: scale(0.9);
}

.fab-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transform: scale(0.8) translateY(20px);
  opacity: 0;
  transition: all 0.2s ease;
}

.fab-menu.expanded {
  transform: scale(1) translateY(0);
  opacity: 1;
}
```

### Touch Event Handling

Implement optimized touch event handling:

```typescript
// Touch interaction manager
class TouchInteractionManager {
  private touchStartTime = 0;
  private touchStartPosition = { x: 0, y: 0 };
  private longPressTimer: number | null = null;
  private isDragging = false;

  private readonly LONG_PRESS_DURATION = 500; // 500ms
  private readonly DRAG_THRESHOLD = 10; // 10px
  private readonly TAP_MAX_DURATION = 300; // 300ms

  constructor(private element: HTMLElement) {
    this.setupTouchListeners();
  }

  private setupTouchListeners(): void {
    // Use passive listeners for better performance
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });

    // Also handle mouse events for desktop compatibility
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    this.isDragging = false;

    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      if (!this.isDragging) {
        this.handleLongPress(touch);
      }
    }, this.LONG_PRESS_DURATION);

    // Prevent default to avoid mouse events
    event.preventDefault();
  }

  private handleTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStartPosition.x;
    const deltaY = touch.clientY - this.touchStartPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.DRAG_THRESHOLD) {
      this.isDragging = true;
      this.clearLongPressTimer();

      // Handle drag if applicable
      this.handleDrag(touch, deltaX, deltaY);
    }

    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent): void {
    const duration = Date.now() - this.touchStartTime;
    this.clearLongPressTimer();

    if (!this.isDragging && duration < this.TAP_MAX_DURATION) {
      // Handle tap
      const touch = event.changedTouches[0];
      this.handleTap(touch);
    } else if (this.isDragging) {
      // Handle drag end
      this.handleDragEnd();
    }

    this.isDragging = false;
  }

  private handleTouchCancel(event: TouchEvent): void {
    this.clearLongPressTimer();
    this.isDragging = false;
  }

  private handleTap(touch: Touch): void {
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target) {
      // Dispatch custom tap event
      const tapEvent = new CustomEvent('tap', {
        detail: {
          x: touch.clientX,
          y: touch.clientY,
          target
        }
      });
      this.element.dispatchEvent(tapEvent);
    }
  }

  private handleLongPress(touch: Touch): void {
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target) {
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Dispatch custom long press event
      const longPressEvent = new CustomEvent('longpress', {
        detail: {
          x: touch.clientX,
          y: touch.clientY,
          target
        }
      });
      this.element.dispatchEvent(longPressEvent);
    }
  }

  private handleDrag(touch: Touch, deltaX: number, deltaY: number): void {
    const dragEvent = new CustomEvent('drag', {
      detail: {
        x: touch.clientX,
        y: touch.clientY,
        deltaX,
        deltaY
      }
    });
    this.element.dispatchEvent(dragEvent);
  }

  private handleDragEnd(): void {
    const dragEndEvent = new CustomEvent('dragend');
    this.element.dispatchEvent(dragEndEvent);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // Mouse event handlers for desktop compatibility
  private handleMouseDown(event: MouseEvent): void {
    // Convert mouse event to touch-like event
    this.touchStartTime = Date.now();
    this.touchStartPosition = { x: event.clientX, y: event.clientY };
    this.isDragging = false;
  }

  private handleMouseMove(event: MouseEvent): void {
    if (event.buttons === 1) { // Left mouse button
      const deltaX = event.clientX - this.touchStartPosition.x;
      const deltaY = event.clientY - this.touchStartPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.DRAG_THRESHOLD) {
        this.isDragging = true;
        this.handleDrag(event as any, deltaX, deltaY);
      }
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    const duration = Date.now() - this.touchStartTime;

    if (!this.isDragging && duration < this.TAP_MAX_DURATION) {
      this.handleTap(event as any);
    }

    this.isDragging = false;
  }

  cleanup(): void {
    this.clearLongPressTimer();
    // Remove event listeners if needed
  }
}

// Vue composable for touch interactions
export function useTouchInteractions(elementRef: Ref<HTMLElement | null>) {
  let touchManager: TouchInteractionManager | null = null;

  onMounted(() => {
    if (elementRef.value) {
      touchManager = new TouchInteractionManager(elementRef.value);
    }
  });

  onUnmounted(() => {
    touchManager?.cleanup();
  });

  return {
    // Touch interaction events are handled via custom events
    // Components can listen for 'tap', 'longpress', 'drag', 'dragend'
  };
}
```

### Haptic Feedback Integration

Implement haptic feedback for enhanced mobile experience:

```typescript
// Haptic feedback manager
class HapticFeedbackManager {
  private isSupported = 'vibrate' in navigator;
  private isEnabled = true;

  // Haptic patterns for different interactions
  private patterns = {
    tap: [10],
    success: [20, 50, 20],
    error: [100, 50, 100],
    warning: [50, 30, 50],
    interaction: [15],
    achievement: [30, 50, 30, 50, 30],
    longPress: [50],
    drag: [5]
  };

  constructor() {
    // Load user preference
    const saved = localStorage.getItem('haptic-feedback-enabled');
    this.isEnabled = saved === null ? true : saved === 'true';
  }

  triggerHaptic(type: keyof typeof this.patterns): void {
    if (!this.isSupported || !this.isEnabled) return;

    const pattern = this.patterns[type];
    if (pattern) {
      navigator.vibrate(pattern);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('haptic-feedback-enabled', enabled.toString());
  }

  isHapticSupported(): boolean {
    return this.isSupported;
  }

  isHapticEnabled(): boolean {
    return this.isEnabled;
  }
}

// Global haptic feedback instance
export const hapticFeedback = new HapticFeedbackManager();

// Integration with game interactions
export function useGameHaptics() {
  const triggerInteractionFeedback = (interactionType: string) => {
    switch (interactionType) {
      case 'pet':
      case 'feed':
      case 'play':
        hapticFeedback.triggerHaptic('interaction');
        break;
      case 'achievement-unlock':
        hapticFeedback.triggerHaptic('achievement');
        break;
      case 'error':
        hapticFeedback.triggerHaptic('error');
        break;
      case 'success':
        hapticFeedback.triggerHaptic('success');
        break;
    }
  };

  return {
    triggerInteractionFeedback,
    triggerHaptic: hapticFeedback.triggerHaptic.bind(hapticFeedback),
    setHapticEnabled: hapticFeedback.setEnabled.bind(hapticFeedback),
    isHapticSupported: hapticFeedback.isHapticSupported.bind(hapticFeedback),
    isHapticEnabled: hapticFeedback.isHapticEnabled.bind(hapticFeedback)
  };
}
```

## Progressive Web App (PWA) Features

### Service Worker Implementation

Implement caching strategies for offline functionality:

```typescript
// service-worker.ts
const CACHE_NAME = 'guinea-pig-sim-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/sounds/critical.mp3', // Essential sounds
  '/assets/sprites/guinea-pig-emoji.png' // Essential graphics
];

// Assets to cache on demand
const RUNTIME_CACHE_PATTERNS = [
  /^\/assets\/sounds\//,
  /^\/assets\/sprites\//,
  /^\/assets\/css\//,
  /^\/assets\/js\//
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle asset requests
  const url = new URL(event.request.url);
  const shouldCache = RUNTIME_CACHE_PATTERNS.some(pattern =>
    pattern.test(url.pathname)
  );

  if (shouldCache) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }

          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
  }
});

// Background sync for game saves
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'game-save') {
    event.waitUntil(syncGameSave());
  }
});

async function syncGameSave(): Promise<void> {
  try {
    const pendingSaves = await getIndexedDBData('pending-saves');

    for (const save of pendingSaves) {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(save)
      });
    }

    await clearIndexedDBData('pending-saves');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
```

### Web App Manifest

Configure the web app manifest for installation:

```json
{
  "name": "Guinea Pig Simulation",
  "short_name": "Guinea Pig Sim",
  "description": "A virtual guinea pig care simulation game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "orientation": "any",
  "icons": [
    {
      "src": "/assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/maskable-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/assets/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["games", "entertainment", "lifestyle"],
  "screenshots": [
    {
      "src": "/assets/screenshots/mobile-portrait.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/assets/screenshots/mobile-landscape.png",
      "sizes": "844x390",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/assets/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "prefer_related_applications": false
}
```

### Installation and Update Management

Handle PWA installation and updates:

```typescript
// PWA installation manager
class PWAManager {
  private deferredPrompt: any = null;
  private isInstalled = false;
  private updateAvailable = false;

  constructor() {
    this.setupInstallPrompt();
    this.setupUpdateDetection();
    this.checkInstallStatus();
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the mini-infobar from appearing
      event.preventDefault();

      // Store the event for later use
      this.deferredPrompt = event;

      // Show custom install button
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();

      // Track installation
      this.trackInstallation();
    });
  }

  private setupUpdateDetection(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker updated, reload to get new version
        window.location.reload();
      });

      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                this.updateAvailable = true;
                this.showUpdateNotification();
              }
            });
          }
        });
      });
    }
  }

  private checkInstallStatus(): void {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for user response
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        this.trackInstallation();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  applyUpdate(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          // Tell the waiting service worker to skip waiting and become active
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }

  private showInstallButton(): void {
    const installButton = document.querySelector('.install-button');
    if (installButton) {
      installButton.classList.remove('hidden');
    }

    // Show install prompt in settings
    const settingsStore = useSettingsStore();
    settingsStore.setInstallAvailable(true);
  }

  private hideInstallButton(): void {
    const installButton = document.querySelector('.install-button');
    if (installButton) {
      installButton.classList.add('hidden');
    }

    const settingsStore = useSettingsStore();
    settingsStore.setInstallAvailable(false);
  }

  private showUpdateNotification(): void {
    // Show update notification in UI
    const notificationStore = useNotificationStore();
    notificationStore.addNotification({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Restart to update.',
      actions: [
        {
          label: 'Update Now',
          action: () => this.applyUpdate()
        },
        {
          label: 'Later',
          action: () => {} // Dismiss
        }
      ]
    });
  }

  private trackInstallation(): void {
    // Track installation for analytics
    const analyticsStore = useAnalyticsStore();
    analyticsStore.trackEvent('pwa_installed', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: this.getPlatform()
    });
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('windows')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('linux')) return 'linux';

    return 'unknown';
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }
}

// Global PWA manager
export const pwaManager = new PWAManager();

// Vue composable for PWA features
export function usePWA() {
  const isInstalled = ref(pwaManager.isAppInstalled());
  const canInstall = ref(pwaManager.canInstall());
  const updateAvailable = ref(pwaManager.isUpdateAvailable());

  const install = async (): Promise<boolean> => {
    const result = await pwaManager.promptInstall();
    isInstalled.value = pwaManager.isAppInstalled();
    canInstall.value = pwaManager.canInstall();
    return result;
  };

  const update = (): void => {
    pwaManager.applyUpdate();
  };

  return {
    isInstalled: readonly(isInstalled),
    canInstall: readonly(canInstall),
    updateAvailable: readonly(updateAvailable),
    install,
    update
  };
}
```

## Cross-Browser Compatibility

### Feature Detection and Polyfills

Implement comprehensive feature detection:

```typescript
// Feature detection utility
class FeatureDetector {
  private features = new Map<string, boolean>();

  constructor() {
    this.detectFeatures();
  }

  private detectFeatures(): void {
    // Core web features
    this.features.set('serviceWorker', 'serviceWorker' in navigator);
    this.features.set('pushNotifications', 'Notification' in window);
    this.features.set('vibration', 'vibrate' in navigator);
    this.features.set('geolocation', 'geolocation' in navigator);
    this.features.set('localStorage', this.hasLocalStorage());
    this.features.set('indexedDB', 'indexedDB' in window);

    // Audio features
    this.features.set('webAudio', 'AudioContext' in window || 'webkitAudioContext' in window);
    this.features.set('audioAutoplay', this.detectAudioAutoplay());

    // Visual features
    this.features.set('containerQueries', this.hasContainerQueries());
    this.features.set('cssGrid', this.hasCSSGrid());
    this.features.set('webGL', this.hasWebGL());
    this.features.set('canvas', 'HTMLCanvasElement' in window);

    // Interaction features
    this.features.set('touchEvents', 'ontouchstart' in window);
    this.features.set('pointerEvents', 'PointerEvent' in window);
    this.features.set('passiveListeners', this.hasPassiveListeners());

    // Performance features
    this.features.set('requestIdleCallback', 'requestIdleCallback' in window);
    this.features.set('intersectionObserver', 'IntersectionObserver' in window);
    this.features.set('resizeObserver', 'ResizeObserver' in window);
  }

  private hasLocalStorage(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private detectAudioAutoplay(): boolean {
    // This is a simplified check - full detection requires user interaction
    const userAgent = navigator.userAgent.toLowerCase();

    // Safari and iOS generally block autoplay
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return false;
    }

    // Chrome with autoplay policy
    if (userAgent.includes('chrome')) {
      return false; // Assume blocked unless user interaction
    }

    return true; // Default assumption
  }

  private hasContainerQueries(): boolean {
    return CSS.supports('container-type: inline-size');
  }

  private hasCSSGrid(): boolean {
    return CSS.supports('display: grid');
  }

  private hasWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private hasPassiveListeners(): boolean {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassive = true;
          return true;
        }
      });
      window.addEventListener('testPassive', () => {}, opts);
      window.removeEventListener('testPassive', () => {}, opts);
    } catch {}
    return supportsPassive;
  }

  hasFeature(feature: string): boolean {
    return this.features.get(feature) ?? false;
  }

  getFeatures(): Map<string, boolean> {
    return new Map(this.features);
  }

  getMissingFeatures(required: string[]): string[] {
    return required.filter(feature => !this.hasFeature(feature));
  }
}

// Global feature detector
export const featureDetector = new FeatureDetector();

// Polyfill loader
class PolyfillLoader {
  private loadedPolyfills = new Set<string>();

  async loadRequiredPolyfills(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Container queries polyfill
    if (!featureDetector.hasFeature('containerQueries')) {
      promises.push(this.loadContainerQueriesPolyfill());
    }

    // Resize Observer polyfill
    if (!featureDetector.hasFeature('resizeObserver')) {
      promises.push(this.loadResizeObserverPolyfill());
    }

    // Intersection Observer polyfill
    if (!featureDetector.hasFeature('intersectionObserver')) {
      promises.push(this.loadIntersectionObserverPolyfill());
    }

    // Web Audio polyfill
    if (!featureDetector.hasFeature('webAudio')) {
      promises.push(this.loadWebAudioPolyfill());
    }

    await Promise.all(promises);
  }

  private async loadContainerQueriesPolyfill(): Promise<void> {
    if (this.loadedPolyfills.has('containerQueries')) return;

    try {
      await import('@container-query-polyfill/postcss');
      this.loadedPolyfills.add('containerQueries');
    } catch (error) {
      console.warn('Failed to load container queries polyfill:', error);
    }
  }

  private async loadResizeObserverPolyfill(): Promise<void> {
    if (this.loadedPolyfills.has('resizeObserver')) return;

    try {
      await import('resize-observer-polyfill');
      this.loadedPolyfills.add('resizeObserver');
    } catch (error) {
      console.warn('Failed to load ResizeObserver polyfill:', error);
    }
  }

  private async loadIntersectionObserverPolyfill(): Promise<void> {
    if (this.loadedPolyfills.has('intersectionObserver')) return;

    try {
      await import('intersection-observer');
      this.loadedPolyfills.add('intersectionObserver');
    } catch (error) {
      console.warn('Failed to load IntersectionObserver polyfill:', error);
    }
  }

  private async loadWebAudioPolyfill(): Promise<void> {
    if (this.loadedPolyfills.has('webAudio')) return;

    try {
      // Add Web Audio API polyfill for older browsers
      if (!window.AudioContext && (window as any).webkitAudioContext) {
        (window as any).AudioContext = (window as any).webkitAudioContext;
      }
      this.loadedPolyfills.add('webAudio');
    } catch (error) {
      console.warn('Failed to setup Web Audio polyfill:', error);
    }
  }
}

// Global polyfill loader
export const polyfillLoader = new PolyfillLoader();
```

### Browser-Specific Optimizations

Handle browser-specific quirks and optimizations:

```typescript
// Browser compatibility manager
class BrowserCompatibilityManager {
  private browser = this.detectBrowser();
  private platform = this.detectPlatform();

  private detectBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('edg/')) return 'edge';
    if (userAgent.includes('chrome/')) return 'chrome';
    if (userAgent.includes('firefox/')) return 'firefox';
    if (userAgent.includes('safari/') && !userAgent.includes('chrome/')) return 'safari';
    if (userAgent.includes('opera/')) return 'opera';

    return 'unknown';
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('windows')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('linux')) return 'linux';

    return 'unknown';
  }

  getBrowser(): string {
    return this.browser;
  }

  getPlatform(): string {
    return this.platform;
  }

  // Audio context setup with browser compatibility
  createAudioContext(): AudioContext | null {
    try {
      let AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      const context = new AudioContextClass();

      // Handle Chrome's autoplay policy
      if (this.browser === 'chrome' && context.state === 'suspended') {
        // Will need user interaction to resume
        document.addEventListener('click', () => {
          if (context.state === 'suspended') {
            context.resume();
          }
        }, { once: true });
      }

      return context;
    } catch (error) {
      console.warn('Failed to create AudioContext:', error);
      return null;
    }
  }

  // Performance optimization based on browser
  getOptimalAnimationSettings(): AnimationSettings {
    const baseSettings = {
      frameRate: 60,
      quality: 'high',
      enableTransforms: true,
      enableFilters: true
    };

    // Safari optimizations
    if (this.browser === 'safari') {
      return {
        ...baseSettings,
        frameRate: 30, // Better battery life on iOS
        enableFilters: false // Performance issues with some CSS filters
      };
    }

    // Firefox optimizations
    if (this.browser === 'firefox') {
      return {
        ...baseSettings,
        enableTransforms: true, // Firefox has good transform support
      };
    }

    // Chrome optimizations
    if (this.browser === 'chrome') {
      return {
        ...baseSettings,
        // Chrome generally handles all features well
      };
    }

    // Mobile optimizations
    if (this.platform === 'android' || this.platform === 'ios') {
      return {
        ...baseSettings,
        frameRate: 30,
        quality: 'medium'
      };
    }

    return baseSettings;
  }

  // Storage fallback chain
  getOptimalStorage(): StorageInterface {
    // Try IndexedDB first (best for large data)
    if (featureDetector.hasFeature('indexedDB')) {
      return new IndexedDBStorage();
    }

    // Fall back to localStorage
    if (featureDetector.hasFeature('localStorage')) {
      return new LocalStorageAdapter();
    }

    // Final fallback to in-memory storage
    return new MemoryStorage();
  }

  // Touch handling optimization
  getOptimalTouchSettings(): TouchSettings {
    const baseSettings = {
      enableTouch: true,
      enableHover: true,
      touchThreshold: 10
    };

    // iOS-specific optimizations
    if (this.platform === 'ios') {
      return {
        ...baseSettings,
        enableHover: false, // iOS doesn't have true hover
        touchThreshold: 15 // Slightly larger threshold for fat fingers
      };
    }

    // Android optimizations
    if (this.platform === 'android') {
      return {
        ...baseSettings,
        touchThreshold: 12
      };
    }

    return baseSettings;
  }

  // CSS feature support
  getCSSFeatureSupport(): CSSFeatureSupport {
    return {
      containerQueries: featureDetector.hasFeature('containerQueries'),
      cssGrid: featureDetector.hasFeature('cssGrid'),
      flexbox: CSS.supports('display: flex'),
      transforms: CSS.supports('transform: translateX(0)'),
      transitions: CSS.supports('transition: opacity 1s'),
      animations: CSS.supports('animation: spin 1s'),
      filters: CSS.supports('filter: blur(5px)'),
      backdropFilter: CSS.supports('backdrop-filter: blur(5px)'),
      aspectRatio: CSS.supports('aspect-ratio: 1'),
      logicalProperties: CSS.supports('margin-inline-start: 0')
    };
  }

  // Viewport configuration
  setupViewport(): void {
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;

    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }

    // iOS-specific viewport settings
    if (this.platform === 'ios') {
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    } else {
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
    }
  }
}

// Global compatibility manager
export const browserCompatibility = new BrowserCompatibilityManager();

// Type definitions
interface AnimationSettings {
  frameRate: number;
  quality: 'low' | 'medium' | 'high';
  enableTransforms: boolean;
  enableFilters: boolean;
}

interface TouchSettings {
  enableTouch: boolean;
  enableHover: boolean;
  touchThreshold: number;
}

interface CSSFeatureSupport {
  containerQueries: boolean;
  cssGrid: boolean;
  flexbox: boolean;
  transforms: boolean;
  transitions: boolean;
  animations: boolean;
  filters: boolean;
  backdropFilter: boolean;
  aspectRatio: boolean;
  logicalProperties: boolean;
}

interface StorageInterface {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

## Performance and Battery Optimization

### Mobile Performance Strategies

Implement performance optimizations for mobile devices:

```typescript
// Mobile performance manager
class MobilePerformanceManager {
  private isLowPowerMode = false;
  private batteryLevel = 1;
  private performanceMode: 'high' | 'balanced' | 'battery' = 'balanced';

  constructor() {
    this.detectPowerMode();
    this.setupBatteryMonitoring();
    this.setupVisibilityHandling();
  }

  private async detectPowerMode(): Promise<void> {
    // Check for low power mode hints
    const connection = (navigator as any).connection;
    if (connection) {
      // Slow connection might indicate battery saving
      if (connection.saveData || connection.effectiveType === 'slow-2g') {
        this.isLowPowerMode = true;
        this.performanceMode = 'battery';
      }
    }

    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory < 4) {
      // Low memory device - use battery mode
      this.performanceMode = 'battery';
    }

    this.applyPerformanceMode();
  }

  private async setupBatteryMonitoring(): Promise<void> {
    try {
      const battery = await (navigator as any).getBattery?.();
      if (battery) {
        this.batteryLevel = battery.level;

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.adjustPerformanceBasedOnBattery();
        });

        battery.addEventListener('chargingchange', () => {
          this.adjustPerformanceBasedOnBattery();
        });
      }
    } catch (error) {
      // Battery API not supported
    }
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseExpensiveOperations();
      } else {
        this.resumeExpensiveOperations();
      }
    });

    // Handle page focus/blur
    window.addEventListener('blur', () => {
      this.pauseExpensiveOperations();
    });

    window.addEventListener('focus', () => {
      this.resumeExpensiveOperations();
    });
  }

  private adjustPerformanceBasedOnBattery(): void {
    if (this.batteryLevel < 0.2) { // Below 20%
      this.performanceMode = 'battery';
    } else if (this.batteryLevel < 0.5) { // Below 50%
      this.performanceMode = 'balanced';
    } else {
      this.performanceMode = 'high';
    }

    this.applyPerformanceMode();
  }

  private applyPerformanceMode(): void {
    const gameController = useGameControllerStore();

    switch (this.performanceMode) {
      case 'battery':
        gameController.updateSettings({
          gameLoopInterval: 5000, // 5 seconds instead of 1
          animationQuality: 'low',
          audioEnabled: false,
          backgroundProcessing: false,
          autoSave: false // Manual save only
        });
        break;

      case 'balanced':
        gameController.updateSettings({
          gameLoopInterval: 2000, // 2 seconds
          animationQuality: 'medium',
          audioEnabled: true,
          backgroundProcessing: true,
          autoSave: true
        });
        break;

      case 'high':
        gameController.updateSettings({
          gameLoopInterval: 1000, // 1 second
          animationQuality: 'high',
          audioEnabled: true,
          backgroundProcessing: true,
          autoSave: true
        });
        break;
    }
  }

  private pauseExpensiveOperations(): void {
    // Pause game loop
    const gameController = useGameControllerStore();
    gameController.pause('background');

    // Pause animations
    document.body.classList.add('pause-animations');

    // Reduce audio processing
    const audioManager = useAudioManager();
    audioManager.pause();
  }

  private resumeExpensiveOperations(): void {
    // Resume game loop
    const gameController = useGameControllerStore();
    gameController.resume('background');

    // Resume animations
    document.body.classList.remove('pause-animations');

    // Resume audio
    const audioManager = useAudioManager();
    audioManager.resume();
  }

  getPerformanceMode(): string {
    return this.performanceMode;
  }

  getBatteryLevel(): number {
    return this.batteryLevel;
  }

  isInLowPowerMode(): boolean {
    return this.isLowPowerMode;
  }

  // Manual performance mode override
  setPerformanceMode(mode: 'high' | 'balanced' | 'battery'): void {
    this.performanceMode = mode;
    this.applyPerformanceMode();
  }
}

// Global performance manager
export const mobilePerformance = new MobilePerformanceManager();

// Vue composable for performance management
export function usePerformanceOptimization() {
  const performanceMode = ref(mobilePerformance.getPerformanceMode());
  const batteryLevel = ref(mobilePerformance.getBatteryLevel());

  return {
    performanceMode: readonly(performanceMode),
    batteryLevel: readonly(batteryLevel),
    setPerformanceMode: mobilePerformance.setPerformanceMode.bind(mobilePerformance),
    isLowPowerMode: mobilePerformance.isInLowPowerMode.bind(mobilePerformance)
  };
}
```

This comprehensive mobile and cross-platform development guide ensures the guinea pig simulation delivers optimal performance and user experience across all devices while maintaining compatibility with various browsers and platforms.