import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppleFlowPage } from './components/apple/AppleFlowPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'
import { FlowPage } from './components/flow/FlowPage'

const router = createHashRouter([
  { path: '/', element: <AppleFlowPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
  { path: '/legacy', element: <FlowPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
