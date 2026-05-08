// =========================================================
// Hero 3D Background — Three.js (CDN ESM)
// Voxels flutuantes com rotação suave e parallax do mouse.
// Fallback: se WebGL falhar, mostra gradiente animado puro CSS.
// =========================================================

import * as THREE from "https://esm.sh/three@0.160.0"

export async function initHeroBg(canvas) {
  if (!canvas) return
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const dpr = Math.min(window.devicePixelRatio, 2)
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
  } catch (e) {
    console.warn("[three-bg] WebGL unavailable", e)
    return
  }
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x07080d, 8, 24)

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50)
  camera.position.set(0, 0, 8)

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 0.55)
  scene.add(amb)
  const key = new THREE.DirectionalLight(0x00d4ff, 1.2)
  key.position.set(5, 5, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x3ddc84, 0.8)
  rim.position.set(-6, -3, 4)
  scene.add(rim)

  // Voxel cubes (Minecraft-ish)
  const group = new THREE.Group()
  scene.add(group)

  const geo = new THREE.BoxGeometry(1, 1, 1)
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x161a25, roughness: 0.4, metalness: 0.4, emissive: 0x00d4ff, emissiveIntensity: 0.05 }),
    new THREE.MeshStandardMaterial({ color: 0x1d2230, roughness: 0.55, metalness: 0.3, emissive: 0x3ddc84, emissiveIntensity: 0.04 }),
    new THREE.MeshStandardMaterial({ color: 0x0b0d14, roughness: 0.7, metalness: 0.2, emissive: 0x00d4ff, emissiveIntensity: 0.08 }),
  ]
  // Edge lines
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35 })
  const edges = new THREE.EdgesGeometry(geo)

  const cubes = []
  const COUNT = 22
  for (let i = 0; i < COUNT; i++) {
    const m = new THREE.Mesh(geo, mats[i % mats.length])
    const s = 0.35 + Math.random() * 0.9
    m.scale.setScalar(s)
    m.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 1
    )
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    m.userData.spin = {
      x: (Math.random() - 0.5) * 0.004,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.003,
    }
    m.userData.float = {
      base: m.position.y,
      amp: 0.2 + Math.random() * 0.5,
      freq: 0.4 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    }

    // optional edge wireframe overlay on a few
    if (i % 3 === 0) {
      const line = new THREE.LineSegments(edges, edgeMat)
      line.scale.copy(m.scale)
      m.add(line)
    }

    group.add(m)
    cubes.push(m)
  }

  // Mouse parallax
  const target = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  window.addEventListener("mousemove", (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 0.6
    target.y = (e.clientY / window.innerHeight - 0.5) * 0.4
  })

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    renderer.setSize(rect.width, rect.height, false)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener("resize", resize)

  let running = true
  const io = new IntersectionObserver(([entry]) => { running = entry.isIntersecting }, { threshold: 0 })
  io.observe(canvas)

  const clock = new THREE.Clock()
  function tick() {
    requestAnimationFrame(tick)
    if (!running) return
    const t = clock.getElapsedTime()
    // smooth parallax
    cur.x += (target.x - cur.x) * 0.05
    cur.y += (target.y - cur.y) * 0.05
    group.rotation.y = cur.x * 0.6
    group.rotation.x = -cur.y * 0.4

    for (const c of cubes) {
      c.rotation.x += c.userData.spin.x
      c.rotation.y += c.userData.spin.y
      c.rotation.z += c.userData.spin.z
      const f = c.userData.float
      c.position.y = f.base + Math.sin(t * f.freq + f.phase) * f.amp
    }
    renderer.render(scene, camera)
  }
  tick()
}
