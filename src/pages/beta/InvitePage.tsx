import { Navigate, useParams } from 'react-router-dom'
import { isValidToken, getMemberName } from '../../lib/beta'

const CAPABILITIES = [
  { emoji: '✈️', label: 'Plan trips end-to-end, not just flights' },
  { emoji: '📅', label: 'Manage your calendar around travel automatically' },
  { emoji: '🏨', label: 'Remember your preferences across every booking' },
  { emoji: '💬', label: 'Reach out and handle logistics on your behalf' },
]

export default function InvitePage() {
  const { token = '' } = useParams<{ token: string }>()

  if (!isValidToken(token)) {
    return <Navigate to="/invite/invalid" replace />
  }

  const name = getMemberName(token)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f5f4f0' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
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

          {/* Beta badge */}
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white animate-pulse"
            style={{ background: 'var(--accent)' }}>
            BETA
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <h1 className="text-[24px] font-bold mb-2" style={{ color: 'var(--text-primary)', lineHeight: 1.25 }}>
            {name}, you're invited.
          </h1>
          <p className="text-[15px] mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your personal AI butler handles the details so you can focus on what matters.
          </p>

          <ul className="space-y-3 mb-8">
            {CAPABILITIES.map(({ emoji, label }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="text-[18px] mt-0.5" aria-hidden="true">{emoji}</span>
                <span className="text-[15px]" style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <a
            href={`/sign-up?invite=${encodeURIComponent(token)}`}
            className="block w-full text-center py-3.5 px-6 rounded-xl text-white font-semibold text-[16px] transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--accent)' }}
          >
            Create my account →
          </a>
        </div>

        <p className="text-center text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <a href="/sign-in" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
