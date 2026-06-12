import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppleFlowPage } from './components/apple/AppleFlowPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'
import { EnquiryChatPage } from './pages/EnquiryChatPage'
import { FlowPage } from './components/flow/FlowPage'
import { OutboundDemoPage } from './pages/OutboundDemoPage'

const router = createHashRouter([
  { path: '/', element: <AppleFlowPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
  { path: '/outbound-enquiry', element: <EnquiryChatPage /> },
  { path: '/legacy', element: <FlowPage /> },
  { path: '/outbound-demo', element: <OutboundDemoPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
