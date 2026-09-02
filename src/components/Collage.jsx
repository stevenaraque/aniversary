import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X, ChevronLeft, ChevronRight, Camera, Music, ArrowLeft } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

const PLACEHOLDER_PHOTOS = [
  'https://picsum.photos/seed/amanecer-cresta/800/800',
  'https://picsum.photos/seed/geometria-concreta/800/800',
  'https://picsum.photos/seed/silueta-dorada/800/800',
  'https://picsum.photos/seed/callejon-luminoso/800/800',
  'https://picsum.photos/seed/bosque-nieblas/800/800',
  'https://picsum.photos/seed/reflejos-verticales/800/800',
  'https://picsum.photos/seed/asfalto-mojado/800/800',
  'https://picsum.photos/seed/acantilado-infinito/800/800',
  'https://picsum.photos/seed/luz-natural/800/800',
  'https://picsum.photos/seed/puente-suspendido/800/800',
  'https://picsum.photos/seed/tela-urbana/800/800',
  'https://picsum.photos/seed/detalles-silvestres/800/800',
  'https://picsum.photos/seed/mirada-intensa/800/800',
]

const TAGS = ['naturaleza', 'urbano', 'retrato', 'eventos', 'nosotros']
const TAG_LABELS = {
  all: 'Todo',
  naturaleza: 'Naturaleza',
  urbano: 'Urbano',
  retrato: 'Retrato',
  eventos: 'Eventos',
  nosotros: 'Nosotros',
}
const FILTER_KEYS = ['all', ...TAGS]

// Distribución de spans — orig estable (13 fotos = sin hueco, 12 = hueco 1 celda al final limpio)
const SPANS = [
  'span-2x2', 'span-1x1', 'span-1x1', 'span-1x2',
  'span-2x1', 'span-1x1', 'span-1x1', 'span-2x2',
  'span-1x1', 'span-1x2', 'span-3x1', 'span-1x1',
  'span-1x1', 'span-2x1', 'span-2x2',
]

const TITLES = [
  'Amanecer en la cresta',
  'Geometría concreta',
  'Silueta dorada',
  'Callejón luminoso',
  'Bosque entre nieblas',
  'Reflejos verticales',
  'Asfalto mojado',
  'Acantilado infinito',
  'Luz natural',
  'Puente suspendido',
  'Tela urbana',
  'Detalles silvestres',
  'Mirada intensa',
  'Horizonte desértico',
]

function buildItems(photos) {
  return photos.map((src, i) => ({
    id: i,
    src,
    title: TITLES[i % TITLES.length],
    tag: TAGS[i % TAGS.length],
    span: SPANS[i % SPANS.length],
  }))
}

export default function Collage({ photos = PLACEHOLDER_PHOTOS, onNext, onPrev }) {
  const items = useMemo(() => buildItems(photos), [photos])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [isPressing, setIsPressing] = useState(false)
  const reduceMotion = useReducedMotion()

  const handleMusicPress = useCallback(() => {
    if (isPressing) return
    setIsPressing(true)
    window.setTimeout(() => {
      setIsPressing(false)
      onNext?.()
    }, 220)
  }, [isPressing, onNext])

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((it) => it.tag === filter)),
    [items, filter],
  )

  const total = visible.length
  const goPrev = useCallback(() => setSelected((s) => (s - 1 + total) % total), [total])
  const goNextPhoto = useCallback(() => setSelected((s) => (s + 1) % total), [total])
  const close = useCallback(() => setSelected(null), [])

  useEffect(() => {
    if (selected === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNextPhoto()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [selected, close, goPrev, goNextPhoto])

  const minH = (cls) => {
    if (cls === 'span-2x2' || cls === 'span-1x2') return 'min-h-[200px] sm:min-h-[260px] lg:min-h-[320px]'
    return 'min-h-[140px] sm:min-h-[170px] lg:min-h-[200px]'
  }

  return (
    <motion.div
      className="main-wrapper min-h-[100dvh] relative flex flex-col items-center py-6 sm:py-10 pb-16 sm:pb-20"
      style={{ overflow: 'visible' }}
      initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.005, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: motionTokens.easing.easeOut }}
    >
      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-gold/25 hover:text-gold-light text-white/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <style>{`
        .collage-grid{display:grid;gap:10px;grid-auto-flow:dense;grid-template-columns:repeat(1,minmax(0,1fr))}
        @media(min-width:640px){.collage-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}
        @media(min-width:768px){.collage-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(min-width:1024px){.collage-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}}
        .collage-item{position:relative;border-radius:14px;overflow:hidden;cursor:pointer;isolation:isolate}
        .collage-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .55s cubic-bezier(.16,1,.3,1),filter .45s ease;will-change:transform}
        .collage-item .overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(5,5,5,.88) 100%);opacity:0;transition:opacity .35s ease;display:flex;flex-direction:column;justify-content:flex-end;padding:14px;pointer-events:none}
        .collage-item .corner{position:absolute;top:10px;right:10px;width:24px;height:24px;border-top:1px solid rgba(212,175,55,.45);border-right:1px solid rgba(212,175,55,.45);opacity:0;transition:opacity .3s ease;z-index:2}
        .collage-item .num{position:absolute;top:11px;left:13px;font-family:'Cormorant Garamond',serif;font-size:11px;color:rgba(255,255,255,.45);z-index:2;letter-spacing:.12em;opacity:0;transition:opacity .3s ease}
        @media (hover: hover) and (pointer: fine) {
          .collage-item:hover img{transform:scale(1.06);filter:brightness(.72)}
          .collage-item:hover .overlay{opacity:1}
          .collage-item:hover .corner{opacity:1}
          .collage-item:hover .num{opacity:1}
        }
        .collage-item .t{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.85);margin-bottom:4px;letter-spacing:.04em}
        .collage-item .tg{font-family:'Sora',sans-serif;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#d4af37;display:inline-flex;align-items:center;gap:6px}
        .collage-item .tg::before{content:'';width:10px;height:1px;background:rgba(212,175,55,.5)}
        @media(max-width:1023px){
          .collage-item .overlay{opacity:1;background:linear-gradient(180deg,transparent 45%,rgba(5,5,5,.82) 100%);padding:10px}
          .collage-item .t{font-size:12px}
          .collage-item .tg{font-size:8px}
          .collage-item .corner{display:none}
          .collage-item .num{opacity:.7;font-size:10px}
        }
        /* Spans base */
        .span-2x2{grid-column:span 2;grid-row:span 2}
        .span-2x1{grid-column:span 2;grid-row:span 1}
        .span-1x2{grid-column:span 1;grid-row:span 2}
        .span-3x1{grid-column:span 3;grid-row:span 1}
        .span-1x1{grid-column:span 1;grid-row:span 1}
        /* Móvil: todo a 1 col con altura rítmica */
        @media(max-width:639px){
          .span-2x2,.span-2x1,.span-1x2,.span-3x1,.span-1x1{grid-column:span 1;grid-row:span 1;min-height:200px!important}
          .collage-item:nth-child(odd){min-height:260px!important}
        }
        /* 2 columnas (640–767px) */
        @media(min-width:640px) and (max-width:767px){
          .span-3x1{grid-column:span 2;grid-row:span 1}
          .span-2x2{grid-column:span 2;grid-row:span 2}
        }
        /* 3 columnas (768–1023px) */
        @media(min-width:768px) and (max-width:1023px){
          .span-2x2{grid-column:span 2;grid-row:span 2}
        }
        @media(prefers-reduced-motion:reduce){
          .collage-item img,.collage-item .overlay,.collage-item .corner,.collage-item .num{transition:none!important}
        }
      `}</style>

      <motion.div
        className="absolute top-10 right-6 sm:right-10 hidden sm:block"
        animate={reduceMotion ? { opacity: 0.06 } : { opacity: 0.06, x: [0, 10, -5, -10, 0], y: [0, -8, -14, -6, 0] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity }}
      >
        <BatIcon className="w-5 h-5 text-crimson" />
      </motion.div>
      <motion.div
        className="absolute bottom-24 left-6 sm:left-10 hidden sm:block"
        animate={reduceMotion ? { opacity: 0.05 } : { opacity: 0.05, rotate: [0, 10, -10, 0] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 8, repeat: Infinity }}
      >
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      <div className="container-lg relative z-10 w-full max-w-full px-4 sm:px-6 lg:px-8 py-2 flex flex-col items-center gap-6 sm:gap-8">
        <motion.div
          className="text-center w-full max-w-3xl mx-auto pt-2 sm:pt-4"
          initial={{ y: -14, opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={springs.gentle}
        >
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-crimson/30 mx-auto mb-3" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'Cormorant Garamond,serif' }}>
            <span className="text-gradient-blood">Nuestro</span> <span className="text-white">collage</span>
          </h2>
          <p className="text-crimson/40 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-widest mt-2">
            <FlowerIcon className="w-3.5 h-3.5" />
            {total} {total === 1 ? 'momento' : 'momentos'} juntos
            <BatIcon className="w-3.5 h-3.5" />
          </p>
        </motion.div>

        <motion.nav
          aria-label="Filtrar collage por categoría"
          className="flex flex-wrap items-center justify-center gap-2"
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springs.gentle, delay: 0.1 }}
        >
          {FILTER_KEYS.map((key) => {
            const active = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium border transition-all duration-300 ${
                  active
                    ? 'bg-gold/15 border-gold/55 text-gold-light shadow-[0_0_18px_rgba(212,175,55,0.18)]'
                    : 'glass border-white/8 text-white/55 hover:border-gold/25 hover:text-white/85'
                }`}
                style={{ fontFamily: 'Cormorant Garamond,serif' }}
                aria-pressed={active}
              >
                {TAG_LABELS[key]}
              </button>
            )
          })}
        </motion.nav>

        <motion.div
          className="collage-grid w-full mb-4"
          key={filter}
          initial={reduceMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.div
                key={`${filter}-${item.id}`}
                layout
                className={`collage-item ${item.span} ${minH(item.span)}`}
                initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                transition={{ ...springs.gentle, delay: Math.min(i * 0.04, 0.4) }}
                onClick={() => setSelected(i)}
                whileHover={{ zIndex: 5 }}
              >
                <img src={item.src} alt={item.title} loading="lazy" decoding="async" />
                <span className="corner" />
                <span className="num">{String(item.id + 1).padStart(2, '0')}</span>
                <div className="overlay">
                  <div className="t">{item.title}</div>
                  <span className="tg">{TAG_LABELS[item.tag] || item.tag}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="text-white/40 text-sm italic text-center py-12" style={{ fontFamily: 'Cormorant Garamond,serif' }}>
            Aún no hay momentos en esta categoría.
          </p>
        )}

        <div className="flex flex-col items-center gap-3 mt-12 mb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.gentle, delay: 0.5 }}
            className="d3warpper"
            onClick={handleMusicPress}
            role="button"
            aria-label="Escuchar nuestra música"
            aria-pressed={isPressing}
          >
            <div className="cover">
              <button className={`button ${isPressing ? 'pressed' : ''}`} aria-label="Reproducir música" tabIndex={-1}>
                <Music className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
          <span className="text-xs tracking-[0.3em] uppercase text-gold-light" style={{ fontFamily: 'Cormorant Garamond,serif' }}>
            Nuestra música
          </span>
        </div>
        {/* Spacer 1cm+ para scroll extra y que botón no quede pegado al borde */}
        <div className="h-10 sm:h-14 w-full shrink-0" aria-hidden="true" />
      </div>

      <AnimatePresence>
        {selected !== null && visible[selected] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Visor de recuerdo"
          >
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass text-white flex items-center justify-center z-10 hover:bg-crimson/25 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNextPhoto() }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass text-white flex items-center justify-center z-10 hover:bg-crimson/25 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); close() }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass text-white flex items-center justify-center z-10 hover:bg-crimson/30 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              key={`lb-${filter}-${selected}`}
              className="relative z-10 max-w-[88vw] sm:max-w-[80vw] max-h-[80vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, opacity: 0, filter: 'blur(8px)' }}
              transition={springs.gentle}
            >
              <img
                src={visible[selected].src}
                alt={visible[selected].title}
                className="max-w-full max-h-[72vh] object-contain rounded-xl border border-gold/20 shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(139,0,0,0.15)]"
              />
              <div className="mt-4 text-center">
                <p className="text-white/95 text-base sm:text-lg" style={{ fontFamily: 'Cormorant Garamond,serif', letterSpacing: '0.04em' }}>
                  {visible[selected].title}
                </p>
                <p className="text-gold-light text-[10px] sm:text-xs tracking-[0.22em] uppercase mt-1" style={{ fontFamily: 'Cormorant Garamond,serif' }}>
                  <FlowerIcon className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
                  {TAG_LABELS[visible[selected].tag] || visible[selected].tag}
                  <span className="text-white/30 ml-2">· {selected + 1} / {visible.length}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}