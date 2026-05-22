import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props { open: boolean; onClose: () => void; children: ReactNode; title?: string }

export function Popover({ open, onClose, children, title }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-surface-1 rounded-t-2xl z-50 p-6 pb-10 border-t border-border"
            style={{ width: '100%', maxWidth: 390 }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="w-8 h-1 bg-surface-3 rounded-full mx-auto mb-5" />
            {title && <p className="text-on-surface font-semibold text-[15px] mb-4">{title}</p>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
