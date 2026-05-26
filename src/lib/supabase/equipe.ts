import { createClient } from './client'
import { getSessionUserId } from '@/lib/auth-client'
import { getMeuEscritorioId } from './escritorio'


export type MembroRole  = 'owner' | 'admin' | 'lawyer' | 'assistant'
export type ConviteRole = 'admin' | 'lawyer' | 'assistant'

export type Membro = {
  id: string
  user_id: string
  role: MembroRole
  created_at: string
  email: string
  nome: string
}

export type ConvitePendente = {
  id: string
  email: string
  role: ConviteRole
  token: string
  expires_at: string
  created_at: string
}

export async function listarMembros(): Promise<Membro[]> {
  const userId = await getSessionUserId()
  if (!userId) return []
  const supabase = createClient()
  const { data, error } = await supabase.rpc('listar_membros_escritorio', { p_user_id: userId })
  if (error) throw error
  return (data as Membro[]) ?? []
}

export async function listarConvitesPendentes(): Promise<ConvitePendente[]> {
  const escritorioId = await getMeuEscritorioId()
  if (!escritorioId) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('convites')
    .select('id, email, role, token, expires_at, created_at')
    .eq('escritorio_id', escritorioId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ConvitePendente[]
}

export async function criarConvite(email: string, role: ConviteRole): Promise<ConvitePendente> {
  const res = await fetch('/api/convite', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, role }),
  })
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Erro ao criar convite' }))
    throw new Error(error ?? 'Erro ao criar convite')
  }
  return res.json()
}

export async function revogarConvite(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('convites').delete().eq('id', id)
  if (error) throw error
}

export async function removerMembro(userId: string): Promise<void> {
  const callerId = await getSessionUserId()
  if (!callerId) throw new Error('Não autenticado')
  const supabase = createClient()
  const { error } = await supabase.rpc('remover_membro', {
    p_caller_id: callerId,
    p_user_id:   userId,
  })
  if (error) throw error
}
