import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ZoomIn, Grid3X3 } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import AnimatedBackground from './AnimatedBackground'
import { springs, motionTokens } from '../lib/motion-tokens'

const PLACEHOLDER_PHOTOS = [
  '/puzzle-main.jpg', '/puzzle-main.jpg', '/puzzle-main.jpg',
  '/puzzle-main.jpg', '/puzzle-main.jpg', '/puzzle-main.jpg',
  '/puzzle-main.jpg', '/puzzle-main.jpg', '/puzzle-main.jpg',
  '/puzzle-main.jpg', '/puzzle-main.jpg', '/puzzle-main.jpg',
]

export default function Collage({ photos = PLACEHOLDER_PHOTOS, onNext }) {
  const [selected, setSelected] = useState(null)

  return (
    <motion.div
      className="main-wrapper min-h-screen relative overflow-hidden py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatedBackground />
      <motion.div
        className="absolute top-20 right-16"
        animate={{ opacity: 0.1, x: [0, 10, -5, -10, 0], y: [0, -8, -14, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BatIcon className="w-5 h-5 text-crimson" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-16"
        animate={{ opacity: 0.06, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      <div className="container-lg relative z-10">
        <motion.div
          className="mb-10 text-center"
          initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={springs.gentle}
        >
          <Grid3X3 className="w-10 h-10 text-crimson/30 mx-auto mb-4" />
          <h2 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="text-gradient-blood">Nuestro</span>{' '}
            <span className="text-white">collage</span>
          </h2>
          <p className="text-crimson/40 flex items-center justify-center gap-2 text-sm tracking-wider">
            <FlowerIcon className="w-4 h-4" />
            Todos nuestros momentos juntos
            <BatIcon className="w-4 h-4" />
          </p>
        </motion.div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 mb-12">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              className="relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid glass interact-lift"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ ...springs.gentle, delay: i * 0.04 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
              onClick={() => setSelected(i)}
            >
              <img
                src={photo}
                alt={`Recuerdo ${i + 1}`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-white/70 text-sm">Recuerdo {i + 1}</span>
                  <ZoomIn className="w-5 h-5 text-crimson" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button
            onClick={onNext}
            className="glass-refraction glass-prominent px-10 py-4 text-white rounded-full text-lg font-semibold cursor-pointer interact-glow"
            whileHover={{ scale: motionTokens.scale.pop, y: -2 }}
            whileTap={{ scale: motionTokens.scale.press }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.gentle, delay: 0.5 }}
          >
            <span className="flex items-center gap-2">
              Escuchar nuestra música
              <FlowerIcon className="w-5 h-5" />
            </span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass text-white flex items-center justify-center cursor-pointer hover:bg-crimson/30 transition-colors z-10"
              onClick={() => setSelected(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              src={photos[selected]}
              alt={`Recuerdo ${selected + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl z-10"
              initial={{ scale: 0.7, opacity: 0, filter: 'blur(12px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.7, opacity: 0, filter: 'blur(12px)' }}
              transition={springs.gentle}
            />
            <div className="absolute bottom-8 flex gap-4 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((s) => (s - 1 + photos.length) % photos.length) }}
                className="px-6 py-3 glass text-white rounded-full cursor-pointer hover:bg-crimson/30 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((s) => (s + 1) % photos.length) }}
                className="px-6 py-3 glass text-white rounded-full cursor-pointer hover:bg-crimson/30 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
