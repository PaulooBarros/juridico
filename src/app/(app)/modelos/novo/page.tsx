'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModeloEditor } from '@/components/editor/modelo-editor'
import { criarModelo, type ModeloCategoria } from '@/lib/supabase/modelos'

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

export default function NovoModeloPage() {
  const router = useRouter()
  const [saving,    setSaving]    = useState(false)
  const [nome,      setNome]      = useState('')
  const [categoria, setCategoria] = useState<ModeloCategoria>('peticoes')
  const [area,      setArea]      = useState('')
  const [descricao, setDescricao] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [conteudo,  setConteudo]  = useState<any>({})

  async function salvar() {
    if (!nome.trim()) { toast.error('Nome é obrigatório.'); return }
    setSaving(true)
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      const novo = await criarModelo({
        nome,
        categoria,
        area:      area || undefined,
        descricao: descricao || undefined,
        conteudo,
        tags,
      })
      toast.success('Modelo salvo')
      router.push(`/modelos/${novo.id}`)
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao criar modelo.')
      setSaving(false)
    }
  }

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
          <Input
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="h-8 text-sm font-semibold border-transparent hover:border-input focus:border-input bg-transparent px-2"
            placeholder="Nome do modelo…"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/modelos"
            className="px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center"
          >
            Cancelar
          </Link>
          <button
            onClick={salvar}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving
              ? <><Loader2 size={12} className="animate-spin" /> Criando…</>
              : <><Save size={12} /> Criar modelo</>
            }
          </button>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex gap-5 items-start flex-col lg:flex-row">

        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          <F label="Categoria">
            <Select value={categoria} onValueChange={v => setCategoria(v as ModeloCategoria)}>
              <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Área">
            <Select value={area || '_none_'} onValueChange={v => setArea(v === '_none_' ? '' : v)}>
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
              className="text-[13px] resize-none"
              placeholder="Breve descrição do modelo…"
            />
          </F>

          <F label="Tags (separadas por vírgula)">
            <Input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="h-8 text-[13px]"
              placeholder="ex: honorários, urgente"
            />
          </F>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Use <code className="font-mono bg-muted px-1 py-0.5 rounded">{'{{variavel}}'}</code> no conteúdo para criar campos dinâmicos ao usar o modelo.
          </p>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          <ModeloEditor content={conteudo} onChange={setConteudo} />
        </div>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
