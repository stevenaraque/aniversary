import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Feather, ArrowLeft } from 'lucide-react'
import { springs } from '../lib/motion-tokens'

// ── Carta + Mariposa — Uiverse JohnnyCSilva + origami cyan, vuelo pantalla completa optimizado ──
export default function Letter({ onNext, onPrev }) {
  const [phase, setPhase] = useState('idle') // idle | flying | open
  const bfRef = useRef(null)
  const bfInnerRef = useRef(null)
  const wingLRef = useRef(null)
  const wingRRef = useRef(null)
  const lightRef = useRef(null)
  const envelopeRef = useRef(null)
  const rafRef = useRef(0)
  const trailsRef = useRef([])
  const containerRef = useRef(null)
  // ángulo suavizado sin regex cada frame
  const angleRef = useRef(0)
  const smoothPosRef = useRef({ x: null, y: null })

  const startFlight = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('flying')
  }, [phase])

  // ── VUELO PANTALLA COMPLETA NATURAL + 60fps optimizado ──
  useEffect(() => {
    if (phase !== 'flying') return
    const bf = bfRef.current
    const bfInner = bfInnerRef.current
    const wingL = wingLRef.current
    const wingR = wingRRef.current
    const light = lightRef.current
    const host = containerRef.current
    if (!bf || !bfInner || !wingL || !wingR || !light || !host) return

    const W = window.innerWidth
    const H = window.innerHeight
    const BF_W = 112, BF_H = 112
    const sc = W < 480 ? 0.58 : W < 768 ? 0.72 : 0.88
    const cx = W * 0.5, cy = H * 0.46

    // ── Trayectoria PANTALLA COMPLETA — 6 arcos amplios ida y vuelta ──
    const segs = [
      // despegue centro → esquina sup-izq
      { x0: cx, y0: cy + 32, x1: cx - 90, y1: cy - 18, x2: W * 0.10, y2: H * 0.08, x3: W * 0.18, y3: H * 0.14 },
      // cruce largo sup → sup-der
      { x0: W * 0.18, y0: H * 0.14, x1: W * 0.38, y1: -H * 0.04, x2: W * 0.66, y2: -H * 0.02, x3: W * 0.84, y3: H * 0.16 },
      // bajada der → centro-der
      { x0: W * 0.84, y0: H * 0.16, x1: W * 0.98, y1: H * 0.36, x2: W * 0.98, y2: H * 0.62, x3: W * 0.72, y3: H * 0.72 },
      // cruce inferior → inf-izq
      { x0: W * 0.72, y0: H * 0.72, x1: W * 0.52, y1: H * 0.88, x2: W * 0.18, y2: H * 0.82, x3: W * 0.14, y3: H * 0.62 },
      // subida izq → centro
      { x0: W * 0.14, y0: H * 0.62, x1: W * 0.06, y1: H * 0.42, x2: W * 0.22, y2: H * 0.30, x3: W * 0.40, y3: H * 0.40 },
      // aterrizaje hover centro
      { x0: W * 0.40, y0: H * 0.40, x1: W * 0.46, y1: H * 0.48, x2: W * 0.48, y2: H * 0.48, x3: cx, y3: cy - 4 },
    ]
    const NS = segs.length
    const FLY = 10800
    const SD = FLY / NS

    const bez = (t, a, b, c, d) => {
      const m = 1 - t
      return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d
    }
    const easeSine = t => -(Math.cos(Math.PI * t) - 1) / 2
    const easeCubic = t => 1 - Math.pow(1 - t, 3)
    const lerp = (a, b, t) => a + (b - a) * t

    const flightPt = (elapsed) => {
      const si = Math.min(Math.floor(elapsed / SD), NS - 1)
      const rawT = Math.min((elapsed - si * SD) / SD, 1)
      const lt = easeSine(rawT)
      const s = segs[si]
      let x = bez(lt, s.x0, s.x1, s.x2, s.x3)
      let y = bez(lt, s.y0, s.y1, s.y2, s.y3)
      const gt = elapsed / FLY
      const envelope = Math.sin(gt * Math.PI) // 0 inicio/fin, 1 centro
      // flutter elegante muy contenido
      const flutterX = Math.sin(gt * Math.PI * 3.8 + Math.sin(gt * 1.9) * 0.8) * (6.5 * envelope)
      const flutterY = Math.cos(gt * Math.PI * 2.7 + Math.cos(gt * 1.6) * 0.6) * (4 * envelope)
      x += flutterX
      y += flutterY
      if (si === NS - 1 && rawT > 0.70) {
        const st = (rawT - 0.70) / 0.30
        const r = lerp(12, 0, easeCubic(st))
        x += Math.cos(st * Math.PI * 2) * r
        y += Math.sin(st * Math.PI * 4) * r * 0.42
      }
      return { x, y }
    }

    // Trails ultra-ligeros
    const trails = trailsRef.current
    const MT = 18
    let trailAccum = 0
    const spawnTrail = (x, y) => {
      const el = document.createElement('div')
      const sz = 1.4 + Math.random() * 2.8
      const isDot = Math.random() > 0.35
      el.className = 'bf-trail'
      el.style.width = sz + 'px'
      el.style.height = sz + 'px'
      el.style.borderRadius = isDot ? '50%' : '1px'
      // polvo de estrellas dorado-neon
      el.style.background = isDot
        ? 'radial-gradient(circle,rgba(249,224,118,0.88) 0%,rgba(212,175,55,0.45) 36%,transparent 72%)'
        : `rgba(212,175,55,${0.18 + Math.random() * 0.14})`
      el.style.boxShadow = isDot ? '0 0 5px rgba(212,175,55,0.55),0 0 9px rgba(220,20,60,0.22)' : 'none'
      // usar translate3d desde el inicio para GPU
      el.style.transform = `translate3d(${x}px,${y}px,0)`
      host.appendChild(el)
      trails.push({ el, x, y, vx: (Math.random() - 0.5) * 0.28, vy: 0.10 + Math.random() * 0.22, life: 1, dec: 0.010 + Math.random() * 0.007, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 1.4 })
      if (trails.length > MT) trails.shift().el.remove()
    }
    const updTrails = () => {
      for (let i = trails.length - 1; i >= 0; i--) {
        const p = trails[i]
        p.life -= p.dec
        p.x += p.vx; p.y += p.vy; p.vy += 0.010; p.rot += p.rv
        if (p.life <= 0) { p.el.remove(); trails.splice(i, 1) }
        else {
          p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.rot}deg) scale(${p.life})`
          p.el.style.opacity = String(p.life * 0.5)
        }
      }
    }
    const sparkles = (cx0, cy0, n) => {
      for (let i = 0; i < n; i++) {
        const s = document.createElement('div')
        s.className = 'bf-sparkle'
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.35
        const dist = 30 + Math.random() * 68
        const tx = cx0 + Math.cos(ang) * dist
        const ty = cy0 + Math.sin(ang) * dist
        const sz = 2 + Math.random() * 3.2
        s.style.width = sz + 'px'; s.style.height = sz + 'px'
        s.style.left = cx0 + 'px'; s.style.top = cy0 + 'px'
        host.appendChild(s)
        const dur = 540 + Math.random() * 420
        const t0 = performance.now()
        const anim = (now) => {
          const p = Math.min((now - t0) / dur, 1)
          const e = 1 - Math.pow(1 - p, 3)
          s.style.transform = `translate3d(${(tx - cx0) * e}px,${(ty - cy0) * e}px,0) scale(${1 - p})`
          s.style.opacity = String((1 - p) * 0.88)
          if (p < 1) requestAnimationFrame(anim); else s.remove()
        }
        requestAnimationFrame(anim)
      }
    }

    let startTs = null
    let phaseInner = 'fadeIn'
    let prevPt = null
    let curAngle = 0
    const T_IN = 380, T_SET = 580, T_OUT = 660, T_SP = 240

    // estado inicial sin layout thrash — RESETEA ALETEO (fix vuelo 2 en adelante)
    bf.style.opacity = '0'
    light.style.opacity = '0'
    bf.style.willChange = 'transform,opacity'
    light.style.willChange = 'transform,opacity'
    bf.style.transition = 'opacity 0.42s ease'
    light.style.transition = 'opacity 0.42s ease'
    bfInner.style.transformOrigin = 'center center'
    bfInner.style.transform = `scale(${sc}) rotate(0deg)`
    // reset alas a animar (estaban en pausa tras vuelo anterior)
    wingL.className = 'animar-ala-izq preservar-3d absolute left-0 top-0 w-1/2 h-full origin-right'
    wingR.className = 'animar-ala-der preservar-3d absolute right-0 top-0 w-1/2 h-full origin-left'
    wingL.style.animationDuration = '0.044s'
    wingR.style.animationDuration = '0.044s'
    wingL.style.animationPlayState = 'running'
    wingR.style.animationPlayState = 'running'
    smoothPosRef.current = { x: null, y: null }
    angleRef.current = 0
    curAngle = 0
    // fade in próximo frame
    requestAnimationFrame(() => { bf.style.opacity = '1'; light.style.opacity = '1' })

    let lastTrailFrame = 0
    const loop = (ts) => {
      if (!startTs) startTs = ts
      const el = ts - startTs

      if (phaseInner === 'fadeIn') {
        if (el >= T_IN) { phaseInner = 'flying'; startTs = ts }
      } else if (phaseInner === 'flying') {
        const ce = Math.min(el, FLY)
        const raw = flightPt(ce)
        const sp = smoothPosRef.current
        if (sp.x === null) { sp.x = raw.x; sp.y = raw.y }
        else { sp.x = lerp(sp.x, raw.x, 0.16); sp.y = lerp(sp.y, raw.y, 0.16) }
        const pt = { x: sp.x, y: sp.y }

        if (prevPt) {
          const dx = pt.x - prevPt.x
          const dy = pt.y - prevPt.y
          const speed = Math.hypot(dx, dy)
          const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90
          let delta = targetAngle - curAngle
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360
          curAngle += delta * 0.065
          angleRef.current = curAngle
          const bank = Math.max(-13, Math.min(13, dx * 0.55))
          const pitch = Math.max(-5, Math.min(5, -dy * 0.22))
          bfInner.style.transform = `scale(${sc}) rotate(${curAngle}deg) rotateZ(${bank * 0.28}deg) rotateX(${pitch}deg)`
          // aleteo +50% más — solo alas, recorrido intacto (0.036-0.049s)
          const vyNorm = Math.max(-1, Math.min(1, dy * 0.16))
          const flapTarget = vyNorm < -0.12 ? 0.036 : vyNorm > 0.32 ? 0.049 : 0.044
          const curFlap = parseFloat(wingL.style.animationDuration) || 0.044
          const flap = lerp(curFlap, flapTarget, 0.07)
          const fd = flap.toFixed(3) + 's'
          wingL.style.animationDuration = fd
          wingR.style.animationDuration = fd
          // estela muy espaciada para no cargar
          if (speed > 1.1 && (ts - lastTrailFrame) > 42) {
            trailAccum += (speed - 1.1) * 0.04
            if (trailAccum > 1) { spawnTrail(pt.x, pt.y); trailAccum = 0; lastTrailFrame = ts }
          }
        }
        // translate3d GPU
        bf.style.transform = `translate3d(${pt.x - BF_W * sc / 2}px,${pt.y - BF_H * sc / 2}px,0)`
        light.style.transform = `translate3d(${pt.x - 100}px,${pt.y - 100}px,0)`
        prevPt = { x: pt.x, y: pt.y }
        if (ce >= FLY) {
          phaseInner = 'settling'; startTs = ts
          wingL.className = 'pausa-ala-izq preservar-3d absolute left-0 top-0 w-1/2 h-full origin-right'
          wingR.className = 'pausa-ala-der preservar-3d absolute right-0 top-0 w-1/2 h-full origin-left'
          wingL.style.animationDuration = ''; wingR.style.animationDuration = ''
        }
      } else if (phaseInner === 'settling') {
        if (el >= T_SET) {
          phaseInner = 'fadeOut'; startTs = ts
          bf.style.transition = 'opacity 0.72s ease, transform 0.72s ease'
          bf.style.opacity = '0'; bf.style.transform += ' scale(0.94)'
          light.style.transition = 'opacity 0.72s ease'; light.style.opacity = '0'
          setTimeout(() => sparkles(W * 0.5, H * 0.46, 18), T_SP)
        }
      } else if (phaseInner === 'fadeOut') {
        if (el >= T_OUT + T_SP) { setPhase('open'); return }
      }
      updTrails()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      trails.forEach(t => t.el.remove()); trailsRef.current = []
      smoothPosRef.current = { x: null, y: null }
    }
  }, [phase])

  const handleEnvelopeMove = (e) => {
    if (!envelopeRef.current) return
    const r = envelopeRef.current.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width - 0.5
    const cy = (e.clientY - r.top) / r.height - 0.5
    envelopeRef.current.style.transform = `perspective(700px) rotateY(${cx * 3.8}deg) rotateX(${-cy * 3.8}deg)`
  }
  const handleEnvelopeLeave = () => {
    if (envelopeRef.current) envelopeRef.current.style.transform = 'perspective(700px) rotateY(0) rotateX(0)'
  }

  return (
    <div
      ref={containerRef}
      className="main-wrapper relative flex flex-col items-center justify-center py-6 sm:py-8"
      style={{ minHeight: '100dvh', background: 'transparent', fontFamily: "'Lora',serif", overflow: 'hidden' }}
    >
      {/* ── ESTILOS — mariposa cyan + carta Uiverse + papyrus ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        .perspectiva{perspective:800px}
        .preservar-3d{transform-style:preserve-3d}
         @keyframes aleteo-izq{0%{transform:rotateY(14deg) rotateX(8deg)}100%{transform:rotateY(68deg) rotateX(10deg)}}
        @keyframes aleteo-der{0%{transform:rotateY(-14deg) rotateX(8deg)}100%{transform:rotateY(-68deg) rotateX(10deg)}}
        .animar-ala-izq{animation:aleteo-izq 0.044s infinite alternate ease-in-out}
        .animar-ala-der{animation:aleteo-der 0.044s infinite alternate ease-in-out}
        .pausa-ala-izq{animation:none!important;transform:rotateY(20deg) rotateX(10deg)}
        .pausa-ala-der{animation:none!important;transform:rotateY(-20deg) rotateX(10deg)}
        .clip-ala-sup-izq{clip-path:polygon(0 20%,100% 100%,30% 0)}
        .clip-ala-inf-izq{clip-path:polygon(30% 100%,100% 0,0 70%)}
        .clip-ala-fondo-izq{clip-path:polygon(0 20%,100% 50%,0 70%)}
        .clip-ala-sup-der{clip-path:polygon(100% 20%,0 100%,70% 0)}
        .clip-ala-inf-der{clip-path:polygon(70% 100%,0 0,100% 70%)}
        .clip-ala-fondo-der{clip-path:polygon(100% 20%,0 50%,100% 70%)}
        .bf-trail{position:fixed;left:0;top:0;pointer-events:none;z-index:5;will-change:transform,opacity}
        .bf-sparkle{position:fixed;pointer-events:none;z-index:15;border-radius:9999px;background:radial-gradient(circle,rgba(212,175,55,0.95) 0%,rgba(220,20,60,0.65) 45%,transparent 70%);will-change:transform,opacity;box-shadow:0 0 6px rgba(212,175,55,0.6),0 0 12px rgba(220,20,60,0.25)}
        #letterWrap{opacity:0;transform:translate(-50%,-50%) scale(0.88);pointer-events:none;transition:opacity 0.95s ease, transform 1.15s cubic-bezier(0.22,1,0.36,1)}
        #letterWrap.show{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}
        .ltxt{opacity:0;transform:translateY(14px);transition:opacity 0.65s ease, transform 0.65s ease}
        #letterWrap.show .ltxt{opacity:1;transform:translateY(0)}
        #lGreet{transition-delay:0.42s} #lBody{transition-delay:0.76s} #lSign{transition-delay:1.08s}
        #seal{opacity:0;transform:scale(0.85);transition:opacity 0.48s ease 1.48s, transform 0.58s cubic-bezier(0.34,1.56,0.64,1) 1.48s}
        #letterWrap.show #seal{opacity:1;transform:scale(1)}
        #miniBf{opacity:0;transform:scale(0.85) rotate(-15deg);transition:opacity 0.55s ease 1.78s, transform 0.68s cubic-bezier(0.34,1.56,0.64,1) 1.78s}
        #letterWrap.show #miniBf{opacity:1;transform:scale(1) rotate(-15deg)}
        /* ── Carta cerrada: tu diseño sobre (260×360) + hover Uiverse JohnnyCSilva ── */
        .letter-card{width:260px;height:360px;background:linear-gradient(145deg,#1a0f0f 0%,#2a1111 50%,#0a0a0f 100%);border:1px solid rgba(212,175,55,0.22);border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;transition:0.2s ease-in-out;position:relative;overflow:hidden;cursor:pointer;box-shadow:0 20px 60px rgba(0,0,0,0.55),0 0 40px rgba(139,0,0,0.12),inset 0 1px 0 rgba(212,175,55,0.08)}
        .letter-card .img{height:30%;position:absolute;transition:0.2s ease-in-out;z-index:1;color:rgba(220,20,60,0.55);filter:drop-shadow(0 0 12px rgba(220,20,60,0.2))}
        .letter-card .textBox{opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;transition:0.2s ease-in-out;z-index:2;text-align:center}
        .letter-card .textBox .head{font-size:20px;font-weight:700;letter-spacing:0.14em;font-family:'Cormorant Garamond',serif;color:#f9e076;text-shadow:0 0 16px rgba(212,175,55,0.3)}
        .letter-card .textBox span{font-size:12px;color:lightgrey;letter-spacing:0.14em;text-transform:uppercase}
        @keyframes cardAnim{0%{transform:translateY(0)}50%{transform:translateY(-20px)}100%{transform:translateY(0)}}
        @media (hover: hover) and (pointer: fine) {
          .letter-card:hover > .textBox{opacity:1}
          .letter-card:hover > .img{height:65%;filter:blur(7px);animation:cardAnim 3s infinite}
          .letter-card:hover{transform:scale(1.04) rotate(-1deg);border-color:rgba(212,175,55,0.34);box-shadow:0 24px 70px rgba(0,0,0,0.6),0 0 50px rgba(139,0,0,0.18)}
        }
        .letter-card:active{transform:scale(0.98)}
        @media(max-width:640px){.letter-card{width:195px;height:285px}.letter-card .textBox .head{font-size:18px}}
        @media(prefers-reduced-motion:reduce){.animar-ala-izq,.animar-ala-der{animation-duration:1.1s!important}.letter-card:hover > .img{animation:none!important}}
      `}</style>

      {/* Viñeta ultra sutil — no tapa cometas */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center,transparent 48%,rgba(0,0,0,0.32) 100%)' }} />

      {/* Luz neon dorado-roja que sigue mariposa */}
      <div ref={lightRef} className="fixed pointer-events-none z-[1] rounded-full" style={{ width: 220, height: 220, background: 'radial-gradient(circle,rgba(212,175,55,0.10) 0%,rgba(220,20,60,0.06) 38%,transparent 68%)', filter: 'blur(12px)', opacity: phase === 'flying' ? 1 : 0, transition: 'opacity 0.45s ease' }} />

      {/* ── MARIPOSA 112×112 — neon negro/rojo/dorado ── */}
      <div ref={bfRef} className="fixed left-0 top-0 z-10 pointer-events-none" style={{ opacity: phase === 'flying' ? 1 : 0, transition: 'opacity 0.42s ease', filter: phase === 'flying' ? 'drop-shadow(0 0 10px rgba(212,175,55,0.45)) drop-shadow(0 0 18px rgba(220,20,60,0.32))' : 'none' }} aria-hidden>
        <div ref={bfInnerRef} className="perspectiva relative" style={{ width: 112, height: 112 }}>
          <div className="preservar-3d absolute w-full h-full">
            <div className="absolute left-1/2 top-1/4 w-1.5 h-14 -translate-x-1/2 z-10" style={{ background: 'linear-gradient(180deg,#1a0a0f 0%,#8b0000 55%,#d4af37 100%)', clipPath: 'polygon(50% 0,100% 10%,100% 90%,50% 100%,0 90%,0 10%)', boxShadow: '0 0 8px rgba(212,175,55,0.55),0 0 14px rgba(220,20,60,0.35)' }} />
            <div ref={wingLRef} className="animar-ala-izq preservar-3d absolute left-0 top-0 w-1/2 h-full origin-right">
              <div className="clip-ala-fondo-izq absolute w-full h-full top-0" style={{ background: '#0a0a0f', opacity: 0.98, boxShadow: 'inset 0 0 12px rgba(220,20,60,0.18)' }} />
              <div className="clip-ala-sup-izq absolute w-full h-1/2 top-0" style={{ background: 'linear-gradient(135deg,#8b0000 0%,#dc143c 55%,#d4af37 100%)', opacity: 0.98, boxShadow: 'inset -5px -5px 14px rgba(0,0,0,0.32),0 0 10px rgba(212,175,55,0.28)' }} />
              <div className="clip-ala-inf-izq absolute w-full h-1/2 bottom-0" style={{ background: 'linear-gradient(135deg,#4a0e0e 0%,#8b0000 60%,#b8941f 100%)', opacity: 0.98, boxShadow: 'inset -5px 5px 14px rgba(0,0,0,0.32),0 0 8px rgba(220,20,60,0.20)' }} />
            </div>
            <div ref={wingRRef} className="animar-ala-der preservar-3d absolute right-0 top-0 w-1/2 h-full origin-left">
              <div className="clip-ala-fondo-der absolute w-full h-full top-0" style={{ background: '#0a0a0f', opacity: 0.98, boxShadow: 'inset 0 0 12px rgba(220,20,60,0.18)' }} />
              <div className="clip-ala-sup-der absolute w-full h-1/2 top-0" style={{ background: 'linear-gradient(225deg,#8b0000 0%,#dc143c 55%,#d4af37 100%)', opacity: 0.98, boxShadow: 'inset 5px -5px 14px rgba(0,0,0,0.32),0 0 10px rgba(212,175,55,0.28)' }} />
              <div className="clip-ala-inf-der absolute w-full h-1/2 bottom-0" style={{ background: 'linear-gradient(225deg,#4a0e0e 0%,#8b0000 60%,#b8941f 100%)', opacity: 0.98, boxShadow: 'inset 5px 5px 14px rgba(0,0,0,0.32),0 0 8px rgba(220,20,60,0.20)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Flecha atrás — vuelve a MemoryLane */}
      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-gold/25 hover:text-gold-light text-white/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* ── CONTENIDO usa .container para responsivo ── */}
      <div className="container relative z-10 flex flex-col items-center justify-center w-full text-center gap-6 px-4">
        <motion.div initial={{ y: -12, opacity: 0, filter: 'blur(6px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} transition={springs.gentle} className="flex flex-col items-center gap-3 pb-1">
          <Feather className="w-9 h-9 text-crimson/30 mx-auto" />
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
            <span className="text-gradient-blood">Una carta</span> <span className="text-white">para ti</span>
          </h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-1" />
        </motion.div>

        {phase === 'idle' && (
          <motion.div className="mt-2 flex justify-center p-3 overflow-visible" initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...springs.gentle, delay: 0.16 }} role="button" tabIndex={0} onClick={startFlight} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && startFlight()} aria-label="Abrir carta con mariposa">
            {/* Carta con ícono sobre + hover Uiverse */}
            <div className="letter-card">
              <svg className="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{ width: 88, height: 88 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div className="textBox">
                <p className="head">Viene una mariposa</p>
                <span>toca para abrir</span>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'flying' && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm tracking-[0.20em] uppercase" style={{ color: 'rgba(34,211,238,0.52)', fontFamily: 'Sora,sans-serif' }}>
            viene una mariposa...
          </motion.p>
        )}
      </div>

      {/* ── CARTA ABIERTA papyrus — idéntica al snippet ── */}
      <div id="letterWrap" className={`fixed left-1/2 top-1/2 z-20 ${phase === 'open' ? 'show' : ''}`} role="article" aria-label="Carta" style={{ visibility: phase === 'open' ? 'visible' : 'hidden' }}>
        <div ref={envelopeRef} onMouseMove={handleEnvelopeMove} onMouseLeave={handleEnvelopeLeave} className="relative" style={{ width: 'min(400px,88vw)', padding: '42px 38px 56px', background: 'linear-gradient(158deg,#fef9f0 0%,#faf3e3 40%,#efe4cd 100%)', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.07),0 6px 22px rgba(0,0,0,0.16),0 22px 65px rgba(0,0,0,0.22),inset 0 0 90px rgba(200,175,130,0.12)', border: '1px solid rgba(190,170,130,0.22)', transition: 'transform 0.16s ease' }}>
          <div className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-sm" style={{ background: 'linear-gradient(90deg,transparent,#d4a44c,transparent)', opacity: 0.4 }} />
          <div className="absolute bottom-0 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg,transparent,#d4a44c,transparent)', opacity: 0.22 }} />
          <div className="absolute top-3 left-3 w-6 h-6 opacity-[0.12]"><div className="absolute top-0 left-0 w-[18px] h-px bg-[#d4a44c]" /><div className="absolute top-0 left-0 w-px h-[18px] bg-[#d4a44c]" /></div>
          <div className="absolute top-3 right-3 w-6 h-6 opacity-[0.12]"><div className="absolute top-0 right-0 w-[18px] h-px bg-[#d4a44c]" /><div className="absolute top-0 right-0 w-px h-[18px] bg-[#d4a44c]" /></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 opacity-[0.12]"><div className="absolute bottom-0 left-0 w-[18px] h-px bg-[#d4a44c]" /><div className="absolute bottom-0 left-0 w-px h-[18px] bg-[#d4a44c]" /></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 opacity-[0.12]"><div className="absolute bottom-0 right-0 w-[18px] h-px bg-[#d4a44c]" /><div className="absolute bottom-0 right-0 w-px h-[18px] bg-[#d4a44c]" /></div>
          <div id="miniBf" className="absolute -top-4 left-7 w-9 h-7">
            <svg viewBox="0 0 36 28" className="w-full h-full" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}>
              <polygon points="18,4 2,0 18,14" fill="#f0e8d8" stroke="#c9a96e" strokeWidth="0.4" />
              <polygon points="18,4 34,0 18,14" fill="#f0e8d8" stroke="#c9a96e" strokeWidth="0.4" />
              <polygon points="18,14 5,26 18,22" fill="#e6d9c3" stroke="#c9a96e" strokeWidth="0.4" />
              <polygon points="18,14 31,26 18,22" fill="#e6d9c3" stroke="#c9a96e" strokeWidth="0.4" />
              <line x1="18" y1="2" x2="18" y2="24" stroke="#b8944a" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <p id="lGreet" className="ltxt mb-3.5" style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(20px,4vw,26px)', fontWeight: 600, color: '#2c1810' }}>Mi Canelita,</p>
          <p id="lBody" className="ltxt" style={{ fontSize: 'clamp(13px,2.5vw,15px)', lineHeight: 1.9, color: '#4a3728' }}>
            Hace dos años, un 26 de agosto, la vida nos cruzó sin ruido y desde entonces todo tiene tu nombre. En este tiempo aprendí que el amor no es un día grande, sino todos los pequeños: tu risa en la cocina a medianoche, tu mano que busca la mía sin mirar, como dices mi nombre cuando tienes sueño. Gracias por quedarte en mis días nublados, por enseñarme que la paciencia también es amor y por hacer de lo cotidiano nuestro lugar favorito. No te prometo días perfectos. Te prometo elegirte cada mañana, con la misma certeza del primer día y con todo lo que hemos crecido. Felices dos años. Que lo que viene nos encuentre así, juntos, a nuestro tiempo y a nuestra manera.
          </p>
          <p id="lSign" className="ltxt mt-5 text-right" style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(18px,3.5vw,23px)', fontWeight: 700, color: '#2c1810' }}>Siempre tuyo, Steven.</p>
          <div id="seal" className="absolute -bottom-4 right-8 w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 38% 38%,#d44030,#8b1a1a)', boxShadow: '0 2px 8px rgba(0,0,0,0.35),inset 0 1px 3px rgba(255,255,255,0.15)' }}>
            <span style={{ color: 'rgba(255,210,170,0.65)', fontSize: 18 }}>✣</span>
          </div>
        </div>
        {/* Botones — pebble puzzle para collage + repetir vuelo como antes (text link cyan) */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[360px] flex flex-col items-center gap-3 px-4" style={{ top: 'calc(100% + 20px)' }}>
          <motion.button onClick={onNext} className="w-full max-w-[260px] px-6 py-3.5 font-bold text-white uppercase tracking-wider text-xs rounded-2xl bg-crimson border-b-[5px] border-[#7f1d1d] active:border-b-0 active:translate-y-[5px] transition-all duration-100 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2" style={{ fontFamily: "'Cormorant Garamond',serif" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase === 'open' ? 1 : 0, y: phase === 'open' ? 0 : 10 }} transition={{ delay: 2.1, duration: 0.45 }} whileTap={{ scale: 0.98 }}>
            Ver nuestro collage <span style={{ fontSize: 14 }}>♡</span>
          </motion.button>
          <motion.button onClick={() => { setPhase('idle'); setTimeout(() => setPhase('flying'), 80) }} className="text-[11px] tracking-[0.18em] uppercase cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'rgba(34,211,238,0.42)', background: 'none', border: 'none', fontFamily: "'Cormorant Garamond',serif" }} initial={{ opacity: 0 }} animate={{ opacity: phase === 'open' ? 1 : 0 }} transition={{ delay: 2.45, duration: 0.4 }}>
            repetir vuelo
          </motion.button>
        </div>
      </div>
    </div>
  )
}
