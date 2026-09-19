import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { animate, createScope, stagger } from 'animejs'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// ── Bodegón 3D — port de mesa.txt ──
// Mesa puesta: anillo, carta, ramo, velas, bombones + mariposa de papel que
// traza un corazón en el aire. Reemplaza el vuelo gótico Danaus.
// Fondo oscuro cálido (noche tenue), sin overlays de texto, sin toasts,
// pétalos y polvo sutiles, interacción sin tiempo límite (solo manual).
// Props: onDone — abre la carta papyrus (Letter.jsx phase -> open).
// Perf: DPR cap 2, throttle 30fps, pause hidden, dispose total.
const SAFETY_TIMEOUT = 120000 // solo emergencia; la salida es manual

export default function MesaFlight({ onDone }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const [follow, setFollow] = useState(false)
  const followRef = useRef(false)
  const scopeRef = useRef(null)
  const btnsRef = useRef(null)

  const toggleFollow = () => {
    followRef.current = !followRef.current
    setFollow(followRef.current)
    // anime press
    if (scopeRef.current?.methods?.press) {
      const el = btnsRef.current?.querySelector('[data-btn="follow"]')
      if (el) scopeRef.current.methods.press(el)
    }
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
    let autoStartTimer = 0
    let noteTimer = 0
    let onResize = null
    let onVis = null
    let onCtxLost = null
    let onKey = null
    let sceneRef = null
    let controlsRef = null
    let envTexRef = null

    // ── fonts ──
    const fontHref = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=Instrument+Sans:wght@400;500;600&family=Caveat:wght@600&display=swap'
    let fontLink = document.querySelector(`link[href="${fontHref}"]`)
    let fontLinkCreated = false
    if (!fontLink) {
      fontLink = document.createElement('link')
      fontLink.rel = 'stylesheet'
      fontLink.href = fontHref
      document.head.appendChild(fontLink)
      fontLinkCreated = true
    }

    const bfDebug = new URLSearchParams(window.location.search).has('bfdebug')
    const bfLog = (...a) => { if (bfDebug) console.log('[mesa]', ...a) }
    bfLog('mount')

    const finish = (reason = '?') => {
      if (disposed) return
      bfLog('finish:', reason)
      disposed = true
      cancelAnimationFrame(raf)
      raf = 0
      window.clearTimeout(safetyTimer)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(autoStartTimer)
      window.clearTimeout(noteTimer)
      wrap.style.opacity = '0'
      fadeTimer = window.setTimeout(() => onDoneRef.current?.(), 800)
    }
    safetyTimer = window.setTimeout(() => finish('safety'), SAFETY_TIMEOUT)

    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) throw new Error('WebGL no disponible')
      let isSoftware = false
      try {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info')
        const gpuName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
        isSoftware = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpuName)
        bfLog('gpu:', gpuName || '(oculto)', 'software:', isSoftware)
      } catch { /* noop */ }

      // ── utils ──
      const clamp01 = t => Math.min(Math.max(t, 0), 1)
      const lerp = THREE.MathUtils.lerp
      const easeIO = t => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2
      const backOut = t => { const c=1.70158; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2) }
      const rnd = (a=1,b) => b===undefined ? Math.random()*a : a+Math.random()*(b-a)
      const shadows = o => { o.castShadow = true; o.receiveShadow = true; return o }
      const mat = (c, r=0.9, extra={}) => new THREE.MeshStandardMaterial({ color:c, roughness:r, flatShading:true, ...extra })

      // ── scene ── transparente para ver Cosmos estrellado (fondo bonito) + niebla sutil
      sceneRef = new THREE.Scene()
      const scene = sceneRef
      scene.background = null
      scene.fog = new THREE.Fog(0x050505, 14, 42)

      const W0 = window.innerWidth
      const H0 = window.innerHeight
      const DPRcap = isSoftware ? 1 : (window.matchMedia('(max-width: 768px)').matches ? 1.5 : 2)
      const camera = new THREE.PerspectiveCamera(42, W0/H0, 0.1, 120)
      camera.position.set(9.5, 6.5, 11.5)

      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSoftware, alpha: true })
      renderer.setClearColor(0x000000, 0)
      renderer.setSize(W0, H0, false)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPRcap))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.10

      controlsRef = new OrbitControls(camera, renderer.domElement)
      const controls = controlsRef
      controls.enableDamping = true
      controls.dampingFactor = 0.06
      controls.minDistance = 1.2
      controls.maxDistance = 20
      controls.maxPolarAngle = 1.5
      controls.target.set(0, 0.75, 0)
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5
      controls.addEventListener('start', () => controls.autoRotate = false)

      const pmrem = new THREE.PMREMGenerator(renderer)
      envTexRef = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      const envTex = envTexRef
      pmrem.dispose()

      // ── luces oscuras y cálidas — +20% iluminación ──
      const hemi = new THREE.HemisphereLight(0x2e1e14, 0x0a0806, 0.50); scene.add(hemi)
      const sun = new THREE.DirectionalLight(0xffc49a, 1.26)
      sun.position.set(6, 9, 4)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      Object.assign(sun.shadow.camera, { left:-7, right:7, top:7, bottom:-7, near:2, far:26 })
      sun.shadow.camera.updateProjectionMatrix()
      sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.03
      scene.add(sun)
      const fill = new THREE.DirectionalLight(0x4a3a2e, 0.22)
      fill.position.set(-7, 5, -5); scene.add(fill)
      // mood fijo en noche (sin transiciones claras)
      const mood = { v:1, target:1 }
      const CD = { bg:0x120c0a, sky:0x1a120e, gr:0x0a0806, sun:0xffc49a }
      const CN = { bg:0x0f0a08, sky:0x1a120e, gr:0x0a0806, sun:0x8a5a3a }
      const _c1 = new THREE.Color(), _c2 = new THREE.Color()

      // ── textures ──
      function woodTexture(){
        const cv = document.createElement('canvas'); cv.width = cv.height = 512
        const g = cv.getContext('2d')
        g.fillStyle = '#C79A67'; g.fillRect(0,0,512,512)
        for(let i=0;i<44;i++){
          const y0 = Math.random()*512, f = Math.random()*6.28, amp = 3+Math.random()*7
          g.strokeStyle = `rgba(96,62,34,${0.05+Math.random()*0.09})`
          g.lineWidth = 0.5+Math.random()*2.4; g.beginPath()
          for(let x=0;x<=512;x+=8){
            const y = y0 + Math.sin(x*0.02+f)*amp + Math.sin(x*0.007+f*2)*amp*0.6
            if (x===0) g.moveTo(x,y); else g.lineTo(x,y)
          } g.stroke()
        }
        for(let i=0;i<6;i++){
          const x = Math.random()*512, y = Math.random()*512
          g.strokeStyle = 'rgba(96,62,34,0.18)'; g.lineWidth = 1.4
          for(let r=3;r<14;r+=4){ g.beginPath(); g.ellipse(x,y,r*1.6,r,0.4,0,6.29); g.stroke() }
        }
        const t = new THREE.CanvasTexture(cv)
        t.colorSpace = THREE.SRGBColorSpace
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2,2); t.anisotropy = 8
        return t
      }
      function drawHeartPath(g, x, y, s){
        g.beginPath()
        g.moveTo(x, y+s*0.45)
        g.bezierCurveTo(x-s*1.15, y-s*0.25, x-s*0.5, y-s*0.95, x, y-s*0.4)
        g.bezierCurveTo(x+s*0.5, y-s*0.95, x+s*1.15, y-s*0.25, x, y+s*0.45)
        g.closePath()
      }
      function envelopeTexture(){
        const cv = document.createElement('canvas'); cv.width = 512; cv.height = 340
        const g = cv.getContext('2d')
        g.fillStyle = '#F5ECD7'; g.fillRect(0,0,512,340)
        for(let i=0;i<500;i++){ g.fillStyle = `rgba(120,90,60,${Math.random()*0.05})`
          g.fillRect(Math.random()*512, Math.random()*340, 1.4, 1.4) }
        g.strokeStyle = 'rgba(43,38,34,0.16)'; g.lineWidth = 3; g.lineCap = 'round'
        g.beginPath(); g.moveTo(6,10); g.lineTo(256,258); g.lineTo(506,10); g.stroke()
        g.beginPath(); g.moveTo(6,10); g.lineTo(506,10); g.stroke()
        g.strokeStyle = 'rgba(43,38,34,0.10)'; g.lineWidth = 2; g.strokeRect(4,4,504,332)
        drawHeartPath(g, 78, 282, 15); g.fillStyle = 'rgba(158,43,37,0.35)'; g.fill()
        const t = new THREE.CanvasTexture(cv)
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
        return t
      }
      const noteCv = document.createElement('canvas'); noteCv.width = 512; noteCv.height = 360
      const noteTex = new THREE.CanvasTexture(noteCv); noteTex.colorSpace = THREE.SRGBColorSpace; noteTex.anisotropy = 8
      function drawNote(){
        const g = noteCv.getContext('2d')
        g.clearRect(0,0,512,360)
        g.fillStyle = '#FCF5E4'; g.fillRect(0,0,512,360)
        for(let i=0;i<380;i++){ g.fillStyle = `rgba(120,90,60,${Math.random()*0.045})`
          g.fillRect(Math.random()*512, Math.random()*360, 1.3, 1.3) }
        g.strokeStyle = 'rgba(43,38,34,0.14)'; g.lineWidth = 2; g.setLineDash([7,7])
        g.strokeRect(16,16,480,328); g.setLineDash([])
        g.textAlign = 'center'; g.fillStyle = '#2B2622'
        g.font = '600 88px Caveat, cursive'; g.fillText('Te quiero', 256, 160)
        drawHeartPath(g, 256, 236, 26); g.fillStyle = '#CE452C'; g.fill()
        g.font = '36px Caveat, cursive'; g.fillStyle = 'rgba(43,38,34,0.72)'
        g.fillText('hoy, mañana y siempre', 256, 312)
        noteTex.needsUpdate = true
      }
      drawNote()
      if(document.fonts?.load){
        document.fonts.load('600 88px Caveat').then(() => { if (!disposed) drawNote() }).catch(()=>{})
      }
      noteTimer = window.setTimeout(() => { if (!disposed) drawNote() }, 1600)
      function petalTexture(){
        const cv = document.createElement('canvas'); cv.width = cv.height = 128
        const g = cv.getContext('2d')
        const gr = g.createRadialGradient(64,52,6, 64,64,66)
        gr.addColorStop(0,'#F5BEC4'); gr.addColorStop(0.55,'#E295A0'); gr.addColorStop(1,'#C4707E')
        g.translate(64,64)
        g.beginPath()
        g.moveTo(0,-54)
        g.bezierCurveTo(36,-40, 42,28, 0,54)
        g.bezierCurveTo(-42,28, -36,-40, 0,-54)
        g.fillStyle = gr; g.shadowColor = 'rgba(196,112,126,0.6)'; g.shadowBlur = 6; g.fill()
        const t = new THREE.CanvasTexture(cv)
        t.colorSpace = THREE.SRGBColorSpace
        return t
      }
      function radialSprite(inner, mid){
        const cv = document.createElement('canvas'); cv.width = cv.height = 128
        const g = cv.getContext('2d')
        const gr = g.createRadialGradient(64,64,2, 64,64,62)
        gr.addColorStop(0, inner); gr.addColorStop(0.4, mid); gr.addColorStop(1,'rgba(0,0,0,0)')
        g.fillStyle = gr; g.fillRect(0,0,128,128)
        return new THREE.CanvasTexture(cv)
      }
      function starTexture(){
        const cv = document.createElement('canvas'); cv.width = cv.height = 128
        const g = cv.getContext('2d')
        g.translate(64,64)
        const core = g.createRadialGradient(0,0,1, 0,0,16)
        core.addColorStop(0,'rgba(255,255,255,1)'); core.addColorStop(1,'rgba(255,255,255,0)')
        g.fillStyle = core; g.fillRect(-20,-20,40,40)
        g.lineCap = 'round'; g.shadowColor = 'rgba(255,240,200,0.9)'; g.shadowBlur = 5
        g.strokeStyle = 'rgba(255,250,235,0.95)'; g.lineWidth = 3.5
        g.beginPath(); g.moveTo(-54,0); g.lineTo(54,0); g.moveTo(0,-54); g.lineTo(0,54); g.stroke()
        g.strokeStyle = 'rgba(255,245,220,0.45)'; g.lineWidth = 2
        g.beginPath(); g.moveTo(-28,-28); g.lineTo(28,28); g.moveTo(-28,28); g.lineTo(28,-28); g.stroke()
        return new THREE.CanvasTexture(cv)
      }
      function wingTexture(kind){
        const cv = document.createElement('canvas'); cv.width = cv.height = 512
        const g = cv.getContext('2d')
        g.fillStyle = '#CE452C'; g.fillRect(0,0,512,512)
        for(let i=0;i<800;i++){
          g.fillStyle = Math.random()<0.5 ? `rgba(255,235,210,${Math.random()*0.07})`
                                          : `rgba(70,20,10,${Math.random()*0.06})`
          g.beginPath(); g.arc(Math.random()*512, Math.random()*512, 1+Math.random()*2.4, 0, 6.29); g.fill()
        }
        for(let i=0;i<15;i++){
          const y0 = 60 + Math.random()*392
          g.strokeStyle = 'rgba(85,24,12,0.10)'; g.lineWidth = 1.4
          g.beginPath(); g.moveTo(0, 256)
          g.quadraticCurveTo(180, y0, 512, y0 + (Math.random()*90-45))
          g.stroke()
        }
        for(let y=0; y<512; y+=3){
          const x = 372 + 26*Math.sin(y*0.021) + 13*Math.sin(y*0.055+1.7)
          g.fillStyle = '#282220'; g.fillRect(x, y, 512-x, 3)
        }
        if(kind==='fore'){
          for(let x=0; x<512; x+=3){
            const y = 16 + 7*Math.sin(x*0.03)
            g.fillStyle = '#282220'; g.fillRect(x, 0, 3, y)
          }
        }
        const eyes = kind==='fore' ? [[300,150,36],[322,362,29]] : [[330,250,40]]
        for(const [x,y,r] of eyes){
          g.fillStyle = '#F1E6D2'; g.beginPath(); g.arc(x,y,r,0,6.29); g.fill()
          g.fillStyle = '#7E2418'; g.beginPath(); g.arc(x,y,r*0.52,0,6.29); g.fill()
          g.fillStyle = '#F1E6D2'; g.beginPath(); g.arc(x,y,r*0.18,0,6.29); g.fill()
        }
        const t = new THREE.CanvasTexture(cv)
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
        return t
      }
      const petalTex  = petalTexture()
      const glowTex   = radialSprite('rgba(255,205,120,1)','rgba(255,130,45,0.35)')
      const smokeTex  = radialSprite('rgba(210,205,200,0.55)','rgba(190,185,180,0.22)')
      const dustTex   = radialSprite('rgba(255,240,210,0.9)','rgba(255,240,210,0.25)')
      const starTex   = starTexture()

      // ── helpers geom ──
      function strut(a, b, r0, r1, material){
        const dir = new THREE.Vector3().subVectors(b, a)
        const len = dir.length()
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 6), material)
        m.position.copy(a).addScaledVector(dir, 0.5)
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize())
        return shadows(m)
      }
      // sanitiza valores no finitos (evita boundingSphere NaN en geos fusionadas)
      function sanitizeGeometry(geo){
        const p = geo.attributes.position
        if(p){
          for(let i=0;i<p.array.length;i++){
            if(!Number.isFinite(p.array[i])) p.array[i] = 0
          }
          p.needsUpdate = true
        }
        geo.computeBoundingSphere()
        return geo
      }
      function heartGeometry(scale, depth, bevel){
        const s = new THREE.Shape()
        s.moveTo(25,25)
        s.bezierCurveTo(25,25, 20,0, 0,0)
        s.bezierCurveTo(-30,0, -30,35, -30,35)
        s.bezierCurveTo(-30,55, -10,77, 25,95)
        s.bezierCurveTo(60,77, 80,55, 80,35)
        s.bezierCurveTo(80,35, 80,0, 50,0)
        s.bezierCurveTo(35,0, 25,25, 25,25)
        const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled:true, bevelThickness:bevel,
          bevelSize:bevel, bevelSegments:2, curveSegments:14 })
        g.translate(-25,-50,0); g.scale(scale,scale,scale); g.rotateX(-Math.PI/2)
        return g
      }
      function makePetalGeo(){
        const g = new THREE.PlaneGeometry(0.2, 0.3, 6, 8)
        const p = g.attributes.position
        for(let i=0;i<p.count;i++){
          let x = p.getX(i); const y = p.getY(i)
          const ny = (y+0.15)/0.3, nx = x/0.1
          x *= 0.35 + 0.65*ny
          const z = 0.05*nx*nx*(0.35+0.65*ny) - 0.06*ny*ny*ny + 0.015*Math.sin(ny*Math.PI)
          p.setXYZ(i, x, y, z)
        }
        g.computeVertexNormals()
        return g
      }
      const petalGeo = makePetalGeo()
      const HEART = t => {
        const x = 16*Math.pow(Math.sin(t),3)
        const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)
        return { x, y }
      }

      // ── Mesa sin mantel — madera pulida a la vista ──
      {
        const table = new THREE.Group()
        const top = shadows(new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.1,0.16,48),
          new THREE.MeshStandardMaterial({ map:woodTexture(), roughness:0.55 })))
        top.position.y = -0.08; table.add(top)
        const col = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,2.2,14), mat(0x5a3418, 0.9)))
        col.position.y = -1.26; table.add(col)
        const foot = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.72,0.78,0.09,24), mat(0x5a3418, 0.9)))
        foot.position.y = -2.5; table.add(foot)
        scene.add(table)

        const floorGeo = new THREE.CircleGeometry(40, 48); floorGeo.rotateX(-Math.PI/2)
        const floor = new THREE.Mesh(floorGeo, mat(0xE3D5BC, 1))
        floor.position.y = -2.55; floor.receiveShadow = true
        scene.add(floor)
      }

      // ── interactives registry ──
      const interactives = []
      function register(id, group, radius){
        group.traverse(o => o.userData.iid = id)
        interactives.push({ id, group, radius })
      }

      // ── anillo ──
      const goldMat = new THREE.MeshPhysicalMaterial({ color:0xD8A44A, metalness:1, roughness:0.22,
        envMap:envTex, envMapIntensity:1.0 })
      const brassMat = new THREE.MeshStandardMaterial({ color:0xC08A3E, metalness:0.85, roughness:0.35,
        envMap:envTex, envMapIntensity:0.9 })
      const gemMat = new THREE.MeshPhysicalMaterial({ color:0xEAF4FF, metalness:0, roughness:0.05,
        envMap:envTex, envMapIntensity:1.6, clearcoat:1, flatShading:true })

      const ringGroup = new THREE.Group()
      ringGroup.position.set(-1.25, 0.03, 1.05); ringGroup.rotation.y = 0.4
      {
        const cushion = shadows(new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), mat(0x7E2B33, 1)))
        cushion.scale.set(1, 0.42, 1); cushion.position.y = 0.1
        ringGroup.add(cushion)
      }
      const ringFloat = new THREE.Group(); ringGroup.add(ringFloat)
      let gemGroup
      {
        const band = shadows(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.036, 22, 44), goldMat))
        ringFloat.add(band)
        gemGroup = new THREE.Group(); gemGroup.position.y = 0.185
        const crown = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.05, 0.042, 8), gemMat))
        crown.position.y = 0.026
        const pavGeo = new THREE.ConeGeometry(0.05, 0.075, 8); pavGeo.rotateX(Math.PI)
        const pav = shadows(new THREE.Mesh(pavGeo, gemMat)); pav.position.y = -0.012
        gemGroup.add(crown, pav)
        for(let i=0;i<4;i++){
          const a = i*Math.PI/2 + 0.4
          const pr = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.055, 6), goldMat)
          pr.position.set(Math.cos(a)*0.058, 0.03, Math.sin(a)*0.058)
          pr.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),
            new THREE.Vector3(-Math.cos(a)*0.4, 1, -Math.sin(a)*0.4).normalize())
          gemGroup.add(pr)
        }
        ringFloat.add(gemGroup)
      }
      scene.add(ringGroup)
      register('ring', ringGroup, 0.45)

      const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map:starTex, color:0xFFE2A0,
        transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }))
      glint.scale.setScalar(0.4); scene.add(glint)
      let glintTimer = 1.6, glintT = 0

      const burstPool = []
      {
        for(let i=0;i<22;i++){
          const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:starTex, color:0xFFD98A,
            transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }))
          m.visible = false; scene.add(m)
          burstPool.push({ m, life:0, max:1, vel:new THREE.Vector3(), s0:0.15 })
        }
      }
      function burst(pos){
        let n = 14
        for(const s of burstPool){
          if(n <= 0) break
          if(s.life > 0) continue
          n--
          s.max = s.life = rnd(0.5, 1.0)
          s.s0 = rnd(0.1, 0.22)
          s.m.position.copy(pos)
          const a = rnd(0, Math.PI*2), up = rnd(0.3, 1)
          s.vel.set(Math.cos(a)*rnd(0.3,1), up*rnd(0.7,1.4), Math.sin(a)*rnd(0.3,1))
          s.m.visible = true
        }
      }

      // ── velas ──
      const candleGroup = new THREE.Group()
      candleGroup.position.set(1.55, 0.03, -0.85)
      const flames = []
      {
        const tray = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.05, 20), brassMat))
        tray.position.y = 0.025; candleGroup.add(tray)
        const defs = [{x:-0.11, z:-0.06, h:1.05}, {x:0.13, z:0.09, h:0.72}]
        defs.forEach((c, i) => {
          const cup = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.06, 12), brassMat))
          cup.position.set(c.x, 0.08, c.z); candleGroup.add(cup)
          const body = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.065, c.h, 12), mat(0xF3E7CE, 0.6)))
          body.position.set(c.x, 0.11 + c.h/2, c.z); candleGroup.add(body)
          const dripGeo = new THREE.TorusGeometry(0.062, 0.011, 8, 16); dripGeo.rotateX(Math.PI/2)
          const drip = new THREE.Mesh(dripGeo, mat(0xF3E7CE, 0.6))
          drip.position.set(c.x, 0.11 + c.h - 0.02, c.z); candleGroup.add(drip)
          const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 5), mat(0x2A2018, 0.9))
          wick.position.set(c.x, 0.11 + c.h + 0.02, c.z); candleGroup.add(wick)

          const fg = new THREE.Group(); fg.position.set(c.x, 0.11 + c.h + 0.07, c.z)
          const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xFFB061,
            transparent:true, opacity:0.5, blending:THREE.AdditiveBlending, depthWrite:false }))
          glow.scale.setScalar(0.55)
          const outer = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.17, 8),
            new THREE.MeshBasicMaterial({ color:0xFFB25A, transparent:true, opacity:0.85,
              blending:THREE.AdditiveBlending, depthWrite:false }))
          outer.position.y = 0.075
          const inner = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.1, 8),
            new THREE.MeshBasicMaterial({ color:0xFFF1C8, transparent:true, opacity:0.95,
              blending:THREE.AdditiveBlending, depthWrite:false }))
          inner.position.y = 0.05
          fg.add(glow, outer, inner); candleGroup.add(fg)

          const light = new THREE.PointLight(0xFFAC54, 0.6, 7, 2)
          light.position.set(c.x, 0.11 + c.h + 0.18, c.z)
          if(i === 0){
            light.castShadow = true
            light.shadow.mapSize.set(512, 512)
            light.shadow.camera.near = 0.08; light.shadow.camera.far = 8
            light.shadow.bias = -0.004
          }
          candleGroup.add(light)
          flames.push({ group:fg, glow, outer, inner, light, on:true })
        })
      }
      scene.add(candleGroup)
      register('candles', candleGroup, 0.52)

      const smokePool = []
      for(let i=0;i<12;i++){
        const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:smokeTex, color:0xBDB8B2,
          transparent:true, opacity:0, depthWrite:false }))
        m.visible = false; scene.add(m)
        smokePool.push({ m, life:0, max:1, vel:new THREE.Vector3(), seed:rnd(0,9) })
      }
      function spawnSmoke(pos){
        let n = 5
        for(const s of smokePool){
          if(n <= 0) break
          if(s.life > 0) continue
          n--
          s.max = s.life = rnd(1.3, 1.9)
          s.m.position.copy(pos).add(new THREE.Vector3(rnd(-0.02,0.02), 0, rnd(-0.02,0.02)))
          s.vel.set(rnd(-0.05,0.05), rnd(0.26,0.4), rnd(-0.05,0.05))
          s.m.visible = true
        }
      }

      // ── ramo de girasoles: port fiel del demo (20 flores en domo + kraft) ──
      const bouquet = new THREE.Group()
      bouquet.position.set(-0.75, 0.03, -1.15) // orilla trasera, entre vela y anillo
      bouquet.rotation.y = 2.72 // +90° a la derecha
      const roses = []
      const petalMats = []
      {
        /* texturas girasol */
        const sunPetalTex = (() => {
          const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256
          const g = cv.getContext('2d')
          const gr = g.createLinearGradient(0,256,0,0)
          gr.addColorStop(0,'#C97B1E'); gr.addColorStop(0.3,'#F2B32B')
          gr.addColorStop(0.85,'#FFD84E'); gr.addColorStop(1,'#F0C43E')
          g.fillStyle = gr; g.fillRect(0,0,128,256)
          g.strokeStyle = 'rgba(150,90,15,0.28)'; g.lineWidth = 2
          for(let i=0;i<5;i++){
            g.beginPath()
            g.moveTo(64+(i-2)*5, 250)
            g.quadraticCurveTo(64+(i-2)*24, 130, 64+(i-2)*4, 14)
            g.stroke()
          }
          const t = new THREE.CanvasTexture(cv)
          t.colorSpace = THREE.SRGBColorSpace
          return t
        })()
        const seedTex = (() => {
          const cv = document.createElement('canvas'); cv.width = cv.height = 256
          const g = cv.getContext('2d')
          const gr = g.createRadialGradient(128,118,8, 128,128,126)
          gr.addColorStop(0,'#5A3A16'); gr.addColorStop(0.75,'#3B2409'); gr.addColorStop(1,'#241505')
          g.fillStyle = gr; g.fillRect(0,0,256,256)
          const GA = 2.39996
          for(let i=0;i<330;i++){
            const r = 100*Math.sqrt(i/330), a = i*GA
            const x = 128 + Math.cos(a)*r, y = 128 + Math.sin(a)*r
            const s = 2.4 + 2.6*(r/100)
            g.fillStyle = i%3===0 ? 'rgba(94,62,24,0.95)'
                        : i%3===1 ? 'rgba(44,27,9,0.95)' : 'rgba(72,48,19,0.9)'
            g.beginPath(); g.ellipse(x, y, s*0.72, s, a, 0, 6.29); g.fill()
          }
          g.strokeStyle = 'rgba(58,38,12,0.55)'; g.lineWidth = 3
          g.beginPath(); g.arc(128,128,104,0,6.29); g.stroke()
          for(let i=0;i<46;i++){
            const a = i/46*6.2832 + (i%2)*0.07
            const r = 109 + Math.random()*8
            g.fillStyle = ['#D9A83C','#C2BE55','#E4C24E'][i%3]
            g.beginPath()
            g.ellipse(128+Math.cos(a)*r, 128+Math.sin(a)*r, 4.6, 6.4, a, 0, 6.29); g.fill()
          }
          g.strokeStyle = 'rgba(122,86,32,0.5)'; g.lineWidth = 5
          g.beginPath(); g.arc(128,128,121,0,6.29); g.stroke()
          const t = new THREE.CanvasTexture(cv)
          t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
          return t
        })()
        const leafTex = (() => {
          const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256
          const g = cv.getContext('2d')
          const gr = g.createLinearGradient(0,256,0,0)
          gr.addColorStop(0,'#4E6B34'); gr.addColorStop(1,'#71904A')
          g.fillStyle = gr; g.fillRect(0,0,128,256)
          g.strokeStyle = 'rgba(36,56,20,0.6)'; g.lineWidth = 4
          g.beginPath(); g.moveTo(64,250); g.lineTo(64,10); g.stroke()
          g.lineWidth = 2.5
          for(let i=0;i<7;i++){
            const y = 218 - i*30
            g.beginPath(); g.moveTo(64,y); g.quadraticCurveTo(64+36, y-20, 64+54, y-44); g.stroke()
            g.beginPath(); g.moveTo(64,y); g.quadraticCurveTo(64-36, y-20, 64-54, y-44); g.stroke()
          }
          const t = new THREE.CanvasTexture(cv)
          t.colorSpace = THREE.SRGBColorSpace
          return t
        })()

        /* materiales */
        const mkPetalMat = tint => new THREE.MeshStandardMaterial({
          map:sunPetalTex, color:tint, side:THREE.DoubleSide, roughness:0.82,
          emissive:0xFF9E2E, emissiveIntensity:0 })
        petalMats.push(mkPetalMat(0xFFFFFF), mkPetalMat(0xFFF0BE), mkPetalMat(0xFFE098))
        const sunLeafMat = new THREE.MeshStandardMaterial({ map:leafTex,
          side:THREE.DoubleSide, roughness:0.9 })
        const seedSide = mat(0x2E1C08, 0.9)
        const seedTop  = new THREE.MeshStandardMaterial({ map:seedTex, roughness:0.85 })
        const calyxMat = mat(0x4E6B34, 0.9)
        const bractMat = mat(0x53713A, 0.95)
        const stemMat  = mat(0x5E7A3E, 0.9)

        /* geometrías base */
        const sunPetalGeo = sanitizeGeometry((() => {
          const g = new THREE.PlaneGeometry(0.15, 0.40, 3, 7)
          const p = g.attributes.position
          for(let i=0;i<p.count;i++){
            const x0 = p.getX(i), y = p.getY(i)
            const ny = (y + 0.20)/0.40
            const w = (1 - Math.pow(ny, 2.2))*(0.5 + 0.5*Math.sin(Math.min(ny*1.35,1)*Math.PI))
            p.setXYZ(i, x0*w, y, 0.055*ny - 0.02*ny*ny)
          }
          g.computeVertexNormals()
          return g
        })())
        const sunLeafGeo = sanitizeGeometry((() => {
          const g = new THREE.PlaneGeometry(0.34, 0.72, 4, 8)
          const p = g.attributes.position
          for(let i=0;i<p.count;i++){
            const x0 = p.getX(i), y = p.getY(i)
            const ny = (y + 0.36)/0.72
            p.setXYZ(i, x0*(Math.sin(Math.min(ny*1.15,1)*Math.PI)*0.95 + 0.05),
              y, 0.10*Math.sin(ny*Math.PI))
          }
          g.computeVertexNormals()
          return g
        })())

        /* cabeza de girasol: brácteas + 1 corona de 22 pétalos + disco + cáliz */
        function makeHead(size){
          const head = new THREE.Group()
          const mPetalRot = new THREE.Matrix4().makeRotationZ(-Math.PI/2)
          const bractParts = []
          for(let i=0;i<9;i++){
            const a = i/9*6.2832 + rnd(0, 0.35)
            const m = new THREE.Matrix4().makeRotationZ(a)
              .multiply(new THREE.Matrix4().makeScale(0.62,0.62,0.62))
              .multiply(new THREE.Matrix4().makeRotationY(0.55))
              .multiply(new THREE.Matrix4().makeTranslation(0.15,0,0))
              .multiply(mPetalRot)
            bractParts.push(sunPetalGeo.clone().applyMatrix4(m))
          }
          const bracts = new THREE.Mesh(sanitizeGeometry(mergeGeometries(bractParts)), bractMat)
          bracts.castShadow = true
          head.add(bracts)
          const phase = rnd(0, 6.28)
          const partsA = [], partsB = []
          for(let i=0;i<22;i++){
            const a  = i/22*6.2832 + phase + (Math.random()-0.5)*0.05
            const L  = 1.0*(0.92 + Math.random()*0.16)
            const R0 = 0.245 + Math.random()*0.014
            const T  = 0.12 + (Math.random()-0.5)*0.16
            const m  = new THREE.Matrix4().makeRotationZ(a)
              .multiply(new THREE.Matrix4().makeScale(L,L,L))
              .multiply(new THREE.Matrix4().makeRotationY(-T))
              .multiply(new THREE.Matrix4().makeTranslation(R0,0,0))
              .multiply(mPetalRot)
            ;(i%2 ? partsA : partsB).push(sunPetalGeo.clone().applyMatrix4(m))
          }
          for(const [parts, material] of [[partsA, petalMats[0]], [partsB, petalMats[1]]]){
            const mesh = new THREE.Mesh(sanitizeGeometry(mergeGeometries(parts)), material)
            mesh.castShadow = true
            head.add(mesh)
          }
          const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.19, 0.05, 24),
            [seedSide, seedTop, seedSide])
          disc.rotation.x = Math.PI/2
          disc.position.z = 0.012; disc.castShadow = true
          head.add(disc)
          const calyx = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.12, 10), calyxMat)
          calyx.geometry.rotateX(-Math.PI/2)
          calyx.position.z = -0.035; calyx.castShadow = true
          head.add(calyx)
          head.scale.setScalar(size)
          return head
        }

        /* envoltura kraft (igual al demo) */
        const wrapGroup = new THREE.Group()
        wrapGroup.position.set(0, 0.21, -0.52)
        wrapGroup.rotation.x = -0.28
        wrapGroup.scale.setScalar(1.5) // base grande, fondo tocando mesa
        bouquet.add(wrapGroup)
        const kraft = mat(0xC9A87C, 0.95, { side:THREE.DoubleSide })
        const mkWrap = (rT, rB, len, twist) => {
          const geo = new THREE.CylinderGeometry(rT, rB, len, 12, 1, true)
          geo.rotateY(twist); geo.rotateX(Math.PI/2)
          return shadows(new THREE.Mesh(sanitizeGeometry(geo), kraft))
        }
        wrapGroup.add(mkWrap(0.52, 0.18, 0.84, 0.4))
        wrapGroup.add(mkWrap(0.48, 0.16, 0.74, 2.1))
        const innerGeo = new THREE.CylinderGeometry(0.20, 0.15, 0.5, 10)
        innerGeo.rotateX(Math.PI/2)
        const inner = new THREE.Mesh(sanitizeGeometry(innerGeo), mat(0x6E5638, 1))
        inner.position.set(0, 0, 0.22); wrapGroup.add(inner)
        const ribbon = shadows(new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.022, 8, 26), mat(0xCE452C, 0.7)))
        ribbon.position.set(0, 0, 0.02); wrapGroup.add(ribbon)
        const knot = shadows(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat(0xCE452C, 0.7)))
        knot.position.set(0, 0.33, 0.02); wrapGroup.add(knot)
        for(const s of [1,-1]){
          const loop = shadows(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.17, 6), mat(0xCE452C, 0.7)))
          loop.position.set(0.14*s, 0.34, 0.02)
          loop.rotation.z = s*1.9
          wrapGroup.add(loop)
        }
        const MOUTH = new THREE.Vector3(0, 0.36, 0.09)

        /* 20 girasoles en domo: 1 centro + 7 + 12 */
        const defs = [
    { p:[ 0.00, 0.57, 0.32], s:0.85, d:[ 0.00, 0.18] },
    { p:[ 0.43, 0.49, 0.40], s:0.62, d:[ 0.21, 0.22] },
    { p:[ 0.19, 0.49, 0.66], s:0.62, d:[ 0.10, 0.46] },
    { p:[-0.19, 0.49, 0.66], s:0.62, d:[-0.10, 0.46] },
    { p:[-0.43, 0.49, 0.40], s:0.62, d:[-0.21, 0.22] },
    { p:[-0.34, 0.48, 0.08], s:0.60, d:[-0.17,-0.09] },
    { p:[ 0.00, 0.48,-0.06], s:0.60, d:[ 0.00,-0.14] },
    { p:[ 0.34, 0.48, 0.08], s:0.60, d:[ 0.17,-0.09] },
    { p:[ 0.00, 0.39, 0.98], s:0.50, d:[ 0.00, 0.50] },
    { p:[ 0.40, 0.39, 0.89], s:0.50, d:[ 0.20, 0.43] },
    { p:[ 0.69, 0.39, 0.65], s:0.50, d:[ 0.35, 0.25] },
    { p:[ 0.80, 0.39, 0.32], s:0.48, d:[ 0.40, 0.00] },
    { p:[ 0.69, 0.38,-0.01], s:0.48, d:[ 0.35,-0.14] },
    { p:[ 0.40, 0.38,-0.25], s:0.46, d:[ 0.20,-0.25] },
    { p:[ 0.00, 0.38,-0.34], s:0.46, d:[ 0.00,-0.30] },
    { p:[-0.40, 0.38,-0.25], s:0.46, d:[-0.20,-0.25] },
    { p:[-0.69, 0.38,-0.01], s:0.48, d:[-0.35,-0.14] },
    { p:[-0.80, 0.39, 0.32], s:0.48, d:[-0.40, 0.00] },
    { p:[-0.69, 0.39, 0.65], s:0.50, d:[-0.35, 0.25] },
    { p:[-0.40, 0.39, 0.89], s:0.50, d:[-0.20, 0.43] },
        ]
        const FACE = new THREE.Vector3(0,0,1)
        const D = new THREE.Vector3()
        for(const def of defs){
          D.set(def.d[0], 1, def.d[1]).normalize()
          const head = makeHead(def.s)
          head.position.set(...def.p)
          head.quaternion.setFromUnitVectors(FACE, D)
          head.rotateZ(rnd(0, 6.28))
          head.rotateX(rnd(-0.06, 0.06))
          bouquet.add(head)
          roses.push({ g:head, base:def.s, pulse:0, delay:0 })
          const end = new THREE.Vector3(...def.p).addScaledVector(D, -0.12)
          bouquet.add(strut(
            MOUTH.clone().add(new THREE.Vector3(rnd(-0.10,0.10), rnd(-0.05,0.05), rnd(-0.05,0.05))),
            end, 0.016, 0.010, stemMat))
        }

        /* capullos cerrados entre las flores */
        for(const [bx,by,bz,ba] of [[-0.55,0.47,0.50,0.5],[0.58,0.47,0.44,-0.6],[0.10,0.47,1.02,0.15]]){
          const bud = new THREE.Group()
          const pod = shadows(new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), calyxMat))
          pod.scale.set(1, 0.85, 1); bud.add(pod)
          for(let i=0;i<5;i++){
            const a = i/5*6.2832
            const pt = new THREE.Mesh(sunPetalGeo, petalMats[2])
            pt.scale.setScalar(0.5)
            const arm = new THREE.Group()
            arm.rotation.y = a
            pt.rotation.x = -1.15
            pt.position.y = 0.05
            arm.add(pt); bud.add(arm)
          }
          bud.position.set(bx, by, bz)
          bud.rotation.set(rnd(-0.3,0.3), ba, rnd(-0.3,0.3))
          bouquet.add(bud)
        }

        /* hojas caídas, pegadas al ramo (igual al demo) */
        const leafDefs = [
          { p:[-1.00, 0.10, 0.30], a: 2.40, x:-1.55, s:1.15 },
          { p:[ 1.05, 0.10, 0.40], a:-1.00, x:-1.62, s:1.05 },
          { p:[-0.75, 0.10, 1.00], a: 3.00, x:-1.45, s:0.95 },
          { p:[ 0.80, 0.10, 1.05], a:-2.40, x:-1.75, s:1.10 },
          { p:[-0.15, 0.10, 1.35], a: 0.50, x:-1.50, s:0.90 },
          { p:[ 1.35, 0.10, 0.75], a:-1.90, x:-1.70, s:1.00 },
          { p:[-1.30, 0.10, 0.70], a: 1.60, x:-1.60, s:1.00 },
        ]
        for(const L of leafDefs){
          const arm = new THREE.Group()
          arm.position.set(...L.p)
          arm.rotation.y = L.a
          const leaf = new THREE.Mesh(sunLeafGeo, sunLeafMat)
          leaf.scale.setScalar(L.s)
          leaf.rotation.x = L.x
          leaf.castShadow = true
          arm.add(leaf)
          bouquet.add(arm)
        }
      }
      scene.add(bouquet)
      register('bouquet', bouquet, 1.1)

      // ── carta ──
      const letterGroup = new THREE.Group()
      letterGroup.position.set(0.72, 0.03, 1.18); letterGroup.rotation.y = -0.35
      let flap, note, seal
      {
        const plain = mat(0xF3E9D3, 0.85, { flatShading:false })
        const topMat = new THREE.MeshStandardMaterial({ map:envelopeTexture(), roughness:0.85 })
        const base = shadows(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.66),
          [plain, plain, topMat, plain, plain, plain]))
        base.position.y = 0.012; letterGroup.add(base)

        flap = new THREE.Group(); flap.position.set(0, 0.026, -0.315)
        const fGeo = new THREE.BufferGeometry()
        fGeo.setAttribute('position', new THREE.Float32BufferAttribute(
          [-0.49,0,0,  0,0,0.36,  0.49,0,0], 3))
        fGeo.setIndex([0,1,2]); fGeo.computeVertexNormals()
        const flapMesh = shadows(new THREE.Mesh(fGeo, mat(0xEFE3C9, 0.85, { side:THREE.DoubleSide, flatShading:false })))
        flap.add(flapMesh)
        letterGroup.add(flap)

        seal = new THREE.Group()
        const wax = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.064, 0.016, 18), mat(0x9E2B25, 0.5)))
        wax.position.y = 0.008; seal.add(wax)
        const sealHeart = shadows(new THREE.Mesh(heartGeometry(0.00058, 0.007, 0.001), mat(0x7E1F1A, 0.5)))
        sealHeart.position.y = 0.017; seal.add(sealHeart)
        seal.position.set(0, 0.026, 0.045)
        letterGroup.add(seal)

        note = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.34),
          new THREE.MeshStandardMaterial({ map:noteTex, transparent:true, opacity:0, roughness:0.9 }))
        note.rotation.x = -Math.PI/2; note.position.set(0, 0.03, 0.02)
        note.renderOrder = 2; note.visible = false
        letterGroup.add(note)
      }
      scene.add(letterGroup)
      register('letter', letterGroup, 0.72)
      let letterT = 0, letterTarget = 0

      // ── bombones ──
      const boxGroup = new THREE.Group()
      boxGroup.position.set(2.25, 0.03, 0.55); boxGroup.rotation.y = Math.PI - 0.45
      let lid
      {
        const chocDark  = new THREE.MeshPhysicalMaterial({ color:0x3A2412, roughness:0.30,
          clearcoat:1, clearcoatRoughness:0.22 })
        const chocMilk  = new THREE.MeshPhysicalMaterial({ color:0x7A4A26, roughness:0.32,
          clearcoat:1, clearcoatRoughness:0.25 })
        const chocWhite = new THREE.MeshPhysicalMaterial({ color:0xF2E8D0, roughness:0.42,
          clearcoat:0.7, clearcoatRoughness:0.35 })
        const cocoaDark = new THREE.MeshStandardMaterial({ color:0x241505, roughness:0.95 })
        const cocoaMilk = new THREE.MeshStandardMaterial({ color:0x8A5A30, roughness:0.92 })
        const velvet = mat(0x8E2F38, 0.6, { flatShading:false })
        const linerM = mat(0xF3E7CE, 0.9, { flatShading:false })

        const base = shadows(new THREE.Mesh(heartGeometry(0.0055, 0.09, 0.012), velvet))
        base.position.y = 0.012; boxGroup.add(base)
        const liner = new THREE.Mesh(heartGeometry(0.0048, 0.006, 0.006), linerM)
        liner.position.y = 0.108; boxGroup.add(liner)

        function truffleGeo(r){
          const g = new THREE.IcosahedronGeometry(r, 2)
          const p = g.attributes.position
          for(let i=0;i<p.count;i++){
            const vx=p.getX(i), vy=p.getY(i), vz=p.getZ(i)
            const L = Math.hypot(vx,vy,vz), nx=vx/L, ny=vy/L, nz=vz/L
            const d = 1 + 0.07*Math.sin(nx*9.7)*Math.sin(ny*8.3)*Math.sin(nz*7.1)
                        + 0.045*Math.sin(nx*21 + ny*17)
            p.setXYZ(i, vx*d, vy*d*0.8, vz*d)
          }
          g.computeVertexNormals()
          return g
        }
        const domeGeo = r => new THREE.SphereGeometry(r, 24, 14, 0, 6.2832, 0, Math.PI/2)
        const drizzleMat = color => new THREE.MeshStandardMaterial({ color, roughness:0.4 })
        function addDrizzle(px, pz, color, phase){
          const pts = []
          for(let i=0;i<=16;i++){
            const u = i/16
            pts.push(new THREE.Vector3(
              (u-0.5)*0.092,
              0.040 + 0.020*Math.sin(u*Math.PI),
              0.014*Math.sin(u*3*Math.PI + phase)))
          }
          const tube = new THREE.Mesh(new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(pts), 32, 0.0042, 6), drizzleMat(color))
          tube.position.set(px, 0, pz)
          boxGroup.add(tube)
        }
        function rosetteGeo(r){
          const pts = []
          for(let i=0;i<=64;i++){
            const t = i/64, a = t*Math.PI*4.6, rr = r*(0.14 + 0.86*t)
            pts.push(new THREE.Vector3(Math.cos(a)*rr, 0.024*(1 - t*0.45), Math.sin(a)*rr))
          }
          return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 100, 0.017, 7)
        }

        const chY = 0.108
        const spots = [
          { t: Math.PI - 2.16, kind:'truffleD' },
          { t: Math.PI - 1.44, kind:'domeM'    },
          { t: Math.PI - 0.72, kind:'squareM'  },
          { t: Math.PI + 0.72, kind:'rosette'  },
          { t: Math.PI + 1.44, kind:'truffleM' },
          { t: Math.PI + 2.16, kind:'domeW'    },
        ]
        for(const s of spots){
          const hp = HEART(s.t)
          const x = hp.x*0.0132, z = (hp.y + 2.5)*0.0132
          let m
          if(s.kind === 'truffleD'){
            m = shadows(new THREE.Mesh(truffleGeo(0.046), cocoaDark))
            m.position.set(x, chY + 0.034, z)
          } else if(s.kind === 'truffleM'){
            m = shadows(new THREE.Mesh(truffleGeo(0.046), cocoaMilk))
            m.position.set(x, chY + 0.034, z)
          } else if(s.kind === 'domeM'){
            m = shadows(new THREE.Mesh(domeGeo(0.052), chocMilk))
            m.position.set(x, chY, z)
            addDrizzle(x, z, 0xF2E8D0, rnd(0,3))
          } else if(s.kind === 'domeW'){
            m = shadows(new THREE.Mesh(domeGeo(0.052), chocWhite))
            m.position.set(x, chY, z)
            addDrizzle(x, z, 0x3A2412, rnd(0,3))
          } else if(s.kind === 'squareM'){
            m = shadows(new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.048, 0.076), chocMilk))
            m.position.set(x, chY + 0.024, z)
            m.rotation.y = Math.PI/4
            const emb = new THREE.Mesh(heartGeometry(0.00075, 0.004, 0.0008), chocDark)
            emb.position.set(x, chY + 0.050, z)
            emb.rotation.y = Math.PI/4
            boxGroup.add(emb)
          } else {
            const disk = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.056, 0.012, 16), chocDark))
            disk.position.set(x, chY + 0.006, z)
            boxGroup.add(disk)
            m = shadows(new THREE.Mesh(rosetteGeo(0.05), chocMilk))
            m.position.set(x, chY + 0.012, z)
          }
          boxGroup.add(m)
        }
        const heartChoc = shadows(new THREE.Mesh(heartGeometry(0.0016, 0.022, 0.004), chocWhite))
        heartChoc.position.set(0, chY + 0.018, 0.012)
        boxGroup.add(heartChoc)
        for(const [dx,dz] of [[-0.055,0.075],[0.055,0.075],[0,-0.24]]){
          const pearl = shadows(new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 8), goldMat))
          pearl.position.set(dx, chY + 0.011, dz)
          boxGroup.add(pearl)
        }

        // tapa corazón abisagrada atrás — con forro interior y filete dorado
        lid = new THREE.Group(); lid.position.set(0, 0.135, 0.32)
        const lidOuter = shadows(new THREE.Mesh(heartGeometry(0.0059, 0.055, 0.01), velvet))
        lidOuter.position.set(0, 0.028, -0.32)
        const lidInner = new THREE.Mesh(heartGeometry(0.0052, 0.008, 0.006), linerM)
        lidInner.position.set(0, -0.008, -0.32)
        const lidGold = new THREE.Mesh(heartGeometry(0.00585, 0.004, 0.003), new THREE.MeshStandardMaterial({ color:0xd4af37, metalness:0.65, roughness:0.35 }))
        lidGold.position.set(0, 0.018, -0.32)
        const lidKnob = shadows(new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color:0xd4af37, metalness:0.75, roughness:0.28 })))
        lidKnob.position.set(0, 0.058, -0.02)
        lid.add(lidOuter, lidInner, lidGold, lidKnob)
        boxGroup.add(lid)
      }
      scene.add(boxGroup)
      register('box', boxGroup, 0.5)
      let boxT = 0, boxTarget = 0

      // ── pluma ──
      {
        const pen = new THREE.Group(); pen.position.set(-0.5, 0.03, 0.42); pen.rotation.y = 1.0
        const shaft = shadows(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.46, 10), mat(0x2E2823, 0.5)))
        shaft.rotation.z = Math.PI/2; shaft.position.y = 0.022; pen.add(shaft)
        const nibGeo = new THREE.ConeGeometry(0.018, 0.08, 8); nibGeo.rotateZ(-Math.PI/2)
        const nib = shadows(new THREE.Mesh(nibGeo, brassMat))
        nib.position.set(0.27, 0.022, 0); pen.add(nib)
        const capGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8); capGeo.rotateZ(Math.PI/2)
        const cap = shadows(new THREE.Mesh(capGeo, brassMat))
        cap.position.set(-0.25, 0.022, 0); pen.add(cap)
        scene.add(pen)
      }

      // ── pétalos quietos + lluvia ──
      const petalMat = new THREE.MeshStandardMaterial({ map:petalTex, transparent:true, alphaTest:0.25,
        side:THREE.DoubleSide, roughness:0.9 })
      for(let i=0;i<15;i++){
        const p = new THREE.Mesh(petalGeo, petalMat)
        const a = rnd(0, 6.28), r = Math.sqrt(rnd()) * 2.5 + 0.45
        p.position.set(Math.cos(a)*r, 0.024, Math.sin(a)*r)
        p.rotation.set(-Math.PI/2 + rnd(-0.25,0.25), rnd(0, 6.28), rnd(-0.2,0.2))
        p.scale.setScalar(rnd(0.8, 1.35))
        scene.add(p)
      }
      const fallPool = []
      for(let i=0;i<34;i++){
        const m = new THREE.Mesh(petalGeo, petalMat)
        m.visible = false; scene.add(m)
        fallPool.push({ m, free:true, bx:0, bz:0, vy:0, vx:0, vz:0,
          sway:0, ph:0, spin:new THREE.Vector3(), rest:0.02, land:0, t:0, s0:1 })
      }
      function spawnPetal(x, y, z, vx=0, vz=0){
        const p = fallPool.find(p => p.free); if(!p) return
        p.free = false; p.m.visible = true; p.t = 0
        p.bx = x; p.bz = z
        p.m.position.set(x, y, z)
        p.vy = -rnd(0.28, 0.46)
        p.vx = vx; p.vz = vz
        p.sway = rnd(0.12, 0.35); p.ph = rnd(0, 6.28)
        p.spin.set(rnd(-2,2), rnd(-2,2), rnd(-2,2))
        p.rest = rnd(0.024, 0.05)
        p.land = rnd(6, 11)
        p.s0 = rnd(0.75, 1.2)
        p.m.scale.setScalar(p.s0)
        p.m.rotation.set(rnd(0,3), rnd(0,3), rnd(0,3))
      }
      for(let i=0;i<6;i++) spawnPetal(rnd(-2.2,2.2), rnd(1.5,3), rnd(-2,2))

      // ── polvo ──
      const DUST_N = 110
      const dustGeo = new THREE.BufferGeometry()
      const dustBase = new Float32Array(DUST_N*3), dustPh = new Float32Array(DUST_N)
      for(let i=0;i<DUST_N;i++){
        dustBase[i*3]   = rnd(-2.6, 2.6)
        dustBase[i*3+1] = rnd(0.1, 2.9)
        dustBase[i*3+2] = rnd(-2.2, 2.2)
        dustPh[i] = rnd(0, 6.28)
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustBase.slice(), 3))
      const dustMat = new THREE.PointsMaterial({ map:dustTex, size:0.05, transparent:true, opacity:0.5,
        depthWrite:false, color:0xFFE9C0 })
      scene.add(new THREE.Points(dustGeo, dustMat))

      // ── partículas de luz dorada por toda la escena ──
      const LIGHT_N = 90
      const lightGeo = new THREE.BufferGeometry()
      const lightBase = new Float32Array(LIGHT_N*3), lightPh = new Float32Array(LIGHT_N)
      for(let i=0;i<LIGHT_N;i++){
        lightBase[i*3]   = rnd(-4.2, 4.2)
        lightBase[i*3+1] = rnd(0.25, 3.4)
        lightBase[i*3+2] = rnd(-3.2, 3.2)
        lightPh[i] = rnd(0, 6.28)
      }
      lightGeo.setAttribute('position', new THREE.BufferAttribute(lightBase.slice(), 3))
      const lightMat = new THREE.PointsMaterial({ map:glowTex, size:0.11, transparent:true, opacity:0.72,
        depthWrite:false, blending:THREE.AdditiveBlending, color:0xf9e076 })
      const lightPoints = new THREE.Points(lightGeo, lightMat)
      scene.add(lightPoints)

      // ── onda de luz del ramo (glow + chispas + luz viajera, sin toasts) ──
      const glowPool = [], sparkPool = []
      for(let i=0;i<16;i++){
        const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xFFC35E,
          transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }))
        m.visible = false; scene.add(m)
        glowPool.push({ m, life:0, max:1, s0:0.5 })
      }
      for(let i=0;i<28;i++){
        const m = new THREE.Sprite(new THREE.SpriteMaterial({ map:starTex, color:0xFFDD8A,
          transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }))
        m.visible = false; scene.add(m)
        sparkPool.push({ m, life:0, max:1, vel:new THREE.Vector3(), s0:0.12 })
      }
      const pulseLight = new THREE.PointLight(0xFFC46B, 0, 7, 2)
      scene.add(pulseLight)
      let wash = 0
      const rippleQueue = []
      const _wv = new THREE.Vector3()
      function glowAt(worldPos, scale){
        const g = glowPool.find(g => g.life<=0)
        if(g){
          g.max = g.life = 0.75
          g.s0 = 0.85*scale
          g.m.position.copy(worldPos); g.m.position.y += 0.05
          g.m.visible = true
        }
        let n = 3
        for(const s of sparkPool){
          if(n<=0) break
          if(s.life>0) continue
          n--
          s.max = s.life = rnd(0.45, 0.8)
          s.s0 = rnd(0.08, 0.16)*scale
          s.m.position.copy(worldPos)
          const a = rnd(0,6.28)
          s.vel.set(Math.cos(a)*rnd(0.2,0.5), rnd(0.3,0.8), Math.sin(a)*rnd(0.2,0.5))
          s.m.visible = true
        }
        pulseLight.position.copy(worldPos); pulseLight.position.y += 0.25
        pulseLight.intensity = 2.4
        wash = Math.min(1, wash + 0.45)
      }
      function lightRipple(origin){
        bouquet.updateMatrixWorld(true)
        for(const r of roses){
          r.g.getWorldPosition(_wv)
          rippleQueue.push({ r, at: time + _wv.distanceTo(origin)*0.32, pos:_wv.clone(), s:r.base })
        }
        wash = Math.max(wash, 0.2)
      }

      // ── mariposa origami corazón ──
      function wingGeometry(verts, tris){
        let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9
        for(const v of verts){ minX=Math.min(minX,v[0]); maxX=Math.max(maxX,v[0])
                                minY=Math.min(minY,v[1]); maxY=Math.max(maxY,v[1]) }
        const pos=[], uv=[]
        for(const v of verts){
          pos.push(v[0], v[2], v[1])
          uv.push((v[0]-minX)/(maxX-minX), (v[1]-minY)/(maxY-minY))
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3))
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2))
        geo.setIndex(tris.flat())
        geo.computeVertexNormals()
        return geo
      }
      const foreGeo = wingGeometry(
        [[0.14,0.55,0.00],[1.55,1.05,-0.05],[1.80,0.30,-0.04],[0.48,-0.30,0.00],[0.62,0.42,0.12]],
        [[0,4,1],[1,4,2],[2,4,3],[3,4,0]]
      )
      const hindGeo = wingGeometry(
        [[0.12,-0.14,0.00],[1.14,-0.42,-0.04],[1.02,-1.00,-0.03],[0.12,-0.80,0.00],[0.52,-0.52,0.10]],
        [[0,4,1],[1,4,2],[2,4,3],[3,4,0]]
      )
      const wingMatFore = new THREE.MeshStandardMaterial({ map:wingTexture('fore'),
        side:THREE.DoubleSide, roughness:0.88, flatShading:true, shadowSide:THREE.DoubleSide })
      const wingMatHind = new THREE.MeshStandardMaterial({ map:wingTexture('hind'),
        side:THREE.DoubleSide, roughness:0.88, flatShading:true, shadowSide:THREE.DoubleSide })

      function buildWingSide(){
        const group = new THREE.Group()
        const fore = new THREE.Group()
        const fm = new THREE.Mesh(foreGeo, wingMatFore); fm.castShadow = true
        fore.add(fm)
        const hind = new THREE.Group()
        const hm = new THREE.Mesh(hindGeo, wingMatHind); hm.castShadow = true
        hind.add(hm)
        group.add(fore, hind)
        return { group, fore, hind }
      }

      const butterfly = new THREE.Group()
      butterfly.scale.setScalar(0.3)
      const bodyGroup = new THREE.Group()
      {
        const secs = [[-1.04,0.004,0.03],[-0.55,0.10,0.14],[0.12,0.16,0.185],[0.5,0.10,0.13],[0.68,0.015,0.09]]
        const pos = []
        for(let i=0;i<secs.length-1;i++){
          const [z0,w0,h0] = secs[i], [z1,w1,h1] = secs[i+1]
          pos.push( w0,0,z0,  0,h0,z0,  0,h1,z1,   w0,0,z0,  0,h1,z1,  w1,0,z1)
          pos.push(-w0,0,z0,  0,h1,z1,  0,h0,z0,  -w0,0,z0, -w1,0,z1,  0,h1,z1)
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3))
        geo.computeVertexNormals()
        const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
          color:0x2E2823, roughness:0.75, flatShading:true, side:THREE.DoubleSide }))
        body.castShadow = true
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085,0), mat(0x2E2823,0.7))
        head.position.set(0,0.16,0.74); head.castShadow = true
        bodyGroup.add(body, head)
        for(const s of [1,-1]){
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.035*s,0.2,0.78),
            new THREE.Vector3(0.28*s,0.46,1.02),
            new THREE.Vector3(0.44*s,0.40,1.22) ])
          bodyGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve,10,0.013,5), mat(0x2E2823,0.7)))
        }
      }
      butterfly.add(bodyGroup)
      const wingR = buildWingSide(); wingR.group.position.y = 0.10
      const wingL = buildWingSide(); wingL.group.position.y = 0.10; wingL.group.scale.x = -1
      butterfly.add(wingR.group, wingL.group)

      const perchPos = new THREE.Vector3(-0.60, 0.80, -1.42)
      butterfly.position.copy(perchPos)
      butterfly.rotation.y = 0.62
      scene.add(butterfly)
      register('butterfly', butterfly, 0.4)

      // luz propia de la mariposa — bien iluminada (sin afectar bombones)
      const bfLight = new THREE.PointLight(0xffe9a8, 2.8, 3.8, 1.5)
      bfLight.position.set(0, 0.14, 0)
      butterfly.add(bfLight)
      const bfHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xffe9a8, transparent:true, opacity:0.44, blending:THREE.AdditiveBlending, depthWrite:false }))
      bfHalo.scale.setScalar(0.92)
      bfHalo.position.set(0, 0.12, 0)
      butterfly.add(bfHalo)
      // alas más luminosas
      wingMatFore.emissive = new THREE.Color(0x4a3518)
      wingMatFore.emissiveIntensity = 0.32
      wingMatHind.emissive = new THREE.Color(0x4a2020)
      wingMatHind.emissiveIntensity = 0.26

      function applyWings(phase, fBase, fAmp, hBase, hAmp){
        // flap natural: downstroke 60% / upstroke 40% con lag variable hind
        const raw = Math.sin(phase)
        const shape = raw > 0 ? Math.pow(raw, 0.55) : -Math.pow(Math.abs(raw), 1.35)
        const raw2 = Math.sin(phase - 0.9 - 0.2*Math.sin(phase*0.5))
        const shape2 = raw2 > 0 ? Math.pow(raw2, 0.6) : -Math.pow(Math.abs(raw2), 1.3)
        wingR.fore.rotation.z = wingL.fore.rotation.z = fBase + fAmp*shape
        wingR.hind.rotation.z = wingL.hind.rotation.z = hBase + hAmp*shape2
      }

      const HEART_ROUTE = (() => {
        const pts = []
        const N = 64, s = 0.215, cz = -0.4
        for(let i=0;i<N;i++){
          const t = i/N*6.2832
          const hp = HEART(t)
          const h = 1.55 + 0.42*(0.5 - 0.5*Math.cos(2*t)) + 0.07*Math.sin(t)*Math.sin(t)
          pts.push(new THREE.Vector3(hp.x*s, h, hp.y*s + cz))
        }
        return new THREE.CatmullRomCurve3(pts, true, 'centripetal')
      })()
      const routeLen = HEART_ROUTE.getLength()

      // línea de recorrido eliminada por petición (sin trazo visible)

      const fleckPool = []
      const fleckCols = [0xCE452C, 0xF1E6D2, 0x35302B, 0xE8A13D]
      {
        const fg = new THREE.PlaneGeometry(0.07, 0.045)
        for(let i=0;i<26;i++){
          const m = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({
            color:0xCE452C, transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false }))
          m.visible = false; scene.add(m)
          fleckPool.push({ m, life:0, max:1, vel:new THREE.Vector3(), spin:new THREE.Vector3() })
        }
      }
      function spawnFleck(origin){
        const f = fleckPool.find(f => f.life<=0); if(!f) return
        f.m.material.color.setHex(fleckCols[Math.random()*fleckCols.length|0])
        f.max = f.life = rnd(1.5, 2.3)
        f.m.position.copy(origin).add(new THREE.Vector3(rnd(-0.06,0.06), -0.04, rnd(-0.06,0.06)))
        f.vel.set(rnd(-0.18,0.18), rnd(-0.05,0.1), rnd(-0.18,0.18))
        f.spin.set(rnd(-4,4), rnd(-4,4), rnd(-4,4))
        f.m.rotation.set(rnd(0,3), rnd(0,3), rnd(0,3))
        f.m.visible = true
      }

      const bf = {
        mode:'perch',
        paused:false, t:0, lap:0,
        phase:rnd(0,6), factorS:1,
        takeT0:0,
        takeCurve:new THREE.QuadraticBezierCurve3(
          perchPos.clone(),
          perchPos.clone().add(new THREE.Vector3(0.5, 1.7, 0.9)),
          HEART_ROUTE.getPointAt(0)),
      }
      function startFlight(){
        if(bf.mode !== 'perch') return
        bf.mode = 'takeoff'; bf.takeT0 = time
      }

      const circlePts = new THREE.EllipseCurve(0,0,1,1).getPoints(56)
      const markerGeo = new THREE.BufferGeometry().setFromPoints(circlePts)
      markerGeo.rotateX(-Math.PI/2)
      const marker = new THREE.LineLoop(markerGeo,
        new THREE.LineDashedMaterial({ color:0xCE452C, dashSize:0.07, gapSize:0.05,
          transparent:true, opacity:0 }))
      marker.computeLineDistances()
      scene.add(marker)
      let markerOp = 0

      const VIEWS = {
        general:  { p:[5.6, 3.9, 7.2],   t:[0, 0.75, 0] },
        butterfly:{ p:[2.6, 3.4, 4.8],   t:[0, 2.0, -0.4] },
        ring:     { p:[-0.1, 1.25, 2.6], t:[-1.25, 0.45, 1.05] },
        letter:   { p:[0.95, 1.7, 3.1],  t:[0.72, 0.12, 1.18] },
        bouquet:  { p:[0.4, 2.05, 1.8],  t:[-0.62, 0.55, -1.44] },
        candles:  { p:[3.2, 1.5, 1.2],   t:[1.55, 0.7, -0.85] },
        box:      { p:[3.0, 1.35, 1.9],  t:[2.25, 0.15, 0.55] },
      }
      let camTween = null
      function flyTo(view, dur = 1.5){
        camTween = { p0:camera.position.clone(), t0:controls.target.clone(),
          p1:new THREE.Vector3(...view.p), t1:new THREE.Vector3(...view.t), k:0, dur }
      }
      let followB = false

      // ── ray + tip ──
      const ray = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const TV = new THREE.Vector3()
      let mouseOn = false, mx = 0, my = 0, hoverId = null, legendHover = null
      let downX = 0, downY = 0

      function pickAt(cx, cy){
        ndc.set(cx/window.innerWidth*2 - 1, -(cy/window.innerHeight)*2 + 1)
        ray.setFromCamera(ndc, camera)
        const hits = ray.intersectObjects(interactives.map(i => i.group), true)
        if(!hits.length) return null
        let o = hits[0].object
        while(o && !o.userData.iid) o = o.parent
        return o ? o.userData.iid : null
      }

      const onPointerMove = e => { mx = e.clientX; my = e.clientY; mouseOn = true }
      const onPointerDown = e => { downX = e.clientX; downY = e.clientY; camTween = null; followB = false; followRef.current = false; setFollow(false) }
      const onPointerUp = e => {
        if(Math.hypot(e.clientX - downX, e.clientY - downY) >= 7) return
        const id = pickAt(e.clientX, e.clientY)
        if(id && actions[id]) actions[id]()
      }
      const onPointerLeave = () => { mouseOn = false }
      renderer.domElement.addEventListener('pointermove', onPointerMove)
      renderer.domElement.addEventListener('pointerdown', onPointerDown)
      renderer.domElement.addEventListener('pointerup', onPointerUp)
      renderer.domElement.addEventListener('pointerleave', onPointerLeave)

      // ── actions ── sin toasts, sin tiempo: todo manual
      let ringKick = 0, flamesOn = true, rainBoost = 0
      const actions = {
        butterfly(){
          if(bf.mode === 'perch'){
            startFlight()
            flyTo(VIEWS.butterfly); followB = true; followRef.current = true; setFollow(true)
          } else {
            bf.paused = !bf.paused
          }
        },
        ring(){
          ringKick = 1
          gemGroup.getWorldPosition(TV); TV.y += 0.09
          burst(TV)
          flyTo(VIEWS.ring)
        },
        letter(){
          letterTarget = letterTarget ? 0 : 1
          flyTo(VIEWS.letter)
        },
        bouquet(){
          bouquet.updateMatrixWorld(true)
          lightRipple(bouquet.localToWorld(new THREE.Vector3(0, 0.6, 0.3)))
          roses.forEach((r,i) => r.delay = 0.07*i)
          for(let i=0;i<6;i++){
            roses[i%roses.length].g.getWorldPosition(TV)
            spawnPetal(TV.x, TV.y + 0.18, TV.z, rnd(-0.25,0.25), rnd(-0.25,0.25))
          }
          flyTo(VIEWS.bouquet)
        },
        candles(){
          flamesOn = !flamesOn
          flames.forEach(f => {
            if(!flamesOn){ f.group.getWorldPosition(TV); spawnSmoke(TV) }
            f.on = flamesOn
          })
          flyTo(VIEWS.candles)
        },
        box(){
          boxTarget = boxTarget ? 0 : 1
          flyTo(VIEWS.box)
        },
      }

      // ── keyboard ── sin toasts, L solo cambia luz sutil
      const KEYVIEW = { '1':'general','2':'butterfly','3':'ring','4':'letter','5':'bouquet','6':'candles','7':'box' }
      onKey = e => {
        const k = e.key.toLowerCase()
        if(KEYVIEW[k]){
          const id = KEYVIEW[k]
          const v = VIEWS[id]
          if (v) flyTo(v)
          followB = (id === 'butterfly')
          followRef.current = followB
          setFollow(followB)
          if(id === 'butterfly' && bf.mode === 'perch') startFlight()
          else if(id !== 'butterfly' && actions[id]) actions[id]()
        }
        else if(k === 'p'){
          rainBoost = 3.4
        }
        else if(k === 'l'){
          mood.target = mood.target ? 0 : 1
        }
      }
      window.addEventListener('keydown', onKey)
      onCtxLost = (e) => { e.preventDefault(); finish('contextlost') }
      canvas.addEventListener('webglcontextlost', onCtxLost)

      // ── clock + loop ──
      const clock = new THREE.Clock()
      let time = 0, petalTimer = 0, fleckTimer = 0
      const _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3()
      const UP = new THREE.Vector3(0,1,0)
      const AXIS_Z = new THREE.Vector3(0,0,1)
      const dummy = new THREE.Object3D()
      const qRoll = new THREE.Quaternion()
      const rollS = { v:0 }
      const followOffset = new THREE.Vector3(2.2, 1.2, 2.9)

      onResize = () => {
        if (!renderer || disposed) return
        const W = window.innerWidth, H = window.innerHeight
        camera.aspect = W/H
        camera.updateProjectionMatrix()
        renderer.setSize(W, H, false)
      }
      window.addEventListener('resize', onResize)
      let lastLoop = 0
      let lastPick = 0
      // loop se declara abajo; onVis lo usa por closure solo cuando el evento dispara
      let loopFn = null
      onVis = () => {
        if (document.hidden) {
          if (raf) { cancelAnimationFrame(raf); raf = 0 }
        } else if (!disposed && !raf && loopFn) {
          lastLoop = performance.now()
          try { clock.getDelta() } catch {}
          raf = requestAnimationFrame(loopFn)
        }
      }
      document.addEventListener('visibilitychange', onVis)

      autoStartTimer = window.setTimeout(() => { if(!disposed && bf.mode === 'perch') startFlight() }, 2200)

      const loop = (now) => {
        loopFn = loop
        if (disposed) return
        raf = requestAnimationFrame(loop)
        if (now - lastLoop < 33) return // 30fps como Cosmos/Butterfly — dt compensa, mismo diseño
        lastLoop = now
        const dt = Math.min(clock.getDelta(), 0.08) // cap 80ms → velocidad estable en cualquier dispositivo
        time += dt

        // mood fijo oscuro — fondo transparente (se ve el cosmos estrellado)
        const m = 1
        mood.v = lerp(mood.v, mood.target, 1 - Math.exp(-dt*2.2))
        // scene.background es null (transparente) → solo niebla
        scene.fog.color.lerpColors(_c1.setHex(CD.bg), _c2.setHex(CN.bg), m)
        hemi.color.lerpColors(_c1.setHex(CD.sky), _c2.setHex(CN.sky), m)
        hemi.groundColor.lerpColors(_c1.setHex(CD.gr), _c2.setHex(CN.gr), m)
        hemi.intensity = 0.50
        sun.color.lerpColors(_c1.setHex(CD.sun), _c2.setHex(CN.sun), m)
        sun.intensity = 1.26
        fill.intensity = 0.22
        goldMat.envMapIntensity = 1.38
        gemMat.envMapIntensity  = 1.68
        brassMat.envMapIntensity = 1.20
        renderer.toneMappingExposure = 1.10
        dustMat.opacity = 0.26

        // camera tween / follow
        if(camTween){
          camTween.k += dt/camTween.dur
          const e = easeIO(clamp01(camTween.k))
          camera.position.lerpVectors(camTween.p0, camTween.p1, e)
          controls.target.lerpVectors(camTween.t0, camTween.t1, e)
          camera.lookAt(controls.target)
          if(camTween.k >= 1) camTween = null
        } else if((followB || followRef.current) && bf.mode === 'fly'){
          // inercia natural con predictor
          _v3.copy(HEART_ROUTE.getTangentAt(bf.t)).multiplyScalar(0.6)
          _v2.copy(butterfly.position).add(followOffset).add(_v3)
          camera.position.lerp(_v2, 1 - Math.exp(-dt*1.8))
          controls.target.lerp(butterfly.position, 1 - Math.exp(-dt*3.5))
          controls.update()
        } else {
          controls.update()
        }

        // ring
        if(ringKick > 0) ringKick = Math.max(0, ringKick - dt/0.9)
        const kick = ringKick
        ringFloat.position.y = 0.42 + Math.sin(time*1.3)*0.025 + (kick > 0 ? Math.sin((1-kick)*Math.PI)*0.2 : 0)
        ringFloat.rotation.y += dt*(0.55 + kick*5)
        ringFloat.rotation.z = 0.08*Math.sin(time*0.7)
        glintTimer -= dt
        if(glintTimer <= 0){ glintTimer = rnd(2.2, 5); glintT = 0.5 }
        if(glintT > 0){
          glintT -= dt
          gemGroup.getWorldPosition(glint.position); glint.position.y += 0.09
          const k = 1 - Math.abs(glintT/0.5*2 - 1)
          glint.material.opacity = k*0.9
          glint.scale.setScalar(0.25 + k*0.35)
          glint.material.rotation += dt*3
          glint.visible = true
        } else glint.visible = false

        // candles flicker
        flames.forEach((f, i) => {
          f.group.visible = f.on
          const n = Math.sin(time*11+i*3)*0.5 + Math.sin(time*23+i*7)*0.3 + Math.sin(time*5.3+i)*0.2
          f.light.intensity = f.on ? lerp(0.6, 3.1, m)*(1 + 0.16*n) : 0
          if(f.on){
            const n2 = Math.sin(time*17 + i*5)
            f.outer.scale.set(1 + 0.1*n, 1 + 0.16*n2, 1 + 0.1*n)
            f.inner.scale.set(1 + 0.08*n2, 1 + 0.14*n, 1)
            f.glow.material.opacity = (0.38 + 0.28*m)*(1 + 0.1*n)
            f.glow.scale.setScalar(0.55*(1 + 0.08*n))
          }
        })

        // letter open
        letterT += (letterTarget - letterT)*Math.min(1, dt*2.4)
        {
          const e = easeIO(letterT)
          flap.rotation.x = -2.35*easeIO(clamp01(e*1.7))
          const a = flap.rotation.x, L = 0.36
          const tipY = -L*Math.sin(a) + 0.026, tipZ = L*Math.cos(a) - 0.315
          const det = easeIO(clamp01((e - 0.12)/0.4))
          seal.position.set(lerp(0, 0.62, det),
            lerp(tipY, 0.028, det) + Math.sin(det*Math.PI)*0.16,
            lerp(tipZ, 0.22, det))
          seal.rotation.y = det*2.6; seal.rotation.x = det*0.15
          const ne = easeIO(clamp01((e - 0.45)/0.5))
          note.visible = ne > 0.01
          note.material.opacity = ne
          note.position.y = 0.03 + ne*0.5 + ne*Math.sin(time*1.7)*0.018
          note.rotation.z = Math.sin(time*0.9)*0.05*ne
        }

        // box
        boxT += (boxTarget - boxT)*Math.min(1, dt*2.6)
        lid.rotation.x = 1.9*(boxTarget === 1 ? backOut(clamp01(boxT)) : easeIO(clamp01(boxT)))

        // onda de luz: enciende cada flor cuando la luz llega
        for(let i=rippleQueue.length-1; i>=0; i--){
          const q = rippleQueue[i]
          if(time >= q.at){
            glowAt(q.pos, q.s)
            q.r.pulse = 0.65
            rippleQueue.splice(i,1)
          }
        }
        // resplandores
        for(const g of glowPool){
          if(g.life<=0) continue
          g.life -= dt
          if(g.life<=0){ g.m.visible=false; g.m.material.opacity=0; continue }
          const f = g.life/g.max
          g.m.material.opacity = 0.85*Math.sin(f*Math.PI)
          g.m.scale.setScalar(g.s0*(1.3 - 0.5*f))
        }
        // chispas
        for(const s of sparkPool){
          if(s.life<=0) continue
          s.life -= dt
          if(s.life<=0){ s.m.visible=false; s.m.material.opacity=0; continue }
          const f = s.life/s.max
          s.vel.y -= 0.6*dt
          s.m.position.addScaledVector(s.vel, dt)
          s.m.material.opacity = f
          s.m.scale.setScalar(s.s0*(0.6 + f))
          s.m.material.rotation += dt*3
        }
        // luz viajera + lavado dorado en pétalos
        pulseLight.intensity *= Math.exp(-dt*5.5)
        wash = Math.max(0, wash - dt*0.9)
        for(const pm of petalMats) pm.emissiveIntensity = wash*0.35

        // bouquet pulse
        for(const r of roses){
          if(r.delay > 0){ r.delay -= dt; if(r.delay <= 0) r.pulse = 0.65 }
          if(r.pulse > 0){
            r.pulse -= dt
            const k = 1 - Math.max(r.pulse, 0)/0.65
            r.g.scale.setScalar(r.base*(1 + 0.13*Math.sin(k*Math.PI)))
          } else r.g.scale.setScalar(r.base)
        }

        // butterfly
        if(bf.mode === 'perch'){
          bf.phase += dt*2.4 // +20%
          applyWings(bf.phase, 1.22, 0.14, 1.05, 0.11)
          butterfly.position.y = perchPos.y + 0.008*Math.sin(time*1.6)
          bodyGroup.position.y = 0
          rollS.v = 0
        }
        else if(bf.mode === 'takeoff'){
          const k = Math.min((time - bf.takeT0)/1.67, 1) // +20% (2.0→1.67s)
          const e = easeIO(k)
          butterfly.position.copy(bf.takeCurve.getPoint(e))
          bf.takeCurve.getPoint(Math.min(1, e+0.02), _v2)
          dummy.position.copy(butterfly.position)
          dummy.lookAt(_v2)
          butterfly.quaternion.slerp(dummy.quaternion, 1-Math.exp(-dt*8))
          // rampa natural 8→22 rad/s
          bf.phase += dt * THREE.MathUtils.lerp(8, 22, easeIO(k))
          applyWings(bf.phase, 0.5, 0.85, 0.38, 0.65)
          bodyGroup.position.y = 0
          if(k >= 1){
            bf.mode = 'fly'; bf.t = 0; bf.lap = 0
          }
        }
        else {
          const eps = 0.004
          const t0 = HEART_ROUTE.getTangentAt(bf.t)
          const t1 = HEART_ROUTE.getTangentAt((bf.t+eps)%1)
          const targetF = THREE.MathUtils.clamp(1.6 - (t0.angleTo(t1)/(eps*routeLen))*9, 0.55, 1.5)
          bf.factorS = lerp(bf.factorS, targetF, 1 - Math.exp(-dt*3))

          if(!bf.paused){
            const ds = 0.88*bf.factorS*dt // +60% vs original 0.55, estable en cualquier navegador/móvil
            const prevT = bf.t
            bf.t = (bf.t + ds/routeLen) % 1
            if(bf.t < prevT){
              bf.lap++
              // vuelo infinito hasta que el usuario pulse "Abrir carta"
            }
          }

          const pos = HEART_ROUTE.getPointAt(bf.t)
          const ahead = HEART_ROUTE.getPointAt((bf.t+0.005)%1)
          const tan = HEART_ROUTE.getTangentAt(bf.t)
          _v3.crossVectors(UP, tan).normalize()
          // turbulencia natural: Perlin-like con 2 frecuencias + dependencia de factorS
          const n1 = Math.sin(time*1.7 + bf.t*12)*0.5 + Math.sin(time*3.1 - bf.t*7)*0.3
          const n2 = Math.cos(time*2.3 + bf.t*9)*0.5
          const turbulence = 0.04 + 0.03*(1-bf.factorS)
          const wX = _v3.x * n1 * turbulence
          const wY = n2 * 0.035 + Math.sin(time*0.9 + bf.t*6)*0.02
          const wZ = _v3.z * n1 * turbulence
          butterfly.position.set(pos.x + wX, pos.y + wY, pos.z + wZ)

          dummy.position.copy(butterfly.position)
          dummy.lookAt(ahead.x + wX, ahead.y + wY, ahead.z + wZ)
          const tan1 = HEART_ROUTE.getTangentAt((bf.t+0.02)%1)
          _v3.crossVectors(tan, tan1)
          const speed = bf.factorS * 0.88
          const rollT = THREE.MathUtils.clamp(-_v3.y * (6 + speed*4), -1.05, 1.05)
          rollS.v = lerp(rollS.v, bf.paused ? 0 : rollT, 1 - Math.exp(-dt*2.5))
          qRoll.setFromAxisAngle(AXIS_Z, rollS.v)
          qTarget.copy(dummy.quaternion).multiply(qRoll)
          butterfly.quaternion.slerp(qTarget, 1 - Math.exp(-dt*7))

          if(bf.paused){
            bf.phase += dt*6 // +20%
            applyWings(bf.phase, 0.72, 0.30, 0.55, 0.24)
          } else {
            bf.phase += dt*(15.6 + 8.4*bf.factorS) // +20%
            applyWings(bf.phase, 0.42, 0.78, 0.30, 0.62)
          }
          bodyGroup.rotation.x = 0.05*Math.sin(bf.phase-1.2)

          if(!bf.paused){
            fleckTimer -= dt
            if(fleckTimer <= 0){
              fleckTimer = 0.4
              spawnFleck(butterfly.position)
            }
          }
        }

        // pétalos lluvia
        rainBoost = Math.max(0, rainBoost - dt)
        petalTimer -= dt
        if(petalTimer <= 0){
          petalTimer = rainBoost > 0 ? 0.05 : 0.8
          const a = rnd(0, 6.28), r = Math.sqrt(rnd())*2.3
          spawnPetal(Math.cos(a)*r, rnd(2.7, 3.3), Math.sin(a)*r)
        }
        for(const p of fallPool){
          if(p.free) continue
          if(p.land > 0 && p.m.position.y > p.rest){
            p.t += dt
            const k = Math.min(p.t/1.2, 1)
            p.m.position.y += p.vy*dt
            p.m.position.x = p.bx + Math.sin(time*1.5 + p.ph)*p.sway + p.vx*k
            p.m.position.z = p.bz + Math.cos(time*1.2 + p.ph)*p.sway*0.6 + p.vz*k
            p.m.rotation.x += p.spin.x*dt; p.m.rotation.y += p.spin.y*dt; p.m.rotation.z += p.spin.z*dt
            if(p.m.position.y <= p.rest){ p.m.position.y = p.rest; p.m.rotation.x = -Math.PI/2 + rnd(-0.3,0.3) }
          } else {
            p.land -= dt
            if(p.land < 0.9) p.m.scale.setScalar(p.s0*Math.max(p.land, 0)/0.9)
            if(p.land <= 0){ p.free = true; p.m.visible = false }
          }
        }

        // flecks
        for(const f of fleckPool){
          if(f.life <= 0) continue
          f.life -= dt
          if(f.life <= 0){ f.m.visible = false; f.m.material.opacity = 0; continue }
          f.vel.y -= 0.4*dt
          f.m.position.addScaledVector(f.vel, dt)
          if(f.m.position.y < 0.035){ f.m.position.y = 0.035; f.vel.set(0,0,0) }
          f.m.rotation.x += f.spin.x*dt; f.m.rotation.y += f.spin.y*dt; f.m.rotation.z += f.spin.z*dt
          f.m.material.opacity = 0.85*clamp01(f.life/0.6)
        }

        // humo
        for(const s of smokePool){
          if(s.life <= 0) continue
          s.life -= dt
          if(s.life <= 0){ s.m.visible = false; continue }
          const f = s.life/s.max
          s.m.position.addScaledVector(s.vel, dt)
          s.m.position.x += Math.sin(time*2 + s.seed)*0.05*dt
          s.m.scale.setScalar(0.07 + (1 - f)*0.3)
          s.m.material.opacity = 0.32*f*Math.min(1, (1 - f)*8)
        }

        // burst
        for(const s of burstPool){
          if(s.life <= 0) continue
          s.life -= dt
          if(s.life <= 0){ s.m.visible = false; s.m.material.opacity = 0; continue }
          const f = s.life/s.max
          s.vel.y -= 1.3*dt
          s.m.position.addScaledVector(s.vel, dt)
          s.m.material.opacity = f
          s.m.scale.setScalar(s.s0*(0.5 + f))
          s.m.material.rotation += dt*4
        }

        // dust
        {
          const p = dustGeo.attributes.position
          for(let i=0;i<DUST_N;i++){
            p.setX(i, dustBase[i*3]   + Math.sin(time*0.3 + dustPh[i])*0.25)
            p.setY(i, dustBase[i*3+1] + Math.sin(time*0.22 + dustPh[i]*1.7)*0.3)
            p.setZ(i, dustBase[i*3+2] + Math.cos(time*0.26 + dustPh[i])*0.25)
          }
          p.needsUpdate = true
        }

        // luz dorada titilante por toda la escena
        {
          const p = lightGeo.attributes.position
          for(let i=0;i<LIGHT_N;i++){
            p.setX(i, lightBase[i*3]   + Math.sin(time*0.28 + lightPh[i])*0.18)
            p.setY(i, lightBase[i*3+1] + Math.sin(time*0.19 + lightPh[i]*1.3)*0.22 + Math.sin(time*0.45 + i*0.7)*0.02)
            p.setZ(i, lightBase[i*3+2] + Math.cos(time*0.24 + lightPh[i])*0.18)
          }
          p.needsUpdate = true
          lightMat.opacity = 0.52 + 0.22*Math.sin(time*1.1)
          lightPoints.rotation.y = time*0.015
        }
        // mariposa bien iluminada — pulso intenso con aleteo
        bfLight.intensity = 2.2 + 0.85*Math.sin(bf.phase*0.5) + 0.45*Math.sin(time*2.2)
        bfHalo.material.opacity = 0.36 + 0.18*Math.sin(bf.phase*0.7)
        bfHalo.scale.setScalar(0.92 + 0.12*Math.sin(bf.phase))

        // hover + marker sutil (sin tip textual) — pick throttled 120ms, mismo diseño
        if(mouseOn && now - lastPick > 120){ lastPick = now; hoverId = pickAt(mx, my) }
        else if(!mouseOn) hoverId = null
        const active = hoverId || legendHover
        if(active){
          const it = interactives.find(i => i.id === active)
          if(it){
            if(active === 'butterfly' && bf.mode === 'fly'){
              marker.position.set(butterfly.position.x, butterfly.position.y - 0.25, butterfly.position.z)
            } else {
              marker.position.set(it.group.position.x, 0.035, it.group.position.z)
            }
            marker.scale.setScalar(it.radius)
          }
        }
        markerOp = lerp(markerOp, active ? 0.45 : 0, 1 - Math.exp(-dt*10))
        marker.material.opacity = markerOp
        renderer.domElement.style.cursor = hoverId ? 'pointer' : 'grab'

        renderer.render(scene, camera)
      }

      // helpers for roll quaternion target
      const qTarget = new THREE.Quaternion()

      loopFn = loop
      raf = requestAnimationFrame(loop)
      // intro sin texto
      flyTo(VIEWS.general, 1.9)
      // fade in
      requestAnimationFrame(() => { if (!disposed) wrap.style.opacity = '1' })
    } catch (err) {
      bfLog('init-fallo:', err?.message, err)
      window.setTimeout(() => { if (!disposed) { disposed = true; onDoneRef.current?.() } }, 1200)
    }

    return () => {
      bfLog('unmount')
      disposed = true
      cancelAnimationFrame(raf)
      raf = 0
      window.clearTimeout(safetyTimer)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(autoStartTimer)
      window.clearTimeout(noteTimer)
      if (onResize) window.removeEventListener('resize', onResize)
      if (onVis) document.removeEventListener('visibilitychange', onVis)
      if (onKey) window.removeEventListener('keydown', onKey)
      if (onCtxLost && canvas) canvas.removeEventListener('webglcontextlost', onCtxLost)
      // remove pointer listeners (same refs guardadas arriba)
      try {
        if (renderer) {
          renderer.domElement?.removeEventListener('pointermove', onPointerMove)
          renderer.domElement?.removeEventListener('pointerdown', onPointerDown)
          renderer.domElement?.removeEventListener('pointerup', onPointerUp)
          renderer.domElement?.removeEventListener('pointerleave', onPointerLeave)
        }
      } catch {}
      try { controlsRef?.dispose?.() } catch {}
      if (sceneRef) {
        sceneRef.traverse((o) => {
          try {
            if (o.geometry) o.geometry.dispose?.()
            const m = o.material
            if (Array.isArray(m)) m.forEach((mm) => { try { mm.map?.dispose?.(); mm.dispose?.() } catch {} })
            else if (m) { try { m.map?.dispose?.(); m.dispose?.() } catch {} }
          } catch {}
        })
      }
      try { envTexRef?.dispose?.() } catch {}
      if (renderer) {
        try { renderer.dispose() } catch {}
        renderer = null
      }
      sceneRef = null; controlsRef = null; envTexRef = null
      if (fontLinkCreated && fontLink && fontLink.parentNode) fontLink.parentNode.removeChild(fontLink)
    }
  // onDone vive en ref: montar una sola vez por vuelo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── anime.js botones — estilo animejs.com ──
  useEffect(() => {
    if (!btnsRef.current) return
    scopeRef.current = createScope({ root: btnsRef.current }).add(self => {
      // entrada stagger con spring suave (animejs v4)
      animate('.anime-btn', {
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.94, 1],
        duration: 640,
        delay: stagger(120, { start: 520 }),
        ease: 'outExpo',
      })
      // método press para feedback táctil
      self.add('press', (target) => {
        animate(target, {
          scale: [{ to: 0.96, duration: 110, ease: 'inQuad' }, { to: 1, duration: 380, ease: 'outElastic(1, 0.6)' }],
        })
      })
      // hover sutil con animatable
      self.add('hoverIn', (target) => {
        animate(target, { scale: 1.04, duration: 180, ease: 'outQuad' })
      })
      self.add('hoverOut', (target) => {
        animate(target, { scale: 1, duration: 240, ease: 'outQuad' })
      })
    })
    return () => scopeRef.current?.revert()
  }, [])

  // pulso dorado cuando está siguiendo (anime loop)
  useEffect(() => {
    if (!btnsRef.current) return
    const el = btnsRef.current.querySelector('[data-btn="follow"]')
    if (!el) return
    if (follow) {
      const loop = animate(el, {
        boxShadow: ['0 0 12px rgba(220,20,60,0.18)', '0 0 22px rgba(212,175,55,0.42)', '0 0 12px rgba(220,20,60,0.18)'],
        duration: 1200,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      })
      return () => loop?.revert?.() || loop?.cancel?.()
    }
  }, [follow])

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-30"
      style={{ opacity: 0, transition: 'opacity 0.9s ease', background: 'transparent', pointerEvents: 'auto' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      {/* viñeta ultra sutil sobre el cosmos — deja ver estrellas y cometas */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 62%, rgba(0,0,0,0.28) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.05), transparent 72%)' }} />

      {/* botones — anime.js stagger + springs (animejs.com) */}
      <div ref={btnsRef} className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 sm:left-auto sm:right-6 sm:translate-x-0">
        <button
          data-btn="follow"
          onClick={toggleFollow}
          onMouseEnter={(e) => scopeRef.current?.methods?.hoverIn?.(e.currentTarget)}
          onMouseLeave={(e) => scopeRef.current?.methods?.hoverOut?.(e.currentTarget)}
          aria-pressed={follow}
          aria-label="Seguir a la mariposa"
          className={`anime-btn group relative inline-flex min-w-[148px] items-center justify-center overflow-hidden rounded-full px-5 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${follow ? 'bg-gradient-to-r from-[#8b0000] to-[#dc143c] text-[#f9e076] shadow-[0_0_22px_rgba(220,20,60,0.35)] border border-[#d4af37]/30' : 'glass border border-white/10 text-white/70 hover:border-gold/25 hover:text-gold-light backdrop-blur-md'}`}
          style={{ fontFamily: "'Cormorant Garamond', serif", boxShadow: follow ? undefined : '0 8px 32px rgba(0,0,0,0.35)', opacity: 0 }}
        >
          <span className="inline-flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${follow ? 'bg-[#f9e076] animate-pulse' : 'bg-white/40 group-hover:bg-gold/60'} transition-colors`} />
            <span className="whitespace-nowrap">{follow ? 'Siguiendo ♡' : 'Seguir mariposa'}</span>
          </span>
        </button>
        <button
          data-btn="open"
          onClick={(e) => { scopeRef.current?.methods?.press?.(e.currentTarget); if (wrapRef.current) wrapRef.current.style.opacity='0'; setTimeout(()=>onDoneRef.current?.(), 650) }}
          onMouseEnter={(e) => scopeRef.current?.methods?.hoverIn?.(e.currentTarget)}
          onMouseLeave={(e) => scopeRef.current?.methods?.hoverOut?.(e.currentTarget)}
          className="anime-btn relative inline-flex min-w-[148px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#8b0000] via-[#dc143c] to-[#8b0000] px-7 py-2.5 text-[11px] font-bold tracking-[0.2em] uppercase text-white shadow-[0_8px_24px_rgba(139,0,0,0.45),0_0_16px_rgba(212,175,55,0.15)] border border-[#d4af37]/20 hover:shadow-[0_10px_28px_rgba(139,0,0,0.55)] hover:border-[#d4af37]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          style={{ fontFamily: "'Cormorant Garamond', serif", opacity: 0 }}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            Abrir carta
            <span className="text-[13px] leading-none" aria-hidden>✦</span>
          </span>
        </button>
      </div>
    </div>
  )
}
