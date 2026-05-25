'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { atualizarCliente, deletarCliente, type Cliente, type ClienteInput, type ClienteStatus } from '@/lib/supabase/clientes'

const ESTADOS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export function ClienteActions({ cliente }: { cliente: Cliente }) {
  const router = useRouter()
  const [editando, setEditando]       = useState(false)
  const [excluindo, setExcluindo]     = useState(false)

  async function handleExcluir() {
    await deletarCliente(cliente.id)
    router.push('/clientes')
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditando(true)}
          className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={() => setExcluindo(true)}
          className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 size={12} /> Excluir
        </button>
      </div>

      {editando && (
        <ClienteFormModal
          cliente={cliente}
          onClose={() => setEditando(false)}
          onSalvo={() => { setEditando(false); router.refresh() }}
        />
      )}

      {excluindo && (
        <ConfirmarExclusao
          nome={cliente.name}
          onCancelar={() => setExcluindo(false)}
          onConfirmar={handleExcluir}
        />
      )}
    </>
  )
}

function ClienteFormModal({
  cliente, onClose, onSalvo,
}: {
  cliente: Cliente
  onClose: () => void
  onSalvo: () => void
}) {
  const [form, setForm] = useState<ClienteInput>({
    type:     cliente.type,
    name:     cliente.name,
    document: cliente.document ?? '',
    email:    cliente.email    ?? '',
    phone:    cliente.phone    ?? '',
    address:  cliente.address  ?? '',
    city:     cliente.city     ?? '',
    state:    cliente.state    ?? '',
    status:   cliente.status,
    notes:    cliente.notes    ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')

  const set = (patch: Partial<ClienteInput>) => setForm(prev => ({ ...prev, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setErro('Nome é obrigatório.'); return }
    setErro(''); setLoading(true)
    try {
      await atualizarCliente(cliente.id, form)
      onSalvo()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-[18px] font-medium">Editar cliente</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            {(['pf', 'pj'] as const).map(t => (
              <button key={t} type="button" onClick={() => set({ type: t })}
                className={cn('h-9 rounded-[5px] border text-[13px] font-medium transition-colors',
                  form.type === t ? 'border-foreground bg-card text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground')}>
                {t === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </button>
            ))}
          </div>

          <F label="Nome *">
            <Input value={form.name} onChange={e => set({ name: e.target.value })}
              placeholder={form.type === 'pf' ? 'Nome completo' : 'Razão social'}
              className="h-9 text-[13px]" />
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label={form.type === 'pf' ? 'CPF' : 'CNPJ'}>
              <Input value={form.document ?? ''} onChange={e => set({ document: e.target.value })}
                placeholder={form.type === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                className="h-9 text-[13px]" />
            </F>
            <F label="Status">
              <select value={form.status} onChange={e => set({ status: e.target.value as ClienteStatus })}
                className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary">
                <option value="active">Ativo</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inativo</option>
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="E-mail">
              <Input type="email" value={form.email ?? ''} onChange={e => set({ email: e.target.value })}
                placeholder="contato@exemplo.com" className="h-9 text-[13px]" />
            </F>
            <F label="Telefone">
              <Input value={form.phone ?? ''} onChange={e => set({ phone: e.target.value })}
                placeholder="(11) 99999-9999" className="h-9 text-[13px]" />
            </F>
          </div>

          <F label="Endereço">
            <Input value={form.address ?? ''} onChange={e => set({ address: e.target.value })}
              placeholder="Rua, número, complemento" className="h-9 text-[13px]" />
          </F>

          <div className="grid grid-cols-[1fr_80px] gap-3">
            <F label="Cidade">
              <Input value={form.city ?? ''} onChange={e => set({ city: e.target.value })}
                placeholder="São Paulo" className="h-9 text-[13px]" />
            </F>
            <F label="UF">
              <select value={form.state ?? ''} onChange={e => set({ state: e.target.value })}
                className="h-9 px-2 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary w-full">
                <option value="">—</option>
                {ESTADOS.map(uf => <option key={uf}>{uf}</option>)}
              </select>
            </F>
          </div>

          <F label="Observações">
            <Textarea value={form.notes ?? ''} onChange={e => set({ notes: e.target.value })}
              rows={2} className="text-[13px] resize-none" placeholder="Informações adicionais…" />
          </F>

          {erro && <p className="text-[12px] text-destructive">{erro}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmarExclusao({ nome, onCancelar, onConfirmar }: { nome: string; onCancelar: () => void; onConfirmar: () => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-[380px] p-6 shadow-xl">
        <h2 className="font-serif text-[18px] font-medium mb-2">Excluir cliente</h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Tem certeza que deseja excluir <strong className="text-foreground">{nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancelar}
            className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button onClick={async () => { setLoading(true); await onConfirmar() }} disabled={loading}
            className="px-4 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
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
