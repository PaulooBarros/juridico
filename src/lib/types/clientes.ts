import type { ID } from './common'

export type ClientType = 'pf' | 'pj'
export type ClientStatus = 'active' | 'inactive' | 'prospect'

export interface Client {
  id: ID
  officeId: ID
  type: ClientType
  name: string
  document: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  status: ClientStatus
  notes?: string
  createdAt: string
  caseCount?: number
}
