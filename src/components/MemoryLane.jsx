import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, X, Camera, BookOpen, Mail } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs } from '../lib/motion-tokens'

const PLACEHOLDER_MEMORIES = [
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Nuestro disfraz de piratas — esa noche reímos hasta que nos dolió la panza.' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Juntos siempre — tu mano en la mía es mi lugar favorito.' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Momentos que atesoro — cada foto es un pedacito de nosotros.' },
  { type: 'video', src: '', caption: 'Video especial — nuestro baile improvisado en la sala.' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Otro recuerdo bonito — y los que nos faltan por crear.' },
]

function SwipeableCard({ children, onSwipeLeft, onSwipeRight }) {
  const x = { get: () => 0, set: () => {} }
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

export default function MemoryLane({ memories = PLACEHOLDER_MEMORIES, onNext }) {
  const [current, setCurrent] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showDesc, setShowDesc] = useState(false)

  const next = () => { setCurrent((c) => (c + 1) % memories.length); setShowDesc(false) }
  const prev = () => { setCurrent((c) => (c - 1 + memories.length) % memories.length); setShowDesc(false) }
  const currentMemory = memories[current]

  return (
    <motion.div className="main-wrapper min-h-[100dvh] relative overflow-visible flex flex-col items-center justify-center py-8 sm:py-10 bg-transparent" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute top-8 left-4 sm:left-8 opacity-[0.05] hidden sm:block pointer-events-none">
        <BatIcon className="w-5 h-5 text-crimson" />
      </div>
      <div className="absolute bottom-8 right-4 sm:right-8 opacity-[0.04] hidden sm:block pointer-events-none">
        <FlowerIcon className="w-5 h-5 text-gold" />
      </div>

      <div className="container-lg relative z-10 w-full max-w-full px-4 sm:px-6 lg:px-8 py-2 flex flex-col items-center gap-6 sm:gap-8 overflow-visible">
        <motion.div className="text-center w-full max-w-3xl mx-auto" initial={{y:-14,opacity:0,filter:'blur(6px)'}} animate={{y:0,opacity:1,filter:'blur(0px)'}} transition={springs.gentle}>
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-crimson/25 mx-auto mb-3" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{fontFamily:'Cinzel,serif'}}><span className="text-gradient-blood">Paseo de</span> <span className="text-white">recuerdos</span></h2>
          <p className="text-gold/30 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-widest mt-2"><FlowerIcon className="w-3.5 h-3.5" /> {current + 1} / {memories.length} <FlowerIcon className="w-3.5 h-3.5" /></p>
        </motion.div>

        {/* Grid container: izquierda botón/desc, derecha imagen - cada div se adapta */}
        <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-10 items-center">
          {/* Izquierda: Título + dos botones agrandados y más separados */}
          <div className="order-2 lg:order-1 w-full flex flex-col items-center text-center gap-5 px-2 sm:px-4">
            <h3 className="text-7xl sm:text-8xl font-bold text-white flex items-center gap-3" style={{fontFamily:'Cinzel,serif'}}><BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gold/60" /> Historia</h3>
            <div className="w-full flex flex-col items-center gap-10 sm:gap-14">
              <button onClick={()=>setShowDesc(true)} className="relative inline-flex items-center justify-center px-30 py-20 overflow-hidden tracking-tighter text-white bg-[#0a0a0f] border border-gold/20 rounded-md group hover:border-gold/30 transition-colors origin-center">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-gold rounded-full group-hover:w-[22rem] group-hover:h-[22rem] opacity-90"></span>
                <span className="absolute bottom-0 left-0 h-full -ml-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-auto h-full opacity-10" viewBox="0 0 487 487"><path fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"/></svg></span>
                <span className="absolute top-0 right-0 w-12 h-full -mr-3"><svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10" viewBox="0 0 487 487"><path fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"/></svg></span>
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-md opacity-20 bg-gradient-to-b from-transparent via-transparent to-white/30"></span>
                <span className="relative text-base font-semibold tracking-wide flex items-center gap-2" style={{fontFamily:'Cinzel,serif'}}>leer historia <BookOpen className="w-5 h-5" /></span>
              </button>
              <button onClick={onNext} className="relative inline-flex items-center justify-center px-30 py-20 overflow-hidden tracking-tighter text-white bg-[#0a0a0f] border border-gold/20 rounded-md group hover:border-gold/30 transition-colors origin-center">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-gold rounded-full group-hover:w-[22rem] group-hover:h-[22rem] opacity-90"></span>
                <span className="absolute bottom-0 left-0 h-full -ml-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-auto h-full opacity-10" viewBox="0 0 487 487"><path fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"/></svg></span>
                <span className="absolute top-0 right-0 w-12 h-full -mr-3"><svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10" viewBox="0 0 487 487"><path fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"/></svg></span>
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-md opacity-20 bg-gradient-to-b from-transparent via-transparent to-white/30"></span>
                <span className="relative text-base font-semibold tracking-wide flex items-center gap-2" style={{fontFamily:'Cinzel,serif'}}>vamos a leer <Mail className="w-5 h-5" /></span>
              </button>
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
                    <img src={currentMemory.src} alt={currentMemory.caption} className="w-full h-auto object-contain max-h-[65vh] sm:max-h-[60vh]" />
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

      {/* Sub-ventana descripción */}
      <AnimatePresence>
        {showDesc && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowDesc(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div className="relative glass glass-prominent rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-auto" initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,opacity:0}} transition={springs.gentle} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setShowDesc(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4 text-white/60" /></button>
              <div className="flex items-center gap-2 mb-4 text-gold/40 text-xs tracking-[0.2em] uppercase"><BookOpen className="w-4 h-4" /> Recuerdo {current+1}</div>
              <p className="text-white/90 text-base sm:text-lg leading-relaxed text-center" style={{fontFamily:'Cormorant Garamond,serif'}}>{currentMemory.caption}</p>
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
