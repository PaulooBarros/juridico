import type { ID } from './common'

export type CaseStatus = 'active' | 'suspended' | 'closed' | 'archived' | 'pending'
export type CaseArea =
  | 'civil' | 'criminal' | 'trabalhista' | 'tributario'
  | 'empresarial' | 'familia' | 'consumidor' | 'previdenciario'
export type CasePhase =
  | 'conhecimento' | 'recurso' | 'execucao' | 'cumprimento'
  | 'extrajudicial' | 'consulta'

export interface Case {
  id: ID
  officeId: ID
  number: string
  title: string
  clientId: ID
  clientName: string
  area: CaseArea
  phase: CasePhase
  status: CaseStatus
  court?: string
  judge?: string
  description?: string
  value?: number
  assignedTo: ID[]
  assignedNames: string[]
  createdAt: string
  updatedAt: string
  deadlineCount?: number
  documentCount?: number
}

export type TimelineEventType =
  | 'created' | 'updated' | 'document_added' | 'deadline_added'
  | 'hearing' | 'decision' | 'petition' | 'note'

export interface TimelineEvent {
  id: ID
  caseId: ID
  type: TimelineEventType
  title: string
  description?: string
  userId: ID
  userName: string
  createdAt: string
}
