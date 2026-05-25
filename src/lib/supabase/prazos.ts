import { createClient } from './client'
import { getMeuEscritorioId } from './escritorio'

export type PrazoTipo   = 'prazo' | 'audiencia' | 'reuniao' | 'protocolo' | 'recurso' | 'outro'
export type PrazoStatus = 'pending' | 'done' | 'cancelled'

export type Prazo = {
  id:              string
  created_at:      string
  updated_at:      string
  escritorio_id:   string
  caso_id:         string | null
  created_by:      string
  titulo:          string
  descricao:       string | null
  data_prazo:      string
  tipo:            PrazoTipo
  status:          PrazoStatus
  google_event_id: string | null
}

export type PrazoInput = {
  titulo:     string
  descricao?: string
  data_prazo: string
  tipo:       PrazoTipo
  caso_id?:   string
  status?:    PrazoStatus
}

export const PRAZO_TIPO_LABEL: Record<PrazoTipo, string> = {
  prazo:     'Prazo',
  audiencia: 'Audiência',
  reuniao:   'Reunião',
  protocolo: 'Protocolo',
  recurso:   'Recurso',
  outro:     'Outro',
}

export type PrazoComCaso = Prazo & { caso_titulo: string | null }

export async function listarTodosPrazos(): Promise<PrazoComCaso[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('prazos')
    .select('*, casos(titulo)')
    .order('data_prazo', { ascending: true })
  return ((data ?? []) as any[]).map(p => ({
    ...p,
    caso_titulo: p.casos?.titulo ?? null,
    casos: undefined,
  }))
}

export async function listarPrazosDoCaso(casoId: string): Promise<Prazo[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('prazos')
    .select('*')
    .eq('caso_id', casoId)
    .order('data_prazo', { ascending: true })
  return (data ?? []) as Prazo[]
}

export async function criarPrazo(input: PrazoInput): Promise<Prazo> {
  const supabase = createClient()
  const [escritorioId, { data: { user } }] = await Promise.all([
    getMeuEscritorioId(),
    supabase.auth.getUser(),
  ])
  if (!escritorioId || !user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('prazos')
    .insert({ ...input, escritorio_id: escritorioId, created_by: user.id })
    .select()
    .single()
  if (error) throw error
  return data as Prazo
}

export async function atualizarPrazo(id: string, input: Partial<PrazoInput>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('prazos').update(input).eq('id', id)
  if (error) throw error
}

export async function deletarPrazo(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('prazos').delete().eq('id', id)
  if (error) throw error
}
