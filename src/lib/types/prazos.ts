import type { ID } from './common'

export type DeadlinePriority = 'critical' | 'high' | 'medium' | 'low'
export type DeadlineStatus = 'pending' | 'done' | 'overdue' | 'cancelled'
export type DeadlineType =
  | 'audiencia' | 'prazo_fatal' | 'prazo_comum' | 'reuniao'
  | 'protocolo' | 'pericia' | 'outro'

export interface Deadline {
  id: ID
  officeId: ID
  caseId?: ID
  caseName?: string
  caseNumber?: string
  clientName?: string
  type: DeadlineType
  title: string
  description?: string
  dueDate: string
  priority: DeadlinePriority
  status: DeadlineStatus
  assignedTo?: ID
  assignedName?: string
  createdAt: string
}
