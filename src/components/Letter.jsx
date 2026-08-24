import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Heart, Feather } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

export default function Letter({ onNext }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative px-4 bg-liquid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute top-24 left-16"
        animate={{ opacity: 0.1, x: [0, 8, -4, -8, 0], y: [0, -6, -12, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BatIcon className="w-5 h-5 text-crimson" />
      </motion.div>
      <motion.div
        className="absolute bottom-24 right-16"
        animate={{ opacity: 0.06, rotate: [0, 8, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <motion.div
          initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={springs.gentle}
        >
          <Feather className="w-10 h-10 text-crimson/30 mx-auto mb-4" />
          <h2 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="text-gradient-blood">Una carta</span>{' '}
            <span className="text-white">para ti</span>
          </h2>
        </motion.div>

        {!isOpen ? (
          <motion.div
            className="cursor-pointer mt-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springs.gentle, delay: 0.2 }}
            onClick={() => setIsOpen(true)}
          >
            <motion.div
              className="glass glass-refraction w-56 h-64 md:w-72 md:h-80 mx-auto rounded-3xl flex flex-col items-center justify-center relative overflow-hidden interact-lift"
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(139,0,0,0.05), 0 8px 32px rgba(0,0,0,0.3)',
                  '0 0 40px rgba(220,20,60,0.12), 0 12px 40px rgba(0,0,0,0.4)',
                  '0 0 20px rgba(139,0,0,0.05), 0 8px 32px rgba(0,0,0,0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-crimson/3 to-transparent" />
              <Mail className="w-20 h-20 text-crimson/40 mb-6 relative z-10" />
              <p className="text-white/30 text-sm relative z-10">Toca para abrir</p>
              <motion.span
                className="absolute bottom-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FlowerIcon className="w-5 h-5 text-sunflower/40" />
              </motion.span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="glass glass-prominent glass-refraction rounded-3xl p-8 md:p-12 mt-8"
            initial={{ scale: 0.5, opacity: 0, rotateY: 90, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, rotateY: 0, filter: 'blur(0px)' }}
            transition={{ ...springs.gentle, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Heart className="w-6 h-6 text-crimson" fill="currentColor" />
              <BatIcon className="w-5 h-5 text-crimson/40" />
              <Heart className="w-6 h-6 text-crimson" fill="currentColor" />
            </div>

            <div className="text-left space-y-6 text-white/65 leading-relaxed text-base md:text-lg">
              <motion.p
                className="text-crimson italic text-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springs.gentle, delay: 0.3 }}
              >
                Mi amor,
              </motion.p>

              {[
                'Hoy cumplimos 2 años juntos, y quiero que sepas que cada día a tu lado es el regalo más hermoso que la vida me ha dado. Desde el primer momento supe que eras especial, y con el tiempo solo me he confirmado de lo increíble que es caminar a tu lado.',
                'Me encanta tu sonrisa, tu forma de ser, cómo me haces reír incluso en los días más difíciles. Contigo he aprendido que el amor no es solo pasión, sino también calma, complicidad y crecimiento.',
                'Gracias por estos dos años llenos de risas, aventuras y momentos que atesoro en el corazón. Gracias por ser tú, por elegirme cada día, por construir esto conmigo.',
                'Te amo más de lo que las palabras pueden expresar. Y este proyecto es solo un pequeño testimonio de todo lo que significas para mí.',
              ].map((text, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ ...springs.gentle, delay: 0.4 + i * 0.15 }}
                >
                  {text}
                </motion.p>
              ))}

              <motion.div
                className="text-right pt-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.gentle, delay: 1.1 }}
              >
                <p className="text-crimson italic text-xl mb-2">Con todo mi amor,</p>
                <p className="text-white font-bold text-2xl flex items-center justify-end gap-2">
                  Steven
                  <FlowerIcon className="w-5 h-5 text-sunflower" />
                  <BatIcon className="w-4 h-4 text-crimson/40" />
                </p>
              </motion.div>
            </div>

            <motion.button
              onClick={onNext}
              className="mt-10 glass-refraction glass-prominent px-10 py-4 text-white rounded-full text-lg font-semibold cursor-pointer interact-glow"
              whileHover={{ scale: motionTokens.scale.pop, y: -2 }}
              whileTap={{ scale: motionTokens.scale.press }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 1.3 }}
            >
              <span className="flex items-center gap-2">
                Ver nuestro collage
                <BatIcon className="w-5 h-5" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
