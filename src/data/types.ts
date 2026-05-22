export interface Flight {
  id: string; direction: 'outbound' | 'return'; airline: string
  flightNumber: string; origin: string; destination: string
  departureAt: string; arrivalAt: string; seat: string; seatType: string
  cabin: string; baggage: string; price: number; currency: string
  terminal: string; pnr: string; allianceMatchesPref: boolean
}

export interface Hotel {
  id: string; name: string; chain: string; address: string
  distanceToVenueMiles: number; checkinDate: string; checkoutDate: string
  roomType: string; pricePerNight: number; totalPrice: number; currency: string
  loyaltyPoints: number; loyaltyProgram: string; amenities: string[]
  cancellationPolicy: string; confirmationNumber: string
}

export interface Session {
  id: string; title: string; startAt: string; endAt: string
  room: string; speaker: string; description: string
  jeevyRecommended: boolean; conflictDetected: boolean
}

export interface Restaurant {
  id: string; name: string; cuisine: string; address: string
  distanceFromHotelMiles: number; reservationAt: string; partySize: number
  pricePerPersonUSD: number; dietaryMatch: Record<string, boolean>
  confirmationNumber: string; notes: string
}

export interface PackingItem { id: string; label: string; packed: boolean }

export interface Reminder {
  id: string; label: string; fireAt: string
  type: 'departure' | 'packing'; notificationChannels: string[]
}
