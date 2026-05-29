'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Loader2, Pencil, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  getModelo, incrementarUso, extrairVariaveis, docToPlainText,
  type Modelo,
} from '@/lib/supabase/modelos'

const VARIAVEIS_AUTO: Record<string, () => string> = {
  '{{data_hoje}}': () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
}

export default function UsarModeloPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [modelo, setModelo]   = useState<Modelo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [valores, setValores] = useState<Record<string, string>>({})

  useEffect(() => {
    getModelo(params.id).then(m => {
      if (!m) { router.replace('/modelos'); return }
      setModelo(m)
      // Pré-preenche variáveis automáticas
      const vars = extrairVariaveis(m.conteudo)
      const inicial: Record<string, string> = {}
      for (const v of vars) {
        inicial[v] = VARIAVEIS_AUTO[v]?.() ?? ''
      }
      setValores(inicial)
    }).catch(() => router.replace('/modelos'))
      .finally(() => setLoading(false))
  }, [params.id])

  const variaveis = useMemo(
    () => (modelo ? extrairVariaveis(modelo.conteudo) : []),
    [modelo]
  )

  const textoGerado = useMemo(() => {
    if (!modelo) return ''
    let t = docToPlainText(modelo.conteudo)
    for (const [variavel, valor] of Object.entries(valores)) {
      t = t.replaceAll(variavel, valor || variavel)
    }
    return t.trim()
  }, [modelo, valores])

  // Variáveis ainda não preenchidas
  const pendentes = variaveis.filter(v => !valores[v]?.trim())

  async function copiar() {
    await navigator.clipboard.writeText(textoGerado)
    setCopiado(true)
    if (modelo) incrementarUso(modelo.id)
    setTimeout(() => setCopiado(false), 2500)
  }

  const nomeVar = (v: string) =>
    v.replace(/\{\{|\}\}/g, '').replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!modelo) return null

  return (
    <div className="flex flex-col gap-0 animate-fade-in" style={{ minHeight: 'calc(100vh - 49px - 48px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          href={`/modelos/${params.id}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={13} /> {modelo.nome}
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/modelos/${params.id}`}
            className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Pencil size={12} /> Editar modelo
          </Link>
          <button
            onClick={copiar}
            disabled={!textoGerado}
            className={cn(
              'flex items-center gap-1.5 px-4 h-8 rounded-md text-xs font-medium transition-all disabled:opacity-40',
              copiado
                ? 'bg-green-600 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {copiado
              ? <><Check size={13} /> Texto copiado!</>
              : <><Copy size={13} /> Copiar texto</>
            }
          </button>
        </div>
      </div>

      {/* Corpo: variáveis + preview */}
      <div className="flex gap-6 flex-col lg:flex-row flex-1">

        {/* Painel de variáveis */}
        <div className="w-full lg:w-72 shrink-0 space-y-5">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Variáveis — {variaveis.length}
            </h2>

            {variaveis.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Este modelo não tem variáveis. Copie o texto diretamente.
              </p>
            ) : (
              <div className="space-y-3">
                {variaveis.map(v => (
                  <div key={v} className="flex flex-col gap-1.5">
                    <Label className={cn(
                      'text-[12px] font-medium transition-colors',
                      valores[v]?.trim() ? 'text-foreground' : 'text-muted-foreground',
                    )}>
                      {nomeVar(v)}
                    </Label>
                    <Input
                      value={valores[v] ?? ''}
                      onChange={e => setValores(prev => ({ ...prev, [v]: e.target.value }))}
                      placeholder={nomeVar(v)}
                      className={cn(
                        'h-8 text-[13px] transition-colors',
                        valores[v]?.trim() && 'border-primary/40',
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            {pendentes.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-4">
                {pendentes.length} campo{pendentes.length !== 1 ? 's' : ''} ainda não preenchido{pendentes.length !== 1 ? 's' : ''}.
              </p>
            )}
            {pendentes.length === 0 && variaveis.length > 0 && (
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-4 flex items-center gap-1">
                <Check size={11} /> Tudo preenchido — pronto para copiar.
              </p>
            )}
          </div>
        </div>

        {/* Preview do documento */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText size={12} /> Prévia do documento
          </h2>
          <div className="flex-1 rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="h-full overflow-y-auto p-8 lg:p-12">
              {textoGerado ? (
                <pre className="font-sans text-[13px] leading-[1.8] text-foreground whitespace-pre-wrap">
                  {/* Destaca variáveis ainda não preenchidas */}
                  {renderTextoComDestaques(textoGerado, pendentes)}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                  O conteúdo do modelo aparecerá aqui.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Renderiza o texto destacando variáveis não substituídas (ainda no formato {{...}})
function renderTextoComDestaques(texto: string, pendentes: string[]) {
  if (pendentes.length === 0) return texto

  const partes: React.ReactNode[] = []
  let restante = texto
  let i = 0

  while (restante.length > 0) {
    const match = restante.match(/\{\{[^}]+\}\}/)
    if (!match || match.index === undefined) {
      partes.push(restante)
      break
    }
    if (match.index > 0) {
      partes.push(restante.slice(0, match.index))
    }
    const variavel = match[0]
    const isPendente = pendentes.includes(variavel)
    partes.push(
      <mark
        key={i++}
        className={cn(
          'rounded px-0.5 not-italic',
          isPendente
            ? 'bg-amber-200/70 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300'
            : 'bg-primary/10 text-primary',
        )}
      >
        {variavel}
      </mark>
    )
    restante = restante.slice(match.index + variavel.length)
  }

  return <>{partes}</>
}
