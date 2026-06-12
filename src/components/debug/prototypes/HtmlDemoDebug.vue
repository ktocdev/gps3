<template>
  <div class="html-demo-debug debug-view__constrained">
    <h2>Original HTML Demo</h2>

    <!-- Demo Panel -->
    <div class="panel panel--full-width">
      <div class="panel__header">
        <h3>Guinea Pig Simulator - HTML/Three.js Demo</h3>
        <p class="panel__subtitle">Original free movement implementation with physics</p>
      </div>
      <div class="panel__content">
        <div class="html-demo-debug__iframe-container">
          <iframe
            ref="iframeRef"
            :src="demoPath"
            class="html-demo-debug__iframe"
            title="Guinea Pig Simulator HTML Demo"
            @load="handleIframeLoad"
          ></iframe>
        </div>

        <div v-if="!iframeLoaded" class="html-demo-debug__loading">
          Loading demo...
        </div>

        <div v-if="loadError" class="html-demo-debug__error">
          Failed to load demo. The file may not be accessible.
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="panel">
      <div class="panel__header">
        <h3>About the Original Demo</h3>
      </div>
      <div class="panel__content">
        <p>
          This is the original HTML/Three.js demo that demonstrates:
        </p>
        <ul>
          <li><strong>Free Movement:</strong> Guinea pigs move smoothly in any direction</li>
          <li><strong>Click-to-Move:</strong> Click anywhere to navigate</li>
          <li><strong>Physics:</strong> Balls can be pushed, guinea pigs have momentum</li>
          <li><strong>Collision Detection:</strong> Radius-based with invisible spheres</li>
          <li><strong>Natural Shelter Entry:</strong> Enter igloos through openings</li>
          <li><strong>Smooth Animation:</strong> Walking animation and rotation</li>
        </ul>
        <p>
          <strong>Controls:</strong>
        </p>
        <ul>
          <li>Click on the ground to move guinea pig</li>
          <li>Click and drag to rotate camera</li>
          <li>Scroll to zoom in/out</li>
        </ul>
        <p>
          <strong>File Location:</strong> <code>src/guinea-pig-sim-demo-backup.html</code>
        </p>
      </div>
    </div>

    <!-- Comparison Panel -->
    <div class="panel">
      <div class="panel__header">
        <h3>Comparison with Current System</h3>
      </div>
      <div class="panel__content">
        <table class="html-demo-debug__comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>HTML Demo</th>
              <th>Current Grid System</th>
              <th>New 2D Prototype</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Movement Type</td>
              <td class="success">Continuous</td>
              <td class="warning">Grid-based</td>
              <td class="success">Continuous</td>
            </tr>
            <tr>
              <td>Collision</td>
              <td class="success">Radius-based</td>
              <td class="warning">Rectangle cells</td>
              <td class="success">Radius-based</td>
            </tr>
            <tr>
              <td>Physics</td>
              <td class="success">Momentum, pushing</td>
              <td class="danger">None</td>
              <td class="info">Basic (expandable)</td>
            </tr>
            <tr>
              <td>Shelter Entry</td>
              <td class="success">Natural gaps</td>
              <td class="warning">Cell-specific</td>
              <td class="info">Gap-based (WIP)</td>
            </tr>
            <tr>
              <td>View Type</td>
              <td>3D Only</td>
              <td>2D & 3D</td>
              <td>2D (portable to 3D)</td>
            </tr>
            <tr>
              <td>Performance</td>
              <td class="success">Good</td>
              <td class="success">Excellent</td>
              <td class="success">Good</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Iframe state
const iframeRef = ref<HTMLIFrameElement | null>(null)
const iframeLoaded = ref(false)
const loadError = ref(false)

// Compute demo path - relative to the app's base URL
const demoPath = computed(() => {
  // The HTML file is in src/ which gets served by Vite dev server
  return '/gps2/src/guinea-pig-sim-demo-backup.html'
})

/**
 * Handle iframe load event
 */
function handleIframeLoad() {
  iframeLoaded.value = true

  // Check if iframe actually loaded content
  try {
    const iframe = iframeRef.value
    if (iframe && iframe.contentWindow) {
      // Try to access the document to verify it loaded
      const doc = iframe.contentDocument || iframe.contentWindow.document
      if (!doc || doc.body.children.length === 0) {
        loadError.value = true
      }
    }
  } catch (e) {
    // Cross-origin error or other access issue
    console.warn('Could not access iframe content:', e)
    // Not necessarily an error - could be cross-origin restriction
  }
}
</script>

<style>
/* HTML Demo Debug Styles */
.html-demo-debug {
  padding: var(--space-4);
}

.html-demo-debug h2 {
  margin-block-end: var(--space-4);
  color: var(--color-text-primary);
}

/* Iframe Container */
.html-demo-debug__iframe-container {
  position: relative;
  width: 100%;
  height: 800px;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.html-demo-debug__iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Loading State */
.html-demo-debug__loading {
  margin-block-start: var(--space-4);
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Error State */
.html-demo-debug__error {
  margin-block-start: var(--space-4);
  padding: var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  text-align: center;
}

/* Comparison Table */
.html-demo-debug__comparison-table {
  width: 100%;
  border-collapse: collapse;
  margin-block-start: var(--space-2);
}

.html-demo-debug__comparison-table th,
.html-demo-debug__comparison-table td {
  padding: var(--space-2) var(--space-3);
  text-align: left;
  border: 1px solid var(--color-border-light);
}

.html-demo-debug__comparison-table th {
  background: var(--color-bg-tertiary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.html-demo-debug__comparison-table td {
  font-size: var(--font-size-sm);
}

/* Status colors for comparison cells */
.html-demo-debug__comparison-table td.success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.html-demo-debug__comparison-table td.warning {
  background: rgba(250, 204, 21, 0.1);
  color: var(--color-warning);
}

.html-demo-debug__comparison-table td.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.html-demo-debug__comparison-table td.info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

/* Panel Styles */
.panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-block-end: var(--space-4);
}

.panel__header {
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-tertiary);
  border-block-end: 1px solid var(--color-border-light);
}

.panel__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.panel__subtitle {
  margin: 0;
  margin-block-start: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.panel__content {
  padding: var(--space-4);
}

.panel--full-width {
  grid-column: 1 / -1;
}

/* Code styling */
code {
  background: var(--color-bg-tertiary);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

/* List styling */
ul {
  margin-block: var(--space-2);
  padding-inline-start: var(--space-5);
}

li {
  margin-block-end: var(--space-1);
  line-height: var(--line-height-relaxed);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .html-demo-debug__iframe-container {
    background: var(--color-bg-primary);
  }

  code {
    background: var(--color-bg-primary);
  }
}
</style>