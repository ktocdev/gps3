# Phase 4: Movement & Visual Polish

**Status:** 🚧 Ready to Start
**Created:** November 30, 2025
**Goal:** Smooth movement quality matching demo + visual enhancements

---

## 📋 Overview

Phase 4 focuses on three main areas:
1. **Movement Polish** - Smooth interpolation and walking animations
2. **Visual Enhancements** - Sky, effects, and model improvements
3. **Interaction & Condition Animations** - Reactive animations for actions and environmental changes

This phase will transform the 3D experience from functional to polished and immersive.

---

## 🎯 Goals

### Movement Quality
- ✅ Smooth position interpolation (lerping)
- ✅ Smooth rotation interpolation (slerping)
- ✅ Walking animations (feet, body bobbing)
- ✅ Match demo movement quality

### Visual Polish
- ✅ Sky with clouds
- ✅ Water bottle drinking bubbles
- ✅ Hay rack 3D model (based on reference image)
- ✅ Wooden archway tunnel extraction from demo

### Interaction & Condition Animations
- ✅ Guinea pig popcorn animation (excitement)
- ✅ Water level decrease animation (as guinea pig drinks)
- ✅ Hay consumption particle effects
- ✅ Bedding refresh animation (fluff effect)
- ✅ Bedding color/quality visual changes
- ✅ Habitat cleaning visual effects

---

## 🏃 Movement Polish

### Current Issue

Movement is jerky because 3D models directly sync to grid-based position updates from the 2D game state. The demo has smooth interpolation that we need to replicate.

### 4.1 Position Interpolation (Lerping)

**Goal:** Smoothly transition between grid positions instead of instant snapping

**Implementation:**

**File:** `src/composables/use3DSync.ts`

```typescript
// Store both target and current positions
const targetPositions = new Map<string, THREE.Vector3>()
const currentPositions = new Map<string, THREE.Vector3>()

// Initialize on guinea pig creation
function initializeGuineaPig(guineaPigId: string, worldPos: THREE.Vector3) {
  targetPositions.set(guineaPigId, worldPos.clone())
  currentPositions.set(guineaPigId, worldPos.clone())
}

// Update target when game state changes
watch(() => habitatConditions.guineaPigPositions, (positions) => {
  positions.forEach((pos, guineaPigId) => {
    const worldPos = gridToWorldWithOffset(pos)
    targetPositions.set(guineaPigId, worldPos)
  })
})

// Call from animation loop in Habitat3DDebug
export function updateGuineaPigPositions(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const target = targetPositions.get(guineaPigId)
    const current = currentPositions.get(guineaPigId)

    if (target && current) {
      // Smooth lerp (0.15 = nice balance of smooth and responsive)
      current.lerp(target, 0.15)
      model.position.copy(current)
    }
  })
}
```

**Animation Loop Integration:**

**File:** `src/components/debug/environment/Habitat3DDebug.vue`

```typescript
import { updateGuineaPigPositions } from '../../../composables/use3DSync'

// In animation loop
function animate() {
  requestAnimationFrame(animate)

  const deltaTime = clock.getDelta()

  // Update interpolated positions
  updateGuineaPigPositions(deltaTime)

  // Render
  renderer.render(scene, camera)
}
```

---

### 4.2 Rotation Interpolation (Slerping)

**Goal:** Smooth rotation when guinea pigs change direction

**Implementation:**

**File:** `src/composables/use3DSync.ts`

```typescript
// Store target and current rotations
const targetRotations = new Map<string, number>()
const currentRotations = new Map<string, number>()

// Helper: Lerp angle with proper wrapping
function lerpAngle(current: number, target: number, amount: number): number {
  let diff = target - current

  // Handle angle wrapping (-π to π)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2

  return current + diff * amount
}

// Update rotation smoothly
export function updateGuineaPigRotations(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const target = targetRotations.get(guineaPigId)
    const current = currentRotations.get(guineaPigId)

    if (target !== undefined && current !== undefined) {
      const newRotation = lerpAngle(current, target, 0.2)
      currentRotations.set(guineaPigId, newRotation)
      model.rotation.y = newRotation
    }
  })
}

// Calculate target rotation from movement
watch(() => habitatConditions.guineaPigPositions, (positions) => {
  positions.forEach((pos, guineaPigId) => {
    const prevPos = previousPositions.get(guineaPigId)
    const worldPos = gridToWorldWithOffset(pos)

    if (prevPos) {
      const deltaX = worldPos.x - prevPos.x
      const deltaZ = worldPos.z - prevPos.z
      const distanceMoved = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)

      if (distanceMoved > ANIMATION_CONFIG.MOVEMENT_THRESHOLD) {
        const angle = Math.atan2(deltaX, deltaZ)
        targetRotations.set(guineaPigId, angle)
      }
    }

    previousPositions.set(guineaPigId, worldPos.clone())
  })
}, { deep: true })
```

---

### 4.3 Walking Animation

**Goal:** Animate feet, body bobbing, and nose wiggle while moving

**Features:**
1. **Feet Movement** - Alternate front/back feet while walking
2. **Body Bobbing** - Slight up/down movement while walking
3. **Nose Wiggle** - Continuous subtle animation (always active)

**Prerequisites:**
- Guinea pig model must expose body parts via `model.userData`
- Feet, body, and nose must be separate meshes

**Implementation:**

**File:** `src/composables/use3DGuineaPig.ts`

Update model creation to expose animatable parts:

```typescript
export function createGuineaPigModel(options?: GuineaPigModelOptions): THREE.Group {
  const group = new THREE.Group()

  // ... existing model creation code ...

  // Store references to animatable parts
  group.userData = {
    body: bodyMesh,
    nose: noseMesh,
    feet: {
      frontLeft: frontLeftFoot,
      frontRight: frontRightFoot,
      backLeft: backLeftFoot,
      backRight: backRightFoot
    }
  }

  return group
}
```

**File:** `src/composables/use3DSync.ts`

Add animation state and update function:

```typescript
// Animation state per guinea pig
interface AnimationState {
  walkCycle: number  // 0 to 2π
  isMoving: boolean
}

const animationStates = new Map<string, AnimationState>()

// Initialize animation state
function initializeAnimationState(guineaPigId: string) {
  animationStates.set(guineaPigId, {
    walkCycle: 0,
    isMoving: false
  })
}

// Detect if guinea pig is moving
function updateMovementState(guineaPigId: string, target: THREE.Vector3, current: THREE.Vector3) {
  const state = animationStates.get(guineaPigId)
  if (!state) return

  const distance = target.distanceTo(current)
  state.isMoving = distance > 0.05 // Threshold for "moving"
}

// Update walking animations
export function updateGuineaPigAnimations(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const state = animationStates.get(guineaPigId)
    if (!state) return

    const { body, feet, nose } = model.userData
    if (!body || !feet || !nose) return

    if (state.isMoving) {
      // Increment walk cycle
      state.walkCycle += deltaTime * 8 // Walking speed

      // Feet movement (alternating pairs)
      const footHeight = Math.abs(Math.sin(state.walkCycle)) * 0.15
      feet.frontLeft.position.y = footHeight
      feet.backRight.position.y = footHeight

      const footHeightAlt = Math.abs(Math.sin(state.walkCycle + Math.PI)) * 0.15
      feet.frontRight.position.y = footHeightAlt
      feet.backLeft.position.y = footHeightAlt

      // Body bobbing (synchronized with feet)
      body.position.y = Math.abs(Math.sin(state.walkCycle * 2)) * 0.05
    } else {
      // Reset to idle position
      feet.frontLeft.position.y = 0
      feet.frontRight.position.y = 0
      feet.backLeft.position.y = 0
      feet.backRight.position.y = 0
      body.position.y = 0
    }

    // Nose wiggle (always active, independent of movement)
    const time = performance.now() * 0.003
    nose.rotation.y = Math.sin(time) * 0.1
  })
}
```

**File:** `src/components/debug/environment/Habitat3DDebug.vue`

Update animation loop to call all animation functions:

```typescript
function animate() {
  requestAnimationFrame(animate)

  const deltaTime = clock.getDelta()

  // Movement interpolation
  updateGuineaPigPositions(deltaTime)
  updateGuineaPigRotations(deltaTime)

  // Walking animations
  updateGuineaPigAnimations(deltaTime)

  // Render
  renderer.render(scene, camera)
}
```

---

## 🎨 Visual Enhancements

### 4.4 Sky with Clouds

**Goal:** Add realistic sky gradient with animated clouds

**Reference:** Similar to demo's sky system

**Implementation:**

**File:** `src/composables/use3DScene.ts`

```typescript
function createSky(): THREE.Mesh {
  // Large sphere for sky dome
  const skyGeo = new THREE.SphereGeometry(500, 32, 15)
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },    // Blue sky
      bottomColor: { value: new THREE.Color(0xffffff) }, // White horizon
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  })

  return new THREE.Mesh(skyGeo, skyMat)
}
```

**Clouds:**

```typescript
function createClouds(): THREE.Group {
  const cloudGroup = new THREE.Group()

  // Cloud material (soft white)
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    roughness: 1.0
  })

  // Create multiple clouds
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Group()

    // Each cloud is made of several spheres
    const puffCount = 3 + Math.floor(Math.random() * 3)
    for (let j = 0; j < puffCount; j++) {
      const puffGeo = new THREE.SphereGeometry(
        2 + Math.random() * 2, // Varying sizes
        8, 8
      )
      const puff = new THREE.Mesh(puffGeo, cloudMat)
      puff.position.x = (Math.random() - 0.5) * 4
      puff.position.y = (Math.random() - 0.5) * 1
      puff.position.z = (Math.random() - 0.5) * 2
      cloud.add(puff)
    }

    // Position clouds around scene
    const angle = (i / 8) * Math.PI * 2
    const radius = 100 + Math.random() * 50
    cloud.position.x = Math.cos(angle) * radius
    cloud.position.y = 30 + Math.random() * 20
    cloud.position.z = Math.sin(angle) * radius

    cloudGroup.add(cloud)
  }

  return cloudGroup
}

// Animate clouds slowly
export function updateClouds(clouds: THREE.Group, deltaTime: number) {
  clouds.rotation.y += deltaTime * 0.01 // Slow rotation
}
```

---

### 4.5 Water Bottle Drinking Bubbles

**Goal:** Show bubbles rising in water bottle when guinea pig drinks

**Trigger:** When guinea pig drinks water (interaction or autonomy)

**Implementation:**

**File:** `src/composables/3d-models/containers/water-bottles.ts`

Update water bottle model to support bubbles:

```typescript
export function createWaterBottleModel(): THREE.Group {
  const group = new THREE.Group()

  // ... existing water bottle code ...

  // Bubble container (initially empty)
  const bubbleGroup = new THREE.Group()
  bubbleGroup.name = 'bubbles'
  group.add(bubbleGroup)

  // Store reference for animation
  group.userData.bubbleGroup = bubbleGroup
  group.userData.waterHeight = 3.3 // Where water surface is

  return group
}

// Create bubble effect
export function createDrinkingBubbles(bottleModel: THREE.Group): void {
  const bubbleGroup = bottleModel.userData.bubbleGroup
  if (!bubbleGroup) return

  const bubbleMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
  })

  // Create 5-8 small bubbles
  const bubbleCount = 5 + Math.floor(Math.random() * 4)
  for (let i = 0; i < bubbleCount; i++) {
    const bubbleGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8)
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)

    // Start at bottom of water
    bubble.position.x = (Math.random() - 0.5) * 0.4
    bubble.position.y = 1.5 + Math.random() * 0.5
    bubble.position.z = (Math.random() - 0.5) * 0.4

    // Store animation data
    bubble.userData.riseSpeed = 0.5 + Math.random() * 0.5
    bubble.userData.wobble = Math.random() * Math.PI * 2

    bubbleGroup.add(bubble)
  }
}

// Animate bubbles rising
export function updateDrinkingBubbles(bottleModel: THREE.Group, deltaTime: number): void {
  const bubbleGroup = bottleModel.userData.bubbleGroup
  if (!bubbleGroup) return

  const waterHeight = bottleModel.userData.waterHeight || 3.3

  // Update each bubble
  bubbleGroup.children.forEach((bubble) => {
    // Rise upward
    bubble.position.y += bubble.userData.riseSpeed * deltaTime

    // Wobble side to side
    bubble.userData.wobble += deltaTime * 2
    bubble.position.x += Math.sin(bubble.userData.wobble) * 0.01

    // Remove if reached surface
    if (bubble.position.y >= waterHeight) {
      bubbleGroup.remove(bubble)
    }
  })
}

// Clear all bubbles
export function clearDrinkingBubbles(bottleModel: THREE.Group): void {
  const bubbleGroup = bottleModel.userData.bubbleGroup
  if (!bubbleGroup) return

  bubbleGroup.clear()
}
```

**Integration with Drinking:**

**File:** `src/composables/use3DItems.ts`

```typescript
// Watch for drinking events
watch(() => habitatConditions.waterBottleInteractions, (interactions) => {
  interactions.forEach((interaction) => {
    if (interaction.type === 'drinking') {
      const bottleModel = itemModels.get(interaction.bottleId)
      if (bottleModel) {
        createDrinkingBubbles(bottleModel)
      }
    }
  })
})

// Update bubbles in animation loop
export function updateItemAnimations(deltaTime: number) {
  itemModels.forEach((model, itemId) => {
    if (itemId.includes('water') && itemId.includes('bottle')) {
      updateDrinkingBubbles(model, deltaTime)
    }
  })
}
```

---

### 4.6 Hay Rack 3D Model

**Goal:** Create proper hay rack model based on reference image

**Reference Image:** User-provided hay rack design

**Current:** Using placeholder or missing model

**Implementation:**

**File:** `src/composables/3d-models/containers/hay-racks.ts` (NEW)

```typescript
import * as THREE from 'three'
import { createWoodTexture } from '../shared/textures'
import { createHayPile } from '../food/hay'

/**
 * Create hay rack model based on reference image
 * Wall-mounted rack with vertical slats and hay inside
 */
export function createHayRackModel(rackItemId: string): THREE.Group {
  const group = new THREE.Group()
  const woodTexture = createWoodTexture()

  // Wood material
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    map: woodTexture,
    roughness: 0.9
  })

  // Back panel
  const backGeo = new THREE.BoxGeometry(4.0, 3.0, 0.2)
  const back = new THREE.Mesh(backGeo, woodMat)
  back.position.y = 1.5
  back.castShadow = true
  group.add(back)

  // Bottom panel
  const bottomGeo = new THREE.BoxGeometry(4.0, 0.3, 1.0)
  const bottom = new THREE.Mesh(bottomGeo, woodMat)
  bottom.position.y = 0.15
  bottom.position.z = 0.4
  bottom.castShadow = true
  group.add(bottom)

  // Vertical slats (front)
  const slatGeo = new THREE.BoxGeometry(0.15, 3.0, 0.15)
  const slatCount = 5
  const slatSpacing = 4.0 / (slatCount + 1)

  for (let i = 0; i < slatCount; i++) {
    const slat = new THREE.Mesh(slatGeo, woodMat)
    slat.position.x = -2.0 + slatSpacing * (i + 1)
    slat.position.y = 1.5
    slat.position.z = 0.9
    slat.castShadow = true
    group.add(slat)
  }

  // Hay inside (if rack has hay contents)
  const habitatConditions = useHabitatConditions()
  const contents = habitatConditions.getHayRackContents(rackItemId)

  if (contents.length > 0) {
    const seed = rackItemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hayPile = createHayPile(contents.length, seed)
    hayPile.scale.set(0.6, 0.8, 0.6)
    hayPile.position.set(0, 1.0, 0.4)
    group.add(hayPile)
  }

  // Offset for wall mounting
  group.position.z = -1.0 // Mount against wall

  return group
}
```

**Update Factory:**

**File:** `src/composables/3d-models/index.ts`

```typescript
import { createHayRackModel } from './containers/hay-racks'

export function createItemModel(itemId: string): THREE.Group {
  // ... existing code ...

  // Hay racks
  if (itemId.includes('hay_rack')) return createHayRackModel(itemId)

  // ... rest of factory ...
}

// Re-export
export { createHayRackModel } from './containers/hay-racks'
```

---

### 4.7 Wooden Archway Tunnel from Demo

**Goal:** Extract and integrate wooden archway tunnel model from demo

**Current Status:** Tunnel exists in demo (`guinea-pig-sim-demo.html`) but may not be showing in 3D view

**Investigation Required:**
1. Check if tunnel is in demo HTML file
2. Extract tunnel creation code
3. Verify it's properly referenced in item factory
4. Test with tunnel items in inventory

**Implementation:**

The wooden tunnel model already exists in [shelters/tunnels.ts](../../src/composables/3d-models/shelters/tunnels.ts) as `createWoodenTunnelModel()`.

**Verification Steps:**

1. **Check factory routing:**

**File:** `src/composables/3d-models/index.ts`

```typescript
// Ensure this is present:
if (itemId.includes('tunnel') && itemId.includes('archway')) {
  return createWoodenTunnelModel()
}
```

2. **Check item IDs in supplies:**

Verify that tunnel items have IDs that include both 'tunnel' and 'archway':
- `wooden_archway_tunnel_medium`
- `wooden_archway_tunnel_large`

3. **Test in game:**
- Add tunnel to inventory
- Place in habitat
- Verify 3D model appears

**If model is missing from demo:**

Extract from `guinea-pig-sim-demo.html` (search for "tunnel" or "arch"):

```javascript
// Look for tunnel creation code in demo
// It should be similar to what we already have
// If different, update createWoodenTunnelModel() to match
```

---

## 🎬 Interaction & Condition Animations

### Overview

This section covers dynamic animations that respond to guinea pig actions and habitat condition changes. These animations make the 3D environment feel alive and reactive.

---

### 4.8 Guinea Pig Popcorn Animation

**Goal:** Animate guinea pigs "popcorning" (jumping for joy) when excited

**Trigger Events:**
- High happiness level
- After receiving favorite treat
- During play interactions
- Spontaneous excitement bursts

**Implementation:**

**File:** `src/composables/use3DGuineaPig.ts`

```typescript
// Popcorn animation state
interface PopcornState {
  isPopcorning: boolean
  jumpPhase: number // 0 to 1 (one jump cycle)
  rotationPhase: number
  jumpHeight: number
  twistAmount: number
}

export function createPopcornAnimation(model: THREE.Group): PopcornState {
  return {
    isPopcorning: false,
    jumpPhase: 0,
    rotationPhase: 0,
    jumpHeight: 2.0 + Math.random() * 1.0, // Random jump height
    twistAmount: (Math.random() - 0.5) * Math.PI // Random twist direction
  }
}

export function updatePopcornAnimation(
  model: THREE.Group,
  state: PopcornState,
  deltaTime: number
): void {
  if (!state.isPopcorning) return

  // Jump cycle (parabolic motion)
  state.jumpPhase += deltaTime * 3.0 // Jump speed

  if (state.jumpPhase >= 1.0) {
    // Jump complete
    state.isPopcorning = false
    state.jumpPhase = 0
    model.position.y = 0
    model.rotation.z = 0
    return
  }

  // Parabolic jump (goes up then down)
  const jumpProgress = state.jumpPhase
  const jumpCurve = -(jumpProgress * jumpProgress) + jumpProgress
  model.position.y = jumpCurve * 4 * state.jumpHeight

  // Mid-air twist rotation
  state.rotationPhase = Math.sin(jumpProgress * Math.PI)
  model.rotation.z = state.rotationPhase * state.twistAmount
}

// Trigger popcorn
export function triggerPopcorn(guineaPigId: string): void {
  const state = popcornStates.get(guineaPigId)
  if (state && !state.isPopcorning) {
    state.isPopcorning = true
    state.jumpPhase = 0
    state.jumpHeight = 2.0 + Math.random() * 1.0
    state.twistAmount = (Math.random() - 0.5) * Math.PI
  }
}
```

**Integration with Game Events:**

**File:** `src/composables/use3DSync.ts`

```typescript
import { useActivityFeedStore } from '../stores/activityFeed'

// Watch for happiness-related events
const activityFeed = useActivityFeedStore()

watch(() => activityFeed.messages, (messages) => {
  const latestMessage = messages[0]

  // Trigger popcorn on excitement events
  if (latestMessage?.category === 'guinea_pig_reaction' &&
      (latestMessage.message.includes('excited') ||
       latestMessage.message.includes('happy') ||
       latestMessage.message.includes('popcorning'))) {
    const guineaPigId = latestMessage.guineaPigId
    if (guineaPigId) {
      triggerPopcorn(guineaPigId)
    }
  }
})
```

---

### 4.9 Water Level Decrease Animation

**Goal:** Visually show water level decreasing in bottles as guinea pigs drink

**Current:** Water bottle has static water level

**Implementation:**

**File:** `src/composables/3d-models/containers/water-bottles.ts`

```typescript
export function createWaterBottleModel(): THREE.Group {
  const group = new THREE.Group()

  // ... existing bottle geometry ...

  // Water cylinder (dynamic height)
  const waterGeo = new THREE.CylinderGeometry(0.8, 0.8, 5.2, 32, 1, false)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1
  })
  const water = new THREE.Mesh(waterGeo, waterMat)
  water.name = 'water'
  water.position.y = 3.3
  water.castShadow = true
  water.receiveShadow = true
  group.add(water)

  // Store reference for animation
  group.userData.water = water
  group.userData.maxWaterHeight = 5.2
  group.userData.waterLevel = 1.0 // 0 to 1 (full)

  return group
}

// Update water level visualization
export function updateWaterLevel(
  bottleModel: THREE.Group,
  waterLevel: number // 0 to 1
): void {
  const water = bottleModel.userData.water
  const maxHeight = bottleModel.userData.maxWaterHeight || 5.2

  if (!water) return

  // Animate water level change
  const targetWaterLevel = waterLevel
  const currentWaterLevel = bottleModel.userData.waterLevel || 1.0

  // Smooth transition
  const newLevel = currentWaterLevel + (targetWaterLevel - currentWaterLevel) * 0.1
  bottleModel.userData.waterLevel = newLevel

  // Update geometry scale
  const newHeight = maxHeight * newLevel
  water.scale.y = newLevel
  water.position.y = 0.7 + (newHeight / 2) // Adjust position as height changes
}

// Animate drinking (gradual decrease)
export function animateDrinking(
  bottleModel: THREE.Group,
  amount: number // Amount to decrease (0 to 1)
): void {
  const currentLevel = bottleModel.userData.waterLevel || 1.0
  const newLevel = Math.max(0, currentLevel - amount)

  updateWaterLevel(bottleModel, newLevel)
}
```

**Sync with Store:**

**File:** `src/composables/use3DItems.ts`

```typescript
import { useHabitatConditions } from '../stores/habitatConditions'

// Watch water levels
watch(() => habitatConditions.waterLevel, (newLevel) => {
  // Update all water bottle models
  itemModels.forEach((model, itemId) => {
    if (itemId.includes('water') && itemId.includes('bottle')) {
      const normalizedLevel = newLevel / 100 // Convert percentage to 0-1
      updateWaterLevel(model, normalizedLevel)
    }
  })
})

// Watch for drinking events
watch(() => habitatConditions.lastDrinkEvent, (event) => {
  if (!event) return

  const bottleModel = itemModels.get(event.bottleId)
  if (bottleModel) {
    animateDrinking(bottleModel, 0.05) // Decrease by 5% per drink
    createDrinkingBubbles(bottleModel) // Also trigger bubbles
  }
})
```

---

### 4.10 Hay Consumption Particle Effects

**Goal:** Show hay particles/dust when guinea pigs eat hay

**Visual Effect:** Small hay strand particles float away from hay pile/rack during eating

**Implementation:**

**File:** `src/composables/3d-effects/hay-particles.ts` (NEW)

```typescript
import * as THREE from 'three'

interface HayParticle {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  lifetime: number
  maxLifetime: number
}

export function createHayParticles(position: THREE.Vector3): THREE.Group {
  const particleGroup = new THREE.Group()
  particleGroup.position.copy(position)

  const hayMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37, // Golden hay color
    transparent: true,
    opacity: 0.8,
    roughness: 1.0
  })

  // Create 8-12 small hay strand particles
  const particleCount = 8 + Math.floor(Math.random() * 5)

  for (let i = 0; i < particleCount; i++) {
    // Tiny hay strand
    const particleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4)
    const particle = new THREE.Mesh(particleGeo, hayMat)

    // Random initial rotation
    particle.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )

    // Store particle data
    const velocityDirection = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 1.5 + 0.5, // Upward bias
      (Math.random() - 0.5) * 2
    )

    particle.userData = {
      velocity: velocityDirection,
      lifetime: 0,
      maxLifetime: 1.0 + Math.random() * 0.5,
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      )
    }

    particleGroup.add(particle)
  }

  return particleGroup
}

export function updateHayParticles(
  particleGroup: THREE.Group,
  deltaTime: number
): boolean {
  let allExpired = true

  particleGroup.children.forEach((particle) => {
    const data = particle.userData

    data.lifetime += deltaTime

    if (data.lifetime < data.maxLifetime) {
      allExpired = false

      // Update position
      particle.position.add(
        data.velocity.clone().multiplyScalar(deltaTime)
      )

      // Apply gravity
      data.velocity.y -= 1.0 * deltaTime

      // Rotate
      particle.rotation.x += data.rotationSpeed.x * deltaTime
      particle.rotation.y += data.rotationSpeed.y * deltaTime
      particle.rotation.z += data.rotationSpeed.z * deltaTime

      // Fade out
      const progress = data.lifetime / data.maxLifetime
      const material = particle.material as THREE.MeshStandardMaterial
      material.opacity = 0.8 * (1 - progress)
    }
  })

  return allExpired // Return true if all particles expired
}
```

**Integration:**

**File:** `src/composables/use3DSync.ts`

```typescript
import { createHayParticles, updateHayParticles } from './3d-effects/hay-particles'

const activeParticleEffects: THREE.Group[] = []

// Watch for eating events
watch(() => activityFeed.messages, (messages) => {
  const latestMessage = messages[0]

  if (latestMessage?.message.includes('eating hay')) {
    const guineaPigId = latestMessage.guineaPigId
    const gpModel = guineaPigModels.get(guineaPigId)

    if (gpModel) {
      const particles = createHayParticles(gpModel.position.clone())
      worldGroup.add(particles)
      activeParticleEffects.push(particles)
    }
  }
})

// Update particles in animation loop
export function updateParticleEffects(deltaTime: number): void {
  activeParticleEffects.forEach((particleGroup, index) => {
    const expired = updateHayParticles(particleGroup, deltaTime)

    if (expired) {
      worldGroup.remove(particleGroup)
      activeParticleEffects.splice(index, 1)
    }
  })
}
```

---

### 4.11 Bedding Refresh Animation

**Goal:** Visual "fluff" effect when adding or replacing bedding

**Effect:** Bedding puffs up briefly, particles float in air

**Implementation:**

**File:** `src/composables/3d-effects/bedding-particles.ts` (NEW)

```typescript
import * as THREE from 'three'

export function createBeddingFluffEffect(
  position: THREE.Vector3,
  beddingColor: number
): THREE.Group {
  const fluffGroup = new THREE.Group()
  fluffGroup.position.copy(position)

  const fluffMat = new THREE.MeshStandardMaterial({
    color: beddingColor,
    transparent: true,
    opacity: 0.6,
    roughness: 1.0
  })

  // Create 20-30 small fluffy particles
  const particleCount = 20 + Math.floor(Math.random() * 11)

  for (let i = 0; i < particleCount; i++) {
    // Small sphere for fluff particle
    const fluffGeo = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6)
    const fluff = new THREE.Mesh(fluffGeo, fluffMat)

    // Random starting position (spread across bedding area)
    fluff.position.set(
      (Math.random() - 0.5) * 3,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 3
    )

    fluff.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 2 + 1, // Strong upward
        (Math.random() - 0.5) * 1.5
      ),
      lifetime: 0,
      maxLifetime: 1.5 + Math.random() * 0.5,
      turbulence: Math.random() * Math.PI * 2
    }

    fluffGroup.add(fluff)
  }

  return fluffGroup
}

export function updateBeddingFluff(
  fluffGroup: THREE.Group,
  deltaTime: number
): boolean {
  let allExpired = true

  fluffGroup.children.forEach((fluff) => {
    const data = fluff.userData

    data.lifetime += deltaTime

    if (data.lifetime < data.maxLifetime) {
      allExpired = false

      // Update position
      fluff.position.add(data.velocity.clone().multiplyScalar(deltaTime))

      // Apply gravity (slower fall for light particles)
      data.velocity.y -= 0.5 * deltaTime

      // Turbulence (floating effect)
      data.turbulence += deltaTime * 2
      fluff.position.x += Math.sin(data.turbulence) * 0.02
      fluff.position.z += Math.cos(data.turbulence) * 0.02

      // Fade out
      const progress = data.lifetime / data.maxLifetime
      const material = fluff.material as THREE.MeshStandardMaterial
      material.opacity = 0.6 * (1 - progress)

      // Shrink
      const scale = 1 - progress * 0.5
      fluff.scale.set(scale, scale, scale)
    }
  })

  return allExpired
}
```

**Integration:**

**File:** `src/composables/use3DItems.ts` or `use3DSync.ts`

```typescript
import { createBeddingFluffEffect, updateBeddingFluff } from './3d-effects/bedding-particles'

// Watch for bedding changes
watch(() => habitatConditions.beddingFreshness, (newFreshness, oldFreshness) => {
  // Trigger fluff effect when bedding improves significantly (refresh)
  if (newFreshness > oldFreshness + 20) {
    const beddingColor = getBeddingColor(habitatConditions.beddingType)
    const centerPosition = new THREE.Vector3(0, 0.1, 0)

    const fluffEffect = createBeddingFluffEffect(centerPosition, beddingColor)
    worldGroup.add(fluffEffect)
    activeParticleEffects.push(fluffEffect)
  }
})

function getBeddingColor(beddingType: string): number {
  const colors: Record<string, number> = {
    'fleece': 0x8B7355, // Brown
    'paper': 0xF5F5DC, // Beige
    'wood_shavings': 0xDEB887, // Burlywood
    'default': 0xC0C0C0 // Gray
  }
  return colors[beddingType] || colors.default
}
```

---

### 4.12 Bedding Visual Quality Changes

**Goal:** Bedding appearance changes based on freshness/quality

**Visual Changes:**
- **Fresh (80-100%):** Bright color, fluffy appearance
- **Used (50-79%):** Slightly darker, compressed
- **Dirty (0-49%):** Dark/stained, flat

**Implementation:**

**File:** `src/composables/use3DScene.ts`

```typescript
// Update floor bedding appearance based on freshness
export function updateBeddingAppearance(
  floorMesh: THREE.Mesh,
  freshness: number // 0 to 100
): void {
  const material = floorMesh.material as THREE.MeshStandardMaterial

  // Base bedding color (from store)
  const habitatConditions = useHabitatConditions()
  const baseColor = getBeddingColor(habitatConditions.beddingType)

  // Darken based on dirtiness
  const freshnessRatio = freshness / 100
  const color = new THREE.Color(baseColor)

  // Reduce brightness as freshness decreases
  color.multiplyScalar(0.4 + freshnessRatio * 0.6)

  material.color = color

  // Adjust roughness (fresh = more varied/fluffy, dirty = smoother/compressed)
  material.roughness = 0.7 + (1 - freshnessRatio) * 0.3

  // Optional: Add staining effect for very dirty bedding
  if (freshness < 30) {
    // Add dark spots (could use a texture or color variation)
    const stainColor = new THREE.Color(0x3D2B1F) // Dark brown stain
    color.lerp(stainColor, (30 - freshness) / 30 * 0.3)
    material.color = color
  }
}

// Watch bedding freshness
watch(() => habitatConditions.beddingFreshness, (freshness) => {
  updateBeddingAppearance(floorMesh, freshness)
})
```

---

### 4.13 Habitat Cleaning Visual Effects

**Goal:** Show visual feedback during cleaning actions

**Effects:**
- **Clean Habitat:** Sparkle/shine particles across habitat
- **Quick Clean:** Smaller sparkle effect on dirty areas
- **Dust removal:** Puffs of dust when cleaning dirty spots

**Implementation:**

**File:** `src/composables/3d-effects/cleaning-effects.ts` (NEW)

```typescript
import * as THREE from 'three'

export function createCleaningSparkles(
  position: THREE.Vector3,
  radius: number = 10
): THREE.Group {
  const sparkleGroup = new THREE.Group()
  sparkleGroup.position.copy(position)

  const sparkleMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 1.0
  })

  // Create 30-50 sparkle particles
  const sparkleCount = 30 + Math.floor(Math.random() * 21)

  for (let i = 0; i < sparkleCount; i++) {
    // Small star-shaped particle
    const sparkleGeo = new THREE.SphereGeometry(0.1, 4, 4)
    const sparkle = new THREE.Mesh(sparkleGeo, sparkleMat)

    // Random position within radius
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * radius
    sparkle.position.set(
      Math.cos(angle) * distance,
      Math.random() * 2 + 0.5,
      Math.sin(angle) * distance
    )

    sparkle.userData = {
      lifetime: 0,
      maxLifetime: 0.8 + Math.random() * 0.4,
      delay: Math.random() * 0.3 // Stagger appearance
    }

    sparkleGroup.add(sparkle)
  }

  return sparkleGroup
}

export function updateCleaningSparkles(
  sparkleGroup: THREE.Group,
  deltaTime: number
): boolean {
  let allExpired = true

  sparkleGroup.children.forEach((sparkle) => {
    const data = sparkle.userData

    data.lifetime += deltaTime

    // Wait for delay
    if (data.lifetime < data.delay) {
      sparkle.visible = false
      allExpired = false
      return
    }

    sparkle.visible = true
    const adjustedLifetime = data.lifetime - data.delay

    if (adjustedLifetime < data.maxLifetime) {
      allExpired = false

      // Rise slowly
      sparkle.position.y += deltaTime * 0.5

      // Pulse scale
      const pulse = Math.sin(adjustedLifetime * 10)
      const scale = 1 + pulse * 0.3
      sparkle.scale.set(scale, scale, scale)

      // Fade out
      const progress = adjustedLifetime / data.maxLifetime
      const material = sparkle.material as THREE.MeshBasicMaterial
      material.opacity = 1 - progress
    }
  })

  return allExpired
}
```

**Integration:**

```typescript
// Watch for cleaning actions
watch(() => habitatConditions.lastCleaningAction, (action) => {
  if (!action) return

  let sparkles: THREE.Group

  if (action.type === 'full_clean') {
    // Large sparkle effect across entire habitat
    sparkles = createCleaningSparkles(new THREE.Vector3(0, 0, 0), 15)
  } else if (action.type === 'quick_clean') {
    // Smaller localized effect
    sparkles = createCleaningSparkles(new THREE.Vector3(0, 0, 0), 8)
  }

  if (sparkles) {
    worldGroup.add(sparkles)
    activeParticleEffects.push(sparkles)
  }
})
```

---

## 📋 Implementation Checklist

### Movement Polish
- [ ] Position lerping implementation
- [ ] Rotation slerping implementation
- [ ] Walking animation (feet)
- [ ] Body bobbing animation
- [ ] Nose wiggle animation
- [ ] Animation loop integration
- [ ] Test smooth movement quality

### Visual Enhancements
- [ ] Sky gradient shader
- [ ] Cloud generation and animation
- [ ] Water bottle bubble system
- [ ] Bubble animation (rise and wobble)
- [ ] Drinking trigger integration
- [ ] Hay rack model creation
- [ ] Hay rack wall mounting
- [ ] Wooden tunnel verification/extraction
- [ ] Test all visual effects

### Interaction & Condition Animations
- [ ] Popcorn animation implementation
- [ ] Popcorn trigger integration with game events
- [ ] Water level decrease visualization
- [ ] Water level sync with store
- [ ] Hay particle effect system
- [ ] Hay particles trigger on eating
- [ ] Bedding fluff particle effect
- [ ] Bedding color/quality visual updates
- [ ] Cleaning sparkle effects
- [ ] All particle systems integrated with animation loop

### Testing
- [ ] Movement smoothness matches demo
- [ ] Guinea pigs turn smoothly
- [ ] Walking animation looks natural
- [ ] Clouds drift realistically
- [ ] Bubbles appear when drinking
- [ ] Hay rack displays correctly
- [ ] Tunnels render properly
- [ ] Popcorn animation triggers correctly
- [ ] Water level decreases visibly when drinking
- [ ] Hay particles appear when eating
- [ ] Bedding fluff shows on refresh
- [ ] Bedding appearance changes with freshness
- [ ] Cleaning effects show appropriate sparkles
- [ ] Performance remains good (60 FPS)

---

## 🎯 Success Criteria

✅ **Phase 4 Complete when:**

### Movement Polish
1. ✅ Guinea pig movement is smooth (no jerky grid snapping)
2. ✅ Rotation transitions are smooth
3. ✅ Walking animations look natural and realistic

### Visual Enhancements
4. ✅ Sky with clouds creates immersive environment
5. ✅ Water bottle shows bubbles when guinea pigs drink
6. ✅ Hay rack has proper 3D model (not placeholder)
7. ✅ Wooden archway tunnel displays correctly

### Interaction & Condition Animations
8. ✅ Guinea pigs popcorn when excited
9. ✅ Water level visibly decreases as guinea pigs drink
10. ✅ Hay particles appear when guinea pigs eat
11. ✅ Bedding fluff effect shows when refreshing bedding
12. ✅ Bedding appearance reflects freshness level
13. ✅ Cleaning actions show visual sparkle feedback

### Performance
14. ✅ Performance maintains 60 FPS with all animations active
15. ✅ Visual quality matches or exceeds demo

---

## 📁 Files to Modify

### Movement System
- `src/composables/use3DSync.ts` - Position/rotation lerping, animation state
- `src/composables/use3DGuineaPig.ts` - Expose animatable body parts, popcorn animation
- `src/components/debug/environment/Habitat3DDebug.vue` - Animation loop
- `src/constants/3d.ts` - Animation config constants

### Visual Effects
- `src/composables/use3DScene.ts` - Sky and clouds, bedding appearance
- `src/composables/3d-models/containers/water-bottles.ts` - Bubble system, water level animation
- `src/composables/3d-models/containers/hay-racks.ts` - NEW - Hay rack model
- `src/composables/3d-models/shelters/tunnels.ts` - Verify/update tunnel
- `src/composables/3d-models/index.ts` - Factory updates
- `src/composables/use3DItems.ts` - Item animations integration

### Particle Effects (NEW)
- `src/composables/3d-effects/hay-particles.ts` - NEW - Hay consumption particles
- `src/composables/3d-effects/bedding-particles.ts` - NEW - Bedding fluff effect
- `src/composables/3d-effects/cleaning-effects.ts` - NEW - Cleaning sparkles

---

## 📚 References

- [guinea-pig-sim-demo.html](../../src/guinea-pig-sim-demo.html) - Movement and visual reference
- [Three.js Lerp Documentation](https://threejs.org/docs/#api/en/math/Vector3.lerp)
- [Animation Loop Best Practices](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)
- [Shader Materials](https://threejs.org/docs/#api/en/materials/ShaderMaterial)

---

**Last Updated:** November 30, 2025
