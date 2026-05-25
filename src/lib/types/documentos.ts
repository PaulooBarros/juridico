import type { ID } from './common'
import type { CaseArea } from './casos'

export type DocumentType =
  | 'peticao' | 'contrato' | 'procuracao' | 'sentenca'
  | 'recurso' | 'comprovante' | 'laudo' | 'outro'

export interface Document {
  id: ID
  officeId: ID
  caseId?: ID
  caseName?: string
  clientId?: ID
  clientName?: string
  type: DocumentType
  name: string
  filename: string
  size: number
  mimeType: string
  version: number
  uploadedBy: ID
  uploadedByName: string
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export type ModelCategory =
  | 'peticoes' | 'contratos' | 'procuracoes' | 'correspondencias' | 'outros'

export interface DocumentModel {
  id: ID
  officeId: ID
  name: string
  description: string
  category: ModelCategory
  area?: CaseArea
  createdBy: ID
  createdByName: string
  usageCount: number
  createdAt: string
  updatedAt: string
  tags?: string[]
}
