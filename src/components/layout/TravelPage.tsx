import { useState } from 'react'
import { useFlowEngine } from '../../hooks/useFlowEngine'
import { AppHeader } from './AppHeader'
import { ChatPanel } from './ChatPanel'
import { TimelineSpine } from '../timeline/TimelineSpine'
import { MobileProgressStrip } from '../mobile/MobileProgressStrip'
import { MobileTimelineSheet } from '../mobile/MobileTimelineSheet'
import { TimelineEmptyState } from '../timeline/TimelineEmptyState'

export function TravelPage() {
  const flow = useFlowEngine()
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat')
  const tripStarted = flow.chatScreen > 1

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <AppHeader
        confirmedCount={flow.confirmedCount}
        totalCount={flow.totalCount}
        activeTab={mobileTab}
        onTabChange={setMobileTab}
      />

      <div className="flex flex-1 min-h-0">
        {/* Chat panel */}
        <div className={`
          flex flex-col overflow-hidden
          w-full lg:w-[400px] lg:shrink-0
          border-r border-border
          ${mobileTab === 'itinerary' ? 'hidden md:flex' : 'flex'}
          lg:flex
        `}>
          <ChatPanel flow={flow} />
        </div>

        {/* Timeline spine — hidden mobile, tab-controlled tablet, always desktop */}
        <div className={`
          flex-1 min-w-0 overflow-hidden flex-col
          hidden lg:flex
          ${mobileTab === 'itinerary' ? 'flex md:flex' : ''}
        `}>
          {tripStarted ? <TimelineSpine flow={flow} /> : <TimelineEmptyState />}
        </div>
      </div>

      {/* Mobile bottom strip */}
      <div className="block md:hidden shrink-0">
        <MobileProgressStrip
          confirmedCount={flow.confirmedCount}
          totalCount={flow.totalCount}
          tripTitle="Web Summit 2026"
          onExpand={() => flow.setTimelineSheetOpen(true)}
        />
      </div>

      <MobileTimelineSheet
        open={flow.timelineSheetOpen}
        onClose={() => flow.setTimelineSheetOpen(false)}
      >
        {tripStarted ? <TimelineSpine flow={flow} /> : <TimelineEmptyState />}
      </MobileTimelineSheet>
    </div>
  )
}
