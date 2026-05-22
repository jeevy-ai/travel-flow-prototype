# Timeline-Spine Design — travel-flow.pages.dev

**Date:** 2026-05-22  
**Issue:** YOU-636  
**UX Spec:** YOU-634 (all §1–§10 are the upstream authority — this doc records technical decisions only)

---

## 1. Architecture

Split-pane layout replacing the current screen-by-screen `PhoneFrame` model.

```
App (RouterProvider)
├── / → TravelPage
│   ├── <header> 52px sticky (Jeevy bar)
│   ├── <main> flex row
│   │   ├── ChatPanel   400px fixed left (tablet: 360px; <768px: full width)
│   │   └── TimelineSpine  remainder (min 480px desktop; <768px: hidden, served via sheet)
│   ├── MobileProgressStrip  fixed bottom, <768px only
│   └── MobileTimelineSheet  fixed portal, <768px, slide-up
└── /itinerary/:tripId/day-of → DayOfPlanPage
```

### Breakpoints (per §1.2)

| Tailwind class | px range | Chat | Timeline |
|---|---|---|---|
| `xl:` | ≥1280px | 400px | flex-1 |
| `lg:` | 1024–1279px | 360px | flex-1 |
| `md:` (tablet) | 768–1023px | full width | Tab bar toggle |
| `<md>` (mobile) | <768px | full width primary | 48px strip + slide sheet |

---

## 2. State model

### `useFlowEngine` (new root hook, replaces `useFlowState`)

Combines chat flow + timeline state in one place, lifted to `TravelPage`.

```ts
type EntryState = 'ghost' | 'proposed' | 'confirmed' | 'calendar-synced' | 'day-of-active'

type TimelineEntry = {
  id: string
  type: 'flight_outbound' | 'flight_return' | 'hotel' | 'conference_venue'
        | 'conference_session' | 'reminders'
  state: EntryState
  imageThumb: string | null   // '/fixture-images/...' or null → gradient
  imageHero: string | null
  gradientFallback: string    // CSS gradient per §7.3
  tagline: string             // collapsed one-liner per §2.2
  data: Record<string, unknown>  // type-specific fixture fields
}

type FlowEngine = {
  // Chat flow
  chatScreen: number          // 1–9
  advanceChat: (n: number, enrichBit?: number) => void
  hasEnrichment: (bit: number) => boolean
  selectedSessions: Set<string>
  toggleSession: (id: string) => void

  // Timeline
  entries: TimelineEntry[]
  expandedEntryId: string | null
  setExpandedEntry: (id: string | null) => void
  confirmEntry: (id: string) => void   // ghost/proposed → confirmed
  calendarSyncEntry: (id: string) => void  // confirmed → calendar-synced

  // Mobile
  timelineSheetOpen: boolean
  setTimelineSheetOpen: (open: boolean) => void

  // Fixture
  data: SoloTravelFixture
}
```

### State transitions (per §4)

- `ghost` → `proposed`: when Jeevy surfaces an option in chat (S3/S4/S5 first paint)
- `proposed` → `confirmed`: user taps "Confirm" in chat → `confirmEntry(id)`
- `confirmed` → `calendar-synced`: S5 calendar add → `calendarSyncEntry(id)`
- `day-of-active`: derived at render from current time ≥ entry start time on departure day

### Image manifest

Static map in `src/data/imageManifest.ts`:

```ts
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
  'WS2026-K01': { thumb: '/fixture-images/conference-session-keynote-k01.webp', hero: '/fixture-images/conference-session-keynote-k01.webp' },
  'WS2026-K02': { thumb: '/fixture-images/conference-session-keynote-k02.webp', hero: '/fixture-images/conference-session-keynote-k02.webp' },
  'WS2026-W07': { thumb: '/fixture-images/conference-session-keynote-w07.webp', hero: '/fixture-images/conference-session-keynote-w07.webp' },
  'WS2026-K08': { thumb: '/fixture-images/conference-session-keynote-k08.webp', hero: '/fixture-images/conference-session-keynote-k08.webp' },
  placeholder: { thumb: '/fixture-images/city-lisbon.webp', hero: '/fixture-images/city-lisbon.webp' },
}
```

---

## 3. Component tree

```
TravelPage                   useFlowEngine (root state)
├── AppHeader                52px, sticky
├── TabBar                   md-only: Chat | Itinerary(3/7)
├── ChatPanel                S1–S9 screens (existing, adapted)
│   └── [Screen1..9]
├── TimelineSpine            right panel, scrollable
│   └── TimelineEntry ×N    one per fixture entry
│       ├── TimelineEntryCollapsed
│       │   ├── ImageSlot   hero image + gradient fallback
│       │   └── StatusBadge
│       ├── TimelineEntryExpanded   (accordion, one open at a time)
│       │   ├── DetailGrid  key-value pairs (§8 content matrix)
│       │   ├── RationaleBlock
│       │   └── ActionButtons
│       ├── GhostCard        (state === 'ghost')
│       └── ConfirmationPulse (one-shot on state → confirmed)
├── TimelineEmptyState       (before S1 confirmed)
├── MobileProgressStrip      <768px fixed bottom
└── MobileTimelineSheet      <768px portal, slide-up

DayOfPlanPage                /itinerary/:tripId/day-of
├── DayOfHeader
└── DayOfPlanItem ×N        time + task + priority dot
```

---

## 4. Animations (per §5)

All use `cubic-bezier(0.16, 1, 0.3, 1)` ("breeze" spring) unless noted.

| Animation | Implementation | Duration |
|---|---|---|
| Ghost entrance stagger | Framer `motion.div` with `initial/animate`, stagger via `delay={i * 0.06}` | 240ms per card |
| Slot fill-in (ghost→confirmed) | Framer `AnimatePresence` on image opacity + border `animate` | 700ms staged (§5.2) |
| Expansion accordion | `max-height` via Framer layout animation | 220ms |
| Collapse previous | Simultaneous, 180ms `ease-in` | 180ms |
| Confirmation pulse ring | `ConfirmationPulse` component, box-shadow keyframe, one-shot | 400ms |
| Mobile sheet | `translateY(100%)→0`, backdrop fade | 280ms |
| Day-of-active border pulse | CSS `@keyframes` opacity 0.6↔1.0, 2s loop | N/A |
| Reduced motion | `useReducedMotion()` Framer hook → all durations = 0 | — |

---

## 5. Routing

Add `react-router-dom`. Hash router (`createHashRouter`) for CF Pages compatibility — no `_redirects` file needed.

Routes:
- `#/` → `TravelPage`
- `#/itinerary/:tripId/day-of` → `DayOfPlanPage`

---

## 6. Fixture wiring

**Source of truth:** `solo-travel-flow.ts` from concierge-backend, copied/adapted into `src/data/fixture.ts` for the travel-flow-prototype.

Current `fixture.json` (SaaStr SF) is **replaced** by the Web Summit 2026 Lisbon data from the `soloTravelFixture` export.

---

## 7. Content-parity matrix (abbreviated — full in §8 of YOU-634)

34 HTML info blocks mapped, 5 intentionally dropped (debug metadata, screen nav, persona block). All others surface in `timeline-collapsed`, `timeline-expanded`, `detail-drawer`, or `day-of-plan`. No silent drops.

---

## 8. Files to create / modify

### New files
- `src/hooks/useFlowEngine.ts` — unified state
- `src/data/fixture.ts` — Web Summit fixture (replaces fixture.json)
- `src/data/imageManifest.ts` — image path map
- `src/components/layout/TravelPage.tsx`
- `src/components/layout/AppHeader.tsx`
- `src/components/layout/TabBar.tsx`
- `src/components/timeline/TimelineSpine.tsx`
- `src/components/timeline/TimelineEntry.tsx`
- `src/components/timeline/TimelineEntryCollapsed.tsx`
- `src/components/timeline/TimelineEntryExpanded.tsx`
- `src/components/timeline/ImageSlot.tsx`
- `src/components/timeline/GhostCard.tsx`
- `src/components/timeline/ConfirmationPulse.tsx`
- `src/components/timeline/StatusBadge.tsx`
- `src/components/timeline/TimelineEmptyState.tsx`
- `src/components/mobile/MobileProgressStrip.tsx`
- `src/components/mobile/MobileTimelineSheet.tsx`
- `src/pages/DayOfPlanPage.tsx`

### Modified files
- `src/App.tsx` — add router, remove PhoneFrame, point to TravelPage
- `package.json` — add `react-router-dom`
- `src/components/screens/*.tsx` — adapt to `useFlowEngine` interface
- existing screens adapted (not rewritten) to new flow hook shape

### Deleted
- `src/components/layout/PhoneFrame.tsx` — replaced by TravelPage layout

---

## 9. Acceptance criteria traceability

| AC# | Criterion | Implementation |
|---|---|---|
| 1 | Timeline-spine layout per §1 | TravelPage + TimelineSpine |
| 2 | 10 fixture nouns w/ real images | IMAGE_MANIFEST + ImageSlot |
| 3 | Empty-slot affordance per §3 | GhostCard |
| 4 | State transitions visible | useFlowEngine confirmEntry |
| 5 | Motion per §5 | Framer Motion, all durations per spec |
| 6 | Lighthouse ≥85 mobile | WebP already optimized (CMO: 2.97MB total) |
| 7 | No regression to verb confidence + badge | Chat screens preserved |
| 8 | YOU-4 verbs still present | propose_travel/book_*/confirm_* wired |
