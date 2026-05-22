import { useParams } from 'react-router-dom'
import { soloTravelFixture } from '../data/fixture'

export function DayOfPlanPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const plan = soloTravelFixture.dayOfPlan.result.payload
  const confidence = Math.round(soloTravelFixture.dayOfPlan.confidence * 100)
  const generatedTime = new Date(soloTravelFixture.dayOfPlan.generatedAt).toLocaleTimeString(
    'en-GB', { hour: '2-digit', minute: '2-digit' }
  )

  const priorityDot: Record<string, string> = {
    high: 'bg-accent',
    medium: 'bg-warning',
    low: 'bg-success',
  }

  return (
    <div className="min-h-screen bg-surface-0 pb-12">
      <div className="max-w-2xl mx-auto px-5 pt-8">
        <div className="mb-8">
          <p className="text-accent text-xs font-mono uppercase tracking-widest mb-1">
            Day-of plan · {tripId ?? 'ws2026'}
          </p>
          <h1 className="text-on-surface text-2xl font-bold leading-tight">Good morning.</h1>
          <p className="text-on-dim text-[15px] mt-1">Lisbon in a few hours.</p>
          <p className="text-on-dim text-xs mt-4 font-mono opacity-60">
            {confidence}% confident · Generated {generatedTime} PST
          </p>
        </div>

        <div className="space-y-2">
          {plan.rankedPlan.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 items-start bg-surface-1 rounded-xl p-4 border border-border"
            >
              <span className="font-mono text-xs text-on-dim pt-0.5 w-16 shrink-0">{item.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-[13px] font-medium">{item.task}</p>
              </div>
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityDot[item.priority] ?? 'bg-border'}`} />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-surface-1 rounded-xl border border-border">
          <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide mb-2">Why this order?</p>
          <p className="text-on-surface text-[13px] leading-relaxed">{plan.rationale}</p>
        </div>

        <div className="mt-8 text-center">
          <a href="#/" className="text-accent text-[13px] underline">← Back to itinerary</a>
        </div>
      </div>
    </div>
  )
}
