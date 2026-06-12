# Phase 2 Item Models Implementation

## Overview
Enhancement of 3D item models to match demo quality with procedural textures, organic geometry, and dynamic content rendering.

**Status:** ✅ Complete
**Date:** 2025-11-30

## Implementation Summary

### New Files Created

#### [src/composables/use3DTextures.ts](../../src/composables/use3DTextures.ts)
Reusable texture and geometry manipulation utilities.

**Functions:**
- `createWoodTexture()`: 512x512 canvas-based procedural wood grain texture
  - Base burlywood color (#DEB887)
  - 100 wavy vertical grain lines with sinusoidal drift
  - 5000 noise pixels for variation
  - Returns THREE.CanvasTexture with RepeatWrapping

- `displaceVertices(geometry, magnitude, twist)`: Organic vertex displacement
  - Uses displacement map to keep shared vertices consistent
  - Optional twist effect for natural bends
  - Recomputes normals after modification

### Constants Added

#### [src/constants/3d.ts](../../src/constants/3d.ts)
Added `ITEM_CONFIG` object with:
- **HAY**: 250 upright + 250 flat instances (reduced from 5000), wider strands (0.08), color palette
- **WOOD_TEXTURE_SIZE**: 512px
- **FOOD_POSITION**: Single centered, left/right split positions for bowl contents

### Enhanced Models

#### 1. Shelter/Igloo ([use3DItems.ts:96-175](../../src/composables/use3DItems.ts#L96-L175))
**Enhancements:**
- High-res spherical dome (128x64 segments)
- Circular entrance cutout via triangle filtering
  - Filters triangles where `cZ > 2.0 && (cX² + cY²) < 1.7²`
  - Creates smooth circular opening
- Entrance tunnel (cylindrical extrusion)
  - 1.8 radius, 1.92 depth
  - Positioned at dome opening
- Floor clipping plane for ground integration

**Scaling:** All dimensions 2x from demo

#### 2. Water Bottle ([use3DItems.ts:177-260](../../src/composables/use3DItems.ts#L177-L260))
**Multi-part structure:**
- **Bottle container**: Transparent cylinder (radius 1.0, height 3.2)
  - MeshPhysicalMaterial with transparency 0.3
- **Water inside**: Light blue with glow effect
  - Emissive color #4da6ff, intensity 0.2
  - Opacity 0.8
- **Green bracket**: Cylindrical mount at base
- **Metal nozzle**: Horizontal cone (rotated 90°)
  - Gray metallic material

**Scaling:** All dimensions 2x from demo

#### 3. Wooden Stick ([use3DItems.ts:262-329](../../src/composables/use3DItems.ts#L262-L329))
**Natural wood appearance:**
- Procedural wood texture with bump mapping
- Vertex displacement (magnitude 0.06, twist 0.1)
- Branch knob detail
  - Displaced cylinder geometry
  - Positioned at 36% height
  - Angled 17° from horizontal
- Wood end caps with radial texture mapping

**Scaling:** All dimensions 2x from demo

#### 4. Twig Ball ([use3DItems.ts:331-360](../../src/composables/use3DItems.ts#L331-L360))
**Woven structure:**
- 12 interlocking torus rings
  - Radius 1.6, tube 0.12
  - Random rotations for natural weave
- Peru/tan color (#CD853F)
- Completely matte finish (roughness 1.0)

**Scaling:** All dimensions 2x from demo

### New Models

#### 5. Hay Pile ([use3DItems.ts:362-459](../../src/composables/use3DItems.ts#L362-L459))
**Simplified design (500 total instances):**
- **250 upright strands**: BoxGeometry with pivot at bottom
  - Width 0.08 (wider like thin tape)
  - Random rotation for bends: ±0.5 tilt, ±0.3 lean
  - Length variation: 50-100%
  - Circular distribution radius 1.25
- **250 flat strands**: Wider boxes (0.08 × 1.25)
  - Near horizontal (π/2 ± 0.4)
  - Height variation 0.1-1.3
  - Slightly larger distribution radius 1.35
- 5 hay colors from palette (lightyellow, moccasin, goldenrod, etc.)

**Scaling:** All dimensions 2x from demo

#### 6. Cucumber Slice ([use3DItems.ts:461-502](../../src/composables/use3DItems.ts#L461-L502))
**Half-cylinder structure:**
- Curved surface: Dark green skin (#1b5e20)
- Flat surface: Light mint flesh (#DFF7DF)
- Cut surface detail (flat box geometry)
- Rotated for proper orientation

**Scaling:** All dimensions 2x from demo

#### 7. Wooden Archway Tunnel ([use3DItems.ts:504-576](../../src/composables/use3DItems.ts#L504-L576))
**Extruded arch shape:**
- Outer arc radius 4.0, inner arc 3.2
- Arch height 3.0 (from base to peak)
- Depth 8.0 with bevel details
- Procedural wood texture on sides
- Wood end caps with bump mapping
- Positioned at Y=3.5 (elevated)

**Purpose:** Purchasable tunnel item (not starter)
**Scaling:** All dimensions 2x from demo

### Dynamic Bowl System

#### Enhanced Bowl Model ([use3DItems.ts:22-94](../../src/composables/use3DItems.ts#L22-L94))
**Features:**
- Accepts `bowlItemId` parameter
- Queries `habitatConditions.getBowlContents(bowlItemId)`
- Dynamically renders contents based on FoodItem array

**Rendering Logic:**
- **Empty**: Just bowl + base
- **Hay only**: Scaled hay pile (80%) at Y=0.6
- **1 Food**: Single cucumber slice centered
- **2 Foods**: Two slices split left/right (±0.8 X offset)
- **Hay + Food**: Hay pile at bottom, food on top

**Bowl Contents Watcher** ([use3DItems.ts:619-646](../../src/composables/use3DItems.ts#L619-L646)):
- Watches `habitatConditions.bowlContents` Map for changes
- Re-renders affected bowl models reactively
- Disposes old model, creates new with updated contents
- Maintains position during re-render

### Item Mapping Updates

#### createGenericItemModel ([use3DItems.ts:578-597](../../src/composables/use3DItems.ts#L578-L597))
**Added mappings:**
- Bowl: Passes `itemId` to `createBowlModel(itemId)` for content lookup
- Tunnel: `includes('tunnel') && includes('archway')` → `createWoodenTunnelModel()`

## Technical Details

### Performance Optimizations
- Reduced hay instances from 5000 → 500 (10x reduction)
- InstancedMesh for hay strands (single draw call per type)
- Texture caching via THREE.CanvasTexture
- Displacement map prevents vertex duplication

### Material Properties
- **Wood**: Roughness 0.9, bump mapping for depth
- **Hay**: Roughness 1.0 (completely matte), DoubleSide rendering
- **Water**: Physical material with transparency + emissive glow
- **Food**: Standard materials with appropriate roughness values

### Integration with 2D Game
- Bowl contents sourced from `habitatConditions.bowlContents` Map
- FoodItem interface: `{ itemId, emoji, name, freshness, addedAt }`
- Reactive watcher ensures 3D updates when 2D state changes
- Hay identified by `itemId === 'hay'`, all others treated as food

## Testing Checklist

- [x] All models compile without TypeScript errors
- [x] Build succeeds (`npm run build`)
- [ ] Shelter entrance cutout renders correctly
- [ ] Water bottle transparency and glow visible
- [ ] Wooden stick texture and knob detail present
- [ ] Twig ball shows woven appearance
- [ ] Hay pile looks full but comfortable (500 instances)
- [ ] Cucumber slices render in bowls
- [ ] Bowl contents update reactively when food added/removed
- [ ] Wooden archway tunnel renders for purchasable items

## Future Enhancements

### Not Implemented (Pending User Input)
- **Hay Rack**: Starter item requiring reference image from user
  - Separate modeling task after image provided
  - Will be "ladder box" style design

### Potential Improvements
- Multiple food types (currently only cucumber slices)
- Food decay visual indicators (darkening, wilting)
- Hay freshness variation (color shifts)
- More toy variations (different wood types for sticks)
- Shelter color/texture variants

## Related Files

**Modified:**
- [src/composables/use3DItems.ts](../../src/composables/use3DItems.ts)
- [src/constants/3d.ts](../../src/constants/3d.ts)

**Created:**
- [src/composables/use3DTextures.ts](../../src/composables/use3DTextures.ts)

**Referenced:**
- [src/stores/habitatConditions.ts](../../src/stores/habitatConditions.ts) - Bowl contents source
- [src/composables/useHabitatContainers.ts](../../src/composables/useHabitatContainers.ts) - Bowl contents management

## Notes

1. **Hay Simplification**: User requested wider strands "like thin strips of tape" with bends and angles, reduced instance count for performance

2. **Bowl Content Rules**:
   - Food sits on top of hay
   - Hay stacks on hay (multiple servings)
   - Maximum 2 food items displayed (split 50/50)

3. **Scaling Convention**: All demo measurements scaled 2x for game consistency

4. **Wooden Archway Tunnel**: Added as purchasable item, distinct from hay rack (starter item)

5. **Build Status**: Clean build with no TypeScript errors, only optimization warnings (chunk size, dynamic imports)
