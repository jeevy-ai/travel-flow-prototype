import { useState, useCallback, useMemo, useRef } from 'react'
import { soloTravelFixture } from '../data/fixture'
import { IMAGE_MANIFEST, GRADIENT_FALLBACKS } from '../data/imageManifest'

export type EntryState = 'ghost' | 'proposed' | 'confirmed' | 'calendar-synced' | 'day-of-active'

export type EntryType =
  | 'flight_outbound'
  | 'flight_return'
  | 'hotel'
  | 'conference_venue'
  | 'conference_session'
  | 'reminders'

export type TimelineEntry = {
  id: string
  type: EntryType
  state: EntryState
  imageThumb: string | null
  imageHero: string | null
  gradientFallback: string
  tagline: string
  ghostHeadline: string
  ghostSubtext: string
  data: Record<string, unknown>
}

function makeEntries(): TimelineEntry[] {
  const fix = soloTravelFixture
  return [
    {
      id: 'flt_outbound',
      type: 'flight_outbound',
      state: 'ghost',
      imageThumb: IMAGE_MANIFEST['flight_outbound']?.thumb ?? null,
      imageHero: IMAGE_MANIFEST['flight_outbound']?.hero ?? null,
      gradientFallback: GRADIENT_FALLBACKS['flight_outbound'],
      tagline: 'SFO → LIS · Nov 9 · Business Class · Direct',
      ghostHeadline: 'Outbound flight',
      ghostSubtext: 'Jeevy is finding the best option for Nov 9 →',
      data: {
        venue: fix.flightOutbound.result.payload.venue,
        datetime: fix.flightOutbound.result.payload.datetime,
        slot: fix.flightOutbound.result.payload.slot,
        aircraft: fix.flightOutbound.result.payload.aircraft,
        duration: fix.flightOutbound.result.payload.duration,
        stops: fix.flightOutbound.result.payload.stops,
        fare: fix.flightOutbound.result.payload.fare,
        changeFee: fix.flightOutbound.result.payload.changeFee,
        platinumApplied: fix.flightOutbound.result.payload.platinumApplied,
        calendarAddLink: fix.flightOutbound.result.payload.calendarAddLink,
        confidence: fix.flightOutbound.confidence,
        fallbacks: fix.flightOutbound.result.payload.fallbacks,
        rationale: fix.flightOutbound.result.payload.rationale,
      },
    },
    {
      id: 'flt_return',
      type: 'flight_return',
      state: 'ghost',
      imageThumb: IMAGE_MANIFEST['flight_return']?.thumb ?? null,
      imageHero: IMAGE_MANIFEST['flight_return']?.hero ?? null,
      gradientFallback: GRADIENT_FALLBACKS['flight_return'],
      tagline: 'LIS → SFO · Nov 12 · Business Class · Direct',
      ghostHeadline: 'Return flight',
      ghostSubtext: 'Will appear once your outbound is set',
      data: {
        venue: fix.flightReturn.result.payload.venue,
        datetime: fix.flightReturn.result.payload.datetime,
        slot: fix.flightReturn.result.payload.slot,
        aircraft: fix.flightReturn.result.payload.aircraft,
        duration: fix.flightReturn.result.payload.duration,
        stops: fix.flightReturn.result.payload.stops,
        fare: fix.flightReturn.result.payload.fare,
        changeFee: fix.flightReturn.result.payload.changeFee,
        platinumApplied: fix.flightReturn.result.payload.platinumApplied,
        calendarAddLink: fix.flightReturn.result.payload.calendarAddLink,
        confidence: fix.flightReturn.confidence,
        fallbacks: fix.flightReturn.result.payload.fallbacks,
        rationale: fix.flightReturn.result.payload.rationale,
      },
    },
    {
      id: 'hotel_main',
      type: 'hotel',
      state: 'ghost',
      imageThumb: IMAGE_MANIFEST['hotel']?.thumb ?? null,
      imageHero: IMAGE_MANIFEST['hotel']?.hero ?? null,
      gradientFallback: GRADIENT_FALLBACKS['hotel'],
      tagline: 'Marriott Lisbon · Nov 10–12 · Avenida dos Combatentes',
      ghostHeadline: 'Your Lisbon hotel',
      ghostSubtext: 'Marriott Bonvoy, close to the venue',
      data: {
        venue: fix.hotel.result.payload.venue,
        slot: fix.hotel.result.payload.slot,
        chain: fix.hotel.result.payload.chain,
        memberTier: fix.hotel.result.payload.memberTier,
        amenities: fix.hotel.result.payload.amenities,
        cancellationPolicy: fix.hotel.result.payload.cancellationPolicy,
        distanceToVenue: fix.hotel.result.payload.distanceToVenue,
        pricePerNight: fix.hotel.result.payload.pricePerNight,
        totalPrice: fix.hotel.result.payload.totalPrice,
        currency: fix.hotel.result.payload.currency,
        loyaltyPoints: fix.hotel.result.payload.loyaltyPoints,
        calendarAddLink: fix.hotel.result.payload.calendarAddLink,
        rationale: fix.hotel.result.payload.rationale,
        confirmationNumber: fix.hotel.result.payload.confirmationNumber,
        confidence: fix.hotel.confidence,
        warnings: fix.hotel.warnings,
      },
    },
    ...fix.sessions.map(s => ({
      id: s.sessionId,
      type: 'conference_session' as EntryType,
      state: 'ghost' as EntryState,
      imageThumb: IMAGE_MANIFEST[s.sessionId]?.thumb ?? null,
      imageHero: IMAGE_MANIFEST[s.sessionId]?.hero ?? null,
      gradientFallback: GRADIENT_FALLBACKS['conference_session'],
      tagline: `${s.speaker} · ${new Date(s.startIso).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} · ${s.room}`,
      ghostHeadline:
        s.sessionId === 'WS2026-K01' ? 'Morning keynote'
        : s.sessionId === 'WS2026-K02' ? 'Future of Work panel'
        : s.sessionId === 'WS2026-W07' ? 'Strategy workshop'
        : 'Closing keynote',
      ghostSubtext: `${s.speaker} · ${new Date(s.startIso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} WET`,
      data: {
        title: s.title,
        speaker: s.speaker,
        startIso: s.startIso,
        endIso: s.endIso,
        venue: s.venue,
        room: s.room,
        description: s.description,
        sourceLink: s.sourceLink,
        conflictDetected: s.conflictDetected,
        conflictResolutionOutcome: s.conflictResolutionOutcome,
        calendarAddLink: s.response.result.payload.proposedSlots[0]?.iso ?? '',
        confidence: s.response.confidence,
      },
    })),
    {
      id: 'reminders',
      type: 'reminders',
      state: 'ghost',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['reminders'],
      tagline: 'Packing reminder · Nov 9 · Departure reminder · Nov 10',
      ghostHeadline: 'Packing list',
      ghostSubtext: 'Jeevy will build this as the trip comes together',
      data: {
        reminders: fix.reminders.map(r => ({
          subject: r.result.payload.subject,
          dueAt: r.result.payload.dueAt,
          ack: r.result.payload.ack,
          deliveryMethod: r.result.payload.deliveryMethod,
        })),
      },
    },
  ]
}

export type FlowEngine = ReturnType<typeof useFlowEngine>

export function useFlowEngine() {
  const [chatScreen, setChatScreen] = useState(1)
  const [enrichment, setEnrichment] = useState<number>(0)
  const [entries, setEntries] = useState<TimelineEntry[]>(() => makeEntries())
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [timelineSheetOpen, setTimelineSheetOpen] = useState(false)
  const [conflictResolved, setConflictResolved] = useState(false)
  const [editingScreen, setEditingScreen] = useState<number | null>(null)
  const editingScreenRef = useRef<number | null>(null)
  editingScreenRef.current = editingScreen

  const advanceChat = useCallback((nextScreen: number, enrichBit?: number) => {
    if (editingScreenRef.current !== null) {
      setEditingScreen(null)
      return
    }
    if (enrichBit !== undefined) setEnrichment(e => e | (1 << enrichBit))
    setChatScreen(nextScreen)
  }, [])

  const hasEnrichment = useCallback((bit: number) => Boolean(enrichment & (1 << bit)), [enrichment])

  const confirmEntry = useCallback((id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, state: 'confirmed' as EntryState } : e))
  }, [])

  const calendarSyncEntry = useCallback((id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, state: 'calendar-synced' as EntryState } : e))
  }, [])

  const proposeEntry = useCallback((id: string) => {
    setEntries(prev => prev.map(e =>
      e.id === id && e.state === 'ghost' ? { ...e, state: 'proposed' as EntryState } : e
    ))
  }, [])

  const resolveConflict = useCallback(() => {
    setConflictResolved(true)
  }, [])

  const startEditScreen = useCallback((screenNumber: number) => {
    setEditingScreen(screenNumber)
  }, [])

  const stopEditScreen = useCallback(() => {
    setEditingScreen(null)
  }, [])

  const confirmedCount = useMemo(
    () => entries.filter(e => e.state === 'confirmed' || e.state === 'calendar-synced').length,
    [entries]
  )

  const dayOfActiveId = useMemo(() => {
    const now = new Date()
    const depDay = new Date('2026-11-10T00:00:00Z')
    if (now < depDay) return null
    for (const entry of entries) {
      const startIso = entry.data['startIso'] as string | undefined
      const endIso = entry.data['endIso'] as string | undefined
      if (!startIso || !endIso) continue
      if (new Date(startIso) <= now && now < new Date(endIso)) return entry.id
    }
    return null
  }, [entries])

  return {
    chatScreen,
    advanceChat,
    hasEnrichment,
    entries,
    expandedEntryId,
    setExpandedEntryId,
    confirmEntry,
    calendarSyncEntry,
    proposeEntry,
    resolveConflict,
    conflictResolved,
    timelineSheetOpen,
    setTimelineSheetOpen,
    confirmedCount,
    totalCount: entries.length,
    dayOfActiveId,
    editingScreen,
    startEditScreen,
    stopEditScreen,
    data: soloTravelFixture,
  }
}
