# Phase 1: Coordinate Mapping System

> **Navigation:** [← Back to Development Phases](../DEVELOPMENT_PHASES.md) | [Project Plan](../PROJECT_PLAN.md)

---

## 📋 **Overview**

This document details the conversion system between the 2D grid-based positioning (used by the game stores) and 3D world coordinates (used by Three.js).

---

## 🎯 **Goals**

1. Map 14x10 grid cells to 3D Vector3 positions
2. Handle center-origin vs corner-origin coordinate systems
3. Support sub-grid offsets for visual separation
4. Sync positions in real-time from Pinia stores

---

## 📐 **Coordinate Systems**

### **2D Grid System (Game State)**

**Structure:**
- 14 columns × 10 rows (medium habitat)
- Origin: Top-left corner (0, 0)
- Column range: 0-13 (left to right)
- Row range: 0-9 (top to bottom)
- Storage: `{ col: number, row: number }`

**Example Positions:**
```typescript
{ col: 0, row: 0 }    // Top-left
{ col: 7, row: 5 }    // Center
{ col: 13, row: 9 }   // Bottom-right
```

---

### **3D World System (Three.js)**

**Structure:**
- Vector3 coordinates (x, y, z)
- Origin: Center of habitat (0, 0, 0)
- X-axis: Left (-) to Right (+)
- Y-axis: Down (-) to Up (+)
- Z-axis: Back (-) to Front (+)

**Coordinate Ranges:**
- X: -7 to +7 (14 units wide)
- Y: 0 (ground level)
- Z: -5 to +5 (10 units deep)

---

## 🔄 **Conversion Algorithm**

### **Grid to World (Basic)**

```typescript
/**
 * Convert 2D grid position to 3D world coordinates
 */
function gridToWorld(col: number, row: number): THREE.Vector3 {
  const GRID_COLS = 14
  const GRID_ROWS = 10
  const CELL_SIZE = 1.0  // 1 unit per grid cell

  // Center the grid (col 7, row 5 → world 0, 0)
  const worldX = (col - GRID_COLS / 2) * CELL_SIZE
  const worldZ = (row - GRID_ROWS / 2) * CELL_SIZE
  const worldY = 0  // Ground level

  return new THREE.Vector3(worldX, worldY, worldZ)
}
```

**Examples:**
```typescript
gridToWorld(0, 0)     // → (-7, 0, -5)  Top-left
gridToWorld(7, 5)     // → (0, 0, 0)    Center
gridToWorld(13, 9)    // → (6, 0, 4)    Bottom-right
```

---

### **Grid to World (With Offsets)**

The 2D game uses pixel offsets for visual separation when multiple guinea pigs share a cell. These need to be converted to 3D offsets.

```typescript
interface Position2D {
  col: number
  row: number
  offsetX?: number  // Pixel offset (0-64)
  offsetY?: number  // Pixel offset (0-64)
}

function gridToWorldWithOffset(pos: Position2D): THREE.Vector3 {
  const GRID_COLS = 14
  const GRID_ROWS = 10
  const CELL_SIZE = 1.0
  const PIXELS_PER_CELL = 64  // 2D sprite size

  // Base world position
  const worldX = (pos.col - GRID_COLS / 2) * CELL_SIZE
  const worldZ = (pos.row - GRID_ROWS / 2) * CELL_SIZE

  // Convert pixel offsets to world offsets
  const offsetX = (pos.offsetX || 0) / PIXELS_PER_CELL * CELL_SIZE
  const offsetZ = (pos.offsetY || 0) / PIXELS_PER_CELL * CELL_SIZE

  return new THREE.Vector3(
    worldX + offsetX,
    0,
    worldZ + offsetZ
  )
}
```

**Example:**
```typescript
// Guinea pig at cell (5, 3) with offset (12, 8)
gridToWorldWithOffset({ col: 5, row: 3, offsetX: 12, offsetY: 8 })
// → Base: (-2, 0, -2)
// → Offset: (0.1875, 0, 0.125)
// → Final: (-1.8125, 0, -1.875)
```

---

## 🔁 **Real-Time Synchronization**

### **Watch Guinea Pig Positions**

```typescript
import { watch } from 'vue'
import { useHabitatConditionsStore } from '@/stores/habitatConditions'

export function use3DSync(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditionsStore()

  // Watch guinea pig positions
  watch(
    () => habitatConditions.guineaPigPositions,
    (positions) => {
      positions.forEach((pos, guineaPigId) => {
        const worldPos = gridToWorldWithOffset(pos)

        // Update 3D model position
        const model = guineaPigModels.get(guineaPigId)
        if (model) {
          model.position.copy(worldPos)
        }
      })
    },
    { deep: true }
  )
}
```

---

## 📦 **Item Positioning**

### **Item Anchor Points**

Items in the 2D game have anchor positions (grid cell) and sizes (small/medium/large).

```typescript
interface ItemPosition {
  col: number
  row: number
  size: 'small' | 'medium' | 'large'
  rotation?: number  // 0, 90, 180, 270 degrees
}

function itemToWorld(itemPos: ItemPosition): THREE.Vector3 {
  // Items are centered in their grid cell
  const worldPos = gridToWorld(itemPos.col, itemPos.row)

  // Adjust for item size offset if needed
  // (Most items are centered, but some may need adjustment)

  return worldPos
}
```

**Item Size Reference:**
- **Small:** 1x1 cell (toys, chew sticks)
- **Medium:** 2x2 cells (bowls, shelters)
- **Large:** 3x3 cells (large shelters)

---

## 🗺️ **Poop Positioning**

Poop uses sub-grid coordinates for precise placement.

```typescript
interface PoopPosition {
  col: number
  row: number
  subCol: number  // 0-9 (10 subdivisions per cell)
  subRow: number  // 0-9
}

function poopToWorld(poopPos: PoopPosition): THREE.Vector3 {
  const GRID_COLS = 14
  const GRID_ROWS = 10
  const CELL_SIZE = 1.0
  const SUB_DIVISIONS = 10

  const worldX = (poopPos.col - GRID_COLS / 2) * CELL_SIZE
                 + (poopPos.subCol / SUB_DIVISIONS) * CELL_SIZE
  const worldZ = (poopPos.row - GRID_ROWS / 2) * CELL_SIZE
                 + (poopPos.subRow / SUB_DIVISIONS) * CELL_SIZE

  return new THREE.Vector3(worldX, 0.09, worldZ)  // Y=0.09 to sit on floor
}
```

---

## 🎨 **World Boundaries**

### **Habitat Bounds**

```typescript
const WORLD_BOUNDS = {
  minX: -7,   // Left edge
  maxX: 7,    // Right edge (actually 6 for 14 cells)
  minZ: -5,   // Back edge
  maxZ: 5,    // Front edge (actually 4 for 10 cells)
  floor: 0,   // Ground level
}
```

### **Floor Size**

```typescript
const floorGeo = new THREE.PlaneGeometry(14, 10)  // Match grid size
floor.rotation.x = -Math.PI / 2  // Rotate to horizontal
floor.position.set(0, 0, 0)      // Center at origin
```

---

## 🧪 **Testing Coordinates**

### **Visual Grid Overlay**

For debugging, add a grid helper to visualize the coordinate system:

```typescript
function addGridHelper(scene: THREE.Scene) {
  const gridHelper = new THREE.GridHelper(
    10,     // Size (10 units = 10 rows)
    10,     // Divisions (10 cells)
    0x444444,  // Center line color
    0x888888   // Grid line color
  )
  gridHelper.rotation.x = Math.PI / 2  // Rotate to match floor
  scene.add(gridHelper)
}
```

### **Position Markers**

Add sphere markers at key positions to verify mapping:

```typescript
function addPositionMarker(scene: THREE.Scene, col: number, row: number, color: number) {
  const worldPos = gridToWorld(col, row)
  const markerGeo = new THREE.SphereGeometry(0.2)
  const markerMat = new THREE.MeshBasicMaterial({ color })
  const marker = new THREE.Mesh(markerGeo, markerMat)
  marker.position.copy(worldPos)
  scene.add(marker)
}

// Test corners
addPositionMarker(scene, 0, 0, 0xff0000)     // Red: top-left
addPositionMarker(scene, 13, 0, 0x00ff00)    // Green: top-right
addPositionMarker(scene, 0, 9, 0x0000ff)     // Blue: bottom-left
addPositionMarker(scene, 13, 9, 0xffff00)    // Yellow: bottom-right
addPositionMarker(scene, 7, 5, 0xff00ff)     // Magenta: center
```

---

## 🔍 **Debugging Tips**

### **Log Coordinate Conversions**

```typescript
console.log('Grid (7, 5) →', gridToWorld(7, 5))  // Should be (0, 0, 0)
console.log('Grid (0, 0) →', gridToWorld(0, 0))  // Should be (-7, 0, -5)
```

### **Check Guinea Pig Positions**

```typescript
watch(
  () => habitatConditions.guineaPigPositions,
  (positions) => {
    positions.forEach((pos, id) => {
      console.log(`GP ${id}:`, pos, '→', gridToWorldWithOffset(pos))
    })
  },
  { deep: true }
)
```

---

## 📊 **Implementation Checklist**

- [ ] `gridToWorld()` function implemented
- [ ] `gridToWorldWithOffset()` function supports pixel offsets
- [ ] `itemToWorld()` function converts item positions
- [ ] `poopToWorld()` function supports sub-grid positions
- [ ] Real-time position sync with `watch()`
- [ ] World boundaries defined
- [ ] Grid helper added for debugging
- [ ] Position markers verify corner coordinates
- [ ] Guinea pig positions update in 3D when 2D changes

---

## 🔗 **Related Documentation**

- [Previous: Three.js Integration](threejs-integration.md)
- [Next: Guinea Pig Model →](guinea-pig-model.md)
- [Camera System](camera-system.md)

---

**Last Updated:** November 29, 2025
