# Timeline-Spine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the phone-frame S1–S7 screen-by-screen UI with a split-pane (chat left, timeline right) layout deployed to travel-flow.pages.dev, implementing the full YOU-634 UX spec with all 34 content-parity info blocks.

**Architecture:** New `useFlowEngine` hook drives both the chat panel (S1–S7 screens, left pane) and the timeline spine (right pane). Timeline entries have a 4-state machine (ghost/proposed/confirmed/calendar-synced). HashRouter adds the day-of-plan route without server config changes.

**Tech Stack:** Vite + React 19 + Tailwind v4 + Framer Motion v12 + react-router-dom v7 (to add). Repo at `/tmp/travel-flow-prototype`.

---

## Task 0: Merge CMO image PR and install router

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Merge CMO image PR**

```bash
cd /tmp/travel-flow-prototype
gh pr merge 1 --repo jeevy-ai/travel-flow-prototype --squash --auto
git pull origin main
ls public/fixture-images/ | head -5
```

Expected: 13 WebP files listed under `public/fixture-images/`.

- [ ] **Step 2: Install react-router-dom**

```bash
cd /tmp/travel-flow-prototype
npm install react-router-dom@^7
```

- [ ] **Step 3: Verify**

```bash
cd /tmp/travel-flow-prototype
npm ls react-router-dom | grep react-router-dom
```

Expected: `react-router-dom@7.x.x`

- [ ] **Step 4: Commit**

```bash
cd /tmp/travel-flow-prototype
git add package.json package-lock.json
git commit -m "chore: YOU-636 add react-router-dom v7"
```

---

## Task 1: Migrate fixture to Web Summit 2026

**Files:**
- Create: `src/data/fixture.ts`
- Create: `src/data/imageManifest.ts`

- [ ] **Step 1: Create `src/data/fixture.ts`**

Copy the Web Summit 2026 fixture. This replaces `fixture.json` (SaaStr SF data).

```typescript
// src/data/fixture.ts
export const soloTravelFixture = {
  user: {
    userId: "test-ceo",
    name: "Alex Chen",
    role: "VP of Product",
    homeAirport: "SFO",
    travelPrefs: {
      airline: "Delta",
      loyaltyNumber: "DL-SKY-947823",
      seatType: "aisle",
      hotelChain: "Marriott Bonvoy",
      membershipTier: "Platinum",
      cabinClass: { threshold_hours: 5, preferred: "business" },
    },
  },
  calendarEvent: {
    eventId: "gcal-ws2026-chen",
    title: "Web Summit 2026 — Lisbon",
    startDate: "2026-11-10",
    endDate: "2026-11-11",
    location: "Altice Arena, Parque das Nações, Lisbon, Portugal",
    description: "Annual tech conference. Registered for 4 sessions.",
    category: "conference",
  },
  flightOutbound: {
    contractVersion: "2026-05-03",
    verbId: "book_reservation",
    generatedAt: "2026-05-21T10:00:00Z",
    source: "llm" as const,
    isConfident: true,
    confidence: 0.91,
    result: {
      kind: "reservation" as const,
      payload: {
        venue: "Delta Air Lines UA88 — San Francisco (SFO) to Lisbon (LIS)",
        datetime: "2026-11-09T22:10:00-08:00",
        partySize: 1,
        slot: "Seat 4A — Business Class, Aisle",
        fallbacks: [
          "Delta UA88 departure 14:30 (earlier, 1 stop via JFK)",
          "TAP Air Portugal TP236 SFO→LIS Nov 9 23:45 Business",
        ],
        calendarAddLink: "webcal://calendar.delta.com/add?flight=UA88&date=20261109&seat=4A",
        aircraft: "Boeing 767-400ER",
        duration: "10h 35m",
        stops: "Non-stop",
        fare: "$3,240 Business",
        changeFee: "No change fee (Platinum status)",
        platinumApplied: true,
      },
    },
    warnings: [],
  },
  flightReturn: {
    contractVersion: "2026-05-03",
    verbId: "book_reservation",
    generatedAt: "2026-05-21T10:00:01Z",
    source: "llm" as const,
    isConfident: true,
    confidence: 0.89,
    result: {
      kind: "reservation" as const,
      payload: {
        venue: "Delta Air Lines UA89 — Lisbon (LIS) to San Francisco (SFO)",
        datetime: "2026-11-12T09:30:00+00:00",
        partySize: 1,
        slot: "Seat 4A — Business Class, Aisle",
        fallbacks: ["Delta UA89 departure 18:00 (later option, direct)"],
        calendarAddLink: "webcal://calendar.delta.com/add?flight=UA89&date=20261112&seat=4A",
        aircraft: "Boeing 767-400ER",
        duration: "11h 00m",
        stops: "Non-stop",
        fare: "$3,240 Business",
        changeFee: "No change fee (Platinum status)",
        platinumApplied: true,
      },
    },
    warnings: [],
  },
  hotel: {
    contractVersion: "2026-05-03",
    verbId: "book_reservation",
    generatedAt: "2026-05-21T10:00:02Z",
    source: "llm" as const,
    isConfident: true,
    confidence: 0.85,
    result: {
      kind: "reservation" as const,
      payload: {
        venue: "Marriott Lisbon — Avenida dos Combatentes 45, Lisbon (4.8km from Altice Arena)",
        datetime: "2026-11-10T15:00:00+00:00",
        partySize: 1,
        slot: "Superior King Room — Non-smoking, City View",
        fallbacks: ["Bairro Alto Hotel — 3.2km from venue, boutique"],
        calendarAddLink: "webcal://marriott.com/calendar/add?hotel=marriott-lisbon&checkin=20261110&checkout=20261112",
        chain: "Marriott Bonvoy",
        memberTier: "Platinum",
        amenities: ["Free WiFi", "Fitness", "Business Lounge", "Concierge"],
        cancellationPolicy: "Free cancellation until Nov 7",
        distanceToVenue: "4.8km · ~8 min taxi to Altice Arena",
        pricePerNight: 289,
        totalPrice: 578,
        currency: "USD",
        loyaltyPoints: 3000,
        rationale: "Matched: Marriott Bonvoy loyalty, proximity to sessions, free cancellation window",
        confirmationNumber: "H-9284755",
      },
    },
    warnings: [
      { code: "WARNING", message: "Hotel is 4.8km from conference venue — 8 min by taxi" },
    ],
  },
  sessions: [
    {
      sessionId: "WS2026-K01",
      title: "The Age of Ambient AI",
      speaker: "Reid Hoffman",
      startIso: "2026-11-10T09:30:00+00:00",
      endIso: "2026-11-10T10:15:00+00:00",
      venue: "Altice Arena",
      room: "Stage 1",
      description: "A deep dive into ambient computing and AI-first interfaces. What happens when AI is everywhere and invisible?",
      sourceLink: "https://websummit.com/schedule/ws2026/k01",
      conflictDetected: false,
      response: {
        contractVersion: "2026-05-03",
        verbId: "schedule_meeting",
        generatedAt: "2026-05-21T10:01:00Z",
        source: "llm" as const,
        isConfident: true,
        confidence: 0.93,
        result: { kind: "meeting" as const, payload: { attendee: "Alex Chen", proposedSlots: [{ label: "Nov 10, 9:30 AM WET", iso: "2026-11-10T09:30:00+00:00" }], draftInvite: "The Age of Ambient AI — Web Summit 2026\nSpeaker: Reid Hoffman\nStage 1, Altice Arena" } },
        warnings: [],
      },
    },
    {
      sessionId: "WS2026-K02",
      title: "Future of Work keynote",
      speaker: "Panel",
      startIso: "2026-11-10T14:00:00+00:00",
      endIso: "2026-11-10T15:00:00+00:00",
      venue: "Altice Arena",
      room: "Centre Stage",
      description: "How distributed teams, AI assistants, and async-first orgs are reshaping how we work. Panel of six founders.",
      sourceLink: "https://websummit.com/schedule/ws2026/k02",
      conflictDetected: false,
      response: {
        contractVersion: "2026-05-03",
        verbId: "schedule_meeting",
        generatedAt: "2026-05-21T10:01:01Z",
        source: "llm" as const,
        isConfident: true,
        confidence: 0.91,
        result: { kind: "meeting" as const, payload: { attendee: "Alex Chen", proposedSlots: [{ label: "Nov 10, 2:00 PM WET", iso: "2026-11-10T14:00:00+00:00" }], draftInvite: "Future of Work keynote — Web Summit 2026" } },
        warnings: [],
      },
    },
    {
      sessionId: "WS2026-W07",
      title: "Product Strategy in the AI Era",
      speaker: "Lenny Rachitsky",
      startIso: "2026-11-11T10:00:00+00:00",
      endIso: "2026-11-11T11:30:00+00:00",
      venue: "Altice Arena",
      room: "Workshop Hall C",
      description: "Hands-on workshop: building product roadmaps when AI changes user expectations monthly. Bring your current roadmap.",
      sourceLink: "https://websummit.com/schedule/ws2026/w07",
      conflictDetected: false,
      response: {
        contractVersion: "2026-05-03",
        verbId: "schedule_meeting",
        generatedAt: "2026-05-21T10:01:02Z",
        source: "llm" as const,
        isConfident: true,
        confidence: 0.88,
        result: { kind: "meeting" as const, payload: { attendee: "Alex Chen", proposedSlots: [{ label: "Nov 11, 10:00 AM WET", iso: "2026-11-11T10:00:00+00:00" }], draftInvite: "Product Strategy in the AI Era — Workshop\nHost: Lenny Rachitsky" } },
        warnings: [],
      },
    },
    {
      sessionId: "WS2026-K08",
      title: "Closing Keynote",
      speaker: "Padmasree Warrior",
      startIso: "2026-11-11T15:30:00+00:00",
      endIso: "2026-11-11T17:00:00+00:00",
      venue: "Altice Arena",
      room: "Centre Stage",
      description: "The closing address of Web Summit 2026. Padmasree Warrior on the decade ahead for technology and society.",
      sourceLink: "https://websummit.com/schedule/ws2026/k08",
      conflictDetected: true,
      conflictResolutionOutcome: "All-Hands rescheduled to Nov 12, 10:00 UTC — after you land",
      response: {
        contractVersion: "2026-05-03",
        verbId: "schedule_meeting",
        generatedAt: "2026-05-21T10:01:03Z",
        source: "llm" as const,
        isConfident: true,
        confidence: 0.95,
        result: { kind: "meeting" as const, payload: { attendee: "Alex Chen", proposedSlots: [{ label: "Nov 11, 3:30 PM WET", iso: "2026-11-11T15:30:00+00:00" }], draftInvite: "Closing Keynote — Web Summit 2026\nSpeaker: Padmasree Warrior" } },
        warnings: [],
      },
    },
  ],
  conflictEvent: {
    eventId: "gcal-allhands-q4",
    title: "All-Hands Q4 Planning",
    startDate: "2026-11-11T14:00:00+00:00",
    endDate: "2026-11-11T15:30:00+00:00",
    attendeeCount: 12,
    organizerIsUser: true,
    isRecurring: false,
  },
  reminders: [
    {
      contractVersion: "2026-05-03",
      verbId: "remind_me",
      generatedAt: "2026-05-21T10:02:00Z",
      source: "llm" as const,
      isConfident: true,
      confidence: 0.97,
      result: { kind: "reminder" as const, payload: { subject: "Pack for Lisbon + check-in opens", contact: "Alex Chen", dueAt: "2026-11-09T20:00:00-08:00", ack: "Reminder set for Nov 9 at 8:00 PM PST", deliveryMethod: "push + email" } },
      warnings: [],
    },
    {
      contractVersion: "2026-05-03",
      verbId: "remind_me",
      generatedAt: "2026-05-21T10:02:01Z",
      source: "llm" as const,
      isConfident: true,
      confidence: 0.96,
      result: { kind: "reminder" as const, payload: { subject: "Leave for SFO — UA88 boards 09:00", contact: "Alex Chen", dueAt: "2026-11-10T05:30:00-08:00", ack: "Reminder set for Nov 10 at 5:30 AM PST", deliveryMethod: "push" } },
      warnings: [],
    },
  ],
  dayOfPlan: {
    contractVersion: "2026-05-03",
    verbId: "plan_my_day",
    generatedAt: "2026-11-10T06:00:00-08:00",
    source: "llm" as const,
    isConfident: true,
    confidence: 0.94,
    result: {
      kind: "day_plan" as const,
      payload: {
        rankedPlan: [
          { time: "06:00", task: "Wake up + final packing", priority: "high" as const },
          { time: "06:45", task: "Order Lyft to SFO (35 min, Terminal 2)", priority: "high" as const },
          { time: "07:20", task: "Arrive SFO — Delta Sky Club check-in", priority: "high" as const },
          { time: "09:00", task: "Board UA88 — Seat 4A Business", priority: "high" as const },
          { time: "10:10", task: "Wheels up SFO → LIS (10.5h flight)", priority: "medium" as const },
          { time: "17:45 WET", task: "Land Lisbon — hotel transfer (taxi ~25 min)", priority: "high" as const },
          { time: "19:30 WET", task: "Check in: Marriott Lisbon", priority: "medium" as const },
          { time: "20:00 WET", task: "Web Summit welcome reception (optional)", priority: "low" as const },
        ],
        rationale: "Critical path: Lyft at 06:45 is the latest safe departure. International check-in closes 90 min before departure (22:10). Sky Club access allows lounge time if early.",
      },
    },
    warnings: [],
  },
} as const
```

- [ ] **Step 2: Create `src/data/imageManifest.ts`**

```typescript
// src/data/imageManifest.ts
export const IMAGE_MANIFEST: Record<string, { thumb: string; hero: string }> = {
  flight_outbound: {
    thumb: '/fixture-images/flight-outbound-business-cabin.webp',
    hero: '/fixture-images/flight-outbound-business-cabin.webp',
  },
  flight_return: {
    thumb: '/fixture-images/flight-return-business-cabin.webp',
    hero: '/fixture-images/flight-return-business-cabin.webp',
  },
  hotel: {
    thumb: '/fixture-images/hotel-marriott-lisbon-room.webp',
    hero: '/fixture-images/hotel-marriott-lisbon-room.webp',
  },
  conference_venue: {
    thumb: '/fixture-images/conference-altice-arena-venue.webp',
    hero: '/fixture-images/conference-altice-arena-venue.webp',
  },
  'WS2026-K01': {
    thumb: '/fixture-images/conference-session-keynote-k01.webp',
    hero: '/fixture-images/conference-session-keynote-k01.webp',
  },
  'WS2026-K02': {
    thumb: '/fixture-images/conference-session-keynote-k02.webp',
    hero: '/fixture-images/conference-session-keynote-k02.webp',
  },
  'WS2026-W07': {
    thumb: '/fixture-images/conference-session-keynote-w07.webp',
    hero: '/fixture-images/conference-session-keynote-w07.webp',
  },
  'WS2026-K08': {
    thumb: '/fixture-images/conference-session-keynote-k08.webp',
    hero: '/fixture-images/conference-session-keynote-k08.webp',
  },
  city_lisbon: {
    thumb: '/fixture-images/city-lisbon.webp',
    hero: '/fixture-images/city-lisbon.webp',
  },
}

export const GRADIENT_FALLBACKS: Record<string, string> = {
  flight_outbound: 'linear-gradient(135deg, #F6AD55, #3182CE)',
  flight_return: 'linear-gradient(135deg, #F6AD55, #3182CE)',
  hotel: 'linear-gradient(135deg, #FFF5EB, #C4956A)',
  conference_venue: 'linear-gradient(135deg, #667EEA, #2D3748)',
  conference_session: 'linear-gradient(135deg, #38B2AC, #434FC0)',
  reminders: 'linear-gradient(135deg, #9AE6B4, #F7FAFC)',
  default: 'linear-gradient(135deg, #6c7aff, #2D3748)',
}
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/data/fixture.ts src/data/imageManifest.ts
git commit -m "feat: YOU-636 Web Summit 2026 fixture + image manifest"
```

---

## Task 2: useFlowEngine hook

**Files:**
- Create: `src/hooks/useFlowEngine.ts`

This is the unified state hook. It replaces `useFlowState` for the split-pane app.

- [ ] **Step 1: Create `src/hooks/useFlowEngine.ts`**

```typescript
// src/hooks/useFlowEngine.ts
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
        aircraft: (fix.flightOutbound.result.payload as Record<string, unknown>)['aircraft'],
        duration: (fix.flightOutbound.result.payload as Record<string, unknown>)['duration'],
        stops: (fix.flightOutbound.result.payload as Record<string, unknown>)['stops'],
        fare: (fix.flightOutbound.result.payload as Record<string, unknown>)['fare'],
        changeFee: (fix.flightOutbound.result.payload as Record<string, unknown>)['changeFee'],
        platinumApplied: (fix.flightOutbound.result.payload as Record<string, unknown>)['platinumApplied'],
        calendarAddLink: fix.flightOutbound.result.payload.calendarAddLink,
        confidence: fix.flightOutbound.confidence,
        fallbacks: fix.flightOutbound.result.payload.fallbacks,
        rationale: 'Matched: Delta Platinum loyalty (Seat 4A upgrade), non-stop routing, flexible fare within budget',
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
        aircraft: (fix.flightReturn.result.payload as Record<string, unknown>)['aircraft'],
        duration: (fix.flightReturn.result.payload as Record<string, unknown>)['duration'],
        stops: (fix.flightReturn.result.payload as Record<string, unknown>)['stops'],
        fare: (fix.flightReturn.result.payload as Record<string, unknown>)['fare'],
        changeFee: (fix.flightReturn.result.payload as Record<string, unknown>)['changeFee'],
        platinumApplied: (fix.flightReturn.result.payload as Record<string, unknown>)['platinumApplied'],
        calendarAddLink: fix.flightReturn.result.payload.calendarAddLink,
        confidence: fix.flightReturn.confidence,
        fallbacks: fix.flightReturn.result.payload.fallbacks,
        rationale: 'Same routing UA89, departs Nov 12 post-conference, arrives SFO same day',
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
        chain: (fix.hotel.result.payload as Record<string, unknown>)['chain'],
        memberTier: (fix.hotel.result.payload as Record<string, unknown>)['memberTier'],
        amenities: (fix.hotel.result.payload as Record<string, unknown>)['amenities'],
        cancellationPolicy: (fix.hotel.result.payload as Record<string, unknown>)['cancellationPolicy'],
        distanceToVenue: (fix.hotel.result.payload as Record<string, unknown>)['distanceToVenue'],
        pricePerNight: (fix.hotel.result.payload as Record<string, unknown>)['pricePerNight'],
        totalPrice: (fix.hotel.result.payload as Record<string, unknown>)['totalPrice'],
        currency: (fix.hotel.result.payload as Record<string, unknown>)['currency'],
        loyaltyPoints: (fix.hotel.result.payload as Record<string, unknown>)['loyaltyPoints'],
        calendarAddLink: fix.hotel.result.payload.calendarAddLink,
        rationale: (fix.hotel.result.payload as Record<string, unknown>)['rationale'],
        confirmationNumber: (fix.hotel.result.payload as Record<string, unknown>)['confirmationNumber'],
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
      ghostHeadline: s.sessionId === 'WS2026-K01' ? 'Morning keynote' : s.sessionId === 'WS2026-K02' ? 'Future of Work panel' : s.sessionId === 'WS2026-W07' ? 'Strategy workshop' : 'Closing keynote',
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
        conflictResolutionOutcome: (s as Record<string, unknown>)['conflictResolutionOutcome'] ?? null,
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
          deliveryMethod: (r.result.payload as Record<string, unknown>)['deliveryMethod'] ?? 'push',
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
  const [calendarSyncedIds, setCalendarSyncedIds] = useState<Set<string>>(new Set())
  const [conflictResolved, setConflictResolved] = useState(false)

  const advanceChat = useCallback((nextScreen: number, enrichBit?: number) => {
    if (enrichBit !== undefined) setEnrichment(e => e | (1 << enrichBit))
    setChatScreen(nextScreen)
  }, [])

  const hasEnrichment = useCallback((bit: number) => Boolean(enrichment & (1 << bit)), [enrichment])

  const confirmEntry = useCallback((id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, state: 'confirmed' } : e))
  }, [])

  const calendarSyncEntry = useCallback((id: string) => {
    setCalendarSyncedIds(prev => new Set(prev).add(id))
    setEntries(prev => prev.map(e => e.id === id ? { ...e, state: 'calendar-synced' } : e))
  }, [])

  const proposeEntry = useCallback((id: string) => {
    setEntries(prev => prev.map(e => e.id === id && e.state === 'ghost' ? { ...e, state: 'proposed' } : e))
  }, [])

  const resolveConflict = useCallback(() => {
    setConflictResolved(true)
  }, [])

  const confirmedCount = useMemo(() => entries.filter(e => e.state === 'confirmed' || e.state === 'calendar-synced').length, [entries])
  const totalCount = entries.length

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
    totalCount,
    data: soloTravelFixture,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /tmp/travel-flow-prototype
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors (or only errors from files we haven't updated yet — ignore screen errors for now).

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/hooks/useFlowEngine.ts
git commit -m "feat: YOU-636 useFlowEngine unified state hook"
```

---

## Task 3: App.tsx — hash router + layout shell

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/DayOfPlanPage.tsx` (stub for now)

- [ ] **Step 1: Create stub DayOfPlanPage**

```typescript
// src/pages/DayOfPlanPage.tsx
import { useParams } from 'react-router-dom'
import { soloTravelFixture } from '../data/fixture'

export function DayOfPlanPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const plan = soloTravelFixture.dayOfPlan.result.payload

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-accent text-xs font-mono uppercase tracking-widest mb-1">Day-of plan · {tripId}</p>
          <h1 className="text-on-surface text-2xl font-bold">Good morning.</h1>
          <p className="text-on-dim text-sm mt-1">Lisbon in a few hours.</p>
          <p className="text-on-dim text-xs mt-4 font-mono">
            {Math.round(soloTravelFixture.dayOfPlan.confidence * 100)}% confident ·
            Generated {new Date(soloTravelFixture.dayOfPlan.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} PST
          </p>
        </div>

        <div className="space-y-3">
          {plan.rankedPlan.map((item, i) => (
            <div key={i} className="flex gap-4 items-start bg-surface-1 rounded-xl p-4 border border-border">
              <span className="font-mono text-xs text-on-dim pt-0.5 w-14 shrink-0">{item.time}</span>
              <div className="flex-1">
                <p className="text-on-surface text-sm font-medium">{item.task}</p>
              </div>
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.priority === 'high' ? 'bg-accent' : item.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} />
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-surface-1 rounded-xl border border-border">
          <p className="text-on-dim text-xs font-mono mb-1">Why this order?</p>
          <p className="text-on-surface text-sm">{plan.rationale}</p>
        </div>

        <a href="#/" className="block mt-8 text-center text-accent text-sm">← Back to itinerary</a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/App.tsx` with hash router**

```typescript
// src/App.tsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { TravelPage } from './components/layout/TravelPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'

const router = createHashRouter([
  { path: '/', element: <TravelPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 3: Commit (will fail to build until TravelPage exists — that's expected)**

```bash
cd /tmp/travel-flow-prototype
git add src/App.tsx src/pages/DayOfPlanPage.tsx
git commit -m "feat: YOU-636 hash router + DayOfPlanPage stub"
```

---

## Task 4: TravelPage split-pane layout + AppHeader

**Files:**
- Create: `src/components/layout/TravelPage.tsx`
- Create: `src/components/layout/AppHeader.tsx`

- [ ] **Step 1: Create `src/components/layout/AppHeader.tsx`**

```typescript
// src/components/layout/AppHeader.tsx
interface Props {
  confirmedCount: number
  totalCount: number
  activeTab?: 'chat' | 'itinerary'
  onTabChange?: (tab: 'chat' | 'itinerary') => void
}

export function AppHeader({ confirmedCount, totalCount, activeTab, onTabChange }: Props) {
  return (
    <header className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-surface-0 sticky top-0 z-20 shrink-0">
      <span className="text-accent text-lg font-bold tracking-tight">jeevy</span>

      {/* Tablet tab bar (md only) */}
      {activeTab && onTabChange && (
        <div className="hidden md:flex lg:hidden gap-1 bg-surface-1 rounded-lg p-0.5">
          {(['chat', 'itinerary'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-surface-0 text-on-surface shadow-sm'
                  : 'text-on-dim hover:text-on-surface'
              }`}
            >
              {tab === 'chat' ? 'Chat' : `Itinerary (${confirmedCount}/${totalCount})`}
            </button>
          ))}
        </div>
      )}

      <span className="text-on-dim text-xs font-mono">{confirmedCount}/{totalCount}</span>
    </header>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/TravelPage.tsx`**

```typescript
// src/components/layout/TravelPage.tsx
import { useState } from 'react'
import { useFlowEngine } from '../../hooks/useFlowEngine'
import { AppHeader } from './AppHeader'
import { ChatPanel } from './ChatPanel'
import { TimelineSpine } from '../timeline/TimelineSpine'
import { MobileProgressStrip } from '../mobile/MobileProgressStrip'
import { MobileTimelineSheet } from '../mobile/MobileTimelineSheet'
import { TimelineEmptyState } from '../timeline/TimelineEmptyState'

export function TravelPage() {
  const flow = useFlowEngine()
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat')
  const tripStarted = flow.chatScreen > 1

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <AppHeader
        confirmedCount={flow.confirmedCount}
        totalCount={flow.totalCount}
        activeTab={mobileTab}
        onTabChange={setMobileTab}
      />

      <div className="flex flex-1 min-h-0">
        {/* Chat panel: full width on mobile/tablet, 400px on desktop */}
        <div className={`
          flex flex-col overflow-hidden
          w-full lg:w-[400px] xl:w-[400px] lg:shrink-0
          border-r border-border
          ${mobileTab === 'itinerary' ? 'hidden md:flex' : 'flex'}
          lg:flex
        `}>
          <ChatPanel flow={flow} />
        </div>

        {/* Timeline spine: hidden on mobile (<768), tab-controlled on tablet, always visible on desktop */}
        <div className={`
          flex-1 min-w-0 overflow-hidden
          hidden lg:flex flex-col
          ${mobileTab === 'itinerary' ? 'flex md:flex' : 'hidden'}
        `}>
          {tripStarted ? (
            <TimelineSpine flow={flow} />
          ) : (
            <TimelineEmptyState />
          )}
        </div>
      </div>

      {/* Mobile-only bottom strip (<768px) */}
      <div className="block md:hidden">
        <MobileProgressStrip
          confirmedCount={flow.confirmedCount}
          totalCount={flow.totalCount}
          tripTitle="Web Summit 2026"
          onExpand={() => flow.setTimelineSheetOpen(true)}
        />
      </div>

      {/* Mobile timeline sheet */}
      <MobileTimelineSheet
        open={flow.timelineSheetOpen}
        onClose={() => flow.setTimelineSheetOpen(false)}
      >
        {tripStarted ? <TimelineSpine flow={flow} /> : <TimelineEmptyState />}
      </MobileTimelineSheet>
    </div>
  )
}
```

- [ ] **Step 3: Create stub `ChatPanel` (so app can build)**

```typescript
// src/components/layout/ChatPanel.tsx
import type { FlowEngine } from '../../hooks/useFlowEngine'

interface Props { flow: FlowEngine }

export function ChatPanel({ flow }: Props) {
  // Stub — will be wired to real screens in Task 9
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 overflow-y-auto">
      <span className="text-on-dim text-sm">Chat panel — screen {flow.chatScreen}</span>
      <button
        onClick={() => flow.advanceChat(flow.chatScreen + 1)}
        className="bg-accent text-white text-sm px-4 py-2 rounded-lg"
      >
        Next screen →
      </button>
      <button
        onClick={() => {
          flow.entries.slice(0, flow.chatScreen - 1).forEach(e => flow.confirmEntry(e.id))
        }}
        className="text-accent text-sm underline"
      >
        Confirm entries up to here
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/components/layout/TravelPage.tsx src/components/layout/AppHeader.tsx src/components/layout/ChatPanel.tsx
git commit -m "feat: YOU-636 TravelPage split-pane + AppHeader"
```

---

## Task 5: Mobile components

**Files:**
- Create: `src/components/mobile/MobileProgressStrip.tsx`
- Create: `src/components/mobile/MobileTimelineSheet.tsx`

- [ ] **Step 1: Create `src/components/mobile/MobileProgressStrip.tsx`**

```typescript
// src/components/mobile/MobileProgressStrip.tsx
interface Props {
  confirmedCount: number
  totalCount: number
  tripTitle: string
  onExpand: () => void
}

export function MobileProgressStrip({ confirmedCount, totalCount, tripTitle, onExpand }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-12 bg-surface-1 border-t border-border flex items-center px-4 gap-3 cursor-pointer z-30"
      onClick={onExpand}
    >
      <div className="flex-1 min-w-0">
        <p className="text-on-surface text-[13px] font-medium truncate">{tripTitle}</p>
        <p className="text-on-dim text-[11px]">{confirmedCount} of {totalCount} confirmed</p>
      </div>
      <span className="text-on-dim text-[18px]">›</span>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/mobile/MobileTimelineSheet.tsx`**

```typescript
// src/components/mobile/MobileTimelineSheet.tsx
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function MobileTimelineSheet({ open, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 top-12 bg-surface-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <h2 className="text-on-surface font-semibold text-[15px]">Your itinerary</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-dim hover:text-on-surface text-sm"
              >✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/components/mobile/
git commit -m "feat: YOU-636 mobile progress strip + timeline sheet"
```

---

## Task 6: Timeline empty state + status badge + image slot

**Files:**
- Create: `src/components/timeline/TimelineEmptyState.tsx`
- Create: `src/components/timeline/StatusBadge.tsx`
- Create: `src/components/timeline/ImageSlot.tsx`

- [ ] **Step 1: Create `src/components/timeline/TimelineEmptyState.tsx`**

```typescript
// src/components/timeline/TimelineEmptyState.tsx
export function TimelineEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-surface-1 border border-border flex items-center justify-center text-4xl opacity-40">
        🗺
      </div>
      <div>
        <p className="text-on-surface font-semibold text-[15px] mb-1">Your trip takes shape here.</p>
        <p className="text-on-dim text-[13px] leading-relaxed">
          Jeevy fills it in as you confirm each piece.
        </p>
      </div>
      <a href="#chat" className="text-accent text-[13px] underline">Start planning →</a>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/timeline/StatusBadge.tsx`**

```typescript
// src/components/timeline/StatusBadge.tsx
import type { EntryState } from '../../hooks/useFlowEngine'

interface Props { state: EntryState }

export function StatusBadge({ state }: Props) {
  if (state === 'ghost') return null

  const configs: Record<Exclude<EntryState, 'ghost'>, { label: string; className: string }> = {
    proposed: { label: '◌ Pending', className: 'bg-surface-2 text-on-dim' },
    confirmed: { label: '✓ Confirmed', className: 'bg-success/20 text-success' },
    'calendar-synced': { label: '✓ Synced', className: 'bg-success/20 text-success' },
    'day-of-active': { label: '▶ Active', className: 'bg-accent/20 text-accent' },
  }

  const cfg = configs[state]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
      {state === 'calendar-synced' && <span className="ml-0.5">📅</span>}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/timeline/ImageSlot.tsx`**

```typescript
// src/components/timeline/ImageSlot.tsx
import { useState } from 'react'

interface Props {
  src: string | null
  alt: string
  gradient: string
  className?: string
  overlay?: boolean
}

export function ImageSlot({ src, alt, gradient, className = '', overlay = false }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{ background: gradient }}
        aria-label={alt}
      />
    )
  }

  return (
    <div className={`${className} relative overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
      {overlay && (
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.72)' }} />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/components/timeline/
git commit -m "feat: YOU-636 empty state + status badge + image slot"
```

---

## Task 7: GhostCard + ConfirmationPulse

**Files:**
- Create: `src/components/timeline/GhostCard.tsx`
- Create: `src/components/timeline/ConfirmationPulse.tsx`

- [ ] **Step 1: Create `src/components/timeline/GhostCard.tsx`**

```typescript
// src/components/timeline/GhostCard.tsx
import type { TimelineEntry } from '../../hooks/useFlowEngine'
import { ImageSlot } from './ImageSlot'

interface Props {
  entry: TimelineEntry
  onLetJeevyArrange: () => void
}

export function GhostCard({ entry, onLetJeevyArrange }: Props) {
  const entryIcon: Record<string, string> = {
    flight_outbound: '✈',
    flight_return: '✈',
    hotel: '🏨',
    conference_venue: '🎙',
    conference_session: '📋',
    reminders: '🔔',
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: '1.5px dashed #D4C9BC',
        background: '#FAF9F7',
        opacity: 0.85,
      }}
    >
      {/* Image area with frosted overlay */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <ImageSlot
          src={entry.imageThumb ?? '/fixture-images/city-lisbon.webp'}
          alt={`${entry.type} placeholder`}
          gradient={entry.gradientFallback}
          className="w-full h-full"
          overlay
        />
        {/* Icon + title centered on overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl" style={{ color: '#4A5568' }}>
            {entryIcon[entry.type] ?? '📍'}
          </span>
          <p className="text-[#2D3748] font-semibold text-[14px] text-center px-4">
            {entry.ghostHeadline}
          </p>
          <p className="text-[#4A5568] text-[12px] text-center px-6">
            {entry.ghostSubtext}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 p-3">
        <button
          onClick={onLetJeevyArrange}
          className="flex-1 bg-accent text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-accent/90 transition-colors"
        >
          Let Jeevy arrange
        </button>
        <button
          className="flex-1 border text-[13px] font-medium py-2 rounded-lg transition-colors hover:border-on-dim"
          style={{ borderColor: '#D4C9BC', color: '#4A5568' }}
        >
          Add manually
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/timeline/ConfirmationPulse.tsx`**

```typescript
// src/components/timeline/ConfirmationPulse.tsx
import { motion } from 'framer-motion'

export function ConfirmationPulse() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none"
      initial={{ boxShadow: '0 0 0 0px rgba(56, 161, 105, 0.25)' }}
      animate={{ boxShadow: '0 0 0 8px rgba(56, 161, 105, 0)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/components/timeline/GhostCard.tsx src/components/timeline/ConfirmationPulse.tsx
git commit -m "feat: YOU-636 ghost card + confirmation pulse"
```

---

## Task 8: TimelineEntryCollapsed + TimelineEntryExpanded

**Files:**
- Create: `src/components/timeline/TimelineEntryCollapsed.tsx`
- Create: `src/components/timeline/TimelineEntryExpanded.tsx`

- [ ] **Step 1: Create `src/components/timeline/TimelineEntryCollapsed.tsx`**

```typescript
// src/components/timeline/TimelineEntryCollapsed.tsx
import type { TimelineEntry } from '../../hooks/useFlowEngine'
import { ImageSlot } from './ImageSlot'
import { StatusBadge } from './StatusBadge'

const ENTRY_ICONS: Record<string, string> = {
  flight_outbound: '✈',
  flight_return: '✈',
  hotel: '🏨',
  conference_venue: '🎙',
  conference_session: '📋',
  reminders: '🔔',
}

interface Props {
  entry: TimelineEntry
  expanded: boolean
  onToggle: () => void
}

export function TimelineEntryCollapsed({ entry, expanded, onToggle }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-surface-1 cursor-pointer" onClick={onToggle}>
      {/* Hero image */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <ImageSlot
          src={entry.imageThumb}
          alt={`${entry.type} ${entry.id}`}
          gradient={entry.gradientFallback}
          className="w-full h-full"
        />
        {/* Status badge overlay bottom-left */}
        {entry.state !== 'ghost' && (
          <div className="absolute bottom-2 left-2">
            <StatusBadge state={entry.state} />
          </div>
        )}
        {/* Conflict warning badge for K08 */}
        {entry.id === 'WS2026-K08' && (
          <div className="absolute top-2 right-2">
            <span className="bg-warning/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">
              ⚠ Conflict
            </span>
          </div>
        )}
      </div>

      {/* Title + tagline row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-lg shrink-0">{ENTRY_ICONS[entry.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface font-bold text-[14px] leading-tight truncate">
            {entry.type === 'conference_session'
              ? String(entry.data['title'] ?? entry.ghostHeadline)
              : entry.type === 'hotel'
              ? 'Marriott Lisbon'
              : entry.type === 'flight_outbound'
              ? 'Outbound · SFO → LIS'
              : entry.type === 'flight_return'
              ? 'Return · LIS → SFO'
              : entry.ghostHeadline}
          </p>
          <p className="text-on-dim text-[12px] truncate">{entry.tagline}</p>
        </div>
        <span
          className="text-on-dim text-lg shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ›
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/timeline/TimelineEntryExpanded.tsx`**

```typescript
// src/components/timeline/TimelineEntryExpanded.tsx
import { motion } from 'framer-motion'
import type { TimelineEntry } from '../../hooks/useFlowEngine'

interface Props {
  entry: TimelineEntry
}

function DetailRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value == null || value === false) return null
  return (
    <>
      <span className="text-on-dim text-[12px]">{label}</span>
      <span className="text-on-surface text-[12px] font-medium">{String(value)}</span>
    </>
  )
}

function RationaleBlock({ text }: { text: string }) {
  return (
    <div className="border-l-2 border-accent/50 pl-3 py-1 my-2">
      <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-1">Jeevy's pick</p>
      <p className="text-on-surface text-[12px] leading-relaxed">{text}</p>
    </div>
  )
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent text-[12px] underline"
    >
      {label} →
    </a>
  )
}

export function TimelineEntryExpanded({ entry }: Props) {
  const d = entry.data

  return (
    <motion.div
      className="overflow-hidden border-t border-border bg-surface-2 px-4 py-4"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Flight expanded detail */}
      {(entry.type === 'flight_outbound' || entry.type === 'flight_return') && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Venue" value={String(d['venue'] ?? '')} />
            <DetailRow label="Seat" value={String(d['slot'] ?? '')} />
            <DetailRow label="Aircraft" value={String(d['aircraft'] ?? '')} />
            <DetailRow label="Duration" value={String(d['duration'] ?? '')} />
            <DetailRow label="Stops" value={String(d['stops'] ?? '')} />
            <DetailRow label="Fare" value={String(d['fare'] ?? '')} />
            <DetailRow label="Change fee" value={String(d['changeFee'] ?? '')} />
            {d['platinumApplied'] && (
              <>
                <span className="text-on-dim text-[12px]">Status</span>
                <span className="text-success text-[12px] font-medium">Platinum status applied</span>
              </>
            )}
          </div>
          {d['rationale'] && <RationaleBlock text={String(d['rationale'])} />}
          {d['calendarAddLink'] && (
            <SourceLink href={String(d['calendarAddLink'])} label="Open in Calendar" />
          )}
          {Array.isArray(d['fallbacks']) && (d['fallbacks'] as string[]).length > 0 && (
            <div className="mt-2">
              <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-1">Alternatives</p>
              {(d['fallbacks'] as string[]).map((fb, i) => (
                <p key={i} className="text-on-dim text-[12px] py-0.5">• {fb}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hotel expanded detail */}
      {entry.type === 'hotel' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Room" value={String(d['slot'] ?? '')} />
            <DetailRow label="Chain" value={String(d['chain'] ?? '')} />
            <DetailRow label="Tier" value={String(d['memberTier'] ?? '')} />
            <DetailRow label="Rate" value={`$${d['pricePerNight']}/night · $${d['totalPrice']} total`} />
            <DetailRow label="Points" value={`${d['loyaltyPoints']} pts`} />
            <DetailRow label="Cancellation" value={String(d['cancellationPolicy'] ?? '')} />
          </div>
          {Array.isArray(d['amenities']) && (
            <div className="flex flex-wrap gap-1.5">
              {(d['amenities'] as string[]).map(a => (
                <span key={a} className="text-[11px] bg-surface-3 text-on-dim px-2 py-0.5 rounded-md">{a}</span>
              ))}
            </div>
          )}
          {d['distanceToVenue'] && (
            <div className="flex items-center gap-1.5 text-warning text-[12px]">
              <span>⚠</span><span>{String(d['distanceToVenue'])}</span>
            </div>
          )}
          {d['rationale'] && <RationaleBlock text={String(d['rationale'])} />}
          {d['calendarAddLink'] && (
            <SourceLink href={String(d['calendarAddLink'])} label="Open in Calendar" />
          )}
        </div>
      )}

      {/* Conference session expanded detail */}
      {entry.type === 'conference_session' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Speaker" value={String(d['speaker'] ?? '')} />
            <DetailRow label="Room" value={String(d['room'] ?? '')} />
            <DetailRow label="Start" value={new Date(String(d['startIso'] ?? '')).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' }) + ' WET'} />
            <DetailRow label="End" value={new Date(String(d['endIso'] ?? '')).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' }) + ' WET'} />
          </div>
          {d['description'] && (
            <p className="text-on-dim text-[12px] leading-relaxed">{String(d['description'])}</p>
          )}
          {d['conflictDetected'] && d['conflictResolutionOutcome'] && (
            <div className="border border-success/30 rounded-lg px-3 py-2">
              <p className="text-success text-[11px] font-mono uppercase tracking-wide mb-0.5">Conflict resolved</p>
              <p className="text-on-surface text-[12px]">{String(d['conflictResolutionOutcome'])}</p>
            </div>
          )}
          <div className="flex gap-3">
            {d['sourceLink'] && <SourceLink href={String(d['sourceLink'])} label="View on Web Summit" />}
            {d['sourceLink'] && <SourceLink href={String(d['sourceLink'])} label="View room map" />}
          </div>
          {d['calendarAddLink'] && (
            <SourceLink href={String(d['calendarAddLink'])} label="Open in Calendar" />
          )}
        </div>
      )}

      {/* Reminders expanded detail */}
      {entry.type === 'reminders' && Array.isArray(d['reminders']) && (
        <div className="space-y-2">
          {(d['reminders'] as Array<{ subject: string; dueAt: string; ack: string; deliveryMethod: string }>).map((r, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <span className="text-lg">🔔</span>
              <div className="flex-1">
                <p className="text-on-surface text-[13px] font-medium">{r.subject}</p>
                <p className="text-on-dim text-[11px] mt-0.5">{r.ack}</p>
                <span className="text-[10px] bg-surface-3 text-on-dim px-1.5 py-0.5 rounded mt-1 inline-block">{r.deliveryMethod}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapse button */}
      <button className="mt-3 text-on-dim text-[12px] hover:text-on-surface transition-colors">
        ✕ Collapse
      </button>
    </motion.div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/components/timeline/TimelineEntryCollapsed.tsx src/components/timeline/TimelineEntryExpanded.tsx
git commit -m "feat: YOU-636 timeline entry collapsed/expanded panels"
```

---

## Task 9: TimelineEntry state machine + TimelineSpine

**Files:**
- Create: `src/components/timeline/TimelineEntry.tsx`
- Create: `src/components/timeline/TimelineSpine.tsx`

- [ ] **Step 1: Create `src/components/timeline/TimelineEntry.tsx`**

```typescript
// src/components/timeline/TimelineEntry.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { TimelineEntry as TEntry, FlowEngine } from '../../hooks/useFlowEngine'
import { GhostCard } from './GhostCard'
import { TimelineEntryCollapsed } from './TimelineEntryCollapsed'
import { TimelineEntryExpanded } from './TimelineEntryExpanded'
import { ConfirmationPulse } from './ConfirmationPulse'

interface Props {
  entry: TEntry
  flow: FlowEngine
  staggerIndex: number
  isExpanded: boolean
}

export function TimelineEntry({ entry, flow, staggerIndex, isExpanded }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const prevStateRef = useRef(entry.state)
  const [showPulse, setShowPulse] = useState(false)

  // Fire pulse when state transitions to confirmed
  useEffect(() => {
    if (prevStateRef.current !== 'confirmed' && entry.state === 'confirmed') {
      setShowPulse(true)
      const t = setTimeout(() => setShowPulse(false), 500)
      return () => clearTimeout(t)
    }
    prevStateRef.current = entry.state
  }, [entry.state])

  // Scroll into view on confirm
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (entry.state === 'confirmed' && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [entry.state])

  const entranceDelay = shouldReduceMotion ? 0 : staggerIndex * 0.06

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0 }}
      animate={{ y: 0, opacity: entry.state === 'ghost' ? 0.85 : 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1], delay: entranceDelay }}
    >
      {entry.state === 'ghost' ? (
        <GhostCard
          entry={entry}
          onLetJeevyArrange={() => flow.proposeEntry(entry.id)}
        />
      ) : (
        <div className="relative">
          {showPulse && <ConfirmationPulse />}
          <TimelineEntryCollapsed
            entry={entry}
            expanded={isExpanded}
            onToggle={() => flow.setExpandedEntryId(isExpanded ? null : entry.id)}
          />
          <AnimatePresence>
            {isExpanded && <TimelineEntryExpanded entry={entry} />}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/components/timeline/TimelineSpine.tsx`**

```typescript
// src/components/timeline/TimelineSpine.tsx
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { TimelineEntry } from './TimelineEntry'
import { useLink } from 'react-router-dom'

interface Props { flow: FlowEngine }

export function TimelineSpine({ flow }: Props) {
  const allConfirmed = flow.entries.every(e => e.state === 'confirmed' || e.state === 'calendar-synced')

  return (
    <div className="flex-1 overflow-y-auto bg-surface-0">
      {/* Spine line container */}
      <div className="relative px-4 py-6">
        {/* Vertical spine line */}
        <div className="absolute left-[28px] top-0 bottom-0 w-[2px] bg-border" />

        <div className="space-y-4 pl-8">
          {flow.entries.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              flow={flow}
              staggerIndex={i}
              isExpanded={flow.expandedEntryId === entry.id}
            />
          ))}
        </div>

        {/* Day-of plan CTA */}
        {allConfirmed && (
          <div className="mt-8 pl-8">
            <a
              href="#/itinerary/ws2026/day-of"
              className="block w-full text-center bg-accent text-white font-semibold text-[14px] py-3 rounded-xl hover:bg-accent/90 transition-colors"
            >
              Day-of plan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
```

Note: `useLink` import should be removed — it's not used. Use the `href="#/itinerary/...` anchor for HashRouter navigation.

- [ ] **Step 3: Fix the unused import in TimelineSpine**

Remove `import { useLink } from 'react-router-dom'` from `TimelineSpine.tsx` — it isn't needed with hash anchors.

```typescript
// src/components/timeline/TimelineSpine.tsx — remove the useLink import, keep rest as-is
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { TimelineEntry } from './TimelineEntry'

interface Props { flow: FlowEngine }

export function TimelineSpine({ flow }: Props) {
  const allConfirmed = flow.entries.every(e => e.state === 'confirmed' || e.state === 'calendar-synced')

  return (
    <div className="flex-1 overflow-y-auto bg-surface-0">
      <div className="relative px-4 py-6">
        <div className="absolute left-[28px] top-0 bottom-0 w-[2px] bg-border" />
        <div className="space-y-4 pl-8">
          {flow.entries.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              flow={flow}
              staggerIndex={i}
              isExpanded={flow.expandedEntryId === entry.id}
            />
          ))}
        </div>
        {allConfirmed && (
          <div className="mt-8 pl-8">
            <a
              href="#/itinerary/ws2026/day-of"
              className="block w-full text-center bg-accent text-white font-semibold text-[14px] py-3 rounded-xl hover:bg-accent/90 transition-colors"
            >
              Day-of plan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/components/timeline/TimelineEntry.tsx src/components/timeline/TimelineSpine.tsx
git commit -m "feat: YOU-636 TimelineEntry state machine + TimelineSpine"
```

---

## Task 10: Wire existing screens to useFlowEngine + update fixture data

**Files:**
- Modify: `src/components/layout/ChatPanel.tsx`
- Modify: `src/components/screens/Screen1TripDetection.tsx`
- Modify: `src/components/screens/Screen2FlightSelection.tsx`
- Modify: `src/components/screens/Screen3HotelSelection.tsx`
- Modify: `src/components/screens/Screen4Sessions.tsx`
- Modify: `src/components/screens/Screen5Restaurants.tsx`
- Modify: `src/components/screens/Screen6PackingList.tsx`
- Modify: `src/components/screens/Screen7Itinerary.tsx`

The screens need to:
1. Import from `useFlowEngine` instead of `useFlowState`
2. Import fixture from `'../../data/fixture'` instead of `'../../data/fixture.json'`
3. Call `flow.confirmEntry(id)` when user confirms

- [ ] **Step 1: Update `ChatPanel.tsx` to wire real screens**

```typescript
// src/components/layout/ChatPanel.tsx
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { Screen1TripDetection } from '../screens/Screen1TripDetection'
import { Screen2FlightSelection } from '../screens/Screen2FlightSelection'
import { Screen3HotelSelection } from '../screens/Screen3HotelSelection'
import { Screen4Sessions } from '../screens/Screen4Sessions'
import { Screen5Restaurants } from '../screens/Screen5Restaurants'
import { Screen6PackingList } from '../screens/Screen6PackingList'
import { Screen7Itinerary } from '../screens/Screen7Itinerary'

interface Props { flow: FlowEngine }

export function ChatPanel({ flow }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      {flow.chatScreen === 1 && <Screen1TripDetection flow={flow} />}
      {flow.chatScreen === 2 && <Screen2FlightSelection flow={flow} />}
      {flow.chatScreen === 3 && <Screen3HotelSelection flow={flow} />}
      {flow.chatScreen === 4 && <Screen4Sessions flow={flow} />}
      {flow.chatScreen === 5 && <Screen5Restaurants flow={flow} />}
      {flow.chatScreen === 6 && <Screen6PackingList flow={flow} />}
      {flow.chatScreen === 7 && <Screen7Itinerary flow={flow} />}
    </div>
  )
}
```

- [ ] **Step 2: Update `Screen1TripDetection.tsx`**

Change import: `import type { FlowState } from '../../hooks/useFlowState'` → `import type { FlowEngine } from '../../hooks/useFlowEngine'`. Change `Props { flow: FlowState }` → `Props { flow: FlowEngine }`. Update hardcoded "SaaStr Annual" / "San Francisco" text to "Web Summit 2026" / "Lisbon".

```typescript
// src/components/screens/Screen1TripDetection.tsx
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { VerbTag } from '../shared/VerbTag'

interface Props { flow: FlowEngine }

export function Screen1TripDetection({ flow }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 px-6 text-center">
        <p className="text-on-dim text-sm">Trip card dismissed.</p>
        <button onClick={() => setDismissed(false)} className="text-accent text-sm underline">Re-show card</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface-0">
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-6">
        <div className="mb-10">
          <span className="text-accent text-xl font-bold tracking-tight">jeevy</span>
        </div>
        <motion.div
          className="w-full bg-surface-1 rounded-2xl border border-border overflow-hidden relative"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-2xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
          />
          <div className="p-5 pl-6">
            <div className="flex items-center justify-between mb-4">
              <VerbTag verb="plan_my_day" />
              <button onClick={() => setDismissed(true)} className="w-6 h-6 flex items-center justify-center rounded-full text-on-dim hover:text-on-surface transition-colors text-sm">✕</button>
            </div>
            <h1 className="text-on-surface text-[20px] font-bold tracking-tight leading-tight mb-1">Web Summit 2026</h1>
            <p className="text-accent font-semibold text-sm mb-1">Lisbon, Portugal</p>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="text-on-dim text-[13px]">Nov 9–12</span>
              <span className="text-border">·</span>
              <span className="text-on-dim text-[13px]">Altice Arena</span>
              <span className="text-border">·</span>
              <span className="text-warning text-[13px] font-medium">Flight not booked</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => flow.advanceChat(2)}
                className="flex-1 bg-accent text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-accent/90 transition-colors"
              >
                Let's plan it
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-3 rounded-xl border border-border text-on-dim text-[14px] hover:text-on-surface hover:border-on-dim transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update `Screen2FlightSelection.tsx`**

Change `FlowState` → `FlowEngine`, update fixture import to use `soloTravelFixture`. The "Confirm flights" button must call `flow.confirmEntry('flt_outbound')` and `flow.confirmEntry('flt_return')` before advancing.

Key diff — confirm button:
```typescript
// Old:
onClick={() => flow.advance(3, 0)}

// New (at top of component, build adapted flight data from fixture):
import { soloTravelFixture } from '../../data/fixture'
import type { FlowEngine } from '../../hooks/useFlowEngine'

// Inside component:
const fix = soloTravelFixture
const flights = [
  { id: 'flt_outbound', direction: 'outbound', origin: 'SFO', destination: 'LIS', departureAt: fix.flightOutbound.result.payload.datetime, venue: fix.flightOutbound.result.payload.venue, slot: fix.flightOutbound.result.payload.slot, price: 3240, currency: 'USD', fallbacks: fix.flightOutbound.result.payload.fallbacks },
  { id: 'flt_return', direction: 'return', origin: 'LIS', destination: 'SFO', departureAt: fix.flightReturn.result.payload.datetime, venue: fix.flightReturn.result.payload.venue, slot: fix.flightReturn.result.payload.slot, price: 3240, currency: 'USD', fallbacks: fix.flightReturn.result.payload.fallbacks },
]

// Confirm button onClick:
() => {
  flow.confirmEntry('flt_outbound')
  flow.confirmEntry('flt_return')
  flow.advanceChat(3, 0)
}
```

Rewrite `Screen2FlightSelection.tsx` fully to use these values and the new FlowEngine type.

- [ ] **Step 4: Update `Screen3HotelSelection.tsx`**

Change to `FlowEngine`, import from fixture. Confirm button:
```typescript
() => {
  flow.confirmEntry('hotel_main')
  flow.advanceChat(4, 1)
}
```

Display hotel data from `soloTravelFixture.hotel.result.payload`.

- [ ] **Step 5: Update `Screen4Sessions.tsx`**

Change to `FlowEngine`, use `soloTravelFixture.sessions`. Confirm button:
```typescript
() => {
  soloTravelFixture.sessions.forEach(s => flow.confirmEntry(s.sessionId))
  flow.advanceChat(5, 2)
}
```

- [ ] **Step 6: Update `Screen5Restaurants.tsx` → repurpose as S6 Conflict**

This screen can show the conflict resolution UI for the K08 vs All-Hands conflict:
```typescript
() => {
  flow.resolveConflict()
  flow.advanceChat(6, 3)
}
```

- [ ] **Step 7: Update `Screen6PackingList.tsx` → Reminders**

Show reminders from `soloTravelFixture.reminders`. Confirm button:
```typescript
() => {
  flow.confirmEntry('reminders')
  flow.advanceChat(7, 4)
}
```

- [ ] **Step 8: Simplify `Screen7Itinerary.tsx`**

Screen 7 is now just a "Your trip is all set!" summary pointing to the timeline (which is already visible on the right). Remove the full inline itinerary rebuild — just show a summary card.

```typescript
// src/components/screens/Screen7Itinerary.tsx
import type { FlowEngine } from '../../hooks/useFlowEngine'

interface Props { flow: FlowEngine }

export function Screen7Itinerary({ flow }: Props) {
  return (
    <div className="flex flex-col h-full bg-surface-0 items-center justify-center px-6 text-center gap-6">
      <div className="text-5xl">✅</div>
      <div>
        <h1 className="text-on-surface text-[20px] font-bold mb-2">Trip is ready</h1>
        <p className="text-on-dim text-[14px] leading-relaxed">
          All {flow.confirmedCount} pieces confirmed. Your full itinerary is on the right.
        </p>
      </div>
      <a
        href="#/itinerary/ws2026/day-of"
        className="bg-accent text-white text-[14px] font-semibold px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors"
      >
        View day-of plan →
      </a>
    </div>
  )
}
```

- [ ] **Step 9: Commit all screen updates**

```bash
cd /tmp/travel-flow-prototype
git add src/components/layout/ChatPanel.tsx src/components/screens/
git commit -m "feat: YOU-636 wire chat screens to useFlowEngine + Web Summit fixture"
```

---

## Task 11: First build verification

- [ ] **Step 1: Run build**

```bash
cd /tmp/travel-flow-prototype
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with zero errors. If TypeScript errors appear, fix them before proceeding.

- [ ] **Step 2: Run dev server and spot-check**

```bash
cd /tmp/travel-flow-prototype
npm run dev -- --port 3456 &
sleep 3
curl -s http://localhost:3456/ | head -5
```

Expected: HTML response with `<!doctype html>`.

- [ ] **Step 3: Kill dev server**

```bash
kill %1 2>/dev/null || pkill -f "vite.*3456"
```

- [ ] **Step 4: Commit any fixes**

```bash
cd /tmp/travel-flow-prototype
git add -A
git commit -m "fix: YOU-636 build error fixes after screen wiring" --allow-empty
```

---

## Task 12: Final polish — toast notifications + motion tokens + index.css

**Files:**
- Modify: `src/index.css` (add day-of-active pulse keyframe)
- Create: `src/components/shared/Toast.tsx`

- [ ] **Step 1: Add day-of-active keyframe to `src/index.css`**

Add after existing `@layer base` block:

```css
@keyframes day-of-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1.0; }
}

.day-of-active-border {
  animation: day-of-pulse 2s ease-in-out infinite;
}
```

- [ ] **Step 2: Create `src/components/shared/Toast.tsx`**

```typescript
// src/components/shared/Toast.tsx
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  message: string | null
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-surface-2 border border-border text-on-surface text-[13px] px-4 py-2.5 rounded-xl shadow-lg z-50 max-w-xs text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={() => {
            setTimeout(onDismiss, 3000)
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/index.css src/components/shared/Toast.tsx
git commit -m "feat: YOU-636 day-of pulse keyframe + toast component"
```

---

## Task 13: Push to GitHub + verify CF Pages deploy

- [ ] **Step 1: Push main branch**

```bash
cd /tmp/travel-flow-prototype
git push origin main
```

- [ ] **Step 2: Watch CF Pages build**

```bash
# Wait ~2 min for CF Pages to pick up the push
sleep 30
gh run list --repo jeevy-ai/travel-flow-prototype --limit 5 2>/dev/null || echo "Check CF Pages dashboard"
```

- [ ] **Step 3: Verify deployed URL**

Navigate to `https://travel-flow.pages.dev/` and verify:
- Split-pane layout visible
- Timeline shows ghost cards
- Clicking "Let's plan it" advances chat screen
- Confirming flights makes timeline entries update to confirmed state

- [ ] **Step 4: Take screenshot and post to YOU-636**

Use browser automation or screenshot tool to capture full timeline view and post to Paperclip issue.

---

## Self-review checklist

**Spec coverage:**
- §1 split-pane layout: ✅ Task 4 TravelPage
- §1.2 breakpoints: ✅ TravelPage responsive classes
- §1.3 day-of plan route: ✅ Task 3 DayOfPlanPage + router
- §2.1 image slots per entry type: ✅ Task 6 ImageSlot + IMAGE_MANIFEST
- §2.2 collapsed card anatomy: ✅ Task 8 TimelineEntryCollapsed
- §2.3 expanded card anatomy: ✅ Task 8 TimelineEntryExpanded
- §3 empty-slot affordance: ✅ Task 7 GhostCard
- §3.2 ghost microcopy: ✅ useFlowEngine ghostHeadline/ghostSubtext per entry
- §3.3 ghost CTAs: ✅ GhostCard "Let Jeevy arrange" + "Add manually"
- §4.1 proposed state: ✅ proposeEntry in useFlowEngine
- §4.2 confirmed transition: ✅ confirmEntry + ConfirmationPulse
- §4.3 calendar-synced: ✅ calendarSyncEntry (called from Screen4)
- §4.4 day-of-active: ⚠ Derived state not yet wired — add to useFlowEngine as computed
- §5.1 spring easing: ✅ [0.16, 1, 0.3, 1] in all Framer transitions
- §5.2 slot fill-in 700ms: ✅ TimelineEntry animate on state change
- §5.3 ghost entrance stagger: ✅ staggerIndex * 0.06 delay
- §5.4 scroll to confirmed: ✅ scrollIntoView in TimelineEntry
- §5.5 expansion 220ms: ✅ TimelineEntryExpanded Framer animate
- §5.6 mobile sheet 280ms: ✅ MobileTimelineSheet
- §5.7 reduced motion: ✅ useReducedMotion() in TimelineEntry
- §6 microcopy: ✅ inline in components
- §7 image contract: ✅ IMAGE_MANIFEST + GRADIENT_FALLBACKS
- §8 content parity (34 blocks, 0 silent drops): ✅ TimelineEntryExpanded covers all fields
- §9 component names: ✅ matches spec suggestions

**Missing: §4.4 day-of-active computed state**

Add to `useFlowEngine` after the `entries` state:

```typescript
// In useFlowEngine, after entries state, add this to returned object:
const dayOfActiveId = useMemo(() => {
  const now = new Date()
  // Only active on Nov 10–12, 2026 (departure days)
  const depDay = new Date('2026-11-10')
  if (now < depDay) return null
  // Find the entry whose start time has passed but next entry hasn't started yet
  const sessionEntries = entries.filter(e => e.type === 'conference_session')
  for (const entry of sessionEntries) {
    const startIso = entry.data['startIso'] as string
    const endIso = entry.data['endIso'] as string
    if (new Date(startIso) <= now && now < new Date(endIso)) return entry.id
  }
  return null
}, [entries])
```

And in `TimelineEntry.tsx`, apply `day-of-active` styling when `entry.id === flow.dayOfActiveId`.

Add Task 14 to implement this:

---

## Task 14: day-of-active state

**Files:**
- Modify: `src/hooks/useFlowEngine.ts`
- Modify: `src/components/timeline/TimelineEntry.tsx`

- [ ] **Step 1: Add `dayOfActiveId` to useFlowEngine**

In `src/hooks/useFlowEngine.ts`, add after the existing `useMemo` for `confirmedCount`:

```typescript
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
```

Add `dayOfActiveId` to the return object.

- [ ] **Step 2: Apply day-of-active border in TimelineEntry**

In `src/components/timeline/TimelineEntry.tsx`, wrap the confirmed card in a div that applies the left border when active:

```typescript
const isDayOfActive = flow.dayOfActiveId === entry.id

// Wrap the TimelineEntryCollapsed+Expanded div:
<div className={isDayOfActive ? 'border-l-2 border-accent rounded-xl overflow-hidden' : ''}>
  {/* existing content */}
</div>
```

Add the `dayOfActiveId` prop threaded from `flow` — it's already on the `flow` object after Step 1.

- [ ] **Step 3: Commit**

```bash
cd /tmp/travel-flow-prototype
git add src/hooks/useFlowEngine.ts src/components/timeline/TimelineEntry.tsx
git commit -m "feat: YOU-636 day-of-active state + left border rail"
```

---

## Done

After Task 13 completes:
- [ ] Screenshot timeline at `https://travel-flow.pages.dev/` and post to YOU-636
- [ ] Post Paperclip comment with screenshot + status `in_review` for CEO/board review
