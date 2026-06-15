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
          alternatives: [
            { name: 'Memmo Alfama Hotel', tagline: 'Design boutique · Tagus river views' },
            { name: 'Palácio Belmonte', tagline: 'Historic 15th-c. palace · Castle hill' },
          ],
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
          alternatives: [
            { name: 'Taberna da Rua das Flores', tagline: 'Local petiscos · Hidden gem, Chiado' },
            { name: 'Solar dos Presuntos', tagline: 'Traditional Lisbon classics · Avenida' },
          ],
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
          alternatives: [
            { name: 'The Greenwich Hotel', tagline: 'Boutique TriBeCa · Robert De Niro\'s hotel' },
            { name: 'Aman New York', tagline: 'Crown Building · Finest suites in Midtown' },
          ],
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
          alternatives: [
            { name: 'Per Se', tagline: 'French tasting menu · Columbus Circle views' },
            { name: 'Le Bernardin', tagline: 'Premier seafood fine dining · Midtown' },
          ],
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
          alternatives: [
            { name: 'Aman Tokyo', tagline: 'Minimalist luxury · Otemachi skyline views' },
            { name: 'The Peninsula Tokyo', tagline: 'Marunouchi · Imperial Palace views' },
          ],
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
          alternatives: [
            { name: 'Narisawa', tagline: 'Innovative Japanese cuisine · 2 Michelin stars' },
            { name: "L'Effervescence", tagline: 'French-Japanese fusion · Nishiazabu' },
          ],
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
          alternatives: [
            { name: 'Burj Al Arab Jumeirah', tagline: 'Iconic sail-shaped tower · Private beach' },
            { name: 'Four Seasons DIFC', tagline: 'Contemporary luxury · Financial district' },
          ],
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
          alternatives: [
            { name: 'Nobu Dubai', tagline: 'Japanese-Peruvian · Atlantis The Palm' },
            { name: 'Coya Dubai', tagline: 'Peruvian cuisine · DIFC · vibrant rooftop' },
          ],
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
          alternatives: [
            { name: "Claridge's", tagline: 'Art deco landmark · Mayfair · quintessentially London' },
            { name: 'The Dorchester', tagline: 'Park Lane icon · Hyde Park views' },
          ],
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
          alternatives: [
            { name: 'The Clove Club', tagline: 'Modern British · Shoreditch · tasting menu' },
            { name: 'Brat', tagline: 'Wood-fire cooking · Shoreditch · Basque-inspired' },
          ],
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
  {
    ...FIXTURE_LISBON,
    flag: '🇵🇹', cityShort: 'Lisbon',
    heroImageUrl: '/fixture-images/city-lisbon.webp',
    tripPrice: '~$7,500 total estimated',
    tripLocalTip: 'Start every morning at Pastéis de Belém — get there before 9 AM for no queue. The #28 tram from Martim Moniz to Prazeres shows you the whole city for €3. Always pay by card: taxi drivers give better service when they can\'t round up.',
  },
  {
    ...FIXTURE_NYC,
    flag: '🗽', cityShort: 'New York',
    heroImageUrl: '/fixture-images/conference-altice-arena-venue.webp',
    tripPrice: '~$4,200 total estimated',
    tripLocalTip: 'Pre-book all restaurants — NYC waitlists fill within the week. The High Line is 3 blocks from Javits Center, perfect for a 20-min recharge between sessions. Citi Bike beats cabs for anything under 30 blocks.',
  },
  {
    ...FIXTURE_TOKYO,
    flag: '🗼', cityShort: 'Tokyo',
    heroImageUrl: '/fixture-images/activity-rooftop-lisbon.webp',
    tripPrice: '~$6,200 total estimated',
    tripLocalTip: 'Get a Suica card at the airport arrivals hall — works on all trains, buses, and 7-Eleven. The basement food halls (depachika) in Shibuya Scramble Square serve Michelin-quality food at ¥800–1,200. Konbini breakfast beats any hotel buffet.',
  },
  {
    ...FIXTURE_DUBAI,
    flag: '🇦🇪', cityShort: 'Dubai',
    heroImageUrl: '/fixture-images/hotel-marriott-lisbon-exterior.webp',
    tripPrice: '~$5,800 total estimated',
    tripLocalTip: 'Friday brunch is mandatory — even modest hotel spreads are extraordinary. Metro Gold Class covers all major conference venues for AED 8.50. Book restaurant tables 2 weeks ahead; Dubai gets booked faster than London.',
  },
  {
    ...FIXTURE_LONDON,
    flag: '🇬🇧', cityShort: 'London',
    heroImageUrl: '/fixture-images/activity-fado-lisbon.webp',
    tripPrice: '~$5,400 total estimated',
    tripLocalTip: 'Oyster card beats contactless: the daily cap kicks in at £9.10. The Churchill War Rooms café does the best sandwich near Westminster, queue moves fast at 11 AM. Ask the hotel concierge for a black cab tip — they know routes Google Maps doesn\'t.',
  },
]

// ── Category styles ────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<EventCategory, { bg: string; icon: string; label: string }> = {
  conference:    { bg: '#EEF2FF', icon: '📅', label: 'Conference' },
  dining:        { bg: '#FFFBEB', icon: '🍽️', label: 'Dining' },
  explore:       { bg: '#ECFDF5', icon: '📍', label: 'Explore' },
  accommodation: { bg: '#F0F9FF', icon: '🏨', label: 'Stay' },
  other:         { bg: '#F9FAFB', icon: '✨', label: 'Other' },
}

// ── Transport helpers ──────────────────────────────────────────────────────

const TRANSPORT_ICON: Record<string, string> = {
  walk: '🚶', taxi: '🚕', metro: '🚇', tram: '🚊',
  ferry: '⛴️', bus: '🚌', car: '🚗', train: '🚆', uber: '🚗', tube: '🚇',
}

const STANDARD_MODES = ['taxi', 'metro', 'walk'] as const
type StandardMode = typeof STANDARD_MODES[number]

const MODE_META: Record<StandardMode, { icon: string; label: string }> = {
  taxi:  { icon: '🚕', label: 'Taxi' },
  metro: { icon: '🚇', label: 'Metro' },
  walk:  { icon: '🚶', label: 'Walk' },
}

function parseMinutes(duration: string): number {
  const m = duration.match(/(\d+)/)
  return m ? parseInt(m[1], 10) : 15
}

function getModeDuration(baseDuration: string, mode: StandardMode): string {
  const base = parseMinutes(baseDuration)
  if (mode === 'metro') return `~${base + 10} min`
  if (mode === 'walk') return `~${base + 20} min`
  return `~${base} min`
}

function getModePrice(mode: StandardMode, notes?: string): string {
  if (mode === 'walk') return 'Free'
  if (mode === 'metro') return '€1.50'
  if (notes) {
    const m = notes.match(/[€$£¥][\d,.]+|[\d,.]+\s*[€$£¥]/)
    if (m) return m[0]
  }
  return '—'
}

// ── DestinationAccordionCard ──────────────────────────────────────────────

interface DestinationAccordionCardProps {
  dest: typeof DEMO_DESTINATIONS[0]
  isSelected: boolean
  isExpanded: boolean
  onExpand: () => void
}

function DestinationAccordionCard({ dest, isSelected, isExpanded, onExpand }: DestinationAccordionCardProps) {
  const [imgErr, setImgErr] = useState(false)
  const initial = dest.destination.charAt(0).toUpperCase()

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Show details for ${dest.destination}`}
      onClick={onExpand}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand() } }}
      style={{
        borderRadius: 12, background: '#FFFFFF', cursor: 'pointer',
        border: isSelected ? '1.5px solid var(--accent)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
        outline: 'none',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', minHeight: 80,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 8, overflow: 'hidden',
          flexShrink: 0, background: '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {dest.heroImageUrl && !imgErr ? (
            <img
              src={dest.heroImageUrl} alt={dest.destination}
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <span style={{ fontSize: 24, fontWeight: 500, color: '#9CA3AF' }}>{initial}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 16, fontWeight: 600, color: 'var(--text-primary)',
            margin: 0, lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {dest.flag} {dest.destination}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
            {dest.dates}
          </p>
        </div>
        <span style={{
          fontSize: 18, color: '#9CA3AF', flexShrink: 0, lineHeight: 1,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms ease',
          display: 'flex', alignItems: 'center',
        }}>⌄</span>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {dest.heroImageUrl && !imgErr ? (
              <div style={{ position: 'relative', width: '100%', maxHeight: 220, overflow: 'hidden' }}>
                <img
                  src={dest.heroImageUrl} alt={dest.destination}
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', maxHeight: 220 }}
                />
              </div>
            ) : null}
            <p style={{
              fontSize: 13, color: '#374151', padding: '12px 16px 0',
              margin: 0, lineHeight: 1.55,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const,
            }}>
              {dest.summary}
            </p>
            {dest.tripLocalTip && (
              <div style={{
                margin: '10px 16px 0',
                borderLeft: '4px solid #FBBF24', background: '#FFFBEB',
                borderRadius: '0 8px 8px 0', padding: '10px 12px',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#B45309', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Local tip
                </p>
                <p style={{
                  fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.55,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const,
                }}>
                  {dest.tripLocalTip}
                </p>
              </div>
            )}
            {dest.tripPrice && (
              <p style={{
                fontSize: 13, fontWeight: 600, color: '#111827',
                padding: '10px 16px 14px', margin: 0,
              }}>
                {dest.tripPrice}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── EventCard — tappable with optional applied badge ──────────────────────

function EventCard({ item, onClick, showAppliedBadge }: {
  item: ItineraryItem
  onClick: () => void
  showAppliedBadge?: boolean
}) {
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
      <button
        onClick={onClick}
        aria-label={`View details for ${item.title}`}
        style={{
          display: 'block', width: '100%', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
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
          {item.time && (
            <div style={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
              borderRadius: 6, padding: '2px 8px',
            }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
            </div>
          )}
          <div style={{
            position: 'absolute', top: 8, left: 10,
            background: catStyle.bg, borderRadius: 6, padding: '2px 8px',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
              {catStyle.icon} {catStyle.label}
            </span>
          </div>
          {/* Applied badge replaces chevron for 2500ms */}
          <AnimatePresence>
            {showAppliedBadge ? (
              <motion.div
                key="badge"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute', top: 8, right: 10,
                  background: 'var(--accent)', color: 'white',
                  fontSize: 10, fontWeight: 600,
                  borderRadius: 999, padding: '2px 8px',
                  pointerEvents: 'none',
                }}
              >
                ✓ Updated
              </motion.div>
            ) : (
              <motion.div
                key="chevron"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', top: 8, right: 10,
                  background: 'rgba(0,0,0,0.30)', borderRadius: '50%',
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>›</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

// ── TransportLegPill — interactive inline mode picker ─────────────────────

function TransportLegPill({
  leg, itemKey, selectedMode, onModeChange,
}: {
  leg: TransportLeg
  itemKey: string
  selectedMode: string
  onModeChange: (key: string, mode: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isCustomMode = selectedMode !== leg.mode
  const currentIcon = TRANSPORT_ICON[selectedMode.toLowerCase()] ?? '→'
  const isSpecialMode = !(STANDARD_MODES as readonly string[]).includes(leg.mode)
  const label = isOpen
    ? '⇄'
    : `~${leg.duration}${leg.notes ? ` · ${leg.notes}` : ''}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

      {/* Tappable pill */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label={`Transport: ${selectedMode}. Tap to change`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(0,0,0,0.04)', borderRadius: 999,
          padding: '4px 12px', fontSize: 12,
          color: 'var(--text-tertiary)',
          border: isCustomMode ? '1px solid rgba(28,110,242,0.3)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ fontSize: 13 }}>{currentIcon}</span>
        <span>{label}</span>
        <span style={{ fontSize: 11, opacity: 0.5 }}>⇄</span>
      </button>

      {/* Inline picker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md, 10px)',
              padding: '10px', margin: '4px 16px',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--text-tertiary)', margin: '0 0 8px',
              }}>
                Transport
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${isSpecialMode ? 4 : 3}, 1fr)`,
                gap: 6,
              }}>
                {STANDARD_MODES.map(mode => {
                  const isSelected = selectedMode === mode
                  const duration = getModeDuration(leg.duration, mode)
                  const price = getModePrice(mode, leg.notes)
                  return (
                    <button
                      key={mode}
                      onClick={() => { onModeChange(itemKey, mode); setIsOpen(false) }}
                      style={{
                        minHeight: 72, borderRadius: 'var(--radius-md, 10px)',
                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent-light, rgba(28,110,242,0.08))' : 'var(--bg)',
                        cursor: 'pointer', padding: '6px 4px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{MODE_META[mode].icon}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      }}>
                        {MODE_META[mode].label}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{duration}</span>
                      <span style={{
                        fontSize: 10,
                        color: price === 'Free' ? 'var(--accent)' : 'var(--text-secondary)',
                      }}>
                        {price}
                      </span>
                    </button>
                  )
                })}
                {/* Special mode tile (train/tube/ferry) — read-only */}
                {isSpecialMode && (
                  <div style={{
                    minHeight: 72, borderRadius: 'var(--radius-md, 10px)',
                    border: `1px solid ${(!(STANDARD_MODES as readonly string[]).includes(selectedMode)) ? 'var(--accent)' : 'var(--border)'}`,
                    background: (!(STANDARD_MODES as readonly string[]).includes(selectedMode)) ? 'var(--accent-light, rgba(28,110,242,0.08))' : 'var(--bg-secondary)',
                    padding: '6px 4px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 2,
                    opacity: 0.7,
                  }}>
                    <span style={{ fontSize: 18 }}>{TRANSPORT_ICON[leg.mode] ?? '→'}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      {leg.mode.charAt(0).toUpperCase() + leg.mode.slice(1)}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{`~${leg.duration}`}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Fixed</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '100%', marginTop: 8, padding: '8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center',
                }}
              >
                Cancel ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
    </div>
  )
}

// ── PersonalizationTag ─────────────────────────────────────────────────────

function PersonalizationTag({ name = 'Jeevy' }: { name?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 0 16px' }}>
      <span style={{ fontSize: 11, color: '#818CF8' }}>✦</span>
      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Curated for you by {name}</span>
    </div>
  )
}

// ── PersonalizationBar — fixed above sticky CTA ───────────────────────────

function PersonalizationBar({
  chips, onOpen, onRemoveChip, isAltering, flashActive,
}: {
  chips: string[]
  onOpen: () => void
  onRemoveChip: (chip: string) => void
  isAltering: boolean
  flashActive: boolean
}) {
  const hasChips = chips.length > 0

  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center',
      padding: '0 20px',
      background: flashActive ? 'var(--accent-light, rgba(28,110,242,0.08))' : 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      gap: 8,
      transition: 'background 0.2s',
    }}>
      {!hasChips ? (
        <button
          onClick={onOpen}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 13,
            minHeight: 44, padding: '0',
            display: 'flex', alignItems: 'center', gap: 4,
            marginLeft: 'auto',
          }}
        >
          <span>✨</span>
          <span>Adjust this trip</span>
        </button>
      ) : (
        <>
          <span style={{ fontSize: 10, color: '#818CF8', flexShrink: 0 }}>✦</span>
          <motion.div
            animate={isAltering ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={isAltering
              ? { duration: 0.8, repeat: Infinity, repeatType: 'loop' }
              : { duration: 0.2 }}
            style={{
              flex: 1, overflowX: 'auto', display: 'flex', gap: 6, alignItems: 'center',
              scrollbarWidth: 'none',
            }}
          >
            <AnimatePresence>
              {chips.map(chip => (
                <motion.div
                  key={chip}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, width: 0, marginRight: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 2,
                    background: 'rgba(28,110,242,0.08)',
                    border: '1px solid rgba(28,110,242,0.2)',
                    borderRadius: 999,
                    padding: '2px 2px 2px 8px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                    {chip.length > 20 ? chip.slice(0, 20) + '…' : chip}
                  </span>
                  <button
                    onClick={() => onRemoveChip(chip)}
                    aria-label={`Remove ${chip} preference`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(28,110,242,0.6)', fontSize: 12,
                      padding: '0 6px', lineHeight: 1,
                      minWidth: 24, minHeight: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {!isAltering ? (
            <button
              onClick={onOpen}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: 12,
                flexShrink: 0, whiteSpace: 'nowrap',
                minHeight: 44, padding: '0 4px',
                display: 'flex', alignItems: 'center',
              }}
            >
              + Adjust more
            </button>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
              Jeevy is updating…
            </span>
          )}
        </>
      )}
    </div>
  )
}

// ── ItemDetailSheet ───────────────────────────────────────────────────────

interface ItemDetailSheetProps {
  item: ItineraryItem | null
  onClose: () => void
  onRemove: (item: ItineraryItem) => void
  onChangeItem: (item: ItineraryItem) => void
  onSwapItem: (alt: { name: string; tagline?: string; imageUrl?: string }) => void
}

function ItemDetailSheet({ item, onClose, onRemove, onChangeItem, onSwapItem }: ItemDetailSheetProps) {
  const controls = useDragControls()
  const [imgErr, setImgErr] = useState(false)

  const cat = item?.category ?? 'other'
  const catStyle = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other

  useEffect(() => { setImgErr(false) }, [item?.title])

  useEffect(() => {
    if (!item) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [item, onClose])

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

          {/* Sheet */}
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
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${item.title}`}
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
              {/* Hero image */}
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
                {item.time && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: 12,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    borderRadius: 6, padding: '3px 10px',
                  }}>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
                  </div>
                )}
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

                {/* Jeevy Alternatives strip */}
                {item.alternatives && item.alternatives.length > 0 && (
                  <div style={{
                    marginTop: 12,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                    <p style={{
                      fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      margin: 0, padding: '8px 12px 6px',
                      fontFamily: 'monospace',
                    }}>
                      Jeevy's picks
                    </p>
                    {item.alternatives.map((alt, i) => (
                      <button
                        key={alt.name}
                        onClick={() => onSwapItem(alt)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', background: 'none', border: 'none',
                          borderTop: i === 0 ? '1px solid var(--border)' : '1px solid var(--border)',
                          cursor: 'pointer', padding: '10px 12px',
                          textAlign: 'left',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                      >
                        {/* Alt thumbnail */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: catStyle.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          {alt.imageUrl ? (
                            <img src={alt.imageUrl} alt={alt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: 18 }}>{catStyle.icon}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                            {alt.name}
                          </p>
                          {alt.tagline && (
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                              {alt.tagline}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-tertiary)', flexShrink: 0 }}>›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              padding: '12px 16px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              flexShrink: 0,
            }}>
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
                <span>Change this item</span>
              </button>
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

// ── AlterSheet ────────────────────────────────────────────────────────────

function AlterSheet({ onSubmit, onDismiss, isLoading, prefilledText = '', mode = 'alter' }: {
  onSubmit: (instruction: string) => void
  onDismiss: () => void
  isLoading: boolean
  prefilledText?: string
  mode?: 'alter' | 'personalize'
}) {
  const [draft, setDraft] = useState(prefilledText)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDismiss])

  const SUGGESTIONS_ALTER = [
    'Make the pace more relaxed',
    'Add a seafood dinner on day 2',
    'Swap morning activity for a museum',
    'Add a rooftop bar in the evening',
  ]

  const SUGGESTIONS_PERSONALIZE = [
    'More food experiences',
    'Slower pace, add breaks',
    'More local & off-the-beaten-path',
    'Skip the nightlife',
    'Earlier starts',
    'Add a cultural activity',
  ]

  const suggestions = mode === 'personalize' ? SUGGESTIONS_PERSONALIZE : SUGGESTIONS_ALTER
  const title = mode === 'personalize' ? 'What do you want more (or less) of?' : 'What would you like to change?'
  const placeholder = mode === 'personalize' ? 'e.g. "more food stops", "less packed schedule"' : 'e.g. "Move dinner somewhere in Alfama"'
  const ctaLabel = mode === 'personalize' ? 'Apply preference →' : 'Update my plan →'

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', flex: 1 }} />
          <button
            onClick={onDismiss}
            aria-label="Close"
            style={{
              marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 20, lineHeight: 1,
              padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center',
            }}
          >×</button>
        </div>
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
          {mode === 'personalize' ? 'Jeevy · Personalise' : 'Jeevy · Alter plan'}
        </p>
        <h2 className="text-[22px] font-semibold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map(s => (
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
          placeholder={placeholder}
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
          {isLoading ? 'Updating your plan…' : ctaLabel}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── DaySection ────────────────────────────────────────────────────────────

function DaySection({
  day, removedKeys, editedItems, onOpen,
  appliedBadgeKeys, transportModes, onTransportModeChange,
}: {
  day: ItineraryDay
  removedKeys: Set<string>
  editedItems: Map<string, ItineraryItem>
  onOpen: (item: ItineraryItem, key: string) => void
  appliedBadgeKeys: Set<string>
  transportModes: Map<string, string>
  onTransportModeChange: (key: string, mode: string) => void
}) {
  const visibleItems = day.items.filter((_, i) => !removedKeys.has(`${day.day}:${i}`))
  if (visibleItems.length === 0) return null

  return (
    <div style={{ paddingBottom: 24 }}>
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
            const resolvedItem = editedItems.get(itemKey) ?? item
            const hasNextVisible = vi < visibleItems.length - 1
            const showLeg = !!resolvedItem.transportAfter && hasNextVisible
            const selectedMode = transportModes.get(itemKey) ?? resolvedItem.transportAfter?.mode ?? 'taxi'
            return (
              <div key={itemKey}>
                <EventCard
                  item={resolvedItem}
                  onClick={() => onOpen(resolvedItem, itemKey)}
                  showAppliedBadge={appliedBadgeKeys.has(itemKey)}
                />
                {showLeg && resolvedItem.transportAfter && (
                  <TransportLegPill
                    leg={resolvedItem.transportAfter}
                    itemKey={itemKey}
                    selectedMode={selectedMode}
                    onModeChange={onTransportModeChange}
                  />
                )}
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
  const [alterMode, setAlterMode] = useState<'alter' | 'personalize'>('alter')
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null)
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null)
  const [editItemKey, setEditItemKey] = useState<string | null>(null)
  const [editedItems, setEditedItems] = useState<Map<string, ItineraryItem>>(new Map())
  const [undoState, setUndoState] = useState<{ key: string; title: string; type?: 'item' | 'chip' } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [demoDestIdx, setDemoDestIdx] = useState(0)
  const [expandedDestIdx, setExpandedDestIdx] = useState<number | null>(0)
  // Phase 5 state
  const [appliedBadgeKeys, setAppliedBadgeKeys] = useState<Set<string>>(new Set())
  const appliedBadgeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const [transportModes, setTransportModes] = useState<Map<string, string>>(new Map())
  const [preferenceChips, setPreferenceChips] = useState<string[]>([])
  const [barFlash, setBarFlash] = useState(false)
  const [submitToast, setSubmitToast] = useState<string | null>(null)
  const submitToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [prevDetailItem, setPrevDetailItem] = useState<ItineraryItem | null>(null)
  const [prevDetailItemKey, setPrevDetailItemKey] = useState<string | null>(null)
  const prevAlterStatusRef = useRef(alterStatus)

  const display = itinerary ?? DEMO_DESTINATIONS[demoDestIdx]
  const isDemoMode = !itinerary

  useEffect(() => {
    if (itinerary && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [itinerary])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      appliedBadgeTimersRef.current.forEach(t => clearTimeout(t))
    }
  }, [])

  // Bar flash when altering finishes
  useEffect(() => {
    if (prevAlterStatusRef.current === 'altering' && alterStatus === 'idle' && preferenceChips.length > 0) {
      setBarFlash(true)
      const t = setTimeout(() => setBarFlash(false), 200)
      return () => clearTimeout(t)
    }
    prevAlterStatusRef.current = alterStatus
  }, [alterStatus, preferenceChips.length])

  const showAppliedBadgeForKey = useCallback((key: string) => {
    setAppliedBadgeKeys(prev => new Set([...prev, key]))
    if (appliedBadgeTimersRef.current.has(key)) {
      clearTimeout(appliedBadgeTimersRef.current.get(key)!)
    }
    const timer = setTimeout(() => {
      setAppliedBadgeKeys(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      appliedBadgeTimersRef.current.delete(key)
    }, 2500)
    appliedBadgeTimersRef.current.set(key, timer)
  }, [])

  function showSubmitToast(msg: string) {
    if (submitToastTimerRef.current) clearTimeout(submitToastTimerRef.current)
    setSubmitToast(msg)
    submitToastTimerRef.current = setTimeout(() => setSubmitToast(null), 3000)
  }

  async function handleAlterSubmit(instruction: string) {
    if (alterMode === 'personalize') {
      setPreferenceChips(prev => [...prev, instruction])
      setAlterOpen(false)
      setAlterPrefilledText('')
      if (alterPlan) {
        await alterPlan(`Apply this preference to the itinerary: ${instruction}`)
      } else {
        showSubmitToast('Preference saved — Jeevy will apply it to your plan')
      }
    } else {
      setAlterOpen(false)
      setAlterPrefilledText('')
      if (alterPlan) {
        setRemovedKeys(new Set())
        await alterPlan(instruction)
      } else {
        showSubmitToast('Plan update noted — Jeevy is on it')
      }
    }
  }

  const handleOpenItem = useCallback((item: ItineraryItem, key: string) => {
    setActiveItem(item)
    setActiveItemKey(key)
  }, [])

  const handleCloseSheet = useCallback(() => {
    setActiveItem(null)
    setActiveItemKey(null)
  }, [])

  const handleRemoveItem = useCallback((item: ItineraryItem) => {
    if (!activeItemKey) return
    const key = activeItemKey
    setRemovedKeys(prev => new Set([...prev, key]))
    setActiveItem(null)
    setActiveItemKey(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoState({ key, title: item.title, type: 'item' })
    undoTimerRef.current = setTimeout(() => setUndoState(null), 5000)
  }, [activeItemKey])

  const handleUndoRemove = useCallback(() => {
    if (!undoState) return
    if (undoState.type === 'chip') {
      setPreferenceChips(prev => [...prev, undoState.key])
    } else {
      setRemovedKeys(prev => {
        const next = new Set(prev)
        next.delete(undoState.key)
        return next
      })
    }
    setUndoState(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }, [undoState])

  // "Change this item" — open edit sheet with back nav
  const handleChangeItem = useCallback((item: ItineraryItem) => {
    setPrevDetailItem(item)
    setPrevDetailItemKey(activeItemKey)
    setEditItem(item)
    setEditItemKey(activeItemKey)
    setActiveItem(null)
    setActiveItemKey(null)
  }, [activeItemKey])

  // ← Back from edit sheet → reopen detail sheet
  const handleBackFromEdit = useCallback(() => {
    setEditItem(null)
    setEditItemKey(null)
    setActiveItem(prevDetailItem)
    setActiveItemKey(prevDetailItemKey)
  }, [prevDetailItem, prevDetailItemKey])

  const handleSaveEdit = useCallback((updated: ItineraryItem) => {
    if (editItemKey) {
      setEditedItems(prev => new Map(prev).set(editItemKey, updated))
      showAppliedBadgeForKey(editItemKey)
    }
    setEditItem(null)
    setEditItemKey(null)
  }, [editItemKey, showAppliedBadgeForKey])

  const handleCancelEdit = useCallback(() => {
    setEditItem(null)
    setEditItemKey(null)
  }, [])

  // Optimistic swap from alternatives strip
  const handleSwapItem = useCallback((alt: { name: string; tagline?: string; imageUrl?: string }) => {
    if (!activeItemKey || !activeItem) return
    const key = activeItemKey
    const updated: ItineraryItem = {
      ...activeItem,
      title: alt.name,
      detail: alt.tagline ?? activeItem.detail,
      ...(alt.imageUrl ? { imageUrl: alt.imageUrl } : {}),
    }
    setEditedItems(prev => new Map(prev).set(key, updated))
    setActiveItem(null)
    setActiveItemKey(null)
    showAppliedBadgeForKey(key)
  }, [activeItemKey, activeItem, showAppliedBadgeForKey])

  const handleTransportModeChange = useCallback((key: string, mode: string) => {
    setTransportModes(prev => new Map(prev).set(key, mode))
  }, [])

  const handleOpenPersonalize = useCallback(() => {
    setAlterMode('personalize')
    setAlterPrefilledText('')
    setAlterOpen(true)
  }, [])

  const handleRemovePreference = useCallback((chip: string) => {
    setPreferenceChips(prev => prev.filter(c => c !== chip))
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoState({ key: chip, title: `"${chip}" preference`, type: 'chip' })
    undoTimerRef.current = setTimeout(() => setUndoState(null), 5000)
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

      {/* Destination accordion */}
      {isDemoMode && (
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', margin: 0, padding: '12px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Upcoming trips
          </p>
          {/* Constrained scroll container — sibling of label, not a descendant */}
          <div style={{
            maxHeight: 280,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch' as const,
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              padding: '0 16px 8px',
            }}>
              {DEMO_DESTINATIONS.map((dest, i) => (
                <DestinationAccordionCard
                  key={dest.cityShort}
                  dest={dest}
                  isSelected={i === demoDestIdx}
                  isExpanded={expandedDestIdx === i}
                  onExpand={() => {
                    const next = expandedDestIdx === i ? null : i
                    setExpandedDestIdx(next)
                    if (next !== null) {
                      setDemoDestIdx(i)
                      setRemovedKeys(new Set())
                      setEditedItems(new Map())
                      setTransportModes(new Map())
                      setAppliedBadgeKeys(new Set())
                    }
                  }}
                />
              ))}
            </div>
          </div>
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
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 16px 230px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {display.days.map(day => (
            <DaySection
              key={day.day}
              day={day}
              removedKeys={removedKeys}
              editedItems={editedItems}
              onOpen={handleOpenItem}
              appliedBadgeKeys={appliedBadgeKeys}
              transportModes={transportModes}
              onTransportModeChange={handleTransportModeChange}
            />
          ))}
        </div>
      </div>

      {/* Fixed footer: PersonalizationBar + CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        {/* Personalization Bar — directly above CTA */}
        <PersonalizationBar
          chips={preferenceChips}
          onOpen={handleOpenPersonalize}
          onRemoveChip={handleRemovePreference}
          isAltering={alterStatus === 'altering'}
          flashActive={barFlash}
        />

        {/* Sticky CTA bar */}
        <div style={{
          padding: '16px 20px 34px',
          background: 'linear-gradient(to top, var(--bg-secondary) 80%, transparent 100%)',
        }}>
          <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              style={{
                width: '100%', padding: '16px 0', borderRadius: 16,
                background: 'var(--text-primary)', color: 'white',
                fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
              }}
            >
              Add to Calendar
            </button>

            {alterPlan && (
              <button
                onClick={() => !busy && (setAlterPrefilledText(''), setAlterMode('alter'), setAlterOpen(true))}
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
      </div>

      {/* Item Detail Sheet */}
      <ItemDetailSheet
        item={activeItem}
        onClose={handleCloseSheet}
        onRemove={handleRemoveItem}
        onChangeItem={handleChangeItem}
        onSwapItem={handleSwapItem}
      />

      {/* Item Edit Sheet with back nav */}
      <ItemEditSheet
        item={editItem}
        onSave={handleSaveEdit}
        onClose={handleCancelEdit}
        onBack={handleBackFromEdit}
      />

      {/* Undo toast */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            className="fixed left-0 right-0 z-30 flex justify-center px-4 pointer-events-none"
            style={{ bottom: 170 }}
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

      {/* Submit confirmation toast */}
      <AnimatePresence>
        {submitToast && (
          <motion.div
            className="fixed left-0 right-0 z-30 flex justify-center px-4 pointer-events-none"
            style={{ bottom: 170 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--accent)', borderRadius: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              padding: '12px 16px', maxWidth: 360, width: '100%',
            }}>
              <span style={{ fontSize: 15 }}>✓</span>
              <span style={{ flex: 1, fontSize: 13, color: 'white', fontWeight: 500 }}>{submitToast}</span>
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
            mode={alterMode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
