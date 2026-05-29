'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Wand2, Save, Loader2, Globe, CopyPlus,
  Check, Hash,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModeloEditor } from '@/components/editor/modelo-editor'
import { formatArea, cn } from '@/lib/utils'
import {
  getModelo, atualizarModelo, duplicarModelo,
  extrairVariaveis, docToPlainText,
  type Modelo, type ModeloCategoria,
} from '@/lib/supabase/modelos'

const CATEGORIES: Array<{ value: ModeloCategoria; label: string }> = [
  { value: 'peticoes',         label: 'Petições' },
  { value: 'contratos',        label: 'Contratos' },
  { value: 'procuracoes',      label: 'Procurações' },
  { value: 'correspondencias', label: 'Correspondências' },
  { value: 'outros',           label: 'Outros' },
]

const AREAS = [
  { value: '',               label: '— Sem área —' },
  { value: 'civil',          label: 'Cível' },
  { value: 'trabalhista',    label: 'Trabalhista' },
  { value: 'tributario',     label: 'Tributário' },
  { value: 'empresarial',    label: 'Empresarial' },
  { value: 'familia',        label: 'Família' },
  { value: 'criminal',       label: 'Criminal' },
  { value: 'consumidor',     label: 'Consumidor' },
  { value: 'previdenciario', label: 'Previdenciário' },
]

export default function ModeloEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [modelo, setModelo]       = useState<Modelo | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [erro, setErro]             = useState('')
  const [duplicando, setDuplicando] = useState(false)

  // Form state
  const [nome,      setNome]      = useState('')
  const [categoria, setCategoria] = useState<ModeloCategoria>('peticoes')
  const [area,      setArea]      = useState('')
  const [descricao, setDescricao] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [conteudo,  setConteudo]  = useState<any>({})

  useEffect(() => {
    getModelo(params.id).then(m => {
      if (!m) { router.replace('/modelos'); return }
      setModelo(m)
      setNome(m.nome)
      setCategoria(m.categoria)
      setArea(m.area ?? '')
      setDescricao(m.descricao ?? '')
      setTagsInput((m.tags ?? []).join(', '))
      setConteudo(m.conteudo)
    }).catch(() => router.replace('/modelos'))
      .finally(() => setLoading(false))
  }, [params.id])

  const isGlobal = modelo?.escritorio_id === null
  const variaveis = extrairVariaveis(conteudo)

  async function salvar() {
    if (!nome.trim()) { setErro('Nome é obrigatório.'); return }
    setErro(''); setSaving(true)
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      await atualizarModelo(params.id, { nome, categoria, area: area || undefined, descricao: descricao || undefined, conteudo, tags })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDuplicar() {
    if (!modelo) return
    setDuplicando(true)
    try {
      const copia = await duplicarModelo({ ...modelo, nome, categoria, area: area || null, descricao: descricao || null, conteudo, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) })
      router.push(`/modelos/${copia.id}`)
    } finally {
      setDuplicando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!modelo) return null

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/modelos"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={13} /> Modelos
        </Link>

        <div className="flex-1 min-w-48">
          {isGlobal ? (
            <h1 className="text-sm font-semibold">{nome}</h1>
          ) : (
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="h-8 text-sm font-semibold border-transparent hover:border-input focus:border-input bg-transparent px-2"
              placeholder="Nome do modelo"
            />
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isGlobal ? (
            <button
              onClick={handleDuplicar}
              disabled={duplicando}
              className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-60"
            >
              {duplicando ? <Loader2 size={12} className="animate-spin" /> : <CopyPlus size={12} />}
              Duplicar para editar
            </button>
          ) : (
            <button
              onClick={salvar}
              disabled={saving}
              className={cn(
                'flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors disabled:opacity-60',
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {saving
                ? <Loader2 size={12} className="animate-spin" />
                : saved
                  ? <><Check size={12} /> Salvo</>
                  : <><Save size={12} /> Salvar</>
              }
            </button>
          )}
          <Link
            href={`/modelos/${params.id}/usar`}
            className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Wand2 size={12} /> Usar modelo
          </Link>
        </div>
      </div>

      {/* Banner template global */}
      {isGlobal && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border rounded-md text-xs text-muted-foreground">
          <Globe size={13} />
          Template global da Leea — somente leitura. Clique em "Duplicar para editar" para criar uma cópia customizável.
        </div>
      )}

      {erro && (
        <p className="text-xs text-destructive">{erro}</p>
      )}

      {/* Corpo: sidebar + editor */}
      <div className="flex gap-5 items-start flex-col lg:flex-row">

        {/* Sidebar de metadados */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">

          <F label="Categoria">
            <Select
              value={categoria}
              onValueChange={v => setCategoria(v as ModeloCategoria)}
              disabled={isGlobal}
            >
              <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Área">
            <Select
              value={area || '_none_'}
              onValueChange={v => setArea(v === '_none_' ? '' : v)}
              disabled={isGlobal}
            >
              <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="— Sem área —" /></SelectTrigger>
              <SelectContent>
                {AREAS.map(a => (
                  <SelectItem key={a.value || '_none_'} value={a.value || '_none_'}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Descrição">
            <Textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              disabled={isGlobal}
              className="text-[13px] resize-none"
              placeholder="Breve descrição do modelo…"
            />
          </F>

          <F label="Tags (separadas por vírgula)">
            <Input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              disabled={isGlobal}
              className="h-8 text-[13px]"
              placeholder="ex: honorários, urgente"
            />
          </F>

          {/* Variáveis detectadas */}
          {variaveis.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Variáveis detectadas
              </p>
              <div className="flex flex-col gap-1">
                {variaveis.map(v => (
                  <div key={v} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Hash size={10} className="shrink-0" />
                    <code className="font-mono text-[11px] text-foreground/70">{v}</code>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Ao usar o modelo, cada variável vira um campo a preencher.
              </p>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          {isGlobal ? (
            <div className="border rounded-md p-5 bg-muted/20 min-h-[400px]">
              <ModeloEditorReadOnly conteudo={conteudo} />
            </div>
          ) : (
            <ModeloEditor content={conteudo} onChange={setConteudo} />
          )}
        </div>
      </div>

    </div>
  )
}

// ── Visualização read-only do conteúdo ────────────────────────────────────────

function ModeloEditorReadOnly({ conteudo }: { conteudo: any }) {
  const texto = docToPlainText(conteudo)
  return (
    <pre className="text-[13px] text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
      {texto || <span className="text-muted-foreground italic">Sem conteúdo.</span>}
    </pre>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
