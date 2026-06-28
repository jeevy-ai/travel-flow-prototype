import { useUser, UserProfile } from '@clerk/react'
import { Link } from 'react-router-dom'

const DISABLED_CARDS = [
  { emoji: '🔒', title: 'Data & Privacy', desc: 'Coming soon' },
  { emoji: '💳', title: 'Billing', desc: 'Coming soon' },
  { emoji: '💬', title: 'Support', desc: 'Coming soon' },
]

export default function AccountSettingsPage() {
  const { isLoaded } = useUser()
  if (!isLoaded) return null

  return (
    <div className="min-h-screen" style={{ background: '#f5f4f0' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
        style={{ background: '#f5f4f0', borderBottom: '1px solid var(--border)' }}
      >
        <Link to="/dashboard" className="text-[15px]" style={{ color: 'var(--accent)' }}>
          ← Dashboard
        </Link>
        <span className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Account
        </span>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-4">
        {/* Clerk managed profile */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 rounded-none',
              },
            }}
          />
        </div>

        {/* Disabled beta cards */}
        {DISABLED_CARDS.map(({ emoji, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-5 shadow-sm opacity-50"
            aria-disabled="true"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">{emoji}</span>
              <div>
                <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
