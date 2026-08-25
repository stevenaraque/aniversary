import { useEffect, useRef } from 'react'

export default function CosmosBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H
    let animationId
    let mx = 0, my = 0

    const onMouseMove = (e) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMouseMove)

    function rand(a, b) { return Math.random() * (b - a) + a }

    const staticCanvas = document.createElement('canvas')
    const sCtx = staticCanvas.getContext('2d')
    const STAR_COUNT = 300
    const starData = []

    function initStars() {
      starData.length = 0
      for (let i = 0; i < STAR_COUNT; i++) {
        starData.push({
          x: rand(0, W),
          y: rand(0, H),
          r: rand(0.3, 1.6),
          baseAlpha: rand(0.2, 0.8),
          flickerSpeed: rand(0.005, 0.025),
          flickerOffset: rand(0, Math.PI * 2),
          tint: Math.random() < 0.12 ? 2 : Math.random() < 0.22 ? 1 : 0
        })
      }
    }

    function renderStaticLayer() {
      staticCanvas.width = W
      staticCanvas.height = H
      const bg = sCtx.createRadialGradient(W * 0.3, H * 0.7, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85)
      bg.addColorStop(0, '#0e0a18')
      bg.addColorStop(0.4, '#08061a')
      bg.addColorStop(1, '#020208')
      sCtx.fillStyle = bg
      sCtx.fillRect(0, 0, W, H)
      const og = sCtx.createRadialGradient(0, H, 0, 0, H, H * 0.7)
      og.addColorStop(0, 'rgba(100,70,15,0.06)')
      og.addColorStop(0.5, 'rgba(60,40,10,0.02)')
      og.addColorStop(1, 'rgba(0,0,0,0)')
      sCtx.fillStyle = og
      sCtx.fillRect(0, 0, W, H)
      const nebColors = ['rgba(70,45,8,0.025)', 'rgba(35,25,55,0.035)', 'rgba(50,30,10,0.02)', 'rgba(25,20,50,0.03)']
      for (let i = 0; i < 5; i++) {
        const nx = rand(0, W), ny = rand(0, H), nr = rand(180, 450)
        const ng = sCtx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        ng.addColorStop(0, nebColors[i % nebColors.length])
        ng.addColorStop(1, 'rgba(0,0,0,0)')
        sCtx.beginPath()
        sCtx.arc(nx, ny, nr, 0, Math.PI * 2)
        sCtx.fillStyle = ng
        sCtx.fill()
      }
      initStars()
    }

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      renderStaticLayer()
    }

    function drawStars(t) {
      for (let i = 0; i < starData.length; i++) {
        const s = starData[i]
        const alpha = s.baseAlpha + Math.sin(t * s.flickerSpeed + s.flickerOffset) * 0.25
        const a = Math.max(0.05, Math.min(1, alpha))
        if (s.tint === 0) ctx.fillStyle = `rgba(210,215,230,${a})`
        else if (s.tint === 1) ctx.fillStyle = `rgba(255,234,167,${a})`
        else ctx.fillStyle = `rgba(255,215,0,${a})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 6.2832)
        ctx.fill()
      }
    }

    const particles = []
    const MAX_P = 500

    function spawnParticle(x, y) {
      if (particles.length >= MAX_P) {
        let oldest = 0
        for (let j = 1; j < particles.length; j++) if (particles[j].life < particles[oldest].life) oldest = j
        const p = particles[oldest]
        p.x = x + rand(-4, 4); p.y = y + rand(-4, 4)
        p.vx = rand(-0.5, 0.5); p.vy = rand(-0.5, 0.5)
        p.life = rand(15, 45) | 0; p.maxLife = p.life; p.size = rand(0.6, 2.2); p.alive = true
      } else {
        particles.push({ x: x + rand(-4, 4), y: y + rand(-4, 4), vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5), life: rand(15, 45) | 0, maxLife: 0, size: rand(0.6, 2.2), alive: true })
        particles[particles.length - 1].maxLife = particles[particles.length - 1].life
      }
    }

    function updateAndDrawParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.life--
        if (p.life <= 0) { particles.splice(i, 1); continue }
        const t = p.life / p.maxLife
        const r = Math.max(0.2, p.size * t)
        ctx.globalAlpha = t * 0.55
        ctx.fillStyle = '#ffd700'
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill()
        ctx.fillStyle = '#fff8e0'
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.35, 0, 6.2832); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const starSprites = []
    function createStarSprite(size, glowSize) {
      const c = document.createElement('canvas')
      const s = glowSize * 2
      c.width = s; c.height = s
      const x = s / 2, y = s / 2
      const g = c.getContext('2d')
      const grad = g.createRadialGradient(x, y, 0, x, y, glowSize)
      grad.addColorStop(0, 'rgba(255,255,255,0.9)')
      grad.addColorStop(0.1, 'rgba(255,248,224,0.6)')
      grad.addColorStop(0.25, 'rgba(255,215,0,0.25)')
      grad.addColorStop(0.5, 'rgba(255,215,0,0.06)')
      grad.addColorStop(1, 'rgba(255,215,0,0)')
      g.fillStyle = grad; g.fillRect(0, 0, s, s)
      g.save(); g.translate(x, y)
      const outerR = size, innerR = size * 0.18, points = 4
      g.beginPath()
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const angle = (i * Math.PI) / points - Math.PI / 2
        if (i === 0) g.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
        else g.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
      }
      g.closePath(); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fill(); g.restore()
      g.save(); g.translate(x, y); g.globalAlpha = 0.35; g.strokeStyle = '#ffd700'; g.lineWidth = 1.5
      g.beginPath(); g.moveTo(0, -size * 1.2); g.lineTo(0, size * 1.2); g.stroke()
      g.beginPath(); g.moveTo(-size * 1.2, 0); g.lineTo(size * 1.2, 0); g.stroke()
      g.globalAlpha = 0.15; g.lineWidth = 3
      g.beginPath(); g.moveTo(0, -size * 0.9); g.lineTo(0, size * 0.9); g.stroke()
      g.beginPath(); g.moveTo(-size * 0.9, 0); g.lineTo(size * 0.9, 0); g.stroke()
      g.restore()
      return c
    }
    for (let i = 0; i < 3; i++) starSprites.push(createStarSprite(6 + i * 3, (6 + i * 3) * 3))

    const comets = []
    const MAX_COMETS = 18
    const COMET_PALETTES = [
      { head: '#fff8e0', mid: '#ffd700', tail: 'rgba(199,139,30,0)' },
      { head: '#fffbe6', mid: '#f5a623', tail: 'rgba(160,101,26,0)' },
      { head: '#ffffff', mid: '#ffeaa7', tail: 'rgba(199,139,30,0)' },
      { head: '#fff0d0', mid: '#e8941a', tail: 'rgba(139,94,15,0)' },
    ]
    function createComet() {
      const baseAngle = -Math.PI * 0.25, angle = baseAngle + rand(-0.25, 0.25)
      const speed = rand(14, 28), vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed
      const edge = Math.random()
      let x, y
      if (edge < 0.6) { x = rand(-100, W * 0.5); y = H + rand(10, 150) }
      else { x = rand(-150, -10); y = rand(H * 0.3, H + 100) }
      const pal = COMET_PALETTES[(Math.random() * COMET_PALETTES.length) | 0]
      return { x, y, vx, vy, tailLen: rand(100, 260), w: rand(1.2, 3.2), alive: true, brightness: rand(0.6, 1), sparkTimer: 0, head: pal.head, mid: pal.mid, tail: pal.tail, spriteIdx: (Math.random() * 3) | 0 }
    }
    function updateComet(c) { c.x += c.vx; c.y += c.vy; c.sparkTimer++; if (c.sparkTimer % 3 === 0) spawnParticle(c.x, c.y); if (c.y < -300 || c.x > W + 300) c.alive = false }
    function drawComet(c) {
      const spd = Math.sqrt(c.vx * c.vx + c.vy * c.vy), dx = -c.vx / spd, dy = -c.vy / spd, tx = c.x + dx * c.tailLen, ty = c.y + dy * c.tailLen
      const gMid = ctx.createLinearGradient(c.x, c.y, tx, ty)
      gMid.addColorStop(0, c.mid); gMid.addColorStop(0.35, 'rgba(199,139,30,0.4)'); gMid.addColorStop(1, c.tail)
      ctx.globalAlpha = c.brightness * 0.55; ctx.strokeStyle = gMid; ctx.lineWidth = c.w * 3; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke()
      const gCore = ctx.createLinearGradient(c.x, c.y, tx, ty)
      gCore.addColorStop(0, c.head); gCore.addColorStop(0.2, c.mid); gCore.addColorStop(1, c.tail)
      ctx.globalAlpha = c.brightness; ctx.strokeStyle = gCore; ctx.lineWidth = c.w
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke()
      ctx.globalAlpha = 1
      const sprite = starSprites[c.spriteIdx], sz = sprite.width / 2
      ctx.globalAlpha = c.brightness; ctx.drawImage(sprite, c.x - sz, c.y - sz); ctx.globalAlpha = 1
    }

    const flashes = []
    function addFlash(x, y) { flashes.push({ x, y, r: 5, maxR: rand(50, 100), a: 0.35 }) }
    function updateAndDrawFlashes() {
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i]; f.r += 4; f.a *= 0.88
        if (f.r > f.maxR || f.a < 0.008) { flashes.splice(i, 1); continue }
        ctx.globalAlpha = f.a; ctx.fillStyle = '#ffd700'
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    let spawnTimer = 0, nextSpawn = rand(4, 14), frame = 0
    function loop() {
      frame++
      ctx.drawImage(staticCanvas, 0, 0)
      drawStars(frame)
      spawnTimer++
      if (spawnTimer >= nextSpawn) {
        if (comets.length < MAX_COMETS) { const c = createComet(); comets.push(c); addFlash(c.x, c.y) }
        if (Math.random() < 0.3 && comets.length < MAX_COMETS) comets.push(createComet())
        if (Math.random() < 0.1 && comets.length < MAX_COMETS) comets.push(createComet())
        spawnTimer = 0; nextSpawn = rand(4, 14)
      }
      updateAndDrawParticles()
      for (let i = comets.length - 1; i >= 0; i--) { updateComet(comets[i]); if (!comets[i].alive) comets.splice(i, 1) }
      for (let i = 0; i < comets.length; i++) drawComet(comets[i])
      updateAndDrawFlashes()
      ctx.globalAlpha = 0.012; ctx.fillStyle = '#ffd700'
      ctx.beginPath(); ctx.arc(mx, my, 180, 0, 6.2832); ctx.fill()
      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    loop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} id="cosmos" className="fixed inset-0 w-full h-full" style={{ background: '#020208' }} />
}
