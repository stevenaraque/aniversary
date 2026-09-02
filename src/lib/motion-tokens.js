export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    crawl: 0.8,
    glacial: 1.2,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 64,
    xxl: 128,
  },
  scale: {
    subtle: 0.98,
    normal: 1,
    pop: 1.05,
    burst: 1.15,
    press: 0.95,
  },
  easing: {
    smooth: [0.25, 0.1, 0.25, 1],
    snappy: [0.2, 0, 0, 1],
    elastic: [0.68, -0.55, 0.27, 1.55],
    bounce: [0.34, 1.56, 0.64, 1],
    // Strong custom curves (emilkowalski/skills) — built-in CSS easings are too weak
    easeOut: [0.23, 1, 0.32, 1],      // strong ease-out for UI enters/exits
    easeInOut: [0.77, 0, 0.175, 1],   // strong ease-in-out for on-screen movement
    drawer: [0.32, 0.72, 0, 1],       // iOS-like drawer curve (Ionic)
  },
}

export const springs = {
  gentle: { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
  snappy: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.6 },
  stiff: { type: 'spring', stiffness: 500, damping: 40, mass: 0.5 },
  release: { type: 'spring', stiffness: 200, damping: 25, mass: 1.2 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12, mass: 0.8 },
}

export const glassTokens = {
  blur: {
    subtle: 'blur(8px)',
    regular: 'blur(16px)',
    heavy: 'blur(24px)',
    ultra: 'blur(40px)',
  },
  tint: {
    crimson: 'rgba(139, 0, 0, 0.12)',
    crimsonHover: 'rgba(220, 20, 60, 0.18)',
    gold: 'rgba(244, 169, 0, 0.1)',
    dark: 'rgba(10, 10, 10, 0.7)',
    deeper: 'rgba(5, 5, 5, 0.85)',
  },
  border: {
    subtle: '1px solid rgba(255, 255, 255, 0.06)',
    regular: '1px solid rgba(255, 255, 255, 0.1)',
    prominent: '1px solid rgba(220, 20, 60, 0.2)',
    glow: '1px solid rgba(220, 20, 60, 0.4)',
  },
  shadow: {
    depth: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    glow: '0 0 30px rgba(139, 0, 0, 0.2), 0 0 60px rgba(139, 0, 0, 0.1)',
    float: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 0, 0, 0.15)',
    prism: '0 4px 20px rgba(220, 20, 60, 0.15), 0 8px 40px rgba(0, 0, 0, 0.3)',
  },
  refraction: {
    subtle: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(220,20,60,0.03) 100%)',
    prism: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(220,20,60,0.05) 25%, rgba(139,0,0,0.08) 50%, rgba(255,255,255,0.03) 75%, transparent 100%)',
    rainbow: 'linear-gradient(135deg, rgba(220,20,60,0.1) 0%, rgba(139,0,0,0.05) 33%, rgba(244,169,0,0.05) 66%, rgba(220,20,60,0.08) 100%)',
  },
}
