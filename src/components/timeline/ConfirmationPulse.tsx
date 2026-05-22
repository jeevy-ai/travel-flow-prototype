import { motion } from 'framer-motion'

export function ConfirmationPulse() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none z-10"
      initial={{ boxShadow: '0 0 0 0px rgba(56, 161, 105, 0.4)' }}
      animate={{ boxShadow: '0 0 0 8px rgba(56, 161, 105, 0)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}
