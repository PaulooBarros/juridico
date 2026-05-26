import { createClient } from './client'
import { getMeuEscritorioId } from './escritorio'

export type TransacaoTipo   = 'honorario' | 'despesa' | 'reembolso' | 'adiantamento'
export type TransacaoStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export type Transacao = {
  id:            string
  created_at:    string
  updated_at:    string
  escritorio_id: string
  created_by:    string
  caso_id:       string | null
  cliente_id:    string | null
  descricao:     string
  tipo:          TransacaoTipo
  status:        TransacaoStatus
  valor:         number
  vencimento:    string | null
  pago_em:       string | null
  notas:         string | null
  // joined
  caso_titulo:   string | null
  cliente_nome:  string | null
}

export type TransacaoInput = {
  descricao:  string
  tipo:       TransacaoTipo
  status:     TransacaoStatus
  valor:      number
  vencimento?: string
  pago_em?:   string
  caso_id?:   string
  cliente_id?: string
  notas?:     string
}

export const TIPO_LABEL: Record<TransacaoTipo, string> = {
  honorario:    'Honorários',
  despesa:      'Despesa',
  reembolso:    'Reembolso',
  adiantamento: 'Adiantamento',
}

export const STATUS_LABEL: Record<TransacaoStatus, string> = {
  pending:   'Pendente',
  paid:      'Pago',
  overdue:   'Em atraso',
  cancelled: 'Cancelado',
}

export async function listarTransacoes(): Promise<Transacao[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('transacoes')
    .select('*, casos(titulo), clientes(name)')
    .order('created_at', { ascending: false })
  return ((data ?? []) as any[]).map(t => ({
    ...t,
    caso_titulo:  t.casos?.titulo ?? null,
    cliente_nome: t.clientes?.name ?? null,
    casos:    undefined,
    clientes: undefined,
  }))
}

export async function criarTransacao(input: TransacaoInput): Promise<Transacao> {
  const supabase = createClient()
  const [escritorioId, { data: { user } }] = await Promise.all([
    getMeuEscritorioId(),
    supabase.auth.getUser(),
  ])
  if (!escritorioId || !user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('transacoes')
    .insert({ ...input, escritorio_id: escritorioId, created_by: user.id })
    .select('*, casos(titulo), clientes(name)')
    .single()
  if (error) throw error

  return {
    ...(data as any),
    caso_titulo:  (data as any).casos?.titulo ?? null,
    cliente_nome: (data as any).clientes?.name ?? null,
  }
}

export async function atualizarTransacao(id: string, input: Partial<TransacaoInput>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('transacoes').update(input).eq('id', id)
  if (error) throw error
}

export async function deletarTransacao(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('transacoes').delete().eq('id', id)
  if (error) throw error
}
