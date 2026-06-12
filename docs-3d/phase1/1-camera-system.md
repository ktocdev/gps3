# Phase 1: Camera System

> **Navigation:** [← Back to Development Phases](../DEVELOPMENT_PHASES.md) | [Project Plan](../PROJECT_PLAN.md)

---

## 📋 **Overview**

This document details the camera control system for the 3D habitat view, based on the demo's orbit-style controls.

---

## 🎯 **Goals**

1. Perspective camera positioned at an angle
2. Mouse drag to rotate world
3. Scroll/touch to zoom
4. Arrow keys to pan camera
5. Touch support for mobile devices

---

## 📷 **Camera Configuration**

### **Perspective Camera**

```typescript
const camera = new THREE.PerspectiveCamera(
  45,                                    // FOV (field of view)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1,                                   // Near clipping plane
  1000                                   // Far clipping plane
)

// Position camera at an angle
camera.position.set(4, 3, 8)

// Look at habitat center
camera.lookAt(4, 0, 0)
```

### **Camera Parameters**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **FOV** | 45° | Natural perspective (not too wide or narrow) |
| **Near** | 0.1 | Objects closer than this won't render |
| **Far** | 1000 | Objects farther than this won't render |
| **Position** | (4, 3, 8) | Elevated and offset for angled view |
| **LookAt** | (4, 0, 0) | Points toward habitat center |

---

## 🎮 **Control Scheme**

### **Mouse Controls**

| Action | Input | Behavior |
|--------|-------|----------|
| **Rotate** | Drag | Rotate world on Y-axis |
| **Zoom** | Scroll | Move camera up/down (Y position) |
| **Pan** | Arrow Keys | Move camera position (X, Z) |
| **Vertical** | Z/X Keys | Move camera up/down |

### **Touch Controls**

| Action | Input | Behavior |
|--------|-------|----------|
| **Rotate** | Single finger drag | Rotate world on Y-axis |
| **Zoom** | Pinch (optional) | Move camera up/down |

---

## 🏗️ **Implementation**

### **use3DCamera.ts**

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import type * as THREE from 'three'

export interface CameraControls {
  isDragging: boolean
  previousMousePosition: { x: number; y: number }
  keysPressed: Record<string, boolean>
}

export function use3DCamera(
  camera: THREE.PerspectiveCamera,
  worldGroup: THREE.Group,
  canvasElement: HTMLCanvasElement | null
) {
  const controls = ref<CameraControls>({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    keysPressed: {},
  })

  // Mouse Rotation
  function handleMouseDown(e: MouseEvent) {
    controls.value.isDragging = true
    controls.value.previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!controls.value.isDragging) return

    const deltaMove = {
      x: e.offsetX - controls.value.previousMousePosition.x,
      y: e.offsetY - controls.value.previousMousePosition.y,
    }

    // Rotate world on Y-axis
    worldGroup.rotation.y += deltaMove.x * 0.01

    controls.value.previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseUp() {
    controls.value.isDragging = false
  }

  // Scroll Zoom
  function handleWheel(e: WheelEvent) {
    camera.position.y += e.deltaY * 0.01
    camera.position.y = Math.max(0.5, Math.min(20, camera.position.y))
  }

  // Keyboard Controls
  function handleKeyDown(e: KeyboardEvent) {
    controls.value.keysPressed[e.key.toLowerCase()] = true
    controls.value.keysPressed[e.code] = true
  }

  function handleKeyUp(e: KeyboardEvent) {
    controls.value.keysPressed[e.key.toLowerCase()] = false
    controls.value.keysPressed[e.code] = false
  }

  // Touch Controls
  function handleTouchStart(e: TouchEvent) {
    controls.value.isDragging = true
    controls.value.previousMousePosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!controls.value.isDragging) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY

    worldGroup.rotation.y +=
      (currentX - controls.value.previousMousePosition.x) * 0.01

    controls.value.previousMousePosition = { x: currentX, y: currentY }
  }

  function handleTouchEnd() {
    controls.value.isDragging = false
  }

  // Update camera position based on keyboard input
  function updateCameraPosition() {
    const panSpeed = 0.15
    const verticalSpeed = 0.1

    if (controls.value.keysPressed['arrowleft']) camera.position.x -= panSpeed
    if (controls.value.keysPressed['arrowright']) camera.position.x += panSpeed
    if (controls.value.keysPressed['arrowup']) camera.position.z -= panSpeed
    if (controls.value.keysPressed['arrowdown']) camera.position.z += panSpeed
    if (controls.value.keysPressed['z']) camera.position.y += verticalSpeed
    if (controls.value.keysPressed['x']) camera.position.y -= verticalSpeed

    // Alternate rotation keys
    if (controls.value.keysPressed[','] || controls.value.keysPressed['<']) {
      worldGroup.rotation.y -= 0.03
    }
    if (controls.value.keysPressed['.'] || controls.value.keysPressed['>']) {
      worldGroup.rotation.y += 0.03
    }

    // Clamp camera height
    camera.position.y = Math.max(0.5, Math.min(20, camera.position.y))

    // Update camera look-at with tilt
    const tiltOffset = 5 + camera.position.y * 0.5
    camera.lookAt(camera.position.x, 2.0, camera.position.z - tiltOffset)
  }

  // Lifecycle
  onMounted(() => {
    if (!canvasElement) return

    // Mouse events
    canvasElement.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Scroll
    canvasElement.addEventListener('wheel', handleWheel)

    // Keyboard
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Touch
    canvasElement.addEventListener('touchstart', handleTouchStart)
    canvasElement.addEventListener('touchmove', handleTouchMove)
    canvasElement.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    if (!canvasElement) return

    // Cleanup all event listeners
    canvasElement.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    canvasElement.removeEventListener('wheel', handleWheel)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    canvasElement.removeEventListener('touchstart', handleTouchStart)
    canvasElement.removeEventListener('touchmove', handleTouchMove)
    canvasElement.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    controls,
    updateCameraPosition,
  }
}
```

---

## 🔄 **Animation Loop Integration**

### **Update Camera Each Frame**

```typescript
import { use3DCamera } from '@/composables/use3DCamera'

const { updateCameraPosition } = use3DCamera(camera, worldGroup, canvasRef.value)

function animate() {
  requestAnimationFrame(animate)

  // Update camera position based on keyboard input
  updateCameraPosition()

  // Render scene
  if (renderer) {
    renderer.render(scene, camera)
  }
}
```

---

## 🎯 **Camera Behaviors**

### **Orbit Rotation (Drag)**

**How it works:**
- Track mouse position on drag start
- Calculate delta movement on mouse move
- Rotate `worldGroup` (not camera) on Y-axis
- World rotates around its center while camera stays fixed

**Why rotate world instead of camera?**
- Simpler math (no need to orbit camera around point)
- Consistent lighting (lights stay with world)
- Easier to implement with keyboard rotation

---

### **Zoom (Scroll)**

**How it works:**
- Adjust camera Y position (height)
- Higher = zoomed out, lower = zoomed in
- Clamped between 0.5 and 20 units

**Alternative zoom methods:**
- Move camera forward/back along look direction
- Adjust camera FOV (perspective distortion)

---

### **Pan (Arrow Keys)**

**How it works:**
- Move camera position on X and Z axes
- Camera looks at adjusted position + tilt offset
- Allows viewing different areas of habitat

**Tilt offset:**
```typescript
const tiltOffset = 5 + camera.position.y * 0.5
camera.lookAt(camera.position.x, 2.0, camera.position.z - tiltOffset)
```
This keeps the camera angled downward as it moves.

---

## 📱 **Mobile Touch Support**

### **Touch Rotation**

Single finger drag rotates the world (same as mouse drag).

### **Pinch Zoom (Future)**

For Phase 2 or 3, add pinch-to-zoom:

```typescript
let touchDistance = 0

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    // Pinch zoom
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (touchDistance > 0) {
      const delta = distance - touchDistance
      camera.position.y -= delta * 0.01
      camera.position.y = Math.max(0.5, Math.min(20, camera.position.y))
    }

    touchDistance = distance
  } else if (e.touches.length === 1) {
    // Single finger rotation (existing code)
    // ...
  }
}

function handleTouchEnd() {
  touchDistance = 0
  controls.value.isDragging = false
}
```

---

## 🎨 **Camera Presets**

### **Predefined Views**

```typescript
export interface CameraPreset {
  position: THREE.Vector3
  lookAt: THREE.Vector3
  rotation: number // worldGroup rotation
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  default: {
    position: new THREE.Vector3(4, 3, 8),
    lookAt: new THREE.Vector3(4, 0, 0),
    rotation: 0,
  },
  topDown: {
    position: new THREE.Vector3(0, 15, 0),
    lookAt: new THREE.Vector3(0, 0, 0),
    rotation: 0,
  },
  front: {
    position: new THREE.Vector3(0, 3, 12),
    lookAt: new THREE.Vector3(0, 0, 0),
    rotation: 0,
  },
  side: {
    position: new THREE.Vector3(12, 3, 0),
    lookAt: new THREE.Vector3(0, 0, 0),
    rotation: 0,
  },
}

export function applyCameraPreset(
  camera: THREE.PerspectiveCamera,
  worldGroup: THREE.Group,
  preset: CameraPreset
) {
  camera.position.copy(preset.position)
  camera.lookAt(preset.lookAt)
  worldGroup.rotation.y = preset.rotation
}
```

---

## 🐛 **Troubleshooting**

### **Camera Rotation Feels Backwards**

**Cause:** Rotation direction is inverted

**Solution:** Negate the delta:
```typescript
worldGroup.rotation.y -= deltaMove.x * 0.01  // Instead of +=
```

---

### **Camera Moves Too Fast**

**Cause:** Pan/zoom speed multipliers too high

**Solution:** Reduce multipliers:
```typescript
const panSpeed = 0.05      // Instead of 0.15
const verticalSpeed = 0.03  // Instead of 0.1
```

---

### **Touch Controls Not Working**

**Cause:** Event listeners not attached to canvas

**Solution:** Ensure `canvasElement` is not null when attaching listeners

---

## ✅ **Completion Criteria**

- [ ] Camera positioned at angle (4, 3, 8)
- [ ] Mouse drag rotates world on Y-axis
- [ ] Scroll wheel zooms camera (adjusts Y position)
- [ ] Arrow keys pan camera position
- [ ] Z/X keys move camera vertically
- [ ] < > keys rotate world (alternate method)
- [ ] Touch drag rotates world on mobile
- [ ] Camera height clamped (0.5 to 20)
- [ ] Camera tilt adjusts with movement
- [ ] All event listeners cleaned up on unmount

---

## 🔗 **Related Documentation**

- [Previous: Guinea Pig Model](guinea-pig-model.md)
- [Three.js Integration](threejs-integration.md)
- [Coordinate Mapping](coordinate-mapping.md)

---

**Last Updated:** November 29, 2025
