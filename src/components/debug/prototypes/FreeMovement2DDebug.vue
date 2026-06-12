<template>
  <div class="free-movement-2d-debug debug-view__constrained">
    <h2>2D Free Movement Prototype</h2>

    <!-- Main Canvas Panel -->
    <div class="panel panel--full-width">
      <div class="panel__header">
        <h3>Free Movement Habitat (800x600px)</h3>
        <p class="panel__subtitle">Click anywhere to move guinea pig</p>
      </div>
      <div class="panel__content">
        <div class="free-movement-2d-debug__canvas-container">
          <canvas
            ref="canvasRef"
            width="800"
            height="600"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMouseMove"
            class="free-movement-2d-debug__canvas"
          ></canvas>

          <!-- Overlay info -->
          <div class="free-movement-2d-debug__overlay-info">
            <div v-if="mousePosition">
              Mouse: ({{ mousePosition.x.toFixed(0) }}, {{ mousePosition.y.toFixed(0) }})
            </div>
            <div v-if="guineaPigPosition">
              Guinea Pig: ({{ guineaPigPosition.x.toFixed(1) }}, {{ guineaPigPosition.y.toFixed(1) }})
            </div>
            <div v-if="velocity">
              Velocity: ({{ velocity.x.toFixed(2) }}, {{ velocity.y.toFixed(2) }})
            </div>
            <div>
              FPS: {{ fps }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Panel -->
    <div class="habitat-debug__conditions-row">
      <!-- Movement Settings -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Movement Settings</h3>
        </div>
        <div class="panel__content">
          <SliderField
            v-model="movementSpeed"
            label="Speed"
            :min="250"
            :max="750"
            :step="10"
            :show-value="true"
            suffix=" px/s"
            @update:model-value="updateMovementSpeed"
          />

          <SliderField
            v-model="rotationSpeed"
            label="Rotation Speed"
            :min="1"
            :max="10"
            :step="0.5"
            :show-value="true"
            suffix=" rad/s"
            @update:model-value="updateRotationSpeed"
          />

          <SliderField
            v-model="friction"
            label="Friction"
            :min="0.8"
            :max="0.99"
            :step="0.01"
            :show-value="true"
            @update:model-value="updateFriction"
          />
        </div>
      </div>

      <!-- Debug Options -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Debug Options</h3>
        </div>
        <div class="panel__content">
          <CheckboxField
            v-model="showGrid"
            label="Show Grid"
          />

          <CheckboxField
            v-model="showPath"
            label="Show Path"
          />

          <CheckboxField
            v-model="showCollisionCircles"
            label="Show Collision Circles"
          />

          <CheckboxField
            v-model="showVelocityVector"
            label="Show Velocity Vector"
          />

          <Button
            @click="resetPosition"
            variant="secondary"
            size="sm"
            class="mt-4"
          >
            Reset Position
          </Button>
        </div>
      </div>

      <!-- Items & Obstacles -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Items & Obstacles</h3>
        </div>
        <div class="panel__content">
          <div class="button-group">
            <Button
              @click="addBowl"
              variant="primary"
              size="sm"
            >
              🥣 Add Bowl
            </Button>
            <Button
              @click="addIgloo"
              variant="secondary"
              size="sm"
            >
              🏠 Add Igloo
            </Button>
          </div>
          <div class="button-group mt-4">
            <Button
              @click="clearItems"
              variant="danger"
              size="sm"
            >
              🗑️ Clear All Items
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="panel">
      <div class="panel__header">
        <h3>About This Prototype</h3>
      </div>
      <div class="panel__content">
        <p>
          This prototype demonstrates continuous free movement instead of grid-based movement.
          Guinea pigs can move smoothly in any direction with physics-based motion.
        </p>
        <ul>
          <li>Click anywhere to move the guinea pig</li>
          <li>Movement uses velocity and acceleration</li>
          <li>Collision detection uses circles instead of rectangles</li>
          <li>Items can potentially be pushed (future feature)</li>
        </ul>
        <p>
          <strong>Goal:</strong> Test if free movement feels better than grid-based movement
          and can solve the architectural mismatch between 2D and 3D views.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Button from '../../basic/Button.vue'
import SliderField from '../../basic/SliderField.vue'
import CheckboxField from '../../basic/CheckboxField.vue'
import { useFreeMovement2D } from '../../../composables/prototypes/useFreeMovement2D'

// Canvas reference
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Movement settings
const movementSpeed = ref(500) // pixels per second
const rotationSpeed = ref(5) // radians per second
const friction = ref(0.95)

// Debug options
const showGrid = ref(true)
const showPath = ref(true)
const showCollisionCircles = ref(false)
const showVelocityVector = ref(false)

// Position tracking
const mousePosition = ref<{ x: number; y: number } | null>(null)
const guineaPigPosition = ref<{ x: number; y: number }>({ x: 400, y: 300 })
const velocity = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const fps = ref(0)

// Animation frame
let animationFrameId: number | null = null
let lastTime = 0
let frameCount = 0
let fpsTime = 0

// Free movement composable
let freeMovement: ReturnType<typeof useFreeMovement2D> | null = null

/**
 * Update movement speed
 */
function updateMovementSpeed(value: number) {
  if (freeMovement) {
    freeMovement.updateSettings({ speed: value })
  }
}

/**
 * Update rotation speed
 */
function updateRotationSpeed(value: number) {
  if (freeMovement) {
    freeMovement.updateSettings({ rotationSpeed: value })
  }
}

/**
 * Update friction
 */
function updateFriction(value: number) {
  if (freeMovement) {
    freeMovement.updateSettings({ friction: value })
  }
}

/**
 * Handle canvas click - move guinea pig to clicked position
 */
function handleCanvasClick(event: MouseEvent) {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Set target position for movement
  if (freeMovement) {
    freeMovement.setTarget({ x, y })
  }
}

/**
 * Handle canvas mouse move - track mouse position
 */
function handleCanvasMouseMove(event: MouseEvent) {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  mousePosition.value = { x, y }
}

/**
 * Reset guinea pig position to center
 */
function resetPosition() {
  guineaPigPosition.value = { x: 400, y: 300 }
  velocity.value = { x: 0, y: 0 }
  if (freeMovement) {
    freeMovement.resetPosition()
  }
}

/**
 * Add a bowl obstacle
 */
function addBowl() {
  if (freeMovement) {
    freeMovement.addItem({
      type: 'bowl',
      position: { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 },
      radius: 20,
      moveable: true
    })
  }
}

/**
 * Add an igloo obstacle
 */
function addIgloo() {
  if (freeMovement) {
    freeMovement.addItem({
      type: 'igloo',
      position: { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      radius: 60,
      moveable: false,
      hasEntrance: true
    })
  }
}

/**
 * Clear all items
 */
function clearItems() {
  if (freeMovement) {
    freeMovement.clearItems()
  }
}

/**
 * Animation loop
 */
function animate(currentTime: number) {
  if (!canvasRef.value) return

  // Calculate delta time
  const deltaTime = (currentTime - lastTime) / 1000 // Convert to seconds
  lastTime = currentTime

  // Calculate FPS
  frameCount++
  if (currentTime - fpsTime >= 1000) {
    fps.value = frameCount
    frameCount = 0
    fpsTime = currentTime
  }

  // Update movement
  if (freeMovement) {
    freeMovement.update(deltaTime)

    // Get updated position and velocity
    const state = freeMovement.getState()
    guineaPigPosition.value = state.position
    velocity.value = state.velocity

    // Render
    freeMovement.render(canvasRef.value, {
      showGrid: showGrid.value,
      showPath: showPath.value,
      showCollisionCircles: showCollisionCircles.value,
      showVelocityVector: showVelocityVector.value
    })
  }

  // Continue animation
  animationFrameId = requestAnimationFrame(animate)
}

// Lifecycle
onMounted(() => {
  if (canvasRef.value) {
    // Initialize free movement system
    freeMovement = useFreeMovement2D({
      canvas: canvasRef.value,
      speed: movementSpeed.value,
      rotationSpeed: rotationSpeed.value,
      friction: friction.value
    })

    // Start animation loop
    lastTime = performance.now()
    fpsTime = lastTime
    animationFrameId = requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  // Stop animation
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  // Cleanup
  if (freeMovement) {
    freeMovement.cleanup()
  }
})
</script>

<style>
/* Free Movement 2D Debug Styles */
.free-movement-2d-debug {
  padding: var(--space-4);
}

.free-movement-2d-debug h2 {
  margin-block-end: var(--space-4);
  color: var(--color-text-primary);
}

/* Canvas Container */
.free-movement-2d-debug__canvas-container {
  position: relative;
  display: inline-block;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.free-movement-2d-debug__canvas {
  display: block;
  cursor: crosshair;
  image-rendering: crisp-edges; /* For pixel-perfect rendering */
}

/* Overlay Info */
.free-movement-2d-debug__overlay-info {
  position: absolute;
  inset-block-start: var(--space-2);
  inset-inline-start: var(--space-2);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  line-height: 1.5;
  pointer-events: none;
  z-index: 10;
}

/* Conditions Row */
.habitat-debug__conditions-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
  margin-block-start: var(--space-4);
}

/* Panel Styles */
.panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
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

.panel--compact .panel__content {
  padding: var(--space-3);
}

.panel--full-width {
  grid-column: 1 / -1;
}

/* Utility Classes */
.mt-4 {
  margin-block-start: var(--space-4);
}

.mb-2 {
  margin-block-end: var(--space-2);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .free-movement-2d-debug__canvas-container {
    background: var(--color-bg-primary);
  }

  .free-movement-2d-debug__overlay-info {
    background: rgba(0, 0, 0, 0.9);
  }
}
</style>