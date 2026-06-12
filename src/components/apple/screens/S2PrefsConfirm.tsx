import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  onLooksRight: () => void
  onEdit: () => void
}

const PREF_OPTIONS: Record<string, string[]> = {
  Airline:  ['Delta Airlines', 'United Airlines', 'TAP Air Portugal', 'British Airways'],
  Cabin:    ['Business', 'First', 'Premium Economy', 'Economy'],
  Seat:     ['Aisle', 'Window', 'Middle'],
  Hotel:    ['Marriott Bonvoy', 'Hilton', 'Hyatt', 'IHG', 'No preference'],
}

const INITIAL_PREFS = [
  { label: 'Airline', value: 'Delta Airlines' },
  { label: 'Cabin',   value: 'Business' },
  { label: 'Seat',    value: 'Aisle' },
  { label: 'Hotel',   value: 'Marriott Bonvoy' },
]

export function S2PrefsConfirm({ onLooksRight, onEdit }: Props) {
  const [prefs, setPrefs] = useState(INITIAL_PREFS)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<string | null>(null)

  function setPrefValue(label: string, value: string) {
    setPrefs(prev => prev.map(p => p.label === label ? { ...p, value } : p))
    setEditingLabel(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-8"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Your preferences.
        </motion.h1>

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 }}
        >
          {prefs.map((pref, i) => (
            <div
              key={pref.label}
              className={i < prefs.length - 1 ? 'border-b border-border' : ''}
            >
              <div className="w-full flex items-center justify-between px-5 py-4">
                <span className="text-[13px] text-on-faint">{pref.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[17px] font-semibold text-on-surface">{pref.value}</span>
                  <span className="text-on-faint text-[15px]">›</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        className="px-5 pb-10 pt-4 bg-surface-0 flex flex-col gap-3"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onLooksRight}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: 'var(--text-primary)' }}
        >
          Looks right
        </button>

        <button
          onClick={() => setCustomizeOpen(v => !v)}
          className="w-full text-center text-[14px] font-medium py-3 min-h-[44px] flex items-center justify-center transition-opacity active:opacity-60"
          style={{ color: 'var(--accent)' }}
        >
          Customize ›
        </button>

        <AnimatePresence>
          {customizeOpen && (
            <motion.div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {prefs.map((pref, i) => {
                const opts = PREF_OPTIONS[pref.label] ?? []
                const isEditing = editingLabel === pref.label

                return (
                  <div key={pref.label} className={i < prefs.length - 1 ? 'border-b border-border' : ''}>
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 active:bg-surface-2 transition-colors"
                      onClick={() => setEditingLabel(isEditing ? null : pref.label)}
                    >
                      <span className="text-[14px] text-on-dim">{pref.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-on-surface">{pref.value}</span>
                        <span
                          className="text-[13px] font-medium"
                          style={{ color: 'var(--accent)' }}
                        >
                          {isEditing ? 'Done' : 'Edit'}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="px-4 pb-3"
                        >
                          <div className="flex flex-wrap gap-2">
                            {opts.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setPrefValue(pref.label, opt)}
                                className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors min-h-[44px] flex items-center"
                                style={
                                  pref.value === opt
                                    ? { background: 'var(--text-primary)', color: 'var(--bg)' }
                                    : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }
                                }
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              <div className="px-5 py-3.5 border-t border-border">
                <button
                  onClick={() => setCustomizeOpen(false)}
                  className="text-[13px] text-on-dim transition-opacity active:opacity-60"
                >
                  Back to recommended
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onEdit}
          className="w-full py-3 min-h-[44px] flex items-center justify-center text-[15px] font-medium text-on-dim transition-opacity active:opacity-60"
        >
          Edit anything
        </button>
      </motion.div>
    </div>
  )
}
