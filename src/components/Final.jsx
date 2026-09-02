import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Heart } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

// Editable data — cambia aquí tus nombres/textos
const HERO = {
  pre: 'Una historia escrita en luz',
  names: ['Alejandro', 'Naydu'],
  quote: 'Desde el primer instante, el universo conspiró para que nuestros caminos se encontraran bajo el mismo cielo.',
}
const DECLARATION = `No fue un rayo, fue una constelación entera encendida de golpe. Como si cada estrella que alguna vez existió decidiera brillar al mismo tiempo solo para recordarnos que lo más extraordinario de la vida no se busca, se reconoce.`

const TIMELINE = [
  { date: 'Primavera, 2019', title: 'El primer encuentro', text: 'Una fiesta cualquiera, una conversación que no debería haber durado más de cinco minutos pero se extendió hasta el amanecer. El mundo se redujo a dos sillas y la distancia justa entre ellas.' },
  { date: 'Verano, 2019', title: 'La primera carta', text: 'Tres páginas escritas a mano en un papel que casi no merecía tantas palabras. Pero las palabras no eligieron el papel, eligieron a quien las iba a leer.' },
  { date: 'Invierno, 2020', title: 'La primera tormenta juntos', text: 'El mundo se cerraba afuera pero adentro se abría algo que no teníamos nombre. Aprendimos que la verdadera cercanía no se mide en distancia sino en silencios compartidos.' },
  { date: 'Otoño, 2021', title: 'El viaje que lo cambió todo', text: 'Mil kilómetros en carretera, un mapa que no necesitábamos, y la certeza de que el destino no era un lugar sino la persona que tenías al lado.' },
  { date: 'Primavera, 2024', title: 'La promesa', text: 'Bajo un cielo que alguien más allá habría llamado coincidencia, dijimos las palabras que siempre supimos ciertas. No fue un acuerdo, fue un reconocimiento.' },
]

const GALLERY = [
  { src: 'https://picsum.photos/seed/love-golden-1/800/800.jpg', alt: 'Momento juntos' },
  { src: 'https://picsum.photos/seed/love-dusk-2/400/400.jpg', alt: 'Atardecer' },
  { src: 'https://picsum.photos/seed/love-warm-3/400/400.jpg', alt: 'Abrazo' },
  { src: 'https://picsum.photos/seed/love-night-4/400/400.jpg', alt: 'Noche juntos' },
  { src: 'https://picsum.photos/seed/love-road-5/400/400.jpg', alt: 'Camino' },
]

export default function Final({ onPrev, onReset }) {
  const [lightbox, setLightbox] = useState(null)

  return (
    <motion.div
      className="main-wrapper relative flex flex-col items-center bg-transparent"
      style={{ minHeight: '100dvh', overflow: 'visible' }}
      initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.005, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: motionTokens.easing.easeOut }}
    >
      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-crimson/30 hover:text-crimson text-white/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&display=swap');
        .final-page { position: relative; z-index: 1; width: 100%; }
        .final-hero { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; position: relative; }
        .final-pre { font-family: 'Sora', sans-serif; font-weight: 200; font-size: clamp(0.65rem, 1.2vw, 0.8rem); letter-spacing: 0.5em; text-transform: uppercase; color: rgba(255,234,167,0.32); margin-bottom: 32px; }
        .final-names { display: flex; align-items: center; gap: clamp(16px, 3vw, 40px); margin-bottom: 40px; flex-wrap: wrap; justify-content: center; }
        .final-name { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: clamp(2.8rem, 8vw, 6rem); letter-spacing: 0.04em; line-height: 1.1; background: linear-gradient(135deg, #dc143c 0%, #8b0000 55%, #4a0e0e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 24px rgba(220,20,60,0.35)) drop-shadow(0 0 60px rgba(139,0,0,0.18)); }
        .final-amp { font-family: 'Marcellus', serif; font-size: clamp(1.4rem, 3vw, 2.2rem); color: #d4af37; letter-spacing: 0.1em; opacity: 0.55; flex-shrink: 0; text-shadow: 0 0 12px rgba(212,175,55,0.25); }
        .final-line { width: 72px; height: 1px; background: linear-gradient(90deg, transparent, #dc143c 35%, #d4af37 65%, transparent); margin-bottom: 32px; }
        .final-quote { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: clamp(1rem, 2vw, 1.3rem); color: rgba(232,220,200,0.72); max-width: 520px; line-height: 1.8; letter-spacing: 0.02em; text-shadow: 0 1px 12px rgba(0,0,0,0.6); }
        .final-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; animation: finalFloat 3s ease-in-out infinite; }
        .final-scroll span { font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,234,167,0.28); }
        .final-scroll-line { width: 1px; height: 30px; background: linear-gradient(to bottom, #8b0000, transparent); }
        @keyframes finalFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        .final-section { padding: 100px 24px; max-width: 800px; margin: 0 auto; width: 100%; }
        .final-label { font-family: 'Sora', sans-serif; font-weight: 200; font-size: 0.65rem; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(220,20,60,0.45); text-align: center; margin-bottom: 48px; }
        .final-divider { width: 1px; height: 80px; background: linear-gradient(to bottom, transparent, #8b0000 20%, #dc143c 50%, #b8941f 80%, transparent); margin: 0 auto; }
        .final-declaration { text-align: center; }
        .final-declaration blockquote { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: clamp(1.15rem, 2.5vw, 1.6rem); line-height: 2; color: rgba(232,220,200,0.78); max-width: 620px; margin: 0 auto; position: relative; text-shadow: 0 1px 10px rgba(0,0,0,0.5); }
        .final-declaration blockquote::before { content: ''; display: block; width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #8b0000, #d4af37, transparent); margin: 0 auto 40px; }
        .final-declaration blockquote::after { content: ''; display: block; width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, #8b0000, transparent); margin: 40px auto 0; }
        .final-timeline { position: relative; padding-left: 40px; }
        .final-timeline::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, #8b0000 8%, #dc143c 45%, #b8941f 88%, transparent); }
        .final-tl-item { position: relative; margin-bottom: 60px; }
        .final-tl-item:last-child { margin-bottom: 0; }
        .final-tl-dot { position: absolute; left: -40px; top: 6px; width: 15px; height: 15px; border: 1px solid rgba(220,20,60,0.45); border-radius: 50%; background: #050505; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(220,20,60,0.18), inset 0 1px 0 rgba(255,255,255,0.04); }
        .final-tl-dot::after { content: ''; width: 5px; height: 5px; background: #d4af37; border-radius: 50%; box-shadow: 0 0 6px rgba(212,175,55,0.45); }
        .final-tl-date { font-family: 'Marcellus', serif; font-size: 0.85rem; color: #dc143c; letter-spacing: 0.15em; margin-bottom: 8px; }
        .final-tl-title { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: clamp(1.2rem, 2.5vw, 1.6rem); color: #f9e076; margin-bottom: 10px; letter-spacing: 0.02em; text-shadow: 0 1px 8px rgba(0,0,0,0.5); }
        .final-tl-text { font-weight: 200; font-size: 0.9rem; color: rgba(232,220,200,0.68); line-height: 1.8; max-width: 550px; }
        .final-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 700px; margin: 0 auto; }
        .final-gallery-item { aspect-ratio: 1; overflow: hidden; border-radius: 2px; position: relative; cursor: pointer; border: 1px solid rgba(212,175,55,0.06); }
        .final-gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; }
        .final-gallery-item img { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.12) brightness(0.88) contrast(1.04) saturate(0.9); transition: filter 0.6s, transform 0.8s cubic-bezier(0.22,1,0.36,1); }
        .final-gallery-item::after { content: ''; position: absolute; inset: 0; border: 1px solid rgba(220,20,60,0.08); border-radius: 2px; pointer-events: none; transition: border-color 0.4s, box-shadow 0.4s; }
        @media (hover: hover) and (pointer: fine) {
          .final-gallery-item:hover img { filter: sepia(0) brightness(0.98) contrast(1.08); transform: scale(1.04); }
          .final-gallery-item:hover::after { border-color: rgba(220,20,60,0.22); box-shadow: inset 0 0 12px rgba(220,20,60,0.06); }
        }
        .final-vow { text-align: center; padding: 120px 24px; max-width: 800px; margin: 0 auto; width: 100%; }
        .final-vow-text { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: clamp(1.3rem, 3vw, 2rem); line-height: 2; color: #e8dcc8; max-width: 600px; margin: 0 auto; letter-spacing: 0.01em; text-shadow: 0 0 24px rgba(220,20,60,0.18), 0 1px 10px rgba(0,0,0,0.6); }
        .final-vow-sig { margin-top: 60px; font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: 1.1rem; color: #dc143c; letter-spacing: 0.08em; text-shadow: 0 0 12px rgba(220,20,60,0.25); }
        .final-infinity { display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #8b0000; font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; opacity: 0.35; letter-spacing: 0.3em; user-select: none; text-shadow: 0 0 16px rgba(220,20,60,0.25); }
        .final-footer { text-align: center; padding: 60px 24px 80px; position: relative; max-width: 800px; margin: 0 auto; width: 100%; }
        .final-footer::before { content: ''; display: block; width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #8b0000, #d4af37, transparent); margin: 0 auto 40px; }
        .final-footer-text { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: 0.95rem; color: rgba(232,220,200,0.32); letter-spacing: 0.05em; }
        @media (max-width: 600px) {
          .final-gallery { grid-template-columns: repeat(2, 1fr); }
          .final-gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 1; aspect-ratio: 16/10; }
          .final-timeline { padding-left: 32px; }
          .final-tl-dot { left: -32px; }
          .final-section { padding: 70px 20px; }
          .final-vow { padding: 80px 20px; }
        }
      `}</style>

      <div className="final-page">
        <header className="final-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={springs.gentle} className="final-pre">{HERO.pre}</motion.div>
          <div className="final-names">
            <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.15 }} className="final-name">{HERO.names[0]}</motion.span>
            <motion.span initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 0.6, scale: 1 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.3 }} className="final-amp">&</motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.45 }} className="final-name">{HERO.names[1]}</motion.span>
          </div>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }} className="final-line" />
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.75 }} className="final-quote">{HERO.quote}</motion.p>
          <div className="final-scroll">
            <span>Descubre</span>
            <div className="final-scroll-line" />
          </div>
        </header>

        <div className="final-divider" />

        <section className="final-section final-declaration">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={springs.gentle} className="final-label">Nuestro amor</motion.div>
          <motion.blockquote initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.15 }}>{DECLARATION}</motion.blockquote>
        </section>

        <div className="final-divider" />

        <section className="final-section">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={springs.gentle} className="final-label">Momentos que nos definieron</motion.div>
          <div className="final-timeline">
            {TIMELINE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: i * 0.12 }} className="final-tl-item">
                <div className="final-tl-dot" />
                <div className="final-tl-date">{item.date}</div>
                <div className="final-tl-title">{item.title}</div>
                <p className="final-tl-text">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="final-divider" />

        <section className="final-section">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={springs.gentle} className="final-label">Fragmentos de nosotros</motion.div>
          <div className="final-gallery">
            {GALLERY.map((g, i) => (
              <motion.div key={i} className="final-gallery-item" onClick={() => setLightbox(g.src)} initial={{ opacity: 0, y: 12, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ ...springs.gentle, delay: i * 0.06 }}>
                <img src={g.src} alt={g.alt} loading="lazy" />
              </motion.div>
            ))}
          </div>
        </section>

        <div className="final-divider" />

        <section className="final-vow">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 0.25, scale: 1 }} viewport={{ once: true }} transition={springs.gentle} className="final-infinity">∞</motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.15 }} className="final-vow-text">
            No te prometo días perfectos.<br />
            Te prometo que cada día imperfecto<br />
            lo elegiré de nuevo contigo.<br />
            No como quien acepta un destino,<br />
            sino como quien reconoce su hogar.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...springs.gentle, delay: 0.3 }} className="final-vow-sig">Eternamente, los dos</motion.div>
        </section>

        <footer className="final-footer">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="final-footer-text">Mientras exista luz, existirá esto.</motion.p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <FlowerIcon className="w-4 h-4 text-sunflower/40" />
            <Heart className="w-5 h-5 text-crimson" fill="currentColor" />
            <BatIcon className="w-4 h-4 text-crimson/40" />
          </div>
          {onReset && (
            <motion.button initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} onClick={onReset} className="mt-10 glass px-6 py-3 rounded-full text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-crimson/30 border border-white/10 transition-colors" style={{ fontFamily: 'Cormorant Garamond,serif' }}>
              Volver al inicio ♡
            </motion.button>
          )}
        </footer>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} role="dialog" aria-label="Imagen ampliada">
            <span className="absolute top-7 right-9 text-white/40 text-xs tracking-[0.2em] uppercase cursor-pointer hover:text-crimson transition-colors" onClick={() => setLightbox(null)}>Cerrar</span>
            <motion.img src={lightbox} alt="Imagen ampliada" className="max-w-[85vw] max-h-[85vh] object-contain rounded-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={springs.gentle} onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
