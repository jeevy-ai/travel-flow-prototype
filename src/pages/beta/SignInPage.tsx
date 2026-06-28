import { SignIn, useAuth } from '@clerk/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

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

      <SignIn
        forceRedirectUrl="/dashboard"
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
