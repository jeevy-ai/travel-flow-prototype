import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { FlowState } from '../../hooks/useFlowState'
import { VerbTag } from '../shared/VerbTag'
import { MiniStrip } from '../ministrip/MiniStrip'
import { stagger, dur, ease } from '../../tokens/motion'
import fixture from '../../data/fixture.json'

interface Props { flow: FlowState }

function BellIcon({ shake }: { shake: boolean }) {
  return (
    <motion.span
      className="text-base"
      animate={shake ? { rotate: [0, -12, 12, -12, 12, -8, 8, 0] } : {}}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      🔔
    </motion.span>
  )
}

interface PackItem { id: string; label: string; packed: boolean }

function CheckRow({ item, checked, onToggle, delay }: { item: PackItem; checked: boolean; onToggle: () => void; delay: number }) {
  return (
    <motion.button
      onClick={onToggle}
      className="w-full text-left flex items-center gap-3 bg-surface-1 rounded-xl border border-border p-3.5"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: dur.sm, ease: ease.out, delay }}
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'bg-success border-success' : 'border-on-dim/40'
      }`}>
        <AnimatePresence>
          {checked && (
            <motion.svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.path
                d="M2 6.5L4.5 9L10 3.5"
                stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.25 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <p className={`text-[13px] font-medium ${checked ? 'text-on-dim line-through' : 'text-on-surface'}`}>
        {item.label}
      </p>
    </motion.button>
  )
}

export function Screen6PackingList({ flow }: Props) {
  const [bellShake, setBellShake] = useState(false)
  const coreItems: PackItem[] = fixture.packingList.core
  const extendedItems: PackItem[] = fixture.packingList.extended
  const checked = flow.packingState
  const total = coreItems.length + (flow.showExtendedPacking ? extendedItems.length : 0)
  const checkedCount = Object.values(checked).filter(Boolean).length

  const handleReminder = () => {
    setBellShake(true)
    flow.setPackingReminderSet(true)
    setTimeout(() => setBellShake(false), 600)
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="errand" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Packing list</h1>
        </div>
        <p className="text-on-dim text-[12px]">6 of 7</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
        <p className="text-on-dim text-[12px] mb-1">Core items</p>

        {coreItems.map((item, i) => (
          <CheckRow
            key={item.id}
            item={item}
            checked={!!checked[item.id]}
            onToggle={() => flow.togglePacking(item.id)}
            delay={stagger(i, 40)}
          />
        ))}

        <button
          onClick={() => flow.setShowExtendedPacking(!flow.showExtendedPacking)}
          className="text-accent text-[13px] text-center py-1 mt-1"
        >
          {flow.showExtendedPacking ? '▲ Show less' : `▼ +${extendedItems.length} more items`}
        </button>

        <AnimatePresence>
          {flow.showExtendedPacking && (
            <motion.div
              className="flex flex-col gap-2 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <p className="text-on-dim text-[12px] mt-1">Optional</p>
              {extendedItems.map((item, i) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  checked={!!checked[item.id]}
                  onToggle={() => flow.togglePacking(item.id)}
                  delay={stagger(i, 40)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-surface-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-on-dim text-[13px]">{checkedCount} / {total} packed</span>
          <button
            onClick={handleReminder}
            className={`flex items-center gap-1.5 text-[12px] transition-colors ${
              flow.packingReminderSet ? 'text-success' : 'text-on-dim hover:text-on-surface'
            }`}
          >
            <BellIcon shake={bellShake} />
            {flow.packingReminderSet ? 'Reminder set' : 'Remind me'}
          </button>
        </div>
        <button
          onClick={() => flow.advance(7, 4)}
          className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          View full itinerary
        </button>
      </div>

      <MiniStrip flow={flow} />
    </div>
  )
}
