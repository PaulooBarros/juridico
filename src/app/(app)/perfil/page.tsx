'use client'
import { useState, useRef } from 'react'
import { Camera, User, Award, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { currentUser } from '@/lib/mock'
import { getInitials } from '@/lib/utils'

const ALL_SPECIALTIES = [
  'Direito Civil', 'Direito Empresarial', 'Direito Tributário', 'Direito do Trabalho',
  'Direito de Família', 'Direito Criminal', 'Direito do Consumidor', 'Direito Previdenciário',
  'Direito Imobiliário', 'Direito Ambiental', 'Propriedade Intelectual', 'Direito Digital',
]

export default function PerfilPage() {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [specialties, setSpecialties] = useState<string[]>(currentUser.specialties ?? [])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatar(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const toggleSpecialty = (s: string) => {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
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
                <AvatarFallback className="text-lg">{getInitials(currentUser.name)}</AvatarFallback>
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
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentUser.oab}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => fileRef.current?.click()}>
                Alterar foto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados profissionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User size={15} /> Dados profissionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input defaultValue={currentUser.name} />
            </div>
            <div className="space-y-1.5">
              <Label>Número OAB</Label>
              <Input defaultValue={currentUser.oab} placeholder="OAB/SP 000.000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>E-mail profissional</Label>
            <Input defaultValue={currentUser.email} type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>Bio profissional</Label>
            <Textarea
              defaultValue={currentUser.bio}
              placeholder="Descreva sua experiência e especialidades..."
              className="h-28"
            />
          </div>
          <Button size="sm">Salvar dados</Button>
        </CardContent>
      </Card>

      {/* Especialidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award size={15} /> Áreas de especialidade</CardTitle>
          <CardDescription>Selecione até 5 especialidades exibidas no seu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-all ${
                  specialties.includes(s)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{specialties.length} de 5 selecionadas</p>
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText size={15} /> Documentos do advogado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Carteira OAB (frente e verso)', 'Certificado de especialização', 'Diploma de graduação'].map((doc) => (
            <div key={doc} className="flex items-center justify-between py-2 border-b last:border-0">
              <p className="text-xs font-medium">{doc}</p>
              <Button variant="outline" size="sm" className="h-7 text-xs">Upload</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
