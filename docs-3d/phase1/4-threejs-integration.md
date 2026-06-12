# Phase 1: Three.js Integration

> **Navigation:** [← Back to Development Phases](../DEVELOPMENT_PHASES.md) | [Project Plan](../PROJECT_PLAN.md)

---

## 📋 **Overview**

This document details the integration of Three.js with Vue 3 for the GPS2 3D environment system.

---

## 🎯 **Goals**

1. Install Three.js via npm
2. Create reusable composable for scene management
3. Set up renderer with proper canvas handling
4. Configure lighting and shadows
5. Implement animation loop with Vue 3 lifecycle

---

## 📦 **Installation**

### **Package Installation**

```bash
npm install three
```

### **TypeScript Types**

Three.js includes TypeScript definitions, so no additional `@types` package is needed.

---

## 🏗️ **Architecture**

### **File Structure**

```
src/composables/
└── use3DScene.ts  ← Main scene composable
```

### **Composable Design**

The `use3DScene` composable provides:
- Scene instance
- Camera instance
- Renderer instance
- Lighting setup
- Resize handling
- Animation loop management

---

## 📝 **Implementation**

### **use3DScene.ts**

```typescript
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as THREE from 'three'

export function use3DScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB) // Light Sky Blue
  scene.fog = new THREE.Fog(0x87CEEB, 20, 60) // Matching fog

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45, // FOV
    window.innerWidth / window.innerHeight, // Aspect
    0.1, // Near
    1000 // Far
  )
  camera.position.set(4, 3, 8)
  camera.lookAt(4, 0, 0)

  // Renderer
  let renderer: THREE.WebGLRenderer | null = null

  // World Group (for rotation)
  const worldGroup = new THREE.Group()
  scene.add(worldGroup)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 10, 7)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)

  const backLight = new THREE.DirectionalLight(0xccccff, 0.4)
  backLight.position.set(-5, 5, -5)
  scene.add(backLight)

  // Initialize renderer
  function initRenderer() {
    if (!canvasRef.value) return

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true
  }

  // Handle window resize
  function handleResize() {
    if (!renderer) return

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // Animation loop
  let animationId: number | null = null
  function animate() {
    animationId = requestAnimationFrame(animate)
    if (renderer) {
      renderer.render(scene, camera)
    }
  }

  // Lifecycle
  onMounted(() => {
    initRenderer()
    window.addEventListener('resize', handleResize)
    animate()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
    if (renderer) {
      renderer.dispose()
    }
  })

  return {
    scene,
    camera,
    renderer: () => renderer,
    worldGroup,
  }
}
```

---

## 🎨 **Scene Configuration**

### **Background & Fog**

```typescript
scene.background = new THREE.Color(0x87CEEB) // Light Sky Blue
scene.fog = new THREE.Fog(0x87CEEB, 20, 60)  // Fog starts at 20 units, fully opaque at 60
```

**Purpose:** Creates sky-like atmosphere matching the demo

---

### **Camera Setup**

```typescript
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
camera.position.set(4, 3, 8)  // Angled view
camera.lookAt(4, 0, 0)         // Look at habitat center
```

**Parameters:**
- **FOV:** 45° (natural perspective, not too wide or narrow)
- **Aspect:** Window width/height (updated on resize)
- **Near/Far:** 0.1 to 1000 (clipping planes)
- **Position:** Elevated and offset for angled view

---

### **Lighting System**

#### **Ambient Light**
```typescript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
```
**Purpose:** Provides base illumination to prevent pure black shadows

#### **Directional Light (Main)**
```typescript
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
dirLight.position.set(5, 10, 7)
dirLight.castShadow = true
```
**Purpose:** Main light source, casts shadows like sunlight

#### **Directional Light (Back)**
```typescript
const backLight = new THREE.DirectionalLight(0xccccff, 0.4)
backLight.position.set(-5, 5, -5)
```
**Purpose:** Rim lighting to separate objects from background

---

### **Shadow Configuration**

```typescript
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap  // Soft shadows
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
```

**Shadow Map Types:**
- `BasicShadowMap` - Hard edges, fastest
- `PCFShadowMap` - Soft edges, good performance
- `PCFSoftShadowMap` - Softer edges, moderate cost ✅ (Used)
- `VSMShadowMap` - Very soft, expensive

---

## 🔄 **Animation Loop**

### **Implementation**

```typescript
let animationId: number | null = null

function animate() {
  animationId = requestAnimationFrame(animate)
  if (renderer) {
    renderer.render(scene, camera)
  }
}
```

### **Lifecycle Integration**

```typescript
onMounted(() => {
  initRenderer()
  window.addEventListener('resize', handleResize)
  animate() // Start loop
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId !== null) {
    cancelAnimationFrame(animationId)  // Stop loop
  }
  if (renderer) {
    renderer.dispose()  // Clean up WebGL resources
  }
})
```

**Purpose:** Ensures proper cleanup when component unmounts (prevents memory leaks)

---

## 📐 **World Group**

### **Purpose**

The `worldGroup` is a container for all 3D objects that should rotate together when the user drags the camera.

```typescript
const worldGroup = new THREE.Group()
scene.add(worldGroup)

// Add objects to worldGroup instead of scene
worldGroup.add(guineaPig)
worldGroup.add(floor)
worldGroup.add(items)
```

### **Rotation**

When user drags mouse:
```typescript
worldGroup.rotation.y += deltaX * 0.01
```

This rotates the entire habitat while keeping the camera fixed.

---

## 🎮 **Usage in Vue Component**

### **Habitat3DDebug.vue**

```vue
<template>
  <div class="habitat-3d">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { use3DScene } from '@/composables/use3DScene'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const { scene, camera, worldGroup } = use3DScene(canvasRef)

// Add objects to worldGroup...
</script>

<style>
.habitat-3d {
  width: 100%;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
```

---

## 🐛 **Troubleshooting**

### **Black Screen**

**Cause:** Renderer not initialized or camera not positioned correctly

**Solution:**
1. Check that `canvasRef.value` is not null when `initRenderer()` is called
2. Verify camera position is not inside objects
3. Ensure lighting is added to scene

---

### **No Shadows**

**Cause:** Shadow settings not enabled

**Solution:**
1. Enable `renderer.shadowMap.enabled = true`
2. Set `dirLight.castShadow = true`
3. Set `mesh.castShadow = true` on objects
4. Set `mesh.receiveShadow = true` on ground plane

---

### **Performance Issues**

**Cause:** Shadow map resolution too high or too many lights

**Solution:**
1. Reduce shadow map size (1024 → 512)
2. Disable shadows on small objects
3. Use fewer lights
4. Reduce geometry complexity

---

## ✅ **Completion Criteria**

- [ ] Three.js installed via npm
- [ ] `use3DScene.ts` composable created
- [ ] Scene, camera, renderer initialized
- [ ] Lighting configured (ambient + 2 directional)
- [ ] Shadows enabled and working
- [ ] Animation loop running
- [ ] Window resize handled correctly
- [ ] Proper cleanup on unmount

---

## 🔗 **Related Documentation**

- [Next: Coordinate Mapping →](coordinate-mapping.md)
- [Camera System](camera-system.md)
- [Guinea Pig Model](guinea-pig-model.md)

---

**Last Updated:** November 29, 2025
