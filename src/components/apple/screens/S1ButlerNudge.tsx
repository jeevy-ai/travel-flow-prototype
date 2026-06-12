import { motion } from 'framer-motion'

interface Props {
  onSetItUp: () => void
  onNotNow: () => void
}

export function S1ButlerNudge({ onSetItUp, onNotNow }: Props) {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Full-viewport Lisbon photograph */}
      <div className="absolute inset-0">
        <img
          src="/fixture-images/city-lisbon.webp"
          alt="Lisbon cityscape"
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(0.85)' }}
        />
        {/* Dark gradient overlay — bottom third */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)' }}
        />
      </div>

      {/* Content at bottom third */}
      <div className="relative flex flex-col flex-1 justify-end">
        <motion.div
          className="px-6 pb-4"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.15 }}
        >
          <p className="text-white/60 text-[13px] mb-1 tracking-wide">
            Web Summit 2026 · Lisbon
          </p>
          <h1 className="text-white font-semibold text-[28px] leading-tight tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Your trip isn't booked yet.
          </h1>
        </motion.div>

        {/* Sticky CTA bar */}
        <motion.div
          className="relative px-5 pt-4 pb-8 flex flex-col gap-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.22 }}
        >
          <button
            onClick={onSetItUp}
            className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
            style={{ background: 'var(--text-primary)' }}
          >
            Set it up
          </button>
          <button
            onClick={onNotNow}
            className="w-full py-3 text-center text-[15px] font-medium transition-opacity active:opacity-60"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Not now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
