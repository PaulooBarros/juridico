// DataJud — API pública do CNJ
// Documentação: https://datajud-wiki.cnj.jus.br/api-publica/

const DATAJUD_BASE = 'https://api-publica.datajud.cnj.jus.br'
const DATAJUD_KEY  = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

// ── Mapeamento J.TT → sufixo do endpoint ─────────────────────────────────────
// Formato CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO
//   J  = ramo da justiça (1 dígito)
//   TT = código do tribunal (2 dígitos)

const TRIBUNAL_MAP: Record<string, string> = {
  // Supremo Tribunal Federal
  '1.00': 'stf',

  // CNJ
  '2.00': 'cnj',

  // Superior Tribunal de Justiça
  '3.00': 'stj',

  // Justiça Federal — Tribunais Regionais Federais
  '4.01': 'trf1',
  '4.02': 'trf2',
  '4.03': 'trf3',
  '4.04': 'trf4',
  '4.05': 'trf5',
  '4.06': 'trf6',

  // Justiça do Trabalho — TST + TRTs
  '5.00': 'tst',
  '5.01': 'trt1',
  '5.02': 'trt2',
  '5.03': 'trt3',
  '5.04': 'trt4',
  '5.05': 'trt5',
  '5.06': 'trt6',
  '5.07': 'trt7',
  '5.08': 'trt8',
  '5.09': 'trt9',
  '5.10': 'trt10',
  '5.11': 'trt11',
  '5.12': 'trt12',
  '5.13': 'trt13',
  '5.14': 'trt14',
  '5.15': 'trt15',
  '5.16': 'trt16',
  '5.17': 'trt17',
  '5.18': 'trt18',
  '5.19': 'trt19',
  '5.20': 'trt20',
  '5.21': 'trt21',
  '5.22': 'trt22',
  '5.23': 'trt23',
  '5.24': 'trt24',

  // Justiça Eleitoral — TSE + TREs
  '6.00': 'tse',
  '6.01': 'trema',  // Acre
  '6.02': 'treap',  // Amapá
  '6.03': 'treal',  // Alagoas
  '6.04': 'tream',  // Amazonas
  '6.05': 'treba',  // Bahia
  '6.06': 'trece',  // Ceará
  '6.07': 'tredf',  // DF
  '6.08': 'trees',  // Espírito Santo
  '6.09': 'trego',  // Goiás
  '6.10': 'trema2', // Maranhão (trema já usado — tratado como treMA)
  '6.11': 'tremt',  // Mato Grosso
  '6.12': 'trems',  // Mato Grosso do Sul
  '6.13': 'tremg',  // Minas Gerais
  '6.14': 'trepa',  // Pará
  '6.15': 'trepb',  // Paraíba
  '6.16': 'trepr',  // Paraná
  '6.17': 'trepe',  // Pernambuco
  '6.18': 'trepi',  // Piauí
  '6.19': 'trerj',  // Rio de Janeiro
  '6.20': 'trern',  // Rio Grande do Norte
  '6.21': 'trers',  // Rio Grande do Sul
  '6.22': 'trero',  // Rondônia
  '6.23': 'trerr',  // Roraima
  '6.24': 'tresc',  // Santa Catarina
  '6.25': 'trese',  // Sergipe
  '6.26': 'tresp',  // Aracaju
  '6.27': 'treto',  // Tocantins

  // Justiça Militar da União
  '7.00': 'stm',
  '7.07': 'cjm1',  // 1ª CJM (Brasília)
  '7.02': 'cjm2',  // 2ª CJM (SP)
  '7.03': 'cjm3',  // 3ª CJM (Porto Alegre)

  // Justiça Estadual — TJs (TT = código do estado)
  '8.01': 'tjac',  // Acre
  '8.02': 'tjal',  // Alagoas
  '8.03': 'tjap',  // Amapá
  '8.04': 'tjam',  // Amazonas
  '8.05': 'tjba',  // Bahia
  '8.06': 'tjce',  // Ceará
  '8.07': 'tjdft', // Distrito Federal
  '8.08': 'tjes',  // Espírito Santo
  '8.09': 'tjgo',  // Goiás
  '8.10': 'tjma',  // Maranhão
  '8.11': 'tjmt',  // Mato Grosso
  '8.12': 'tjms',  // Mato Grosso do Sul
  '8.13': 'tjmg',  // Minas Gerais
  '8.14': 'tjpa',  // Pará
  '8.15': 'tjpb',  // Paraíba
  '8.16': 'tjpr',  // Paraná
  '8.17': 'tjpe',  // Pernambuco
  '8.18': 'tjpi',  // Piauí
  '8.19': 'tjrj',  // Rio de Janeiro
  '8.20': 'tjrn',  // Rio Grande do Norte
  '8.21': 'tjrs',  // Rio Grande do Sul
  '8.22': 'tjro',  // Rondônia
  '8.23': 'tjrr',  // Roraima
  '8.24': 'tjsc',  // Santa Catarina
  '8.25': 'tjse',  // Sergipe
  '8.26': 'tjsp',  // Aracaju
  '8.27': 'tjto',  // Tocantins

  // Justiça Militar Estadual
  '9.13': 'tjmmg', // MG
  '9.21': 'tjmrs', // RS
  '9.26': 'tjmsp', // SP
}

export type DatajudMovimento = {
  dataHora: string
  codigo:   number
  nome:     string
  complementos?: Array<{ descricao: string; valor: string }>
}

export type DatajudProcesso = {
  numeroProcesso:             string
  tribunal:                   string
  dataAjuizamento?:           string
  dataHoraUltimaAtualizacao?: string
  grau?:                      string
  formato?:                   string
  classe?:                    { codigo: number; nome: string }
  assuntos?:                  Array<{ codigo: number; nome: string }>
  orgaoJulgador?:             { codigo: number; nome: string }
  movimentos:                 DatajudMovimento[]
}

export type DatajudResult =
  | { ok: true;  processo: DatajudProcesso; tribunal: string }
  | { ok: false; erro: string }

// Normaliza número para o formato com máscara NNNNNNN-DD.AAAA.J.TT.OOOO
export function normalizarNumero(numero: string): string {
  const limpo = numero.replace(/\D/g, '')
  // 20 dígitos sem separadores → aplica máscara CNJ
  if (limpo.length === 20) {
    return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9, 13)}.${limpo.slice(13, 14)}.${limpo.slice(14, 16)}.${limpo.slice(16, 20)}`
  }
  return numero.trim()
}

// Extrai J e TT do número do processo no formato CNJ
function extrairJT(numero: string): { j: string; tt: string } | null {
  const normalizado = normalizarNumero(numero)
  const match = normalizado.match(/^\d{7}-\d{2}\.\d{4}\.(\d)\.(\d{2})\.\d{4}$/)
  if (!match) return null
  return { j: match[1], tt: match[2] }
}

export function resolverTribunal(numero: string): string | null {
  const jt = extrairJT(numero)
  if (!jt) return null
  const chave = `${jt.j}.${jt.tt}`
  return TRIBUNAL_MAP[chave] ?? null
}

export async function consultarProcesso(numero: string): Promise<DatajudResult> {
  const normalizado = normalizarNumero(numero)
  const tribunal    = resolverTribunal(normalizado)
  if (!tribunal) {
    return { ok: false, erro: 'Número do processo em formato inválido ou tribunal não identificado.' }
  }

  const url  = `${DATAJUD_BASE}/api_publica_${tribunal}/_search`
  // DataJud armazena o número sem máscara (20 dígitos puros, sem traços e pontos)
  const numeroSemMascara = normalizado.replace(/\D/g, '')

  const body = {
    query: {
      match: { numeroProcesso: numeroSemMascara },
    },
    size: 1,
  }

  let res: Response
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: {
        'Authorization': `APIKey ${DATAJUD_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
      // Timeout de 15 segundos — DataJud pode ser lento
      signal: AbortSignal.timeout(15000),
    })
  } catch (e: any) {
    if (e.name === 'TimeoutError') {
      return { ok: false, erro: 'O DataJud demorou demais para responder. Tente novamente.' }
    }
    return { ok: false, erro: 'Não foi possível conectar ao DataJud.' }
  }

  if (res.status === 404) {
    return { ok: false, erro: `Tribunal "${tribunal}" não encontrado no DataJud. Verifique se o número do processo está correto.` }
  }
  if (!res.ok) {
    return { ok: false, erro: `DataJud retornou erro ${res.status}. Tente novamente mais tarde.` }
  }

  const json = await res.json()
  const hits  = json?.hits?.hits ?? []

  if (hits.length === 0) {
    return { ok: false, erro: `Processo não encontrado no DataJud. O tribunal ${tribunal.toUpperCase()} pode estar com atraso na sincronização — tente novamente mais tarde.` }
  }

  const fonte = hits[0]._source as any

  const processo: DatajudProcesso = {
    numeroProcesso:             fonte.numeroProcesso             ?? normalizado,
    tribunal:                   fonte.tribunal                   ?? tribunal.toUpperCase(),
    dataAjuizamento:            fonte.dataAjuizamento            ?? undefined,
    dataHoraUltimaAtualizacao:  fonte.dataHoraUltimaAtualizacao ?? undefined,
    grau:                       fonte.grau                       ?? undefined,
    formato:                    fonte.formato                    ?? undefined,
    classe:                     fonte.classe                     ?? undefined,
    assuntos:                   fonte.assuntos                   ?? [],
    orgaoJulgador:              fonte.orgaoJulgador              ?? undefined,
    movimentos:      (fonte.movimentos ?? []).sort(
      (a: DatajudMovimento, b: DatajudMovimento) =>
        new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
    ),
  }

  return { ok: true, processo, tribunal: tribunal.toUpperCase() }
}
