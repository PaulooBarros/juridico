'use client'
import { useState, useRef } from 'react'
import { Camera, Building2, Users, Briefcase, FileText, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { currentOffice, equipe, casos, clientes, documentos } from '@/lib/mock'
import { formatRole, getInitials, formatDate } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  lawyer: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  assistant: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

export default function EscritorioPage() {
  const [logo, setLogo] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl border-2 bg-muted flex items-center justify-center overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Scale size={28} className="text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background"
              >
                <Camera size={11} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">{currentOffice.name}</h2>
                  <p className="text-sm text-muted-foreground italic mt-0.5">{currentOffice.slogan}</p>
                  <p className="text-xs text-muted-foreground mt-1">vetor.app/{currentOffice.slug}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">Plano Pro</Badge>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Users, label: 'Membros', value: equipe.length },
                  { icon: Briefcase, label: 'Casos', value: casos.filter(c => c.status === 'active').length + ' ativos' },
                  { icon: Users, label: 'Clientes', value: clientes.filter(c => c.status === 'active').length },
                  { icon: FileText, label: 'Documentos', value: documentos.length },
                ].map((stat) => (
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
        {/* Dados do escritório */}
        <Card>
          <CardHeader>
            <CardTitle>Dados cadastrais</CardTitle>
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
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input defaultValue={currentOffice.phone} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input defaultValue={currentOffice.email} type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input defaultValue={currentOffice.address} />
            </div>
            <Button size="sm">Salvar</Button>
          </CardContent>
        </Card>

        {/* Membros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Membros ({equipe.length})</CardTitle>
              <Button variant="outline" size="sm">Convidar</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {equipe.map((membro) => (
                <div key={membro.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(membro.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{membro.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{membro.email}</p>
                  </div>
                  <Badge className={`text-[10px] border ${ROLE_COLORS[membro.role]}`} variant="outline">
                    {formatRole(membro.role)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
