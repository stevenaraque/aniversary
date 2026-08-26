import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs } from '../lib/motion-tokens'

const GRID_SIZE = 4
const TOTAL_TILES = GRID_SIZE * GRID_SIZE

function createSolvedBoard() { return Array.from({ length: TOTAL_TILES }, (_, i) => i) }
function isSolvable(board) {
  let inv = 0
  const flat = board.filter(t => t !== TOTAL_TILES - 1)
  for (let i = 0; i < flat.length; i++) for (let j = i + 1; j < flat.length; j++) if (flat[i] > flat[j]) inv++
  const emptyRow = Math.floor(board.indexOf(TOTAL_TILES - 1) / GRID_SIZE)
  const rowFromBottom = GRID_SIZE - emptyRow
  if (GRID_SIZE % 2 === 1) return inv % 2 === 0
  return (inv + rowFromBottom) % 2 === 1
}
function shuffleBoard() {
  let b; do { b=[...createSolvedBoard()]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]} } while(!isSolvable(b)||b.every((t,i)=>t===i)); return b
}
function getPos(i){return{row:Math.floor(i/GRID_SIZE),col:i%GRID_SIZE}}

export default function Puzzle({ onNext }) {
  const [board,setBoard]=useState(()=>shuffleBoard())
  const [moves,setMoves]=useState(0)
  const [solved,setSolved]=useState(false)
  const [started,setStarted]=useState(false)
  const [showPreview,setShowPreview]=useState(false)
  const boardRef=useRef(null)

  const isSolved = board.every((t,i)=>t===i)
  useEffect(()=>{ if(isSolved&&started&&!solved) setSolved(true)},[isSolved,started,solved])

  const moveTile=useCallback((idx)=>{
    if(solved) return
    setStarted(true)
    const empty=board.indexOf(TOTAL_TILES-1)
    const a=getPos(idx), b=getPos(empty)
    const adj=(Math.abs(a.row-b.row)===1&&a.col===b.col)||(Math.abs(a.col-b.col)===1&&a.row===b.row)
    if(adj){const n=[...board];[n[idx],n[empty]]=[n[empty],n[idx]];setBoard(n);setMoves(m=>m+1)}
  },[board,solved])

  const handleShuffle=()=>{setBoard(shuffleBoard());setMoves(0);setStarted(false);setSolved(false)}

  useEffect(()=>{
    const h=(e)=>{
      if(solved||!started) return
      const ei=board.indexOf(TOTAL_TILES-1), er=Math.floor(ei/GRID_SIZE), ec=ei%GRID_SIZE
      let t=-1
      if(e.key==='ArrowUp'&&er<3) t=(er+1)*4+ec
      if(e.key==='ArrowDown'&&er>0) t=(er-1)*4+ec
      if(e.key==='ArrowLeft'&&ec<3) t=er*4+(ec+1)
      if(e.key==='ArrowRight'&&ec>0) t=er*4+(ec-1)
      if(t>=0&&board[t]!==15){e.preventDefault();moveTile(t)}
    }
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h)
  },[board,solved,started,moveTile])

  return (
    <motion.div className="main-wrapper min-h-[100dvh] relative overflow-hidden flex items-center justify-center py-6 sm:py-8" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <style>{`
        .prism-ring{position:absolute;inset:-2px;border-radius:20px;background:conic-gradient(from var(--prism,0deg),rgba(220,38,38,.45) 0%,rgba(127,29,29,.2) 8%,transparent 16%,rgba(212,175,55,.35) 28%,rgba(139,105,20,.15) 36%,transparent 44%,rgba(232,220,200,.1) 52%,transparent 60%,rgba(220,38,38,.4) 72%,transparent 88%,rgba(212,175,55,.3) 96%,rgba(220,38,38,.45) 100%);animation:prismSpin 10s linear infinite;z-index:0;filter:blur(.5px)}
        @keyframes prismSpin{to{--prism:360deg}}
        .board-glass{position:relative;z-index:1;background:linear-gradient(160deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.008) 40%,rgba(255,255,255,.02) 100%);backdrop-filter:blur(28px) saturate(1.3);-webkit-backdrop-filter:blur(28px) saturate(1.3);border:1px solid rgba(255,255,255,.06);box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 80px rgba(220,38,38,.04),inset 0 1px 0 rgba(255,255,255,.06);border-radius:18px;overflow:hidden}
        .puzzle-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:5px;width:100%;height:100%;transition:gap .6s cubic-bezier(.16,1,.3,1),padding .6s}
        .puzzle-grid.solved{gap:0!important;padding:0!important}
        .tile{aspect-ratio:1;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.07);position:relative;touch-action:manipulation;cursor:default;transition:border-color .25s,box-shadow .25s,transform .25s cubic-bezier(.16,1,.3,1);will-change:transform;background-color:rgba(0,0,0,.4);outline:none;display:flex;align-items:center;justify-content:center}
        .tile:focus-visible{box-shadow:0 0 0 2px #d4af37}
        .tile.movable{border-color:rgba(220,38,38,.22);box-shadow:0 0 14px rgba(220,38,38,.08);cursor:pointer}
        .tile.movable:hover{border-color:rgba(220,38,38,.4);box-shadow:0 0 24px rgba(220,38,38,.14);transform:scale(1.02)}
        .tile.empty{background:rgba(255,255,255,.015);border:1px dashed rgba(212,175,55,.18);cursor:default}
        .puzzle-grid.solved .tile{border-radius:0!important;border-color:transparent!important;box-shadow:none!important}
        .g-corner{position:absolute;width:36px;height:36px;z-index:10;pointer-events:none}
        .g-corner svg{width:100%;height:100%;filter:drop-shadow(0 0 5px rgba(212,175,55,.2));animation:cGlow 4s ease infinite}
        .g-corner.tl{top:-4px;left:-4px}.g-corner.tr{top:-4px;right:-4px;transform:scaleX(-1)}.g-corner.bl{bottom:-4px;left:-4px;transform:scaleY(-1)}.g-corner.br{bottom:-4px;right:-4px;transform:scale(-1)}
        @keyframes cGlow{0%,100%{filter:drop-shadow(0 0 5px rgba(212,175,55,.15))}50%{filter:drop-shadow(0 0 12px rgba(212,175,55,.35))}}
        .top-cross{position:absolute;top:-20px;left:50%;transform:translateX(-50%);z-index:12;pointer-events:none;filter:drop-shadow(0 0 8px rgba(212,175,55,.3));animation:cGlow 3s ease infinite}
        @media(max-width:640px){.puzzle-grid{gap:4px;padding:4px}}
      `}</style>

      <div className="container-lg flex flex-col lg:grid lg:grid-cols-[0.95fr_1.05fr] gap-5 lg:gap-10 items-center justify-center relative z-10 w-full max-w-full px-6 sm:px-8 lg:px-8 py-4 mx-auto">
        {/* Texto - primero en celular, derecha en PC - aumentado 10% y centrado perfecto */}
        <div className="flex flex-col items-center justify-center text-center gap-3 sm:gap-4 w-full max-w-[616px] mx-auto lg:mx-auto order-1 lg:order-2 px-2 sm:px-4 pt-8 sm:pt-0 scale-[1.1] origin-center">
          <div className="hidden sm:inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full border border-gold/15">
            <BatIcon className="w-3.5 h-3.5 text-crimson/60" /><span className="text-xs tracking-[0.2em] uppercase text-white/50">Nuestro puzzle</span><FlowerIcon className="w-3.5 h-3.5 text-gold/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[0.9] w-full" style={{fontFamily:'Cinzel,serif'}}><span className="text-gradient-blood">Pieza</span> <span className="text-white">a pieza</span></h2>
          <div className="w-full max-w-[572px] mx-auto flex flex-col gap-2.5 sm:gap-3 text-center">
            <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed italic font-light" style={{fontFamily:'Cormorant Garamond,serif'}}>Piensa conmigo por un momento...</p>
            <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed" style={{fontFamily:'Cormorant Garamond,serif'}}>Si juntos podemos tomar estos fragmentos dispersos y, con paciencia y amor, ordenarlos hasta revelar la imagen completa...</p>
            <p className="text-gold-light text-sm sm:text-[15px] leading-relaxed font-medium" style={{fontFamily:'Cormorant Garamond,serif'}}>dime, ¿por qué juntos no vamos a poder con todo lo demás?</p>
            <p className="text-white/75 text-xs sm:text-[13px] leading-relaxed italic" style={{fontFamily:'Cormorant Garamond,serif'}}>Cada pieza que encaja es un recuerdo que vuelve a su lugar. Cada movimiento es un paso que damos el uno hacia el otro. No hay desorden que no podamos abrazar, ni distancia que no podamos acortar, cuando lo hacemos tomados de la mano.</p>
            <div className="flex items-center justify-center gap-2 mt-1 text-gold/50 text-[11px] tracking-[0.2em] uppercase"><span className="w-6 h-px bg-gold/20" /> Juntos, todo encaja <span className="w-6 h-px bg-gold/20" /></div>
          </div>
        </div>

        {/* Puzzle - segundo en celular, izquierda en PC - movimientos encima, botones debajo */}
        <div className="relative w-full flex flex-col items-center gap-3 order-2 lg:order-1">
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-white/5">
            <span className="w-2 h-2 bg-crimson rounded-full animate-pulse" />
            <span className="text-white/70 text-sm font-medium" style={{fontFamily:'JetBrains Mono,monospace'}}>{moves} movimientos</span>
          </div>
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] aspect-square mx-auto" ref={boardRef}>
            <div className="prism-ring"></div>
            <div className="board-glass w-full h-full">
              <div className={`puzzle-grid ${solved?'solved':''}`}>
                {board.map((tile, idx) => {
                  const isEmpty = tile === TOTAL_TILES - 1
                  const r=Math.floor(tile/GRID_SIZE), c=tile%GRID_SIZE
                  return (
                    <button key={tile} className={`tile ${isEmpty?'empty':''} ${!isEmpty && !solved ? 'movable' : ''}`} style={!isEmpty ? {backgroundImage:'url(/puzzle-main.jpg)', backgroundSize:'400% 400%', backgroundPosition:`${c*33.333}% ${r*33.333}%`} : {}} onClick={()=>moveTile(idx)} aria-label={isEmpty?'Hueco girasol':`Mover pieza`} disabled={isEmpty||solved}>
                      {isEmpty && <FlowerIcon className="w-7 h-7 text-gold/40" />}
                    </button>
                  )
                })}
              </div>
              {showPreview && (<div className="absolute inset-[5px] rounded-[13px] overflow-hidden z-20 pointer-events-none"><img src="/puzzle-main.jpg" alt="preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/20" /></div>)}
            </div>
            <div className="g-corner tl"><svg viewBox="0 0 36 36" fill="none"><path d="M2 34V6Q2 2 6 2H16" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/><path d="M2 34H30Q34 34 34 30V22" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/></svg></div>
            <div className="g-corner tr"><svg viewBox="0 0 36 36" fill="none"><path d="M2 34V6Q2 2 6 2H16" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/><path d="M2 34H30Q34 34 34 30V22" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/></svg></div>
            <div className="g-corner bl"><svg viewBox="0 0 36 36" fill="none"><path d="M2 34V6Q2 2 6 2H16" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/><path d="M2 34H30Q34 34 34 30V22" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/></svg></div>
            <div className="g-corner br"><svg viewBox="0 0 36 36" fill="none"><path d="M2 34V6Q2 2 6 2H16" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/><path d="M2 34H30Q34 34 34 30V22" stroke="rgba(212,175,55,.5)" strokeWidth="1" strokeLinecap="round"/></svg></div>
            <div className="top-cross"><svg width="14" height="22" viewBox="0 0 14 22" fill="none"><rect x="5.5" y="1" width="3" height="20" rx="1" fill="rgba(212,175,55,.45)"/><rect x="2" y="6" width="10" height="2.5" rx="1" fill="rgba(212,175,55,.45)"/></svg></div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center w-full max-w-[360px] mx-auto">
            <button onClick={handleShuffle} className="group relative flex-1 max-w-[160px] px-5 py-3 font-bold text-white uppercase tracking-wider text-xs rounded-2xl bg-crimson border-b-[5px] border-[#7f1d1d] active:border-b-0 active:translate-y-[5px] transition-all duration-100 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)]"><span className="relative flex items-center justify-center gap-1.5" style={{fontFamily:'Cinzel,serif'}}>Mezclar</span></button>
            <button onMouseDown={()=>setShowPreview(true)} onMouseUp={()=>setShowPreview(false)} onMouseLeave={()=>setShowPreview(false)} onTouchStart={()=>setShowPreview(true)} onTouchEnd={()=>setShowPreview(false)} className="group relative flex-1 max-w-[170px] px-5 py-3 font-bold text-gold-light uppercase tracking-wider text-xs rounded-2xl bg-[#0a0a0f] border-b-[5px] border-gold/20 active:border-b-0 active:translate-y-[5px] transition-all duration-100 shadow-[0_8px_16px_-6px_rgba(212,175,55,0.12)]"><span className="relative flex items-center justify-center gap-1.5" style={{fontFamily:'Cinzel,serif'}}>Vista previa</span></button>
          </div>
        </div>

        {/* Botón saltar para programar */}
        <button onClick={onNext} className="glass px-4 py-1.5 rounded-full text-white/30 text-[11px] tracking-widest uppercase hover:text-white/60 hover:border-gold/20 border border-transparent transition-colors flex items-center gap-1.5 self-center order-3 lg:col-span-2 mx-auto">
          Saltar puzzle → <FlowerIcon className="w-3 h-3 text-gold/30" />
        </button>

        <AnimatePresence>
          {solved && (
            <motion.div initial={{scale:0.9,opacity:0,filter:'blur(8px)'}} animate={{scale:1,opacity:1,filter:'blur(0px)'}} exit={{opacity:0}} transition={springs.bouncy} className="text-center glass glass-prominent rounded-2xl p-6 sm:p-7 w-full max-w-[90vw] sm:max-w-sm mx-4 sm:mx-auto my-4 order-3 lg:col-span-2 border border-gold/15">
              <Trophy className="w-10 h-10 text-gold mx-auto" /><p className="text-white font-bold mt-3">¡Lo logramos juntos!</p><p className="text-white/60 text-sm mt-1">En {moves} movimientos — como todo lo nuestro, con paciencia florece</p>
              <button onClick={onNext} className="mt-5 w-full px-6 py-3.5 font-bold text-white uppercase tracking-wider text-xs rounded-2xl bg-crimson border-b-[5px] border-[#7f1d1d] active:border-b-0 active:translate-y-[5px] transition-all duration-100 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2" style={{fontFamily:'Cinzel,serif'}}>
                Seguir celebrando <FlowerIcon className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
