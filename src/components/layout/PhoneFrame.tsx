import type { ReactNode } from 'react'

interface Props { children: ReactNode }

export function PhoneFrame({ children }: Props) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-start justify-center">
      <div
        className="relative w-full bg-surface-0 overflow-hidden"
        style={{ maxWidth: 390, minHeight: '100dvh' }}
      >
        {children}
      </div>
    </div>
  )
}
