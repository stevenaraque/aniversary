import { motion } from 'motion/react'

function GoldStar({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.9)) drop-shadow(0 0 12px rgba(212,175,55,0.4))' }}>
      <path d="M12 2L13.6 8.4L20 10L13.6 11.6L12 18L10.4 11.6L4 10L10.4 8.4Z" fill="#f9e076" stroke="#d4af37" strokeWidth="0.7" />
      <circle cx="12" cy="10" r="1.2" fill="white" opacity="0.95" />
    </svg>
  )
}

function Comet({ left, delay, duration, size, drift }) {
  return (
    <motion.div
      className="absolute flex items-center"
      style={{ left: `${left}%`, top: -40 }}
      initial={{ y: -40, opacity: 0, x: 0 }}
      animate={{ y: 1100, x: drift, opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      {/* cola neon */}
      <div
        className="h-px mr-1"
        style={{
          width: 54 + size * 6,
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0) 10%, rgba(212,175,55,0.55) 55%, rgba(249,224,118,0.9) 100%)',
          filter: 'blur(0.6px)',
          boxShadow: '0 0 8px rgba(212,175,55,0.5)',
        }}
      />
      <GoldStar size={size} />
    </motion.div>
  )
}

export default function AnimatedBackground() {
  const comets = [
    { left: 6, delay: 0, duration: 4.2, size: 11, drift: 80 },
    { left: 18, delay: 1.1, duration: 5, size: 9, drift: -60 },
    { left: 31, delay: 2.3, duration: 4.6, size: 12, drift: 70 },
    { left: 44, delay: 0.6, duration: 5.4, size: 10, drift: -50 },
    { left: 58, delay: 1.8, duration: 4, size: 13, drift: 90 },
    { left: 72, delay: 0.9, duration: 5.8, size: 9, drift: -70 },
    { left: 84, delay: 2.8, duration: 4.4, size: 11, drift: 60 },
    { left: 12, delay: 3.5, duration: 5.2, size: 8, drift: 40 },
    { left: 26, delay: 4.1, duration: 4.8, size: 10, drift: -30 },
    { left: 51, delay: 3.8, duration: 5.6, size: 12, drift: 55 },
    { left: 66, delay: 5, duration: 4.3, size: 9, drift: -45 },
    { left: 91, delay: 4.6, duration: 5, size: 10, drift: -80 },
    { left: 38, delay: 6, duration: 4.9, size: 8, drift: 35 },
    { left: 76, delay: 6.8, duration: 5.3, size: 11, drift: 65 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-deep-black" />

      {/* orbs más visibles */}
      <motion.div
        className="absolute -top-32 -left-32 w-130 h-130 rounded-full blur-[90px] opacity-45"
        style={{ background: 'radial-gradient(circle, rgba(220,20,60,0.55) 0%, rgba(139,0,0,0.22) 55%, transparent 75%)' }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -right-32 w-160 h-160 rounded-full blur-[100px] opacity-32"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.6) 0%, rgba(244,169,0,0.16) 55%, transparent 75%)' }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 30, 0], scale: [1, 1.06, 1.02, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-120 rounded-full blur-[110px] opacity-22"
        style={{ background: 'radial-gradient(ellipse, rgba(180,20,50,0.32) 0%, transparent 70%)' }}
        animate={{ x: ['-50%', '-48%', '-52%', '-50%'], y: ['-50%', '-52%', '-48%', '-50%'], rotate: [0, 3, -2, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* lluvia de cometas dorados neon */}
      {comets.map((c, i) => (
        <Comet key={i} {...c} />
      ))}

      {/* vignette */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    </div>
  )
}
