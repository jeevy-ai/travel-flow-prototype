import { createHashRouter, RouterProvider } from 'react-router-dom'
import { TravelPage } from './components/layout/TravelPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'

const router = createHashRouter([
  { path: '/', element: <TravelPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
