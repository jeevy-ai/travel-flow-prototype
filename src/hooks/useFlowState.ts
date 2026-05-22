import { useState, useCallback } from 'react'
import fixture from '../data/fixture.json'

export type EnrichmentFlags = number

export function useFlowState() {
  const [screen, setScreen] = useState(1)
  const [enrichment, setEnrichment] = useState<EnrichmentFlags>(0)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [packingState, setPackingState] = useState<Record<string, boolean>>({})
  const [showExtendedPacking, setShowExtendedPacking] = useState(false)
  const [packingReminderSet, setPackingReminderSet] = useState(false)

  const advance = useCallback((nextScreen: number, enrichBit?: number) => {
    if (enrichBit !== undefined) setEnrichment(e => e | (1 << enrichBit))
    setScreen(nextScreen)
  }, [])

  const toggleSession = useCallback((id: string) => {
    setSelectedSessions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const togglePacking = useCallback((id: string) => {
    setPackingState(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const hasEnrichment = (bit: number) => Boolean(enrichment & (1 << bit))

  return {
    screen, advance,
    enrichment, hasEnrichment,
    selectedSessions, toggleSession,
    packingState, togglePacking,
    showExtendedPacking, setShowExtendedPacking,
    packingReminderSet, setPackingReminderSet,
    data: fixture,
  }
}

export type FlowState = ReturnType<typeof useFlowState>
