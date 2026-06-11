import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppleFlowPage } from './components/apple/AppleFlowPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'

const router = createHashRouter([
  { path: '/', element: <AppleFlowPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
