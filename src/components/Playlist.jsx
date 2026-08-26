import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'motion/react'
import { Play, Pause, SkipBack, SkipForward, Music, Heart, ListMusic } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

const PLACEHOLDER_SONGS = [
  { title: 'Nuestra canción 1', artist: 'Artista', src: '' },
  { title: 'Nuestra canción 2', artist: 'Artista', src: '' },
  { title: 'Nuestra canción 3', artist: 'Artista', src: '' },
  { title: 'Nuestra canción 4', artist: 'Artista', src: '' },
  { title: 'Nuestra canción 5', artist: 'Artista', src: '' },
]

function Visualizer({ playing }) {
  const controls = useAnimation()

  useEffect(() => {
    if (playing) {
      controls.start({
        scaleY: [1, 1.8, 0.6, 1.4, 1],
        transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
      })
    } else {
      controls.stop()
      controls.set({ scaleY: 1 })
    }
    return () => controls.stop()
  }, [playing, controls])

  return (
    <div className="flex items-end gap-1 h-6">
      {[0, 0.15, 0.3, 0.1].map((delay, i) => (
        <motion.div
          key={i}
          className="w-1 bg-crimson rounded-full origin-bottom"
          animate={controls}
          style={{ height: '100%', animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}

export default function Playlist({ songs = PLACEHOLDER_SONGS }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const hasSongs = songs.some(s => s.src)

  const togglePlay = () => {
    if (!hasSongs) return
    if (audioRef.current) {
      if (playing) audioRef.current.pause()
      else audioRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <motion.div
      className="main-wrapper min-h-[100dvh] relative overflow-hidden flex flex-col items-center justify-center py-6 sm:py-8 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute top-10 left-6 sm:left-10 hidden sm:block"
        animate={{ opacity: 0.07, x: [0, 10, -5, -10, 0], y: [0, -8, -14, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BatIcon className="w-5 h-5 text-crimson" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-6 sm:right-10 hidden sm:block"
        animate={{ opacity: 0.05, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <FlowerIcon className="w-5 h-5 text-sunflower" />
      </motion.div>

      <div className="container-sm relative z-10 flex flex-col items-center justify-center w-full max-w-full px-4 sm:px-6 text-center overflow-hidden">
        <motion.div
          initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={springs.gentle}
        >
          <ListMusic className="w-10 h-10 text-crimson/30 mx-auto mb-4" />
          <h2 className="text-4xl md:text-6xl font-bold mb-3">
            <span className="text-gradient-blood">Nuestra</span>{' '}
            <span className="text-white">música</span>
          </h2>
          <p className="text-crimson/40 flex items-center justify-center gap-2 mb-8 text-sm tracking-wider">
            <BatIcon className="w-4 h-4" />
            Las canciones que nos conectan
            <FlowerIcon className="w-4 h-4" />
          </p>
        </motion.div>

        <motion.div
          className="glass glass-prominent glass-refraction rounded-3xl p-8 mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springs.gentle, delay: 0.2 }}
        >
          <div className="w-48 h-48 mx-auto mb-6 rounded-2xl glass flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-crimson/5 to-transparent" />
            <motion.div
              animate={playing ? { rotate: 360 } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="relative z-10"
            >
              <Music className="w-20 h-20 text-crimson/30" />
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={springs.gentle}
            >
              <h3 className="text-xl font-bold text-white mb-1">{songs[current].title}</h3>
              <p className="text-crimson/40 text-sm">{songs[current].artist}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => setCurrent((c) => (c - 1 + songs.length) % songs.length)}
              className="w-12 h-12 rounded-full glass text-white flex items-center justify-center hover:bg-crimson/20 transition-colors cursor-pointer interact-press"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <motion.button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full glass glass-prominent text-white flex items-center justify-center cursor-pointer interact-glow"
              whileHover={{ scale: motionTokens.scale.pop }}
              whileTap={{ scale: motionTokens.scale.press }}
            >
              {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </motion.button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % songs.length)}
              className="w-12 h-12 rounded-full glass text-white flex items-center justify-center hover:bg-crimson/20 transition-colors cursor-pointer interact-press"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="space-y-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {songs.map((song, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                i === current
                  ? 'glass glass-prominent border-crimson/20'
                  : 'glass hover:bg-white/5 border-transparent'
              }`}
              onClick={() => { setCurrent(i); setPlaying(false) }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                i === current ? 'bg-crimson/15' : 'bg-white/5'
              }`}>
                {i === current ? (
                  <Visualizer playing={playing} />
                ) : (
                  <span className="text-xs text-white/25">{i + 1}</span>
                )}
              </div>
              <div className="text-left flex-1">
                <p className={`text-sm ${i === current ? 'text-white' : 'text-white/50'}`}>
                  {song.title}
                </p>
                <p className="text-xs text-white/25">{song.artist}</p>
              </div>
              {i === current && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springs.bouncy}
                >
                  <Heart className="w-4 h-4 text-crimson" fill="currentColor" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {!hasSongs && (
          <motion.p
            className="text-white/20 text-sm italic mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Agrega tus canciones en{' '}
            <code className="glass px-2 py-1 rounded text-crimson/60 text-xs">src/data/songs.js</code>
          </motion.p>
        )}

        <motion.div
          className="text-center pt-10 border-t border-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FlowerIcon className="w-5 h-5 text-sunflower/60" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 text-crimson" fill="currentColor" />
            </motion.div>
            <BatIcon className="w-5 h-5 text-crimson/40" />
          </div>
          <p className="text-white/25 text-sm italic">
            Te amo con todo mi corazón
          </p>
          <p className="text-crimson/25 text-xs mt-3 flex items-center justify-center gap-2">
            Felices 2 años juntos
            <BatIcon className="w-3 h-3" />
            <FlowerIcon className="w-3 h-3" />
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
