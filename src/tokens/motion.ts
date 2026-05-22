export const spring = {
  card:   { type: 'spring' as const, stiffness: 280, damping: 28 },
  pop:    { type: 'spring' as const, stiffness: 400, damping: 20 },
  bounce: { type: 'spring' as const, stiffness: 500, damping: 22 },
}

export const ease = {
  out:   [0.0, 0.0, 0.2, 1.0] as const,
  inOut: [0.4, 0.0, 0.2, 1.0] as const,
}

export const stagger = (i: number, baseMs = 40) => i * baseMs / 1000

export const dur = {
  xs:   0.15,
  sm:   0.20,
  md:   0.25,
  lg:   0.30,
  xl:   0.40,
  ring: 0.60,
}
