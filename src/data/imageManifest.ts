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
  reminders: 'linear-gradient(135deg, #9AE6B4, #68D391)',
  restaurant: 'linear-gradient(135deg, #F6AD55, #C05621)',
  activity: 'linear-gradient(135deg, #B794F4, #553C9A)',
  ride: 'linear-gradient(135deg, #4FD1C5, #2C7A7B)',
  default: 'linear-gradient(135deg, #6c7aff, #2D3748)',
}
