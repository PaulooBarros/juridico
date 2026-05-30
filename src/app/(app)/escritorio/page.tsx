'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, Scale, Users, Briefcase, UserCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { authClient } from '@/lib/auth-client'
import { getMeuEscritorio, atualizarEscritorio, type Escritorio } from '@/lib/supabase/escritorio'
import { listarMembros, type Membro } from '@/lib/supabase/equipe'
import { formatRole, getInitials } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  owner:     'bg-primary/10 text-primary border-primary/20',
  admin:     'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  lawyer:    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  assistant: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
}

type Form = Pick<Escritorio, 'nome' | 'cnpj' | 'oab_sociedade' | 'especialidade' | 'cidade_uf' | 'slogan' | 'descricao'>

export default function EscritorioPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [escritorio, setEscritorio] = useState<Escritorio | null>(null)
  const [membros,    setMembros]    = useState<Membro[]>([])
  const [meuId,      setMeuId]      = useState<string | null>(null)
  const [casosCount, setCasosCount] = useState(0)
  const [clientesCount, setClientesCount] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [logoPreview,      setLogoPreview]      = useState<string | null>(null)
  const [uploadingLogo,    setUploadingLogo]    = useState(false)
  const [form,       setForm]       = useState<Form>({ nome: '', cnpj: '', oab_sociedade: '', especialidade: '', cidade_uf: '', slogan: '', descricao: '' })
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    async function carregar() {
      const supabaseClient = createClient()
      const session = await authClient.getSession()
      setMeuId(session.data?.user?.id ?? null)
      const [esc, ms] = await Promise.all([getMeuEscritorio(), listarMembros()])
      if (esc) {
        setEscritorio(esc)
        setLogoPreview(esc.logo_url ?? null)
        setForm({
          nome:          esc.nome          ?? '',
          cnpj:          esc.cnpj          ?? '',
          oab_sociedade: esc.oab_sociedade ?? '',
          especialidade: esc.especialidade ?? '',
          cidade_uf:     esc.cidade_uf     ?? '',
          slogan:        esc.slogan        ?? '',
          descricao:     esc.descricao     ?? '',
        })
        const supabase = supabaseClient
        const [{ count: cc }, { count: cl }] = await Promise.all([
          supabase.from('casos').select('*', { count: 'exact', head: true }).eq('escritorio_id', esc.id),
          supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('escritorio_id', esc.id),
        ])
        setCasosCount(cc ?? 0)
        setClientesCount(cl ?? 0)
      }
      setMembros(ms)
      setLoading(false)
    }
    carregar()
  }, [])

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) { toast.error('Máximo 2 MB'); return }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Apenas JPG, PNG ou WebP'); return
    }

    // Preview imediato
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload real
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload/logo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erro no upload'); return }
      setLogoPreview(data.url)
      setEscritorio(prev => prev ? { ...prev, logo_url: data.url } : prev)
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setUploadingLogo(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { toast.error('Nome é obrigatório.'); return }
    if (!escritorio) return
    setSaving(true)
    try {
      await atualizarEscritorio(escritorio.id, form)
      setEscritorio(prev => prev ? { ...prev, ...form } : prev)
      toast.success('Dados do escritório atualizados')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const set = (patch: Partial<Form>) => setForm(prev => ({ ...prev, ...patch }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  const logoSrc = logoPreview ?? escritorio?.logo_url ?? null
  const planLabel = PLAN_LABEL[escritorio?.plano ?? ''] ?? escritorio?.plano ?? 'Starter'
  const meuRole = membros.find(m => m.user_id === meuId)?.role ?? ''
  const podeEditar = ['owner', 'admin'].includes(meuRole)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl border-2 bg-muted flex items-center justify-center overflow-hidden">
                {logoSrc ? (
                  <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Scale size={26} className="text-muted-foreground" />
                )}
              </div>
              {podeEditar && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingLogo}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {uploadingLogo ? <Loader2 size={10} className="animate-spin" /> : <Camera size={11} />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleLogoChange} />
                </>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">{escritorio?.nome ?? '—'}</h2>
                  {escritorio?.slogan && <p className="text-sm text-muted-foreground italic mt-0.5">{escritorio.slogan}</p>}
                  {escritorio?.slug && <p className="text-xs text-muted-foreground mt-1">vetor.app/{escritorio.slug}</p>}
                </div>
                <Badge variant="secondary" className="shrink-0">{planLabel}</Badge>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Users,     label: 'Membros',  value: membros.length },
                  { icon: Briefcase, label: 'Casos',    value: casosCount },
                  { icon: UserCheck, label: 'Clientes', value: clientesCount },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Formulário / Somente leitura */}
        {podeEditar ? (
          <form onSubmit={handleSalvar}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Dados cadastrais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Nome do escritório *</Label>
                  <Input value={form.nome} onChange={e => set({ nome: e.target.value })} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Slogan</Label>
                  <Input value={form.slogan ?? ''} onChange={e => set({ slogan: e.target.value })} placeholder="Ex: Estratégia. Precisão. Resultado." className="h-9 text-[13px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-muted-foreground">CNPJ</Label>
                    <Input value={form.cnpj ?? ''} onChange={e => set({ cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="h-9 text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-muted-foreground">OAB Sociedade</Label>
                    <Input value={form.oab_sociedade ?? ''} onChange={e => set({ oab_sociedade: e.target.value })} placeholder="OAB/SP 0000" className="h-9 text-[13px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-muted-foreground">Especialidade</Label>
                    <Input value={form.especialidade ?? ''} onChange={e => set({ especialidade: e.target.value })} placeholder="Ex: Cível e Empresarial" className="h-9 text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-muted-foreground">Cidade / UF</Label>
                    <Input value={form.cidade_uf ?? ''} onChange={e => set({ cidade_uf: e.target.value })} placeholder="Aracaju / SP" className="h-9 text-[13px]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Descrição</Label>
                  <Textarea value={form.descricao ?? ''} onChange={e => set({ descricao: e.target.value })} rows={3} className="text-[13px] resize-none" placeholder="Sobre o escritório…" />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
              </CardContent>
            </Card>
          </form>
        ) : (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Dados cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Nome do escritório', value: escritorio?.nome },
                { label: 'Slogan',             value: escritorio?.slogan },
                { label: 'CNPJ',               value: escritorio?.cnpj },
                { label: 'OAB Sociedade',      value: escritorio?.oab_sociedade },
                { label: 'Especialidade',      value: escritorio?.especialidade },
                { label: 'Cidade / UF',        value: escritorio?.cidade_uf },
                { label: 'Descrição',          value: escritorio?.descricao },
              ].map(item => (
                <div key={item.label} className="space-y-0.5">
                  <p className="text-[12px] text-muted-foreground">{item.label}</p>
                  <p className="text-[13px]">{item.value || <span className="text-muted-foreground/50">—</span>}</p>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-2">Somente administradores podem editar os dados do escritório.</p>
            </CardContent>
          </Card>
        )}

        {/* Membros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Membros ({membros.length})</CardTitle>
              <Link href="/equipe" className="px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center">
                Gerenciar
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {membros.length === 0 ? (
              <p className="px-5 py-6 text-xs text-muted-foreground text-center">Nenhum membro encontrado.</p>
            ) : (
              <div className="divide-y">
                {membros.map(membro => (
                  <div key={membro.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-[11px] font-semibold">{getInitials(membro.nome)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{membro.nome}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{membro.email}</p>
                    </div>
                    <Badge className={`text-[10px] border ${ROLE_COLORS[membro.role]}`} variant="outline">
                      {formatRole(membro.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
