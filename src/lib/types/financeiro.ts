import type { ID } from './common'

export type TransactionType = 'honorario' | 'despesa' | 'reembolso' | 'adiantamento'
export type TransactionStatus = 'paid' | 'pending' | 'overdue' | 'cancelled'

export interface FinancialTransaction {
  id: ID
  officeId: ID
  caseId?: ID
  caseName?: string
  clientId?: ID
  clientName?: string
  type: TransactionType
  description: string
  amount: number
  status: TransactionStatus
  dueDate?: string
  paidAt?: string
  createdAt: string
}
