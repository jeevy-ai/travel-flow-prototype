import { motion } from 'framer-motion'

interface Props { percent: number; size?: number; stroke?: number; animate?: boolean }

export function ProgressRing({ percent, size = 48, stroke = 3, animate = true }: Props) {
  const r = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - percent / 100)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2e3240" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#34c97d" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: animate ? circumference : offset }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
      />
    </svg>
  )
}
