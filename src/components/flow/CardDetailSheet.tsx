import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import type { TimelineEntry, FlowEngine } from '../../hooks/useFlowEngine'
import { TimelineEntryExpanded } from '../timeline/TimelineEntryExpanded'
import { ImageSlot } from '../timeline/ImageSlot'

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
    default: return entry.ghostHeadline
  }
}

// Detect whether we're on desktop (≥ 768px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

interface Props {
  entry: TimelineEntry | null
  flow: FlowEngine
  onClose: () => void
}

export function CardDetailSheet({ entry, flow, onClose }: Props) {
  const controls = useDragControls()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()

  // Close on Escape
  useEffect(() => {
    if (!entry) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [entry, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (entry) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [entry])

  const title = entry ? (entry.enrichedWith?.name ?? entryTitle(entry)) : ''
  const displayHero = entry
    ? (entry.enrichedWith?.imageHero ?? entry.enrichedWith?.imageThumb ?? entry.imageHero ?? entry.imageThumb)
    : null
  const displayGradient = entry ? (entry.enrichedWith?.gradientFallback ?? entry.gradientFallback) : ''

  const mobileVariants = {
    initial: { y: '100%', opacity: 1 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 1 },
  }
  const desktopVariants = {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 },
  }
  const variants = isDesktop ? desktopVariants : mobileVariants

  return (
    <AnimatePresence>
      {entry && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={scrollRef}
            {...(!isDesktop ? {
              drag: 'y' as const,
              dragControls: controls,
              dragConstraints: { top: 0, bottom: 0 },
              dragElastic: { top: 0, bottom: 0.4 },
              onDragEnd: (_: unknown, info: { offset: { y: number } }) => {
                if (info.offset.y > 80) onClose()
              },
            } : {})}
            className={[
              'fixed z-50 bg-surface-0 border border-border flex flex-col overflow-hidden',
              // Mobile: bottom sheet
              'bottom-0 left-0 right-0 rounded-t-3xl',
              // Desktop: centered dialog
              'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto',
              'md:w-[480px] md:rounded-3xl md:shadow-2xl',
            ].join(' ')}
            style={{ maxHeight: isDesktop ? '80vh' : '90vh' }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: isDesktop ? 0.26 : 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden pointer-events-none">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 md:pt-4 shrink-0">
              <h2 className="text-on-surface font-bold text-[16px] leading-tight line-clamp-1 flex-1 mr-3">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-3 hover:bg-surface-2 flex items-center justify-center text-on-dim hover:text-on-surface transition-colors shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Hero image */}
            {(displayHero || displayGradient) && entry && (
              <div className="relative mx-4 mb-3 rounded-xl overflow-hidden shrink-0" style={{ aspectRatio: '16/9' }}>
                <ImageSlot
                  src={displayHero}
                  alt={title}
                  gradient={displayGradient}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {entry && (
                <TimelineEntryExpanded
                  entry={entry}
                  onCollapse={onClose}
                  onPartyChange={size => flow.setPartySize(entry.id, size)}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
