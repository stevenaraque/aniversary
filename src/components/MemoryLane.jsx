import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, X, Camera, BookOpen, Mail, Lock, Unlock, ArrowLeft } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

const PLACEHOLDER_MEMORIES = [
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Nuestro disfraz de piratas — esa noche reímos hasta que nos dolió la panza.' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Juntos siempre — tu mano en la mía es mi lugar favorito.' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Momentos que atesoro — cada foto es un pedacito de nosotros.' },
  { type: 'video', src: '', caption: 'Video especial — nuestro baile improvisado en la sala.' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Otro recuerdo bonito — y los que nos faltan por crear.' },
]

function SwipeableCard({ children, onSwipeLeft, onSwipeRight }) {
  // Usamos motion.div con drag para swipe - simplificado sin useMotionValue para no romper container
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.28}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80 || info.velocity.x > 400) onSwipeRight()
        if (info.offset.x < -80 || info.velocity.x < -400) onSwipeLeft()
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

const LS_KEY = 'aniversary:memoryLane:read'
export default function MemoryLane({ memories: _memories = PLACEHOLDER_MEMORIES, onNext, onPrev }) {
  const memories = Array.isArray(_memories) && _memories.length ? _memories : PLACEHOLDER_MEMORIES
  const [current, setCurrent] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showDesc, setShowDesc] = useState(false)
  const [readSet, setReadSet] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) return new Set(arr.filter(n => typeof n === 'number' && n >= 0 && n < memories.length))
      }
    } catch {}
    return new Set()
  })
  const isAllRead = readSet.size >= memories.length
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify([...readSet])) } catch {}
  }, [readSet])
  const handleShowDesc = () => { setReadSet(prev => { const n = new Set(prev); n.add(current); return n }); setShowDesc(true) }
  const handleResetProgress = () => { setReadSet(new Set()); try { localStorage.removeItem(LS_KEY) } catch {} }

  const next = () => { setCurrent((c) => (c + 1) % memories.length); setShowDesc(false) }
  const prev = () => { setCurrent((c) => (c - 1 + memories.length) % memories.length); setShowDesc(false) }
  const currentMemory = memories[current]

  return (
    <motion.div className="main-wrapper min-h-[100dvh] relative overflow-visible flex flex-col items-center justify-center py-8 sm:py-10 bg-transparent" initial={{opacity:0, scale:0.985, filter:'blur(6px)'}} animate={{opacity:1, scale:1, filter:'blur(0px)'}} exit={{opacity:0, scale:1.005, filter:'blur(5px)'}} transition={{ duration:0.4, ease: motionTokens.easing.easeOut }}>
      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-gold/25 hover:text-gold-light text-white/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="absolute top-8 left-4 sm:left-8 opacity-[0.05] hidden sm:block pointer-events-none">
        <BatIcon className="w-5 h-5 text-crimson" />
      </div>
      <div className="absolute bottom-8 right-4 sm:right-8 opacity-[0.04] hidden sm:block pointer-events-none">
        <FlowerIcon className="w-5 h-5 text-gold" />
      </div>

      <div className="container-lg relative z-10 w-full max-w-full px-4 sm:px-6 lg:px-8 py-2 flex flex-col items-center gap-6 sm:gap-8 overflow-visible">
        <motion.div className="text-center w-full max-w-3xl mx-auto" initial={{y:-14,opacity:0,filter:'blur(6px)'}} animate={{y:0,opacity:1,filter:'blur(0px)'}} transition={springs.gentle}>
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-crimson/25 mx-auto mb-3" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{fontFamily:'Cormorant Garamond,serif'}}><span className="text-gradient-blood">Paseo de</span> <span className="text-white">recuerdos</span></h2>
          <p className="text-gold/30 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-widest mt-2"><FlowerIcon className="w-3.5 h-3.5" /> {current + 1} / {memories.length} <FlowerIcon className="w-3.5 h-3.5" /></p>
        </motion.div>

        {/* Grid container: centrado y proporcionado */}
        <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center justify-items-center">
          {/* Izquierda: Titulo + botones compactos y espaciados limpio */}
          <div className="order-2 lg:order-1 w-full max-w-[360px] lg:max-w-[380px] mx-auto flex flex-col items-center text-center gap-6">
            <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2.5" style={{fontFamily:'Cormorant Garamond,serif', textShadow:'0 2px 16px rgba(0,0,0,0.6)'}}><BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-gold/60" /> Historia</h3>
            <p className="text-white/70 text-sm leading-relaxed -mt-2" style={{fontFamily:'Cormorant Garamond,serif'}}>{readSet.size} / {memories.length} historias leídas</p>
            <div className="w-full flex flex-col items-center gap-4">
              <button onClick={handleShowDesc} className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#0a0a0f] border border-gold/20 rounded-xl text-white font-medium text-sm tracking-wide hover:border-gold/35 hover:bg-[#141414] transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <BookOpen className="w-4 h-4 text-gold/70" /> <span style={{fontFamily:'Cormorant Garamond,serif'}}>Leer historia</span>
                {readSet.has(current) && <span className="ml-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" title="Leída" />}
              </button>
              <button onClick={onNext} disabled={!isAllRead} className={`w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-medium text-sm tracking-wide transition-colors duration-200 border ${isAllRead ? 'bg-crimson border-crimson/30 text-white hover:bg-[#b91c1c] hover:border-gold/20 shadow-[0_4px_20px_rgba(220,38,38,0.25)] cursor-pointer' : 'bg-[#0a0a0f]/60 border-white/10 text-white/35 cursor-not-allowed backdrop-blur-sm'}`}>
                {isAllRead ? <Unlock className="w-4 h-4 text-white/90" /> : <Lock className="w-4 h-4 text-white/30" />}
                <span style={{fontFamily:'Cormorant Garamond,serif'}}>{isAllRead ? 'Leer la carta' : `Desbloquea (${readSet.size}/${memories.length})`}</span>
                {isAllRead ? <Mail className="w-4 h-4 text-white/80" /> : null}
              </button>
              {!isAllRead && <p className="text-white/30 text-[11px] tracking-wide text-center -mt-1">Lee todas las historias para desbloquear</p>}
              {readSet.size > 0 && (
                <button onClick={handleResetProgress} className="text-white/25 text-[10px] tracking-widest uppercase hover:text-white/50 transition-colors" style={{fontFamily:'Cormorant Garamond,serif'}}>Reiniciar progreso</button>
              )}
            </div>
          </div>

          {/* Derecha: Imagen/Video - cuadro adapta a foto */}
          <div className="order-1 lg:order-2 w-full max-w-[560px] sm:max-w-[640px] lg:max-w-none mx-auto flex flex-col items-center gap-2">
            <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.2em] uppercase flex items-center gap-1.5 sm:gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
              <span>Desliza</span><span className="hidden sm:inline">o usa flechas</span><ChevronRight className="w-3 h-3 text-white/20" />
            </p>
            <div className="relative w-full max-w-full">
              <SwipeableCard onSwipeLeft={next} onSwipeRight={prev}>
                <motion.div key={current} className="glass glass-refraction rounded-2xl overflow-hidden cursor-pointer group w-full" initial={{opacity:0, scale:0.97}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.97}} transition={springs.gentle} onClick={()=>setShowLightbox(true)}>
                  {currentMemory.type==='video' ? (
                    <div className="bg-deep-black/50 flex items-center justify-center relative w-full p-8">
                      <div className="w-16 h-16 rounded-full bg-crimson/10 flex items-center justify-center"><Camera className="w-8 h-8 text-crimson/30" /></div>
                    </div>
                  ) : (
                    <img src={currentMemory.src} alt={currentMemory.caption} className="w-full h-auto object-contain max-h-[65vh] sm:max-h-[60vh]" loading="eager" decoding="async" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              </SwipeableCard>
              <button onClick={prev} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass text-white flex items-center justify-center hover:bg-crimson/20 transition-colors z-10" aria-label="Anterior"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={next} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass text-white flex items-center justify-center hover:bg-crimson/20 transition-colors z-10" aria-label="Siguiente"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <p className="text-white/40 text-xs sm:text-sm italic mt-3 text-center lg:hidden">Desliza o usa flechas</p>
          </div>
        </div>

        
      </div>

      {/* Sub-ventana descripción — compacta, nunca ancho completo */}
      <AnimatePresence>
        {showDesc && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowDesc(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div className="relative glass glass-prominent rounded-2xl p-6 sm:p-7 w-[92vw] sm:w-full max-w-[420px] max-h-[75vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)]" initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,opacity:0}} transition={springs.gentle} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setShowDesc(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4 text-white/60" /></button>
              <div className="flex items-center gap-2 mb-4 text-gold/50 text-xs tracking-[0.2em] uppercase"><BookOpen className="w-4 h-4" /> Recuerdo {current+1} de {memories.length} {readSet.has(current) ? '✓' : ''}</div>
              <p className="text-white/90 text-base sm:text-[17px] leading-relaxed text-center" style={{fontFamily:'Cormorant Garamond,serif'}}>{currentMemory.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLightbox && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowLightbox(false)}>
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <button className="absolute top-6 right-6 w-10 h-10 rounded-full glass text-white flex items-center justify-center z-10" onClick={()=>setShowLightbox(false)}><X className="w-5 h-5" /></button>
            <motion.img src={currentMemory.src} alt={currentMemory.caption} className="max-w-full max-h-[85vh] object-contain rounded-2xl z-10 max-w-[90vw]" initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}} transition={springs.gentle} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
