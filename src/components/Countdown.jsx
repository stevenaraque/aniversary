import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Clock, Heart } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import AnimatedBackground from './AnimatedBackground'
import { springs, motionTokens } from '../lib/motion-tokens'

const ANIVERSARY_DATE = new Date('2024-08-24T00:00:00')

function calculateTime() {
  const now = new Date()
  const diff = now - ANIVERSARY_DATE
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { years, months, days, hours, minutes, seconds }
}

function AnimatedNumber({ value }) {
  return <span>{String(value).padStart(2, '0')}</span>
}

function TimeBlock({ value, label, delay }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ ...springs.gentle, delay }}
    >
      <div className="glass glass-refraction w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden interact-lift">
        <div className="absolute inset-0 bg-linear-to-b from-crimson/5 to-transparent" />
        <span className="text-3xl md:text-5xl font-bold text-white tabular-nums relative z-10">
          <AnimatedNumber value={value} />
        </span>
      </div>
      <span className="text-xs md:text-sm text-crimson/40 uppercase tracking-[0.2em] font-light">{label}</span>
    </motion.div>
  )
}

export default function Countdown({ onNext }) {
  const [time, setTime] = useState(calculateTime())
  useEffect(() => {
    const timer = setInterval(() => setTime(calculateTime()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      className="main-wrapper min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatedBackground />
      <motion.div className="absolute top-16 right-20" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 0.12, x: 0 }} transition={springs.gentle}>
        <BatIcon className="w-6 h-6 text-crimson" />
      </motion.div>
      <motion.div className="absolute bottom-24 left-16" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.08, x: 0 }} transition={springs.gentle}>
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      {/* 2. CONTAINER */}
      <div className="container flex flex-col items-center justify-center min-h-screen py-20 text-center relative z-10">
        <motion.div className="mb-6" initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} transition={springs.gentle}>
          <Clock className="w-10 h-10 text-crimson/30 mx-auto mb-4" />
        </motion.div>

        <motion.h2 className="text-4xl md:text-6xl font-bold mb-3" initial={{ y: -20, opacity: 0, filter: 'blur(6px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} transition={{ ...springs.gentle, delay: 0.1 }}>
          <span className="text-gradient-blood">Tiempo</span> <span className="text-white">juntos</span>
        </motion.h2>

        <motion.p className="text-crimson/40 mb-12 text-sm flex items-center justify-center gap-3 tracking-wider uppercase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: motionTokens.duration.slow }}>
          <BatIcon className="w-4 h-4" /> Desde el 24 de agosto de 2024 <BatIcon className="w-4 h-4" />
        </motion.p>

        {/* 3. GRID COMPONENTS */}
        <div className="cards-grid max-w-4xl mx-auto !gap-4 md:!gap-6 mb-12 !grid-cols-3 md:!flex md:!flex-wrap md:justify-center">
          <TimeBlock value={time.years} label="Años" delay={0.1} />
          <TimeBlock value={time.months} label="Meses" delay={0.15} />
          <TimeBlock value={time.days} label="Días" delay={0.2} />
          <TimeBlock value={time.hours} label="Horas" delay={0.25} />
          <TimeBlock value={time.minutes} label="Min" delay={0.3} />
          <TimeBlock value={time.seconds} label="Seg" delay={0.35} />
        </div>

        <motion.div className="flex items-center justify-center gap-4 mb-10" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ ...springs.gentle, delay: 0.5 }}>
          <div className="h-px w-16 bg-linear-to-r from-transparent to-crimson/20" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
            <Heart className="w-4 h-4 text-crimson" fill="currentColor" />
          </motion.div>
          <div className="h-px w-16 bg-linear-to-l from-transparent to-crimson/20" />
        </motion.div>

        <motion.p className="text-white/20 text-sm mb-10 italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Cada segundo cuenta contigo
        </motion.p>

        <motion.button onClick={onNext} className="glass-refraction glass-prominent px-10 py-4 text-white rounded-full text-lg font-semibold cursor-pointer interact-glow" whileHover={{ scale: motionTokens.scale.pop, y: -2 }} whileTap={{ scale: motionTokens.scale.press }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.gentle, delay: 0.8 }}>
          Desbloquear recuerdos
        </motion.button>
      </div>
    </motion.div>
  )
}
