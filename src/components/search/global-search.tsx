'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Briefcase, Users, FileText, UserCircle, ArrowRight, X, Loader2 } from 'lucide-react'
import { buscarGlobal, type ResultadoBusca } from '@/lib/supabase/busca'
import { cn } from '@/lib/utils'

const TIPO_ICON = {
  caso:      Briefcase,
  cliente:   Users,
  documento: FileText,
  membro:    UserCircle,
}

const TIPO_LABEL = {
  caso:      'Caso',
  cliente:   'Cliente',
  documento: 'Documento',
  membro:    'Membro',
}

const TIPO_COLOR: Record<ResultadoBusca['tipo'], string> = {
  caso:      'text-blue-600 dark:text-blue-400',
  cliente:   'text-emerald-600 dark:text-emerald-400',
  documento: 'text-red-500',
  membro:    'text-violet-600 dark:text-violet-400',
}

interface GlobalSearchProps {
  open:    boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router     = useRouter()
  const inputRef   = useRef<HTMLInputElement>(null)
  const listRef    = useRef<HTMLDivElement>(null)

  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<ResultadoBusca[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(0)

  // Foca o input ao abrir
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Busca com debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const data = await buscarGlobal(query)
        setResults(data)
        setSelected(0)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const navegar = useCallback((href: string) => {
    onClose()
    router.push(href)
  }, [onClose, router])

  // Navegação por teclado
  useEffect(() => {
    if (!open) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(s => Math.min(s + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(s => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && results[selected]) {
        navegar(results[selected].href)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, results, selected, onClose, navegar])

  // Scroll do item selecionado para dentro da view
  useEffect(() => {
    const item = listRef.current?.children[selected] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  // Agrupa por tipo
  const grupos = (['caso', 'cliente', 'documento', 'membro'] as const)
    .map(tipo => ({ tipo, items: results.filter(r => r.tipo === tipo) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {loading
            ? <Loader2 size={16} className="text-muted-foreground shrink-0 animate-spin" />
            : <Search size={16} className="text-muted-foreground shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar casos, clientes, documentos…"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {query.trim().length > 0 && query.trim().length < 2 && (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
              Digite pelo menos 2 caracteres…
            </p>
          )}

          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
              Nenhum resultado para "<span className="text-foreground">{query}</span>"
            </p>
          )}

          {grupos.map(grupo => {
            const Icon = TIPO_ICON[grupo.tipo]
            return (
              <div key={grupo.tipo}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                  <Icon size={11} className={cn('shrink-0', TIPO_COLOR[grupo.tipo])} />
                  <span className="text-[10px] font-medium font-mono uppercase tracking-[0.08em] text-muted-foreground">
                    {TIPO_LABEL[grupo.tipo]}s
                  </span>
                </div>
                {grupo.items.map(item => {
                  const idx = results.indexOf(item)
                  const isSel = idx === selected
                  return (
                    <button
                      key={item.id}
                      onClick={() => navegar(item.href)}
                      onMouseEnter={() => setSelected(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSel ? 'bg-accent' : 'hover:bg-accent/50'
                      )}
                    >
                      <Icon size={14} className={cn('shrink-0', TIPO_COLOR[item.tipo])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{item.titulo}</p>
                        {item.subtitulo && (
                          <p className="text-[11px] text-muted-foreground truncate">{item.subtitulo}</p>
                        )}
                      </div>
                      {isSel && <ArrowRight size={13} className="text-muted-foreground shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )
          })}

          {/* Estado inicial */}
          {!query && (
            <div className="px-4 py-6 space-y-1">
              <p className="text-[12px] text-muted-foreground text-center mb-4">Busca rápida</p>
              {[
                { icon: Briefcase,   label: 'Casos',      color: TIPO_COLOR.caso,      href: '/casos' },
                { icon: Users,       label: 'Clientes',   color: TIPO_COLOR.cliente,   href: '/clientes' },
                { icon: FileText,    label: 'Documentos', color: TIPO_COLOR.documento, href: '/documentos' },
                { icon: UserCircle,  label: 'Equipe',     color: TIPO_COLOR.membro,    href: '/equipe' },
              ].map(item => (
                <button
                  key={item.href}
                  onClick={() => navegar(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-[6px] hover:bg-accent transition-colors text-left"
                >
                  <item.icon size={14} className={cn('shrink-0', item.color)} />
                  <span className="text-[13px] text-muted-foreground">Ir para {item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer com atalhos */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-muted/30">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="font-mono bg-muted border border-border rounded px-1 py-0.5">↑↓</kbd> navegar
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="font-mono bg-muted border border-border rounded px-1 py-0.5">↵</kbd> abrir
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="font-mono bg-muted border border-border rounded px-1 py-0.5">ESC</kbd> fechar
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
