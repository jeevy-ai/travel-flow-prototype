import type { FlowEngine } from '../../hooks/useFlowEngine'
import { Screen1TripDetection } from '../screens/Screen1TripDetection'
import { Screen2FlightSelection } from '../screens/Screen2FlightSelection'
import { Screen3HotelSelection } from '../screens/Screen3HotelSelection'
import { Screen4Sessions } from '../screens/Screen4Sessions'
import { Screen5Restaurants } from '../screens/Screen5Restaurants'
import { Screen6PackingList } from '../screens/Screen6PackingList'
import { Screen7Itinerary } from '../screens/Screen7Itinerary'

interface Props { flow: FlowEngine }

export function ChatPanel({ flow }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      {flow.chatScreen === 1 && <Screen1TripDetection flow={flow} />}
      {flow.chatScreen === 2 && <Screen2FlightSelection flow={flow} />}
      {flow.chatScreen === 3 && <Screen3HotelSelection flow={flow} />}
      {flow.chatScreen === 4 && <Screen4Sessions flow={flow} />}
      {flow.chatScreen === 5 && <Screen5Restaurants flow={flow} />}
      {flow.chatScreen === 6 && <Screen6PackingList flow={flow} />}
      {flow.chatScreen === 7 && <Screen7Itinerary flow={flow} />}
    </div>
  )
}
