import { createAuthClient } from './client'
import { getSessionUserId } from '@/lib/auth-client'
import { getMeuEscritorioId } from './escritorio'

export type ClienteStatus = 'active' | 'inactive' | 'prospect'
export type ClienteType   = 'pf' | 'pj'

export type Cliente = {
  id: string
  created_at: string
  escritorio_id: string
  type: ClienteType
  name: string
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  status: ClienteStatus
  notes: string | null
}

export type ClienteInput = {
  type: ClienteType
  name: string
  document?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  status?: ClienteStatus
  notes?: string
}

export async function listarClientes(): Promise<Cliente[]> {
  const escritorioId = await getMeuEscritorioId()
  if (!escritorioId) return []
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('name')
  if (error) throw error
  return (data ?? []) as Cliente[]
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Cliente | null
}

export async function criarCliente(input: ClienteInput): Promise<Cliente> {
  const [userId, escritorioId] = await Promise.all([
    getSessionUserId(),
    getMeuEscritorioId(),
  ])
  if (!userId || !escritorioId) throw new Error('Não autenticado')

  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      escritorio_id: escritorioId,
      created_by:    userId,
      type:          input.type,
      name:          input.name,
      document:      input.document   || null,
      email:         input.email      || null,
      phone:         input.phone      || null,
      address:       input.address    || null,
      city:          input.city       || null,
      state:         input.state      || null,
      status:        input.status     ?? 'active',
      notes:         input.notes      || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Cliente
}

export async function atualizarCliente(id: string, input: Partial<ClienteInput>): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('clientes').update(input).eq('id', id)
  if (error) throw error
}

export async function deletarCliente(id: string): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}
