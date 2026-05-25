'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getMeuEscritorio, type Escritorio } from '@/lib/supabase/escritorio'

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
}

export default function ConfiguracoesPage() {
  const [notifications, setNotifications] = useState({
    deadlines: true, emails: true, payments: true, system: false,
  })

  // Segurança
  const [novaSenha,      setNovaSenha]      = useState('')
  const [confirmSenha,   setConfirmSenha]   = useState('')
  const [savingPass,     setSavingPass]     = useState(false)
  const [erroPass,       setErroPass]       = useState('')
  const [sucessoPass,    setSucessoPass]    = useState(false)

  // Plano
  const [escritorio,     setEscritorio]     = useState<Escritorio | null>(null)
  const [loadingPlano,   setLoadingPlano]   = useState(true)
  const [membrosCount,   setMembrosCount]   = useState(0)
  const [casosCount,     setCasosCount]     = useState(0)

  useEffect(() => {
    async function carregarPlano() {
      const esc = await getMeuEscritorio()
      setEscritorio(esc)
      if (esc) {
        const supabase = createClient()
        const [{ count: mc }, { count: cc }] = await Promise.all([
          supabase.from('membros').select('*', { count: 'exact', head: true }).eq('escritorio_id', esc.id),
          supabase.from('casos').select('*', { count: 'exact', head: true }).eq('escritorio_id', esc.id),
        ])
        setMembrosCount(mc ?? 0)
        setCasosCount(cc ?? 0)
      }
      setLoadingPlano(false)
    }
    carregarPlano()
  }, [])

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setErroPass(''); setSucessoPass(false)
    if (!novaSenha) { setErroPass('Informe a nova senha.'); return }
    if (novaSenha.length < 8) { setErroPass('A senha deve ter pelo menos 8 caracteres.'); return }
    if (novaSenha !== confirmSenha) { setErroPass('As senhas não coincidem.'); return }
    setSavingPass(true)
    try {
      const { error } = await createClient().auth.updateUser({ password: novaSenha })
      if (error) throw error
      setNovaSenha(''); setConfirmSenha('')
      setSucessoPass(true)
      setTimeout(() => setSucessoPass(false), 3000)
    } catch (e: any) {
      setErroPass(e.message ?? 'Erro ao alterar senha.')
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Tabs defaultValue="notificacoes">
        <TabsList>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="plano">Plano</TabsTrigger>
        </TabsList>

        {/* Notificações */}
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas e notificações</CardTitle>
              <CardDescription>Configure quais eventos geram notificações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: 'deadlines', label: 'Alertas de prazos',         desc: 'Notificar 7, 3 e 1 dia antes do vencimento' },
                { key: 'emails',    label: 'Resumo semanal por e-mail', desc: 'E-mail toda segunda com casos e prazos da semana' },
                { key: 'payments',  label: 'Alertas financeiros',       desc: 'Honorários vencidos e pagamentos recebidos' },
                { key: 'system',    label: 'Avisos do sistema',         desc: 'Manutenções programadas e atualizações' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={v => setNotifications(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil e escritório</CardTitle>
              <CardDescription>Edite suas informações pessoais e do escritório.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Perfil profissional</p>
                  <p className="text-xs text-muted-foreground">Nome, OAB, bio e especialidades</p>
                </div>
                <Link href="/perfil" className="px-3 h-8 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center">
                  Editar perfil →
                </Link>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Perfil do escritório</p>
                  <p className="text-xs text-muted-foreground">Nome, CNPJ, slogan e dados cadastrais</p>
                </div>
                <Link href="/escritorio" className="px-3 h-8 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center">
                  Editar escritório →
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar senha</CardTitle>
              <CardDescription>Escolha uma senha segura com pelo menos 8 caracteres.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Nova senha</Label>
                  <Input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 8 caracteres" className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Confirmar nova senha</Label>
                  <Input type="password" value={confirmSenha} onChange={e => setConfirmSenha(e.target.value)}
                    placeholder="••••••••" className="h-9 text-[13px]" />
                </div>

                {erroPass    && <p className="text-[12px] text-destructive">{erroPass}</p>}
                {sucessoPass && <p className="text-[12px] text-emerald-600">Senha alterada com sucesso.</p>}

                <button type="submit" disabled={savingPass}
                  className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {savingPass ? 'Salvando…' : 'Alterar senha'}
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticação em dois fatores</CardTitle>
              <CardDescription>Adicione uma camada extra de segurança à sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">2FA via app autenticador</p>
                  <p className="text-xs text-muted-foreground">Google Authenticator, Authy, etc.</p>
                </div>
                <button className="px-3 h-8 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors">
                  Em breve
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Excluir minha conta</p>
                  <p className="text-xs text-muted-foreground">Remove permanentemente sua conta e dados pessoais.</p>
                </div>
                <button className="px-3 h-8 bg-destructive text-destructive-foreground rounded-[5px] text-xs font-medium hover:bg-destructive/90 transition-colors">
                  Excluir conta
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plano */}
        <TabsContent value="plano" className="space-y-4">
          {loadingPlano ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Plano atual</CardTitle>
                    <CardDescription>Gerencie sua assinatura.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {PLAN_LABEL[escritorio?.plano ?? ''] ?? escritorio?.plano ?? 'Starter'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Membros',        value: membrosCount,  total: 8,    fmt: (v: number) => `${v} / 8` },
                    { label: 'Casos ativos',   value: casosCount,    total: 9999, fmt: (v: number) => `${v}` },
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-xs font-medium">{item.fmt(item.value)}</p>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min((item.value / item.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Precisando de mais recursos?</p>
                    <p className="text-xs text-muted-foreground">Veja os planos disponíveis e faça upgrade.</p>
                  </div>
                  <Link href="/planos" className="px-3 h-8 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center">
                    Ver planos →
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
