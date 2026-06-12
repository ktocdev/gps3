<template>
  <div class="model-viewer-debug debug-view__constrained">
    <h2>3D Model Viewer</h2>

    <div class="panel panel--full-width">
      <div class="panel__content">
        <div class="model-viewer-debug__canvas-wrapper">
          <!-- Model Selection Panel (overlay on right side) -->
          <SidePanel3D
            :is-open="showModelPanel"
            side="right"
            color="violet"
            title="Models"
            icon="🎨"
            @toggle="showModelPanel = !showModelPanel"
          >
            <Details
              v-for="category in modelRegistry"
              :key="category.id"
              :summary="`${category.icon} ${category.label}`"
              :default-open="category.id === 'characters'"
            >
              <div class="model-viewer-debug__model-list">
                <button
                  v-for="model in category.models"
                  :key="model.id"
                  :class="[
                    'model-viewer-debug__model-item',
                    { 'model-viewer-debug__model-item--selected': selectedModelId === model.id }
                  ]"
                  @click="selectModel(model.id)"
                >
                  {{ model.name }}
                </button>
              </div>
            </Details>
          </SidePanel3D>

          <!-- Model Info Overlay -->
          <div class="model-viewer-debug__info-overlay">
            <h3>{{ currentModelInfo?.name || 'Select a Model' }}</h3>
            <p v-if="currentModelInfo?.description">{{ currentModelInfo.description }}</p>
          </div>

          <!-- Canvas -->
          <canvas ref="canvasRef" class="model-viewer-debug__canvas"></canvas>

          <!-- Controls Help -->
          <div class="model-viewer-debug__controls-help">
            <span>Drag to rotate</span>
            <span>Shift+Drag to pan</span>
            <span>Scroll to zoom</span>
            <span>R to reset</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import Details from '../../basic/Details.vue'
import SidePanel3D from '../../game/SidePanel3D.vue'

// Model factories
import { createGuineaPigModel, updateGuineaPigAnimation } from '../../../composables/use3DGuineaPig'
import { createHandModel, setHandPose } from '../../../composables/3d-models/use3DHand'
import { createCucumberSlice, createCarrotStick } from '../../../composables/3d-models/food/vegetables'
import { createPelletPile } from '../../../composables/3d-models/food/pellets'
import { createLettucePile } from '../../../composables/3d-models/food/greens'
import { createHeldFoodBall } from '../../../composables/3d-models/food/held-food'
import { createHayPile } from '../../../composables/3d-models/food/hay'
import { createBowlModel } from '../../../composables/3d-models/containers/bowls'
import { createWaterBottleModel } from '../../../composables/3d-models/containers/water-bottles'
import { createHayRackModel } from '../../../composables/3d-models/containers/hay-racks'
import { createShelterModel } from '../../../composables/3d-models/shelters/igloos'
import { createWoodenTunnelModel } from '../../../composables/3d-models/shelters/tunnels'
import { createToyModel } from '../../../composables/3d-models/toys/chew-toys'

// Types
interface ModelDefinition {
  id: string
  name: string
  description?: string
  factory: () => THREE.Group
}

interface ModelCategory {
  id: string
  label: string
  icon: string
  models: ModelDefinition[]
}

// Viewer configuration
const VIEWER_CONFIG = {
  FOV: 45,
  NEAR: 0.1,
  FAR: 100,
  INITIAL_POSITION: { x: 0, y: 8, z: 12 },
  HEIGHT_MIN: 2,
  HEIGHT_MAX: 20,
  GROUND_RADIUS: 8,
  MOUSE_ROTATION_SPEED: 0.01,
  MOUSE_PAN_SPEED: 0.05,
  WHEEL_ZOOM_SPEED: 0.01,
  PINCH_ZOOM_SPEED: 0.05,
}

// Model registry
const modelRegistry: ModelCategory[] = [
  {
    id: 'characters',
    label: 'Characters',
    icon: '🐹',
    models: [
      {
        id: 'guinea-pig',
        name: 'Guinea Pig',
        description: 'Animated guinea pig with idle animation',
        factory: () => createGuineaPigModel()
      },
      {
        id: 'hand',
        name: 'Hand (Open)',
        description: 'Simpsons-style yellow interaction hand',
        factory: () => createHandModel()
      },
      {
        id: 'hand-gripping',
        name: 'Hand (Gripping)',
        description: 'Hand in gripping pose for holding food',
        factory: () => {
          const hand = createHandModel()
          setHandPose(hand, 'gripping')
          return hand
        }
      },
      {
        id: 'hand-holding-food',
        name: 'Hand Holding Food',
        description: 'Gripping hand with food ball (carrot color)',
        factory: () => {
          const group = new THREE.Group()

          // Create hand with gripping pose
          const hand = createHandModel()
          setHandPose(hand, 'gripping')
          group.add(hand)

          // Add food ball and position for this hand orientation (rotation.z = PI)
          const foodBall = createHeldFoodBall('#FF6B00') // Carrot orange
          foodBall.position.set(1.4, 1, 0.3)
          group.add(foodBall)

          return group
        }
      }
    ]
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🥬',
    models: [
      {
        id: 'carrot',
        name: 'Carrot Stick',
        description: 'Thick julienne orange carrot',
        factory: () => createCarrotStick()
      },
      {
        id: 'cucumber',
        name: 'Cucumber Slice',
        description: 'Half-circle vegetable slice',
        factory: () => createCucumberSlice()
      },
      {
        id: 'hay',
        name: 'Hay Pile',
        description: 'Procedurally generated hay strands',
        factory: () => createHayPile(2, 12345)
      },
      {
        id: 'pellets',
        name: 'Pellet Pile',
        description: 'Golden beige food pellets (15 count)',
        factory: () => createPelletPile(15, 54321)
      },
      {
        id: 'lettuce',
        name: 'Lettuce Pile',
        description: 'Green leaf lettuce pieces (12 count)',
        factory: () => createLettucePile(12, 98765)
      }
    ]
  },
  {
    id: 'containers',
    label: 'Containers',
    icon: '🥣',
    models: [
      {
        id: 'bowl',
        name: 'Food Bowl',
        description: 'Blue ceramic feeding bowl',
        factory: () => createBowlModel('debug-bowl')
      },
      {
        id: 'water-bottle',
        name: 'Water Bottle',
        description: 'Wall-mounted water bottle with bubbles',
        factory: () => createWaterBottleModel()
      },
      {
        id: 'hay-rack',
        name: 'Hay Rack',
        description: 'Cylindrical wooden hay rack',
        factory: () => createHayRackModel('debug-rack')
      }
    ]
  },
  {
    id: 'shelters',
    label: 'Shelters',
    icon: '🏠',
    models: [
      {
        id: 'igloo',
        name: 'Igloo Shelter',
        description: 'Pink transparent dome hideout',
        factory: () => createShelterModel()
      },
      {
        id: 'tunnel',
        name: 'Wooden Tunnel',
        description: 'Archway tunnel passage',
        factory: () => createWoodenTunnelModel()
      }
    ]
  },
  {
    id: 'toys',
    label: 'Toys',
    icon: '⚾',
    models: [
      {
        id: 'ball',
        name: 'Twig Ball',
        description: 'Woven twig ball toy',
        factory: () => createToyModel('ball', 'debug-ball')
      },
      {
        id: 'stick',
        name: 'Chew Stick',
        description: 'Wooden chew stick',
        factory: () => createToyModel('stick', 'debug-stick')
      }
    ]
  }
]

// Reactive state
const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedModelId = ref<string>('guinea-pig')
const showModelPanel = ref(true)

// THREE.js objects (non-reactive)
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let worldGroup: THREE.Group | null = null
let currentModel: THREE.Group | null = null
let animationFrameId: number | null = null
let cleanupControls: (() => void) | null = null

// Computed
const currentModelInfo = computed(() => {
  for (const category of modelRegistry) {
    const model = category.models.find(m => m.id === selectedModelId.value)
    if (model) return model
  }
  return null
})

/**
 * Initialize THREE.js scene
 */
function initScene() {
  if (!canvasRef.value) return

  // Create scene with sky blue background
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)

  // Setup camera
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(
    VIEWER_CONFIG.FOV,
    aspect,
    VIEWER_CONFIG.NEAR,
    VIEWER_CONFIG.FAR
  )
  camera.position.set(
    VIEWER_CONFIG.INITIAL_POSITION.x,
    VIEWER_CONFIG.INITIAL_POSITION.y,
    VIEWER_CONFIG.INITIAL_POSITION.z
  )
  camera.lookAt(0, 2, 0)

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  })
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // World group for rotation
  worldGroup = new THREE.Group()
  scene.add(worldGroup)

  // Add lighting
  setupLighting()

  // Add ground platform
  setupGround()

  // Initialize camera controls
  cleanupControls = setupCameraControls()

  // Load default model
  loadModel(selectedModelId.value)

  // Start render loop
  animate()
}

/**
 * Setup scene lighting
 */
function setupLighting() {
  if (!scene) return

  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambient)

  // Main directional light (sun)
  const directional = new THREE.DirectionalLight(0xffffff, 0.8)
  directional.position.set(10, 20, 10)
  directional.castShadow = true
  directional.shadow.mapSize.width = 1024
  directional.shadow.mapSize.height = 1024
  directional.shadow.camera.near = 0.5
  directional.shadow.camera.far = 50
  directional.shadow.camera.left = -15
  directional.shadow.camera.right = 15
  directional.shadow.camera.top = 15
  directional.shadow.camera.bottom = -15
  scene.add(directional)

  // Back fill light
  const backLight = new THREE.DirectionalLight(0xccccff, 0.4)
  backLight.position.set(-5, 10, -10)
  scene.add(backLight)
}

/**
 * Setup ground platform
 */
function setupGround() {
  if (!worldGroup) return

  // Circular platform
  const groundGeo = new THREE.CircleGeometry(VIEWER_CONFIG.GROUND_RADIUS, 64)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x8FBC8F,
    roughness: 0.8,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  worldGroup.add(ground)

  // Grid helper for scale reference
  const gridHelper = new THREE.GridHelper(16, 16, 0x666666, 0x444444)
  gridHelper.position.y = 0.01
  worldGroup.add(gridHelper)
}

/**
 * Setup camera controls
 */
function setupCameraControls(): () => void {
  const canvas = canvasRef.value
  if (!canvas) return () => {}

  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }

  // Touch gesture state
  let isTwoFingerGesture = false
  let initialPinchDistance = 0
  let previousTouchCenter = { x: 0, y: 0 }

  function handleMouseDown(e: MouseEvent) {
    isDragging = true
    previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !camera || !worldGroup) return

    const deltaX = e.offsetX - previousMousePosition.x
    const deltaY = e.offsetY - previousMousePosition.y

    if (e.shiftKey) {
      // Shift+drag = pan camera
      camera.position.x -= deltaX * VIEWER_CONFIG.MOUSE_PAN_SPEED
      camera.position.z -= deltaY * VIEWER_CONFIG.MOUSE_PAN_SPEED
    } else {
      // Regular drag = rotate world
      worldGroup.rotation.y += deltaX * VIEWER_CONFIG.MOUSE_ROTATION_SPEED
    }

    previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseUp() {
    isDragging = false
  }

  function handleWheel(e: WheelEvent) {
    if (!camera) return
    e.preventDefault()
    camera.position.y += e.deltaY * VIEWER_CONFIG.WHEEL_ZOOM_SPEED
    camera.position.y = Math.max(
      VIEWER_CONFIG.HEIGHT_MIN,
      Math.min(VIEWER_CONFIG.HEIGHT_MAX, camera.position.y)
    )
    camera.lookAt(0, 2, 0)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!camera || !worldGroup) return

    // R to reset camera
    if (e.key.toLowerCase() === 'r') {
      camera.position.set(
        VIEWER_CONFIG.INITIAL_POSITION.x,
        VIEWER_CONFIG.INITIAL_POSITION.y,
        VIEWER_CONFIG.INITIAL_POSITION.z
      )
      worldGroup.rotation.y = 0
      camera.lookAt(0, 2, 0)
    }
  }

  // Touch helper functions
  function getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function getTouchCenter(touches: TouchList): { x: number; y: number } {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      // Two fingers: pinch-to-zoom + drag-to-pan
      isTwoFingerGesture = true
      isDragging = false
      initialPinchDistance = getTouchDistance(e.touches)
      previousTouchCenter = getTouchCenter(e.touches)
    } else if (e.touches.length === 1) {
      // Single finger: rotate
      isDragging = true
      isTwoFingerGesture = false
      previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!camera || !worldGroup) return

    if (e.touches.length === 2 && isTwoFingerGesture) {
      // Two-finger gesture: pinch-to-zoom + drag-to-pan
      const currentDistance = getTouchDistance(e.touches)
      const currentCenter = getTouchCenter(e.touches)

      // Pinch-to-zoom
      const deltaDistance = currentDistance - initialPinchDistance
      camera.position.y -= deltaDistance * VIEWER_CONFIG.PINCH_ZOOM_SPEED
      camera.position.y = Math.max(
        VIEWER_CONFIG.HEIGHT_MIN,
        Math.min(VIEWER_CONFIG.HEIGHT_MAX, camera.position.y)
      )

      // Drag-to-pan
      const deltaCenter = {
        x: currentCenter.x - previousTouchCenter.x,
        y: currentCenter.y - previousTouchCenter.y,
      }
      camera.position.x -= deltaCenter.x * VIEWER_CONFIG.MOUSE_PAN_SPEED
      camera.position.z -= deltaCenter.y * VIEWER_CONFIG.MOUSE_PAN_SPEED

      // Update camera look-at
      camera.lookAt(0, 2, 0)

      // Update previous values
      initialPinchDistance = currentDistance
      previousTouchCenter = currentCenter
    } else if (e.touches.length === 1 && isDragging) {
      // Single finger rotate
      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY

      worldGroup.rotation.y +=
        (currentX - previousMousePosition.x) * VIEWER_CONFIG.MOUSE_ROTATION_SPEED

      previousMousePosition = { x: currentX, y: currentY }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      // All fingers lifted
      isDragging = false
      isTwoFingerGesture = false
      initialPinchDistance = 0
    } else if (e.touches.length === 1) {
      // One finger remaining - switch from two-finger gesture to rotate
      isTwoFingerGesture = false
      isDragging = true
      previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
  }

  // Add event listeners
  canvas.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  canvas.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('keydown', handleKeyDown)

  // Touch event listeners
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true })

  // Return cleanup function
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    canvas.removeEventListener('wheel', handleWheel)
    document.removeEventListener('keydown', handleKeyDown)
    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
  }
}

/**
 * Dispose THREE.js object and its children
 */
function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (child.material instanceof THREE.Material) {
        child.material.dispose()
      } else if (Array.isArray(child.material)) {
        child.material.forEach(mat => mat.dispose())
      }
    }
  })
}

/**
 * Load a model by ID
 */
function loadModel(modelId: string) {
  if (!worldGroup) return

  // Remove current model
  if (currentModel) {
    disposeObject3D(currentModel)
    worldGroup.remove(currentModel)
    currentModel = null
  }

  // Find model definition
  let modelDef: ModelDefinition | null = null
  for (const category of modelRegistry) {
    const found = category.models.find(m => m.id === modelId)
    if (found) {
      modelDef = found
      break
    }
  }

  if (!modelDef) {
    console.warn(`Model not found: ${modelId}`)
    return
  }

  try {
    // Create new model
    currentModel = modelDef.factory()

    // Adjust position based on model type (some models have different origins)
    if (modelId === 'hand-gripping' || modelId === 'hand-holding-food') {
      // Gripping hand rotated so finger curves point toward floor
      currentModel.position.set(0, 3, 0)
      currentModel.rotation.z = Math.PI
    } else if (modelId.startsWith('hand')) {
      // Hand models need to be raised so they don't sink into floor
      currentModel.position.set(0, 2, 0)
    } else if (modelId === 'ball') {
      // Twig ball needs to be raised to sit on floor
      currentModel.position.set(0, 2, 0)
    } else if (modelId === 'stick') {
      // Chew stick needs to be raised
      currentModel.position.set(0, 1, 0)
    } else if (modelId === 'cucumber') {
      // Cucumber needs to be raised slightly
      currentModel.position.set(0, 0.5, 0)
    } else if (modelId === 'carrot') {
      // Carrot stick raised to sit on floor (offset by 0.6 for bowl alignment)
      currentModel.position.set(0, 0.8, 0)
    } else if (modelId === 'pellets') {
      // Pellet pile raised to sit on floor (Y offset matches carrot)
      currentModel.position.set(0, 0.8, 0)
    } else if (modelId === 'lettuce') {
      // Lettuce pile raised to sit on floor
      currentModel.position.set(0, 0.7, 0)
    } else {
      currentModel.position.set(0, 0, 0)
    }

    worldGroup.add(currentModel)
    selectedModelId.value = modelId
  } catch (error) {
    console.error(`Error loading model ${modelId}:`, error)
  }
}

/**
 * Select a model (called from UI)
 */
function selectModel(modelId: string) {
  loadModel(modelId)
}

/**
 * Animation loop
 */
let lastTime = 0
function animate(time: number = 0) {
  if (!renderer || !scene || !camera) return

  animationFrameId = requestAnimationFrame(animate)

  const deltaTime = (time - lastTime) / 1000
  lastTime = time

  // Update guinea pig animation if selected
  if (currentModel && selectedModelId.value === 'guinea-pig') {
    updateGuineaPigAnimation(currentModel, false, deltaTime, false)
  }

  // Update camera look-at
  camera.lookAt(0, 2, 0)

  renderer.render(scene, camera)
}

/**
 * Handle window resize
 */
function handleResize() {
  if (!canvasRef.value || !camera || !renderer) return

  const width = canvasRef.value.clientWidth
  const height = canvasRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Lifecycle
onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // Stop animation loop
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  // Cleanup camera controls
  if (cleanupControls) {
    cleanupControls()
  }

  // Dispose current model
  if (currentModel) {
    disposeObject3D(currentModel)
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose()
  }

  window.removeEventListener('resize', handleResize)
})
</script>

<style>
/* Model Viewer Debug Page Styles */
.model-viewer-debug {
  padding: 0;
}

.model-viewer-debug h2 {
  margin-block-end: var(--space-4);
  padding-inline: var(--space-4);
  padding-block-start: var(--space-4);
  color: var(--color-text-primary);
}

/* Mobile-first: Remove panel padding on mobile */
.model-viewer-debug .panel--full-width {
  padding: 0;
}

.model-viewer-debug .panel__content {
  padding: 0;
}

@media (min-width: 768px) {
  .model-viewer-debug {
    padding: var(--space-4);
  }

  .model-viewer-debug h2 {
    padding-inline: 0;
    padding-block-start: 0;
  }

  .model-viewer-debug .panel--full-width {
    padding: var(--space-4);
  }

  .model-viewer-debug .panel__content {
    padding: var(--space-4);
  }
}

/* Canvas Wrapper - contains canvas and overlay panels */
.model-viewer-debug__canvas-wrapper {
  position: relative;
  block-size: 70vh;
  overflow: hidden;
  border-radius: 0;
}

@media (min-width: 768px) {
  .model-viewer-debug__canvas-wrapper {
    block-size: 600px;
    border-radius: var(--radius-md);
  }
}

/* Canvas fills wrapper */
.model-viewer-debug__canvas {
  inline-size: 100%;
  block-size: 100%;
  display: block;
  /* Disable tap highlight on mobile */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  /* Prevent touch scrolling on mobile while allowing canvas interactions */
  touch-action: none;
}

/* Model Info Overlay (top-left) */
.model-viewer-debug__info-overlay {
  position: absolute;
  inset-block-start: var(--space-3);
  inset-inline-start: var(--space-3);
  z-index: 10;
  padding: var(--space-2) var(--space-3);
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-md);
  color: white;
  pointer-events: none;
}

.model-viewer-debug__info-overlay h3 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.model-viewer-debug__info-overlay p {
  margin: 0;
  margin-block-start: var(--space-1);
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

/* Controls Help (bottom) */
.model-viewer-debug__controls-help {
  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: rgba(0, 0, 0, 0.5);
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
}

/* Model List in SidePanel */
.model-viewer-debug__model-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) 0;
}

.model-viewer-debug__model-item {
  display: block;
  inline-size: 100%;
  padding: var(--space-2) var(--space-3);
  text-align: start;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.model-viewer-debug__model-item:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

.model-viewer-debug__model-item--selected {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.model-viewer-debug__model-item--selected:hover {
  background: var(--color-primary-bg);
}
</style>
