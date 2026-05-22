import { useFlowState } from './hooks/useFlowState'
import { PhoneFrame } from './components/layout/PhoneFrame'
import { Screen1TripDetection } from './components/screens/Screen1TripDetection'
import { Screen2FlightSelection } from './components/screens/Screen2FlightSelection'
import { Screen3HotelSelection } from './components/screens/Screen3HotelSelection'
import { Screen4Sessions } from './components/screens/Screen4Sessions'
import { Screen5Restaurants } from './components/screens/Screen5Restaurants'
import { Screen6PackingList } from './components/screens/Screen6PackingList'
import { Screen7Itinerary } from './components/screens/Screen7Itinerary'

export default function App() {
  const flow = useFlowState()

  return (
    <PhoneFrame>
      {flow.screen === 1 && <Screen1TripDetection flow={flow} />}
      {flow.screen === 2 && <Screen2FlightSelection flow={flow} />}
      {flow.screen === 3 && <Screen3HotelSelection flow={flow} />}
      {flow.screen === 4 && <Screen4Sessions flow={flow} />}
      {flow.screen === 5 && <Screen5Restaurants flow={flow} />}
      {flow.screen === 6 && <Screen6PackingList flow={flow} />}
      {flow.screen === 7 && <Screen7Itinerary flow={flow} />}
    </PhoneFrame>
  )
}
