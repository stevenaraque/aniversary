import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'
import {
  ArrowLeft, Shuffle, SkipBack, SkipForward, Play, Pause, Repeat,
} from 'lucide-react'

const DEFAULT_SONGS = [
  { title: 'Nuestra canción 1', artist: 'Artista', duration: '3:45', seconds: 225, src: '' },
  { title: 'Nuestra canción 2', artist: 'Artista', duration: '4:12', seconds: 252, src: '' },
  { title: 'Nuestra canción 3', artist: 'Artista', duration: '3:28', seconds: 208, src: '' },
  { title: 'Nuestra canción 4', artist: 'Artista', duration: '5:01', seconds: 301, src: '' },
  { title: 'Nuestra canción 5', artist: 'Artista', duration: '3:56', seconds: 236, src: '' },
]

const PLAYER_CSS = `
.goth-player *{margin:0;padding:0;box-sizing:border-box}
.goth-player{--negro:#0a0606;--negro-rojizo:#120808;--rojo-profundo:#5a0a0a;--rojo-sangre:#8b1a1a;--rojo-vivo:#c41e1e;--rojo-brillante:#e63946;--dorado-antiguo:#b8860b;--dorado-medio:#d4a843;--dorado-claro:#f0d68a;--dorado-palido:#faebd7;--texto:#d4c5b0;--texto-claro:#f0e6d6;padding-top:56px;padding-bottom:12px;width:100%;max-width:100vw;overflow-x:hidden !important}
.goth-layout{position:relative;z-index:10;display:flex;flex-wrap:wrap;flex:1;min-height:0;width:100%;max-width:100%;align-items:stretch}

/* PANEL IZQUIERDO: LISTA */
.goth-left{flex:1 1 340px;min-width:0;max-width:100%;display:flex;flex-direction:column;border-right:1px solid rgba(184,134,11,0.1);padding:26px 0 16px;position:relative}
.goth-left::after{content:'';position:absolute;top:10%;bottom:10%;right:0;width:1px;background:linear-gradient(180deg,transparent,rgba(139,26,26,0.3),rgba(184,134,11,0.2),rgba(139,26,26,0.3),transparent)}
.goth-list-header{padding:0 40px 20px;position:relative}
.goth-ornament-top{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.goth-orn-line{width:50px;height:1px;background:linear-gradient(90deg,transparent,var(--dorado-antiguo))}
.goth-orn-line.right{background:linear-gradient(90deg,var(--dorado-antiguo),transparent)}
.goth-orn-diamond{width:7px;height:7px;background:var(--dorado-medio);transform:rotate(45deg);box-shadow:0 0 8px rgba(212,168,67,0.4)}
.goth-list-title{font-family:'Cinzel Decorative',serif;font-size:20px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--dorado-medio);text-shadow:0 0 20px rgba(184,134,11,0.2)}
.goth-list-subtitle{font-family:'Philosopher',serif;font-style:italic;font-size:13px;color:rgba(212,197,176,0.4);margin-top:6px;letter-spacing:2px}
.goth-list-meta{display:flex;align-items:center;gap:20px;margin-top:16px;padding-top:16px;border-top:1px solid rgba(184,134,11,0.08)}
.goth-list-meta span{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(212,197,176,0.3);font-family:'Cinzel',serif}
.goth-list-meta .goth-dot{width:3px;height:3px;background:rgba(184,134,11,0.3);border-radius:50%}
.goth-song-wrapper{flex:1;overflow-y:auto;padding:8px 20px 40px 20px}
.goth-song-wrapper::-webkit-scrollbar{width:4px}
.goth-song-wrapper::-webkit-scrollbar-track{background:transparent}
.goth-song-wrapper::-webkit-scrollbar-thumb{background:rgba(184,134,11,0.15);border-radius:2px}
.goth-song-list{display:flex;flex-direction:column;gap:2px}
.goth-song-item{display:flex;align-items:center;padding:14px 20px;border-radius:4px;cursor:pointer;transition:background-color 0.3s ease, opacity 0.3s ease;position:relative;overflow:hidden;font-family:'Cinzel',serif;background:none;border:none;width:100%;text-align:left;color:var(--texto)}
.goth-song-item::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(139,26,26,0.06),transparent 80%);opacity:0;transition:opacity 0.3s ease}
.goth-song-item:hover::before{opacity:1}
.goth-song-item:hover{background:rgba(139,26,26,0.05)}
.goth-song-item.goth-active{background:rgba(139,26,26,0.08)}
.goth-song-item.goth-active::before{opacity:1;background:linear-gradient(90deg,rgba(139,26,26,0.15),rgba(184,134,11,0.03) 60%,transparent)}
.goth-song-item.goth-active .goth-si-number{color:var(--rojo-vivo)}
.goth-song-item.goth-active .goth-si-title{color:var(--dorado-claro)}
.goth-song-item.goth-active .goth-si-artist{color:rgba(196,30,30,0.6)}
.goth-song-item.goth-active::after{content:'';position:absolute;left:0;top:20%;bottom:20%;width:2px;background:linear-gradient(180deg,transparent,var(--rojo-vivo),var(--dorado-antiguo),var(--rojo-vivo),transparent);border-radius:1px}
.goth-si-number{font-size:12px;color:rgba(212,197,176,0.15);width:32px;text-align:center;flex-shrink:0;transition:color 0.3s ease;display:flex;align-items:center;justify-content:center;height:16px;font-family:'Cinzel',serif}
.goth-si-number .goth-num-text{transition:opacity 0.2s}
.goth-song-item.goth-active .goth-num-text{display:none}
.goth-song-item.goth-active .goth-eq-icon{display:flex}
.goth-eq-icon{display:none;align-items:flex-end;justify-content:center;gap:2px;height:14px}
.goth-eq-icon span{width:2px;background:var(--rojo-vivo);border-radius:1px;animation:gothEqB 0.8s ease-in-out infinite alternate}
.goth-eq-icon span:nth-child(1){height:35%;animation-delay:0s}
.goth-eq-icon span:nth-child(2){height:85%;animation-delay:0.15s}
.goth-eq-icon span:nth-child(3){height:45%;animation-delay:0.3s}
@keyframes gothEqB{0%{height:20%}100%{height:100%}}
.goth-si-info{flex:1;min-width:0}
.goth-si-title{font-size:13px;color:var(--texto);letter-spacing:0.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.3s ease;font-family:'Cinzel',serif}
.goth-si-artist{font-family:'Philosopher',serif;font-style:italic;font-size:11px;color:rgba(212,197,176,0.25);margin-top:3px;transition:color 0.3s ease}
.goth-si-duration{font-size:11px;color:rgba(212,197,176,0.18);letter-spacing:1px;flex-shrink:0;margin-left:16px;font-family:'Cinzel',serif}
.goth-hover-play{width:28px;height:28px;border-radius:50%;background:rgba(184,134,11,0.15);display:flex;align-items:center;justify-content:center;color:var(--dorado-medio);opacity:0;transform:scale(0.8);transition:opacity 0.25s ease, transform 0.25s cubic-bezier(0.23,1,0.32,1);flex-shrink:0;margin-left:12px}
.goth-song-item:hover .goth-hover-play{opacity:1;transform:scale(1)}
.goth-song-item.goth-active .goth-hover-play{opacity:0}

/* PANEL DERECHO: REPRODUCTOR */
.goth-right{flex:0 1 440px;min-width:0;max-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px 28px;position:relative}
.goth-card{position:relative;width:100%;max-width:100%;background:linear-gradient(170deg,rgba(18,8,8,0.9) 0%,rgba(10,6,6,0.95) 100%);border:1px solid rgba(184,134,11,0.12);border-radius:4px;overflow:hidden}
.goth-card::before,.goth-card::after,.goth-corner-tr,.goth-corner-bl{content:'';position:absolute;width:24px;height:24px;border-color:var(--dorado-antiguo);border-style:solid;z-index:5;opacity:0.5}
.goth-card::before{top:8px;left:8px;border-width:1px 0 0 1px}
.goth-card::after{bottom:8px;right:8px;border-width:0 1px 1px 0}
.goth-corner-tr{top:8px;right:8px;border-width:1px 1px 0 0}
.goth-corner-bl{bottom:8px;left:8px;border-width:0 0 1px 1px}
.goth-card-glow{position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:60%;height:2px;background:linear-gradient(90deg,transparent,var(--rojo-vivo),transparent);box-shadow:0 0 15px rgba(196,30,30,0.4),0 0 30px rgba(196,30,30,0.15);opacity:0;transition:opacity 0.8s ease}
.goth-card-glow.goth-active{opacity:1}
.goth-disc-section{padding:18px 32px 14px;display:flex;flex-direction:column;align-items:center}
.goth-disc-wrapper{position:relative;width:168px;height:168px;margin-bottom:16px}
.goth-disc-outer-ring{position:absolute;inset:-10px;border-radius:50%;border:1px solid rgba(184,134,11,0.15);animation:gothSlowSpin 30s linear infinite}
.goth-disc-outer-ring::before{content:'';position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:6px;height:6px;background:var(--dorado-medio);border-radius:50%;box-shadow:0 0 6px rgba(212,168,67,0.5)}
.goth-disc-outer-ring::after{content:'';position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);width:4px;height:4px;background:var(--rojo-sangre);border-radius:50%;box-shadow:0 0 6px rgba(139,26,26,0.5)}
@keyframes gothSlowSpin{to{transform:rotate(360deg)}}
.goth-disc{width:100%;height:100%;border-radius:50%;position:relative;background:radial-gradient(circle at 50% 50%,#1a0a0a 0%,#0d0505 100%);box-shadow:0 0 0 3px rgba(184,134,11,0.12),0 0 0 7px rgba(90,10,10,0.25),0 0 40px rgba(0,0,0,0.8),inset 0 0 30px rgba(0,0,0,0.5);transition:box-shadow 0.8s ease}
.goth-disc.goth-playing{animation:gothDiscSpin 4s linear infinite;box-shadow:0 0 0 3px rgba(184,134,11,0.2),0 0 0 7px rgba(90,10,10,0.35),0 0 60px rgba(139,26,26,0.25),0 0 120px rgba(139,26,26,0.08),inset 0 0 30px rgba(0,0,0,0.5)}
@keyframes gothDiscSpin{to{transform:rotate(360deg)}}
.goth-disc-grooves{position:absolute;inset:14px;border-radius:50%;background:repeating-radial-gradient(circle at center,transparent 0px,transparent 3px,rgba(184,134,11,0.035) 3px,rgba(184,134,11,0.035) 4px)}
.goth-disc-grooves::after{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,rgba(184,134,11,0.05) 30deg,transparent 60deg,rgba(139,26,26,0.04) 120deg,transparent 150deg,rgba(184,134,11,0.035) 210deg,transparent 240deg,rgba(139,26,26,0.05) 300deg,transparent 330deg)}
.goth-disc-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,var(--rojo-profundo) 0%,#1a0808 100%);border:2px solid rgba(184,134,11,0.25);display:flex;align-items:center;justify-content:center;z-index:2}
.goth-disc-center::before{content:'';width:12px;height:12px;border-radius:50%;background:var(--dorado-antiguo);box-shadow:0 0 10px rgba(184,134,11,0.5)}
.goth-disc-symbol{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;color:rgba(184,134,11,0.1);z-index:1;pointer-events:none}
.goth-playing-aura{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(139,26,26,0.12) 0%,transparent 70%);pointer-events:none;opacity:0;transition:opacity 1s ease}
.goth-playing-aura.goth-active{opacity:1;animation:gothAuraPulse 3s ease-in-out infinite}
@keyframes gothAuraPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.5}50%{transform:translate(-50%,-50%) scale(1.15);opacity:1}}
.goth-song-info{text-align:center;width:100%}
.goth-song-title{font-family:'Cinzel Decorative',serif;font-size:18px;font-weight:700;color:var(--dorado-claro);letter-spacing:1px;line-height:1.3;min-height:44px;display:flex;align-items:center;justify-content:center;text-shadow:0 0 20px rgba(240,214,138,0.12);text-align:center}
.goth-song-artist{font-family:'Philosopher',serif;font-style:italic;font-size:13px;color:rgba(196,30,30,0.6);margin-top:4px;letter-spacing:3px;text-transform:uppercase;text-align:center}
.goth-wave{margin-top:16px;opacity:0;transition:opacity 0.6s ease}
.goth-wave.goth-active{opacity:1}
.goth-progress{margin-top:10px;width:100%}
.goth-progress-bar{position:relative;width:100%;height:3px;background:rgba(184,134,11,0.08);border-radius:2px;cursor:pointer;transition:height 0.2s ease}
.goth-progress-bar:hover{height:5px}
.goth-progress-fill{height:100%;width:0%;background:linear-gradient(90deg,var(--rojo-sangre),var(--rojo-vivo),var(--dorado-antiguo));border-radius:2px;position:relative;transition:width 0.1s linear}
.goth-progress-fill::after{content:'';position:absolute;right:-5px;top:50%;transform:translateY(-50%) scale(0.7);width:12px;height:12px;background:var(--dorado-medio);border-radius:50%;box-shadow:0 0 10px rgba(212,168,67,0.5);opacity:0;transition:transform 0.2s cubic-bezier(0.23,1,0.32,1), opacity 0.2s ease}
.goth-progress-bar:hover .goth-progress-fill::after{transform:translateY(-50%) scale(1);opacity:1}
.goth-progress-times{display:flex;justify-content:space-between;margin-top:8px;font-size:10px;letter-spacing:2px;color:rgba(212,197,176,0.3);font-family:'Cinzel',serif}
.goth-controls{display:flex;align-items:center;justify-content:center;gap:20px;padding:10px 32px 22px}
.goth-ctrl{background:none;border:none;color:rgba(212,197,176,0.35);cursor:pointer;transition:color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;padding:8px;display:flex;align-items:center;justify-content:center}
.goth-ctrl:hover{color:var(--dorado-medio);text-shadow:0 0 10px rgba(212,168,67,0.3)}
.goth-ctrl.goth-active{color:var(--rojo-vivo)}
.goth-play-btn{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,rgba(90,10,10,0.6),rgba(139,26,26,0.25));border:1px solid rgba(184,134,11,0.25);color:var(--dorado-claro);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease;position:relative;overflow:hidden}
.goth-play-btn::before{content:'';position:absolute;inset:-2px;border-radius:50%;background:conic-gradient(from 0deg,transparent,var(--dorado-antiguo),transparent,var(--rojo-sangre),transparent);opacity:0;transition:opacity 0.4s ease;z-index:-1;animation:gothBorderRot 3s linear infinite}
@keyframes gothBorderRot{to{transform:rotate(360deg)}}
.goth-play-btn:hover::before,.goth-play-btn.goth-playing::before{opacity:0.5}
.goth-play-btn:hover{border-color:rgba(184,134,11,0.45);box-shadow:0 0 30px rgba(139,26,26,0.25),0 0 60px rgba(139,26,26,0.08);transform:scale(1.06)}
.goth-play-btn:active{transform:scale(0.96)}
.goth-play-btn.goth-playing::before{animation:gothBorderRot 3s linear infinite}

.goth-footer{display:flex;align-items:center;justify-content:center;gap:14px;margin:10px auto 0;flex-wrap:wrap;flex-shrink:0}

.goth-particles-canvas{position:fixed;inset:0;z-index:1;pointer-events:none}
.goth-vignette{position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 50% 50%,transparent 20%,rgba(5,2,2,0.75) 100%)}

.goth-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(18,8,8,0.95);border:1px solid rgba(184,134,11,0.25);color:var(--dorado-medio);font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;padding:10px 24px;border-radius:3px;opacity:0;pointer-events:none;transition:opacity 0.4s ease, transform 0.4s cubic-bezier(0.23,1,0.32,1);z-index:100;box-shadow:0 4px 20px rgba(0,0,0,0.5)}
.goth-toast.goth-show{opacity:1;transform:translateX(-50%) translateY(0)}

@media (max-height:720px) and (min-width:901px){
  .goth-right{padding:12px 26px}
  .goth-disc-section{padding:12px 28px 8px}
  .goth-disc-wrapper{width:140px;height:140px;margin-bottom:10px}
  .goth-playing-aura{width:165px;height:165px}
  .goth-song-title{font-size:16px;min-height:34px}
  .goth-controls{padding:6px 28px 14px}
  .goth-play-btn{width:52px;height:52px}
  .goth-list-title{font-size:17px}
  .goth-list-header{padding:0 36px 14px}
}

@media (max-width:900px){
  .goth-player{height:auto !important;min-height:100dvh !important;overflow-y:auto;overflow-x:hidden;padding-top:56px;padding-bottom:16px}
  .goth-left{border-right:none;border-bottom:1px solid rgba(184,134,11,0.1);padding:16px 0 10px;max-height:30vh}
  .goth-left::after{display:none}
  .goth-list-header{padding:0 24px 12px}
  .goth-list-title{font-size:16px;letter-spacing:3px}
  .goth-list-subtitle{font-size:12px;margin-top:4px}
  .goth-list-meta{margin-top:10px;padding-top:10px}
  .goth-ornament-top{margin-bottom:8px;gap:10px}
  .goth-song-wrapper{padding:2px 10px 16px}
  .goth-song-item{padding:11px 14px}
  .goth-si-title{font-size:13px}
  .goth-si-artist{font-size:11px}
  .goth-right{width:100%;padding:12px 16px 8px}
  .goth-disc-section{padding:16px 20px 10px}
  .goth-disc-wrapper{width:min(30vh,34vw,128px);height:min(30vh,34vw,128px);margin-bottom:12px}
  .goth-playing-aura{width:155px;height:155px}
  .goth-song-title{font-size:15px;min-height:26px}
  .goth-song-artist{font-size:11px;margin-top:2px;letter-spacing:2px}
  .goth-wave{margin-top:8px}
  .goth-progress{width:100%;padding:0 20px;margin-top:8px}
  .goth-controls{gap:16px;padding:6px 20px 16px}
  .goth-play-btn{width:50px;height:50px}
  .goth-ctrl{padding:6px}
  .goth-corner-tr,.goth-corner-bl,.goth-card::before,.goth-card::after{width:18px;height:18px}
  .goth-footer{margin-top:8px}
}
@media (max-width:480px){
  .goth-disc-wrapper{width:min(26vh,32vw,116px);height:min(26vh,32vw,116px)}
  .goth-playing-aura{width:135px;height:135px}
  .goth-disc-center{width:44px;height:44px}
  .goth-disc-center::before{width:10px;height:10px}
  .goth-disc-grooves{inset:11px}
  .goth-list-title{font-size:15px;letter-spacing:2px}
  .goth-song-item{padding:9px 12px}
  .goth-progress{width:100%;padding:0 16px}
}
`

function EqIcon() {
  return (
    <span className="goth-eq-icon">
      <span /><span /><span />
    </span>
  )
}

const WAVE_BARS = 28

export default function Playlist({ songs = DEFAULT_SONGS, onPrev, onNext, onReset }) {
  const list = Array.isArray(songs) && songs.length ? songs : DEFAULT_SONGS
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shuffleOn, setShuffleOn] = useState(false)
  const [repeatOn, setRepeatOn] = useState(false)
  const [toast, setToast] = useState('')
  const [wave, setWave] = useState(Array(WAVE_BARS).fill(4))

  const audioRef = useRef(null)
  const progressRef = useRef(progress)
  const currentRef = useRef(current)
  const playingRef = useRef(false)
  const shuffleRef = useRef(shuffleOn)
  const repeatRef = useRef(repeatOn)
  const toastTimeout = useRef(null)

  progressRef.current = progress
  currentRef.current = current
  playingRef.current = isPlaying
  shuffleRef.current = shuffleOn
  repeatRef.current = repeatOn

  const song = list[current]

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const totalDuration = useCallback(() => {
    return formatTime(list.reduce((a, s) => a + (s.seconds || 0), 0))
  }, [list])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(''), 2000)
  }, [])

  const playAudio = useCallback((play) => {
    const a = audioRef.current
    if (!a || !song.src) return
    if (play) a.play().catch(() => {})
    else a.pause()
  }, [song])

  useEffect(() => {
    if (playingRef.current) {
      const a = audioRef.current
      if (a && song.src) return
    }
    const id = setInterval(() => {
      const s = list[currentRef.current]
      if (playingRef.current && (!audioRef.current || !audioRef.current.src || !s.src)) {
        setProgress(p => {
          const next = p + 0.1
          if (next >= s.seconds) {
            if (repeatRef.current) {
              return 0
            }
            goNext()
            return 0
          }
          return next
        })
        setWave(Array.from({ length: WAVE_BARS }, () => 3 + Math.random() * 18))
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song])

  // Animación del visualizador mientras suena (aplica también a canciones con audio real)
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setWave(Array.from({ length: WAVE_BARS }, () => 3 + Math.random() * 18))
    }, 110)
    return () => clearInterval(id)
  }, [isPlaying])

  const goNext = useCallback(() => {
    let idx
    if (shuffleRef.current) {
      do { idx = Math.floor(Math.random() * list.length) } while (idx === currentRef.current && list.length > 1)
    } else {
      idx = (currentRef.current + 1) % list.length
    }
    setCurrent(idx)
    setProgress(0)
    const a = audioRef.current
    if (a && list[idx].src) { a.src = list[idx].src; if (playingRef.current) a.play().catch(() => {}) }
  }, [list])

  const goPrev = useCallback(() => {
    let idx
    if (progressRef.current > 3) {
      idx = currentRef.current
      setProgress(0)
    } else {
      idx = (currentRef.current - 1 + list.length) % list.length
      setProgress(0)
    }
    setCurrent(idx)
    const a = audioRef.current
    if (a && list[idx].src) { a.src = list[idx].src; if (playingRef.current) a.play().catch(() => {}) }
  }, [list])

  const selectSong = useCallback((idx) => {
    setCurrent(idx)
    if (!playingRef.current) setIsPlaying(true)
    setProgress(0)
    const a = audioRef.current
    if (a && list[idx].src) { a.src = list[idx].src; a.play().catch(() => {}) }
  }, [list])

  const togglePlay = useCallback(() => {
    setIsPlaying(p => {
      const next = !p
      if (next) {
        playAudio(true)
      } else {
        playAudio(false)
      }
      return next
    })
  }, [playAudio])

  const seek = useCallback((clientX) => {
    const el = document.querySelector('.goth-progress-bar')
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setProgress(pct * (list[currentRef.current].seconds || 0))
  }, [list])

  const pct = list[current]?.seconds ? (progress / list[current].seconds) * 100 : 0

  // Partículas doradas (igual que el diseño) solo en desktop para rendimiento
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return
    const ctx = canvas.getContext('2d')
    let particles = []
    const COUNT = 50
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    class Particle {
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 1.6 + 0.3
        this.speedY = -(Math.random() * 0.25 + 0.04)
        this.speedX = (Math.random() - 0.5) * 0.12
        this.opacity = Math.random() * 0.45 + 0.08
        this.fadeSpeed = Math.random() * 0.0015 + 0.0008
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = Math.random() * 0.02 + 0.005
        this.isGold = Math.random() > 0.3
      }
      constructor() { this.reset() }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed
        this.opacity -= this.fadeSpeed
        if (this.opacity <= 0 || this.y < -10) this.reset()
      }
      draw() {
        const o = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse))
        if (o <= 0.01) return
        ctx.fillStyle = this.isGold ? `rgba(212,168,67,${o})` : `rgba(196,30,30,${o * 0.5})`
        ctx.beginPath(); ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2); ctx.fill()
        if (this.size > 1) {
          ctx.fillStyle = `rgba(240,214,138,${o * 0.25})`
          ctx.beginPath(); ctx.arc(this.x, this.y, Math.max(0.1, this.size * 2.5), 0, Math.PI * 2); ctx.fill()
        }
      }
    }
    for (let i = 0; i < COUNT; i++) particles.push(new Particle())
    let raf
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // Atajos de teclado globales
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); togglePlay() }
      if (e.code === 'ArrowRight' && !e.target.closest('.goth-progress-bar')) goNext()
      if (e.code === 'ArrowLeft' && !e.target.closest('.goth-progress-bar')) goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, goNext, goPrev])

  const active = (flag) => (flag ? ' goth-active' : '')

  return (
    <motion.div
      className="goth-player main-wrapper h-[100dvh] min-h-[100dvh] relative overflow-hidden flex flex-col items-stretch bg-transparent"
      initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.005, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: motionTokens.easing.easeOut }}
    >
      <style>{PLAYER_CSS}</style>

      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-gold/25 hover:text-gold-light text-white/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="goth-vignette" />
      <canvas ref={canvasRef} className="goth-particles-canvas" aria-hidden="true" />

      <main className="goth-layout" style={{ position: 'relative', zIndex: 10 }}>
        {/* PANEL IZQUIERDO: LISTA */}
        <section className="goth-left" aria-label="Lista de reproducción">
          <div className="goth-list-header">
            <div className="goth-ornament-top">
              <div className="goth-orn-line" />
              <div className="goth-orn-diamond" />
              <div className="goth-orn-line right" />
            </div>
            <div className="goth-list-title">Nuestra Música</div>
            <p className="goth-list-subtitle">Las canciones que nos conectan</p>
            <div className="goth-list-meta">
              <span>{list.length} canciones</span>
              <div className="goth-dot" />
              <span>{totalDuration()}</span>
              <div className="goth-dot" />
              <span>Repertorio</span>
            </div>
          </div>
          <div className="goth-song-wrapper">
            <div className="goth-song-list" role="list">
              {list.map((s, i) => (
                <button
                  key={i}
                  className={`goth-song-item${active(i === current)}`}
                  role="listitem"
                  onClick={() => selectSong(i)}
                >
                  <div className="goth-si-number">
                    <span className="goth-num-text">{String(i + 1).padStart(2, '0')}</span>
                    <EqIcon />
                  </div>
                  <div className="goth-si-info">
                    <div className="goth-si-title">{s.title}</div>
                    <div className="goth-si-artist">{s.artist}</div>
                  </div>
                  <div className="goth-si-duration">{s.duration}</div>
                  <div className="goth-hover-play"><Play size={10} /></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PANEL DERECHO: REPRODUCTOR */}
        <section className="goth-right" aria-label="Reproductor">
          <div className="goth-card">
            <div className="goth-corner-tr" />
            <div className="goth-corner-bl" />
            <div className={`goth-card-glow${active(isPlaying)}`} />

            <div className="goth-disc-section">
              <div className="goth-disc-wrapper">
                <div className="goth-disc-outer-ring" />
                <div className={`goth-playing-aura${active(isPlaying)}`} />
                <div className={`goth-disc${isPlaying ? ' goth-playing' : ''}`}>
                  <div className="goth-disc-grooves" />
                  <div className="goth-disc-symbol">✡</div>
                  <div className="goth-disc-center" />
                </div>
              </div>

              <div className="goth-song-info">
                <div className="goth-song-title">{song.title}</div>
                <div className="goth-song-artist">{song.artist}</div>
              </div>

              <div className={`goth-wave${active(isPlaying)}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 22 }}>
                  {wave.map((h, i) => (
                    <div key={i} style={{ width: 2, background: 'linear-gradient(to top,var(--rojo-sangre),var(--dorado-antiguo))', borderRadius: 1, height: `${h}px`, transition: 'height 0.12s ease' }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="goth-progress">
              <div className="goth-progress-bar" role="slider" aria-label="Progreso" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(pct)} tabIndex={0}
                onClick={(e) => seek(e.clientX)}
                onKeyDown={(e) => {
                  const sec = list[current].seconds || 0
                  if (e.key === 'ArrowRight') setProgress(p => Math.min(p + 5, sec))
                  if (e.key === 'ArrowLeft') setProgress(p => Math.max(p - 5, 0))
                }}
              >
                <div className="goth-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="goth-progress-times">
                <span>{formatTime(progress)}</span>
                <span>{list[current].duration}</span>
              </div>
            </div>

            <nav className="goth-controls" aria-label="Controles de reproducción">
              <button className={`goth-ctrl${active(shuffleOn)}`} onClick={() => { setShuffleOn(s => !s); showToast(shuffleOn ? 'Aleatorio abandonado' : 'Aleatorio activado') }} aria-label="Aleatorio" title="Aleatorio">
                <Shuffle size={16} />
              </button>
              <button className="goth-ctrl" onClick={goPrev} aria-label="Anterior" title="Anterior">
                <SkipBack size={16} />
              </button>
              <button className={`goth-play-btn${isPlaying ? ' goth-playing' : ''}`} onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'} title={isPlaying ? 'Pausar' : 'Reproducir'}>
                {isPlaying ? <Pause size={19} /> : <Play size={19} style={{ marginLeft: 2 }} />}
              </button>
              <button className="goth-ctrl" onClick={goNext} aria-label="Siguiente" title="Siguiente">
                <SkipForward size={16} />
              </button>
              <button className={`goth-ctrl${active(repeatOn)}`} onClick={() => { setRepeatOn(r => !r); showToast(repeatOn ? 'Repetir desactivado' : 'Repetir activado') }} aria-label="Repetir" title="Repetir">
                <Repeat size={16} />
              </button>
            </nav>
          </div>
        </section>
      </main>

      {/* Audio real cuando hay src */}
      {song.src && (
        <audio
          ref={audioRef}
          src={song.src}
          onTimeUpdate={(e) => { setProgress(e.currentTarget.currentTime); if (!isPlaying) setIsPlaying(true) }}
          onEnded={() => { if (repeatOn) { setProgress(0); audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}) } else goNext() }}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <div className={`goth-toast${active(!!toast)}`}>{toast}</div>

      <div className="goth-footer" style={{ position: 'relative', zIndex: 10 }}>
        {onNext && (
          <button
            onClick={onNext}
            className="px-6 py-2 font-bold text-white uppercase tracking-wider text-xs rounded-xl bg-crimson border-b-[4px] border-[#7f1d1d] active:border-b-0 active:translate-y-[4px] transition-all duration-100 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)]"
            style={{ fontFamily: 'Cormorant Garamond,serif' }}
          >
            Ver frase final
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="glass px-5 py-2 rounded-full text-white/30 text-[11px] tracking-[0.18em] uppercase hover:text-white/60 hover:border-gold/20 border border-transparent transition-colors"
            style={{ fontFamily: 'Cormorant Garamond,serif' }}
          >
            Volver al inicio
          </button>
        )}
      </div>
    </motion.div>
  )
}
