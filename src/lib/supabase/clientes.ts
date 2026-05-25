import { createClient } from './client'
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
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []) as Cliente[]
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Cliente | null
}

export async function criarCliente(input: ClienteInput): Promise<Cliente> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const escritorio_id = await getMeuEscritorioId()
  if (!escritorio_id) throw new Error('Nenhum escritório encontrado')

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      escritorio_id,
      created_by: user.id,
      type:       input.type,
      name:       input.name,
      document:   input.document   || null,
      email:      input.email      || null,
      phone:      input.phone      || null,
      address:    input.address    || null,
      city:       input.city       || null,
      state:      input.state      || null,
      status:     input.status     ?? 'active',
      notes:      input.notes      || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Cliente
}

export async function atualizarCliente(id: string, input: Partial<ClienteInput>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('clientes')
    .update(input)
    .eq('id', id)
  if (error) throw error
}

export async function deletarCliente(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}
