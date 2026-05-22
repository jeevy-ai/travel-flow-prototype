import { motion } from 'framer-motion'

interface Props { open: boolean; className?: string }

export function ExpandChevron({ open, className = '' }: Props) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`text-on-dim flex-shrink-0 ${className}`}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}
