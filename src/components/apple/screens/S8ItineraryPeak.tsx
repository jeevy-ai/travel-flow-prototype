import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EventCategory, Itinerary, ItineraryDay, ItineraryItem, TransportLeg } from '../../../lib/conciergeApi'
import { ItemEditSheet } from '../ItemEditSheet'

// ── Fixture itineraries (demo destinations) ────────────────────────────────

const FIXTURE_LISBON: Itinerary = {
  destination: 'Lisbon, Portugal',
  dates: 'November 9–12, 2026',
  summary: 'Web Summit 2026 · 4 days · Personalised for Noah',
  days: [
    {
      day: 'Sun, Nov 9 — Depart SFO',
      items: [
        {
          time: '22:10',
          title: 'Delta UA88 · SFO → LIS',
          detail: 'Business class · Seat 4A · Non-stop · 10h 35m',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-outbound-business-cabin.webp',
          price: '$3,240 Business',
          localTip: 'Seat 4A has extra aisle width on the 767-400ER. The Atlantic sunrise at ~06:00 WET is worth staying awake for.',
          transportAfter: { mode: 'taxi', duration: '25 min', notes: '~€18 to hotel' },
        },
      ],
    },
    {
      day: 'Mon, Nov 10 — Arrive + Conference Day 1',
      items: [
        {
          time: '08:00',
          title: 'Bairro Alto Hotel',
          detail: 'Check-in · Superior Room · City view · Free cancellation until Nov 7',
          category: 'accommodation' as EventCategory,
          imageUrl: '/fixture-images/hotel-bairro-alto.webp',
          price: '€420/night',
          localTip: 'Ask for a room on floors 5–7 facing east — Tagus river and São Jorge Castle view at sunrise.',
          transportAfter: { mode: 'metro', duration: '12 min', notes: '~€1.50' },
        },
        {
          time: '09:30',
          title: 'The Age of Ambient AI',
          detail: 'Reid Hoffman · Stage 1, Altice Arena',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k01.webp',
          price: 'Included in pass',
          localTip: 'Front rows at Stage 1 fill 20 min early. The side aisles have power strips — good for charging.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '14:00',
          title: 'Future of Work Keynote',
          detail: 'Panel · Centre Stage, Altice Arena',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k02.webp',
          price: 'Included in pass',
          localTip: 'The networking zone outside Centre Stage has the best startup founders between talks — bring business cards.',
          transportAfter: { mode: 'taxi', duration: '15 min' },
        },
        {
          time: '19:30',
          title: 'Cervejaria Ramiro',
          detail: 'Seafood dinner · Table for 1 · Intendente, Lisbon',
          category: 'dining' as EventCategory,
          imageUrl: '/fixture-images/restaurant-dishes-seafood.webp',
          price: '€€€ · avg €60/person',
          localTip: 'Order the percebes (barnacles) and gambas al ajillo first — they go fast. Finish with the iconic prego no pão steak sandwich.',
        },
      ],
    },
    {
      day: 'Tue, Nov 11 — Conference Day 2',
      items: [
        {
          time: '10:00',
          title: 'Product Strategy in the AI Era',
          detail: 'Lenny Rachitsky · Workshop Hall C · Hands-on session',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-w07.webp',
          price: 'Included in pass',
          localTip: 'Lenny shares his real Notion docs live — bring your laptop to follow along and fork the templates.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '15:30',
          title: 'Closing Keynote',
          detail: 'Padmasree Warrior · Centre Stage, Altice Arena',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k08.webp',
          price: 'Included in pass',
          localTip: 'Stay until the end — the post-keynote cocktail reception has the best unscheduled conversations of the whole summit.',
          transportAfter: { mode: 'taxi', duration: '20 min' },
        },
        {
          time: '20:30',
          title: 'Park Bar Rooftop',
          detail: 'Cocktails with views over Lisbon · Bairro Alto',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-rooftop-lisbon.webp',
          price: '€14–20 per cocktail',
          localTip: 'Hidden on the roof of a parking structure — look for the neon sign on Calçada do Combro 58. No reservation needed before 22:00.',
        },
      ],
    },
    {
      day: 'Wed, Nov 12 — Return',
      items: [
        {
          time: '08:00',
          title: 'Alfama Morning Walk',
          detail: 'Fado district · Historic castle views · 1.5 hrs',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-fado-lisbon.webp',
          price: 'Free',
          localTip: 'Start at Portas do Sol viewpoint. The bakery on Rua dos Remédios makes the best pastel de nata in the city — €1.20.',
          transportAfter: { mode: 'taxi', duration: '30 min', notes: 'To LIS airport' },
        },
        {
          time: '09:30',
          title: 'Delta UA89 · LIS → SFO',
          detail: 'Business class · Seat 4A · Non-stop · 11h',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-return-business-cabin.webp',
          price: '$3,240 Business',
          localTip: 'LIS Business lounge has excellent tosta mista and espresso — arrive 45 min early to enjoy it.',
        },
      ],
    },
  ],
}

const FIXTURE_NYC: Itinerary = {
  destination: 'New York City, NY',
  dates: 'October 27–30, 2026',
  summary: 'TechCrunch Disrupt 2026 · 4 days · Personalised for Noah',
  days: [
    {
      day: 'Mon, Oct 27 — Depart SFO',
      items: [
        {
          time: '22:00',
          title: 'United UA194 · SFO → JFK',
          detail: 'Business class · Seat 5A · Non-stop · 5h 30m',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-outbound-business-cabin.webp',
          price: '$2,850 Polaris Business',
          localTip: 'Row 5 window seat on the 787-9 has a direct view of the Manhattan skyline on approach to JFK from the east.',
          transportAfter: { mode: 'taxi', duration: '45 min', notes: '~$65 to Midtown' },
        },
      ],
    },
    {
      day: 'Tue, Oct 28 — Arrive + Conference Day 1',
      items: [
        {
          time: '07:00',
          title: 'The NoMad Hotel',
          detail: 'Check-in · Deluxe King · Madison Square Park views · Free cancellation until Oct 24',
          category: 'accommodation' as EventCategory,
          price: '$389/night',
          localTip: 'Ask for a room above floor 8 facing west — the Madison Square Park view at golden hour is worth specifying at check-in.',
          transportAfter: { mode: 'walk', duration: '12 min', notes: 'To Javits Center' },
        },
        {
          time: '09:30',
          title: 'AI-First Startups: What Actually Worked',
          detail: 'Panel · Main Stage, Javits Center',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k01.webp',
          price: 'Included in pass',
          localTip: 'Main Stage lines start 20 min before doors. The TC app has a "seat saved" feature — use it the night before.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '14:00',
          title: 'The Next Billion Users Keynote',
          detail: 'Sundar Pichai · Plenary Hall, Javits Center',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k02.webp',
          price: 'Included in pass',
          localTip: 'The Javits Center rooftop garden (Level 4) is open between sessions — great place to take calls with city views.',
          transportAfter: { mode: 'taxi', duration: '10 min' },
        },
        {
          time: '19:30',
          title: 'Eleven Madison Park',
          detail: 'Plant-based tasting menu · 11 courses · Flatiron District',
          category: 'dining' as EventCategory,
          price: '$335/person',
          localTip: 'The black truffle custard and the celery root "shawarma" are the two most talked-about courses. Wines pairing adds $175 and is worth it.',
        },
      ],
    },
    {
      day: 'Wed, Oct 29 — Conference Day 2',
      items: [
        {
          time: '09:30',
          title: 'Product Velocity: Shipping at AI Speed',
          detail: 'Workshop · Hall B, Javits Center · Hands-on format',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-w07.webp',
          price: 'Included in pass',
          localTip: 'Bring your laptop — the workshop has live coding segments. Grab a seat near a power column.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '15:00',
          title: 'Startup Battlefield Finals',
          detail: 'Live pitch competition · Main Stage, Javits Center',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k08.webp',
          price: 'Included in pass',
          localTip: 'The Battlefield is the best networking moment of TC Disrupt — judges and investors are accessible in the lobby immediately after.',
          transportAfter: { mode: 'taxi', duration: '25 min' },
        },
        {
          time: '20:00',
          title: 'Don Angie',
          detail: 'Italian-American fine dining · West Village',
          category: 'dining' as EventCategory,
          price: '$120/person',
          localTip: "The pinwheel lasagna and garlic knots are must-orders. Sit at the bar for solo dining — the bartender's menu suggestions are excellent.",
        },
      ],
    },
    {
      day: 'Thu, Oct 30 — Return',
      items: [
        {
          time: '07:00',
          title: 'High Line Morning Walk',
          detail: 'Elevated park · Hudson Yards to Chelsea · 2.3 km',
          category: 'explore' as EventCategory,
          price: 'Free',
          localTip: 'Start at the 34th St–Hudson Yards entrance heading south for the best Hudson River views. Coffee at the High Line Hotel garden on the way.',
          transportAfter: { mode: 'taxi', duration: '35 min', notes: 'To JFK airport' },
        },
        {
          time: '11:30',
          title: 'United UA195 · JFK → SFO',
          detail: 'Business class · Seat 5A · Non-stop · 6h',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-return-business-cabin.webp',
          price: '$2,850 Polaris Business',
          localTip: 'JFK Polaris Lounge (Terminal 7) has excellent espresso and a shower suite — arrive 60 min early.',
        },
      ],
    },
  ],
}

const FIXTURE_TOKYO: Itinerary = {
  destination: 'Tokyo, Japan',
  dates: 'April 14–17, 2027',
  summary: 'Tokyo AI Summit 2027 · 4 days · Personalised for Noah',
  days: [
    {
      day: 'Tue, Apr 14 — Depart SFO',
      items: [
        {
          time: '11:40',
          title: 'ANA NH007 · SFO → NRT',
          detail: 'Business class · "The Room" · Seat 1A · Non-stop · 11h',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-outbound-business-cabin.webp',
          price: '$4,200 ANA Business',
          localTip: 'ANA "The Room" suites have a closing door for full privacy. The miso ramen is the best airline meal in this class — order it early.',
          transportAfter: { mode: 'train', duration: '53 min', notes: 'Narita Express · ¥3,070' },
        },
      ],
    },
    {
      day: 'Wed, Apr 15 — Arrive + Opening Day',
      items: [
        {
          time: '15:00',
          title: 'Park Hyatt Tokyo',
          detail: 'Check-in · Deluxe King · Shinjuku skyline · Free cancellation until Apr 11',
          category: 'accommodation' as EventCategory,
          price: '¥98,000/night (~$650)',
          localTip: 'Ask for a west-facing room above floor 45 — on clear days Mount Fuji is visible at dawn. The New York Bar (Lost in Translation fame) is on floor 52.',
          transportAfter: { mode: 'walk', duration: '10 min', notes: 'To summit venue' },
        },
        {
          time: '17:00',
          title: 'Tokyo AI Summit — Opening Keynote',
          detail: 'Fei-Fei Li · Main Hall, Tokyo International Forum',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k01.webp',
          price: 'Included in pass',
          localTip: 'Simultaneous translation headsets at the entrance — essential for the Japanese-language speakers. Return them at the end of the day.',
          transportAfter: { mode: 'taxi', duration: '20 min' },
        },
        {
          time: '19:30',
          title: 'Sukiyabashi Jiro Honten',
          detail: 'Omakase sushi · 10 courses · Ginza',
          category: 'dining' as EventCategory,
          price: '¥40,000/person (~$265)',
          localTip: 'No menu — 10 courses, 30 minutes. The uni (sea urchin) and toro (bluefin tuna belly) are the spiritual heart of the meal. Eat each piece immediately.',
        },
      ],
    },
    {
      day: 'Thu, Apr 16 — Summit Day 2',
      items: [
        {
          time: '10:00',
          title: 'Agent Systems at Scale',
          detail: 'Demis Hassabis · Main Hall, Tokyo International Forum',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k02.webp',
          price: 'Included in pass',
          localTip: 'The hallway track outside the main hall has the highest density of Japanese enterprise AI leaders — introduce yourself in the queue.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '14:00',
          title: 'Enterprise AI Adoption in Japan',
          detail: 'Panel workshop · Room G401 · Hands-on case studies',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-w07.webp',
          price: 'Included in pass',
          localTip: 'Japanese workshop culture values silence and reflection — bring a notebook, not just your laptop.',
          transportAfter: { mode: 'train', duration: '15 min', notes: 'To Shinjuku' },
        },
        {
          time: '20:00',
          title: 'Golden Gai + Omoide Yokocho',
          detail: 'Bar-hopping · Shinjuku · Izakaya crawl · ~3 bars',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-club-interior.webp',
          price: '~¥8,000/person (~$55)',
          localTip: 'Cash only in both areas. Start at Golden Gai (choose a tiny bar with 5–8 seats), then cross to Memory Lane for yakitori. Yebisu draft from the barrel.',
        },
      ],
    },
    {
      day: 'Fri, Apr 17 — Return',
      items: [
        {
          time: '06:30',
          title: 'Senso-ji Temple at Dawn',
          detail: 'Buddhist temple · Asakusa · 1.5 hrs',
          category: 'explore' as EventCategory,
          price: 'Free',
          localTip: 'Arrive before 07:00 to beat the crowds. The Nakamise shopping street vendors open at 08:00 — the ningyo-yaki (small cakes) are the classic souvenir.',
          transportAfter: { mode: 'taxi', duration: '80 min', notes: 'To Narita airport' },
        },
        {
          time: '12:05',
          title: 'ANA NH008 · NRT → SFO',
          detail: 'Business class · "The Room" · Seat 1A · Non-stop · 10h',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-return-business-cabin.webp',
          price: '$4,200 ANA Business',
          localTip: 'NRT Terminal 1 ANA Suite Lounge has a ramen station and onsen-style foot bath — arrive 90 min early.',
        },
      ],
    },
  ],
}

const FIXTURE_DUBAI: Itinerary = {
  destination: 'Dubai, UAE',
  dates: 'March 16–19, 2027',
  summary: 'a16z Future Summit 2027 · 4 days · Personalised for Noah',
  days: [
    {
      day: 'Mon, Mar 16 — Depart SFO',
      items: [
        {
          time: '23:55',
          title: 'Emirates EK225 · SFO → DXB',
          detail: 'Business class · Suite 1A · Non-stop · 16h 15m',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-outbound-business-cabin.webp',
          price: '$5,100 Business Suite',
          localTip: 'Emirates Suite 1A has a full-length privacy door and personal mini-bar. The onboard chef will prepare a custom mezze plate on request. The Atlantic sunrise at ~05:30 UTC is worth staying awake for.',
          transportAfter: { mode: 'taxi', duration: '35 min', notes: '~AED 90 to DIFC' },
        },
      ],
    },
    {
      day: 'Tue, Mar 17 — Arrive + Summit Day 1',
      items: [
        {
          time: '19:00',
          title: 'Address Downtown Dubai',
          detail: 'Check-in · Burj Khalifa View Suite · Free cancellation until Mar 13',
          category: 'accommodation' as EventCategory,
          imageUrl: '/fixture-images/hotel-bairro-alto.webp',
          price: 'AED 2,800/night (~$765)',
          localTip: 'Request a high floor facing northeast — the Burj Khalifa fountain show at 18:00 and 20:00 is visible from the room. Breakfast on the 63rd floor pool terrace is the best meal in Dubai.',
          transportAfter: { mode: 'taxi', duration: '15 min', notes: 'To DIFC' },
        },
        {
          time: '20:30',
          title: 'a16z Future Summit — Opening Dinner',
          detail: 'Founders reception · DIFC One Central · Invite-only',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/activity-rooftop-lisbon.webp',
          price: 'Included in pass',
          localTip: 'Marc Andreessen typically attends the pre-dinner cocktails at 19:45. The DIFC terrace overlooks the Dubai skyline at golden hour — the best unscheduled conversations happen here.',
        },
      ],
    },
    {
      day: 'Wed, Mar 18 — Summit Day 2',
      items: [
        {
          time: '09:30',
          title: 'AI and the New Capital Stack',
          detail: 'Marc Andreessen · Main Stage, Dubai World Trade Centre',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k01.webp',
          price: 'Included in pass',
          localTip: 'DWTC main hall fills 20 min before doors. Rows 3–6 have the best sightlines for slide content. The side balconies have exceptional acoustics for mobile note-taking.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '14:00',
          title: 'Building in the Gulf: Regulatory Frontiers',
          detail: 'Panel · Room 4B, DWTC · Regional market deep-dive',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k02.webp',
          price: 'Included in pass',
          localTip: 'DIFC and ADGM free-zone representatives sit in the front row. The 15-min networking break before Q&A is the best window to meet Gulf regulatory and VC contacts.',
          transportAfter: { mode: 'taxi', duration: '20 min' },
        },
        {
          time: '20:00',
          title: 'Zuma Dubai',
          detail: 'Japanese robata grill · DIFC · Table for 1',
          category: 'dining' as EventCategory,
          imageUrl: '/fixture-images/restaurant-dishes-seafood.webp',
          price: 'AED 600–900/person (~$165–245)',
          localTip: 'Rock shrimp tempura and black cod in den miso are non-negotiable. The bar menu has the best Japanese whisky selection in the Gulf. Reserve 48 hrs ahead for a terrace table.',
        },
      ],
    },
    {
      day: 'Thu, Mar 19 — Return',
      items: [
        {
          time: '06:00',
          title: 'Gold Souk + Creek Abra',
          detail: 'Historic trading district · Deira · 2 hrs',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-fado-lisbon.webp',
          price: 'Free entry · AED 1 Abra ferry',
          localTip: 'Gold Souk vendors negotiate on 22k jewellery — expect 10–15% off the tag. The Spice Souk across the Creek has pure saffron at 1/3 of Western prices. The Abra water taxi (AED 1) is the best single-dirham experience in the UAE.',
          transportAfter: { mode: 'taxi', duration: '40 min', notes: 'To DXB Terminal 3' },
        },
        {
          time: '12:45',
          title: 'Emirates EK226 · DXB → SFO',
          detail: 'Business class · Suite 1A · Non-stop · 16h 30m',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-return-business-cabin.webp',
          price: '$5,100 Business Suite',
          localTip: 'Emirates T3 Business lounge (Concourse A) has a spa with complimentary 30-min massages — book 24h in advance via the Emirates app. The Moët & Chandon brunch buffet is open until boarding.',
        },
      ],
    },
  ],
}

const FIXTURE_LONDON: Itinerary = {
  destination: 'London, UK',
  dates: 'September 8–11, 2026',
  summary: 'London AI Summit 2026 · 4 days · Personalised for Noah',
  days: [
    {
      day: 'Tue, Sep 8 — Depart SFO',
      items: [
        {
          time: '17:25',
          title: 'British Airways BA286 · SFO → LHR',
          detail: 'Business class · Club Suite 1A · Non-stop · 9h 45m',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-outbound-business-cabin.webp',
          price: '$4,100 Club World',
          localTip: 'New Club Suites in rows 1–3 have full lie-flat beds with direct aisle access. Request the pre-flight Krug champagne — complimentary for Club World. The British classics dinner tray (fish & chips, sticky toffee pudding) is worth ordering.',
          transportAfter: { mode: 'train', duration: '45 min', notes: 'Heathrow Express · £37 to Paddington' },
        },
      ],
    },
    {
      day: 'Wed, Sep 9 — Arrive + Summit Day 1',
      items: [
        {
          time: '09:00',
          title: 'The Ned, London',
          detail: 'Check-in · Deluxe Room · Bank, City of London · Free cancellation until Sep 5',
          category: 'accommodation' as EventCategory,
          imageUrl: '/fixture-images/hotel-bairro-alto.webp',
          price: '£550/night (~$695)',
          localTip: 'The Ned has 9 restaurants and a rooftop pool. Millie\'s Lounge bar in the 1920s banking hall has the best pre-dinner cocktail atmosphere in the City. Ned\'s Club rooftop access is included — sunset over St Paul\'s is the payoff.',
          transportAfter: { mode: 'tube', duration: '18 min', notes: 'Central Line to Custom House (ExCeL)' },
        },
        {
          time: '11:00',
          title: 'AI Policy in the Age of Agents',
          detail: 'Mustafa Suleyman · Main Stage, ExCeL London',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k01.webp',
          price: 'Included in pass',
          localTip: 'ExCeL N4 Gallery overflow fills before the main hall — arrive 25 min early for a front-third seat. The side acoustic baffles make the left wall the best spot for clear Q&A audio.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '14:30',
          title: 'Responsible Scaling: A European Perspective',
          detail: 'Panel · Summit Hall B, ExCeL London',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k02.webp',
          price: 'Included in pass',
          localTip: 'UK AI Safety Institute delegates attend this panel. The informal networking drinks at 16:00 outside Hall B are the best opportunity to meet policy staff and DSIT officials before the dinner reception.',
          transportAfter: { mode: 'taxi', duration: '25 min' },
        },
        {
          time: '19:30',
          title: 'St. JOHN Bar and Restaurant',
          detail: 'Nose-to-tail British cuisine · Clerkenwell · Table for 1',
          category: 'dining' as EventCategory,
          imageUrl: '/fixture-images/restaurant-dishes-cod.webp',
          price: '£70–90/person',
          localTip: 'Bone marrow and parsley salad is the iconic starter — on the menu every day and non-negotiable. The Eccles cake with Lancashire cheese at dessert divides opinion but is essential once. Book 2 weeks ahead for Clerkenwell.',
        },
      ],
    },
    {
      day: 'Thu, Sep 10 — Summit Day 2',
      items: [
        {
          time: '10:00',
          title: 'Building AI-Native Products at Scale',
          detail: 'Workshop · Innovation Lab, ExCeL London · Hands-on format',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-w07.webp',
          price: 'Included in pass',
          localTip: 'The Innovation Lab provides workstations with live model access. The facilitator\'s annotated session notebook is shared only with active participants — contribute to the live coding sprint to get the full version.',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '15:00',
          title: 'Closing Summit Keynote',
          detail: 'Demis Hassabis · Main Stage, ExCeL London',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k08.webp',
          price: 'Included in pass',
          localTip: 'Demis\'s Q&A runs 20 minutes — the most substantive answers come from the last 5 questions. Stay seated and be specific. The hallway track outside Main Stage has the highest density of DeepMind researchers.',
          transportAfter: { mode: 'taxi', duration: '20 min' },
        },
        {
          time: '19:00',
          title: 'Borough Market Evening',
          detail: 'Street food + wine bars · London Bridge · 2 hrs',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-rooftop-lisbon.webp',
          price: '£30–50',
          localTip: 'Neal\'s Yard Dairy inside the market has the best Montgomery Cheddar and Stilton in London. Monmouth Coffee under the railway arch is the unofficial start of every Borough visit. The Arabica Bar & Kitchen terrace seats fill by 19:30.',
        },
      ],
    },
    {
      day: 'Fri, Sep 11 — Return',
      items: [
        {
          time: '07:00',
          title: 'Tate Modern at Opening',
          detail: 'Modern art · South Bank, Bankside · 1.5 hrs',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-fado-lisbon.webp',
          price: 'Free entry',
          localTip: 'The Turbine Hall commission changes annually and is always free — check online before visiting. Level 6 gives the best Thames and St Paul\'s view in London. Arrive before 08:30 to have it to yourself.',
          transportAfter: { mode: 'taxi', duration: '50 min', notes: 'To LHR Terminal 5' },
        },
        {
          time: '12:30',
          title: 'British Airways BA285 · LHR → SFO',
          detail: 'Business class · Club Suite 1A · Non-stop · 11h',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-return-business-cabin.webp',
          price: '$4,100 Club World',
          localTip: 'BA T5 Concorde Room has a dedicated bar and à la carte dining. The chef\'s afternoon tea starts at 10:30 — arrive 75 min before departure to enjoy it. The spa has a shower suite; book ahead via the T5 app.',
        },
      ],
    },
  ],
}

const DEMO_DESTINATIONS: Array<Itinerary & { flag: string; cityShort: string }> = [
  { ...FIXTURE_LISBON, flag: '🇵🇹', cityShort: 'Lisbon' },
  { ...FIXTURE_NYC, flag: '🗽', cityShort: 'New York' },
  { ...FIXTURE_TOKYO, flag: '🗼', cityShort: 'Tokyo' },
  { ...FIXTURE_DUBAI, flag: '🇦🇪', cityShort: 'Dubai' },
  { ...FIXTURE_LONDON, flag: '🇬🇧', cityShort: 'London' },
]

// ── Category styles (per YOU-750 spec) ────────────────────────────────────

const CATEGORY_STYLE: Record<EventCategory, { bg: string; icon: string; label: string }> = {
  conference:    { bg: '#EEF2FF', icon: '📅', label: 'Conference' },
  dining:        { bg: '#FFFBEB', icon: '🍽️', label: 'Dining' },
  explore:       { bg: '#ECFDF5', icon: '📍', label: 'Explore' },
  accommodation: { bg: '#F0F9FF', icon: '🏨', label: 'Stay' },
  other:         { bg: '#F9FAFB', icon: '✨', label: 'Other' },
}

// ── Transport mode icons (per YOU-750 spec) ───────────────────────────────

const TRANSPORT_ICON: Record<string, string> = {
  walk: '🚶', taxi: '🚕', metro: '🚇', tram: '🚊',
  ferry: '⛴️', bus: '🚌', car: '🚗', train: '🚆', uber: '🚗',
}

// ── EventCard — tappable, no × button (AC#1, AC#2) ───────────────────────

function EventCard({ item, onClick }: { item: ItineraryItem; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const cat = item.category ?? 'other'
  const catStyle = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      style={{ borderRadius: 12, background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}
    >
      {/* Full card is a single tap target — no × in read state (AC#1) */}
      <button
        onClick={onClick}
        aria-label={`View details for ${item.title}`}
        style={{
          display: 'block', width: '100%', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        {/* Image — full-width, 160px */}
        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          {item.imageUrl && !imgErr ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: catStyle.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 36 }}>{catStyle.icon}</span>
            </div>
          )}
          {/* Time chip (bottom-left) */}
          {item.time && (
            <div style={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
              borderRadius: 6, padding: '2px 8px',
            }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
            </div>
          )}
          {/* Category badge (top-left) */}
          <div style={{
            position: 'absolute', top: 8, left: 10,
            background: catStyle.bg, borderRadius: 6, padding: '2px 8px',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
              {catStyle.icon} {catStyle.label}
            </span>
          </div>
          {/* › chevron — tappability signifier (AC#2) */}
          <div style={{
            position: 'absolute', top: 8, right: 10,
            background: 'rgba(0,0,0,0.30)', borderRadius: '50%',
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>›</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '8px 12px 12px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.25 }}>
            {item.title}
          </p>
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
          }}>
            {item.detail}
          </p>
        </div>
      </button>
    </motion.div>
  )
}

// ── TransportLegPill (per YOU-750 spec) ───────────────────────────────────

function TransportLegPill({ leg }: { leg: TransportLeg }) {
  const icon = TRANSPORT_ICON[leg.mode.toLowerCase()] ?? '→'
  const label = `~${leg.duration}${leg.notes ? ` · ${leg.notes}` : ''}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(0,0,0,0.04)', borderRadius: 999,
        padding: '4px 12px', fontSize: 12, color: 'var(--text-tertiary)',
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
    </div>
  )
}

// ── PersonalizationTag (per YOU-750 spec) ─────────────────────────────────

function PersonalizationTag({ name = 'Jeevy' }: { name?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 0 16px' }}>
      <span style={{ fontSize: 11, color: '#818CF8' }}>✦</span>
      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Curated for you by {name}</span>
    </div>
  )
}

// ── ItemDetailSheet — AC#3: bottom sheet, 60vh, slide-up, scrim, swipe-dismiss ──

interface ItemDetailSheetProps {
  item: ItineraryItem | null
  onClose: () => void
  onRemove: (item: ItineraryItem) => void
  onChangeItem: (item: ItineraryItem) => void
}

function ItemDetailSheet({ item, onClose, onRemove, onChangeItem }: ItemDetailSheetProps) {
  const controls = useDragControls()
  const [imgErr, setImgErr] = useState(false)

  const cat = item?.category ?? 'other'
  const catStyle = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other

  useEffect(() => { setImgErr(false) }, [item?.title])

  // Close on Escape
  useEffect(() => {
    if (!item) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [item, onClose])

  // Lock body scroll
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [item])

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet — 60vh max, slide-up 300ms ease-out (AC#3) */}
          <motion.div
            drag="y"
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_: unknown, info: { offset: { y: number } }) => {
              if (info.offset.y > 80) onClose()
            }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{
              maxHeight: '60vh',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Drag handle */}
            <div
              style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, cursor: 'grab', flexShrink: 0 }}
              onPointerDown={e => controls.start(e)}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {/* Hero image — 160px per spec */}
              <div style={{ position: 'relative', height: 160, flexShrink: 0, overflow: 'hidden' }}>
                {item.imageUrl && !imgErr ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={() => setImgErr(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: catStyle.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 48 }}>{catStyle.icon}</span>
                  </div>
                )}
                {/* Time chip */}
                {item.time && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: 12,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    borderRadius: 6, padding: '3px 10px',
                  }}>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
                  </div>
                )}
                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 12,
                  background: catStyle.bg, borderRadius: 6, padding: '3px 10px',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
                    {catStyle.icon} {catStyle.label}
                  </span>
                </div>
              </div>

              {/* Title + detail + enrichment */}
              <div style={{ padding: '14px 16px 8px' }}>
                <h2 style={{
                  fontSize: 17, fontWeight: 700, color: 'var(--text-primary)',
                  margin: '0 0 6px', lineHeight: 1.3,
                }}>
                  {item.title}
                </h2>
                {item.detail && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                    {item.detail}
                  </p>
                )}
                {/* Price pill */}
                {item.price && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                    }}>
                      <span style={{ fontSize: 13 }}>💰</span>
                      {item.price}
                    </span>
                  </div>
                )}
                {/* Local tip callout */}
                {item.localTip && (
                  <div style={{
                    background: 'var(--accent-light, #EEF2FF)',
                    borderRadius: 10, padding: '10px 12px',
                    marginTop: 4, marginBottom: 4,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      ✦ Jeevy's tip
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {item.localTip}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons — sticky, min-h-44 (WCAG 2.5.5) (AC#3, AC#6) */}
            <div style={{
              padding: '12px 16px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              flexShrink: 0,
            }}>
              {/* Primary: Edit item inline — opens structured pre-fill form (YOU-759) */}
              <button
                onClick={() => onChangeItem(item)}
                style={{
                  width: '100%', minHeight: 44, borderRadius: 12,
                  background: 'var(--accent)', color: 'white',
                  fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  marginBottom: 8,
                }}
              >
                <span>✏️</span>
                <span>Edit item</span>
              </button>
              {/* Secondary: Remove from plan — removal moved inside sheet (AC#5) */}
              <button
                onClick={() => onRemove(item)}
                style={{
                  width: '100%', minHeight: 44, borderRadius: 12,
                  background: 'none', color: 'var(--text-secondary)',
                  fontWeight: 500, fontSize: 13,
                  border: '1px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                <span>🗑</span>
                <span>Remove from plan</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── AlterSheet — AC#4: accepts prefilledText for "Change this item" ───────

function AlterSheet({ onSubmit, onDismiss, isLoading, prefilledText = '' }: {
  onSubmit: (instruction: string) => void
  onDismiss: () => void
  isLoading: boolean
  prefilledText?: string
}) {
  const [draft, setDraft] = useState(prefilledText)
  const SUGGESTIONS = [
    'Make the pace more relaxed',
    'Add a seafood dinner on day 2',
    'Swap morning activity for a museum',
    'Add a rooftop bar in the evening',
  ]

  // Sync when prefilledText changes (re-opened for different item)
  useEffect(() => { setDraft(prefilledText) }, [prefilledText])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onDismiss} />
      <motion.div
        className="relative rounded-t-3xl pb-10 pt-6 px-5"
        style={{ background: 'var(--bg-secondary)' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
          Jeevy · Alter plan
        </p>
        <h2 className="text-[22px] font-semibold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          What would you like to change?
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setDraft(s)}
              className="text-[13px] px-3 py-1.5 rounded-full border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg)' }}>
              {s}
            </button>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={'e.g. "Move dinner somewhere in Alfama"'}
          rows={3}
          className="w-full rounded-2xl px-4 py-3 text-[15px] outline-none resize-none mb-4"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
        <button
          onClick={() => draft.trim() && onSubmit(draft.trim())}
          disabled={!draft.trim() || isLoading}
          className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--text-primary)' }}
        >
          {isLoading ? 'Updating your plan…' : 'Update my plan →'}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── DaySection ────────────────────────────────────────────────────────────

function DaySection({ day, removedKeys, editedItems, onOpen }: {
  day: ItineraryDay
  removedKeys: Set<string>
  editedItems: Map<string, ItineraryItem>
  onOpen: (item: ItineraryItem, key: string) => void
}) {
  const visibleItems = day.items.filter((_, i) => !removedKeys.has(`${day.day}:${i}`))
  if (visibleItems.length === 0) return null

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Sticky day header — bleeds through scroll container's 16px padding (AC1, AC2) */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        margin: '0 -16px',
        padding: '10px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
      }}>
        {day.day}
      </div>
      <div style={{ paddingTop: 8 }}>
        <AnimatePresence>
          {visibleItems.map((item, vi) => {
            const originalIndex = day.items.indexOf(item)
            const itemKey = `${day.day}:${originalIndex}`
            // Optimistic override: use locally-edited version if available
            const resolvedItem = editedItems.get(itemKey) ?? item
            const hasNextVisible = vi < visibleItems.length - 1
            const showLeg = !!resolvedItem.transportAfter && hasNextVisible
            return (
              <div key={itemKey}>
                <EventCard item={resolvedItem} onClick={() => onOpen(resolvedItem, itemKey)} />
                {showLeg && resolvedItem.transportAfter && <TransportLegPill leg={resolvedItem.transportAfter} />}
              </div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  itinerary?: Itinerary | null
  alterPlan?: (instruction: string) => Promise<void>
  alterStatus?: 'idle' | 'altering'
  loadStatus?: 'idle' | 'loading' | 'error'
  onStartOver?: () => void
}

export function S8ItineraryPeak({ itinerary, alterPlan, alterStatus = 'idle', loadStatus = 'idle', onStartOver }: Props) {
  const [alterOpen, setAlterOpen] = useState(false)
  const [alterPrefilledText, setAlterPrefilledText] = useState('')
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())
  // AC#3: item detail sheet state
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null)
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null)
  // YOU-759: inline edit sheet state
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null)
  const [editItemKey, setEditItemKey] = useState<string | null>(null)
  const [editedItems, setEditedItems] = useState<Map<string, ItineraryItem>>(new Map())
  // AC#5: undo toast state
  const [undoState, setUndoState] = useState<{ key: string; title: string } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Phase 4: demo destination selector (only active when no API itinerary)
  const [demoDestIdx, setDemoDestIdx] = useState(0)

  const display = itinerary ?? DEMO_DESTINATIONS[demoDestIdx]
  const isDemoMode = !itinerary

  useEffect(() => {
    if (itinerary && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [itinerary])

  // Cleanup undo timer
  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  async function handleAlterSubmit(instruction: string) {
    if (!alterPlan) return
    setAlterOpen(false)
    setAlterPrefilledText('')
    setRemovedKeys(new Set())
    await alterPlan(instruction)
  }

  // AC#3: open detail sheet
  const handleOpenItem = useCallback((item: ItineraryItem, key: string) => {
    setActiveItem(item)
    setActiveItemKey(key)
  }, [])

  const handleCloseSheet = useCallback(() => {
    setActiveItem(null)
    setActiveItemKey(null)
  }, [])

  // AC#5: remove via sheet → undo toast (removal moved inside sheet)
  const handleRemoveItem = useCallback((item: ItineraryItem) => {
    if (!activeItemKey) return
    const key = activeItemKey
    setRemovedKeys(prev => new Set([...prev, key]))
    setActiveItem(null)
    setActiveItemKey(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoState({ key, title: item.title })
    undoTimerRef.current = setTimeout(() => setUndoState(null), 5000)
  }, [activeItemKey])

  const handleUndoRemove = useCallback(() => {
    if (!undoState) return
    setRemovedKeys(prev => {
      const next = new Set(prev)
      next.delete(undoState.key)
      return next
    })
    setUndoState(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }, [undoState])

  // YOU-759: "Edit item" → open structured inline edit form (pre-filled, no AI)
  const handleChangeItem = useCallback((item: ItineraryItem) => {
    setEditItem(item)
    setEditItemKey(activeItemKey)
    setActiveItem(null)
    setActiveItemKey(null)
  }, [activeItemKey])

  const handleSaveEdit = useCallback((updated: ItineraryItem) => {
    if (editItemKey) {
      setEditedItems(prev => new Map(prev).set(editItemKey, updated))
    }
    setEditItem(null)
    setEditItemKey(null)
  }, [editItemKey])

  const handleCancelEdit = useCallback(() => {
    setEditItem(null)
    setEditItemKey(null)
  }, [])

  const HERO_FALLBACKS: Record<string, string> = {
    'Lisbon, Portugal': '/fixture-images/city-lisbon.webp',
    'New York City, NY': '/fixture-images/flight-outbound-business-cabin.webp',
    'Tokyo, Japan': '/fixture-images/flight-outbound-business-cabin.webp',
    'Dubai, UAE': '/fixture-images/activity-rooftop-lisbon.webp',
    'London, UK': '/fixture-images/activity-fado-lisbon.webp',
  }
  const heroImage = display.days[0]?.items[0]?.imageUrl ?? HERO_FALLBACKS[display.destination] ?? '/fixture-images/city-lisbon.webp'
  const busy = alterStatus === 'altering' || loadStatus === 'loading'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={heroImage}
          alt={display.destination}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.05) brightness(0.88)' }}
          onError={e => { (e.target as HTMLImageElement).src = '/fixture-images/city-lisbon.webp' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, var(--bg-secondary) 100%)',
        }} />

        {/* ← Back — min 44px tap target (AC#6) */}
        {onStartOver && (
          <button onClick={onStartOver} style={{
            position: 'absolute', top: 52, left: 16,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
            border: 'none', borderRadius: 999,
            minHeight: 44, padding: '0 16px',
            color: 'white', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            ← Back
          </button>
        )}

        <div style={{ position: 'absolute', bottom: 12, left: 20 }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', margin: 0 }}>
            {display.destination}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '2px 0 0' }}>
            {display.dates} · Ready to go
          </p>
        </div>
      </div>

      {/* Phase 4: destination picker — only shown in demo mode */}
      {isDemoMode && (
        <div style={{
          display: 'flex', gap: 8, padding: '12px 16px 4px',
          overflowX: 'auto', flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {DEMO_DESTINATIONS.map((dest, i) => (
            <button
              key={dest.cityShort}
              onClick={() => {
                setDemoDestIdx(i)
                setRemovedKeys(new Set())
                setEditedItems(new Map())
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 999, border: 'none',
                cursor: 'pointer', flexShrink: 0, fontSize: 13, fontWeight: 600,
                transition: 'background 0.15s, color 0.15s',
                background: i === demoDestIdx ? 'var(--text-primary)' : 'var(--bg)',
                color: i === demoDestIdx ? 'white' : 'var(--text-secondary)',
                boxShadow: i === demoDestIdx ? '0 2px 8px rgba(0,0,0,0.18)' : '0 0 0 1px var(--border)',
              }}
            >
              <span style={{ fontSize: 15 }}>{dest.flag}</span>
              {dest.cityShort}
            </button>
          ))}
        </div>
      )}

      {/* Personalization + status banners */}
      <div style={{ padding: '4px 20px 0' }}>
        <PersonalizationTag name="Jeevy" />

        <AnimatePresence>
          {(loadStatus === 'loading' || alterStatus === 'altering') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                borderRadius: 10, background: 'var(--accent-light)',
                padding: '10px 14px', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <motion.div
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)', margin: 0 }}>
                {alterStatus === 'altering' ? 'Jeevy is updating your plan…' : 'Building your personalised itinerary…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card stack */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 16px 200px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {display.days.map(day => (
            <DaySection
              key={day.day}
              day={day}
              removedKeys={removedKeys}
              editedItems={editedItems}
              onOpen={handleOpenItem}
            />
          ))}
        </div>
      </div>

      {/* Sticky CTA bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 34px',
        background: 'linear-gradient(to top, var(--bg-secondary) 80%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Add to Calendar — already ≥44px */}
          <button
            style={{
              width: '100%', padding: '16px 0', borderRadius: 16,
              background: 'var(--text-primary)', color: 'white',
              fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
            }}
          >
            Add to Calendar
          </button>

          {/* ✏️ Change something? — min 44px tap target (AC#6) */}
          {alterPlan && (
            <button
              onClick={() => !busy && (setAlterPrefilledText(''), setAlterOpen(true))}
              disabled={busy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'none', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                color: 'var(--text-secondary)', fontSize: 14,
                minHeight: 44, padding: '0 8px',
                opacity: busy ? 0.4 : 1, transition: 'opacity 0.15s',
              }}
            >
              <span>✏️</span>
              <span>Change something?</span>
            </button>
          )}

          {/* Share trip — min 44px tap target (AC#6) */}
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 14,
              minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Share trip
          </button>
        </div>
      </div>

      {/* AC#3: Item Detail Bottom Sheet */}
      <ItemDetailSheet
        item={activeItem}
        onClose={handleCloseSheet}
        onRemove={handleRemoveItem}
        onChangeItem={handleChangeItem}
      />

      {/* YOU-759: Inline edit sheet — structured pre-fill form for transport/restaurant/flight */}
      <ItemEditSheet
        item={editItem}
        onSave={handleSaveEdit}
        onClose={handleCancelEdit}
      />

      {/* AC#5: Undo toast — 5s, appears above sticky bar */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            className="fixed left-0 right-0 z-30 flex justify-center px-4 pointer-events-none"
            style={{ bottom: 120 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              padding: '12px 16px', maxWidth: 360, width: '100%',
              pointerEvents: 'auto',
            }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Removed <strong style={{ color: 'var(--text-primary)' }}>{undoState.title}</strong>
              </span>
              <button
                onClick={handleUndoRemove}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent)', fontWeight: 700, fontSize: 13,
                  flexShrink: 0, minHeight: 44, minWidth: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alter sheet */}
      <AnimatePresence>
        {alterOpen && (
          <AlterSheet
            onSubmit={handleAlterSubmit}
            onDismiss={() => { setAlterOpen(false); setAlterPrefilledText('') }}
            isLoading={alterStatus === 'altering'}
            prefilledText={alterPrefilledText}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
