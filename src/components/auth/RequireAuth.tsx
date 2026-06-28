import type { ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { Navigate } from 'react-router-dom'

interface RequireAuthProps {
  children: ReactNode
  requireOnboarding?: boolean
}

export function RequireAuth({ children, requireOnboarding = false }: RequireAuthProps) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()

  if (!authLoaded || (requireOnboarding && !userLoaded)) {
    return null
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  if (requireOnboarding) {
    const completed = user?.unsafeMetadata?.onboardingCompleted === true
    if (!completed) {
      return <Navigate to="/onboarding" replace />
    }
  }

  return <>{children}</>
}

export function RequireOnboardingSkip({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()

  if (!authLoaded || !userLoaded) return null

  if (isSignedIn && user?.unsafeMetadata?.onboardingCompleted === true) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
