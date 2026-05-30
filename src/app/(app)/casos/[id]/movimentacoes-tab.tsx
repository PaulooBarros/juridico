'use client'
import { useState, useEffect } from 'react'
import { RefreshCw, Loader2, AlertCircle, Scale, FileSearch } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { resolverTribunal } from '@/lib/datajud'
import type { DatajudProcesso } from '@/lib/datajud'

interface Props {
  casoId:      string
  numeroProp:  string | null
}

type Estado =
  | { fase: 'idle' }
  | { fase: 'carregando' }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'ok'; processo: DatajudProcesso; consultadoEm: Date }

export function MovimentacoesTab({ numeroProp }: Props) {
  const [numero, setNumero] = useState(numeroProp)
  const [estado, setEstado] = useState<Estado>({ fase: 'idle' })

  // Reseta apenas se o número mudar de valor (não em re-renders normais)
  useEffect(() => {
    if (numeroProp !== numero) {
      setNumero(numeroProp)
      setEstado({ fase: 'idle' })
    }
  }, [numeroProp])

  const tribunal = numero ? resolverTribunal(numero) : null

  async function consultar() {
    if (!numero) return
    setEstado({ fase: 'carregando' })
    try {
      const res  = await fetch('/api/datajud', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ numero }),
      })
      const json = await res.json()
      if (!json.ok) {
        setEstado({ fase: 'erro', mensagem: json.erro ?? 'Erro desconhecido.' })
      } else {
        setEstado({ fase: 'ok', processo: json.processo, consultadoEm: new Date() })
      }
    } catch {
      setEstado({ fase: 'erro', mensagem: 'Não foi possível conectar ao DataJud.' })
    }
  }

  // Caso sem número
  if (!numero) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <FileSearch size={32} className="text-muted-foreground opacity-30" />
        <p className="text-xs font-medium text-muted-foreground">Número do processo não cadastrado</p>
        <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
          Edite o caso e informe o número no formato CNJ para consultar as movimentações no DataJud.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header da consulta */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{numero}</span>
            {tribunal && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium uppercase">
                {tribunal}
              </span>
            )}
          </div>
          {estado.fase === 'ok' && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Consultado em {estado.consultadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={consultar}
          disabled={estado.fase === 'carregando'}
          className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
        >
          {estado.fase === 'carregando'
            ? <><Loader2 size={13} className="animate-spin" /> Consultando…</>
            : <><RefreshCw size={13} /> Consultar DataJud</>
          }
        </button>
      </div>

      {/* Estado de erro */}
      {estado.fase === 'erro' && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-lg text-xs text-destructive">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p>{estado.mensagem}</p>
        </div>
      )}

      {/* Resultado */}
      {estado.fase === 'ok' && (
        <div className="space-y-4">

          {/* Resumo do processo */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {estado.processo.classe && (
              <InfoCard label="Classe" value={estado.processo.classe.nome} />
            )}
            {estado.processo.dataAjuizamento && (
              <InfoCard
                label="Ajuizamento"
                value={new Date(estado.processo.dataAjuizamento)
                  .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              />
            )}
            {estado.processo.orgaoJulgador && (
              <InfoCard label="Órgão julgador" value={estado.processo.orgaoJulgador.nome} />
            )}
            {estado.processo.assuntos && estado.processo.assuntos.length > 0 && (
              <InfoCard label="Assunto" value={estado.processo.assuntos[0].nome} />
            )}
          </div>

          {/* Movimentações */}
          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="text-xs font-semibold flex items-center gap-1.5">
                <Scale size={12} /> Movimentações
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {estado.processo.movimentos.length} registro{estado.processo.movimentos.length !== 1 ? 's' : ''}
              </span>
            </div>

            {estado.processo.movimentos.length === 0 ? (
              <p className="text-xs text-muted-foreground px-4 py-6 text-center">
                Nenhuma movimentação registrada.
              </p>
            ) : (
              <div className="divide-y max-h-[520px] overflow-y-auto">
                {estado.processo.movimentos.map((mov, i) => {
                  const data = new Date(mov.dataHora)
                  return (
                    <div key={i} className="flex gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                      {/* Data */}
                      <div className="shrink-0 w-24 text-right">
                        <p className="text-[11px] font-medium tabular">
                          {data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-muted-foreground tabular">
                          {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Linha divisora */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1 shrink-0" />
                        {i < estado.processo.movimentos.length - 1 && (
                          <div className="w-px flex-1 bg-border" />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-[13px] font-medium leading-snug">{mov.nome}</p>
                        {mov.complementos && mov.complementos.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {mov.complementos.map((c, j) => (
                              <p key={j} className="text-[11px] text-muted-foreground">
                                {c.descricao}: {c.valor}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado idle — instrução inicial */}
      {estado.fase === 'idle' && (
        <p className="text-[11px] text-muted-foreground">
          Clique em "Consultar DataJud" para buscar as movimentações mais recentes deste processo.
        </p>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 border rounded-lg px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-[12px] font-medium leading-snug">{value}</p>
    </div>
  )
}
