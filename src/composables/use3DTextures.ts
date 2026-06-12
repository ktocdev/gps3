import * as THREE from 'three'

/**
 * Create a procedural wood texture using canvas
 * Based on demo implementation for natural wood grain appearance
 */
export function createWoodTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base color - burlywood
  ctx.fillStyle = '#DEB887'
  ctx.fillRect(0, 0, size, size)

  // Add wood grain lines
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * size
    const thickness = 1 + Math.random() * 3
    const opacity = 0.1 + Math.random() * 0.2

    ctx.strokeStyle = `rgba(101, 67, 33, ${opacity})`
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.moveTo(x, 0)

    // Create wavy vertical grain
    for (let y = 0; y <= size; y += 10) {
      const drift = Math.sin(y * 0.02 + x) * 10
      ctx.lineTo(x + drift, y)
    }
    ctx.stroke()
  }

  // Add noise for texture variation
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const val = Math.random() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${val},${val},${val},0.05)`
    ctx.fillRect(x, y, 1, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 1)

  return texture
}

/**
 * Displace vertices of a geometry for organic/natural appearance
 * Uses a displacement map to keep shared vertices consistent
 *
 * @param geometry - BufferGeometry to modify
 * @param magnitude - Amount of random displacement
 * @param twist - Amount of twist effect (optional)
 */
export function displaceVertices(
  geometry: THREE.BufferGeometry,
  magnitude: number,
  twist: number = 0
): void {
  const posAttr = geometry.attributes.position
  const vertex = new THREE.Vector3()

  // Map to store displacements for shared vertices
  const displacementMap: Record<string, { dx: number; dz: number }> = {}

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i)

    // Create key for vertex position (4 decimal places for precision)
    const key = `${vertex.x.toFixed(4)},${vertex.y.toFixed(4)},${vertex.z.toFixed(4)}`

    let dx: number, dz: number

    if (displacementMap[key]) {
      // Use existing displacement for this position
      dx = displacementMap[key].dx
      dz = displacementMap[key].dz
    } else {
      // Generate new displacement
      dx = (Math.random() - 0.5) * magnitude
      dz = (Math.random() - 0.5) * magnitude

      // Add twist effect if specified
      if (twist) {
        dx += Math.sin(vertex.y * 3.0) * twist
        dz += Math.cos(vertex.y * 3.0) * twist
      }

      // Store for other vertices at same position
      displacementMap[key] = { dx, dz }
    }

    // Apply displacement
    vertex.x += dx
    vertex.z += dz

    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  // Recompute normals for proper lighting
  geometry.computeVertexNormals()
}
