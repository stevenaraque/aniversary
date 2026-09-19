// springs es el único export con uso (7 componentes). motionTokens/glassTokens
// eliminados 2026-09-19: 0 imports, peso muerto.
export const springs = {
  gentle: { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
  snappy: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.6 },
  stiff: { type: 'spring', stiffness: 500, damping: 40, mass: 0.5 },
  release: { type: 'spring', stiffness: 200, damping: 25, mass: 1.2 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12, mass: 0.8 },
}
