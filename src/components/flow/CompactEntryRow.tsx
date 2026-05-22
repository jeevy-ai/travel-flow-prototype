import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineEntry, FlowEngine, AlternativeOption, EntryType } from '../../hooks/useFlowEngine'
import { ImageSlot } from '../timeline/ImageSlot'
import { TimelineEntryExpanded } from '../timeline/TimelineEntryExpanded'

// ── Entry title ────────────────────────────────────────────────────────────────

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

// ── Provider badge ─────────────────────────────────────────────────────────────

const PROVIDER_CONFIG: Record<EntryType, { bg: string; label?: string; emoji?: string }> = {
  ride:               { bg: '#1CC760', label: 'BOLT' },
  restaurant:         { bg: '#C05621', emoji: '🍽' },
  activity:           { bg: '#553C9A', emoji: '🌟' },
  hotel:              { bg: '#C4956A', emoji: '🏨' },
  flight_outbound:    { bg: '#2B6CB0', emoji: '✈' },
  flight_return:      { bg: '#2B6CB0', emoji: '✈' },
  conference_venue:   { bg: '#434FC0', emoji: '🎙' },
  conference_session: { bg: '#38B2AC', emoji: '📋' },
  reminders:          { bg: '#38A169', emoji: '🔔' },
}

function ProviderBadge({ entry }: { entry: TimelineEntry }) {
  const cfg = PROVIDER_CONFIG[entry.type]
  if (!cfg) return null
  return (
    <div
      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
      style={{ background: cfg.bg }}
    >
      {cfg.label
        ? <span className="text-[9px] font-black text-white tracking-tight">{cfg.label}</span>
        : <span className="text-[15px]">{cfg.emoji}</span>
      }
    </div>
  )
}

// ── Info strip (static facts: time · duration · price) ────────────────────────

function InfoStrip({ entry }: { entry: TimelineEntry }) {
  const d = entry.data
  const time = formatTime(entry.scheduledAt)
  const items: string[] = []

  switch (entry.type) {
    case 'ride':
      items.push(`🕗 ${time}`)
      if (d['duration']) items.push(String(d['duration']))
      if (d['cost']) items.push(String(d['cost']))
      break
    case 'restaurant':
      items.push(`🕗 ${time}`)
      if (d['priceRange']) items.push(String(d['priceRange']).split(' · ')[0])
      if (d['distanceFromHotel']) items.push(String(d['distanceFromHotel']).split(' · ')[0])
      break
    case 'activity':
      items.push(`🕗 ${time}`)
      if (d['duration']) items.push(String(d['duration']))
      if (d['cost']) items.push(String(d['cost']).split('+')[0].trim())
      break
    case 'hotel':
      items.push('Nov 10–12 · 2 nights')
      if (d['pricePerNight']) items.push(`$${d['pricePerNight']}/night`)
      if (d['distanceToVenue']) items.push(String(d['distanceToVenue']))
      break
    case 'flight_outbound':
    case 'flight_return':
      items.push(`🕗 ${time}`)
      if (d['duration']) items.push(String(d['duration']))
      if (d['fare']) items.push(String(d['fare']))
      break
    case 'conference_session':
      items.push(`🕗 ${time}`)
      if (d['room']) items.push(String(d['room']))
      break
    default:
      items.push(`🕗 ${time}`)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.filter(Boolean).map((item, i) => (
        <span key={i} className="text-on-dim text-[11px] flex items-center">
          {i > 0 && <span className="text-on-dim/30 mx-1">·</span>}
          {item}
        </span>
      ))}
    </div>
  )
}

// ── Status chip ────────────────────────────────────────────────────────────────

function StatusChip({ entry }: { entry: TimelineEntry }) {
  switch (entry.state) {
    case 'proposed':
      return (
        <span className="text-[10px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          Jeevy's pick ❆
        </span>
      )
    case 'confirmed':
      if (entry.enrichedWith) {
        return (
          <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            ✦ Enriched by Jeevy
          </span>
        )
      }
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
        <span className="text-[10px] font-semibold text-[#c084fc] bg-[#c084fc]/10 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[160px] truncate"
          title={entry.customOverrideText}>
          ✎ {entry.customOverrideText || 'Custom option'}
        </span>
      )
    default:
      return null
  }
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

// ── Dismiss sheet ──────────────────────────────────────────────────────────────

interface DismissSheetProps {
  onSelf: () => void
  onCustom: (text: string) => void
  onEnrich: (alt: AlternativeOption) => void
  onClose: () => void
  alternatives?: AlternativeOption[]
}

function DismissSheet({ onSelf, onCustom, onEnrich, onClose, alternatives }: DismissSheetProps) {
  const [mode, setMode] = useState<'menu' | 'alternatives' | 'custom'>('menu')
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDifferentOption = () => {
    if (alternatives && alternatives.length > 0) setMode('alternatives')
    else goCustom()
  }

  const goCustom = () => {
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
      {mode === 'menu' && (
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
            onClick={handleDifferentOption}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-3 hover:bg-surface-3/80 border border-border text-left transition-colors"
          >
            <span className="text-base">✦</span>
            <div>
              <p className="text-on-surface text-[12px] font-semibold">Different option…</p>
              <p className="text-on-dim text-[11px]">Pick an alternative or describe what you want</p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="text-on-dim text-[11px] hover:text-on-surface transition-colors mt-1 px-1"
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {mode === 'alternatives' && alternatives && (
        <div className="space-y-1.5">
          <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">Jeevy's alternatives</p>
          {alternatives.map(alt => (
            <button
              key={alt.id}
              onClick={() => onEnrich(alt)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-3 hover:bg-surface-3/80 border border-border text-left transition-colors group"
            >
              <div
                className="w-12 h-12 rounded-lg shrink-0 overflow-hidden"
                style={{ background: alt.gradientFallback }}
              >
                {alt.imageThumb && (
                  <img src={alt.imageThumb} alt={alt.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-[12px] font-semibold leading-tight">{alt.name}</p>
                <p className="text-on-dim text-[10px] mt-0.5 line-clamp-1">{alt.tagline}</p>
              </div>
              <span className="text-on-dim/40 text-[16px] group-hover:text-accent transition-colors shrink-0">›</span>
            </button>
          ))}
          <button
            onClick={goCustom}
            className="w-full text-left text-on-dim text-[11px] hover:text-accent transition-colors px-2 py-1.5 flex items-center gap-1.5"
          >
            <span>✎</span>
            <span>Type your own option…</span>
          </button>
          <button
            onClick={() => setMode('menu')}
            className="text-on-dim text-[11px] hover:text-on-surface transition-colors px-1"
          >
            ← Back
          </button>
        </div>
      )}

      {mode === 'custom' && (
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
              onClick={() => alternatives ? setMode('alternatives') : setMode('menu')}
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

// ── CompactEntryRow ────────────────────────────────────────────────────────────

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
  const canDismiss = !isDismissed && !flow.confirmingAll && !flow.allConfirmed

  const handleSelf = () => { flow.dismissEntry(entry.id, 'self'); setDismissOpen(false) }
  const handleCustom = (text: string) => { flow.dismissEntry(entry.id, 'custom', text); setDismissOpen(false) }
  const handleEnrich = (alt: AlternativeOption) => { flow.enrichEntry(entry.id, alt); setDismissOpen(false) }

  const displayThumb = entry.enrichedWith?.imageThumb ?? entry.imageThumb
  const displayHero = entry.enrichedWith?.imageHero ?? entry.enrichedWith?.imageThumb ?? entry.imageHero ?? entry.imageThumb
  const displayGradient = entry.enrichedWith?.gradientFallback ?? entry.gradientFallback

  const handleRowClick = () => {
    if (dismissOpen) return
    if (isActive) onDeactivate?.()
    else onActivate?.(entry.id)
  }

  return (
    <motion.div
      data-entry-id={entry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: staggerIndex * 0.04 }}
    >
      <div
        className={`rounded-xl overflow-hidden border bg-surface-1 flex flex-col transition-colors duration-300 ${
          isDismissed ? 'border-border opacity-60' :
          isActive ? 'border-accent/60 ring-1 ring-accent/20' :
          isConfirmed ? 'border-success/30' :
          hasConflict ? 'border-warning/50' : 'border-border'
        }`}
      >
        {/* Main row — info left, image right */}
        <div className="flex cursor-pointer min-h-[80px]" onClick={handleRowClick}>
          {/* Left: provider badge + title + info strip + actions */}
          <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between gap-1">
            {/* Title row */}
            <div className="flex items-start gap-2">
              <ProviderBadge entry={entry} />
              <p className={`flex-1 font-semibold text-[13px] leading-tight line-clamp-2 ${isDismissed ? 'text-on-dim line-through' : 'text-on-surface'}`}>
                {entry.enrichedWith?.name ?? entryTitle(entry)}
              </p>
              {hasConflict && (
                <span className="text-warning text-[10px] font-bold shrink-0">⚠</span>
              )}
              {!isDismissed && (
                <span
                  className="text-on-dim text-[18px] shrink-0 transition-transform duration-200"
                  style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >›</span>
              )}
            </div>

            {/* Info strip */}
            <InfoStrip entry={entry} />

            {/* Status + action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
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
              {(isDismissed || entry.enrichedWith) && (
                <button
                  onClick={e => { e.stopPropagation(); flow.restoreEntry(entry.id) }}
                  className="text-[10px] font-medium text-on-dim/40 hover:text-on-dim px-1.5 py-0.5 rounded-full transition-colors"
                  title="Undo"
                >
                  ↩ Undo
                </button>
              )}
            </div>
          </div>

          {/* Right: image panel */}
          <div className={`w-[88px] shrink-0 self-stretch ${isDismissed ? 'grayscale opacity-50' : ''}`}>
            <ImageSlot
              src={displayThumb}
              alt={entry.enrichedWith?.name ?? entryTitle(entry)}
              gradient={displayGradient}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Dismiss sheet */}
        <AnimatePresence>
          {dismissOpen && canDismiss && (
            <DismissSheet
              onSelf={handleSelf}
              onCustom={handleCustom}
              onEnrich={handleEnrich}
              onClose={() => setDismissOpen(false)}
              alternatives={entry.alternatives}
            />
          )}
        </AnimatePresence>

        {/* Expanded detail — hero + accordion */}
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
                    src={displayHero}
                    alt={entry.enrichedWith?.name ?? entryTitle(entry)}
                    gradient={displayGradient}
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
