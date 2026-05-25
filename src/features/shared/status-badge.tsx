import { Badge } from '@/components/ui/badge'
import type { CaseStatus, ClientStatus, DeadlineStatus, TransactionStatus } from '@/lib/types'

const CASE_STATUS: Record<CaseStatus, { label: string; variant: 'success' | 'warning' | 'muted' | 'destructive' | 'secondary' }> = {
  active: { label: 'Ativo', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  suspended: { label: 'Suspenso', variant: 'warning' },
  closed: { label: 'Encerrado', variant: 'muted' },
  archived: { label: 'Arquivado', variant: 'muted' },
}

const CLIENT_STATUS: Record<ClientStatus, { label: string; variant: 'success' | 'muted' | 'secondary' }> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'muted' },
  prospect: { label: 'Prospect', variant: 'secondary' },
}

const DEADLINE_STATUS: Record<DeadlineStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'muted' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  done: { label: 'Concluído', variant: 'success' },
  overdue: { label: 'Vencido', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'muted' },
}

const TRANSACTION_STATUS: Record<TransactionStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'muted' }> = {
  paid: { label: 'Pago', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Vencido', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'muted' },
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const { label, variant } = CASE_STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const { label, variant } = CLIENT_STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function DeadlineStatusBadge({ status }: { status: DeadlineStatus }) {
  const { label, variant } = DEADLINE_STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { label, variant } = TRANSACTION_STATUS[status]
  return <Badge variant={variant}>{label}</Badge>
}
