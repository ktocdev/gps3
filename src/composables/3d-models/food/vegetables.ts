import * as THREE from 'three'

/**
 * Create a thick julienne carrot stick
 * Elongated orange carrot strip, slightly tapered toward one end
 */
export function createCarrotStick(): THREE.Group {
  const group = new THREE.Group()

  // Materials
  const carrotMat = new THREE.MeshStandardMaterial({
    color: 0xf57c00, // Bright orange
    roughness: 0.4,
  })

  // Main body - rectangular box for julienne cut
  // Thick julienne: about 6mm x 6mm x 50mm in real life
  // Scaled for 3D scene: length 2.5, width/height ~0.3
  const carrotGeo = new THREE.BoxGeometry(
    2.5,   // length (x)
    0.3,   // height (y)
    0.3    // depth (z)
  )

  const carrot = new THREE.Mesh(carrotGeo, carrotMat)
  carrot.position.y = -0.6 // Lower to match cucumber visual alignment in bowls
  carrot.castShadow = true
  carrot.receiveShadow = true
  group.add(carrot)

  return group
}

/**
 * Create a cucumber slice for food display in bowls
 */
export function createCucumberSlice(): THREE.Group {
  const group = new THREE.Group()

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x1b5e20, // Dark green
    roughness: 0.3,
  })
  const fleshMat = new THREE.MeshStandardMaterial({
    color: 0xDFF7DF, // Light mint green
    roughness: 0.5,
    side: THREE.DoubleSide,
  })

  // Half-cylinder (radius 0.5 → 1.0, thick 0.1 → 0.2, scaled 2x)
  const sliceGeo = new THREE.CylinderGeometry(
    1.0, // radius
    1.0, // radius
    0.2, // thickness
    32,  // segments
    1,   // height segments
    false, // open ended
    0,   // theta start
    Math.PI // theta length (half circle)
  )

  const slice = new THREE.Mesh(sliceGeo, [skinMat, fleshMat, fleshMat])
  slice.castShadow = true
  slice.receiveShadow = true
  group.add(slice)

  // Cut surface (flat face)
  const cutGeo = new THREE.BoxGeometry(2.0, 0.2, 0.04)
  const cut = new THREE.Mesh(cutGeo, fleshMat)
  cut.rotation.y = Math.PI / 2
  cut.position.set(-0.02, 0, 0)
  group.add(cut)

  return group
}
