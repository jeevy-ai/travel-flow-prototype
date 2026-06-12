export type OutboundRiskClass = 'safe' | 'reversible' | 'irreversible' | 'paid' | 'identity'

export interface OutboundAction {
  id: string
  riskClass: OutboundRiskClass
  channel: 'email' | 'form_submit' | 'api_call'
  recipient: string
  subject?: string
  bodyPreview: string
  humanSummary: string
  isReversible: boolean
  isPaid: boolean
  estimatedCost?: number
  currency?: string
}
