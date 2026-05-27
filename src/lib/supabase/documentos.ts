import { createAuthClient } from './client'
import { getMeuEscritorioId } from './escritorio'

export type Documento = {
  id: string
  escritorio_id: string
  caso_id: string | null
  cliente_id: string | null
  uploaded_by: string
  nome: string
  filename: string
  tipo: string
  tamanho: number
  storage_path: string
  url: string
  created_at: string
  updated_at: string
  // Joins
  caso_titulo?: string | null
  cliente_nome?: string | null
}

export type DocumentoInput = {
  caso_id?: string | null
  cliente_id?: string | null
  nome: string
  filename: string
  tipo: string
  tamanho: number
  storage_path: string
  url: string
}

const QUOTA_BYTES = 100 * 1024 * 1024 // 100 MB

export async function listarDocumentos(filtros?: {
  casoId?: string
  clienteId?: string
  tipo?: string
  search?: string
}): Promise<Documento[]> {
  const supabase = await createAuthClient()

  let query = supabase
    .from('documentos')
    .select(`
      *,
      casos:caso_id(titulo),
      clientes:cliente_id(name)
    `)
    .order('created_at', { ascending: false })

  if (filtros?.casoId)    query = query.eq('caso_id', filtros.casoId)
  if (filtros?.clienteId) query = query.eq('cliente_id', filtros.clienteId)
  if (filtros?.tipo && filtros.tipo !== 'all') query = query.eq('tipo', filtros.tipo)
  if (filtros?.search)    query = query.ilike('nome', `%${filtros.search}%`)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map(mapDocumento)
}

export async function buscarDocumento(id: string): Promise<Documento | null> {
  const supabase = await createAuthClient()

  const { data, error } = await supabase
    .from('documentos')
    .select(`
      *,
      casos:caso_id(titulo),
      clientes:cliente_id(name)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapDocumento(data)
}

export async function getQuotaUsada(): Promise<number> {
  const supabase = await createAuthClient()
  const escritorioId = await getMeuEscritorioId()
  if (!escritorioId) return 0

  const { data, error } = await supabase
    .from('documentos')
    .select('tamanho')
    .eq('escritorio_id', escritorioId)

  if (error) throw error
  return (data ?? []).reduce((sum, d) => sum + (d.tamanho ?? 0), 0)
}

export async function getQuotaTotal(): Promise<number> {
  return QUOTA_BYTES
}

export async function deletarDocumento(id: string): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('documentos').delete().eq('id', id)
  if (error) throw error
}

function mapDocumento(d: any): Documento {
  return {
    id:           d.id,
    escritorio_id: d.escritorio_id,
    caso_id:      d.caso_id,
    cliente_id:   d.cliente_id,
    uploaded_by:  d.uploaded_by,
    nome:         d.nome,
    filename:     d.filename,
    tipo:         d.tipo,
    tamanho:      d.tamanho,
    storage_path: d.storage_path,
    url:          d.url,
    created_at:   d.created_at,
    updated_at:   d.updated_at,
    caso_titulo:  d.casos?.titulo ?? null,
    cliente_nome: d.clientes?.name ?? null,
  }
}
