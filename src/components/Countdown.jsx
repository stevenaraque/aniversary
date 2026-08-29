import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Heart, Crown, Gem, ArrowLeft } from 'lucide-react'
import { BatIcon, FlowerIcon } from './Icons'
import { springs } from '../lib/motion-tokens'

const ANIVERSARY_DATE = new Date('2024-08-26T00:00:00')

function calculateTime() {
  const now = new Date()
  let years = now.getFullYear() - ANIVERSARY_DATE.getFullYear()
  let months = now.getMonth() - ANIVERSARY_DATE.getMonth()
  let days = now.getDate() - ANIVERSARY_DATE.getDate()
  let hours = now.getHours() - ANIVERSARY_DATE.getHours()
  let minutes = now.getMinutes() - ANIVERSARY_DATE.getMinutes()
  let seconds = now.getSeconds() - ANIVERSARY_DATE.getSeconds()
  if (seconds < 0) { seconds += 60; minutes-- }
  if (minutes < 0) { minutes += 60; hours-- }
  if (hours < 0) { hours += 24; days-- }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    days += prevMonth; months--
  }
  if (months < 0) { months += 12; years-- }
  return { years, months, days, hours, minutes, seconds }
}

function AnimatedNumber({ value }) {
  return <span className="tabular-nums">{String(value).padStart(2, '0')}</span>
}

function TimeBlock({ value, label, delay, accent, max }) {
  const pct = Math.min(1, value / max)
  const circ = 2 * Math.PI * 42
  const dash = pct * circ
  return (
    <motion.div className="flex flex-col items-center gap-2 sm:gap-3 relative" initial={{ scale: 0.9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ ...springs.gentle, delay }}>
      <div className={`relative w-[78px] h-[78px] sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-[1.3rem] sm:rounded-2xl flex flex-col items-center justify-center glass ${accent === 'gold' ? 'border-gold/15' : 'border-crimson/15'} glass-refraction overflow-visible`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={accent==='gold'?'rgba(212,175,55,0.5)':'rgba(220,38,38,0.45)'} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} style={{filter:'drop-shadow(0 0 4px rgba(212,175,55,0.25))'}} />
        </svg>
        <div className="absolute inset-[3px] rounded-[1.1rem] sm:rounded-[14px] border border-white/[0.04] pointer-events-none" />
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums relative z-10" style={{fontFamily:'Cormorant Garamond,serif'}}><AnimatedNumber value={value} /></span>
        <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-white/30 mt-0.5 relative z-10">{label}</span>
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold/30 blur-[1px] pointer-events-none hidden sm:block" />
      </div>
    </motion.div>
  )
}

export default function Countdown({ onNext, onPrev }) {
  const [time, setTime] = useState(calculateTime())
  useEffect(() => { const t=setInterval(()=>setTime(calculateTime()),1000); return()=>clearInterval(t) }, [])

  return (
    <motion.div className="main-wrapper min-h-[100dvh] h-[100dvh] relative overflow-hidden flex items-center justify-center bg-transparent" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      {onPrev && (
        <button onClick={onPrev} aria-label="Volver" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10 hover:border-gold/25 hover:text-gold-light text-white/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <style>{`
        .countdown-bg{position:absolute;inset:0;pointer-events:none;opacity:0.06}
        .countdown-circle{position:absolute;border:1px solid rgba(212,175,55,0.4);border-radius:50%;animation:countPulse 9s ease infinite;will-change:transform,opacity}
        .countdown-circle:nth-child(1){width:380px;height:380px;top:50%;left:50%;transform:translate(-50%,-50%)}
        .countdown-circle:nth-child(2){width:580px;height:580px;top:50%;left:50%;transform:translate(-50%,-50%);animation-delay:3s;border-color:rgba(220,20,60,0.28)}
        @keyframes countPulse{0%,100%{opacity:0.06;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.1;transform:translate(-50%,-50%) scale(1.03)}}
        .countdown-vignette{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,transparent 40%,rgba(0,0,0,0.5) 100%);pointer-events:none}
        .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-48%);font-family:'Cormorant Garamond',serif;font-weight:700;font-size:min(38vw,420px);line-height:1;color:rgba(212,175,55,0.035);letter-spacing:0.08em;pointer-events:none;user-select:none;filter:blur(0.5px)}
        .filigree-count{width:100%;max-width:320px;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3) 20%,rgba(212,175,55,0.5) 50%,rgba(220,20,60,0.25) 80%,transparent);position:relative;display:flex;align-items:center;justify-content:center}
        .filigree-count::before,.filigree-count::after{content:'◆';position:absolute;top:50%;transform:translateY(-55%);font-size:8px;color:rgba(212,175,55,0.5)}
        .filigree-count::before{left:-8px}.filigree-count::after{right:-8px;color:rgba(220,38,38,0.4)}
        .filigree-dot{width:6px;height:6px;border:1px solid rgba(212,175,55,0.4);transform:rotate(45deg);background:rgba(10,10,10,0.9)}
        @media(max-width:640px){.watermark{font-size:52vw}}
      `}</style>
      <div className="countdown-bg"><div className="countdown-circle"></div><div className="countdown-circle"></div></div>
      <div className="countdown-vignette"></div>
      <div className="watermark">II</div>

      <motion.div className="absolute top-8 right-6 sm:right-10 lg:right-14 opacity-[0.08] hidden sm:block" initial={{opacity:0, x:12}} animate={{opacity:0.08, x:0}} transition={{...springs.gentle, delay:0.6}}><BatIcon className="w-10 h-10 lg:w-12 lg:h-12 text-crimson" /></motion.div>
      <motion.div className="absolute bottom-8 left-6 sm:left-10 lg:left-14 opacity-[0.07] hidden sm:block" initial={{opacity:0, x:-12}} animate={{opacity:0.07, x:0}} transition={{...springs.gentle, delay:0.7}}><FlowerIcon className="w-9 h-9 lg:w-11 lg:h-11 text-gold" /></motion.div>
      <motion.div className="absolute top-[18%] left-[6%] opacity-[0.03] hidden lg:block" animate={{y:[0,-8,0]}} transition={{duration:7, repeat:Infinity}}><Crown className="w-5 h-5 text-gold" /></motion.div>
      <motion.div className="absolute bottom-[18%] right-[6%] opacity-[0.03] hidden lg:block" animate={{y:[0,8,0]}} transition={{duration:8, repeat:Infinity}}><Gem className="w-5 h-5 text-crimson" /></motion.div>

      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[100dvh] h-[100dvh] py-5 sm:py-6 text-center gap-4 sm:gap-5 px-4 overflow-hidden">
        <motion.div initial={{y:-14, opacity:0, filter:'blur(6px)'}} animate={{y:0, opacity:1, filter:'blur(0px)'}} transition={springs.gentle} className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center justify-center gap-2 glass px-4 py-1.5 rounded-full border border-gold/15">
            <Crown className="w-3 h-3 text-gold/70" /><span className="text-[10px] tracking-[0.22em] uppercase text-gold-light/80">Mi Canelita</span><Gem className="w-3 h-3 text-crimson/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-none" style={{fontFamily:'Cormorant Garamond,serif', letterSpacing:'0.08em'}}><span className="text-gradient-blood">Tiempo</span> <span className="text-white">juntos</span></h2>
          <div className="flex items-center justify-center gap-2 text-gold/25 text-[11px] tracking-[0.25em] uppercase">
            <span className="hidden sm:block w-8 h-px bg-gradient-to-r from-transparent to-gold/20" /><BatIcon className="w-3.5 h-3.5 text-crimson/30" /><span>Desde el 26 de agosto de 2024</span><FlowerIcon className="w-3.5 h-3.5 text-gold/30" /><span className="hidden sm:block w-8 h-px bg-gradient-to-l from-transparent to-crimson/20" />
          </div>
          <div className="filigree-count mt-1"><div className="filigree-dot"></div></div>
        </motion.div>

        <div className="relative w-full max-w-[640px] flex justify-center">
          <div className="w-full max-w-[560px] sm:max-w-[640px] grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 md:gap-5 justify-items-center">
            <TimeBlock value={time.years} label="Años" delay={0.12} accent="gold" max={10} />
            <TimeBlock value={time.months} label="Meses" delay={0.16} accent="crimson" max={12} />
            <TimeBlock value={time.days} label="Días" delay={0.20} accent="gold" max={31} />
            <TimeBlock value={time.hours} label="Horas" delay={0.24} accent="crimson" max={24} />
            <TimeBlock value={time.minutes} label="Min" delay={0.28} accent="gold" max={60} />
            <TimeBlock value={time.seconds} label="Seg" delay={0.32} accent="crimson" max={60} />
          </div>
        </div>
        <div className="filigree-count opacity-60"><div className="filigree-dot"></div></div>

        <motion.div className="flex items-center justify-center gap-3" initial={{opacity:0, scaleX:0.8}} animate={{opacity:1, scaleX:1}} transition={{...springs.gentle, delay:0.5}}>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-gold/15" />
          <motion.div animate={{scale:[1,1.2,1], opacity:[0.5,0.9,0.5]}} transition={{duration:2, repeat:Infinity}}><Heart className="w-4 h-4 text-crimson" fill="currentColor" /></motion.div>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-gold/15" />
        </motion.div>

        <motion.p className="text-white/25 text-sm italic flex items-center gap-2" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}>
          <FlowerIcon className="w-3 h-3 text-gold/20" /> Cada segundo cuenta contigo <BatIcon className="w-3 h-3 text-crimson/20" />
        </motion.p>

        <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{...springs.gentle, delay:0.75}}>
          <style>{`
            .pebble-button{position:relative;display:flex;align-items:center;justify-content:space-between;padding:14px 18px 14px 22px;min-width:280px;max-width:100%;background:rgba(10,10,15,0.55);border:1px solid rgba(212,175,55,0.18);border-radius:50px;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 2px 8px rgba(139,0,0,0.12),inset 0 1px 0 rgba(212,175,55,0.08);transition:transform 0.3s ease,box-shadow 0.3s ease,border-color 0.3s ease;overflow:hidden;will-change:transform;transform:translateZ(0)}
            .pebble-button::before{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.1) 50%,transparent 100%);transition:left 0.6s ease;pointer-events:none}
            .pebble-text{font-size:15px;font-weight:600;color:#f9e076;letter-spacing:0.04em;z-index:1;transition:letter-spacing 0.3s ease;text-shadow:0 1px 8px rgba(212,175,55,0.2);font-family:'Cormorant Garamond',serif;white-space:nowrap}
            .pebble-icon{position:relative;width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#8b0000 0%,#dc143c 45%,#b8941f 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.4),inset 0 1px 0 rgba(212,175,55,0.2);transition:transform 0.3s ease;z-index:1;flex-shrink:0;border:1px solid rgba(212,175,55,0.18);will-change:transform}
            .pebble-button:hover{transform:translateY(-2px) translateZ(0);box-shadow:0 12px 36px rgba(0,0,0,0.55),0 4px 12px rgba(139,0,0,0.15);border-color:rgba(212,175,55,0.28)}
            .pebble-button:hover::before{left:100%}
            .pebble-button:hover .pebble-icon{transform:scale(1.05) rotate(3deg)}
            .pebble-button:hover .pebble-text{letter-spacing:0.05em}
            .pebble-button:active{transform:translateY(0) scale(0.97)}
            .pebble-button:active .pebble-icon{transform:scale(0.94)}
            @media(max-width:640px){.pebble-button{min-width:260px;padding:12px 14px 12px 18px}.pebble-text{font-size:13px}.pebble-icon{width:44px;height:44px;border-radius:14px}}
          `}</style>
          <button className="pebble-button" onClick={onNext} aria-label="Desbloquear recuerdos">
            <span className="pebble-text">Desbloquear recuerdos</span>
            <div className="pebble-icon">
              <BatIcon className="w-5 h-5 text-gold-light relative z-10" />
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
