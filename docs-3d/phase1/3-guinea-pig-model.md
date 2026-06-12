# Phase 1: Guinea Pig 3D Model

> **Navigation:** [← Back to Development Phases](../DEVELOPMENT_PHASES.md) | [Project Plan](../PROJECT_PLAN.md)

---

## 📋 **Overview**

This document details the construction of the guinea pig 3D model using Three.js primitives (spheres, capsules) to create a stylized, recognizable guinea pig.

---

## 🎯 **Goals**

1. Create guinea pig model from Three.js primitives
2. Apply realistic materials (fur, skin, eyes)
3. Support multiple guinea pigs (up to 2)
4. Enable real-time position and rotation updates
5. Add basic animations (idle, breathing, blinking)

---

## 🎨 **Model Design**

### **Visual Reference**

The model is based on `guinea-pig-sim-demo-backup.html` with the following structure:

```
Guinea Pig (Group)
├── Body (scaled sphere)
├── Head (scaled sphere)
├── Left Ear (flattened sphere)
├── Right Ear (flattened sphere)
├── Left Eye (glossy sphere)
├── Right Eye (glossy sphere)
├── Nose (flattened sphere)
├── Mouth Parts (2 small spheres)
└── Feet (4 capsules)
    ├── Front Left
    ├── Front Right
    ├── Back Left
    └── Back Right
```

---

## 🎨 **Color Palette**

```typescript
const COLORS = {
  fur: 0xe8cd9a,      // Beige/tan fur
  ear: 0x3b2918,      // Dark brown ears
  skin: 0xffdcd6,     // Pink skin (nose, feet)
  eye: 0x111111,      // Dark eyes
}
```

**Note:** These colors can be customized per guinea pig based on the `appearance` attribute from the store.

---

## 🏗️ **Implementation**

### **use3DGuineaPig.ts**

```typescript
import * as THREE from 'three'

export interface GuineaPigColors {
  fur: number
  ear: number
  skin: number
  eye: number
}

export function createGuineaPigModel(colors?: Partial<GuineaPigColors>): THREE.Group {
  // Default colors
  const furColor = colors?.fur ?? 0xe8cd9a
  const earColor = colors?.ear ?? 0x3b2918
  const skinColor = colors?.skin ?? 0xffdcd6
  const eyeColor = colors?.eye ?? 0x111111

  // Materials
  const furMat = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.9,
    flatShading: false,
  })

  const earMat = new THREE.MeshStandardMaterial({
    color: earColor,
    roughness: 0.8,
  })

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.5,
  })

  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: eyeColor,
    roughness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  })

  const guineaPig = new THREE.Group()

  // Body
  const bodyGeo = new THREE.SphereGeometry(1, 32, 32)
  bodyGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.1, 1.0, 1.8))
  const body = new THREE.Mesh(bodyGeo, furMat)
  body.position.y = 1.0
  body.castShadow = true
  body.receiveShadow = true
  guineaPig.add(body)

  // Head
  const headGeo = new THREE.SphereGeometry(0.85, 32, 32)
  headGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.95, 1.2))
  const head = new THREE.Mesh(headGeo, furMat)
  head.position.set(0, 1.0, 1.3)
  head.castShadow = true
  guineaPig.add(head)

  // Ears
  const earGeo = new THREE.SphereGeometry(0.35, 32, 16)
  earGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 0.2))

  const leftEar = new THREE.Mesh(earGeo, earMat)
  leftEar.position.set(0.6, 1.5, 1.1)
  leftEar.rotation.set(0.5, -0.5, -0.5)
  leftEar.castShadow = true
  guineaPig.add(leftEar)

  const rightEar = new THREE.Mesh(earGeo, earMat)
  rightEar.position.set(-0.6, 1.5, 1.1)
  rightEar.rotation.set(0.5, 0.5, 0.5)
  rightEar.castShadow = true
  guineaPig.add(rightEar)

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 32, 32)

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
  leftEye.position.set(0.65, 1.2, 1.7)
  guineaPig.add(leftEye)

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
  rightEye.position.set(-0.65, 1.2, 1.7)
  guineaPig.add(rightEye)

  // Nose/Snout
  const noseGeo = new THREE.SphereGeometry(0.15, 16, 16)
  noseGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.6, 0.5))
  const nose = new THREE.Mesh(noseGeo, skinMat)
  nose.position.set(0, 0.9, 2.35)
  guineaPig.add(nose)

  // Mouth parts
  const mouthPartGeo = new THREE.SphereGeometry(0.1, 16, 16)

  const mouthLeft = new THREE.Mesh(mouthPartGeo, furMat)
  mouthLeft.position.set(0.1, 0.75, 2.25)
  guineaPig.add(mouthLeft)

  const mouthRight = new THREE.Mesh(mouthPartGeo, furMat)
  mouthRight.position.set(-0.1, 0.75, 2.25)
  guineaPig.add(mouthRight)

  // Feet
  const footGeo = new THREE.CapsuleGeometry(0.12, 0.3, 4, 8)
  footGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))

  const flFoot = new THREE.Mesh(footGeo, skinMat)
  flFoot.position.set(0.4, 0.1, 1.5)
  flFoot.castShadow = true
  guineaPig.add(flFoot)

  const frFoot = new THREE.Mesh(footGeo, skinMat)
  frFoot.position.set(-0.4, 0.1, 1.5)
  frFoot.castShadow = true
  guineaPig.add(frFoot)

  const blFoot = new THREE.Mesh(footGeo, skinMat)
  blFoot.position.set(0.5, 0.1, -0.8)
  blFoot.rotation.y = 0.5
  blFoot.castShadow = true
  guineaPig.add(blFoot)

  const brFoot = new THREE.Mesh(footGeo, skinMat)
  brFoot.position.set(-0.5, 0.1, -0.8)
  brFoot.rotation.y = -0.5
  brFoot.castShadow = true
  guineaPig.add(brFoot)

  // Store references for animations
  guineaPig.userData = {
    body,
    head,
    leftEye,
    rightEye,
    nose,
    feet: { flFoot, frFoot, blFoot, brFoot },
  }

  return guineaPig
}
```

---

## 🎭 **Materials**

### **Fur Material**

```typescript
const furMat = new THREE.MeshStandardMaterial({
  color: 0xe8cd9a,
  roughness: 0.9,      // High roughness = matte finish
  flatShading: false,  // Smooth shading
})
```

**Purpose:** Realistic fur appearance with minimal shine

---

### **Eye Material**

```typescript
const eyeMat = new THREE.MeshPhysicalMaterial({
  color: 0x111111,
  roughness: 0.0,           // Very glossy
  clearcoat: 1.0,           // Wet look
  clearcoatRoughness: 0.1,  // Slightly rough clearcoat
})
```

**Purpose:** Glossy, lifelike eyes with wet appearance

---

## 🎬 **Animations**

### **Idle Breathing**

```typescript
function animateBreathing(guineaPig: THREE.Group, time: number) {
  const body = guineaPig.userData.body
  if (body) {
    const breathScale = 1 + Math.sin(time) * 0.005
    body.scale.set(1, breathScale, 1)
  }
}
```

**Usage in animation loop:**
```typescript
let time = 0
function animate() {
  time += 0.05
  guineaPigModels.forEach(gp => animateBreathing(gp, time))
  // ...
}
```

---

### **Blinking**

```typescript
let blinkState = 0  // 0=open, 1=closing, 2=opening
let blinkTimer = Math.random() * 200 + 100

function animateBlinking(guineaPig: THREE.Group) {
  const { leftEye, rightEye } = guineaPig.userData

  if (blinkState === 0) {
    // Wait before next blink
    if (--blinkTimer <= 0) blinkState = 1
  } else if (blinkState === 1) {
    // Closing
    const s = Math.max(0.1, leftEye.scale.y - 0.2)
    leftEye.scale.y = s
    rightEye.scale.y = s
    if (s <= 0.1) blinkState = 2
  } else if (blinkState === 2) {
    // Opening
    const s = Math.min(1.0, leftEye.scale.y + 0.2)
    leftEye.scale.y = s
    rightEye.scale.y = s
    if (s >= 1.0) {
      blinkState = 0
      blinkTimer = Math.random() * 200 + 100
    }
  }
}
```

---

### **Nose Wiggle**

```typescript
function animateNoseWiggle(guineaPig: THREE.Group) {
  const nose = guineaPig.userData.nose
  if (Math.random() > 0.98) {
    nose.position.y = 0.9 + Math.random() * 0.02
  } else {
    nose.position.y = 0.9
  }
}
```

---

## 🔄 **Managing Multiple Guinea Pigs**

### **Model Registry**

```typescript
const guineaPigModels = new Map<string, THREE.Group>()

export function use3DGuineaPigs(worldGroup: THREE.Group) {
  const guineaPigStore = useGuineaPigStore()

  // Create models for active guinea pigs
  watch(
    () => [guineaPigStore.guineaPig1, guineaPigStore.guineaPig2],
    ([gp1, gp2]) => {
      // Add GP1
      if (gp1 && !guineaPigModels.has('gp1')) {
        const model = createGuineaPigModel({
          fur: gp1.appearance.furColor,
        })
        guineaPigModels.set('gp1', model)
        worldGroup.add(model)
      }

      // Add GP2
      if (gp2 && !guineaPigModels.has('gp2')) {
        const model = createGuineaPigModel({
          fur: gp2.appearance.furColor,
        })
        guineaPigModels.set('gp2', model)
        worldGroup.add(model)
      }

      // Remove if guinea pig was removed
      if (!gp1 && guineaPigModels.has('gp1')) {
        worldGroup.remove(guineaPigModels.get('gp1')!)
        guineaPigModels.delete('gp1')
      }
      if (!gp2 && guineaPigModels.has('gp2')) {
        worldGroup.remove(guineaPigModels.get('gp2')!)
        guineaPigModels.delete('gp2')
      }
    },
    { immediate: true }
  )

  return { guineaPigModels }
}
```

---

## 🎨 **Customization by Appearance**

### **Appearance Attributes**

From `guineaPigStore`:
```typescript
interface Appearance {
  furColor: string       // e.g., "brown", "white", "black"
  furPattern: string     // e.g., "solid", "spotted"
  eyeColor: string       // e.g., "brown", "red"
}
```

### **Color Mapping**

```typescript
const FUR_COLOR_MAP: Record<string, number> = {
  brown: 0xe8cd9a,    // Beige/tan
  white: 0xf5f5f5,    // Off-white
  black: 0x2b2b2b,    // Dark gray (not pure black)
  orange: 0xff9966,   // Ginger
  gray: 0x9a9a9a,     // Gray
}

const EYE_COLOR_MAP: Record<string, number> = {
  brown: 0x3b2918,
  red: 0x8b0000,      // Ruby eyes (albino)
  black: 0x111111,
}

function getGuineaPigColors(appearance: Appearance): GuineaPigColors {
  return {
    fur: FUR_COLOR_MAP[appearance.furColor] ?? 0xe8cd9a,
    eye: EYE_COLOR_MAP[appearance.eyeColor] ?? 0x111111,
    ear: 0x3b2918,      // Always dark brown
    skin: 0xffdcd6,     // Always pink
  }
}
```

---

## 📐 **Model Scale & Proportions**

### **Dimensions**

- **Total Height:** ~2 units (including head)
- **Body Length:** ~3.6 units (nose to tail)
- **Body Width:** ~2.2 units
- **Ground Clearance:** 0.1 units (foot height)

### **Proportions**

The model uses realistic guinea pig proportions:
- Body is larger than head (1.8 length vs 1.2)
- Ears are proportionally small
- Eyes positioned on sides of head
- No visible tail (guinea pigs have very short tails)

---

## 🐛 **Troubleshooting**

### **Model Appears Stretched**

**Cause:** Scale transformations not applied correctly

**Solution:** Ensure `applyMatrix4()` is called on geometry, not mesh

---

### **Eyes Not Glossy**

**Cause:** MeshPhysicalMaterial requires good lighting

**Solution:** Ensure directional light is bright enough (intensity 0.8+)

---

### **Shadows Look Blocky**

**Cause:** Shadow map resolution too low

**Solution:** Increase shadow map size to 1024 or 2048

---

## ✅ **Completion Criteria**

- [ ] `createGuineaPigModel()` function implemented
- [ ] All body parts rendered correctly
- [ ] Materials applied (fur, eyes, skin)
- [ ] Shadows cast and received
- [ ] Multiple guinea pigs supported
- [ ] Idle breathing animation working
- [ ] Blinking animation working
- [ ] Nose wiggle animation working
- [ ] Model scales correctly with appearance data

---

## 🔗 **Related Documentation**

- [Previous: Coordinate Mapping](coordinate-mapping.md)
- [Next: Camera System →](camera-system.md)
- [Three.js Integration](threejs-integration.md)

---

**Last Updated:** November 29, 2025
