import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import CosmosBackground from './components/CosmosBackground'
import Intro from './components/Intro'
import Countdown from './components/Countdown'
import Puzzle from './components/Puzzle'
import MemoryLane from './components/MemoryLane'
import Letter from './components/Letter'
import Collage from './components/Collage'
import Playlist from './components/Playlist'
import Final from './components/Final'
import memories from './data/memories'
import photos from './data/photos'
import songs from './data/songs'

const SECTIONS = ['intro', 'countdown', 'puzzle', 'memories', 'letter', 'collage', 'playlist', 'final']
const STORAGE_KEY = 'aniversary:section'

export default function App() {
  const [section, setSection] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved && SECTIONS.includes(saved)) return saved
    } catch {}
    return 'intro'
  })

  const goNext = useCallback(() => {
    setSection(current => {
      const idx = SECTIONS.indexOf(current)
      return SECTIONS[Math.min(idx + 1, SECTIONS.length - 1)]
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goPrev = useCallback(() => {
    setSection(current => {
      const idx = SECTIONS.indexOf(current)
      return SECTIONS[Math.max(idx - 1, 0)]
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Persistir sección en sessionStorage — sobrevive reloads, se borra al cerrar navegador/pestaña
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, section) } catch {}
  }, [section])

  // Reset al terminar: si llega a playlist (final actual) y recarga después de cerrar, sessionStorage ya se borra solo.
  // Si agregas página final "frase final", agrégala a SECTIONS y esta lógica seguirá funcionando.
  // Para reset manual (ej: botón "Volver al inicio" en final), usa sessionStorage.removeItem(STORAGE_KEY)
  const resetProgress = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    setSection('intro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <MotionConfig reducedMotion="never">
    <div className="min-h-screen relative">
      <CosmosBackground />
      <div className="relative z-10">
      <AnimatePresence mode="wait">
        {section === 'intro' && <Intro key="intro" onNext={goNext} />}
        {section === 'countdown' && <Countdown key="countdown" onNext={goNext} onPrev={goPrev} />}
        {section === 'puzzle' && <Puzzle key="puzzle" onNext={goNext} onPrev={goPrev} />}
        {section === 'memories' && <MemoryLane key="memories" memories={memories} onNext={goNext} onPrev={goPrev} />}
        {section === 'letter' && <Letter key="letter" onNext={goNext} onPrev={goPrev} />}
        {section === 'collage' && <Collage key="collage" photos={photos} onNext={goNext} onPrev={goPrev} />}
        {section === 'playlist' && <Playlist key="playlist" songs={songs} onPrev={goPrev} onNext={goNext} onReset={resetProgress} />}
        {section === 'final' && <Final key="final" onPrev={goPrev} onReset={resetProgress} />}
      </AnimatePresence>
      </div>
    </div>
    </MotionConfig>
  )
}
