import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Heart, Skull } from 'lucide-react'
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
        background: 'radial-gradient(circle, rgba(220,20,60,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }}
    />
  )
}

function AnimatedTitle() {
  const words = ['Nuestro', 'Tiempo']
  return (
    <motion.h1
      className="text-6xl md:text-8xl font-bold mb-4 leading-tight"
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
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
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

      <motion.span
        className="absolute -top-2 -right-3"
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <FlowerIcon className="w-6 h-6 text-sunflower" />
      </motion.span>

      <motion.span
        className="absolute -bottom-1 -left-4"
        animate={{ x: [0, 4, -4, 0], y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
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
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-liquid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CursorFollower />

      {[...Array(6)].map((_, i) => (
        <FloatingBat
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          delay={i * 0.8}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div className="mb-8">
          <HeartPulse />
        </motion.div>

        <AnimatedTitle />

        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...springs.gentle, delay: 0.5 }}
        >
          <p className="text-2xl md:text-3xl text-crimson/70 mb-3 font-light tracking-wide">
            2 años juntos
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-white/25 mb-10">
            <BatIcon className="w-4 h-4" />
            <span className="w-8 h-px bg-linear-to-r from-transparent via-crimson/30 to-transparent" />
            <span className="tracking-[0.3em] uppercase">24.08.2024</span>
            <span className="w-8 h-px bg-linear-to-r from-transparent via-crimson/30 to-transparent" />
            <BatIcon className="w-4 h-4" />
          </div>
        </motion.div>

        <motion.p
          className="text-white/30 mb-12 max-w-md mx-auto text-base leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: motionTokens.duration.slow }}
        >
          Cada segundo a tu lado es un tesoro.
          <br />
          <span className="text-crimson/40">Este espacio es para celebrar nuestros recuerdos.</span>
        </motion.p>

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
            <motion.span
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FlowerIcon className="w-5 h-5" />
            </motion.span>
          </span>
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-crimson/0 via-crimson/10 to-crimson/0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.button>

        <motion.p
          className="mt-8 text-white/10 text-sm flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Skull className="w-3 h-3" />
          Hecho con amor por Steven
          <Skull className="w-3 h-3" />
        </motion.p>
      </div>
    </motion.div>
  )
}
