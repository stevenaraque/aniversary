import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Trophy, RotateCcw, Eye, Sparkles } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs, motionTokens } from '../lib/motion-tokens'

const GRID_SIZE = 4
const TOTAL_TILES = GRID_SIZE * GRID_SIZE

function createSolvedBoard() {
  return Array.from({ length: TOTAL_TILES }, (_, i) => i)
}

function isSolvable(board) {
  let inversions = 0
  const flat = board.filter(t => t !== TOTAL_TILES - 1)
  for (let i = 0; i < flat.length; i++) for (let j = i + 1; j < flat.length; j++) if (flat[i] > flat[j]) inversions++
  const emptyRow = Math.floor(board.indexOf(TOTAL_TILES - 1) / GRID_SIZE)
  const rowFromBottom = GRID_SIZE - emptyRow
  // 4x4 (par) → solvable si (inversiones + filaDesdeAbajo) es impar; impar → inversiones par
  if (GRID_SIZE % 2 === 1) return inversions % 2 === 0
  return (inversions + rowFromBottom) % 2 === 1
}

function shuffleBoard() {
  let board
  do {
    board = [...createSolvedBoard()]
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));[board[i], board[j]] = [board[j], board[i]]
    }
  } while (!isSolvable(board) || board.every((t, i) => t === i))
  return board
}

function getTilePosition(index) {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
}

function BoardSpotlight({ children }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 20 })
  const sy = useSpring(my, { stiffness: 80, damping: 20 })

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  return (
    <div ref={ref} onMouseMove={handleMove} className="relative">
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-40"
        style={{
          background: useTransform([sx, sy], ([x, y]) => `radial-gradient(380px circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 55%)`),
        }}
      />
    </div>
  )
}

export default function Puzzle({ onNext }) {
  const [board, setBoard] = useState(() => shuffleBoard())
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState(false)
  const [started, setStarted] = useState(false)
  const [bestScore, setBestScore] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const isSolved = board.every((tile, idx) => tile === idx)
  useEffect(() => {
    if (isSolved && started && !solved) {
      setSolved(true)
      if (!bestScore || moves < bestScore) setBestScore(moves)
    }
  }, [isSolved, started, solved, moves, bestScore])

  const moveTile = useCallback((clickedIdx) => {
    if (solved) return
    setStarted(true)
    const emptyIdx = board.indexOf(TOTAL_TILES - 1)
    const clickedPos = getTilePosition(clickedIdx)
    const emptyPos = getTilePosition(emptyIdx)
    const isAdjacent = (Math.abs(clickedPos.row - emptyPos.row) === 1 && clickedPos.col === emptyPos.col) || (Math.abs(clickedPos.col - emptyPos.col) === 1 && clickedPos.row === emptyPos.row)
    if (isAdjacent) {
      const n = [...board];[n[clickedIdx], n[emptyIdx]] = [n[emptyIdx], n[clickedIdx]]
      setBoard(n); setMoves(m => m + 1)
    }
  }, [board, solved])

  const handleShuffle = () => { setBoard(shuffleBoard()); setMoves(0); setStarted(false); setSolved(false) }

  const tileSize = Math.min((typeof window !== 'undefined' ? window.innerWidth - 48 : 400) / GRID_SIZE, 92)
  const boardSize = tileSize * GRID_SIZE

  const progress = ((TOTAL_TILES - board.reduce((acc, t, i) => acc + (t === i ? 1 : 0), 0) + 1) / TOTAL_TILES) * 100

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-10 bg-liquid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* ambient */}
      <motion.div className="absolute top-16 left-10" animate={{ opacity: 0.08, x: [0, 12, -6, -12, 0], y: [0, -10, -18, -6, 0] }} transition={{ duration: 7, repeat: Infinity }}><BatIcon className="w-7 h-7 text-crimson" /></motion.div>
      <motion.div className="absolute bottom-20 right-10" animate={{ opacity: 0.06, x: [0, -10, 6, 8, 0], y: [0, -8, -12, -4, 0] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}><FlowerIcon className="w-6 h-6 text-sunflower" /></motion.div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* header */}
        <motion.div initial={{ y: -20, opacity: 0, filter: 'blur(8px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} transition={springs.gentle} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-crimson/60" />
            <span className="text-xs tracking-[0.2em] uppercase text-white/40">Desbloquea el recuerdo</span>
            <Sparkles className="w-3.5 h-3.5 text-sunflower/50" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient-blood">Arma</span> <span className="text-white">nuestro momento</span>
          </h2>
          <p className="text-crimson/40 text-sm mt-2">Desliza las piezas hasta revelar la foto completa</p>
        </motion.div>

        {/* stats row */}
        <div className="flex items-center gap-3 mb-5 w-full justify-center">
          <div className="glass glass-refraction px-5 py-3 rounded-2xl flex items-center gap-3 min-w-[130px] justify-center">
            <div className="w-8 h-8 rounded-xl bg-crimson/10 flex items-center justify-center"><span className="text-crimson text-xs font-bold">{moves}</span></div>
            <div className="text-left leading-none"><p className="text-white text-sm font-semibold">{moves}</p><p className="text-white/30 text-xs">movimientos</p></div>
          </div>
          <div className="glass px-5 py-3 rounded-2xl min-w-[130px] flex items-center gap-3 justify-center">
            <div className="w-8 h-8 rounded-xl bg-sunflower/10 flex items-center justify-center"><Trophy className="w-4 h-4 text-sunflower/70" /></div>
            <div className="text-left leading-none"><p className="text-white text-sm font-semibold">{bestScore ?? '--'}</p><p className="text-white/30 text-xs">mejor</p></div>
          </div>
          <button onClick={() => setShowPreview(!showPreview)} className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${showPreview ? 'glass-prominent text-crimson' : 'glass text-white/60 hover:text-white'}`}>
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* preview thumbnail */}
        <AnimatePresence>
          {showPreview && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={springs.gentle} className="glass rounded-2xl p-2 mb-4">
              <img src="/puzzle-main.jpg" alt="preview" className="w-32 h-32 object-cover rounded-xl" />
              <p className="text-xs text-white/30 text-center mt-1">Vista previa</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* board */}
        <BoardSpotlight>
          <div
            className="glass-deep rounded-[28px] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] relative"
            style={{ width: boardSize + 24, height: boardSize + 24 }}
          >
            {/* inner bevel */}
            <div className="absolute inset-3 rounded-[20px] shadow-[inset_0_2px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] pointer-events-none" />
            {/* progress ring subtle */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-crimson/50 blur-[6px]" style={{ opacity: progress > 10 ? 0.6 : 0 }} />

            <div className="relative rounded-[18px] overflow-hidden bg-black/40 p-[6px]" style={{ width: boardSize + 12, height: boardSize + 12 }}>
              <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#080808]" style={{ width: boardSize, height: boardSize }}>
                <AnimatePresence>
                  {board.map((tile, idx) => {
                    const isEmpty = tile === TOTAL_TILES - 1
                    const tileCol = tile % GRID_SIZE
                    const tileRow = Math.floor(tile / GRID_SIZE)
                    const targetRow = Math.floor(idx / GRID_SIZE)
                    const targetCol = idx % GRID_SIZE
                    return (
                      <motion.div
                        key={tile}
                        className={`absolute select-none ${!isEmpty ? 'cursor-pointer' : ''}`}
                        style={{
                          width: tileSize - 6,
                          height: tileSize - 6,
                          left: targetCol * tileSize + 3,
                          top: targetRow * tileSize + 3,
                        }}
                        layout
                        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
                        onClick={() => moveTile(idx)}
                        whileHover={!isEmpty ? { scale: 1.04, zIndex: 5 } : {}}
                        whileTap={!isEmpty ? { scale: 0.96 } : {}}
                      >
                        {isEmpty ? (
                          <div className="w-full h-full rounded-[14px] glass border border-dashed border-white/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                            <motion.div
                              className="absolute inset-0"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
                            />
                            <BatIcon className="w-6 h-6 text-white/10" />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-[14px] overflow-hidden relative shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/10 group">
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage: 'url(/puzzle-main.jpg)',
                                backgroundSize: `${boardSize}px ${boardSize}px`,
                                backgroundPosition: `-${tileCol * tileSize}px -${tileRow * tileSize}px`,
                              }}
                            />
                            {/* glass specularity */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.4)] pointer-events-none" />
                            {/* inner highlight line */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </BoardSpotlight>

        {/* solved / actions */}
        <div className="mt-6 w-full flex flex-col items-center">
          <AnimatePresence mode="wait">
            {solved ? (
              <motion.div key="solved" initial={{ scale: 0.8, opacity: 0, filter: 'blur(12px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={springs.bouncy} className="text-center w-full">
                <div className="glass glass-prominent glass-refraction rounded-3xl p-6 mb-4">
                  <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.2, ease: 'easeOut' }}>
                    <Trophy className="w-14 h-14 text-sunflower mx-auto" />
                  </motion.div>
                  <p className="text-2xl font-bold text-white mt-3">¡Perfecto!</p>
                  <p className="text-crimson/60 text-sm mt-1">Lo resolviste en <span className="text-sunflower font-bold">{moves}</span> movimientos</p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-white/20 text-xs"><FlowerIcon className="w-3.5 h-3.5" /> Recuerdo desbloqueado <FlowerIcon className="w-3.5 h-3.5" /></div>
                </div>
                <motion.button onClick={onNext} className="w-full glass-prominent glass-refraction py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 cursor-pointer interact-glow" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  Ver nuestros recuerdos <BatIcon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <button onClick={handleShuffle} className="glass px-6 py-3 rounded-2xl text-white/60 text-sm flex items-center gap-2 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                  <RotateCcw className="w-4 h-4" /> Mezclar
                </button>
                <span className="text-white/10 text-xs hidden md:inline">Toca una pieza adyacente al hueco para moverla</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
