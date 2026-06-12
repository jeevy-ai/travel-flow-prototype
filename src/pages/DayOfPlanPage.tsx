import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function DayOfPlanPage() {
  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'var(--text-primary)' }}
    >
      {/* Subtle background photo — desaturated and dark */}
      <div className="absolute inset-0">
        <img
          src="/fixture-images/city-lisbon.webp"
          alt="Lisbon"
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(0.15) brightness(0.35)', transform: 'scale(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col flex-1 justify-center px-8 mx-auto w-full" style={{ maxWidth: 430 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          <p className="text-[16px] mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Good morning, Alex.
          </p>

          <p
            className="font-semibold leading-none mb-4"
            style={{
              fontSize: '48px',
              color: 'white',
              letterSpacing: '-0.03em',
            }}
          >
            Leave by<br />06:30
          </p>

          <p className="text-[16px] mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            UA88 · SFO → LIS · Terminal 2
          </p>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            2h 30m to departure
          </p>
        </motion.div>
      </div>

      {/* Bottom link */}
      <motion.div
        className="relative pb-12 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, delay: 0.15 }}
      >
        <Link
          to="/"
          className="text-[15px] font-medium transition-opacity active:opacity-60"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Open full itinerary
        </Link>
      </motion.div>
    </div>
  )
}
