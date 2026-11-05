// Shapes from docs/contract.md, section 2. Field names match the API exactly.

export type CampaignStatus = 'open' | 'completed'

export interface Campaign {
  id: string
  name: string
  description: string
  purpose: string
  imageUrl?: string | null
  goalAmount: number
  raisedAmount: number
  startDate: string // YYYY-MM-DD, America/Merida
  endDate: string // YYYY-MM-DD, America/Merida
  status: CampaignStatus
}

export interface Supporter {
  displayName: string
  amount: number
}

export interface CampaignDetail extends Campaign {
  /** Credited, visible supporters only. Newest first. */
  supporters: Supporter[]
}
