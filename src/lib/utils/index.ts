import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDocument(doc: string): string {
  const clean = doc.replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return doc
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

const AREA_LABELS: Record<string, string> = {
  civil: 'Cível', criminal: 'Criminal', trabalhista: 'Trabalhista',
  tributario: 'Tributário', empresarial: 'Empresarial', familia: 'Família',
  consumidor: 'Consumidor', previdenciario: 'Previdenciário',
}
export function formatArea(area: string): string { return AREA_LABELS[area] ?? area }

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo', suspended: 'Suspenso', closed: 'Encerrado',
  archived: 'Arquivado', pending: 'Pendente',
}
export function formatCaseStatus(status: string): string { return STATUS_LABELS[status] ?? status }

const ROLE_LABELS: Record<string, string> = {
  owner: 'Titular', admin: 'Administrador', lawyer: 'Advogado', assistant: 'Assistente',
}
export function formatRole(role: string): string { return ROLE_LABELS[role] ?? role }

const PHASE_LABELS: Record<string, string> = {
  conhecimento: 'Conhecimento', recurso: 'Recurso', execucao: 'Execução',
  cumprimento: 'Cumprimento', extrajudicial: 'Extrajudicial', consulta: 'Consulta',
}
export function formatPhase(phase: string): string { return PHASE_LABELS[phase] ?? phase }

const DEADLINE_TYPE_LABELS: Record<string, string> = {
  audiencia: 'Audiência', prazo_fatal: 'Prazo Fatal', prazo_comum: 'Prazo Comum',
  reuniao: 'Reunião', protocolo: 'Protocolo', pericia: 'Perícia', outro: 'Outro',
}
export function formatDeadlineType(type: string): string { return DEADLINE_TYPE_LABELS[type] ?? type }

const DOC_TYPE_LABELS: Record<string, string> = {
  peticao: 'Petição', contrato: 'Contrato', procuracao: 'Procuração',
  sentenca: 'Sentença', recurso: 'Recurso', comprovante: 'Comprovante',
  laudo: 'Laudo', outro: 'Outro',
}
export function formatDocType(type: string): string { return DOC_TYPE_LABELS[type] ?? type }
