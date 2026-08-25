import { motion } from 'motion/react'

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* base dark */}
      <div className="absolute inset-0 bg-deep-black" />

      {/* orb 1 - crimson */}
      <motion.div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[90px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(220,20,60,0.45) 0%, rgba(139,0,0,0.18) 55%, transparent 75%)' }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* orb 2 - gold */}
      <motion.div
        className="absolute -bottom-40 -right-32 w-[640px] h-[640px] rounded-full blur-[100px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.5) 0%, rgba(244,169,0,0.12) 55%, transparent 75%)' }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 30, 0], scale: [1, 1.06, 1.02, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* orb 3 - deep rose */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[480px] rounded-full blur-[110px] opacity-15"
        style={{ background: 'radial-gradient(ellipse, rgba(180,20,50,0.25) 0%, transparent 70%)' }}
        animate={{ x: ['-50%', '-48%', '-52%', '-50%'], y: ['-50%', '-52%', '-48%', '-50%'], rotate: [0, 3, -2, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    </div>
  )
}
