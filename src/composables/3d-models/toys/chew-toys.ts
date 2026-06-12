import * as THREE from 'three'
import { displaceVertices } from '../shared/geometry'
import { seededRandom } from '../shared/utils'

/**
 * Create a toy model (twig ball or chew stick)
 * @param type - Type of toy to create
 * @param itemId - Item ID used for seeded random (prevents jitter on re-render)
 */
export function createToyModel(type: 'stick' | 'ball' | 'other', itemId: string = 'default_toy'): THREE.Group {
  const group = new THREE.Group()

  // Generate consistent seed from itemId
  const seed = itemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = seededRandom(seed)

  if (type === 'ball') {
    // Twig Ball - 12 interlocking torus rings (scaled 2x: 0.8 → 1.6 major, 0.06 → 0.12 tube)
    for (let i = 0; i < 12; i++) {
      const ringGeo = new THREE.TorusGeometry(1.6, 0.12, 6, 16)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xCD853F, // Peru/tan color
        roughness: 1.0, // Completely matte for natural twig look
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)

      // Seeded random rotation for woven appearance (deterministic)
      ring.rotation.set(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI
      )

      ring.castShadow = true
      ring.receiveShadow = true
      group.add(ring)
    }

    // Position the ball group
    // Major radius 1.6 + tube radius 0.12 + small buffer = 1.75
    group.position.y = 1.75
  } else if (type === 'stick') {
    // Enhanced wooden stick with displacement (scaled 2x)
    // Main stick cylinder (closed to prevent hollow ends and seams)
    const stickGeo = new THREE.CylinderGeometry(0.375, 0.375, 5.6, 32, 32, false)

    // Apply subtle vertex displacement for natural irregularity
    // Reduced magnitude to minimize visible seams
    displaceVertices(stickGeo, 0.03, 0.05)

    // Materials with solid wood colors (no texture to avoid seams)
    const stickSideMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Saddle brown
      roughness: 0.9,
    })
    const stickEndMat = new THREE.MeshStandardMaterial({
      color: 0xDEB887, // Burlywood (lighter for end caps)
      roughness: 0.8,
    })

    // Use material array: [side, top cap, bottom cap]
    const stick = new THREE.Mesh(stickGeo, [stickSideMat, stickEndMat, stickEndMat])
    stick.rotation.z = Math.PI / 2
    stick.castShadow = true
    stick.receiveShadow = true
    group.add(stick)

    // Add branch knob for natural appearance (scaled 2x)
    const knobGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.0, 16, 8, false)
    displaceVertices(knobGeo, 0.02, 0) // Subtle displacement

    const knob = new THREE.Mesh(knobGeo, [stickSideMat, stickEndMat, stickEndMat])
    knob.position.set(0.36, 0, 0) // Position to intersect through stick center
    knob.rotation.z = Math.PI / 2 - 0.3
    knob.rotation.y = random() * Math.PI
    knob.castShadow = true
    knob.receiveShadow = true
    group.add(knob)

    // Position the stick group
    // Radius 0.375 + displacement ~0.06 + buffer = 0.5
    group.position.y = 0.5
    group.rotation.y = random() * Math.PI
  } else {
    // Placeholder cube (scaled up 2x)
    const cubeGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xFFA500,
      roughness: 0.6
    })
    const cube = new THREE.Mesh(cubeGeo, cubeMat)
    cube.position.y = 0.5
    cube.castShadow = true
    group.add(cube)
  }

  return group
}
