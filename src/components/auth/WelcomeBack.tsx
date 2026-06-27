import { motion } from 'framer-motion'
import type { ButlerProfile } from '../../lib/butlerApi'

interface Props {
  profile: ButlerProfile
  onDismiss: () => void
}

function prefBadge(label: string) {
  return (
    <span
      key={label}
      className="text-[11px] px-2 py-0.5 rounded-full"
      style={{
        background: 'rgba(28,110,242,0.12)',
        color: 'var(--accent)',
        border: '1px solid rgba(28,110,242,0.2)',
      }}
    >
      {label}
    </span>
  )
}

export function WelcomeBack({ profile, onDismiss }: Props) {
  const lastTrip = profile.tripHistory[profile.tripHistory.length - 1]
  const interests = profile.preferences.interests.slice(0, 3)
  const hasPrefs = interests.length > 0 || profile.preferences.homeAirport

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-5 mb-3 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white/50 text-[11px] tracking-widest uppercase font-mono mb-0.5">
              Welcome back
            </p>
            <p className="text-white font-semibold text-[16px] leading-tight">
              {profile.firstName || 'Traveller'}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/70 transition-colors mt-0.5"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Last trip */}
        {lastTrip && (
          <div
            className="mt-2.5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Last trip</p>
            <p className="text-white text-[13px] font-medium leading-snug">{lastTrip.destination}</p>
            <p className="text-white/50 text-[11px]">{lastTrip.dates}</p>
          </div>
        )}

        {/* Preferences badges */}
        {hasPrefs && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {profile.preferences.homeAirport && prefBadge(`✈ ${profile.preferences.homeAirport}`)}
            {interests.map(i => prefBadge(i))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
