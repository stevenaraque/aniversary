import * as THREE from 'three'

// Mariposa origami de papel (portada de la plantilla del usuario).
// Solo modelo + aleteo: sin rutas, sin pétalos, sin HUD, sin sombra.
// La trayectoria del vuelo la sigue moviendo Letter.jsx; este canvas
// es transparente y vive dentro de la caja de 112x112 de la mariposa.

const GOLD = 0xd4af37
const CHAMPAGNE = 0xf7f0df
const CRIMSON = 0xdc143c
const WINE = 0x8b0000
const EDGE = 0xb8941f
const INK = 0x1a0a0f
const FLAP_HZ = 12.5

// Subida rápida y bajada lenta: una senoide pura delata el aleteo falso.
function flapWave(t) {
  return 0.8 * Math.sin(t) + 0.2 * Math.sin(2 * t - 0.7)
}

function triGeo(tris) {
  const pos = new Float32Array(tris.length * 9)
  let i = 0
  for (const t of tris) for (const v of t) { pos[i++] = v[0]; pos[i++] = v[1]; pos[i++] = v[2] }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

const _v = new THREE.Vector3()
const _d = new THREE.Vector3()
const _c = new THREE.Vector3()

function rodrigues(out, p, p0, dir, sinT, cosT) {
  _v.subVectors(p, p0)
  _c.copy(dir).multiplyScalar(dir.dot(_v) * (1 - cosT))
  out.copy(_v).multiplyScalar(cosT)
    .add(_d.crossVectors(dir, _v).multiplyScalar(sinT))
    .add(_c).add(p0)
}

function makeFoldPanel(innerTris, outerTris, axis0, axis1, xThreshold, matF, matB, matEdge) {
  const geo = triGeo([...innerTris, ...outerTris])
  // Sin grupos, un mesh con array de materiales no dibuja nada:
  // el grupo 0 pinta frentes y el grupo 1 reversos, ambos sobre toda el ala.
  const vCount = geo.attributes.position.count
  geo.clearGroups()
  geo.addGroup(0, vCount, 0)
  geo.addGroup(0, vCount, 1)
  const edge = new THREE.EdgesGeometry(geo, 1)
  const mesh = new THREE.Mesh(geo, [matF, matB])
  const lines = new THREE.LineSegments(edge, matEdge)
  const base = geo.attributes.position.array.slice()
  const eBase = edge.attributes.position.array.slice()
  const outerIdx = []
  const eOuterIdx = []
  for (let i = 0; i < base.length; i += 3) if (base[i] > xThreshold) outerIdx.push(i)
  for (let i = 0; i < eBase.length; i += 3) if (eBase[i] > xThreshold) eOuterIdx.push(i)
  const p0 = new THREE.Vector3(...axis0)
  const p1 = new THREE.Vector3(...axis1)
  const dir = p1.clone().sub(p0).normalize()
  const tmp = new THREE.Vector3()
  const group = new THREE.Group()
  group.add(mesh, lines)
  return {
    group,
    fold(theta) {
      const s = Math.sin(theta)
      const c = Math.cos(theta)
      const pa = geo.attributes.position.array
      const pb = edge.attributes.position.array
      for (const i of outerIdx) { tmp.set(base[i], base[i + 1], base[i + 2]); rodrigues(tmp, tmp, p0, dir, s, c); pa[i] = tmp.x; pa[i + 1] = tmp.y; pa[i + 2] = tmp.z }
      for (const i of eOuterIdx) { tmp.set(eBase[i], eBase[i + 1], eBase[i + 2]); rodrigues(tmp, tmp, p0, dir, s, c); pb[i] = tmp.x; pb[i + 1] = tmp.y; pb[i + 2] = tmp.z }
      geo.attributes.position.needsUpdate = true
      edge.attributes.position.needsUpdate = true
      geo.computeVertexNormals()
    },
  }
}

function buildWing(mats) {
  const w = new THREE.Group()
  // Ala delantera DORADA, ala trasera VINO: bicolor legible + paleta del sitio.
  const fw = makeFoldPanel(
    [[[0.04, 0.02, 0.30], [0.05, -0.04, -0.02], [0.55, 0.14, 0.16]]],
    [
      [[0.05, -0.04, -0.02], [0.55, 0.14, 0.16], [1.34, 0.04, 0.34]],
      [[0.55, 0.14, 0.16], [1.34, 0.04, 0.34], [1.04, -0.07, 0.06]],
    ],
    [0.05, -0.04, -0.02], [0.55, 0.14, 0.16], 0.8, mats.goldFront, mats.goldBack, mats.edge
  )
  w.add(fw.group)
  const hw = makeFoldPanel(
    [[[0.04, 0.02, 0.14], [0.08, -0.04, -0.34], [0.40, 0.10, -0.06]]],
    [
      [[0.08, -0.04, -0.34], [0.40, 0.10, -0.06], [0.62, -0.02, -0.48]],
      [[0.40, 0.10, -0.06], [0.62, -0.02, -0.48], [0.46, -0.06, -0.02]],
    ],
    [0.08, -0.04, -0.34], [0.40, 0.10, -0.06], 0.43, mats.wineFront, mats.wineBack, mats.edge
  )
  const hwPivot = new THREE.Group()
  hwPivot.position.set(0, -0.01, -0.12)
  hwPivot.add(hw.group)
  w.add(hwPivot)
  w.userData = { fw, hw, hwPivot, shY: 0.07, shZ: 0.14 }
  w.position.set(0.02, 0.07, 0.14)
  w.rotation.y = -0.12
  w.scale.setScalar(1.18)
  return w
}

function buildButterfly(mats) {
  const butterfly = new THREE.Group()
  const bodyGroup = new THREE.Group()
  butterfly.add(bodyGroup)
  const secs = [
    { z: 0.50, rt: 0.045, rs: 0.06, rb: 0.05 },
    { z: 0.30, rt: 0.07, rs: 0.085, rb: 0.075 },
    { z: 0.05, rt: 0.06, rs: 0.075, rb: 0.07 },
    { z: -0.30, rt: 0.035, rs: 0.045, rb: 0.045 },
    { z: -0.62, rt: 0.008, rs: 0.01, rb: 0.01 },
  ]
  const ring = (s) => [[0, s.rt, s.z], [s.rs, 0, s.z], [0, -s.rb, s.z], [-s.rs, 0, s.z]]
  const tris = []
  for (let i = 0; i < secs.length - 1; i++) {
    const A = ring(secs[i])
    const B = ring(secs[i + 1])
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4
      tris.push([A[k], B[k2], B[k]], [A[k], A[k2], B[k2]])
    }
  }
  bodyGroup.add(new THREE.Mesh(triGeo(tris), mats.ink))
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), mats.ink)
  head.position.set(0, 0.01, 0.56)
  head.scale.set(0.75, 0.8, 1.05)
  bodyGroup.add(head)
  const antennas = []
  for (const s of [1, -1]) {
    const g = new THREE.Group()
    g.position.set(0.03 * s, 0.06, 0.6)
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.007, 0.55, 5), mats.ink)
    stalk.position.y = 0.275
    g.add(stalk)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), mats.ink)
    knob.position.y = 0.55
    knob.scale.set(1, 0.75, 1)
    g.add(knob)
    g.userData.baseZ = -0.5 * s
    g.rotation.z = g.userData.baseZ
    g.rotation.x = 0.95
    bodyGroup.add(g)
    antennas.push(g)
  }
  const wingR = buildWing(mats)
  const wingL = buildWing(mats)
  wingL.scale.x *= -1
  wingL.position.x *= -1
  wingL.rotation.y *= -1
  butterfly.add(wingR, wingL)
  return { butterfly, bodyGroup, antennas, wingR, wingL }
}

// Dibuja un frame del aleteo en el tiempo `phase` (segundos de aleteo).
function poseFlap(parts, phase, k = 1) {
  const { bodyGroup, antennas, wingR, wingL } = parts
  const waveF = flapWave(phase)
  const waveH = flapWave(phase - 0.45)
  const angF = k * waveF + 0.1 * k
  const angH = k * 0.94 * waveH + 0.085 * k
  const dH = angH - angF
  wingR.rotation.z = angF
  wingL.rotation.z = -angF
  wingR.userData.hwPivot.rotation.z = dH
  wingL.userData.hwPivot.rotation.z = -dH
  const twist = k * 0.3 * Math.cos(phase - 0.2)
  wingR.rotation.x = twist
  wingL.rotation.x = -twist
  const lagF = flapWave(phase - 0.6)
  const lagH = flapWave(phase - 0.9)
  const fw = 0.1 + k * 0.3 * lagF
  const hw = 0.08 + k * 0.24 * lagH
  wingR.userData.fw.fold(fw)
  wingL.userData.fw.fold(fw)
  wingR.userData.hw.fold(hw)
  wingL.userData.hw.fold(hw)
  for (const w of [wingR, wingL]) {
    w.position.y = w.userData.shY + k * 0.035 * flapWave(phase - 0.25)
    w.position.z = w.userData.shZ + k * 0.045 * Math.cos(phase - 0.5)
  }
  bodyGroup.position.y = k * 0.06 * Math.sin(2 * phase - 1.1)
  bodyGroup.rotation.x = k * 0.07 * flapWave(phase - 0.35)
  for (let i = 0; i < 2; i++) antennas[i].rotation.z = antennas[i].userData.baseZ + k * 0.09 * Math.sin(phase * 0.5 + i * 2)
}

// Monta la mariposa en `canvas` (caja cuadrada transparente, 112px por defecto).
// Devuelve `dispose()`. Con reduced-motion aletea lento en vez de congelarse.
export function mountOrigamiButterfly(canvas, opts = {}) {
  const size = opts.size || 112
  const reduceMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(size, size, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
  // Vista 3/4 desde arriba: se ven las alas rojas por encima.
  // De frente solo se vería el morro (una mota). Las alas ocupan ±1.6.
  camera.position.set(1.2, 2.8, 4.2)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0xfff6e6, 0xcbb99a, 0.95))
  const key = new THREE.DirectionalLight(0xffffff, 1.7)
  key.position.set(6, 10, 7)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffe9c9, 0.55)
  rim.position.set(-7, 4, -6)
  scene.add(rim)

  // Emissive suave: el papel washi se diseñó sobre fondo crema;
  // sobre el obsidian del sitio necesita luz propia para no apagarse.
  const mats = {
    goldFront: new THREE.MeshStandardMaterial({ color: CHAMPAGNE, emissive: CHAMPAGNE, emissiveIntensity: 0.25, roughness: 0.9, metalness: 0, side: THREE.FrontSide, flatShading: true }),
    goldBack: new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 0.5, roughness: 0.85, metalness: 0, side: THREE.BackSide, flatShading: true }),
    wineFront: new THREE.MeshStandardMaterial({ color: CHAMPAGNE, emissive: CHAMPAGNE, emissiveIntensity: 0.25, roughness: 0.9, metalness: 0, side: THREE.FrontSide, flatShading: true }),
    wineBack: new THREE.MeshStandardMaterial({ color: CRIMSON, emissive: CRIMSON, emissiveIntensity: 0.5, roughness: 0.85, metalness: 0, side: THREE.BackSide, flatShading: true }),
    edge: new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.6 }),
    ink: new THREE.MeshStandardMaterial({ color: INK, emissive: WINE, emissiveIntensity: 0.4, roughness: 0.8, metalness: 0, side: THREE.DoubleSide, flatShading: true }),
  }
  const parts = buildButterfly(mats)
  parts.butterfly.scale.setScalar(1.15)
  scene.add(parts.butterfly)

  let raf = 0
  let running = true
  let last = 0
  let flap = 0
  let visHandler = null

  const render = () => { renderer.render(scene, camera) }

  function dispose() {
    running = false
    cancelAnimationFrame(raf)
    if (visHandler) document.removeEventListener('visibilitychange', visHandler)
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
    })
    renderer.dispose()
    try { renderer.forceContextLoss() } catch { /* noop */ }
  }

  // Con movimiento reducido NO se congela: aleteo lento y contenido
  // (igual que las alas CSS viejas, que iban a 1.1s en vez de pararse).
  const hz = reduceMotion ? 0.6 : FLAP_HZ
  const ampK = reduceMotion ? 0.45 : 1
  const loop = (now) => {
    if (!running) return
    const dt = Math.min(((now - last) / 1000) || 0.016, 0.05)
    last = now
    flap += dt * Math.PI * 2 * hz
    poseFlap(parts, flap, ampK)
    render()
    raf = requestAnimationFrame(loop)
  }
  visHandler = () => {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(raf)
    } else if (!running) {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
  }
  document.addEventListener('visibilitychange', visHandler)
  raf = requestAnimationFrame((now) => { last = now; loop(now) })

  return dispose
}
