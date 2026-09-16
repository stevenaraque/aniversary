import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { makeMats, buildButterfly, poseFlap } from './origamiButterfly.js'

// ── Vuelo 3D gótico — Danaus + circuito + follow-cam ──
// Reemplaza el recorrido 2D de la carta. Escena oscura (fondo transparente:
// se ve el cosmos global), circuito CatmullRom cerrado del demo, 1 vuelta y
// fundido a la carta. Sin panel ni telemetría: solo botón Seguir.
// Perf: DPR cap 1.5, throttle 30fps, sombras 1024 solo desktop, pausa en
// pestaña oculta, dispose total al desmontar, chunk perezoso (React.lazy).
const LAP_TIME = 14 // segundos por vuelta
const LAPS = 1 // 1 recorrido completo y abre la carta (~16s con despegue y fundido)
const TAKEOFF_TIME = 2.2
const SAFETY_TIMEOUT = 45000 // salida garantizada a la carta aunque algo falle
const FLAP_HZ = 7 // aleteo legible a 30fps (12.5Hz real haría strobing)

// Circuito del demo: despegue en libros + doble rizo sobre las flores
const CIRCUIT = [
  [0.0, 2.3, 1.6], [-2.8, 1.7, 3.2], [-5.2, 1.0, 0.4],
  [-5.29, 1.55, -0.63], [-5.29, 1.70, -2.58], [-3.60, 1.85, -3.55],
  [-1.91, 2.00, -2.58], [-1.91, 2.10, -0.63],
  [-3.60, 2.40, 1.15], [-5.98, 2.60, -0.23], [-5.98, 2.80, -2.98],
  [-3.60, 2.95, -4.35],
  [2.0, 2.4, -3.6], [4.8, 1.6, -1.6], [5.6, 1.0, 1.6], [3.2, 1.6, 3.4],
]
const PERCH = new THREE.Vector3(3.0, 0.70, 1.0) // cima de los libros

export default function ButterflyFlight({ onDone }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const followRef = useRef(true)
  const [follow, setFollow] = useState(true)

  const toggleFollow = () => {
    followRef.current = !followRef.current
    setFollow(followRef.current)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    let disposed = false
    let raf = 0
    let renderer = null
    let safetyTimer = 0
    let fadeTimer = 0
    let onResize = null
    let onVis = null
    let onCtxLost = null

    // Diagnóstico con ?bfdebug=1 (ver consola). Silencioso en producción.
    const bfDebug = new URLSearchParams(window.location.search).has('bfdebug')
    const bfLog = (...a) => { if (bfDebug) console.log('[bf]', ...a) }
    bfLog('mount')

    const finish = (reason = '?') => {
      if (disposed) return
      bfLog('finish:', reason)
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(safetyTimer)
      window.clearTimeout(fadeTimer)
      wrap.style.opacity = '0'
      fadeTimer = window.setTimeout(() => onDoneRef.current?.(), 800)
    }
    safetyTimer = window.setTimeout(() => finish('safety'), SAFETY_TIMEOUT)

    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) throw new Error('WebGL no disponible')
      // Render por software (SwiftShader/llvmpipe): baja la presión GPU para
      // no perder el contexto en máquinas sin aceleración por hardware.
      let isSoftware = false
      try {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info')
        const gpuName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
        isSoftware = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpuName)
        bfLog('gpu:', gpuName || '(oculto)', 'software:', isSoftware)
      } catch { /* noop */ }

      const W = window.innerWidth
      const H = window.innerHeight
      const isMobile = W < 768
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSoftware, alpha: true })
      renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.setSize(W, H, false)
      renderer.setClearColor(0x000000, 0) // transparente: cosmos global detrás
      // Si el navegador pierde el contexto WebGL: avanza a la carta en vez de
      // dejar la escena en negro hasta el temporizador de seguridad.
      onCtxLost = (e) => { e.preventDefault(); finish('contextlost') }
      canvas.addEventListener('webglcontextlost', onCtxLost)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
      const useShadows = !isMobile && !isSoftware
      renderer.shadowMap.enabled = useShadows
      if (useShadows) renderer.shadowMap.type = THREE.PCFShadowMap

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 120)
      // vertical: abre FOV para no quedar dentro de la escena
      const fitFov = () => {
        const a = window.innerWidth / window.innerHeight
        camera.fov = a < 0.8 ? 58 : 45
        camera.aspect = a
        camera.updateProjectionMatrix()
      }
      fitFov()
      const WIDE_POS = new THREE.Vector3(10.5, 6.4, 12.4)
      const WIDE_TGT = new THREE.Vector3(0, 1.4, 0)
      camera.position.copy(WIDE_POS)
      camera.lookAt(WIDE_TGT)

      // ── Luces góticas tenues ──
      scene.add(new THREE.HemisphereLight(0x4a3a44, 0x0d0808, 0.85))
      const key = new THREE.DirectionalLight(0xffe6c0, 2.6)
      key.position.set(6, 11, 5)
      if (useShadows) {
        key.castShadow = true
        key.shadow.mapSize.set(1024, 1024)
        Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 2, far: 40 })
        key.shadow.bias = -0.0002
      }
      scene.add(key)
      const rim = new THREE.DirectionalLight(0x9fb4d8, 0.5)
      rim.position.set(-7, 5, -6)
      scene.add(rim)

      const std = (color, roughness = 0.85) =>
        new THREE.MeshStandardMaterial({ color, roughness, flatShading: true })
      const solid = (mesh, cast = true, receive = true) => {
        mesh.castShadow = cast
        mesh.receiveShadow = receive
        return mesh
      }

      // ── Mesa oscura + suelo ──
      const table = new THREE.Group()
      const top = solid(new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 11), std(0x241610, 0.8)))
      top.position.y = -0.25
      table.add(top)
      for (const [x, z] of [[8.3, 4.7], [8.3, -4.7], [-8.3, 4.7], [-8.3, -4.7]]) {
        const leg = solid(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 2.7, 8), std(0x1a0f0a)))
        leg.position.set(x, -1.85, z)
        table.add(leg)
      }
      scene.add(table)
      const floorGeo = new THREE.CircleGeometry(42, 40)
      floorGeo.rotateX(-Math.PI / 2)
      const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 1 }))
      floor.position.y = -3.2
      floor.receiveShadow = true
      scene.add(floor)

      // ── Libros (percha de despegue) ──
      const books = new THREE.Group()
      books.position.set(3, 0, 1)
      const pages = std(0xd8cbaa, 0.95)
      let by = 0
      for (const b of [
        { w: 2.5, d: 1.75, h: 0.22, c: 0x141014, rot: 0 },
        { w: 2.15, d: 1.5, h: 0.2, c: 0x4a0d12, rot: 0.28 },
        { w: 1.75, d: 1.25, h: 0.2, c: 0x0d0d12, rot: -0.18 },
      ]) {
        const cover = std(b.c, 0.8)
        const m = solid(new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d),
          [pages, cover, cover, cover, pages, pages]))
        m.position.y = by + b.h / 2
        m.rotation.y = b.rot
        books.add(m)
        by += b.h
      }
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.55), std(0xd4af37, 0.5))
      band.position.set(-0.2, by + 0.011, 0.3)
      band.rotation.y = -0.18
      books.add(band)
      scene.add(books)

      // ── Jarrón vino + flores doradas ──
      const vase = new THREE.Group()
      vase.position.set(-3.6, 0, -1.6)
      const profile = [[0.01, 0], [0.34, 0.02], [0.5, 0.3], [0.52, 0.55], [0.36, 0.9], [0.3, 1.05], [0.4, 1.12]]
        .map((p) => new THREE.Vector2(p[0], p[1]))
      vase.add(solid(new THREE.Mesh(new THREE.LatheGeometry(profile, 12), std(0x4a0d12, 0.6))))
      const stemM = std(0x4a5a3a)
      const bloomCols = [0xd4af37, 0xf9e076, 0xb01035, 0xd4af37, 0xf9e076, 0xd4af37]
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4
        const h = 0.85 + (i % 3) * 0.22
        const r = 0.12 + (i % 2) * 0.14
        const st = solid(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, h, 5), stemM), true, false)
        st.position.set(Math.cos(a) * r, 1.05 + h / 2, Math.sin(a) * r)
        vase.add(st)
        const fl = solid(new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), std(bloomCols[i], 0.7)), true, false)
        fl.position.set(Math.cos(a) * r * 1.4, 1.6 + h * 0.72, Math.sin(a) * r * 1.4)
        vase.add(fl)
      }
      scene.add(vase)

      // ── Libro adicional abierto ──
      const openBook = new THREE.Group()
      openBook.position.set(2.5, 0.15, 0.8)
      const openBookCover = std(0x141014, 0.9)
      const openBookPages = std(0xd8cbaa, 0.9)
      const openBookBack = solid(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 3.0), openBookCover))
      openBookBack.position.z = -1.5
      const openBookFront = solid(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 3.0), [openBookPages, openBookCover, openBookCover, openBookCover, openBookPages, openBookPages]))
      openBookFront.position.z = 1.5
      openBook.add(openBookBack, openBookFront)
      // páginas simuladas con bandas
      for (let i = 0; i < 4; i++) {
        const pg = solid(new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.05, 2.9), openBookPages))
        pg.position.z = (i - 1.5) * 0.35
        pg.position.y = 0.025
        openBook.add(pg)
      }
      scene.add(openBook)

      // ── Mesa decorada: velas extras, confeti dorado, tarjeta y anillo ──
      // 4 velas adicionales en los bordes de la mesa
      for (const [x, z, color] of [[8.0, 0.2, 0xd4af37], [-8.0, 0.2, 0xd4af37], [8.0, -4.5, 0xf9e076], [-8.0, -4.5, 0xf9e076]]) {
        const g = new THREE.Group()
        g.position.set(x, 0.1, z)
        const holder = solid(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 10), std(color, 0.4)))
        holder.position.y = 0.05
        g.add(holder)
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffc46b }))
        flame.position.y = 0.16
        g.add(flame)
        const pl = new THREE.PointLight(color, 3, 5, 2)
        pl.position.y = 0.18
        g.add(pl)
        scene.add(g)
      }

      // ── Sobre la mesa: tarjeta y anillo sobre terciado sutil ──
      const token = new THREE.Group()
      token.position.set(0, 0.5, -2.5)
      // tarjeta enrollada
      const cardMat = new THREE.MeshStandardMaterial({ color: 0xf9e076, roughness: 0.6, metalness: 0.1 })
      const card = solid(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 2.0), cardMat), true, false)
      card.position.y = 0.025
      token.add(card)
      // anillo delgado sobre soporte invisible
      const ringGroup = new THREE.Group()
      ringGroup.position.y = 0.15
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 })
      const ring = solid(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 32), ringMat), true, false)
      ring.rotation.x = Math.PI / 2
      ringGroup.add(ring)
      // pequeña esfera central del anillo
      const center = solid(new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), ringMat), true, false)
      center.position.set(0, 0.12, 0)
      ringGroup.add(center)
      token.add(ringGroup)
      scene.add(token)

      // ── Confeti dorado adicional (solo visual, suspendido) ──
      const extraConfettiCount = isSoftware ? 20 : isMobile ? 40 : 70
      const extraConfettiPos = new Float32Array(extraConfettiCount * 3)
      for (let i = 0; i < extraConfettiCount; i++) {
        extraConfettiPos[i * 3] = (Math.random() - 0.5) * 12
        extraConfettiPos[i * 3 + 1] = 0.5 + Math.random() * 3
        extraConfettiPos[i * 3 + 2] = (Math.random() - 0.5) * 8
      }
      const extraConfettiGeo = new THREE.BufferGeometry()
      extraConfettiGeo.setAttribute('position', new THREE.BufferAttribute(extraConfettiPos, 3))
      const extraConfetti = new THREE.Points(extraConfettiGeo, new THREE.PointsMaterial({
        color: 0xd4af37, size: 0.03, transparent: true, opacity: 0.4,
        depthWrite: false, sizeAttenuation: true,
      }))
      scene.add(extraConfetti)

      // ── Polvo dorado suspendido (1 draw call) ──
      const dustCount = isSoftware ? 30 : isMobile ? 50 : 90
      const dustPos = new Float32Array(dustCount * 3)
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 16
        dustPos[i * 3 + 1] = 0.3 + Math.random() * 4.5
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10
      }
      const dustGeo = new THREE.BufferGeometry()
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
      const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        color: 0xd4af37, size: 0.045, transparent: true, opacity: 0.55,
        depthWrite: false, sizeAttenuation: true,
      }))
      scene.add(dust)

      // ── Danaus actual en el circuito ──
      const mats = makeMats()
      const P = buildButterfly(mats)
      P.butterfly.scale.setScalar(0.45)
      P.butterfly.position.copy(PERCH)
      P.butterfly.rotation.order = 'YXZ'
      P.butterfly.rotation.y = -2.2
      P.butterfly.traverse((o) => { if (o.isMesh) { o.castShadow = useShadows } })
      scene.add(P.butterfly)

      const curve = new THREE.CatmullRomCurve3(
        CIRCUIT.map((p) => new THREE.Vector3(...p)), true, 'centripetal')
      const curveLen = curve.getLength()
      const takeoffCurve = new THREE.QuadraticBezierCurve3(
        PERCH.clone(), new THREE.Vector3(1.4, 3.4, 1.5), curve.getPointAt(0))
      const cruiseV = curveLen / LAP_TIME

      // ── Bucle 30fps con pausa en pestaña oculta ──
      const _tan = new THREE.Vector3()
      const _ahead = new THREE.Vector3()
      const _desired = new THREE.Vector3()
      const _look = new THREE.Vector3()
      const dummy = new THREE.Object3D()
      const qRoll = new THREE.Quaternion()
      const zAxis = new THREE.Vector3(0, 0, 1)
      let rollV = 0
      let last = performance.now()
      let lastLoop = 0
      let time = 0
      let flapPhase = 0
      let mode = 'takeoff'
      let modeT = 0
      let lapT = 0
      let lapsDone = 0
      let running = true
      const speedK = reduceMotion ? 0.7 : 1

      onResize = () => {
        if (!renderer) return
        fitFov()
        renderer.setSize(window.innerWidth, window.innerHeight, false)
      }
      window.addEventListener('resize', onResize)
      onVis = () => {
        if (document.hidden) { running = false }
        else if (!disposed && !running) { running = true; last = performance.now() }
      }
      document.addEventListener('visibilitychange', onVis)

      const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

      const loop = (now) => {
        if (disposed || !running) return
        raf = requestAnimationFrame(loop)
        if (now - lastLoop < 33) return // throttle 30fps
        const dt = Math.min((now - last) / 1000 || 0.033, 0.05)
        last = now
        lastLoop = now
        time += dt

        // llamas vivas
        // (las velas de la mesa se manejan por grupo; sin array global 'flames')
        for (const _f of []) {
          // placeholder: no hay array 'flames' en esta versión
        }
        dust.rotation.y = time * 0.01

        if (mode === 'takeoff') {
          modeT += dt
          const k = Math.min(modeT / TAKEOFF_TIME, 1)
          const e = easeInOut(k)
          P.butterfly.position.copy(takeoffCurve.getPoint(e))
          takeoffCurve.getPoint(Math.min(1, e + 0.02), _ahead)
          dummy.position.copy(P.butterfly.position)
          dummy.lookAt(_ahead)
          P.butterfly.quaternion.slerp(dummy.quaternion, 1 - Math.exp(-dt * 8))
          flapPhase += dt * Math.PI * 2 * FLAP_HZ
          poseFlap(P, flapPhase, 1, { amp: 1.3, base: 0.42, vel: 0.5, bob: 0, pitchBob: 0 })
          if (k >= 1) { mode = 'fly'; modeT = 0 }
        } else {
          // frena en curvas cerradas, acelera en rectas (del demo) — lapT va más
          // allá de 1 en varias vueltas: todo muestreo con t envuelto en [0,1)
          const e = 0.004
          const lt = lapT % 1
          const t0 = curve.getTangentAt(lt)
          const t1 = curve.getTangentAt((lt + e) % 1)
          const factor = THREE.MathUtils.clamp(1.6 - (t0.angleTo(t1) / (e * curveLen)) * 9, 0.55, 1.5)
          const ds = cruiseV * speedK * factor * dt
          lapT += ds / curveLen

          const pos = curve.getPointAt(lapT % 1)
          curve.getTangentAt(lapT % 1, _tan)
          curve.getPointAt((lapT + 0.005) % 1, _ahead)
          P.butterfly.position.copy(pos)
          P.butterfly.position.y += Math.sin(time * 3.1) * 0.05
          dummy.position.copy(P.butterfly.position)
          dummy.lookAt(_ahead)
          // alabeo en curvas
          const t1b = curve.getTangentAt((lapT + 0.02) % 1)
          const cross = _tan.clone().cross(t1b).y
          const rollT = reduceMotion ? 0 : THREE.MathUtils.clamp(-cross * 7, -0.5, 0.5)
          rollV = THREE.MathUtils.lerp(rollV, rollT, 1 - Math.exp(-dt * 4))
          qRoll.setFromAxisAngle(zAxis, rollV)
          dummy.quaternion.multiply(qRoll)
          P.butterfly.quaternion.slerp(dummy.quaternion, 1 - Math.exp(-dt * 7))

          flapPhase += dt * Math.PI * 2 * FLAP_HZ
          poseFlap(P, flapPhase, 1, {
            amp: 1.25, base: 0.42, vel: 0.5,
            bob: 0.02 * Math.sin(flapPhase - 1.3), pitchBob: 0.04 * Math.cos(flapPhase - 1.1),
          })

          if (lapT >= lapsDone + 1) {
            lapsDone += 1
            bfLog('vuelta:', lapsDone)
            if (lapsDone >= LAPS) { finish('laps'); return }
          }
        }

        // cámara: sigue a la mariposa o plano general
        // (camK aleja en vertical para encuadrar con FOV estrecho)
        const camK = camera.aspect < 1 ? Math.min(2.2, 1.15 / camera.aspect) : 1
        if (followRef.current && mode === 'fly') {
          curve.getTangentAt(lapT % 1, _tan)
          _desired.copy(P.butterfly.position).addScaledVector(_tan, -4.6 * camK)
          _desired.y += 2.3 * camK
          camera.position.lerp(_desired, 1 - Math.exp(-dt * 3))
          _look.copy(P.butterfly.position).addScaledVector(_tan, 2)
          camera.lookAt(_look)
        } else {
          camera.position.lerp(followRef.current ? P.butterfly.position.clone().add(new THREE.Vector3(-3.4 * camK, 2.0 * camK, 4.2 * camK)) : WIDE_POS, 1 - Math.exp(-dt * 2.5))
          camera.lookAt(followRef.current ? P.butterfly.position : WIDE_TGT)
        }

        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(loop)
      // fundido de entrada
      requestAnimationFrame(() => { if (!disposed) wrap.style.opacity = '1' })
    } catch (err) {
      bfLog('init-fallo:', err?.message)
      window.setTimeout(() => { if (!disposed) { disposed = true; onDoneRef.current?.() } }, 1200)
    }

    return () => {
      bfLog('unmount')
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(safetyTimer)
      window.clearTimeout(fadeTimer)
      if (onResize) window.removeEventListener('resize', onResize)
      if (onVis) document.removeEventListener('visibilitychange', onVis)
      if (onCtxLost) canvas.removeEventListener('webglcontextlost', onCtxLost)
      if (renderer) {
        try {
          // Sin forceContextLoss: la app se remonta sola al inicio (preexistente)
          // y en dev StrictMode monta doble — matar el contexto aquí envenena
          // la creación inmediata del siguiente. dispose() + GC bastan.
          renderer.dispose()
        } catch { /* noop */ }
        renderer = null
      }
    }
    // onDone vive en ref: montar una sola vez por vuelo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-30"
      style={{ opacity: 0, transition: 'opacity 0.8s ease', background: 'transparent', pointerEvents: 'auto' }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <button
        onClick={toggleFollow}
        aria-pressed={follow}
        aria-label="Alternar cámara que sigue a la mariposa"
        className={`absolute bottom-5 right-5 z-10 rounded-full glass border px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors ${follow ? 'border-gold/40 text-gold-light' : 'border-white/10 text-white/60 hover:border-gold/25'}`}
        style={{ fontFamily: "'Cormorant Garamond',serif" }}
      >
        Seguir
      </button>
    </div>
  )
}
