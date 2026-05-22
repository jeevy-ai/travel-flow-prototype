import { motion } from 'framer-motion'
import type { TimelineEntry } from '../../hooks/useFlowEngine'

interface Props { entry: TimelineEntry; onCollapse: () => void }

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

export function TimelineEntryExpanded({ entry, onCollapse }: Props) {
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
          {Boolean(d['distanceToVenue']) && (
            <div className="flex items-center gap-1.5 text-warning text-[12px]">
              <span>⚠</span><span>{String(d['distanceToVenue'])}</span>
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
