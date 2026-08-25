import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Heart, Skull, Crown, Gem } from 'lucide-react'
import { BatIcon } from './Icons'
import { springs } from '../lib/motion-tokens'

function CursorFollower() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, springs.gentle)
  const sy = useSpring(y, springs.gentle)
  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])
  return <motion.div className="hidden lg:block fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 will-change-transform" style={{ x: sx, y: sy, background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(220,20,60,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }} />
}

function StarRainCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    let raf=0,w=0,h=0
    const isMobile=window.matchMedia('(max-width:768px)').matches
    const COUNT=isMobile?18:36
    const stars=Array.from({length:COUNT},()=>({x:Math.random(),y:Math.random(),size:Math.random()*1.45+0.6,baseAlpha:Math.random()*0.42+0.26,speed:0.00014+Math.random()*0.00028,tx:(Math.random()-0.5)*0.055,ty:(Math.random()-0.5)*0.055,phase:Math.random()*Math.PI*2,tw:0.0005+Math.random()*0.00065}))
    const resize=()=>{const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    resize();window.addEventListener('resize',resize)
    let last=0
    const tick=(now)=>{if(now-last<34){raf=requestAnimationFrame(tick);return}last=now;ctx.clearRect(0,0,w,h);for(const s of stars){s.x+=s.tx*s.speed*34;s.y+=s.ty*s.speed*34;if(s.x<-0.05)s.x=1.05;if(s.x>1.05)s.x=-0.05;if(s.y<-0.05)s.y=1.05;if(s.y>1.05)s.y=-0.05;s.phase+=s.tw*34;const tw=(Math.sin(s.phase)+1)/2,a=s.baseAlpha*(0.28+tw*0.62),sc=0.65+tw*0.4;const r=s.size*sc;if(s.size>1.35){ctx.beginPath();ctx.arc(s.x*w,s.y*h,r*1.7,0,Math.PI*2);ctx.fillStyle=`rgba(255,248,220,${a*0.11})`;ctx.fill()}ctx.beginPath();ctx.arc(s.x*w,s.y*h,r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fill()}raf=requestAnimationFrame(tick)}
    const onVis=()=>{if(document.hidden)cancelAnimationFrame(raf);else requestAnimationFrame(tick)}
    document.addEventListener('visibilitychange',onVis);raf=requestAnimationFrame(tick)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis)}
  },[])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}

function FrostCanvas() {
  const ref=useRef(null)
  useEffect(()=>{
    const isMobile=window.matchMedia('(max-width:768px)').matches
    if(isMobile) return // desactiva en móvil para rendimiento
    const canvas=ref.current
    if(!canvas) return
    const ctx=canvas.getContext('2d')
    let W=canvas.width=window.innerWidth, H=canvas.height=window.innerHeight
    let raf=0, last=0
    class Particle{constructor(){this.reset()} reset(){this.x=Math.random()*W;this.y=-10;this.z=Math.random();this.size=0.3+this.z*0.6;this.speed=0.18+this.z*0.4;this.drift=(Math.random()-0.5)*0.18;this.opacity=0.06+this.z*0.16} update(){this.y+=this.speed;this.x+=this.drift;if(this.y>H+10)this.reset()} draw(){ctx.fillStyle=`rgba(255,255,255,${this.opacity})`;ctx.fillRect(this.x,this.y,this.size,this.size)}}
    class IceCrystal{constructor(){this.reset()} reset(){this.x=Math.random()*W;this.y=H*0.86+Math.random()*40;this.size=12+Math.random()*18;this.angle=Math.random()*Math.PI*2;this.rotSpeed=(Math.random()-0.5)*0.006;this.opacity=0;this.maxOpacity=0.015+Math.random()*0.02;this.fadeIn=true;this.life=0;this.maxLife=260+Math.random()*180} update(){this.angle+=this.rotSpeed;this.life++;if(this.fadeIn){this.opacity+=0.0006;if(this.opacity>=this.maxOpacity)this.fadeIn=false}else if(this.life>this.maxLife*0.7)this.opacity-=0.0003;if(this.life>this.maxLife)this.reset()} draw(){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.strokeStyle=`rgba(255,255,255,${this.opacity})`;ctx.lineWidth=0.5;const arms=6;for(let i=0;i<arms;i++){ctx.save();ctx.rotate((Math.PI*2/arms)*i);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(this.size,0);ctx.stroke();ctx.restore()}ctx.restore()}}
    class FrostLine{constructor(){this.x1=Math.random()*W;this.y=H*0.86;this.length=0;this.maxLength=40+Math.random()*55;this.angle=(Math.random()-0.5)*0.4;this.opacity=0;this.growing=true} update(){if(this.growing){this.length+=0.35;this.opacity+=0.0012;if(this.length>=this.maxLength)this.growing=false}else this.opacity-=0.0006;return this.opacity>0} draw(){ctx.save();ctx.translate(this.x1,this.y);ctx.rotate(this.angle);ctx.strokeStyle=`rgba(255,255,255,${this.opacity*0.06})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(this.length,0);ctx.stroke();ctx.restore()}}
    const particles=Array.from({length:42},()=>new Particle())
    const crystals=Array.from({length:3},()=>new IceCrystal())
    const frostLines=[]
    const loop=(now)=>{
      if(now-last<50){raf=requestAnimationFrame(loop);return} last=now
      ctx.clearRect(0,0,W,H)
      particles.forEach(p=>{p.update();p.draw()})
      crystals.forEach(c=>{c.update();c.draw()})
      if(Math.random()<0.012 && frostLines.length<10) frostLines.push(new FrostLine())
      for(let i=frostLines.length-1;i>=0;i--){if(!frostLines[i].update()) frostLines.splice(i,1); else frostLines[i].draw()}
      raf=requestAnimationFrame(loop)
    }
    const onResize=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;particles.forEach(p=>p.reset());crystals.forEach(c=>c.reset())}
    const onVis=()=>{if(document.hidden) cancelAnimationFrame(raf); else raf=requestAnimationFrame(loop)}
    window.addEventListener('resize',onResize); document.addEventListener('visibilitychange',onVis); raf=requestAnimationFrame(loop)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);document.removeEventListener('visibilitychange',onVis)}
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 hidden md:block" aria-hidden="true" />
}

function GothicButton({ onClick, children }) {
  return (
    <>
      <style>{`
        .gothic-btn{cursor:pointer;width:17.5em;height:5em;border-radius:1.5em;border:1px solid rgba(212,175,55,0.32);display:flex;justify-content:right;align-items:center;box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 22px rgba(139,0,0,0.18),inset 0 1px 0 rgba(212,175,55,0.08);position:relative;overflow:hidden;background:linear-gradient(135deg,#0a0a0a 0%,#050505 100%);transition:transform 0.25s ease,box-shadow 0.25s ease,border-color 0.25s ease;will-change:transform}
        .gothic-btn:hover{border-color:rgba(212,175,55,0.55);box-shadow:0 12px 40px rgba(0,0,0,0.7),0 0 30px rgba(212,175,55,0.18);transform:translateY(-1px)}
        .gothic-p{font-size:1.1rem;font-weight:700;letter-spacing:0.07em;color:#f9e076;position:absolute;top:50%;left:1.3em;transform:translateY(-50%);transition:transform 0.5s ease,opacity 0.5s ease;white-space:nowrap;font-family:'Cormorant Garamond',serif;text-shadow:0 0 10px rgba(212,175,55,0.3)}
        .gothic-glow{width:4em;height:3.5em;background:linear-gradient(135deg,#8b0000 0%,#dc143c 50%,#4a0e0e 100%);border-radius:1em;position:relative;box-shadow:0 0 0.5em rgba(0,0,0,0.4),inset 0.2em 0 0.3em rgba(212,175,55,0.4);overflow:hidden;margin-right:0.75em;transition:width 0.5s ease;flex-shrink:0;border:1px solid rgba(212,175,55,0.18)}
        .gothic-sign{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;color:#f9e076}
        .gothic-white{width:100%;background:rgba(212,175,55,0.06);height:2.5em;position:absolute;top:0;filter:blur(0.5em);pointer-events:none}
        .gothic-blob{position:absolute;top:50%;left:50%;filter:blur(0.3em);transition:filter 0.5s ease;opacity:0.95;will-change:filter}
        #g-red{transform:translate(-50%,-50%) scale(4);animation:g-rotar 5s linear infinite;color:#dc143c}#g-gold{transform:translate(-95%,-55%) scale(2.5);animation:g-rotar 6s linear infinite;color:#d4af37}#g-crimson{transform:translate(-75%,-5%) scale(2);animation:g-rotar 7s linear infinite;color:#8b0000}
        @keyframes g-rotar{0%{rotate:0deg}100%{rotate:360deg}}.gothic-btn:hover .gothic-p{transform:translate(-25%,-50%);opacity:0}.gothic-btn:hover .gothic-glow{width:16em}.gothic-btn:hover .gothic-blob{filter:blur(0.7em)}.gothic-btn:active{transform:scale(0.96)}
        @media(max-width:640px){.gothic-btn{width:15em;height:4.2em;border-radius:1.2em}.gothic-p{font-size:0.95rem;left:1em}.gothic-glow{width:3.4em;height:3em}.gothic-btn:hover .gothic-glow{width:13.5em}}
      `}</style>
      <button className="gothic-btn" onClick={onClick} aria-label={children}>
        <p className="gothic-p">{children}</p>
        <div className="gothic-glow">
          <span className="gothic-sign"><BatIcon className="w-6 h-6 text-gold-light" /></span>
          <svg id="g-red" viewBox="0 0 200 200" width="80" height="80"><path d="M50.1,-30.7C54.6,-21.2,40.8,-2.8,29.4,11.7C18,26.1,9,36.7,0.5,36.4C-8,36.1,-15.9,24.9,-26.5,10.9C-37.1,-3.1,-50.4,-19.9,-46.5,-29.1C-42.5,-38.3,-21.2,-39.9,0.8,-40.3C22.8,-40.8,45.6,-40.1,50.1,-30.7Z" transform="translate(100 100)" fill="currentColor"/></svg>
          <svg id="g-gold" viewBox="0 0 200 200" width="80" height="80"><path d="M42.3,-26.7C50.5,-10.4,49.6,8.9,41.1,23.3C32.5,37.7,16.3,47.3,-2,48.4C-20.2,49.5,-40.3,42.2,-45.8,29.6C-51.2,17,-41.9,-0.9,-31.8,-18.4C-21.8,-35.9,-10.9,-52.9,3.1,-54.7C17.1,-56.5,34.2,-43.1,42.3,-26.7Z" transform="translate(100 100)" fill="currentColor"/></svg>
          <svg id="g-crimson" viewBox="0 0 200 200" width="80" height="80"><path d="M33.1,-23.8C40.7,-5.9,43.3,10.3,36.9,30.2C30.6,50.1,15.3,73.7,0.7,73.3C-14,72.9,-28,48.6,-36.1,27.7C-44.2,6.8,-46.4,-10.7,-39.4,-28.2C-32.5,-45.8,-16.2,-63.4,-1.8,-62.4C12.7,-61.4,25.4,-41.7,33.1,-23.8Z" transform="translate(100 100)" fill="currentColor"/></svg>
        </div>
        <div className="gothic-white" />
      </button>
    </>
  )
}

export default function Intro({ onNext }) {
  return (
    <motion.div className="main-wrapper min-h-[100dvh] h-[100dvh] relative overflow-hidden flex items-center justify-center bg-transparent" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <StarRainCanvas />
      <FrostCanvas />
      <CursorFollower />
      {/* Debug: indica que CosmosBackground está activo */}
      <div className="absolute top-2 left-2 z-20 text-[9px] tracking-widest text-gold/40 pointer-events-none hidden">COSMOS ACTIVO 18 cometas</div>



      <style>{`


        .umbra-hero{height:100dvh;width:100%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
        .umbra-bg{position:absolute;width:100%;height:100%;opacity:0.05;pointer-events:none}
        .umbra-circle{position:absolute;border:1px solid rgba(212,175,55,0.45);border-radius:50%;animation:umbraPulse 8s ease-in-out infinite;will-change:transform,opacity}
        .umbra-circle:nth-child(1){width:420px;height:420px;top:50%;left:50%;transform:translate(-50%,-50%)}.umbra-circle:nth-child(2){width:620px;height:620px;top:50%;left:50%;transform:translate(-50%,-50%);animation-delay:2s;border-color:rgba(220,20,60,0.3)}.umbra-circle:nth-child(3){width:820px;height:820px;top:50%;left:50%;transform:translate(-50%,-50%);animation-delay:4s}
        @keyframes umbraPulse{0%,100%{opacity:0.05;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.09;transform:translate(-50%,-50%) scale(1.04)}}
        .umbra-diamond{position:absolute;width:14px;height:14px;border:1px solid rgba(212,175,55,0.2);transform:rotate(45deg);animation:umbraRot 12s linear infinite;will-change:transform}
        .umbra-diamond:nth-child(1){top:48px;left:48px}.umbra-diamond:nth-child(2){top:48px;right:48px;animation-delay:3s;border-color:rgba(220,20,60,0.18)}.umbra-diamond:nth-child(3){bottom:48px;left:48px;animation-delay:6s}.umbra-diamond:nth-child(4){bottom:48px;right:48px;animation-delay:9s;border-color:rgba(220,20,60,0.18)}
        @keyframes umbraRot{0%,100%{transform:rotate(45deg)}50%{transform:rotate(135deg)}}
        .candelabro{position:absolute;width:2px;height:62%;top:19%;background:linear-gradient(to bottom,transparent 0%,rgba(212,175,55,0.18) 12%,rgba(212,175,55,0.22) 50%,rgba(212,175,55,0.14) 88%,transparent);box-shadow:0 0 10px rgba(212,175,55,0.08);will-change:opacity}
        .candelabro::before{content:'◆';position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:10px;color:rgba(212,175,55,0.9);text-shadow:0 0 8px rgba(212,175,55,0.4)}
        .candelabro::after{content:'';position:absolute;top:2px;left:50%;transform:translateX(-50%);width:26px;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.35),transparent);box-shadow:0 1px 3px rgba(0,0,0,0.3)}
        .candelabro i{position:absolute;left:50%;transform:translateX(-50%);width:18px;height:1px;background:rgba(212,175,55,0.18)}
        .candelabro i:nth-child(1){top:18%}.candelabro i:nth-child(2){top:38%}.candelabro i:nth-child(3){top:58%}.candelabro i:nth-child(4){top:78%}
        .candelabro:nth-child(1){left:22.5%}.candelabro:nth-child(2){right:22.5%}
        .candelabro{animation:candelGlow 5s ease infinite}
        .candelabro:nth-child(2){animation-delay:2.5s}
        @keyframes candelGlow{0%,100%{opacity:0.85}50%{opacity:1;box-shadow:0 0 14px rgba(212,175,55,0.12)}}
        .umbra-fog{position:absolute;width:200%;height:100%;background:radial-gradient(ellipse at center,transparent 22%,rgba(0,0,0,0.88) 76%);animation:umbraFog 22s ease infinite;will-change:transform}
        @keyframes umbraFog{0%,100%{transform:translateX(0)}50%{transform:translateX(-22%)}}
        .umbra-dust{position:absolute;width:1px;height:1px;background:rgba(212,175,55,0.38);border-radius:50%;box-shadow:0 0 4px rgba(212,175,55,0.22);will-change:transform,opacity;transform:translateY(100vh);animation:umbraDustT 22s linear infinite}
        @keyframes umbraDustT{0%{transform:translateY(100vh) translateX(0);opacity:0}10%{opacity:0.6}90%{opacity:0.6}100%{transform:translateY(-10vh) translateX(80px);opacity:0}}
        .umbra-ink{position:absolute;top:0;width:1.5px;height:120px;background:linear-gradient(to bottom,transparent,rgba(139,0,0,0.32));opacity:0;will-change:transform,opacity;transform:translateY(-130px) scaleY(0);animation:umbraInkT 9s ease-in infinite}
        @keyframes umbraInkT{0%{transform:translateY(-130px) scaleY(0);opacity:0}18%{transform:translateY(0) scaleY(1);opacity:0.45}100%{transform:translateY(110vh) scaleY(1);opacity:0}}
        .filigree{width:100%;max-width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.35) 15%,rgba(212,175,55,0.55) 50%,rgba(220,20,60,0.3) 85%,transparent);position:relative;display:flex;align-items:center;justify-content:center}
        .filigree::before,.filigree::after{content:'◆';position:absolute;top:50%;transform:translateY(-55%);font-size:9px;color:rgba(212,175,55,0.6)}
        .filigree::before{left:-10px}.filigree::after{right:-10px;color:rgba(220,20,60,0.5)}
        .filigree-diamond{width:7px;height:7px;border:1px solid rgba(212,175,55,0.45);transform:rotate(45deg);background:rgba(10,10,10,0.9)}
        .noise{position:absolute;inset:0;opacity:0.018;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");mix-blend-overlay}
        .vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 62%,rgba(0,0,0,0.45) 100%)}
        @media(max-width:768px){.umbra-circle:nth-child(3){width:560px;height:560px}.umbra-diamond{width:11px;height:11px}.gothic-corner{width:28px;height:28px}.filigree{width:160px}.arch{width:94vw;height:82vh}.inverted-cross{height:32vh}.cross-horizontal{width:42vw}}
      `}</style>

      <div className="umbra-hero">
        <div className="umbra-bg"><div className="umbra-circle"></div><div className="umbra-circle"></div><div className="umbra-circle"></div></div>

        <div className="umbra-fog"></div>
        <div className="noise"></div><div className="vignette"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="umbra-dust" style={{left:'14%',animationDelay:'0s',animationDuration:'19s'}}></div>
          <div className="umbra-dust" style={{left:'23%',animationDelay:'3s',animationDuration:'23s'}}></div>
          <div className="umbra-dust" style={{left:'34%',animationDelay:'6s',animationDuration:'21s'}}></div>
          <div className="umbra-dust" style={{left:'46%',animationDelay:'2s',animationDuration:'25s'}}></div>
          <div className="umbra-dust" style={{left:'56%',animationDelay:'5s',animationDuration:'20s'}}></div>
          <div className="umbra-dust" style={{left:'67%',animationDelay:'8s',animationDuration:'22s'}}></div>
          <div className="umbra-dust" style={{left:'78%',animationDelay:'4s',animationDuration:'24s'}}></div>
          <div className="umbra-dust" style={{left:'88%',animationDelay:'7s',animationDuration:'18s'}}></div>
        </div>
        <div className="umbra-ink" style={{left:'19%'}}></div><div className="umbra-ink" style={{left:'44%',animationDelay:'3s'}}></div><div className="umbra-ink" style={{left:'71%',animationDelay:'6s'}}></div><div className="umbra-ink" style={{left:'87%',animationDelay:'2s'}}></div>

        <div className="container-lg relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-14 items-center w-full px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center text-center gap-5 order-1">
            <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={{delay:0.2,...springs.gentle}} className="flex items-center justify-center gap-2 glass px-5 py-1.5 rounded-full border border-gold/20 w-auto mx-auto text-center">
              <Crown className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gold-light font-medium text-center leading-none">26 · 08 · 2024 — 2 Años</span>
              <Gem className="w-3.5 h-3.5 text-crimson shrink-0" />
            </motion.div>
            {/* EXTENDIDO: max-w-3xl para no quede vacío centro */}
            <motion.div initial={{opacity:0,y:20,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{...springs.gentle,delay:0.45}} className="flex flex-col items-center gap-4 w-full max-w-full px-0 py-4 text-center">
              <span className="text-[10px] tracking-[0.45em] uppercase text-white/25 w-full">Mi Canelita ❋</span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] font-bold leading-[0.88] tracking-tight w-full" style={{fontFamily:'Cinzel,serif', letterSpacing:'0.12em'}}>
                <span className="block text-gradient-blood" style={{fontFamily:'Cinzel,serif'}}>Nuestro</span>
                <span className="block text-white drop-shadow-[0_0_22px_rgba(212,175,55,0.28)]" style={{fontFamily:'Cinzel,serif'}}>Tiempo</span>
              </h1>
              <div className="filigree my-1 w-full"><div className="filigree-diamond"></div></div>
              <p className="text-gold-light/85 text-sm md:text-[17px] lg:text-[18px] leading-7 w-full max-w-none font-light italic" style={{fontFamily:'Cormorant Garamond,serif'}}>
                Dos años de nosotros. Un instante eterno.<br/><span className="text-white/55 text-sm not-italic">Lo que sigue es nuestro recuerdo, guardado en luz y sombra.</span>
              </p>
              <span className="text-gold/30 text-[11px] tracking-[0.3em] w-full">⚜ — Aeternitas — ⚜</span>
            </motion.div>
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{...springs.gentle,delay:0.8}} className="flex flex-col items-center gap-3 mt-1 w-full">
              <GothicButton onClick={onNext}>Recordemos</GothicButton>
              <span className="text-white/20 text-[10px] tracking-[0.28em] uppercase flex items-center justify-center gap-2"><Skull className="w-3 h-3"/> 26 DE AGOSTO <Skull className="w-3 h-3"/></span>
            </motion.div>
          </div>
          <motion.div initial={{opacity:0,scale:0.97,filter:'blur(8px)'}} animate={{opacity:1,scale:1,filter:'blur(0px)'}} transition={{...springs.gentle,delay:0.6}} className="order-2 w-full h-auto flex items-center justify-center p-2 lg:p-0 max-w-full overflow-hidden">
            <style>{`
              .gothic-prism{position:relative;width:100%;max-width:575px;--crimson:#dc2626;--gold:#d4af37;--bone:#e8dcc8;--obsidian:#0a0a0f; margin:0 auto}
              @property --prism{syntax:'<angle>';initial-value:0deg;inherits:false}
              .prism-border{position:absolute;inset:-3px;border-radius:4px;background:conic-gradient(from var(--prism),rgba(220,38,38,0.5) 0%,rgba(127,29,29,0.3) 8%,transparent 16%,rgba(212,175,55,0.4) 28%,rgba(139,105,20,0.2) 36%,transparent 44%,rgba(232,220,200,0.15) 52%,transparent 60%,rgba(220,38,38,0.45) 72%,rgba(127,29,29,0.25) 80%,transparent 88%,rgba(212,175,55,0.35) 96%,rgba(220,38,38,0.5) 100%);animation:prismSpin 12s linear infinite;filter:blur(0.5px)}
              @keyframes prismSpin{to{--prism:360deg}}
              .crystal-frame{position:relative;width:100%;border-radius:3px;background:linear-gradient(160deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.008) 30%,rgba(255,255,255,0.025) 60%,rgba(255,255,255,0.01) 100%);backdrop-filter:blur(28px) saturate(1.3);-webkit-backdrop-filter:blur(28px) saturate(1.3);border:1px solid rgba(255,255,255,0.07);box-shadow:0 0 0 1px rgba(0,0,0,0.5),0 20px 60px rgba(0,0,0,0.6),0 0 100px rgba(220,38,38,0.06),0 0 100px rgba(212,175,55,0.04),inset 0 1px 0 rgba(255,255,255,0.06);overflow:hidden}
              .crystal-frame::before{content:'';position:absolute;top:0;left:0;right:0;height:45%;background:linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 100%);pointer-events:none;z-index:5}
              .crystal-frame::after{content:'';position:absolute;top:-1px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);pointer-events:none;z-index:5}
              .gothic-prism .corner{position:absolute;width:70px;height:70px;pointer-events:none;z-index:10}
              .gothic-prism .corner svg{width:100%;height:100%;filter:drop-shadow(0 0 6px rgba(212,175,55,0.25));animation:cornerGlow 4s ease infinite}
              .corner-tl{top:-6px;left:-6px}.corner-tr{top:-6px;right:-6px;transform:scaleX(-1)}.corner-bl{bottom:-6px;left:-6px;transform:scaleY(-1)}.corner-br{bottom:-6px;right:-6px;transform:scale(-1,-1)}
              @keyframes cornerGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(212,175,55,0.2))}50%{filter:drop-shadow(0 0 14px rgba(212,175,55,0.4))}}
              .edge-orn{position:absolute;z-index:8;pointer-events:none;display:flex;align-items:center;justify-content:center}
              .edge-top{left:40px;right:40px;height:18px;top:-2px}.edge-bottom{left:40px;right:40px;height:18px;bottom:-2px;transform:scaleY(-1)}.edge-left{top:40px;bottom:40px;width:18px;left:-2px}.edge-right{top:40px;bottom:40px;width:18px;right:-2px;transform:scaleX(-1)}
              .edge-orn svg{width:100%;height:100%;opacity:0.35}
              .gothic-arch{position:absolute;top:-1px;left:-1px;right:-1px;height:60px;z-index:7;pointer-events:none;overflow:hidden}
              .gothic-arch svg{width:100%;height:100%;opacity:0.4;filter:drop-shadow(0 0 8px rgba(220,38,38,0.15))}
              .top-cross-prism{position:absolute;top:-28px;left:50%;transform:translateX(-50%);z-index:12;pointer-events:none;filter:drop-shadow(0 0 10px rgba(212,175,55,0.35));animation:cornerGlow 3s ease infinite}
              .image-area-prism{position:relative;margin:20px;border-radius:2px;overflow:hidden;z-index:3;border:1px solid rgba(255,255,255,0.03);line-height:0}
              .image-area-prism img{width:100%;height:auto;display:block;filter:saturate(0.85) contrast(1.05) brightness(0.92);transition:filter 0.6s,transform 0.8s}
              .gothic-prism:hover .image-area-prism img{filter:saturate(0.98) contrast(1.08) brightness(0.96);transform:scale(1.015)}
              .image-overlay-prism{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,15,0.28) 0%,transparent 32%,transparent 68%,rgba(10,10,15,0.38) 100%),linear-gradient(90deg,rgba(10,10,15,0.14) 0%,transparent 22%,transparent 78%,rgba(10,10,15,0.14) 100%);z-index:4;pointer-events:none}
              .inner-vig-prism{position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 50% 50%,transparent 45%,rgba(10,10,15,0.48) 100%);z-index:4;pointer-events:none}
              .frame-caption-prism{position:absolute;bottom:12px;left:12px;right:12px;z-index:10;text-align:center;pointer-events:none;background:linear-gradient(to top,rgba(10,10,15,0.65),transparent);padding:10px 0 4px;border-radius:0 0 2px 2px}
              .frame-caption-prism .line-prism{width:40px;height:1px;margin:0 auto 8px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)}
              .frame-caption-prism span{font-family:'Cinzel Decorative',serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(232,220,200,0.45)}
              @media(max-width:640px){.gothic-prism{max-width:100%; margin:0 auto}.corner{width:52px;height:52px}.gothic-arch{height:42px}.image-area-prism{margin:14px}}
            `}</style>
            <div className="gothic-prism">
              <div className="prism-border"></div>
              <div className="crystal-frame">
                <div className="image-area-prism">
                  <img src="/puzzle-main.jpg" alt="Nosotros" loading="eager" />
                  <div className="image-overlay-prism"></div>
                  <div className="inner-vig-prism"></div>
                </div>
                <div className="frame-caption-prism"><div className="line-prism"></div><span>Nosotros — 26.08.2024</span></div>
              </div>
              <div className="gothic-arch">
                <svg viewBox="0 0 420 60" fill="none" preserveAspectRatio="none"><path d="M0 60 L0 35 Q0 0 210 0 Q420 0 420 35 L420 60" stroke="url(#archGradP)" strokeWidth="1.5" fill="none"/><path d="M20 60 L20 38 Q20 8 210 8 Q400 8 400 38 L400 60" stroke="url(#archGrad2P)" strokeWidth="0.5" fill="none"/><path d="M210 4 L214 10 L210 16 L206 10 Z" fill="rgba(212,175,55,0.32)"/><defs><linearGradient id="archGradP" x1="0" y1="0" x2="420" y2="0"><stop offset="0%" stopColor="rgba(212,175,55,0.1)"/><stop offset="30%" stopColor="rgba(212,175,55,0.5)"/><stop offset="50%" stopColor="rgba(232,220,200,0.6)"/><stop offset="70%" stopColor="rgba(212,175,55,0.5)"/><stop offset="100%" stopColor="rgba(212,175,55,0.1)"/></linearGradient><linearGradient id="archGrad2P" x1="0" y1="0" x2="420" y2="0"><stop offset="0%" stopColor="rgba(220,38,38,0.05)"/><stop offset="50%" stopColor="rgba(220,38,38,0.25)"/><stop offset="100%" stopColor="rgba(220,38,38,0.05)"/></linearGradient></defs></svg>
              </div>

              <div className="edge-orn edge-top"><svg viewBox="0 0 340 18" fill="none" preserveAspectRatio="none"><line x1="0" y1="9" x2="340" y2="9" stroke="rgba(212,175,55,0.12)" strokeWidth="0.5"/><circle cx="170" cy="9" r="1.5" fill="none" stroke="rgba(220,38,38,0.32)" strokeWidth="0.5"/><circle cx="170" cy="9" r="0.5" fill="rgba(220,38,38,0.5)"/></svg></div>
              <div className="edge-orn edge-bottom"><svg viewBox="0 0 340 18" fill="none" preserveAspectRatio="none"><line x1="0" y1="9" x2="340" y2="9" stroke="rgba(212,175,55,0.12)" strokeWidth="0.5"/><circle cx="170" cy="9" r="1.5" fill="none" stroke="rgba(220,38,38,0.32)" strokeWidth="0.5"/><circle cx="170" cy="9" r="0.5" fill="rgba(220,38,38,0.5)"/></svg></div>
              <div className="top-cross-prism"><svg width="18" height="26" viewBox="0 0 20 30" fill="none"><rect x="8" y="2" width="4" height="26" rx="1" fill="rgba(212,175,55,0.5)"/><rect x="3" y="8" width="14" height="3" rx="1" fill="rgba(212,175,55,0.5)"/><circle cx="10" cy="5" r="1" fill="rgba(220,38,38,0.6)"/></svg></div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
