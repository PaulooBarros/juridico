'use client'
import { useEffect, useRef, useState } from 'react'
import { Camera, User, Award, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

const ALL_SPECIALTIES = [
  'Direito Civil', 'Direito Empresarial', 'Direito Tributário', 'Direito do Trabalho',
  'Direito de Família', 'Direito Criminal', 'Direito do Consumidor', 'Direito Previdenciário',
  'Direito Imobiliário', 'Direito Ambiental', 'Propriedade Intelectual', 'Direito Digital',
]

type Form = {
  nome_profissional: string
  oab: string
  bio: string
  areas_atuacao: string[]
}

export default function PerfilPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [email,    setEmail]    = useState('')
  const [avatar,   setAvatar]   = useState<string | null>(null)
  const [form,     setForm]     = useState<Form>({ nome_profissional: '', oab: '', bio: '', areas_atuacao: [] })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [sucesso,  setSucesso]  = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {}
      setEmail(data.user?.email ?? '')
      setForm({
        nome_profissional: meta.nome_profissional ?? meta.full_name ?? '',
        oab:               meta.oab               ?? '',
        bio:               meta.bio               ?? '',
        areas_atuacao:     meta.areas_atuacao      ?? [],
      })
      setLoading(false)
    })
  }, [])

  function toggleArea(area: string) {
    setForm(prev => ({
      ...prev,
      areas_atuacao: prev.areas_atuacao.includes(area)
        ? prev.areas_atuacao.filter(a => a !== area)
        : [...prev.areas_atuacao, area],
    }))
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatar(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome_profissional.trim()) { setErro('Nome é obrigatório.'); return }
    setErro(''); setSaving(true)
    try {
      const { error } = await createClient().auth.updateUser({
        data: {
          nome_profissional: form.nome_profissional,
          oab:               form.oab,
          bio:               form.bio,
          areas_atuacao:     form.areas_atuacao,
        },
      })
      if (error) throw error
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>Aparece nos documentos e comunicações com clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {avatar && <AvatarImage src={avatar} />}
                <AvatarFallback className="text-lg">{getInitials(form.nome_profissional || email)}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-semibold">{form.nome_profissional || '—'}</p>
              {form.oab && <p className="text-xs text-muted-foreground mt-0.5">{form.oab}</p>}
              <p className="text-xs text-muted-foreground">{email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors"
              >
                Alterar foto
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados profissionais */}
      <form onSubmit={handleSalvar}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User size={15} /> Dados profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Nome profissional *</Label>
                <Input
                  value={form.nome_profissional}
                  onChange={e => setForm(p => ({ ...p, nome_profissional: e.target.value }))}
                  placeholder="Dr. João da Silva"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Número OAB</Label>
                <Input
                  value={form.oab}
                  onChange={e => setForm(p => ({ ...p, oab: e.target.value }))}
                  placeholder="OAB/SP 000.000"
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">E-mail</Label>
              <Input value={email} disabled className="h-9 text-[13px] opacity-60" />
              <p className="text-[11px] text-muted-foreground">Para alterar o e-mail, acesse Configurações → Segurança.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Bio profissional</Label>
              <Textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Descreva sua experiência e especialidades…"
                className="text-[13px] resize-none h-24"
              />
            </div>

            {erro    && <p className="text-[12px] text-destructive">{erro}</p>}
            {sucesso && <p className="text-[12px] text-emerald-600">Perfil atualizado com sucesso.</p>}

            <button
              type="submit"
              disabled={saving}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvando…' : 'Salvar dados'}
            </button>
          </CardContent>
        </Card>
      </form>

      {/* Áreas de especialidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award size={15} /> Áreas de especialidade</CardTitle>
          <CardDescription>Selecione até 5 especialidades exibidas no seu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {ALL_SPECIALTIES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleArea(s)}
                disabled={!form.areas_atuacao.includes(s) && form.areas_atuacao.length >= 5}
                className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  form.areas_atuacao.includes(s)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{form.areas_atuacao.length} de 5 selecionadas</p>
            {form.areas_atuacao.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  setSaving(true)
                  await createClient().auth.updateUser({ data: { areas_atuacao: form.areas_atuacao } })
                  setSaving(false)
                  setSucesso(true)
                  setTimeout(() => setSucesso(false), 2000)
                }}
                disabled={saving}
                className="px-3 h-7 bg-primary text-primary-foreground rounded-[5px] text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Salvar áreas'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
