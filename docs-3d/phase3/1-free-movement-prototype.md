# Phase 3: 2D Free Movement Prototype

**Status:** 🚧 In Development
**Priority:** HIGH - Critical for resolving architectural mismatch
**Created:** December 6, 2025
**Goal:** Prototype continuous free movement in 2D to explore replacing grid-based movement

---

## 📋 Overview

After analyzing the limitations of grid-based movement and the success of the HTML demo's free movement system, we need to prototype a continuous movement system that could work in both 2D and 3D views.

This prototype explores:
- **Continuous positioning** instead of discrete grid cells
- **Radius-based collision** instead of rectangular grid blocks
- **Natural physics** for realistic movement and interactions
- **Unified system** that works identically in 2D and 3D

---

## 🎯 Motivation

### Current Problems with Grid-Based Movement

1. **Architectural Mismatch**
   - 2D uses discrete grid cells (14×10)
   - 3D needs smooth, continuous movement
   - Translation between systems is complex and buggy

2. **Limited Interactions**
   - Can't push objects naturally
   - No momentum or physics
   - Movement looks "blocky" and unnatural

3. **Shelter Entry Complexity**
   - Grid-based entrances are cell-specific
   - Doesn't match natural 3D openings
   - Requires complex alignment logic

### HTML Demo Success

The original demo (`src/guinea-pig-sim-demo-backup.html`) demonstrates:
- Guinea pigs move smoothly in any direction
- Natural collision with circular boundaries
- Physics interactions (pushing balls, momentum)
- Intuitive click-to-move controls
- Seamless shelter entry through openings

---

## 🏗️ Technical Architecture

### Core Concepts

```typescript
// Instead of grid positions
interface GridPosition {
  col: number  // Integer 0-13
  row: number  // Integer 0-9
}

// Use continuous positions
interface ContinuousPosition {
  x: number    // Float, pixels or world units
  y: number    // Float, pixels or world units
}

// Add physics properties
interface MovementState {
  position: ContinuousPosition
  velocity: { x: number; y: number }
  rotation: number  // Radians
  speed: number
}
```

### Collision System

```typescript
// Instead of rectangular grid cells
interface GridCollision {
  cells: GridPosition[]
}

// Use radius-based collision
interface CircleCollision {
  center: ContinuousPosition
  radius: number
}
```

### Rendering Approach

**2D Canvas Rendering:**
- HTML5 Canvas for smooth 60 FPS
- Sprite or emoji rendering
- Transform for rotation
- Sub-pixel positioning

**Benefits:**
- Performance: Canvas is faster than DOM manipulation
- Precision: Pixel-perfect positioning
- Effects: Easy to add trails, particles, etc.
- Debugging: Can overlay collision circles, paths

---

## 🚀 Implementation Plan

### Phase 1: Basic Infrastructure

1. **Create Debug Page**
   - New "Prototypes" category in debug menu
   - "2D Free Movement" page
   - Copy layout from 3D habitat view

2. **Canvas Setup**
   - 800×600px canvas (larger than normal 2D)
   - 60 FPS render loop
   - Coordinate system (pixels or world units)

### Phase 2: Movement System

1. **Continuous Positioning**
   ```typescript
   class FreeMovementGuineaPig {
     position: { x: number; y: number }
     velocity: { x: number; y: number }
     rotation: number

     update(deltaTime: number) {
       // Apply velocity
       this.position.x += this.velocity.x * deltaTime
       this.position.y += this.velocity.y * deltaTime

       // Apply friction
       this.velocity.x *= 0.95
       this.velocity.y *= 0.95

       // Rotate towards movement direction
       if (this.velocity.x !== 0 || this.velocity.y !== 0) {
         this.rotation = Math.atan2(this.velocity.y, this.velocity.x)
       }
     }
   }
   ```

2. **Click-to-Move**
   - Calculate path from current position to click
   - Apply force towards target
   - Smooth acceleration/deceleration

### Phase 3: Collision Detection

1. **Circle-to-Circle Collision**
   ```typescript
   function checkCollision(a: Circle, b: Circle): boolean {
     const dx = a.center.x - b.center.x
     const dy = a.center.y - b.center.y
     const distance = Math.sqrt(dx * dx + dy * dy)
     return distance < a.radius + b.radius
   }
   ```

2. **Response**
   - Slide along obstacles
   - Bounce off with physics
   - Push moveable objects

### Phase 4: Item Integration

1. **Define Collision Shapes**
   ```typescript
   const ITEM_COLLISIONS = {
     'habitat_plastic_igloo': {
       circles: [
         { offset: { x: -20, y: 0 }, radius: 15 },
         { offset: { x: 20, y: 0 }, radius: 15 },
         // Gap for entrance
       ]
     },
     'food_bowl': {
       circles: [
         { offset: { x: 0, y: 0 }, radius: 10 }
       ],
       moveable: true  // Can be pushed
     }
   }
   ```

2. **Shelter Mechanics**
   - Natural entry through gaps
   - No special entrance cells
   - Collision circles define walls

### Phase 5: Debug Visualization

1. **Overlay Options**
   - Show collision circles
   - Display velocity vectors
   - Render movement paths
   - Grid reference overlay

2. **Controls**
   - Speed adjustment
   - Toggle physics
   - Reset positions
   - Spawn test obstacles

---

## ⚖️ Comparison with Current Systems

| Feature | Grid-Based | Hybrid | Free Movement |
|---------|------------|--------|---------------|
| **2D Simplicity** | ✅ Simple | ⭐ Moderate | ⭐ Moderate |
| **3D Quality** | ❌ Blocky | ✅ Good | ✅ Excellent |
| **Physics** | ❌ None | ❌ Limited | ✅ Full |
| **Code Unity** | ❌ Separate | ⭐ Partially unified | ✅ Fully unified |
| **Performance** | ✅ Excellent | ✅ Good | ⭐ Good (needs optimization) |
| **User Experience** | ⭐ OK | ✅ Good | ✅ Excellent |

---

## 🎮 User Experience Goals

1. **Natural Movement**
   - Guinea pigs run smoothly
   - Realistic turning and stopping
   - Momentum when changing direction

2. **Intuitive Interactions**
   - Click anywhere to move
   - Push bowls around
   - Enter shelters naturally

3. **Visual Polish**
   - Smooth animations
   - No grid snapping
   - Particle effects possible

---

## 🔬 Prototype Features

### Core Features (Required)
- [ ] Canvas-based 2D habitat
- [ ] Continuous positioning
- [ ] Click-to-move navigation
- [ ] Basic collision detection
- [ ] Guinea pig rotation

### Advanced Features (Stretch Goals)
- [ ] Physics (momentum, friction)
- [ ] Pushable objects
- [ ] Particle effects
- [ ] Multiple guinea pigs
- [ ] Embedded HTML demo comparison

### Debug Features
- [ ] Position/velocity display
- [ ] Collision visualization
- [ ] Path rendering
- [ ] FPS counter
- [ ] Performance metrics

---

## 📊 Success Criteria

1. **Movement Quality**
   - Smooth 60 FPS performance
   - Natural-looking motion
   - Responsive controls

2. **Collision Accuracy**
   - No walking through walls
   - Natural sliding along obstacles
   - Proper shelter entry

3. **Code Quality**
   - Clean separation from main game
   - Well-documented
   - Easily portable to production

4. **User Feedback**
   - Feels more natural than grid
   - Fun to interact with
   - Clear improvement over current system

---

## 🚧 Migration Path

If prototype is successful:

1. **Phase 1: Parallel Systems**
   - Keep grid for game logic
   - Add free movement for display
   - Toggle between modes

2. **Phase 2: Gradual Migration**
   - Convert behavior system to continuous
   - Update pathfinding algorithms
   - Migrate save/load format

3. **Phase 3: Full Integration**
   - Remove grid dependencies
   - Unify 2D/3D positioning
   - Add physics everywhere

---

## 🔗 References

- [HTML Demo](../../src/guinea-pig-sim-demo-backup.html) - Original free movement implementation
- [Hybrid Pathfinding System](./hybrid-pathfinding-system.md) - Current compromise approach
- [Original Grid Approach (Deferred)](./pathfinding-and-collision-DEFERRED.md) - Why grid doesn't work

---

## 📝 Notes

This prototype is exploratory. We're testing whether free movement can solve our architectural problems while maintaining or improving the user experience.

Key questions to answer:
1. Does free movement feel better than grid?
2. Can we achieve good performance with many guinea pigs?
3. Is the added complexity worth the benefits?
4. How difficult would migration be?

---

**Last Updated:** December 6, 2025