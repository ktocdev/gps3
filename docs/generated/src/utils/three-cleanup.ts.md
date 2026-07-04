---
source: src/utils/three-cleanup.ts
source_hash: e845570441a905e7ae98d932e73f6c159cb36e3519ce50278f02ed9fa359ae2c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Three.js Cleanup Utilities

`src/utils/three-cleanup.ts`

> A collection of helper functions for properly disposing of Three.js resources (materials, textures, geometries, scenes, renderers) to prevent GPU memory leaks when tearing down Three.js content.

This module exports standalone functions that dispose Three.js resources. `disposeMaterial` disposes a single material or array of materials. `disposeTexture` disposes a texture if present. `disposeObject3D` traverses an Object3D hierarchy, and for each `THREE.Mesh` child it optionally disposes geometry, materials, and textures based on an options object (all default `true`). When disposing textures, it iterates a hardcoded list of common material texture properties (`map`, `lightMap`, `bumpMap`, `normalMap`, `specularMap`, `envMap`, `alphaMap`, `aoMap`, `displacementMap`, `emissiveMap`, `gradientMap`, `metalnessMap`, `roughnessMap`) and disposes each that is a `THREE.Texture`. `disposeScene` calls `disposeObject3D` on the scene, clears it, and disposes `background`/`environment` if they are textures. `disposeRenderer` calls `dispose()` and `forceContextLoss()` on a renderer if present. `cleanupThreeJS` orchestrates full cleanup: disposes any additional objects, then the scene, then the renderer.

## Exports

- **disposeMaterial** (function) — `disposeMaterial(material: THREE.Material | THREE.Material[]): void`: Disposes a single material or every material in an array.
- **disposeTexture** (function) — `disposeTexture(texture: THREE.Texture | null | undefined): void`: Disposes a texture if it is not null/undefined.
- **disposeObject3D** (function) — `disposeObject3D(object: THREE.Object3D, options?: { disposeGeometry?: boolean; disposeMaterials?: boolean; disposeTextures?: boolean }): void`: Recursively traverses an object hierarchy, disposing geometries, materials, and their textures for Mesh children. Each option defaults to true.
- **disposeScene** (function) — `disposeScene(scene: THREE.Scene): void`: Disposes all objects in a scene, clears it, and disposes background/environment textures.
- **disposeRenderer** (function) — `disposeRenderer(renderer: THREE.WebGLRenderer | null): void`: Disposes a WebGL renderer and forces WebGL context loss, if the renderer is non-null.
- **cleanupThreeJS** (function) — `cleanupThreeJS(scene: THREE.Scene, renderer: THREE.WebGLRenderer | null, additionalObjects?: THREE.Object3D[]): void`: Comprehensive teardown: disposes additional objects, then the scene, then the renderer.

## Internal dependencies

- `three`

## Notes

- The texture property list in disposeObject3D is hardcoded; texture types not in the list (e.g. custom material maps) will not be disposed.
- disposeObject3D only handles THREE.Mesh children; geometries/materials on other object types (e.g. Line, Points) are not disposed.
- disposeRenderer.forceContextLoss() irreversibly loses the WebGL context, so the renderer cannot be reused afterward.
