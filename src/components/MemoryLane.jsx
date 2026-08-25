import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { ChevronLeft, ChevronRight, X, Camera, Play } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

const PLACEHOLDER_MEMORIES = [
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Nuestro disfraz de piratas' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Juntos siempre' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Momentos que atesoro' },
  { type: 'video', src: '', caption: 'Video especial (reemplaza con tu video)' },
  { type: 'image', src: '/puzzle-main.jpg', caption: 'Otro recuerdo bonito' },
]

function SwipeableCard({ children, onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0.5, 1, 1, 1, 0.5])

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      style={{ x, rotate, opacity }}
      onDragEnd={(_, info) => {
        const OFFSET = 80
        const VELOCITY = 400
        if (info.offset.x > OFFSET || info.velocity.x > VELOCITY) onSwipeRight()
        if (info.offset.x < -OFFSET || info.velocity.x < -VELOCITY) onSwipeLeft()
      }}
    >
      {children}
    </motion.div>
  )
}

export default function MemoryLane({ memories = PLACEHOLDER_MEMORIES, onNext }) {
  const [current, setCurrent] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const next = () => setCurrent((c) => (c + 1) % memories.length)
  const prev = () => setCurrent((c) => (c - 1 + memories.length) % memories.length)
  const currentMemory = memories[current]

  return (
    <motion.div
      className="main-wrapper min-h-screen relative overflow-hidden py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute top-20 left-12"
        animate={{ opacity: 0.1, x: [0, 10, -5, -10, 0], y: [0, -8, -14, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BatIcon className="w-5 h-5 text-crimson" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-12"
        animate={{ opacity: 0.06, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      <div className="container relative z-10 text-center">
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={springs.gentle}
        >
          <Camera className="w-10 h-10 text-crimson/30 mx-auto mb-4" />
          <h2 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="text-gradient-blood">Paseo de</span>{' '}
            <span className="text-white">recuerdos</span>
          </h2>
          <p className="text-crimson/40 flex items-center justify-center gap-2 text-sm tracking-wider">
            <FlowerIcon className="w-4 h-4" />
            {current + 1} / {memories.length}
            <FlowerIcon className="w-4 h-4" />
          </p>
        </motion.div>

        <div className="relative mb-8">
          <SwipeableCard onSwipeLeft={next} onSwipeRight={prev}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="glass glass-refraction rounded-2xl overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                transition={springs.gentle}
                onClick={() => setShowLightbox(true)}
                whileHover={{ scale: 1.01 }}
              >
                {currentMemory.type === 'video' ? (
                  <div className="aspect-video bg-deep-black/50 flex items-center justify-center relative">
                    <Play className="w-20 h-20 text-crimson/25 group-hover:text-crimson/50 transition-colors" />
                  </div>
                ) : (
                  <img
                    src={currentMemory.src}
                    alt={currentMemory.caption}
                    className="w-full aspect-video object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </AnimatePresence>
          </SwipeableCard>

          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass text-white flex items-center justify-center hover:bg-crimson/20 transition-all cursor-pointer interact-press z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass text-white flex items-center justify-center hover:bg-crimson/20 transition-all cursor-pointer interact-press z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={`caption-${current}`}
            className="text-white/60 text-lg italic mb-8 min-h-[3rem] flex items-center justify-center"
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={springs.gentle}
          >
            "{currentMemory.caption}"
          </motion.p>
        </AnimatePresence>

        <div className="flex gap-2 justify-center mb-10">
          {memories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                i === current
                  ? 'bg-crimson w-8 shadow-[0_0_12px_rgba(220,20,60,0.4)]'
                  : 'bg-white/10 hover:bg-crimson/30 w-2'
              }`}
            />
          ))}
        </div>

        <motion.button
          onClick={onNext}
          className="glass-refraction glass-prominent px-10 py-4 text-white rounded-full text-lg font-semibold cursor-pointer interact-glow"
          whileHover={{ scale: motionTokens.scale.pop, y: -2 }}
          whileTap={{ scale: motionTokens.scale.press }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.gentle, delay: 0.3 }}
        >
          <span className="flex items-center gap-2">
            Leer mi carta
            <BatIcon className="w-5 h-5" />
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showLightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass text-white flex items-center justify-center cursor-pointer hover:bg-crimson/30 transition-colors z-10"
              onClick={() => setShowLightbox(false)}
            >
              <X className="w-6 h-6" />
            </button>
            {currentMemory.type === 'video' ? (
              <div className="aspect-video bg-deep-black/50 flex items-center justify-center max-w-4xl w-full rounded-2xl glass z-10">
                <Play className="w-20 h-20 text-crimson/30" />
              </div>
            ) : (
              <motion.img
                src={currentMemory.src}
                alt={currentMemory.caption}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl z-10"
                initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                transition={springs.gentle}
              />
            )}
            <div className="absolute bottom-8 flex gap-4 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="px-5 py-2 glass text-white rounded-full cursor-pointer hover:bg-crimson/30 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="px-5 py-2 glass text-white rounded-full cursor-pointer hover:bg-crimson/30 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
