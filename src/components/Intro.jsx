import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Heart, Skull, Sparkles } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

function CursorFollower() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, springs.gentle)
  const sy = useSpring(y, springs.gentle)
  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])
  return (
    <motion.div
      className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50"
      style={{
        x: sx, y: sy,
        background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(220,20,60,0.06) 50%, transparent 70%)',
        filter: 'blur(40px)',
      }}
    />
  )
}

function StarRain() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 1.8 + 0.8,
    duration: 7 + Math.random() * 8,
    delay: Math.random() * 6,
    tx: (Math.random() - 0.5) * 180,
    ty: (Math.random() - 0.5) * 180,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, boxShadow: s.size > 1.5 ? '0 0 6px rgba(255,255,255,0.6)' : 'none' }}
          animate={{
            opacity: [0, 0.9, 0],
            scale: [0.5, 1, 0.5],
            x: [0, s.tx],
            y: [0, s.ty],
          }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

function AnimatedTitle() {
  const words = ['Nuestro', 'Tiempo']
  return (
    <motion.h1
      className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className={`inline-block mr-4 ${i === 0 ? 'text-gradient-blood' : 'text-white'}`}
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: springs.gentle },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}

function CharacterDuo() {
  return (
    <motion.div
      className="flex items-center justify-center gap-8 md:gap-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.gentle, delay: 0.6 }}
    >
      <motion.div className="flex flex-col items-center gap-3" whileHover={{ y: -4, scale: 1.05 }} transition={springs.bouncy}>
        <div className="glass w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center relative">
          <BatIcon className="w-10 h-10 md:w-12 md:h-12 text-crimson" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-crimson rounded-full animate-pulse" />
        </div>
        <span className="text-xs tracking-[0.2em] uppercase text-crimson/50">Él — Murciélago</span>
      </motion.div>

      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <Heart className="w-6 h-6 text-gold" fill="currentColor" />
      </motion.div>

      <motion.div className="flex flex-col items-center gap-3" whileHover={{ y: -4, scale: 1.05 }} transition={springs.bouncy}>
        <div className="glass w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center relative">
          <FlowerIcon className="w-10 h-10 md:w-12 md:h-12 text-gold" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-pulse" />
        </div>
        <span className="text-xs tracking-[0.2em] uppercase text-gold/60">Ella — Girasol</span>
      </motion.div>
    </motion.div>
  )
}

function FloatingBat({ className, delay = 0, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{
        opacity: [0, 0.15, 0.1, 0.15],
        scale: 1,
        rotate: 0,
        x: [0, 12, -6, -12, 0],
        y: [0, -10, -18, -6, 0],
      }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <BatIcon className="w-5 h-5 text-crimson" />
    </motion.div>
  )
}

function HeartPulse() {
  return (
    <motion.div
      className="relative inline-block"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.3 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          filter: [
            'drop-shadow(0 0 10px rgba(220,20,60,0.3))',
            'drop-shadow(0 0 30px rgba(220,20,60,0.6))',
            'drop-shadow(0 0 10px rgba(220,20,60,0.3))',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart className="w-20 h-20 text-crimson" fill="currentColor" />
      </motion.div>
      <motion.span className="absolute -top-2 -right-3" animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
        <FlowerIcon className="w-6 h-6 text-gold" />
      </motion.span>
      <motion.span className="absolute -bottom-1 -left-4" animate={{ x: [0, 4, -4, 0], y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        <BatIcon className="w-5 h-5 text-crimson/50" />
      </motion.span>
    </motion.div>
  )
}

export default function Intro({ onNext }) {
  const containerRef = useRef(null)

  return (
    <motion.div
      ref={containerRef}
      className="main-wrapper min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StarRain />
      <CursorFollower />

      {[...Array(6)].map((_, i) => (
        <FloatingBat key={i} className="absolute" style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }} delay={i * 0.8} />
      ))}

      {/* presentacion esparcida */}
      <div className="container flex flex-col items-center justify-evenly min-h-screen py-12 md:py-20 text-center relative z-10 gap-6 md:gap-10">
        {/* bloque superior esparcido */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 glass px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-gold/60" />
          <span className="text-xs tracking-[0.2em] uppercase text-white/40">2 años juntos — 24.08.2024</span>
          <Sparkles className="w-3.5 h-3.5 text-crimson/50" />
        </motion.div>

        <motion.div className="flex flex-col items-center gap-8 md:gap-12 w-full">
          <HeartPulse />
          <AnimatedTitle />
          <CharacterDuo />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...springs.gentle, delay: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center justify-center gap-3 text-sm text-white/25">
            <BatIcon className="w-4 h-4" />
            <span className="w-8 h-px bg-linear-to-r from-transparent via-crimson/30 to-transparent" />
            <span className="tracking-[0.3em] uppercase">Nuestro viaje</span>
            <span className="w-8 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
            <FlowerIcon className="w-4 h-4" />
          </div>
          <p className="text-white/30 max-w-2xl mx-auto text-base leading-relaxed">
            Cada segundo a tu lado es un tesoro.
            <br />
            <span className="text-crimson/40">Este espacio celebra nuestros recuerdos con luz, viento y estrellas.</span>
          </p>
        </motion.div>

        <motion.button
          onClick={onNext}
          className="glass-refraction glass-prominent px-10 py-5 text-white rounded-full text-xl font-semibold cursor-pointer relative overflow-hidden group interact-glow"
          whileHover={{ scale: motionTokens.scale.pop, y: -2 }}
          whileTap={{ scale: motionTokens.scale.press }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.gentle, delay: 1 }}
        >
          <span className="relative z-10 flex items-center gap-3">
            Comenzar nuestro viaje
            <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <FlowerIcon className="w-5 h-5" />
            </motion.span>
          </span>
          <motion.div className="absolute inset-0 bg-linear-to-r from-crimson/0 via-gold/10 to-crimson/0" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
        </motion.button>

        <motion.p className="text-white/10 text-sm flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <Skull className="w-3 h-3" /> Hecho con amor por Steven <Skull className="w-3 h-3" />
        </motion.p>
      </div>
    </motion.div>
  )
}
