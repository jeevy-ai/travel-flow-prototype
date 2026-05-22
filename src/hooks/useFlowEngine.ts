import { useState, useCallback, useMemo } from 'react'
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
  | 'restaurant'
  | 'activity'
  | 'ride'

export type TimelineEntry = {
  id: string
  type: EntryType
  state: EntryState
  scheduledAt: string | null
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
      state: 'proposed',
      scheduledAt: fix.flightOutbound.result.payload.datetime,
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
      state: 'proposed',
      scheduledAt: fix.flightReturn.result.payload.datetime,
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
      state: 'proposed',
      scheduledAt: fix.hotel.result.payload.datetime,
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
      state: 'proposed' as EntryState,
      scheduledAt: s.startIso,
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
    // ── Rides ──────────────────────────────────────────────
    {
      id: 'ride_arrival',
      type: 'ride',
      state: 'proposed',
      scheduledAt: '2026-11-10T17:30:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['ride'],
      tagline: 'LIS Airport → Marriott · ~25 min · est. €35',
      ghostHeadline: 'Airport transfer',
      ghostSubtext: 'Jeevy will arrange your arrival ride',
      data: {
        from: 'Lisbon Humberto Delgado Airport (LIS)',
        to: 'Marriott Lisbon, Avenida dos Combatentes 45',
        duration: '~25 min',
        vehicle: 'Executive sedan',
        provider: 'Bolt Business',
        cost: '€35 est.',
        notes: 'Driver meets you at arrivals with name sign',
      },
    },
    {
      id: 'ride_day2_venue',
      type: 'ride',
      state: 'proposed',
      scheduledAt: '2026-11-11T08:15:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['ride'],
      tagline: 'Marriott → Altice Arena · ~15 min · est. €18',
      ghostHeadline: 'Morning transfer to venue',
      ghostSubtext: 'Day 2 — arrives before 09:30 session',
      data: {
        from: 'Marriott Lisbon',
        to: 'Altice Arena, Parque das Nações',
        duration: '~15 min',
        vehicle: 'Executive sedan',
        provider: 'Bolt Business',
        cost: '€18 est.',
        notes: 'Booked 08:00 pickup — arrives venue by 08:20',
      },
    },
    {
      id: 'ride_departure',
      type: 'ride',
      state: 'proposed',
      scheduledAt: '2026-11-12T07:00:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['ride'],
      tagline: 'Marriott → LIS Airport · ~25 min · est. €35',
      ghostHeadline: 'Departure transfer',
      ghostSubtext: 'Departs 07:00 for 09:30 flight',
      data: {
        from: 'Marriott Lisbon',
        to: 'Lisbon Humberto Delgado Airport (LIS)',
        duration: '~25 min',
        vehicle: 'Executive sedan',
        provider: 'Bolt Business',
        cost: '€35 est.',
        notes: '2.5 hrs before flight — business class fast-track available',
      },
    },
    // ── Restaurants ────────────────────────────────────────
    {
      id: 'restaurant_nov10',
      type: 'restaurant',
      state: 'proposed',
      scheduledAt: '2026-11-10T20:00:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['restaurant'],
      tagline: 'Solar dos Presuntos · Traditional Portuguese · Rua das Portas de Santo Antão',
      ghostHeadline: 'Dinner — Nov 10',
      ghostSubtext: 'Jeevy is picking the best table for tonight',
      data: {
        name: 'Solar dos Presuntos',
        cuisine: 'Traditional Portuguese',
        address: 'Rua das Portas de Santo Antão 150, Lisbon',
        distanceFromHotel: '1.2 km · 15 min walk',
        priceRange: '€€€ · avg €45/person',
        reservation: 'Table for 1 at 20:00 — confirmation pending',
        specialties: ['Presunto croquettes', 'Bacalhau à Brás', 'Pastéis de nata'],
        rating: '4.5 ★ on Google',
        rationale: 'Award-winning traditional restaurant, 2 min walk from Rossio square',
      },
    },
    {
      id: 'restaurant_nov11',
      type: 'restaurant',
      state: 'proposed',
      scheduledAt: '2026-11-11T20:30:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['restaurant'],
      tagline: 'Cervejaria Ramiro · Premium Seafood · Av. Almirante Reis',
      ghostHeadline: 'Dinner — Nov 11',
      ghostSubtext: 'Jeevy is picking the best table for tonight',
      data: {
        name: 'Cervejaria Ramiro',
        cuisine: 'Premium Seafood',
        address: 'Av. Almirante Reis 1, Lisbon',
        distanceFromHotel: '2.0 km · 8 min taxi',
        priceRange: '€€€ · avg €60/person',
        reservation: 'Table for 1 at 20:30 — reservation confirmed',
        specialties: ['Gambas al ajillo', 'Percebes', 'Sapateira recheada', 'Prego dessert'],
        rating: '4.7 ★ on Google',
        rationale: 'Institution since 1956, best percebes in Lisbon — book months in advance (Jeevy secured spot)',
      },
    },
    // ── Evening activities ──────────────────────────────────
    {
      id: 'activity_nov10',
      type: 'activity',
      state: 'proposed',
      scheduledAt: '2026-11-10T22:00:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['activity'],
      tagline: 'Clube de Fado · Fado show · São Miguel, Alfama',
      ghostHeadline: 'Evening — Fado in Alfama',
      ghostSubtext: 'Optional — skip or swap for early rest',
      data: {
        name: 'Clube de Fado',
        type: 'Fado show',
        address: 'R. de São João da Praça 94, Lisbon',
        duration: '~2 hrs',
        cost: '€25 cover + dinner optional',
        notes: 'Oldest Fado house in Lisbon — intimate setting, live Fado from 22:00',
        optional: true,
        distanceFromRestaurant: '1.5 km from Solar dos Presuntos',
      },
    },
    {
      id: 'activity_nov11',
      type: 'activity',
      state: 'proposed',
      scheduledAt: '2026-11-11T22:30:00+00:00',
      imageThumb: null,
      imageHero: null,
      gradientFallback: GRADIENT_FALLBACKS['activity'],
      tagline: 'PARK Bar · Rooftop drinks · Calçada do Combro',
      ghostHeadline: 'Evening — Rooftop bar',
      ghostSubtext: 'Optional — panoramic views of Lisbon at night',
      data: {
        name: 'PARK Bar',
        type: 'Rooftop cocktail bar',
        address: 'Calçada do Combro 58, Lisbon',
        duration: '1–2 hrs',
        cost: '€12–18 per cocktail',
        notes: 'Hidden rooftop garden on top of a parking structure — views of Tagus river and 25 de Abril bridge',
        optional: true,
        distanceFromRestaurant: '1.8 km from Cervejaria Ramiro',
      },
    },
    // ── Reminders ──────────────────────────────────────────
    {
      id: 'reminders',
      type: 'reminders',
      state: 'proposed',
      scheduledAt: fix.reminders[0]?.result.payload.dueAt ?? null,
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
  const [entries, setEntries] = useState<TimelineEntry[]>(() => makeEntries())
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [conflictResolved, setConflictResolved] = useState(false)
  const [editingScreen, setEditingScreen] = useState<number | null>(null)
  const [confirmingAll, setConfirmingAll] = useState(false)
  const [confirmStep, setConfirmStep] = useState(-1)
  const [allConfirmed, setAllConfirmed] = useState(false)

  // In pre-planned model, "advancing chat" just closes any open swap panel
  const advanceChat = useCallback((_nextScreen: number, _enrichBit?: number) => {
    setEditingScreen(null)
  }, [])

  // noop in swap panels — actual confirmation happens via confirmAll()
  const confirmEntry = useCallback((_id: string) => {}, [])

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

  // Global confirm: sequentially confirms each entry ~700ms apart
  const confirmAll = useCallback((entryIds: string[]) => {
    if (confirmingAll || allConfirmed) return
    setConfirmingAll(true)
    setConfirmStep(0)
    entryIds.forEach((id, i) => {
      setTimeout(() => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, state: 'confirmed' as EntryState } : e))
        setConfirmStep(i + 1)
        if (i === entryIds.length - 1) {
          setTimeout(() => {
            setConfirmingAll(false)
            setAllConfirmed(true)
          }, 600)
        }
      }, i * 700)
    })
  }, [confirmingAll, allConfirmed])

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
    chatScreen: 1,
    advanceChat,
    hasEnrichment: (_bit: number) => false,
    entries,
    expandedEntryId,
    setExpandedEntryId,
    confirmEntry,
    calendarSyncEntry,
    proposeEntry,
    resolveConflict,
    conflictResolved,
    timelineSheetOpen: false,
    setTimelineSheetOpen: (_v: boolean) => {},
    confirmedCount,
    totalCount: entries.length,
    dayOfActiveId,
    editingScreen,
    startEditScreen,
    stopEditScreen,
    confirmAll,
    confirmingAll,
    confirmStep,
    allConfirmed,
    data: soloTravelFixture,
  }
}
