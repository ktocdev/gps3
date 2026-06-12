import * as THREE from 'three'

export function createBedModel(): THREE.Group {
  const group = new THREE.Group()

  // Flat mat - plane geometry (scaled up 2x)
  const bedGeo = new THREE.PlaneGeometry(3.0, 3.0)
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.9,
    side: THREE.DoubleSide
  })
  const bed = new THREE.Mesh(bedGeo, bedMat)
  bed.rotation.x = -Math.PI / 2
  bed.position.y = 0.04 // Slightly above ground
  bed.receiveShadow = true
  group.add(bed)

  return group
}
