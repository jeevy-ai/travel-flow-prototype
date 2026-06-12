import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TimelineEntry } from '../../hooks/useFlowEngine'

interface Props { entry: TimelineEntry; onCollapse: () => void; onPartyChange?: (size: number) => void }

function DetailRow({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === false || value === '') return null
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

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent text-[12px] underline">
      {label} →
    </a>
  )
}

// ── Seat map for 767-400ER 2-2-2 business class layout ────────────────
function SeatMap({ seat }: { seat: string }) {
  // Parse "Seat 4A — Business Class, Aisle" → row=4, col=A
  const match = seat.match(/Seat\s+(\d+)([A-F])/i)
  const targetRow = match ? parseInt(match[1]) : -1
  const targetCol = match ? match[2].toUpperCase() : ''

  const rows = [1, 2, 3, 4, 5, 6]
  // 2-2-2 layout: cols A,B | C,D | E,F
  const sections = [['A', 'B'], ['C', 'D'], ['E', 'F']] as const

  return (
    <div className="mt-3">
      <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">Seat plan — Business class (rows 1–6)</p>
      <div className="inline-block">
        {/* Column headers */}
        <div className="flex gap-1 mb-1 pl-7">
          {sections.map((sec, si) => (
            <div key={si} className="flex gap-1">
              {sec.map(col => (
                <div key={col} className="w-7 text-center text-[9px] text-on-dim font-mono">{col}</div>
              ))}
              {si < 2 && <div className="w-3" />}
            </div>
          ))}
        </div>
        {/* Seat rows */}
        {rows.map(row => (
          <div key={row} className="flex items-center gap-1 mb-1">
            <span className="text-[10px] text-on-dim font-mono w-6 text-right">{row}</span>
            {sections.map((sec, si) => (
              <div key={si} className="flex gap-1">
                {sec.map(col => {
                  const isTarget = row === targetRow && col === targetCol
                  return (
                    <div
                      key={col}
                      className={`w-7 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold transition-colors ${
                        isTarget
                          ? 'bg-accent text-white shadow-[0_0_6px_var(--shadow-focus)]'
                          : 'bg-surface-3 text-on-dim/40'
                      }`}
                      title={`${row}${col}`}
                    >
                      {isTarget ? '★' : ''}
                    </div>
                  )
                })}
                {si < 2 && <div className="w-3 flex items-center">
                  <div className="w-px h-3 bg-border mx-auto" />
                </div>}
              </div>
            ))}
          </div>
        ))}
        <p className="text-[10px] text-accent/80 mt-1.5 text-center">★ {seat.split('—')[0].trim()}</p>
      </div>
    </div>
  )
}

// ── In-flight meal selection ───────────────────────────────────────────
const MEAL_OPTIONS = [
  { id: 'standard', label: 'Standard', desc: 'Pan-seared chicken with seasonal veg + cheese plate' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Roasted vegetable risotto + fruit plate' },
  { id: 'vegan', label: 'Vegan', desc: 'Quinoa bowl + coconut dessert' },
  { id: 'halal', label: 'Halal', desc: 'Halal-certified lamb tagine + baklava' },
]

function MealSelector({ flightId }: { flightId: string }) {
  const [selected, setSelected] = useState('standard')
  return (
    <div className="mt-3">
      <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">In-flight meal · {flightId === 'flt_outbound' ? 'UA88' : 'UA89'}</p>
      <div className="space-y-1.5">
        {MEAL_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
              selected === opt.id
                ? 'border-accent bg-accent/10'
                : 'border-border bg-surface-3 hover:bg-surface-3/80'
            }`}
          >
            <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
              selected === opt.id ? 'border-accent' : 'border-on-dim/40'
            }`}>
              {selected === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-accent block" />}
            </span>
            <div>
              <p className={`text-[12px] font-semibold ${selected === opt.id ? 'text-accent' : 'text-on-surface'}`}>{opt.label}</p>
              <p className="text-on-dim text-[11px]">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PartySizeStepper({ size, onChange }: { size: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide">Party size</p>
      <div className="flex items-center gap-1.5 bg-surface-3 rounded-xl px-2 py-1 border border-border">
        <button
          onClick={() => onChange(Math.max(1, size - 1))}
          disabled={size <= 1}
          className="w-6 h-6 flex items-center justify-center text-on-dim hover:text-on-surface text-[18px] leading-none transition-colors disabled:opacity-30"
        >−</button>
        <span className="text-on-surface text-[13px] font-bold w-4 text-center">{size}</span>
        <button
          onClick={() => onChange(Math.min(8, size + 1))}
          disabled={size >= 8}
          className="w-6 h-6 flex items-center justify-center text-on-dim hover:text-on-surface text-[18px] leading-none transition-colors disabled:opacity-30"
        >+</button>
      </div>
      <span className="text-on-dim text-[11px]">{size === 1 ? 'solo' : `${size} guests`}</span>
    </div>
  )
}

export function TimelineEntryExpanded({ entry, onCollapse, onPartyChange }: Props) {
  const d = entry.data

  return (
    <motion.div
      className="overflow-hidden border-t border-border bg-surface-2 px-4 py-4"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {(entry.type === 'flight_outbound' || entry.type === 'flight_return') && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Route" value={d['venue']} />
            <DetailRow label="Seat" value={d['slot']} />
            <DetailRow label="Aircraft" value={d['aircraft']} />
            <DetailRow label="Duration" value={d['duration']} />
            <DetailRow label="Stops" value={d['stops']} />
            <DetailRow label="Fare" value={d['fare']} />
            <DetailRow label="Change fee" value={d['changeFee']} />
            {Boolean(d['platinumApplied']) && (
              <>
                <span className="text-on-dim text-[12px]">Status</span>
                <span className="text-success text-[12px] font-medium">Platinum status applied</span>
              </>
            )}
          </div>
          {/* Seat map */}
          {Boolean(d['slot']) && <SeatMap seat={String(d['slot'])} />}
          {/* Meal selection */}
          <MealSelector flightId={entry.id} />
          {Boolean(d['rationale']) && <RationaleBlock text={String(d['rationale'])} />}
          <div className="flex flex-wrap gap-3">
            {Boolean(d['calendarAddLink']) && <ExternalLink href={String(d['calendarAddLink'])} label="Open in Calendar" />}
          </div>
          {Array.isArray(d['fallbacks']) && (d['fallbacks'] as string[]).length > 0 && (
            <div>
              <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-1">Alternatives</p>
              {(d['fallbacks'] as string[]).map((fb, i) => (
                <p key={i} className="text-on-dim text-[12px] py-0.5">• {fb}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {entry.type === 'hotel' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Room" value={d['slot']} />
            <DetailRow label="Chain" value={d['chain']} />
            <DetailRow label="Tier" value={d['memberTier']} />
            <DetailRow label="Rate" value={`$${d['pricePerNight']}/night · $${d['totalPrice']} total`} />
            <DetailRow label="Points" value={`${d['loyaltyPoints']} pts`} />
            <DetailRow label="Cancellation" value={d['cancellationPolicy']} />
          </div>
          {Array.isArray(d['amenities']) && (
            <div className="flex flex-wrap gap-1.5">
              {(d['amenities'] as string[]).map(a => (
                <span key={a} className="text-[11px] bg-surface-3 text-on-dim px-2 py-0.5 rounded-md">{a}</span>
              ))}
            </div>
          )}
          {Boolean(d['rationale']) && <RationaleBlock text={String(d['rationale'])} />}
          {Boolean(d['calendarAddLink']) && <ExternalLink href={String(d['calendarAddLink'])} label="Open in Calendar" />}
        </div>
      )}

      {entry.type === 'conference_session' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Speaker" value={d['speaker']} />
            <DetailRow label="Room" value={d['room']} />
            <DetailRow
              label="Start"
              value={d['startIso'] ? new Date(String(d['startIso'])).toLocaleTimeString('en-GB', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon'
              }) + ' WET' : undefined}
            />
            <DetailRow
              label="End"
              value={d['endIso'] ? new Date(String(d['endIso'])).toLocaleTimeString('en-GB', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon'
              }) + ' WET' : undefined}
            />
          </div>
          {Boolean(d['description']) && (
            <p className="text-on-dim text-[12px] leading-relaxed">{String(d['description'])}</p>
          )}
          {Boolean(d['conflictDetected']) && Boolean(d['conflictResolutionOutcome']) && (
            <div className="border border-success/30 rounded-lg px-3 py-2">
              <p className="text-success text-[11px] font-mono uppercase tracking-wide mb-0.5">Conflict resolved</p>
              <p className="text-on-surface text-[12px]">{String(d['conflictResolutionOutcome'])}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {Boolean(d['sourceLink']) && <ExternalLink href={String(d['sourceLink'])} label="View on Web Summit" />}
            {Boolean(d['calendarAddLink']) && <ExternalLink href={String(d['calendarAddLink'])} label="Open in Calendar" />}
          </div>
        </div>
      )}

      {entry.type === 'restaurant' && (
        <div className="space-y-3">
          {/* Dish photo strip */}
          {Array.isArray(entry.dishImages) && entry.dishImages.length > 0 && (
            <div>
              <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">Signature dishes</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                {(entry.dishImages as string[]).map((src, i) => (
                  <div key={i} className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-surface-3">
                    <img src={src} alt="Dish" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Cuisine" value={d['cuisine']} />
            <DetailRow label="Address" value={d['address']} />
            <DetailRow label="Distance" value={d['distanceFromHotel']} />
            <DetailRow label="Price" value={d['priceRange']} />
            <DetailRow label="Rating" value={d['rating']} />
            <DetailRow label="Reservation" value={d['reservation']} />
          </div>
          {Array.isArray(d['specialties']) && (
            <div>
              <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-1.5">Must order</p>
              <div className="flex flex-wrap gap-1.5">
                {(d['specialties'] as string[]).map(s => (
                  <span key={s} className="text-[11px] bg-surface-3 text-on-surface px-2 py-0.5 rounded-md">{s}</span>
                ))}
              </div>
            </div>
          )}
          {/* Party size stepper */}
          <PartySizeStepper
            size={entry.partySize ?? 1}
            onChange={size => onPartyChange?.(size)}
          />

          {/* Menu */}
          {Array.isArray(entry.menuItems) && entry.menuItems.length > 0 && (
            <div>
              <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">Popular choices</p>
              <div className="space-y-0">
                {(entry.menuItems as { name: string; price: string; popular?: boolean }[]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.popular && <span className="text-[10px] text-accent shrink-0">⭐</span>}
                      <span className={`text-[12px] truncate ${item.popular ? 'text-on-surface font-medium' : 'text-on-dim'}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-on-surface text-[12px] font-semibold shrink-0">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Boolean(d['rationale']) && <RationaleBlock text={String(d['rationale'])} />}
        </div>
      )}

      {entry.type === 'activity' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="Type" value={d['type']} />
            <DetailRow label="Address" value={d['address']} />
            <DetailRow label="Duration" value={d['duration']} />
            <DetailRow label="Cost" value={d['cost']} />
            <DetailRow label="From restaurant" value={d['distanceFromRestaurant']} />
          </div>
          {Boolean(d['notes']) && (
            <p className="text-on-dim text-[12px] leading-relaxed">{String(d['notes'])}</p>
          )}
          {Boolean(d['optional']) && (
            <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
              <span className="text-on-dim text-[12px]">Optional — skip anytime without affecting the rest of the plan.</span>
            </div>
          )}
        </div>
      )}

      {entry.type === 'ride' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-y-2">
            <DetailRow label="From" value={d['from']} />
            <DetailRow label="To" value={d['to']} />
            <DetailRow label="Duration" value={d['duration']} />
            <DetailRow label="Vehicle" value={d['vehicle']} />
            <DetailRow label="Provider" value={d['provider']} />
            <DetailRow label="Cost" value={d['cost']} />
          </div>
          {Boolean(d['notes']) && (
            <div className="border-l-2 border-accent/30 pl-3 py-1">
              <p className="text-on-dim text-[12px]">{String(d['notes'])}</p>
            </div>
          )}
        </div>
      )}

      {entry.type === 'reminders' && Array.isArray(d['reminders']) && (
        <div className="space-y-2">
          {(d['reminders'] as Array<{ subject: string; dueAt: string; ack: string; deliveryMethod: string }>).map((r, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <span className="text-lg shrink-0">🔔</span>
              <div className="flex-1">
                <p className="text-on-surface text-[13px] font-medium">{r.subject}</p>
                <p className="text-on-dim text-[11px] mt-0.5">{r.ack}</p>
                <span className="text-[10px] bg-surface-3 text-on-dim px-1.5 py-0.5 rounded mt-1 inline-block">{r.deliveryMethod}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onCollapse}
        className="mt-3 text-on-dim text-[12px] hover:text-on-surface transition-colors flex items-center gap-1"
      >
        ✕ Collapse
      </button>
    </motion.div>
  )
}
