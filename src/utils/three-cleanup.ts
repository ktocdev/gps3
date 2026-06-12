/**
 * Three.js Memory Management Utilities
 *
 * Provides helper functions to properly dispose of Three.js resources
 * and prevent memory leaks.
 */

import * as THREE from 'three'

/**
 * Dispose a single Three.js material
 */
export function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach(mat => mat.dispose())
  } else {
    material.dispose()
  }
}

/**
 * Dispose a single Three.js texture
 */
export function disposeTexture(texture: THREE.Texture | null | undefined): void {
  if (texture) {
    texture.dispose()
  }
}

/**
 * Recursively dispose all geometries, materials, and textures in an Object3D hierarchy
 *
 * @param object - The Three.js object to dispose
 * @param disposeGeometry - Whether to dispose geometries (default: true)
 * @param disposeMaterials - Whether to dispose materials (default: true)
 * @param disposeTextures - Whether to dispose textures (default: true)
 */
export function disposeObject3D(
  object: THREE.Object3D,
  options: {
    disposeGeometry?: boolean
    disposeMaterials?: boolean
    disposeTextures?: boolean
  } = {}
): void {
  const {
    disposeGeometry = true,
    disposeMaterials = true,
    disposeTextures = true,
  } = options

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Dispose geometry
      if (disposeGeometry && child.geometry) {
        child.geometry.dispose()
      }

      // Dispose materials
      if (disposeMaterials && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]

        materials.forEach((material) => {
          // Dispose material
          material.dispose()

          // Dispose textures if requested
          if (disposeTextures) {
            // Check all possible texture properties
            const textureProperties = [
              'map',
              'lightMap',
              'bumpMap',
              'normalMap',
              'specularMap',
              'envMap',
              'alphaMap',
              'aoMap',
              'displacementMap',
              'emissiveMap',
              'gradientMap',
              'metalnessMap',
              'roughnessMap',
            ] as const

            textureProperties.forEach((prop) => {
              const texture = (material as any)[prop]
              if (texture && texture instanceof THREE.Texture) {
                texture.dispose()
              }
            })
          }
        })
      }
    }
  })
}

/**
 * Dispose a Three.js scene and all its children
 *
 * @param scene - The scene to dispose
 */
export function disposeScene(scene: THREE.Scene): void {
  // Dispose all objects in the scene
  disposeObject3D(scene)

  // Clear the scene
  scene.clear()

  // Dispose background if it's a texture
  if (scene.background && scene.background instanceof THREE.Texture) {
    scene.background.dispose()
  }

  // Dispose environment if it's a texture
  if (scene.environment && scene.environment instanceof THREE.Texture) {
    scene.environment.dispose()
  }
}

/**
 * Dispose a Three.js renderer
 *
 * @param renderer - The renderer to dispose
 */
export function disposeRenderer(renderer: THREE.WebGLRenderer | null): void {
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
}

/**
 * Comprehensive cleanup for a Three.js application
 *
 * @param scene - The scene to clean up
 * @param renderer - The renderer to clean up
 * @param additionalObjects - Additional objects to dispose
 */
export function cleanupThreeJS(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer | null,
  additionalObjects: THREE.Object3D[] = []
): void {
  // Dispose additional objects
  additionalObjects.forEach(obj => disposeObject3D(obj))

  // Dispose scene
  disposeScene(scene)

  // Dispose renderer
  disposeRenderer(renderer)
}
