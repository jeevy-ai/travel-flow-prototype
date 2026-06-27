const BASE = 'https://ai-action-service-production.noahlaux.workers.dev'
const FETCH_TIMEOUT_MS = 60_000

export interface ButlerPreferences {
  airline: string
  seatPreference: string
  hotelChain: string
  cabinClass: string
  homeAirport: string
  travelStyle: string
  dietaryPrefs: string[]
  pace: string
  budgetBand: string
  interests: string[]
}

export interface ButlerTripHistory {
  tripId: string
  destination: string
  dates: string
  highlightVenues: string[]
}

export interface ButlerProfile {
  userId: string
  firstName: string
  isReturning: boolean
  tripHistory: ButlerTripHistory[]
  preferences: ButlerPreferences
}

export async function getButlerProfile(token: string): Promise<ButlerProfile | null> {
  const res = await fetch(`${BASE}/concierge/me`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; code?: string }
    throw new Error(body.error ?? `Profile fetch failed: ${res.status}`)
  }
  return res.json() as Promise<ButlerProfile>
}

export async function updatePreferences(
  token: string,
  prefs: Partial<ButlerPreferences & { firstName: string }>,
): Promise<void> {
  const res = await fetch(`${BASE}/concierge/me/preferences`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prefs),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Preferences update failed: ${res.status}`)
}

// Auth-aware itinerary call — passes JWT so Neon memory is loaded + trips saved
export async function sendToConciergeAuth(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  token: string,
): Promise<{ reply: string; itinerary: unknown }> {
  const res = await fetch(`${BASE}/concierge/itinerary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function alterItineraryAuth(
  instruction: string,
  currentItinerary: unknown,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  token: string,
): Promise<{ reply: string; itinerary: unknown }> {
  const res = await fetch(`${BASE}/concierge/itinerary/alter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ instruction, currentItinerary, messages }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}
