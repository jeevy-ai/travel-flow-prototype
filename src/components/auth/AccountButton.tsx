import { SignInButton, UserButton, useAuth } from '@clerk/react'

interface Props {
  className?: string
}

export function AccountButton({ className }: Props) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  return (
    <div className={className}>
      {isSignedIn ? (
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
              userButtonTrigger: 'focus:shadow-none',
            },
          }}
        />
      ) : (
        <SignInButton mode="modal">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-opacity active:opacity-70"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Sign in
          </button>
        </SignInButton>
      )}
    </div>
  )
}
