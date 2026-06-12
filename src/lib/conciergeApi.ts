export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TransportLeg {
  mode: string
  duration: string
  notes?: string
}

export interface ItineraryItem {
  time: string
  title: string
  detail: string
  imageQuery?: string
  imageUrl?: string
  transportAfter?: TransportLeg
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
}

export interface ConciergeResponse {
  reply: string
  itinerary: Itinerary | null
}

const BASE = 'https://ai-action-service.noahlaux.workers.dev'
const ITINERARY_ENDPOINT = `${BASE}/concierge/itinerary`
const ALTER_ENDPOINT = `${BASE}/concierge/itinerary/alter`

async function parseResponse(res: Response): Promise<ConciergeResponse> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<ConciergeResponse>
}

export async function sendToConcierge(messages: ChatMessage[]): Promise<ConciergeResponse> {
  const res = await fetch(ITINERARY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  return parseResponse(res)
}

export async function alterItinerary(
  instruction: string,
  currentItinerary: Itinerary,
  messages?: ChatMessage[],
): Promise<ConciergeResponse> {
  const res = await fetch(ALTER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction, currentItinerary, messages }),
  })
  return parseResponse(res)
}
