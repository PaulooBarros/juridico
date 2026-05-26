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
import { Loader2, CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { authClient, getSessionUserId } from '@/lib/auth-client'
import { getMeuEscritorio, type Escritorio } from '@/lib/supabase/escritorio'

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
}

export default function ConfiguracoesPage() {
  const [notifications, setNotifications] = useState({
    deadlines: true, emails: true, payments: true, system: false,
  })

  // Segurança
  const [senhaAtual,     setSenhaAtual]     = useState('')
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

  // Integrações
  const [googleConectado,   setGoogleConectado]   = useState(false)
  const [loadingGoogle,     setLoadingGoogle]     = useState(true)
  const [disconnecting,     setDisconnecting]     = useState(false)
  const [googleMensagem,    setGoogleMensagem]    = useState('')

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

  const [activeTab, setActiveTab] = useState('notificacoes')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab    = params.get('tab')
    const sucesso = params.get('sucesso')
    const erro    = params.get('erro')

    if (tab) setActiveTab(tab)

    if (sucesso === 'google-conectado') {
      setGoogleConectado(true)
      setLoadingGoogle(false)
      setGoogleMensagem('Google Calendar conectado com sucesso.')
      window.history.replaceState({}, '', '/configuracoes?tab=integracoes')
      return
    }

    if (erro) {
      setGoogleMensagem('Erro ao conectar com o Google. Tente novamente.')
      setLoadingGoogle(false)
      window.history.replaceState({}, '', '/configuracoes?tab=integracoes')
    }

    async function verificarGoogle() {
      const userId = await getSessionUserId()
      if (!userId) { setLoadingGoogle(false); return }
      const { data } = await createClient()
        .from('google_calendar_tokens')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      setGoogleConectado(!!data)
      setLoadingGoogle(false)
    }
    verificarGoogle()
  }, [])

  async function handleDesconectarGoogle() {
    setDisconnecting(true)
    setGoogleMensagem('')
    try {
      await fetch('/api/google/disconnect', { method: 'POST' })
      setGoogleConectado(false)
      setGoogleMensagem('Google Calendar desconectado.')
    } catch {
      setGoogleMensagem('Erro ao desconectar. Tente novamente.')
    } finally {
      setDisconnecting(false)
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setErroPass(''); setSucessoPass(false)
    if (!novaSenha) { setErroPass('Informe a nova senha.'); return }
    if (novaSenha.length < 8) { setErroPass('A senha deve ter pelo menos 8 caracteres.'); return }
    if (novaSenha !== confirmSenha) { setErroPass('As senhas não coincidem.'); return }
    setSavingPass(true)
    try {
      const { error } = await authClient.changePassword({ newPassword: novaSenha, currentPassword: senhaAtual })
      if (error) throw error
      setSenhaAtual(''); setNovaSenha(''); setConfirmSenha('')
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="plano">Plano</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
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
                  <Label className="text-[12px] text-muted-foreground">Senha atual</Label>
                  <Input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
                    placeholder="••••••••" className="h-9 text-[13px]" />
                </div>
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

        {/* Integrações */}
        <TabsContent value="integracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>
                Sincronize prazos automaticamente com seu Google Calendar. Cada prazo cadastrado gera um evento com lembrete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGoogle ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[13px]">Verificando conexão…</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <CalendarDays size={18} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Google Calendar</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {googleConectado ? (
                            <>
                              <CheckCircle2 size={11} className="text-emerald-500" />
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Conectado</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={11} className="text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">Não conectado</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {googleConectado ? (
                      <button
                        onClick={handleDesconectarGoogle}
                        disabled={disconnecting}
                        className="px-3 h-8 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors disabled:opacity-60"
                      >
                        {disconnecting ? 'Desconectando…' : 'Desconectar'}
                      </button>
                    ) : (
                      <a
                        href="/api/google/auth"
                        className="px-3 h-8 bg-primary text-primary-foreground rounded-[5px] text-xs font-medium hover:bg-primary/90 transition-colors flex items-center"
                      >
                        Conectar
                      </a>
                    )}
                  </div>

                  {googleMensagem && (
                    <p className={`text-[12px] ${googleMensagem.includes('sucesso') || googleMensagem.includes('desconectado') ? 'text-emerald-600' : 'text-destructive'}`}>
                      {googleMensagem}
                    </p>
                  )}

                  {googleConectado && (
                    <div className="rounded-lg bg-muted/40 border p-3 space-y-1.5">
                      <p className="text-[12px] font-medium">Como funciona</p>
                      <ul className="text-[11px] text-muted-foreground space-y-1">
                        <li>• Cada prazo cadastrado em um caso cria um evento no seu Calendar.</li>
                        <li>• Lembretes automáticos: 24h antes por e-mail e 1h antes por notificação.</li>
                        <li>• Ao editar ou excluir um prazo, o evento é atualizado automaticamente.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
