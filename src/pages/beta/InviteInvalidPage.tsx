import { Link } from 'react-router-dom'

export default function InviteInvalidPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f5f4f0' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <span className="text-[17px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Jeevy
          </span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" aria-hidden="true">⚠️</span>
            <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              This invite link didn't work.
            </h1>
          </div>
          <p className="text-[15px] mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            It may have expired or been mistyped. Ask whoever shared it to resend.
          </p>
          <Link
            to="/"
            className="text-[15px] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            ← Back to Jeevy
          </Link>
        </div>
      </div>
    </div>
  )
}
