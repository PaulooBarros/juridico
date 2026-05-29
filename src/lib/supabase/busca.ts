import { createAuthClient } from './client'
import { getMeuEscritorioId } from './escritorio'
import { getSessionUserId } from '@/lib/auth-client'

export type ResultadoBusca = {
  id:        string
  tipo:      'caso' | 'cliente' | 'documento' | 'membro'
  titulo:    string
  subtitulo: string
  href:      string
}

export async function buscarGlobal(query: string): Promise<ResultadoBusca[]> {
  if (!query || query.trim().length < 2) return []

  const [escritorioId, supabase] = await Promise.all([
    getMeuEscritorioId(),
    createAuthClient(),
  ])

  if (!escritorioId) return []

  const q      = query.trim()
  const userId = await getSessionUserId()

  const [{ data: casos }, { data: clientes }, { data: documentos }, membros] = await Promise.all([
    supabase
      .from('casos')
      .select('id, titulo, numero, area, status')
      .eq('escritorio_id', escritorioId)
      .or(`titulo.ilike.%${q}%,numero.ilike.%${q}%`)
      .limit(5),

    supabase
      .from('clientes')
      .select('id, name, document, type')
      .eq('escritorio_id', escritorioId)
      .or(`name.ilike.%${q}%,document.ilike.%${q}%`)
      .limit(5),

    supabase
      .from('documentos')
      .select('id, nome, filename, tipo')
      .eq('escritorio_id', escritorioId)
      .or(`nome.ilike.%${q}%,filename.ilike.%${q}%`)
      .limit(5),

    (async (): Promise<any[]> => {
      if (!userId) return []
      try {
        const { data } = await supabase.rpc('listar_membros_escritorio', { p_user_id: userId })
        return (data ?? []).filter((m: any) =>
          m.nome?.toLowerCase().includes(q.toLowerCase()) ||
          m.email?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 5)
      } catch {
        return []
      }
    })(),
  ])

  const AREA: Record<string, string> = {
    civil: 'Cível', criminal: 'Criminal', trabalhista: 'Trabalhista',
    tributario: 'Tributário', empresarial: 'Empresarial', familia: 'Família',
    consumidor: 'Consumidor', previdenciario: 'Previdenciário',
  }

  const TIPO_DOC: Record<string, string> = {
    peticao: 'Petição', contrato: 'Contrato', procuracao: 'Procuração',
    sentenca: 'Sentença', recurso: 'Recurso', laudo: 'Laudo',
    comprovante: 'Comprovante', outro: 'Outro',
  }

  const ROLE_LABEL: Record<string, string> = {
    owner: 'Titular', admin: 'Administrador', lawyer: 'Advogado', assistant: 'Assistente',
  }

  const resultados: ResultadoBusca[] = [
    ...(casos ?? []).map((c: any) => ({
      id:        c.id,
      tipo:      'caso' as const,
      titulo:    c.titulo,
      subtitulo: [AREA[c.area] ?? c.area, c.numero].filter(Boolean).join(' · '),
      href:      `/casos/${c.id}`,
    })),
    ...(clientes ?? []).map((c: any) => ({
      id:        c.id,
      tipo:      'cliente' as const,
      titulo:    c.name,
      subtitulo: [c.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física', c.document].filter(Boolean).join(' · '),
      href:      `/clientes/${c.id}`,
    })),
    ...(documentos ?? []).map((d: any) => ({
      id:        d.id,
      tipo:      'documento' as const,
      titulo:    d.nome,
      subtitulo: TIPO_DOC[d.tipo] ?? d.tipo,
      href:      `/documentos/${d.id}`,
    })),
    ...(membros as any[]).map(m => ({
      id:        m.id,
      tipo:      'membro' as const,
      titulo:    m.nome,
      subtitulo: [ROLE_LABEL[m.role] ?? m.role, m.email].filter(Boolean).join(' · '),
      href:      `/equipe`,
    })),
  ]

  return resultados
}
