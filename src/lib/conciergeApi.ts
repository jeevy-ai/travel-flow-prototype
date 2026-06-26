export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TransportLeg {
  mode: string
  duration: string
  notes?: string
}

export type EventCategory = 'conference' | 'dining' | 'explore' | 'accommodation' | 'other'

export interface ItineraryAlternative {
  name: string
  tagline?: string
  imageUrl?: string
}

export interface ItineraryItem {
  time: string
  title: string
  detail: string
  imageQuery?: string
  imageUrl?: string
  category?: EventCategory
  transportAfter?: TransportLeg
  price?: string
  localTip?: string
  alternatives?: ItineraryAlternative[]
}

export interface ItineraryDay {
  day: string
  items: ItineraryItem[]
}

export interface Itinerary {
  destination: string
  dates: string
  days: ItineraryDay[]
  summary: string
  tripPrice?: string
  tripLocalTip?: string
  heroImageUrl?: string
}

export interface ConciergeResponse {
  reply: string
  itinerary: Itinerary | null
}

const BASE = 'https://ai-action-service.noahlaux.workers.dev'
const ITINERARY_ENDPOINT = `${BASE}/concierge/itinerary`
const ALTER_ENDPOINT = `${BASE}/concierge/itinerary/alter`
const FETCH_TIMEOUT_MS = 60_000

const CONCIERGE_SECRET = (import.meta.env.VITE_CONCIERGE_DEMO_SECRET as string | undefined)
  ?? (import.meta.env.VITE_INTERNAL_API_SECRET as string | undefined)

function inferCategory(item: ItineraryItem): EventCategory {
  const t = (item.title + ' ' + item.detail).toLowerCase()
  if (/hotel|check.?in|accommodation|stay|resort|hostel/.test(t)) return 'accommodation'
  if (/dinner|lunch|breakfast|restaurant|cafe|coffee|bistro|bar|food|eat|dining|tavern|seafood|sushi/.test(t)) return 'dining'
  if (/flight|depart|arrival|airport|fly/.test(t)) return 'other'
  if (/conference|summit|keynote|session|workshop|panel|seminar|talk|speaker/.test(t)) return 'conference'
  return 'explore'
}

type RawItem = ItineraryItem & { transport?: { mode?: string; duration?: string; detail?: string; notes?: string } }

function normalizeItem(raw: unknown): ItineraryItem {
  const item = raw as RawItem
  // Normalize transportAfter: use explicit field first, fall back to `transport` if present
  let transportAfter = item.transportAfter
  if (!transportAfter && item.transport) {
    const t = item.transport
    transportAfter = {
      mode: (t.mode ?? 'taxi').toLowerCase(),
      duration: t.duration ?? '10 min',
      notes: t.detail ?? t.notes,
    }
  } else if (transportAfter) {
    transportAfter = { ...transportAfter, mode: transportAfter.mode.toLowerCase() }
  }
  const category = item.category ?? inferCategory(item)
  return { ...item, transportAfter, category }
}

function normalizeItinerary(itinerary: Itinerary): Itinerary {
  return {
    ...itinerary,
    days: itinerary.days.map(day => ({
      ...day,
      items: day.items.map(item => normalizeItem(item)),
    })),
  }
}

async function parseResponse(res: Response): Promise<ConciergeResponse> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  const data = await res.json() as ConciergeResponse
  return {
    ...data,
    itinerary: data.itinerary ? normalizeItinerary(data.itinerary) : null,
  }
}

export async function sendToConcierge(messages: ChatMessage[]): Promise<ConciergeResponse> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (CONCIERGE_SECRET) headers['x-concierge-secret'] = CONCIERGE_SECRET
    const res = await fetch(ITINERARY_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    return parseResponse(res)
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new Error('Request timed out — try again.')
    }
    throw err
  }
}

export async function alterItinerary(
  instruction: string,
  currentItinerary: Itinerary,
  messages?: ChatMessage[],
): Promise<ConciergeResponse> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (CONCIERGE_SECRET) headers['x-concierge-secret'] = CONCIERGE_SECRET
    const res = await fetch(ALTER_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ instruction, currentItinerary, messages }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    return parseResponse(res)
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new Error('Request timed out — try again.')
    }
    throw err
  }
}
