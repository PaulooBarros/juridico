import { createAuthClient } from './client'
import { getSessionUserId } from '@/lib/auth-client'
import { getMeuEscritorioId } from './escritorio'

export type CasoStatus = 'active' | 'suspended' | 'closed' | 'archived' | 'pending'
export type CasoArea =
  | 'civil' | 'criminal' | 'trabalhista' | 'tributario'
  | 'empresarial' | 'familia' | 'consumidor' | 'previdenciario'
export type CasoFase =
  | 'conhecimento' | 'recurso' | 'execucao' | 'cumprimento' | 'extrajudicial' | 'consulta'

export type Caso = {
  id: string
  created_at: string
  updated_at: string
  escritorio_id: string
  created_by: string
  cliente_id: string | null
  cliente_nome: string | null
  numero: string | null
  titulo: string
  area: CasoArea
  fase: CasoFase
  status: CasoStatus
  vara: string | null
  juiz: string | null
  descricao: string | null
  valor_causa: number | null
  notes: string | null
}

export type CasoInput = {
  cliente_id?: string
  numero?: string
  titulo: string
  area: CasoArea
  fase?: CasoFase
  status?: CasoStatus
  vara?: string
  juiz?: string
  descricao?: string
  valor_causa?: number | null
  notes?: string
}

function mapCaso(d: any): Caso {
  return {
    ...d,
    cliente_nome: d.clientes?.name ?? null,
    clientes: undefined,
  }
}

export async function listarCasos(): Promise<Caso[]> {
  const escritorioId = await getMeuEscritorioId()
  if (!escritorioId) return []
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('casos')
    .select('*, clientes(name)')
    .eq('escritorio_id', escritorioId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapCaso)
}

export async function getCaso(id: string): Promise<Caso | null> {
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('casos')
    .select('*, clientes(name)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return mapCaso(data)
}

export async function criarCaso(input: CasoInput): Promise<Caso> {
  const [userId, escritorioId] = await Promise.all([
    getSessionUserId(),
    getMeuEscritorioId(),
  ])
  if (!userId || !escritorioId) throw new Error('Não autenticado')

  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('casos')
    .insert({
      escritorio_id: escritorioId,
      created_by:    userId,
      cliente_id:    input.cliente_id  || null,
      numero:        input.numero      || null,
      titulo:        input.titulo,
      area:          input.area,
      fase:          input.fase        ?? 'conhecimento',
      status:        input.status      ?? 'active',
      vara:          input.vara        || null,
      juiz:          input.juiz        || null,
      descricao:     input.descricao   || null,
      valor_causa:   input.valor_causa || null,
      notes:         input.notes       || null,
    })
    .select()
    .single()

  if (error) throw error
  return { ...data, cliente_nome: null } as Caso
}

export async function atualizarCaso(id: string, input: Partial<CasoInput>): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('casos').update(input).eq('id', id)
  if (error) throw error
}

export async function deletarCaso(id: string): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('casos').delete().eq('id', id)
  if (error) throw error
}
