import { createAuthClient } from './client'
import { getSessionUserId } from '@/lib/auth-client'
import { getMeuEscritorioId } from './escritorio'

export type ModeloCategoria = 'peticoes' | 'contratos' | 'procuracoes' | 'correspondencias' | 'outros'

export type Modelo = {
  id: string
  created_at: string
  updated_at: string
  escritorio_id: string | null
  created_by: string | null
  nome: string
  descricao: string | null
  categoria: ModeloCategoria
  area: string | null
  conteudo: any
  tags: string[] | null
  uso_count: number
}

export type ModeloInput = {
  nome: string
  descricao?: string
  categoria: ModeloCategoria
  area?: string
  conteudo: any
  tags?: string[]
}

export async function getModelo(id: string): Promise<Modelo | null> {
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('modelos')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Modelo | null
}

export async function listarModelos(): Promise<Modelo[]> {
  const escritorioId = await getMeuEscritorioId()
  if (!escritorioId) return []
  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('modelos')
    .select('*')
    .or(`escritorio_id.is.null,escritorio_id.eq.${escritorioId}`)
    .order('uso_count', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Modelo[]
}

export async function criarModelo(input: ModeloInput): Promise<Modelo> {
  const [userId, escritorioId] = await Promise.all([
    getSessionUserId(),
    getMeuEscritorioId(),
  ])
  if (!userId || !escritorioId) throw new Error('Não autenticado')

  const supabase = await createAuthClient()
  const { data, error } = await supabase
    .from('modelos')
    .insert({
      escritorio_id: escritorioId,
      created_by:    userId,
      nome:          input.nome,
      descricao:     input.descricao || null,
      categoria:     input.categoria,
      area:          input.area || null,
      conteudo:      input.conteudo,
      tags:          input.tags ?? [],
    })
    .select()
    .single()
  if (error) throw error
  return data as Modelo
}

export async function atualizarModelo(id: string, input: Partial<ModeloInput>): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('modelos').update(input).eq('id', id)
  if (error) throw error
}

export async function deletarModelo(id: string): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('modelos').delete().eq('id', id)
  if (error) throw error
}

export async function duplicarModelo(modelo: Modelo): Promise<Modelo> {
  return criarModelo({
    nome:      `${modelo.nome} (cópia)`,
    descricao: modelo.descricao ?? undefined,
    categoria: modelo.categoria,
    area:      modelo.area ?? undefined,
    conteudo:  modelo.conteudo,
    tags:      modelo.tags ?? [],
  })
}

export async function incrementarUso(id: string): Promise<void> {
  const supabase = await createAuthClient()
  await supabase.rpc('incrementar_uso_modelo', { modelo_id: id })
}

// Extrai texto plano de um documento TipTap JSON
export function docToPlainText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'

  const children = (node.content ?? []).map(docToPlainText).join('')

  if (node.type === 'paragraph') return children + '\n'
  if (node.type === 'heading') return children + '\n'
  if (node.type === 'listItem') return '• ' + children.trim() + '\n'
  if (node.type === 'bulletList' || node.type === 'orderedList') return children + '\n'
  if (node.type === 'blockquote') return children
  return children
}

// Extrai variáveis únicas {{nome}} do conteúdo TipTap
export function extrairVariaveis(conteudo: any): string[] {
  const texto = docToPlainText(conteudo)
  const matches = texto.match(/\{\{([^}]+)\}\}/g) ?? []
  return Array.from(new Set(matches))
}
