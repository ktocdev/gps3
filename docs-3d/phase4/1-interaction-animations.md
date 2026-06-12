# Phase 4: Interaction & Condition Animations

**Status:** 🚫 Blocked by Phase 3B (Pathfinding & Collision)
**Created:** November 30, 2025
**Goal:** Reactive animations for player actions and environmental changes

---

## 📋 Overview

This phase adds dynamic animations that respond to guinea pig actions and habitat condition changes. These animations make the 3D environment feel alive and reactive to player interactions.

**Why This is Blocked:**
These animations depend on proper positioning and alignment from Phase 3B. For example:
- Eating animations require guinea pigs to face bowls correctly
- Drinking animations need alignment with water bottle spouts
- Without boundary enforcement, particles could spawn outside walls

---

## 🎯 Goals

### Guinea Pig Reactions
- ✅ Popcorn animation (jumping for joy)

### Environmental Feedback
- ✅ Water level decrease (visible consumption)
- ✅ Hay particle effects (eating visualization)
- ✅ Bedding fluff particles (refresh effect)
- ✅ Bedding visual quality changes (freshness-based)
- ✅ Cleaning sparkle effects (action feedback)

---

## 🐹 Guinea Pig Animations

### 4.1 Popcorn Animation

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

## 💧 Water System Animations

### 4.2 Water Level Decrease Animation

**Goal:** Visually show water level decreasing in bottles as guinea pigs drink

**Current:** Water bottle has static water level

**Dependencies:**
- ⚠️ Requires Phase 3B alignment (guinea pigs must face spout when drinking)

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

## 🌾 Food System Animations

### 4.3 Hay Consumption Particle Effects

**Goal:** Show hay particles/dust when guinea pigs eat hay

**Visual Effect:** Small hay strand particles float away from hay pile/rack during eating

**Dependencies:**
- ⚠️ Requires Phase 3B alignment (guinea pigs must face bowl when eating)

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

## 🛏️ Bedding System Animations

### 4.4 Bedding Refresh Animation

**Goal:** Visual "fluff" effect when adding or replacing bedding

**Effect:** Bedding puffs up briefly, particles float in air

**Dependencies:**
- ⚠️ Requires Phase 3B boundaries (particles must stay within walls)

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

### 4.5 Bedding Visual Quality Changes

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

## 🧹 Cleaning System Animations

### 4.6 Habitat Cleaning Visual Effects

**Goal:** Show visual feedback during cleaning actions

**Effects:**
- **Clean Habitat:** Sparkle/shine particles across habitat
- **Quick Clean:** Smaller sparkle effect on dirty areas
- **Dust removal:** Puffs of dust when cleaning dirty spots

**Dependencies:**
- ⚠️ Requires Phase 3B boundaries (sparkles must stay within walls)

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

### Guinea Pig Animations
- [ ] Popcorn animation implementation
- [ ] Popcorn trigger integration with game events
- [ ] Test popcorn triggers correctly on happy events

### Water System
- [ ] Water level decrease visualization
- [ ] Water level sync with store
- [ ] Drinking event integration
- [ ] Test water level updates smoothly

### Food System
- [ ] Hay particle effect system
- [ ] Hay particles trigger on eating
- [ ] Particle lifetime and physics
- [ ] Test hay particles look natural

### Bedding System
- [ ] Bedding fluff particle effect
- [ ] Bedding color/quality visual updates
- [ ] Freshness-based appearance changes
- [ ] Test bedding reflects cleanliness state

### Cleaning System
- [ ] Cleaning sparkle effects
- [ ] Full clean vs quick clean variants
- [ ] Sparkle animation polish
- [ ] Test cleaning feedback is satisfying

### Integration
- [ ] All particle systems integrated with animation loop
- [ ] Particle cleanup (remove expired effects)
- [ ] Performance testing (60 FPS with all effects)
- [ ] Memory leak testing (long sessions)

---

## 🎯 Success Criteria

✅ **Interaction Animations Complete when:**

### Visual Feedback
1. ✅ Guinea pigs popcorn when excited
2. ✅ Water level visibly decreases as guinea pigs drink
3. ✅ Hay particles appear when guinea pigs eat
4. ✅ Bedding fluff effect shows when refreshing bedding
5. ✅ Bedding appearance reflects freshness level
6. ✅ Cleaning actions show visual sparkle feedback

### Polish
7. ✅ All animations look natural and polished
8. ✅ Particle effects don't spawn outside boundaries
9. ✅ Effects are synchronized with game events
10. ✅ Performance maintains 60 FPS with all effects active

---

## 📁 Files to Create/Modify

### New Particle Effect Files
- `src/composables/3d-effects/hay-particles.ts` - NEW - Hay consumption particles
- `src/composables/3d-effects/bedding-particles.ts` - NEW - Bedding fluff effect
- `src/composables/3d-effects/cleaning-effects.ts` - NEW - Cleaning sparkles

### Modified Files
- `src/composables/use3DGuineaPig.ts` - Add popcorn animation
- `src/composables/use3DSync.ts` - Particle effect integration, event watching
- `src/composables/use3DScene.ts` - Bedding appearance updates
- `src/composables/3d-models/containers/water-bottles.ts` - Water level animation
- `src/composables/use3DItems.ts` - Bedding and water event watching

---

## 🔗 Dependencies

**Blocked by:**
- Phase 3B: Pathfinding & Collision (alignment, boundaries)

**Blocks:**
- None (can be developed alongside Movement Polish)

---

## 📚 References

- [Activity Feed Store](../../src/stores/activityFeed.ts) - Event triggering
- [Habitat Conditions Store](../../src/stores/habitatConditions.ts) - State watching
- [Three.js Particle Systems](https://threejs.org/docs/#api/en/objects/Points)

---

**Last Updated:** November 30, 2025
