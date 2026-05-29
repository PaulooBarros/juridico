import { createAuthClient } from './client'
import { getSessionUserId } from '@/lib/auth-client'
import { getMeuEscritorioId } from './escritorio'

export type TarefaStatus    = 'pendente' | 'em_andamento' | 'concluida'
export type TarefaPrioridade = 'alta' | 'media' | 'baixa'

export type Tarefa = {
  id:             string
  caso_id:        string
  escritorio_id:  string
  titulo:         string
  descricao:      string | null
  responsavel_id: string | null
  responsavel_nome: string | null
  status:         TarefaStatus
  prioridade:     TarefaPrioridade
  data_limite:    string | null
  created_by:     string
  created_at:     string
}

export type TarefaInput = {
  titulo:         string
  descricao?:     string | null
  responsavel_id?: string | null
  status?:        TarefaStatus
  prioridade?:    TarefaPrioridade
  data_limite?:   string | null
}

export const STATUS_LABEL: Record<TarefaStatus, string> = {
  pendente:     'Pendente',
  em_andamento: 'Em andamento',
  concluida:    'Concluída',
}

export const PRIORIDADE_LABEL: Record<TarefaPrioridade, string> = {
  alta:  'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

function mapTarefa(d: any): Tarefa {
  return {
    ...d,
    responsavel_nome: d.responsavel?.nome_profissional ?? d.responsavel?.name ?? null,
    responsavel: undefined,
  }
}

export async function listarTarefasDoCaso(casoId: string): Promise<Tarefa[]> {
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('tarefas')
    .select('*, responsavel:responsavel_id(name, nome_profissional)')
    .eq('caso_id', casoId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapTarefa)
}

export async function criarTarefa(casoId: string, input: TarefaInput): Promise<Tarefa> {
  const [userId, escritorioId] = await Promise.all([
    getSessionUserId(),
    getMeuEscritorioId(),
  ])
  if (!userId || !escritorioId) throw new Error('Não autenticado')

  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('tarefas')
    .insert({
      caso_id:        casoId,
      escritorio_id:  escritorioId,
      created_by:     userId,
      titulo:         input.titulo,
      descricao:      input.descricao      ?? null,
      responsavel_id: input.responsavel_id ?? null,
      status:         input.status         ?? 'pendente',
      prioridade:     input.prioridade     ?? 'media',
      data_limite:    input.data_limite    ?? null,
    })
    .select('*, responsavel:responsavel_id(name, nome_profissional)')
    .single()

  if (error) throw error
  return mapTarefa(data)
}

export async function atualizarTarefa(id: string, input: Partial<TarefaInput>): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('tarefas').update(input).eq('id', id)
  if (error) throw error
}

export async function deletarTarefa(id: string): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('tarefas').delete().eq('id', id)
  if (error) throw error
}
