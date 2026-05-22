import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineEntry, FlowEngine } from '../../hooks/useFlowEngine'
import { ImageSlot } from '../timeline/ImageSlot'
import { TimelineEntryExpanded } from '../timeline/TimelineEntryExpanded'

const ENTRY_ICONS: Record<string, string> = {
  flight_outbound: '✈',
  flight_return: '✈',
  hotel: '🏨',
  conference_venue: '🎙',
  conference_session: '📋',
  reminders: '🔔',
  restaurant: '🍽',
  activity: '🌟',
  ride: '🚗',
}

function entryTitle(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'flight_outbound': return 'SFO → LIS · Outbound'
    case 'flight_return': return 'LIS → SFO · Return'
    case 'hotel': return 'Marriott Lisbon'
    case 'conference_venue': return 'Altice Arena'
    case 'conference_session': return String(entry.data['title'] ?? entry.ghostHeadline)
    case 'reminders': return 'Reminders & packing'
    case 'restaurant': return String(entry.data['name'] ?? entry.ghostHeadline)
    case 'activity': return String(entry.data['name'] ?? entry.ghostHeadline)
    case 'ride': {
      const from = String(entry.data['from'] ?? '').split('(')[0].split(',')[0].trim()
      const to = String(entry.data['to'] ?? '').split('(')[0].split(',')[0].trim()
      return `${from} → ${to}`
    }
    default: return entry.ghostHeadline
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const match = iso.match(/T(\d{2}):(\d{2})/)
  if (!match) return '—'
  return `${match[1]}:${match[2]}`
}

const SCREEN_FOR_ENTRY: Record<string, number> = {
  flt_outbound: 2,
  flt_return: 2,
  hotel_main: 3,
  'WS2026-K01': 4,
  'WS2026-K02': 4,
  'WS2026-K08': 4,
  'WS2026-W07': 4,
  reminders: 6,
}

function StatusChip({ entry }: { entry: TimelineEntry }) {
  switch (entry.state) {
    case 'proposed':
      return (
        <span className="text-[10px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          Jeevy's pick ❆
        </span>
      )
    case 'confirmed':
      return (
        <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          ✓ Confirmed
        </span>
      )
    case 'calendar-synced':
      return (
        <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          ✓ Synced
        </span>
      )
    case 'self-managed':
      return (
        <span className="text-[10px] font-semibold text-on-dim bg-surface-3 px-2 py-0.5 rounded-full whitespace-nowrap">
          ✋ Self-managed
        </span>
      )
    case 'custom-pending':
      return (
        <span className="text-[10px] font-semibold text-[#c084fc] bg-[#c084fc]/10 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[160px] truncate" title={entry.customOverrideText}>
          ✎ {entry.customOverrideText || 'Custom option'}
        </span>
      )
    default:
      return null
  }
}

// ── Dismiss sheet ─────────────────────────────────────────────────────────────
interface DismissSheetProps {
  onSelf: () => void
  onCustom: (text: string) => void
  onClose: () => void
}

function DismissSheet({ onSelf, onCustom, onClose }: DismissSheetProps) {
  const [mode, setMode] = useState<'menu' | 'custom'>('menu')
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCustomMode = () => {
    setMode('custom')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSubmit = () => {
    if (text.trim()) onCustom(text.trim())
  }

  return (
    <motion.div
      className="border-t border-border bg-surface-2 px-3 py-3"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {mode === 'menu' ? (
        <div className="space-y-1.5">
          <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">Override this entry</p>
          <button
            onClick={onSelf}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-3 hover:bg-surface-3/80 border border-border text-left transition-colors"
          >
            <span className="text-base">✋</span>
            <div>
              <p className="text-on-surface text-[12px] font-semibold">I'll handle it myself</p>
              <p className="text-on-dim text-[11px]">Mark as self-managed — Jeevy won't book or track this</p>
            </div>
          </button>
          <button
            onClick={handleCustomMode}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-3 hover:bg-surface-3/80 border border-border text-left transition-colors"
          >
            <span className="text-base">✎</span>
            <div>
              <p className="text-on-surface text-[12px] font-semibold">Different option…</p>
              <p className="text-on-dim text-[11px]">Describe what you want — Jeevy will enrich it</p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="text-on-dim text-[11px] hover:text-on-surface transition-colors mt-1 px-1"
          >
            ✕ Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide">Describe your preference</p>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="e.g. book a taxi instead, or stay an extra night…"
            className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-on-surface text-[12px] placeholder:text-on-dim/40 outline-none focus:border-accent transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="flex-1 bg-accent text-white text-[12px] font-semibold py-1.5 rounded-lg disabled:opacity-40 transition-opacity"
            >
              Enrich →
            </button>
            <button
              onClick={() => setMode('menu')}
              className="px-3 text-on-dim text-[12px] hover:text-on-surface transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface Props {
  entry: TimelineEntry
  flow: FlowEngine
  staggerIndex: number
  isActive?: boolean
  onActivate?: (id: string) => void
  onDeactivate?: () => void
}

export function CompactEntryRow({ entry, flow, staggerIndex, isActive = false, onActivate, onDeactivate }: Props) {
  const [dismissOpen, setDismissOpen] = useState(false)
  const isProposed = entry.state === 'proposed'
  const isConfirmed = entry.state === 'confirmed' || entry.state === 'calendar-synced'
  const isDismissed = entry.state === 'self-managed' || entry.state === 'custom-pending'
  const hasConflict = entry.id === 'WS2026-K08' && Boolean(entry.data['conflictDetected']) && !flow.conflictResolved
  const swapScreen = SCREEN_FOR_ENTRY[entry.id]
  const time = formatTime(entry.scheduledAt)
  const canDismiss = !isDismissed && !flow.confirmingAll && !flow.allConfirmed

  const handleSelf = () => {
    flow.dismissEntry(entry.id, 'self')
    setDismissOpen(false)
  }

  const handleCustom = (text: string) => {
    flow.dismissEntry(entry.id, 'custom', text)
    setDismissOpen(false)
  }

  return (
    <motion.div
      data-entry-id={entry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: staggerIndex * 0.04 }}
    >
      <div
        className={`rounded-xl overflow-hidden border bg-surface-1 transition-colors duration-300 ${
          isDismissed ? 'border-border opacity-60' :
          isActive ? 'border-accent/60 ring-1 ring-accent/20' :
          isConfirmed ? 'border-success/30' :
          hasConflict ? 'border-warning/50' : 'border-border'
        }`}
      >
        {/* Compact row — ~80px tall */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          onClick={() => {
            if (dismissOpen) return
            if (isActive) {
              onDeactivate?.()
            } else {
              onActivate?.(entry.id)
            }
          }}
        >
          {/* Time gutter */}
          <div className="w-11 shrink-0 text-right">
            <span className="text-on-dim text-[11px] font-mono leading-tight block">{time}</span>
            <span className="text-on-dim/50 text-[14px]">{ENTRY_ICONS[entry.type] ?? '📍'}</span>
          </div>

          {/* Thumbnail */}
          <div className={`w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden ${isDismissed ? 'grayscale' : ''}`}>
            <ImageSlot
              src={entry.imageThumb}
              alt={entryTitle(entry)}
              gradient={entry.gradientFallback}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`font-semibold text-[13px] leading-tight line-clamp-2 ${isDismissed ? 'text-on-dim line-through' : 'text-on-surface'}`}>
                {entryTitle(entry)}
              </p>
              {hasConflict && (
                <span className="text-warning text-[10px] font-bold shrink-0">⚠ Conflict</span>
              )}
            </div>
            <p className="text-on-dim text-[11px] mt-0.5 truncate">{entry.tagline}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusChip entry={entry} />
              {isProposed && swapScreen && !flow.confirmingAll && !flow.allConfirmed && (
                <button
                  onClick={e => { e.stopPropagation(); flow.startEditScreen(swapScreen) }}
                  className="text-[10px] font-medium text-on-dim bg-surface-2 hover:bg-surface-3 px-2 py-0.5 rounded-full border border-border transition-colors"
                >
                  ⇄ Swap
                </button>
              )}
              {isConfirmed && swapScreen && (
                <button
                  onClick={e => { e.stopPropagation(); flow.startEditScreen(swapScreen) }}
                  className="text-[10px] font-medium text-on-dim bg-surface-2 hover:bg-surface-3 px-2 py-0.5 rounded-full border border-border transition-colors"
                >
                  ✏ Edit
                </button>
              )}
              {canDismiss && (
                <button
                  onClick={e => { e.stopPropagation(); setDismissOpen(v => !v); onDeactivate?.() }}
                  className="text-[10px] font-medium text-on-dim/60 hover:text-on-dim px-1.5 py-0.5 rounded-full transition-colors"
                  title="Override this entry"
                >
                  ···
                </button>
              )}
              {isDismissed && (
                <button
                  onClick={e => { e.stopPropagation(); flow.restoreEntry(entry.id) }}
                  className="text-[10px] font-medium text-on-dim/40 hover:text-on-dim px-1.5 py-0.5 rounded-full transition-colors"
                  title="Undo override"
                >
                  ↩ Undo
                </button>
              )}
            </div>
          </div>

          {/* Expand chevron */}
          {!isDismissed && (
            <span
              className="text-on-dim text-[18px] shrink-0 transition-transform duration-200"
              style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              ›
            </span>
          )}
        </div>

        {/* Dismiss sheet */}
        <AnimatePresence>
          {dismissOpen && canDismiss && (
            <DismissSheet
              onSelf={handleSelf}
              onCustom={handleCustom}
              onClose={() => setDismissOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Expanded detail — full hero + accordion */}
        <AnimatePresence>
          {isActive && !isDismissed && (
            <>
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  <ImageSlot
                    src={entry.imageHero ?? entry.imageThumb}
                    alt={entryTitle(entry)}
                    gradient={entry.gradientFallback}
                    className="w-full h-full"
                  />
                  {hasConflict && !flow.conflictResolved && (
                    <div className="absolute top-2 left-2">
                      <button
                        onClick={() => flow.startEditScreen(5)}
                        className="bg-warning/90 text-black text-[10px] font-bold px-2 py-1 rounded-md"
                      >
                        ⚠ Schedule conflict — Resolve →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
              <TimelineEntryExpanded
                entry={entry}
                onCollapse={() => onDeactivate?.()}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
