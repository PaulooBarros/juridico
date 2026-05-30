'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { getMeuEscritorioId } from '@/lib/supabase/escritorio'
import { LeeaLogo } from '@/components/ui/leea-logo'
import { toast } from 'sonner'

const AREAS = [
  'Cível', 'Trabalhista', 'Criminal', 'Tributário', 'Família e Sucessões',
  'Empresarial', 'Ambiental', 'Administrativo', 'Previdenciário', 'Imobiliário',
]

export default function CompletarPerfilPage() {
  const router  = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const [saving, setSaving] = useState(false)
  const [oab,    setOab]    = useState('')
  const [areas,  setAreas]  = useState<string[]>([])
  const [erro,   setErro]   = useState('')

  const user = session?.user as any

  useEffect(() => {
    if (isPending) return

    if (!session) {
      router.replace('/login')
      return
    }

    // Perfil já completo — redireciona
    if (user?.oab) {
      getMeuEscritorioId().then(id => {
        router.replace(id ? '/dashboard' : '/gateway')
      })
    }
  }, [isPending, session, user?.oab, router])

  function toggleArea(area: string) {
    setAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!oab.trim()) { setErro('Informe seu número OAB.'); return }
    setErro('')
    setSaving(true)

    const { error } = await authClient.updateUser({
      oab:           oab.trim(),
      areas_atuacao: JSON.stringify(areas),
    } as any)

    if (error) {
      toast.error('Não foi possível salvar. Tente novamente.')
      setSaving(false)
      return
    }

    const escritorioId = await getMeuEscritorioId()
    router.push(escritorioId ? '/dashboard' : '/gateway')
    router.refresh()
  }

  // Carregando sessão ou redirecionando
  if (isPending || !session || user?.oab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand */}
      <div className="hidden lg:flex flex-col justify-between bg-muted border-r border-border px-12 py-12">
        <Link href="/landing" className="flex items-center gap-2.5">
          <img src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png" alt="" className="w-7 h-7" />
          <LeeaLogo variant="light" height={20} />
        </Link>

        <div>
          <p className="font-serif text-[36px] leading-[1.15] tracking-[-0.02em] max-w-[20ch]">
            Quase lá. Só precisamos de{' '}
            <em className="text-primary">mais alguns dados.</em>
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mt-6">
            Informações profissionais
          </p>
        </div>

        <p className="font-mono text-[11px] text-muted-foreground">v2026.05 · Aracaju, Brasil</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand */}
          <Link href="/landing" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png" alt="" className="w-6 h-6" />
            <LeeaLogo variant="light" height={20} />
          </Link>

          <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Complete seu perfil</h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            O Google não nos fornece esses dados. Leva menos de 1 minuto.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Número OAB</Label>
              <Input
                type="text"
                placeholder="Ex: SP 123456"
                value={oab}
                onChange={e => setOab(e.target.value)}
                required
                autoFocus
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
              <p className="text-[11px] text-muted-foreground">Estado + número de inscrição (ex: SP 123456).</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] font-medium text-muted-foreground">
                Áreas de atuação <span className="font-normal text-muted-foreground/60">(opcional)</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={[
                      'px-2.5 py-1 rounded-[4px] text-[11px] font-medium border transition-colors',
                      areas.includes(area)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    ].join(' ')}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {erro && <p className="text-[12px] text-destructive">{erro}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando…' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
