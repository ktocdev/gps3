import * as THREE from 'three'
import { GRID_CONFIG } from '../../../constants/3d'

/**
 * Calculate water bottle rotation based on wall/corner position
 * Nozzle always points inward toward habitat center
 * - Corners: Use atan2 formula to angle toward center
 * - Edges: Use fixed rotations to point straight toward middle
 */
export function getWaterBottleRotation(gridX: number, gridY: number): number {
  const isLeftEdge = gridX === 0
  const isRightEdge = gridX === GRID_CONFIG.COLS - 1 // 13
  const isTopEdge = gridY === 0
  const isBottomEdge = gridY === GRID_CONFIG.ROWS - 1 // 9

  // Check if it's a corner (both horizontal and vertical edge)
  const isCorner = (isLeftEdge || isRightEdge) && (isTopEdge || isBottomEdge)

  if (isCorner) {
    // For corners, calculate angle toward center using atan2
    const worldX = (gridX - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
    const worldZ = (gridY - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
    const deltaX = 0 - worldX
    const deltaZ = 0 - worldZ
    return Math.atan2(-deltaZ, deltaX)
  }

  // For edges (non-corners), point straight toward middle
  if (isTopEdge) return -Math.PI / 2    // Point down toward middle
  if (isBottomEdge) return Math.PI / 2  // Point up toward middle
  if (isLeftEdge) return 0              // Point right toward middle
  if (isRightEdge) return Math.PI       // Point left toward middle

  // Default (shouldn't happen for water bottles on walls)
  return 0
}

// Water bottle constants
const WATER_FULL_HEIGHT = 3.2
const WATER_BASE_Y = 1.7 // Y position when water is at bottom of bottle

export function createWaterBottleModel(): THREE.Group {
  const group = new THREE.Group()

  // Bottle container (transparent light blue, scaled 2x)
  const bottleGeo = new THREE.CylinderGeometry(0.6, 0.6, 4.0, 32)
  const bottleMat = new THREE.MeshStandardMaterial({
    color: 0xE0F0FF,
    opacity: 0.3,
    transparent: true,
    roughness: 0.1,
    metalness: 0.0,
    depthWrite: false,
  })
  const bottle = new THREE.Mesh(bottleGeo, bottleMat)
  bottle.position.y = 3.5 // Bottle center (height 3.2 / 2 + bracket 0.5 + buffer)
  bottle.castShadow = true
  bottle.receiveShadow = false
  group.add(bottle)

  // Water inside (slightly smaller, with glow)
  const waterGeo = new THREE.CylinderGeometry(0.55, 0.55, WATER_FULL_HEIGHT, 32)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xC3E7FD,
    opacity: 0.8,
    transparent: true,
    roughness: 0.0,
    metalness: 0.0,
    emissive: 0x4da6ff,
    emissiveIntensity: 0.2,
  })
  const water = new THREE.Mesh(waterGeo, waterMat)
  water.position.y = 3.3 // Slightly lower than bottle
  group.add(water)

  // Store reference to water mesh for dynamic updates
  group.userData.waterMesh = water
  group.userData.waterFullHeight = WATER_FULL_HEIGHT
  group.userData.waterBaseY = WATER_BASE_Y

  // Green bracket at base
  const bracketGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 32)
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x32cd32,
    roughness: 0.5,
  })
  const bracket = new THREE.Mesh(bracketGeo, bracketMat)
  bracket.position.y = 1.25 // Half height of bracket (0.5 / 2) + base offset
  bracket.castShadow = true
  group.add(bracket)

  // Metal nozzle (horizontal)
  const nozzleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 16)
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 1.0,
  })
  const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
  nozzle.rotation.z = -Math.PI / 2 // Horizontal
  nozzle.position.set(1.1, 1.25, 0) // Aligned with bracket
  nozzle.castShadow = true
  group.add(nozzle)

  // Rotation will be set based on wall position (see use3DItems positioning logic)
  // Default rotation for reference (bottom-left corner)
  group.rotation.y = -Math.PI / 4

  // Offset to move bottle inside cage (away from wall)
  group.position.x = 1.5
  group.position.z = 2.0

  return group
}

// Bubble configuration
const BUBBLE_CONFIG = {
  COUNT: 8,
  MIN_RADIUS: 0.03,
  MAX_RADIUS: 0.08,
  RISE_SPEED: 2.0,
  SPAWN_RADIUS: 0.4,
  MIN_Y: 1.8,
  MAX_Y: 4.8,
}

/**
 * Create bubble particles for water bottle drinking animation
 * @param waterBottleGroup - The water bottle THREE.Group to add bubbles to
 */
export function createWaterBottleBubbles(waterBottleGroup: THREE.Group): void {
  // Check if bubbles already exist
  if (waterBottleGroup.userData.bubbles) {
    return
  }

  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    opacity: 0.6,
    transparent: true,
    emissive: 0x88ccff,
    emissiveIntensity: 0.3,
  })

  const bubbles: THREE.Mesh[] = []
  const bubbleGeo = new THREE.SphereGeometry(1, 8, 8)

  for (let i = 0; i < BUBBLE_CONFIG.COUNT; i++) {
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)

    // Random size
    const scale = BUBBLE_CONFIG.MIN_RADIUS + Math.random() * (BUBBLE_CONFIG.MAX_RADIUS - BUBBLE_CONFIG.MIN_RADIUS)
    bubble.scale.setScalar(scale)

    // Random starting position within bottle
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * BUBBLE_CONFIG.SPAWN_RADIUS
    bubble.position.x = Math.cos(angle) * radius
    bubble.position.z = Math.sin(angle) * radius
    bubble.position.y = BUBBLE_CONFIG.MIN_Y + Math.random() * (BUBBLE_CONFIG.MAX_Y - BUBBLE_CONFIG.MIN_Y)

    // Store initial Y for reset
    bubble.userData.startY = bubble.position.y
    bubble.userData.speed = 0.5 + Math.random() * 0.5 // Variable speed

    bubble.visible = false
    waterBottleGroup.add(bubble)
    bubbles.push(bubble)
  }

  waterBottleGroup.userData.bubbles = bubbles
  waterBottleGroup.userData.bubblesActive = false
}

/**
 * Start bubble animation
 */
export function startWaterBottleBubbles(waterBottleGroup: THREE.Group): void {
  const bubbles = waterBottleGroup.userData.bubbles as THREE.Mesh[] | undefined
  if (!bubbles) {
    createWaterBottleBubbles(waterBottleGroup)
  }

  const activeBubbles = waterBottleGroup.userData.bubbles as THREE.Mesh[]
  activeBubbles.forEach(bubble => {
    bubble.visible = true
  })

  waterBottleGroup.userData.bubblesActive = true
}

/**
 * Stop bubble animation
 */
export function stopWaterBottleBubbles(waterBottleGroup: THREE.Group): void {
  const bubbles = waterBottleGroup.userData.bubbles as THREE.Mesh[] | undefined
  if (!bubbles) return

  bubbles.forEach(bubble => {
    bubble.visible = false
  })

  waterBottleGroup.userData.bubblesActive = false
}

/**
 * Update bubble positions (call in render loop)
 * @param waterBottleGroup - The water bottle THREE.Group
 * @param deltaTime - Time since last frame in seconds
 */
export function updateWaterBottleBubbles(waterBottleGroup: THREE.Group, deltaTime: number): void {
  if (!waterBottleGroup.userData.bubblesActive) return

  const bubbles = waterBottleGroup.userData.bubbles as THREE.Mesh[] | undefined
  if (!bubbles) return

  bubbles.forEach(bubble => {
    // Move bubble up
    bubble.position.y += BUBBLE_CONFIG.RISE_SPEED * deltaTime * bubble.userData.speed

    // Add slight wobble
    bubble.position.x += Math.sin(Date.now() * 0.005 + bubble.userData.startY) * 0.002
    bubble.position.z += Math.cos(Date.now() * 0.004 + bubble.userData.startY) * 0.002

    // Reset when reaching top
    if (bubble.position.y > BUBBLE_CONFIG.MAX_Y) {
      bubble.position.y = BUBBLE_CONFIG.MIN_Y

      // Randomize position for variety
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * BUBBLE_CONFIG.SPAWN_RADIUS
      bubble.position.x = Math.cos(angle) * radius
      bubble.position.z = Math.sin(angle) * radius
    }
  })
}

/**
 * Update water level display in a water bottle model
 * @param waterBottleGroup - The water bottle THREE.Group
 * @param level - Water level 0-100 (percentage)
 */
export function updateWaterBottleLevel(waterBottleGroup: THREE.Group, level: number): void {
  const waterMesh = waterBottleGroup.userData.waterMesh as THREE.Mesh | undefined
  if (!waterMesh) {
    console.warn('Water bottle does not have waterMesh in userData')
    return
  }

  // Clamp level to 0-100
  const clampedLevel = Math.max(0, Math.min(100, level))

  // Scale water mesh height based on level
  const scaleY = clampedLevel / 100
  waterMesh.scale.y = Math.max(0.01, scaleY) // Never fully zero to avoid rendering issues

  // Adjust position so water stays at bottom of bottle
  // When full (scaleY = 1), water is at original position
  // When empty (scaleY = 0.01), water should be at bottom
  const fullHeight = waterBottleGroup.userData.waterFullHeight as number || WATER_FULL_HEIGHT
  const baseY = waterBottleGroup.userData.waterBaseY as number || WATER_BASE_Y

  // Calculate new Y position: base + half of current height
  const currentHeight = fullHeight * scaleY
  waterMesh.position.y = baseY + currentHeight / 2
}

