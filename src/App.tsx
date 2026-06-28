import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppleFlowPage } from './components/apple/AppleFlowPage'
import { DayOfPlanPage } from './pages/DayOfPlanPage'
import { EnquiryChatPage } from './pages/EnquiryChatPage'
import { FlowPage } from './components/flow/FlowPage'
import { OutboundDemoPage } from './pages/OutboundDemoPage'
import InvitePage from './pages/beta/InvitePage'
import InviteInvalidPage from './pages/beta/InviteInvalidPage'
import SignUpPage from './pages/beta/SignUpPage'
import SignInPage from './pages/beta/SignInPage'
import OnboardingPage from './pages/beta/OnboardingPage'
import DashboardPage from './pages/beta/DashboardPage'
import AccountSettingsPage from './pages/beta/AccountSettingsPage'
import { RequireAuth, RequireOnboardingSkip } from './components/auth/RequireAuth'

const router = createBrowserRouter([
  // Beta onboarding flow
  { path: '/invite/invalid', element: <InviteInvalidPage /> },
  { path: '/invite/:token', element: <InvitePage /> },
  {
    path: '/sign-up',
    element: (
      <RequireOnboardingSkip>
        <SignUpPage />
      </RequireOnboardingSkip>
    ),
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/onboarding',
    element: (
      <RequireAuth>
        <OnboardingPage />
      </RequireAuth>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth requireOnboarding>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/account-settings',
    element: (
      <RequireAuth requireOnboarding>
        <AccountSettingsPage />
      </RequireAuth>
    ),
  },

  // Prototype / demo routes
  { path: '/flow', element: <AppleFlowPage /> },
  { path: '/itinerary/:tripId/day-of', element: <DayOfPlanPage /> },
  { path: '/outbound-enquiry', element: <EnquiryChatPage /> },
  { path: '/legacy', element: <FlowPage /> },
  { path: '/outbound-demo', element: <OutboundDemoPage /> },

  // Root redirect to prototype flow
  { path: '/', element: <Navigate to="/flow" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
