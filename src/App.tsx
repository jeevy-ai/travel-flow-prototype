import { createHashRouter, RouterProvider } from 'react-router-dom'
import { FlowPage } from './components/flow/FlowPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'

const router = createHashRouter([
  { path: '/', element: <FlowPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
