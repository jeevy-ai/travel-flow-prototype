import { useAuth } from '@clerk/react'
import { useState, useEffect, useCallback } from 'react'
import { getButlerProfile, type ButlerProfile } from '../lib/butlerApi'

export type ProfileState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; profile: ButlerProfile | null }
  | { status: 'error'; error: string }

export function useButlerProfile() {
  const { getToken, isSignedIn, isLoaded } = useAuth()
  const [state, setState] = useState<ProfileState>({ status: 'idle' })

  const refetch = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const token = await getToken()
      if (!token) {
        setState({ status: 'loaded', profile: null })
        return
      }
      const profile = await getButlerProfile(token)
      setState({ status: 'loaded', profile })
    } catch (err) {
      setState({ status: 'error', error: err instanceof Error ? err.message : 'Profile load failed' })
    }
  }, [getToken])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setState({ status: 'loaded', profile: null })
      return
    }
    void refetch()
  }, [isLoaded, isSignedIn, refetch])

  return { state, refetch }
}
