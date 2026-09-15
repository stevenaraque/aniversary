import * as THREE from 'three'

/**
 * Danaus aurum — mariposa origami en abanico (placa de vuelo)
 * - Modelo: 2 alas en abanico (4 venas fore + 3 hind) + cuerpo 8 anillos + antenas articuladas
 * - Vuelo: flapWave asimétrico + camber con retardo + hindwing desfasado
 * - Uso: Letter.jsx mueve la caja por pantalla (Bézier 6 tramos); aquí solo aletea 148×148
 * - Demo: opts.demo=true activa variación natural ráfaga/planeo/cernido (no lana)
 * @see Letter.jsx:241 mountOrigamiButterfly(canvas,{size:148})
 */

// ── Paleta sitio (no tocar sin preguntar) ──
const GOLD = 0xd4af37 // oro principal alas delanteras
const CHAMPAGNE = 0xf7f0df // revés champagne (se ve con BackSide)
const CRIMSON = 0xdc143c // vino alas traseras
const WINE = 0x8b0000 // vino oscuro cuerpo/acentos
const EDGE = 0xb8941f // filo pliegue
const FLAP_HZ = 12.5 // Hz biológico real Danaus — no seno puro

/** Onda asimétrica: subida 35% más rápida que bajada — delata flap falso si es seno puro */
function flapWave(t) {
  return 0.8 * Math.sin(t) + 0.2 * Math.sin(2 * t - 0.7)
}

/** Geometría triangular plana sin índice: cada 3 vértices = 1 triángulo, normales planas */
function triGeo(flat) {
  if (!Array.isArray(flat) && !(flat instanceof Float32Array)) throw new TypeError('triGeo: flat debe ser array')
  if (flat.length % 9 !== 0) console.warn('triGeo: flat.length no múltiplo de 9 — faceta incompleta')
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flat), 3))
  g.computeVertexNormals() // sin índice => normal plana por cara
  return g
}

// Vectores reutilizables para rodrigues (evita GC por frame)
const _roV = new THREE.Vector3()
const _roK = new THREE.Vector3()
const _roTmp = new THREE.Vector3()

/** Rotación de Rodrigues: rota v alrededor de k (unitario) ángulo a — reutiliza vectores */
function rodrigues(v, k, a) {
  const c = Math.cos(a), s = Math.sin(a)
  // v' = v·c + (k×v)·s + k·(k·v)·(1-c)
  _roK.copy(k)
  _roV.copy(v)
  return v.clone().multiplyScalar(c)
    .add(new THREE.Vector3().crossVectors(_roK, _roV).multiplyScalar(s))
    .add(_roK.clone().multiplyScalar(_roK.dot(_roV) * (1 - c)))
}

function foldFlat(flat, origin, axis, ang) {
  const out = flat.slice()
  const p = new THREE.Vector3()
  for (let i = 0; i < flat.length; i += 3) {
    p.set(flat[i], flat[i + 1], flat[i + 2]).sub(origin)
    const r = rodrigues(p, axis, ang).add(origin)
    out[i] = r.x; out[i + 1] = r.y; out[i + 2] = r.z
  }
  return out
}

/** Triángulo con winding según cara: flip invierte orden para BackSide */
const tri3 = (a, b, c, flip) => flip
  ? [c.x, c.y, c.z, b.x, b.y, b.z, a.x, a.y, a.z]
  : [a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z]

/**
 * Panel plegado horneado: inner fijo + outer plegado alrededor de hinge
 * Crea 2 meshes (front/back) con winding invertido + línea de pliegue
 */
function makeFoldPanel({ inner, outer, hinge, fold, mats, edge, edgeOp = 0.5, flip = false }) {
  if (!hinge || hinge.length !== 2) throw new Error('makeFoldPanel: hinge requiere 2 Vector3')
  const axis = new THREE.Vector3().subVectors(hinge[1], hinge[0])
  const len = axis.length()
  if (len < 1e-6) console.warn('makeFoldPanel: hinge degenerado — pliegue nulo')
  else axis.normalize()
  const all = [...tri3(...inner, flip), ...foldFlat(tri3(...outer, flip), hinge[0], axis, fold)]
  // Back: mismo all pero winding invertido para que cámara vea reverso (BackSide)
  const back = []
  for (let i = 0; i < all.length; i += 9)
    back.push(all[i + 6], all[i + 7], all[i + 8], all[i + 3], all[i + 4], all[i + 5], all[i], all[i + 1], all[i + 2])
  const mF = new THREE.Mesh(triGeo(all), mats.front)
  const mB = new THREE.Mesh(triGeo(back), mats.back)
  const grp = new THREE.Group(); grp.add(mF, mB)
  if (edge) {
    const lg = new THREE.BufferGeometry().setFromPoints([hinge[0].clone(), hinge[1].clone()])
    grp.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: edgeOp })))
  }
  return { group: grp, meshF: mF, meshB: mB }
}

function makeMats() {
  const std = (o) => new THREE.MeshStandardMaterial({ flatShading: true, side: THREE.FrontSide, ...o })
  return {
    goldF: std({ color: GOLD, metalness: .58, roughness: .42, envMapIntensity: .8 }),
    goldB: std({ color: CHAMPAGNE, metalness: .26, roughness: .62, envMapIntensity: .5 }),
    wineF: std({ color: WINE, metalness: .30, roughness: .52, envMapIntensity: .5 }),
    wineB: std({ color: 0xb01035, metalness: .36, roughness: .44, envMapIntensity: .55 }),
    ink: std({ color: 0x241018, metalness: .30, roughness: .55, envMapIntensity: .35, side: THREE.DoubleSide }),
    club: std({ color: GOLD, metalness: .6, roughness: .4, envMapIntensity: .7 }),
    edge: EDGE
  }
}

/** Cuerpo segmentado 8 anillos + cabeza icosa + ojos emisivos */
function buildBody(m) {
  const g = new THREE.Group()
  // secs: [z, radioY, y] — silueta ahusada de polilla, no cilindro
  const secs = [[.34, .020, .050], [.28, .052, .038], [.14, .075, .030], [0, .062, .018],
    [-.13, .046, .005], [-.24, .030, -.005], [-.33, .015, -.012], [-.40, .003, -.018]]
  const ring = s => { const [z, r, y] = s; return [[0, y + r, z], [r * .8, y, z], [0, y - r * 1.3, z], [-r * .8, y, z]].map(p => new THREE.Vector3(...p)) }
  const tris = []
  for (let i = 0; i < secs.length - 1; i++) {
    const a = ring(secs[i]), b = ring(secs[i + 1])
    for (let j = 0; j < 4; j++) {
      const k = (j + 1) % 4
      tris.push(...a[j].toArray(), ...a[k].toArray(), ...b[k].toArray())
      tris.push(...a[j].toArray(), ...b[k].toArray(), ...b[j].toArray())
    }
  }
  const tip = new THREE.Vector3(0, -.03, -.46), last = ring(secs.at(-1))
  for (let j = 0; j < 4; j++) { const k = (j + 1) % 4; tris.push(...last[j].toArray(), ...last[k].toArray(), ...tip.toArray()) }
  const body = new THREE.Mesh(triGeo(tris), m.ink); g.add(body)
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.042, 0), m.ink)
  head.position.set(0, .062, .375); g.add(head)
  const eyeM = new THREE.MeshStandardMaterial({ color: CRIMSON, emissive: CRIMSON, emissiveIntensity: .35, roughness: .3, flatShading: true })
  for (const s of [1, -1]) {
    const e = new THREE.Mesh(new THREE.OctahedronGeometry(.018, 0), eyeM); e.position.set(s * .034, .066, .40); e.rotation.y = s * .5; g.add(e)
  }
  return g
}

/** Antena articulada 2 segmentos + club dorado — quaternion base para no recalcular */
function buildAntenna(m, s) {
  const g = new THREE.Group()
  g.position.set(s * .024, .078, .405)
  const dir = new THREE.Vector3(s * .38, .9, .42).normalize()
  const baseQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  g.quaternion.copy(baseQ); g.userData = { baseQ: baseQ.clone(), s }
  const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(.0035, .005, .13, 5), m.ink)
  seg1.position.y = .065; g.add(seg1)
  const j = new THREE.Group(); j.position.y = .13
  const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(.0025, .0035, .08, 5), m.ink)
  seg2.position.y = .04; j.add(seg2)
  const club = new THREE.Mesh(new THREE.SphereGeometry(.011, 6, 5), m.club)
  club.position.y = .085; j.add(club); j.rotation.x = -.55; g.add(j)
  return g
}

/** Abanico plegado: n venas → n-1 paneles con bisagras en cascada */
function buildFan(mats, s, origin, veins, fold, front, back) {
  if (veins.length < 2) throw new Error('buildFan: venas <2')
  const rel = p => p.clone().sub(origin)
  const o0 = new THREE.Vector3(0, 0, 0)
  const g = new THREE.Group(); g.position.copy(origin)
  let parent = g; const joints = []
  const n = veins.length
  for (let i = 0; i < n - 1; i++) {
    if (i > 0) {
      const lg = new THREE.BufferGeometry().setFromPoints([o0, rel(veins[i])])
      parent.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: mats.edge, transparent: true, opacity: .4 })))
    }
    const va = veins[i], vb = veins[i + 1], mid = va.clone().lerp(vb, .5)
    const panel = makeFoldPanel({
      inner: [o0, rel(va), rel(mid)], outer: [o0, rel(mid), rel(vb)],
      hinge: [o0.clone(), rel(mid)], fold: fold * (1 - .15 * i),
      mats: { front, back }, edge: mats.edge, edgeOp: .45, flip: s < 0
    })
    parent.add(panel.group)
    if (i < n - 2) {
      const j = new THREE.Group()
      j.userData.axis = rel(vb).clone().normalize()
      parent.add(j); joints.push(j); parent = j
    }
  }
  const tip = new THREE.Object3D(); tip.position.copy(rel(veins[n - 1])); parent.add(tip)
  return { group: g, joints, tip }
}

function buildWing(mats, s) {
  const root = new THREE.Group(); root.position.set(s * .045, .085, .10)
  const P = p => new THREE.Vector3(s * p[0], p[1], p[2])
  const fore = buildFan(mats, s, new THREE.Vector3(0, 0, 0),
    [P([.61, .08, .20]), P([1.01, .13, .06]), P([.89, .03, -.22]), P([.07, 0, -.16])],
    -.07, mats.goldF, mats.goldB)
  root.add(fore.group)
  const hind = buildFan(mats, s, P([0, -.018, -.12]),
    [P([.48, .055, 0]), P([.75, .06, -.16]), P([.51, .03, -.30])],
    -.06, mats.wineF, mats.wineB)
  root.add(hind.group)
  return { root, fore, hind }
}

function buildButterfly(mats) {
  const butterfly = new THREE.Group(), body = new THREE.Group()
  body.add(buildBody(mats))
  const wR = buildWing(mats, 1), wL = buildWing(mats, -1)
  body.add(wR.root, wL.root)
  const aR = buildAntenna(mats, 1), aL = buildAntenna(mats, -1)
  body.add(aR, aL)
  butterfly.add(body)
  return { butterfly, body, wR, wL, antennae: [aR, aL] }
}

/**
 * Pose de aleteo marcada +55% — antes se veía plana (0.78) ahora 1.18 para que NOTE
 * - fore/hind desfasados 0.55 rad — hind sigue con retardo
 * - camber: puntas se arquean proporcional a velocidad
 */
function poseFlap(P, phase, k, o = {}) {
  const amp = o.amp ?? 1, base = o.base ?? 0.30, asL = o.asL ?? 1, asR = o.asR ?? 1, vel = o.vel ?? 0
  const w = flapWave(phase), wH = flapWave(phase - .55)
  // +55% amplitud vs original 0.78 — ahora 26°→89° en vez de 17°→62°
  const aR = base + 1.18 * amp * k * asR * w, aL = base + 1.18 * amp * k * asL * w
  P.wR.fore.group.rotation.z = aR
  P.wL.fore.group.rotation.z = -aL
  const hR = base * .92 + 0.92 * amp * k * asR * wH, hL = base * .92 + 0.92 * amp * k * asL * wH
  P.wR.hind.group.rotation.z = hR
  P.wL.hind.group.rotation.z = -hL
  for (const [wing, s] of [[P.wR, 1], [P.wL, -1]]) {
    wing.fore.joints.forEach((j, i) => {
      j.quaternion.setFromAxisAngle(j.userData.axis, s * (.11 * vel * amp * (1 - .28 * i) - .02 * w * amp))
    })
    wing.hind.joints.forEach((j, i) => {
      j.quaternion.setFromAxisAngle(j.userData.axis, s * (.10 * vel * amp * (1 - .3 * i)))
    })
  }
  P.body.position.y = o.bob ?? 0
  P.body.rotation.x = o.pitchBob ?? 0
  P.body.rotation.z = .03 * amp * w
  // Antenas: sutil temblor ligado a fase — no copias baseQ cada frame
  P.antennae.forEach((a) => {
    a.quaternion.copy(a.userData.baseQ)
    a.rotateX(.08 * Math.sin(phase * .5 - 1) + .05 * amp * Math.cos(phase - 1.6))
    a.rotateZ(a.userData.s * (.06 * Math.sin(phase * .7)))
  })
}

// ── Monta Danaus en canvas transparente — size 148 carta, 168 preview ──
/**
 * @param {HTMLCanvasElement} canvas - canvas existente (Letter lo crea con 148×148)
 * @param {{size?:number, demo?:boolean}} opts - size lado cuadrado, demo activa vuelo variado
 * @returns {() => void} dispose — cancela rAF, listeners y GPU
 */
export function mountOrigamiButterfly(canvas, opts = {}) {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new TypeError('mountOrigamiButterfly: canvas requerido')
  const size = Math.max(48, Math.min(512, opts.size || 148))
  const isDemo = !!opts.demo
  const reduceMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Validación WebGL
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl) console.warn('mountOrigamiButterfly: WebGL no disponible — mariposa no se verá')

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: isDemo ? false : true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(size, size, false)
  if (isDemo) renderer.setClearColor(0x150a10, 1)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08

  const scene = new THREE.Scene()
  if (isDemo) scene.background = new THREE.Color(0x150a10)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  // Cámara lateral baja: aleteo se ve de canto, no cenital plano
  if (isDemo) { camera.position.set(1.05, 1.45, 3.4); camera.lookAt(0, 0.40, 0) }
  else { camera.position.set(1.15, 1.25, 3.2); camera.lookAt(0, 0.30, 0) }

  // Luces cálidas: oro metalizado necesita luz, si no se apaga sobre obsidian #050505
  scene.add(new THREE.HemisphereLight(0x3a2a30, 0x0d0709, .7))
  const key = new THREE.DirectionalLight(0xfff1d6, 2.2)
  key.position.set(2.4, 5, 1.6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xcfd8e8, .55)
  rim.position.set(-2.5, 1.4, -2.6)
  scene.add(rim)

  const mats = makeMats()
  const parts = buildButterfly(mats)
  parts.butterfly.scale.setScalar(1.55) // 1.34 alas llenan 148px con margen
  parts.butterfly.position.set(0, -0.08, 0)
  parts.butterfly.rotation.order = 'YXZ'
  scene.add(parts.butterfly)

  let raf = 0
  let running = true
  let last = 0
  let phase = 0
  let visHandler = null
  // Demo: variación natural para no verse lana/mecánico
  let demoMode = 'flap', demoT = isDemo && !reduceMotion ? 1.2 : 999
  let curHz = FLAP_HZ, curAmp = 1, curBase = 0.30

  const render = () => { renderer.render(scene, camera) }

  function dispose() {
    running = false
    cancelAnimationFrame(raf)
    if (visHandler) document.removeEventListener('visibilitychange', visHandler)
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) {
        const arr = Array.isArray(o.material) ? o.material : [o.material]
        arr.forEach((m) => m.dispose())
      }
    })
    renderer.dispose()
    try { renderer.forceContextLoss() } catch { /* noop */ }
  }

  const baseHz = reduceMotion ? 0.6 : FLAP_HZ
  const ampK = reduceMotion ? 0.45 : 1
  const mix = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt))
  const loop = (now) => {
    if (!running) return
    const dt = Math.min(((now - last) / 1000) || 0.016, 0.05)
    last = now
    let hz = baseHz, amp = 1.35, base = 0.42
    if (isDemo && !reduceMotion) {
      demoT -= dt
      if (demoT <= 0) {
        if (demoMode === 'flap') {
          const r = Math.random()
          if (r < 0.45) { demoMode = 'glide'; demoT = 0.6 + Math.random() * 0.9 }
          else if (r < 0.78) { demoMode = 'hover'; demoT = 0.9 + Math.random() * 1.1 }
          else { demoMode = 'flap'; demoT = 0.8 + Math.random() * 1.2 }
        } else { demoMode = 'flap'; demoT = 0.9 + Math.random() * 1.4 }
      }
      const tgt = demoMode === 'flap' ? { hz: FLAP_HZ, amp: 1.35, base: 0.42 }
        : demoMode === 'glide' ? { hz: 2.2, amp: 0.14, base: 0.62 }
        : { hz: 6.2, amp: 0.62, base: 0.42 }
      curHz = mix(curHz, tgt.hz, 6, dt); curAmp = mix(curAmp, tgt.amp, 5, dt); curBase = mix(curBase, tgt.base, 4, dt)
      hz = curHz; amp = curAmp; base = curBase
    }
    phase += dt * Math.PI * 2 * hz
    const velNorm = Math.cos(phase) * (hz / FLAP_HZ)
    poseFlap(parts, phase, ampK, {
      amp: isDemo && !reduceMotion ? amp : 1.35,
      base: isDemo && !reduceMotion ? base : 0.42,
      vel: velNorm,
      bob: .028 * ampK * Math.sin(phase - 1.3) * (isDemo && !reduceMotion ? amp : 1),
      pitchBob: .05 * ampK * Math.cos(phase - 1.1) * (isDemo && !reduceMotion ? amp : 1)
    })
    if (isDemo && !reduceMotion) {
      const t = now * 0.001
      parts.butterfly.position.y = -0.08 + Math.sin(t * 0.9) * 0.035 + Math.sin(t * 1.6) * 0.015
      parts.butterfly.position.x = Math.sin(t * 0.6) * 0.04
      parts.butterfly.rotation.y = Math.sin(t * 0.7) * 0.08
    }
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
