import { SignUp, useAuth } from '@clerk/react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isValidToken } from '../../lib/beta'

export default function SignUpPage() {
  const [searchParams] = useSearchParams()
  const invite = searchParams.get('invite') ?? ''
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      navigate('/onboarding', { replace: true })
      return
    }
    if (!isValidToken(invite)) {
      navigate('/', { replace: true })
    } else {
      sessionStorage.setItem('jeevy_invite_token', invite)
    }
  }, [isLoaded, isSignedIn, invite, navigate])

  if (!isLoaded || !isValidToken(invite)) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f5f4f0' }}>
      <div className="mb-8 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[14px]"
          style={{ background: 'var(--accent)' }}
          aria-hidden="true"
        >
          J
        </div>
        <span className="text-[17px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Jeevy
        </span>
      </div>

      <SignUp
        forceRedirectUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-sm',
            card: 'rounded-2xl shadow-sm border-0',
          },
        }}
      />
    </div>
  )
}
