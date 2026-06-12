import type { Ref } from 'vue'
import * as THREE from 'three'
import { CAMERA_CONFIG, SCENE_COLORS, LIGHTING_CONFIG } from '../constants/3d'
import { disposeScene, disposeRenderer } from '../utils/three-cleanup'

export function use3DScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(SCENE_COLORS.SKY)
  scene.fog = new THREE.Fog(SCENE_COLORS.SKY, 40, 120)

  // Camera
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    1, // Aspect - will be set in initRenderer
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR,
  )
  camera.position.set(
    CAMERA_CONFIG.INITIAL_POSITION.x,
    CAMERA_CONFIG.INITIAL_POSITION.y,
    CAMERA_CONFIG.INITIAL_POSITION.z
  )
  camera.lookAt(0, 0, 0)

  // Renderer
  let renderer: THREE.WebGLRenderer | null = null

  // World Group (for rotation)
  const worldGroup = new THREE.Group()
  scene.add(worldGroup)

  // Lighting
  const ambientLight = new THREE.AmbientLight(
    SCENE_COLORS.AMBIENT_LIGHT,
    LIGHTING_CONFIG.AMBIENT_INTENSITY
  )
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(
    SCENE_COLORS.DIRECTIONAL_LIGHT,
    LIGHTING_CONFIG.DIRECTIONAL_INTENSITY
  )
  dirLight.position.set(15, 30, 20)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = LIGHTING_CONFIG.SHADOW_MAP_SIZE
  dirLight.shadow.mapSize.height = LIGHTING_CONFIG.SHADOW_MAP_SIZE
  dirLight.shadow.camera.left = -LIGHTING_CONFIG.SHADOW_CAMERA_BOUNDS
  dirLight.shadow.camera.right = LIGHTING_CONFIG.SHADOW_CAMERA_BOUNDS
  dirLight.shadow.camera.top = LIGHTING_CONFIG.SHADOW_CAMERA_BOUNDS
  dirLight.shadow.camera.bottom = -LIGHTING_CONFIG.SHADOW_CAMERA_BOUNDS
  scene.add(dirLight)

  const backLight = new THREE.DirectionalLight(
    SCENE_COLORS.BACK_LIGHT,
    LIGHTING_CONFIG.BACK_LIGHT_INTENSITY
  )
  backLight.position.set(-15, 15, -15)
  scene.add(backLight)

  // Initialize renderer
  function initRenderer() {
    if (!canvasRef.value) return null

    const canvas = canvasRef.value
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    })
    renderer.setSize(width, height, false)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true

    // Set camera aspect
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    return renderer
  }

  // Handle canvas resize
  function handleResize() {
    if (!renderer || !canvasRef.value) return

    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  // Cleanup - dispose all Three.js resources
  function cleanup() {
    // Dispose scene and all its children
    disposeScene(scene)

    // Dispose renderer
    disposeRenderer(renderer)
    renderer = null
  }

  return {
    scene,
    camera,
    worldGroup,
    initRenderer,
    handleResize,
    cleanup,
    getRenderer: () => renderer,
  }
}
