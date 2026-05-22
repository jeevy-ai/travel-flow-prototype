import { useState } from 'react'

interface Props {
  src: string | null
  alt: string
  gradient: string
  className?: string
  overlay?: boolean
}

export function ImageSlot({ src, alt, gradient, className = '', overlay = false }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{ background: gradient }}
        aria-label={alt}
      />
    )
  }

  return (
    <div className={`${className} relative overflow-hidden`} style={{ background: gradient }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
      {overlay && (
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.72)' }} />
      )}
    </div>
  )
}
