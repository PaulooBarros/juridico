'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Building2, User, Plus, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ClientStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { formatDocument, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  listarClientes, criarCliente, atualizarCliente, deletarCliente,
  type Cliente, type ClienteInput, type ClienteStatus,
} from '@/lib/supabase/clientes'

type FilterStatus = 'all' | ClienteStatus

export default function ClientesPage() {
  const [clientes, setClientes]       = useState<Cliente[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [status, setStatus]           = useState<FilterStatus>('all')
  const [editando, setEditando]       = useState<Cliente | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [excluindo, setExcluindo]     = useState<Cliente | null>(null)

  async function carregar() {
    setLoading(true)
    try { setClientes(await listarClientes()) }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  async function handleExcluir(cliente: Cliente) {
    await deletarCliente(cliente.id)
    setExcluindo(null)
    carregar()
  }

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || c.name.toLowerCase().includes(q)
      || c.document?.includes(search)
      || c.email?.toLowerCase().includes(q)
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF/CNPJ ou e-mail…" className="pl-9 h-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 border rounded-md p-1">
          {(['all', 'active', 'inactive', 'prospect'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${status === s ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'inactive' ? 'Inativos' : 'Prospects'}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditando(null); setModalAberto(true) }}
          className="flex items-center justify-center gap-1.5 px-3 h-9 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors shrink-0 w-full sm:w-auto">
          <Plus size={14} /> Novo cliente
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card overflow-x-auto">
        <div className="min-w-[680px]">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_80px_100px_72px] gap-0 border-b bg-muted/30">
          {['Cliente', 'Documento / Contato', 'Cidade', 'Desde', 'Status', ''].map((h, i) => (
            <div key={i} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={User}
            title={search || status !== 'all' ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            description={search || status !== 'all' ? 'Tente ajustar os filtros.' : 'Clique em "Novo cliente" para começar.'} />
        ) : (
          <div className="divide-y">
            {filtered.map(cliente => (
              <div key={cliente.id} className="grid grid-cols-[2fr_1.5fr_1fr_80px_100px_72px] gap-0 hover:bg-muted/30 transition-colors group">
                {/* Nome — navegável */}
                <Link href={`/clientes/${cliente.id}`} className="px-4 py-3 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {cliente.type === 'pj' ? <Building2 size={13} className="text-muted-foreground" /> : <User size={13} className="text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{cliente.name}</p>
                    <p className="text-[10px] text-muted-foreground">{cliente.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                  </div>
                </Link>

                <Link href={`/clientes/${cliente.id}`} className="px-4 py-3 flex flex-col justify-center min-w-0">
                  {cliente.document && <p className="text-xs font-mono text-muted-foreground truncate">{formatDocument(cliente.document)}</p>}
                  {cliente.email && <p className="text-[10px] text-muted-foreground truncate">{cliente.email}</p>}
                </Link>

                <Link href={`/clientes/${cliente.id}`} className="px-4 py-3 flex items-center">
                  {cliente.city && <p className="text-xs text-muted-foreground truncate">{cliente.city}{cliente.state ? `, ${cliente.state}` : ''}</p>}
                </Link>

                <Link href={`/clientes/${cliente.id}`} className="px-4 py-3 flex items-center">
                  <p className="text-[10px] text-muted-foreground">{formatDate(cliente.created_at)}</p>
                </Link>

                <Link href={`/clientes/${cliente.id}`} className="px-4 py-3 flex items-center">
                  <ClientStatusBadge status={cliente.status} />
                </Link>

                {/* Ações */}
                <div className="px-2 py-3 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditando(cliente); setModalAberto(true) }}
                    title="Editar"
                    className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setExcluindo(cliente)}
                    title="Excluir"
                    className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>{/* min-w */}
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal criar / editar */}
      {modalAberto && (
        <ClienteFormModal
          cliente={editando}
          onClose={() => { setModalAberto(false); setEditando(null) }}
          onSalvo={() => { setModalAberto(false); setEditando(null); carregar() }}
        />
      )}

      {/* Confirmação de exclusão */}
      {excluindo && (
        <ConfirmarExclusao
          nome={excluindo.name}
          onCancelar={() => setExcluindo(null)}
          onConfirmar={() => handleExcluir(excluindo)}
        />
      )}
    </div>
  )
}

// ── Modal criar / editar ──────────────────────────────────────────────────────
const ESTADOS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

function maskCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function ClienteFormModal({
  cliente, onClose, onSalvo,
}: {
  cliente: Cliente | null
  onClose: () => void
  onSalvo: () => void
}) {
  const editMode = !!cliente
  const [form, setForm] = useState<ClienteInput>({
    type:     cliente?.type     ?? 'pf',
    name:     cliente?.name     ?? '',
    document: cliente?.document ?? '',
    email:    cliente?.email    ?? '',
    phone:    cliente?.phone    ?? '',
    cep:      cliente?.cep      ?? '',
    address:  cliente?.address  ?? '',
    city:     cliente?.city     ?? '',
    state:    cliente?.state    ?? '',
    status:   cliente?.status   ?? 'active',
    notes:    cliente?.notes    ?? '',
  })
  const [buscandoCep, setBuscandoCep]   = useState(false)
  const [buscandoCnpj, setBuscandoCnpj] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')

  const set = (patch: Partial<ClienteInput>) => setForm(prev => ({ ...prev, ...patch }))

  async function buscarCep(digits: string) {
    if (digits.length !== 8) return
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`)
      if (!res.ok) return
      const data = await res.json()
      set({
        address: data.street  || '',
        city:    data.city    || '',
        state:   data.state   || '',
      })
    } catch {}
    finally { setBuscandoCep(false) }
  }

  async function buscarCnpj() {
    if (form.type !== 'pj') return
    const digits = (form.document ?? '').replace(/\D/g, '')
    if (digits.length !== 14) return
    setBuscandoCnpj(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      if (!res.ok) return
      const data = await res.json()
      const addr = [data.logradouro, data.numero, data.complemento].filter(Boolean).join(', ')
      const cepDigits = data.cep ? String(data.cep).replace(/\D/g, '').slice(0, 8) : ''
      set({
        name:    data.razao_social || form.name,
        cep:     cepDigits,
        address: addr,
        city:    data.municipio   || '',
        state:   data.uf          || '',
      })
    } catch {}
    finally { setBuscandoCnpj(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setErro('Nome é obrigatório.'); return }
    setErro(''); setLoading(true)
    try {
      if (editMode) {
        await atualizarCliente(cliente.id, form)
      } else {
        await criarCliente(form)
      }
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
          <h2 className="font-serif text-[18px] font-medium">{editMode ? 'Editar cliente' : 'Novo cliente'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            {(['pf', 'pj'] as const).map(t => (
              <button key={t} type="button" onClick={() => set({ type: t, document: '' })}
                className={cn('h-9 rounded-[5px] border text-[13px] font-medium transition-colors',
                  form.type === t ? 'border-foreground bg-card text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground')}>
                {t === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </button>
            ))}
          </div>

          <F label="Nome *">
            <Input value={form.name} onChange={e => set({ name: e.target.value })}
              placeholder={form.type === 'pf' ? 'Nome completo' : 'Razão social'}
              className="h-9 text-[13px]" autoFocus={!editMode} />
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label={form.type === 'pf' ? 'CPF' : 'CNPJ'}>
              <div className="relative">
                <Input
                  value={form.document ?? ''}
                  onChange={e => set({ document: form.type === 'pf' ? maskCpf(e.target.value) : maskCnpj(e.target.value) })}
                  onBlur={() => { if (form.type === 'pj') buscarCnpj() }}
                  placeholder={form.type === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                  maxLength={form.type === 'pf' ? 14 : 18}
                  className="h-9 text-[13px]"
                />
                {buscandoCnpj && (
                  <Loader2 size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
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

          <div className="grid grid-cols-[112px_1fr] gap-3">
            <F label="CEP">
              <div className="relative">
                <Input
                  value={(form.cep ?? '').length > 5 ? `${(form.cep ?? '').slice(0, 5)}-${(form.cep ?? '').slice(5)}` : (form.cep ?? '')}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
                    set({ cep: digits })
                    if (digits.length === 8) buscarCep(digits)
                  }}
                  placeholder="00000-000"
                  className="h-9 text-[13px]"
                  maxLength={9}
                />
                {buscandoCep && (
                  <Loader2 size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </F>
            <F label="Endereço">
              <Input value={form.address ?? ''} onChange={e => set({ address: e.target.value })}
                placeholder="Rua, número, complemento" className="h-9 text-[13px]" />
            </F>
          </div>

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
              {loading ? 'Salvando…' : editMode ? 'Salvar alterações' : 'Salvar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Confirmação de exclusão ───────────────────────────────────────────────────
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
