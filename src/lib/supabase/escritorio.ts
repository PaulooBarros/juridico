import { createClient } from './client'

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

/** Retorna o escritorio_id do usuário logado, ou null se não tiver nenhum. */
export async function getMeuEscritorioId(): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('membros')
    .select('escritorio_id')
    .limit(1)
    .maybeSingle()
  return data?.escritorio_id ?? null
}

export async function criarEscritorioCompleto(input: CriarEscritorioInput) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // 1. Upload logo (se houver) — Storage bypassa RLS por bucket policy
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

  // 2. Criar escritório + membros + convites via RPC (security definer, sem RLS)
  const { data, error } = await supabase.rpc('criar_escritorio_completo', {
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

  // 3. Atualizar perfil do advogado nos metadados do usuário
  await supabase.auth.updateUser({
    data: {
      nome_profissional: input.nomeAdvogado,
      oab:               input.oabAdvogado,
      areas_atuacao:     input.areas,
      bio:               input.bio,
      escritorio_id:     result.escritorio_id,
    },
  })

  return {
    escritorioId:    result.escritorio_id,
    convitesCriados: result.convites ?? [],
  }
}
