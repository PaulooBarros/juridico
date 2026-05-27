import { createClient, createAuthClient } from './client'
import { authClient, getSessionUserId } from '@/lib/auth-client'

export type ConviteInput = { email: string; role: string }

export type CriarEscritorioInput = {
  nome: string
  cnpj: string
  oab_sociedade: string
  especialidade: string
  cidade_uf: string
  logoFile: File | null
  slug: string
  slogan: string
  descricao: string
  nomeAdvogado: string
  oabAdvogado: string
  areas: string[]
  bio: string
  convites: ConviteInput[]
  plano: string
}

export type ConviteCriado = {
  id: string
  email: string
  role: string
  token: string
}

function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export type Escritorio = {
  id: string
  nome: string
  cnpj: string | null
  oab_sociedade: string | null
  especialidade: string | null
  cidade_uf: string | null
  slogan: string | null
  descricao: string | null
  logo_url: string | null
  slug: string | null
  plano: string
  created_at: string
}

export type EscritorioUpdate = Partial<Omit<Escritorio, 'id' | 'created_at' | 'plano'>>

/** Retorna o escritório_id do usuário logado, ou null. */
export async function getMeuEscritorioId(): Promise<string | null> {
  const userId = await getSessionUserId()
  if (!userId) return null
  const supabase = await createAuthClient()
  const { data } = await supabase
    .from('membros')
    .select('escritorio_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  return data?.escritorio_id ?? null
}

/** Retorna o escritório completo do usuário logado, ou null. */
export async function getMeuEscritorio(): Promise<Escritorio | null> {
  const escritorioId = await getMeuEscritorioId()
  if (!escritorioId) return null
  const supabase = await createAuthClient()
  const { data } = await supabase
    .from('escritorios')
    .select('*')
    .eq('id', escritorioId)
    .single()
  return data as Escritorio | null
}

/** Atualiza campos do escritório (owner/admin). */
export async function atualizarEscritorio(id: string, input: EscritorioUpdate): Promise<void> {
  const supabase = await createAuthClient()
  const { error } = await supabase.from('escritorios').update(input).eq('id', id)
  if (error) throw error
}

export async function criarEscritorioCompleto(input: CriarEscritorioInput) {
  const session = await authClient.getSession()
  const user = session.data?.user
  if (!user) throw new Error('Não autenticado')

  const supabase = createClient()

  // 1. Upload logo (se houver)
  let logo_url = ''
  if (input.logoFile) {
    const ext = input.logoFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('logos')
      .upload(path, input.logoFile, { upsert: true })
    if (!uploadErr) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      logo_url = data.publicUrl
    }
  }

  // 2. Criar escritório + membros + convites via RPC
  const { data, error } = await supabase.rpc('criar_escritorio_completo', {
    p_user_id:       user.id,
    p_nome:          input.nome,
    p_cnpj:          input.cnpj,
    p_oab_sociedade: input.oab_sociedade,
    p_especialidade: input.especialidade,
    p_cidade_uf:     input.cidade_uf,
    p_slogan:        input.slogan,
    p_descricao:     input.descricao,
    p_logo_url:      logo_url,
    p_slug:          input.slug || gerarSlug(input.nome),
    p_plano:         input.plano,
    p_convites:      input.convites.filter(c => c.email.trim()),
  })

  if (error) throw error

  const result = data as { escritorio_id: string; convites: ConviteCriado[] }

  // 3. Atualizar perfil profissional no Better Auth
  await authClient.updateUser({
    nome_profissional: input.nomeAdvogado,
    oab:               input.oabAdvogado,
    areas_atuacao:     JSON.stringify(input.areas),
    bio:               input.bio,
    escritorio_id:     result.escritorio_id,
  } as any)

  return {
    escritorioId:    result.escritorio_id,
    convitesCriados: result.convites ?? [],
  }
}
