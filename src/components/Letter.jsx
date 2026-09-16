import { useState, useRef, useCallback, lazy, Suspense, Component } from 'react'
import { motion } from 'motion/react'
import { Feather, ArrowLeft } from 'lucide-react'
import { springs } from '../lib/motion-tokens'

// Vuelo 3D gótico en chunk perezoso (three queda fuera del bundle inicial)
const ButterflyFlight = lazy(() => import('./ButterflyFlight.jsx'))

// Si el chunk del vuelo no carga (servidor caído, red): abre la carta en vez
// de quedarse colgado en fase flying con pantalla vacía.
class FlightErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFail?.() }
  render() { return this.state.failed ? null : this.props.children }
}

// ── Carta + vuelo 3D (ButterflyFlight) — carta papyrus ──
export default function Letter({ onNext, onPrev }) {
  const [phase, setPhase] = useState('idle') // idle | flying | open
  const envelopeRef = useRef(null)
  const containerRef = useRef(null)

  const startFlight = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('flying')
  }, [phase])

  // ── Vuelo 3D: lo renderiza <ButterflyFlight> durante phase==='flying' ──

  const envRaf = useRef(0)
  const handleEnvelopeMove = (e) => {
    if (!envelopeRef.current || envRaf.current) return
    // perf: throttle a 1 update por frame — evita layout/paint por cada mousemove
    const px = e.clientX, py = e.clientY
    envRaf.current = requestAnimationFrame(() => {
      envRaf.current = 0
      const el = envelopeRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = (px - r.left) / r.width - 0.5
      const cy = (py - r.top) / r.height - 0.5
      el.style.transform = `perspective(700px) rotateY(${cx * 3.8}deg) rotateX(${-cy * 3.8}deg)`
    })
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
      {/* ── ESTILOS — carta Uiverse + papyrus ── */}
      <style>{`
        /* perf: fuentes (Dancing Script/Lora) precargadas en index.html, sin @import bloqueante */
        #letterWrap{opacity:0;transform:translate(-50%,-50%) scale(0.88);pointer-events:none;transition:opacity 0.95s ease, transform 1.15s cubic-bezier(0.22,1,0.36,1)}
        #letterWrap.show{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}
        .ltxt{opacity:0;transform:translateY(14px);transition:opacity 0.65s ease, transform 0.65s ease}
        #letterWrap.show .ltxt{opacity:1;transform:translateY(0)}
        #lGreet{transition-delay:0.42s} #lBody{transition-delay:0.76s} #lSign{transition-delay:1.08s}
        #seal{opacity:0;transform:scale(0);transition:opacity 0.48s ease 1.48s, transform 0.58s cubic-bezier(0.34,1.56,0.64,1) 1.48s}
        #letterWrap.show #seal{opacity:1;transform:scale(1)}
        #miniBf{opacity:0;transform:scale(0) rotate(-15deg);transition:opacity 0.55s ease 1.78s, transform 0.68s cubic-bezier(0.34,1.56,0.64,1) 1.78s}
        #letterWrap.show #miniBf{opacity:1;transform:scale(1) rotate(-15deg)}
        /* ── Carta cerrada: tu diseño sobre (260×360) + hover Uiverse JohnnyCSilva ── */
        .letter-card{width:260px;height:360px;background:linear-gradient(145deg,#1a0f0f 0%,#2a1111 50%,#0a0a0f 100%);border:1px solid rgba(212,175,55,0.22);border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;transition:transform 0.2s ease-in-out,box-shadow 0.2s ease-in-out,border-color 0.2s ease-in-out;position:relative;overflow:hidden;cursor:pointer;box-shadow:0 20px 60px rgba(0,0,0,0.55),0 0 40px rgba(139,0,0,0.12),inset 0 1px 0 rgba(212,175,55,0.08)}
        .letter-card .img{height:30%;position:absolute;transition:0.2s ease-in-out;z-index:1;color:rgba(220,20,60,0.55);filter:drop-shadow(0 0 12px rgba(220,20,60,0.2))}
        .letter-card .textBox{opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;transition:0.2s ease-in-out;z-index:2;text-align:center}
        .letter-card .textBox .head{font-size:20px;font-weight:700;letter-spacing:0.14em;font-family:'Cormorant Garamond',serif;color:#f9e076;text-shadow:0 0 16px rgba(212,175,55,0.3)}
        .letter-card .textBox span{font-size:12px;color:lightgrey;letter-spacing:0.14em;text-transform:uppercase}
        .letter-card:hover > .textBox{opacity:1}
        .letter-card:hover > .img{height:65%;filter:blur(7px);animation:cardAnim 3s infinite}
        @keyframes cardAnim{0%{transform:translateY(0)}50%{transform:translateY(-20px)}100%{transform:translateY(0)}}
        .letter-card:hover{transform:scale(1.04) rotate(-1deg);border-color:rgba(212,175,55,0.34);box-shadow:0 24px 70px rgba(0,0,0,0.6),0 0 50px rgba(139,0,0,0.18)}
        .letter-card:active{transform:scale(0.98)}
        @media(max-width:640px){.letter-card{width:195px;height:285px}.letter-card .textBox .head{font-size:18px}}
        @media(prefers-reduced-motion:reduce){.letter-card:hover > .img{animation:none!important}}
      `}</style>

      {/* Viñeta ultra sutil — no tapa cometas */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center,transparent 48%,rgba(0,0,0,0.32) 100%)' }} />

      {/* ── Vuelo 3D gótico a pantalla completa (1 minuto y abre la carta) ── */}
      {phase === 'flying' && (
        <FlightErrorBoundary onFail={() => setPhase('open')}>
          <Suspense fallback={null}>
            <ButterflyFlight onDone={() => setPhase('open')} />
          </Suspense>
        </FlightErrorBoundary>
      )}

      {/* Flecha atrás — vuelve a MemoryLane */}
      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className={`absolute top-4 left-4 sm:top-6 sm:left-6 ${phase === 'flying' ? 'z-40' : 'z-20'} w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-gold/25 hover:text-gold-light text-white/60 transition-colors`}>
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* ── CONTENIDO usa .container para responsivo ── */}
      <div className="container relative z-10 flex flex-col items-center justify-center w-full text-center gap-6 px-4">
          {phase !== 'flying' && (
          <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={springs.gentle} className="flex flex-col items-center gap-3 pb-1">
          <Feather className="w-9 h-9 text-crimson/30 mx-auto" />
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
            <span className="text-gradient-blood">Una carta</span> <span className="text-white">para ti</span>
          </h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-1" />
        </motion.div>
          )}

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
          <p id="lGreet" className="ltxt mb-3.5" style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(20px,4vw,26px)', fontWeight: 600, color: '#2c1810' }}>Querida persona,</p>
          <p id="lBody" className="ltxt" style={{ fontSize: 'clamp(13px,2.5vw,15px)', lineHeight: 1.9, color: '#4a3728' }}>
            Esta pequeña mariposa de papel ha cruzado distancias invisibles para llegar hasta ti. En cada pliegue hay un deseo silencioso, en cada aleteo un pensamiento que no encontró palabras. A veces los mensajes más importantes no necesitan grandes discursos — basta con un instante de belleza para decirlo todo.
          </p>
          <p id="lSign" className="ltxt mt-5 text-right" style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(18px,3.5vw,23px)', fontWeight: 700, color: '#2c1810' }}>Con cariño, siempre.</p>
          <div id="seal" className="absolute -bottom-4 right-8 w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 38% 38%,#d44030,#8b1a1a)', boxShadow: '0 2px 8px rgba(0,0,0,0.35),inset 0 1px 3px rgba(255,255,255,0.15)' }}>
            <span style={{ color: 'rgba(255,210,170,0.65)', fontSize: 18 }}>✣</span>
          </div>
        </div>
        {/* Botones — pebble puzzle para collage + repetir vuelo como antes (text link cyan) */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[360px] flex flex-col items-center gap-3 px-4" style={{ top: 'calc(100% + 20px)' }}>
          <motion.button onClick={onNext} className="w-full max-w-[260px] px-6 py-3.5 font-bold text-white uppercase tracking-wider text-xs rounded-2xl bg-crimson border-b-[5px] border-[#7f1d1d] active:border-b-0 active:translate-y-[5px] transition-[transform,box-shadow,background-color,border-color] duration-100 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2" style={{ fontFamily: "'Cormorant Garamond',serif" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase === 'open' ? 1 : 0, y: phase === 'open' ? 0 : 10 }} transition={{ delay: 2.1, duration: 0.45 }} whileTap={{ scale: 0.98 }}>
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
