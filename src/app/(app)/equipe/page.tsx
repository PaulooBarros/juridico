'use client'
import { useEffect, useState } from 'react'
import { Mail, Calendar, UserMinus, UserPlus, X, Copy, Check, Link2, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/features/shared/empty-state'
import { formatDate, formatRole, getInitials } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import {
  listarMembros, listarConvitesPendentes, criarConvite, revogarConvite, removerMembro,
  type Membro, type ConvitePendente, type ConviteRole,
} from '@/lib/supabase/equipe'

const ROLE_COLORS: Record<string, string> = {
  owner:     'bg-primary/10 text-primary border-primary/20',
  admin:     'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  lawyer:    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  assistant: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

const PERMISSIONS = [
  { role: 'owner',     perms: ['Todos os módulos', 'Faturamento', 'Exclusão de dados', 'Planos', 'Transferência de titularidade'] },
  { role: 'admin',     perms: ['Todos os módulos', 'Faturamento', 'Exclusão de dados', 'Gestão de membros'] },
  { role: 'lawyer',    perms: ['Clientes', 'Casos', 'Documentos', 'Calendário', 'Modelos', 'Financeiro (leitura)'] },
  { role: 'assistant', perms: ['Clientes (leitura)', 'Documentos', 'Calendário', 'Modelos'] },
]

export default function EquipePage() {
  const [membros,   setMembros]   = useState<Membro[]>([])
  const [convites,  setConvites]  = useState<ConvitePendente[]>([])
  const [loading,   setLoading]   = useState(true)
  const [meuId,     setMeuId]     = useState<string | null>(null)
  const [meuRole,   setMeuRole]   = useState<string>('')
  const [modalConvite, setModalConvite] = useState(false)
  const [removendo, setRemovendo] = useState<Membro | null>(null)

  async function carregar() {
    setLoading(true)
    try {
      const [ms, cs, session] = await Promise.all([
        listarMembros(),
        listarConvitesPendentes(),
        authClient.getSession(),
      ])
      setMembros(ms)
      setConvites(cs)
      const userId = session.data?.user?.id
      if (userId) {
        setMeuId(userId)
        setMeuRole(ms.find(m => m.user_id === userId)?.role ?? '')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const podeGerenciar = meuRole === 'owner' || meuRole === 'admin'

  const advogados  = membros.filter(m => m.role === 'owner' || m.role === 'lawyer')
  const assistentes = membros.filter(m => m.role === 'admin' || m.role === 'assistant')

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total',        value: membros.length },
          { label: 'Advogados',    value: advogados.length },
          { label: 'Assistentes',  value: assistentes.length },
          { label: 'Convites',     value: convites.length },
        ].map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{loading ? '—' : s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Membros */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Membros do escritório</p>
          {podeGerenciar && (
            <button
              onClick={() => setModalConvite(true)}
              className="flex items-center gap-1.5 px-3 h-7 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={12} /> Convidar membro
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : membros.length === 0 ? (
          <EmptyState icon={UserPlus} title="Nenhum membro" description="Convide alguém para o escritório." />
        ) : (
          <div className="divide-y">
            {membros.map(membro => (
              <div key={membro.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback className="text-[11px] font-semibold">{getInitials(membro.nome)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{membro.nome}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Mail size={11} className="text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground truncate">{membro.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className="text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">Desde {formatDate(membro.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-[10px] border ${ROLE_COLORS[membro.role]}`} variant="outline">
                    {formatRole(membro.role)}
                  </Badge>
                  {podeGerenciar && membro.user_id !== meuId && membro.role !== 'owner' && (
                    <button
                      onClick={() => setRemovendo(membro)}
                      title="Remover membro"
                      className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <UserMinus size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Convites pendentes */}
      {convites.length > 0 && (
        <div className="rounded-lg border overflow-hidden bg-card">
          <div className="px-5 py-3 border-b bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground">Convites pendentes</p>
          </div>
          <div className="divide-y">
            {convites.map(convite => (
              <ConviteRow
                key={convite.id}
                convite={convite}
                podeGerenciar={podeGerenciar}
                onRevogado={() => carregar()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Permissões */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground">Permissões por função</p>
        </div>
        <div className="divide-y">
          {PERMISSIONS.map(row => (
            <div key={row.role} className="flex items-start gap-4 px-5 py-3">
              <Badge className={`text-[10px] border shrink-0 ${ROLE_COLORS[row.role]}`} variant="outline">
                {formatRole(row.role)}
              </Badge>
              <div className="flex flex-wrap gap-x-0">
                {row.perms.map((p, i) => (
                  <span key={p} className="text-[11px] text-muted-foreground">
                    {p}{i < row.perms.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal convidar */}
      {modalConvite && (
        <ModalConvite
          onClose={() => setModalConvite(false)}
          onConvidado={() => { setModalConvite(false); carregar() }}
        />
      )}

      {/* Confirmação remover membro */}
      {removendo && (
        <ConfirmarRemocao
          membro={removendo}
          onCancelar={() => setRemovendo(null)}
          onConfirmar={async () => {
            await removerMembro(removendo.user_id)
            setRemovendo(null)
            carregar()
          }}
        />
      )}
    </div>
  )
}

// ── Linha de convite pendente ─────────────────────────────────────────────────

function ConviteRow({ convite, podeGerenciar, onRevogado }: {
  convite: ConvitePendente
  podeGerenciar: boolean
  onRevogado: () => void
}) {
  const [copied,    setCopied]    = useState(false)
  const [revoking,  setRevoking]  = useState(false)

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/convite?token=${convite.token}`
    : `/convite?token=${convite.token}`

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRevogar() {
    setRevoking(true)
    try { await revogarConvite(convite.id); onRevogado() }
    finally { setRevoking(false) }
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors group">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Mail size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{convite.email}</p>
        <p className="text-[11px] text-muted-foreground">Expira em {formatDate(convite.expires_at)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={`text-[10px] border ${ROLE_COLORS[convite.role]}`} variant="outline">
          {formatRole(convite.role)}
        </Badge>
        <button
          onClick={handleCopy}
          title="Copiar link do convite"
          className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
        {podeGerenciar && (
          <button
            onClick={handleRevogar}
            disabled={revoking}
            title="Revogar convite"
            className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Modal convidar membro ─────────────────────────────────────────────────────

function ModalConvite({ onClose, onConvidado }: { onClose: () => void; onConvidado: () => void }) {
  const [email,   setEmail]   = useState('')
  const [role,    setRole]    = useState<ConviteRole>('lawyer')
  const [loading, setLoading] = useState(false)
  const [linkGerado, setLinkGerado] = useState('')
  const [copied,  setCopied]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { toast.error('E-mail é obrigatório.'); return }
    setLoading(true)
    try {
      const convite = await criarConvite(email.trim(), role)
      const link = `${window.location.origin}/convite?token=${convite.token}`
      setLinkGerado(link)
      toast.success('Convite enviado')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao criar convite.')
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(linkGerado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={linkGerado ? undefined : onClose} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-[440px] shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-[18px] font-medium">Convidar membro</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent transition-colors">
            <X size={15} />
          </button>
        </div>

        {linkGerado ? (
          <div className="px-6 py-5 space-y-4">
            <p className="text-[13px] text-muted-foreground">
              Convite criado! Copie o link abaixo e envie para <strong className="text-foreground">{email}</strong>.
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-[5px]">
              <Link2 size={13} className="text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground font-mono flex-1 truncate">{linkGerado}</span>
              <button onClick={handleCopy} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onConvidado}
                className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors">
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="advogado@escritorio.com.br"
                className="h-9 text-[13px]"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Função</Label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as ConviteRole)}
                className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary"
              >
                <option value="lawyer">Advogado</option>
                <option value="admin">Administrador</option>
                <option value="assistant">Assistente</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                {loading ? 'Criando…' : 'Gerar convite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Confirmação remover membro ────────────────────────────────────────────────

function ConfirmarRemocao({ membro, onCancelar, onConfirmar }: {
  membro: Membro
  onCancelar: () => void
  onConfirmar: () => void
}) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-[380px] p-6 shadow-xl">
        <h2 className="font-serif text-[18px] font-medium mb-2">Remover membro</h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Tem certeza que deseja remover <strong className="text-foreground">{membro.nome}</strong> do escritório? O acesso será revogado imediatamente.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancelar}
            className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button
            onClick={async () => {
              setLoading(true)
              try { await onConfirmar() }
              catch (e: any) { toast.error(e.message ?? 'Erro ao remover.'); setLoading(false) }
            }}
            disabled={loading}
            className="px-4 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Removendo…' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  )
}
