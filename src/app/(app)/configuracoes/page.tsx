'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { currentOffice, currentUser } from '@/lib/mock'

export default function ConfiguracoesPage() {
  const [notifications, setNotifications] = useState({
    deadlines: true, emails: true, payments: true, system: false,
  })

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Tabs defaultValue="escritorio">
        <TabsList>
          <TabsTrigger value="escritorio">Escritório</TabsTrigger>
          <TabsTrigger value="usuario">Usuário</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="plano">Plano</TabsTrigger>
        </TabsList>

        {/* Escritório */}
        <TabsContent value="escritorio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do escritório</CardTitle>
              <CardDescription>Informações gerais exibidas nos documentos e perfil público.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome do escritório</Label>
                <Input defaultValue={currentOffice.name} />
              </div>
              <div className="space-y-1.5">
                <Label>Slogan</Label>
                <Input defaultValue={currentOffice.slogan} />
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input defaultValue={currentOffice.cnpj} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input defaultValue={currentOffice.phone} />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input defaultValue={currentOffice.email} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input defaultValue={currentOffice.address} />
              </div>
              <Button size="sm">Salvar alterações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações do escritório</CardTitle>
              <CardDescription>Configure quais alertas são enviados para todos os membros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'deadlines', label: 'Alertas de prazos', desc: 'Notificar 7, 3 e 1 dia antes do vencimento' },
                { key: 'emails', label: 'Resumo semanal por e-mail', desc: 'E-mail toda segunda com casos e prazos da semana' },
                { key: 'payments', label: 'Alertas financeiros', desc: 'Notificar honorários vencidos e pagamentos recebidos' },
                { key: 'system', label: 'Avisos do sistema', desc: 'Backup, manutenções programadas e atualizações' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuário */}
        <TabsContent value="usuario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input defaultValue={currentUser.name} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input defaultValue={currentUser.email} type="email" />
              </div>
              <div className="space-y-1.5">
                <Label>OAB</Label>
                <Input defaultValue={currentUser.oab} />
              </div>
              <Button size="sm">Salvar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Modo compacto</p>
                  <p className="text-xs text-muted-foreground">Reduz espaçamentos para maior densidade</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Confirmar antes de excluir</p>
                  <p className="text-xs text-muted-foreground">Exibe confirmação em ações destrutivas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar senha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Senha atual</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label>Nova senha</Label>
                <Input type="password" placeholder="Mínimo 8 caracteres" />
              </div>
              <div className="space-y-1.5">
                <Label>Confirmar nova senha</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button size="sm">Alterar senha</Button>
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
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de perigo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Excluir minha conta</p>
                  <p className="text-xs text-muted-foreground">Remove permanentemente sua conta e dados pessoais.</p>
                </div>
                <Button variant="destructive" size="sm">Excluir conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plano */}
        <TabsContent value="plano" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plano atual</CardTitle>
                  <CardDescription>Gerencie sua assinatura e faturamento.</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">Pro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Advogados', value: '5 / 8', used: 5, total: 8 },
                  { label: 'Casos ativos', value: '15 / ∞', used: 15, total: 100 },
                  { label: 'Armazenamento', value: '12 GB / 50 GB', used: 12, total: 50 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-medium">{item.value}</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((item.used / item.total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Próximo vencimento</p>
                  <p className="text-xs text-muted-foreground">Renovação automática em 01/06/2024 · R$ 189,00/mês</p>
                </div>
                <Button variant="outline" size="sm">Gerenciar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
