import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import CosmosBackground from './components/CosmosBackground'
import Intro from './components/Intro'
import Countdown from './components/Countdown'
import Puzzle from './components/Puzzle'
import MemoryLane from './components/MemoryLane'
import Letter from './components/Letter'
import Collage from './components/Collage'
import Playlist from './components/Playlist'
import memories from './data/memories'
import photos from './data/photos'
import songs from './data/songs'

const SECTIONS = ['intro', 'countdown', 'puzzle', 'memories', 'letter', 'collage', 'playlist']

export default function App() {
  const [section, setSection] = useState('intro')

  const goNext = useCallback(() => {
    setSection(current => {
      const idx = SECTIONS.indexOf(current)
      return SECTIONS[Math.min(idx + 1, SECTIONS.length - 1)]
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen relative">
      <CosmosBackground />
      <div className="relative z-10">
      <AnimatePresence mode="wait">
        {section === 'intro' && <Intro key="intro" onNext={goNext} />}
        {section === 'countdown' && <Countdown key="countdown" onNext={goNext} />}
        {section === 'puzzle' && <Puzzle key="puzzle" onNext={goNext} />}
        {section === 'memories' && <MemoryLane key="memories" memories={memories} onNext={goNext} />}
        {section === 'letter' && <Letter key="letter" onNext={goNext} />}
        {section === 'collage' && <Collage key="collage" photos={photos} onNext={goNext} />}
        {section === 'playlist' && <Playlist key="playlist" songs={songs} />}
      </AnimatePresence>
      </div>
    </div>
  )
}
