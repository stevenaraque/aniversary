import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Heart, Feather } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

export default function Letter({ onNext }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="main-wrapper min-h-[100dvh] relative overflow-visible flex flex-col items-center justify-center py-6 sm:py-8 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute top-10 left-6 sm:left-10 hidden sm:block"
        animate={{ opacity: 0.07, x: [0, 8, -4, -8, 0], y: [0, -6, -12, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BatIcon className="w-5 h-5 text-crimson" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-6 sm:right-10 hidden sm:block"
        animate={{ opacity: 0.05, rotate: [0, 8, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      <div className="container-sm relative z-10 flex flex-col items-center justify-center w-full max-w-full px-4 sm:px-6 text-center overflow-visible gap-8 sm:gap-10">
        <motion.div
          initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={springs.gentle}
          className="flex flex-col items-center gap-3 sm:gap-4 pb-2"
        >
          <Feather className="w-10 h-10 text-crimson/30 mx-auto" />
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-gradient-blood">Una carta</span>{' '}
            <span className="text-white">para ti</span>
          </h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-2" />
        </motion.div>

        {!isOpen ? (
          <motion.div
            className="cursor-pointer mt-2 mx-auto flex justify-center overflow-visible p-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springs.gentle, delay: 0.2 }}
            onClick={() => setIsOpen(true)}
          >
            <style>{`
              .letter-card{width:260px;height:360px;background:linear-gradient(145deg,#1a0f0f 0%,#2a1111 50%,#0a0a0f 100%);border:1px solid rgba(212,175,55,0.22);border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;transition:0.2s ease-in-out;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.55),0 0 40px rgba(139,0,0,0.12),inset 0 1px 0 rgba(212,175,55,0.08)}
              .letter-img{height:32%;position:absolute;transition:0.2s ease-in-out;z-index:1;color:rgba(220,20,60,0.55);filter:drop-shadow(0 0 12px rgba(220,20,60,0.2))}
              .letter-textBox{opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;transition:0.2s ease-in-out;z-index:2;text-align:center}
              .letter-textBox .head{font-size:22px;font-weight:700;letter-spacing:0.18em;font-family:'Cinzel',serif;color:#f9e076;text-shadow:0 0 16px rgba(212,175,55,0.3)}
              .letter-textBox span{font-size:11px;color:rgba(232,220,200,0.65);letter-spacing:0.2em;text-transform:uppercase}
              .letter-card:hover > .letter-textBox{opacity:1}
              .letter-card:hover > .letter-img{height:52%;filter:blur(5px);animation:letterAnim 3s infinite}
              @keyframes letterAnim{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
              .letter-card:hover{transform:scale(1.03) rotate(-0.6deg);border-color:rgba(212,175,55,0.35);box-shadow:0 24px 70px rgba(0,0,0,0.6),0 0 50px rgba(139,0,0,0.18)}
              .letter-card:active{transform:scale(0.98)}
              @media(max-width:640px){.letter-card{width:195px;height:285px}.letter-textBox .head{font-size:19px}.letter-card:hover > .letter-img{height:58%}}
            `}</style>
            <div className="letter-card">
              <Mail className="letter-img w-20 h-20 sm:w-24 sm:h-24" />
              <div className="letter-textBox">
                <p className="head">Ábreme</p>
                <span>con amor ♡</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="glass glass-prominent glass-refraction rounded-3xl p-6 sm:p-8 md:p-10 mt-6 w-full max-w-full overflow-hidden"
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
