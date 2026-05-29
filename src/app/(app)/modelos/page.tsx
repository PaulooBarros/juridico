'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, FileStack, Plus, Loader2, Pencil, Trash2, Wand2, Globe, CopyPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { formatDate, formatArea, cn } from '@/lib/utils'
import {
  listarModelos, deletarModelo, duplicarModelo,
  type Modelo, type ModeloCategoria,
} from '@/lib/supabase/modelos'

const CATEGORIES: Array<{ value: ModeloCategoria | 'all'; label: string }> = [
  { value: 'all',              label: 'Todos' },
  { value: 'peticoes',         label: 'Petições' },
  { value: 'contratos',        label: 'Contratos' },
  { value: 'procuracoes',      label: 'Procurações' },
  { value: 'correspondencias', label: 'Correspondências' },
  { value: 'outros',           label: 'Outros' },
]

const CATEGORY_COLORS: Record<string, string> = {
  peticoes:         'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  contratos:        'text-purple-600 dark:text-purple-400 bg-purple-500/10',
  procuracoes:      'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
  correspondencias: 'text-teal-600 dark:text-teal-400 bg-teal-500/10',
  outros:           'text-zinc-500 bg-zinc-500/10',
}

export default function ModelosPage() {
  const router = useRouter()
  const [modelos, setModelos]     = useState<Modelo[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState<ModeloCategoria | 'all'>('all')
  const [excluindo, setExcluindo] = useState<Modelo | null>(null)

  async function carregar() {
    setLoading(true)
    try { setModelos(await listarModelos()) }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  async function handleDuplicar(modelo: Modelo) {
    const copia = await duplicarModelo(modelo)
    router.push(`/modelos/${copia.id}`)
  }

  const filtered = modelos.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || m.nome.toLowerCase().includes(q)
      || (m.descricao ?? '').toLowerCase().includes(q)
    const matchCat = category === 'all' || m.categoria === category
    return matchSearch && matchCat
  })

  const catLabel = (v: ModeloCategoria) =>
    CATEGORIES.find(c => c.value === v)?.label ?? v

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos…"
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value as any)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md border font-medium transition-colors',
                category === c.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Link
          href="/modelos/novo"
          className="flex items-center gap-1.5 px-3 h-9 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={14} /> Novo modelo
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          <FileStack size={32} className="mx-auto mb-3 opacity-30" />
          {search || category !== 'all'
            ? 'Nenhum modelo encontrado. Tente ajustar os filtros.'
            : 'Nenhum modelo criado ainda. Clique em "Novo modelo" para começar.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(modelo => {
            const isGlobal = modelo.escritorio_id === null
            return (
              <div
                key={modelo.id}
                className="bg-card border rounded-lg p-5 hover:border-primary/40 transition-colors group flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', CATEGORY_COLORS[modelo.categoria] ?? 'bg-muted text-muted-foreground')}>
                    <FileStack size={15} />
                  </div>
                  <div className="flex items-center gap-1">
                    {isGlobal && (
                      <span title="Template da Leea">
                        <Globe size={11} className="text-muted-foreground" />
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground tabular">{modelo.uso_count}×</span>
                    {!isGlobal && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/modelos/${modelo.id}`}
                          title="Editar"
                          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Pencil size={11} />
                        </Link>
                        <button
                          onClick={() => setExcluindo(modelo)}
                          title="Excluir"
                          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <h3 className="text-xs font-semibold mb-1 leading-snug group-hover:text-primary transition-colors">
                  {modelo.nome}
                </h3>
                {modelo.descricao && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {modelo.descricao}
                  </p>
                )}
                <div className="flex items-center gap-1 flex-wrap mb-auto mt-2">
                  <Badge variant="muted" className="text-[10px]">{catLabel(modelo.categoria)}</Badge>
                  {modelo.area && <Badge variant="muted" className="text-[10px]">{formatArea(modelo.area as any)}</Badge>}
                </div>

                {/* Rodapé */}
                <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">{formatDate(modelo.updated_at)}</span>
                  <div className="flex items-center gap-1">
                    {isGlobal ? (
                      <button
                        onClick={() => handleDuplicar(modelo)}
                        title="Duplicar para editar"
                        className="flex items-center gap-1 h-6 px-2 border border-border rounded text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <CopyPlus size={10} /> Duplicar
                      </button>
                    ) : (
                      <Link
                        href={`/modelos/${modelo.id}`}
                        className="flex items-center gap-1 h-6 px-2 border border-border rounded text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Pencil size={10} /> Editar
                      </Link>
                    )}
                    <Link
                      href={`/modelos/${modelo.id}/usar`}
                      className="flex items-center gap-1 h-6 px-2 bg-primary text-primary-foreground rounded text-[10px] font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Wand2 size={10} /> Usar
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} modelo{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {excluindo && (
        <ConfirmarExclusao
          nome={excluindo.nome}
          onCancelar={() => setExcluindo(null)}
          onConfirmar={async () => {
            await deletarModelo(excluindo.id)
            setExcluindo(null)
            carregar()
          }}
        />
      )}

    </div>
  )
}

// ── Dialog confirmar exclusão ─────────────────────────────────────────────────

function ConfirmarExclusao({
  nome, onCancelar, onConfirmar,
}: {
  nome: string
  onCancelar: () => void
  onConfirmar: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  return (
    <Dialog open onOpenChange={open => { if (!open) onCancelar() }}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Excluir modelo</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong className="text-foreground">{nome}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button onClick={onCancelar}
            className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirmar() }}
            disabled={loading}
            className="px-4 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
