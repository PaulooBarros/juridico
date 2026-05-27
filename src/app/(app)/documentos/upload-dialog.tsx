'use client'
import { useEffect, useRef, useState } from 'react'
import { Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOC_TIPOS = [
  { value: 'peticao',     label: 'Petição' },
  { value: 'contrato',    label: 'Contrato' },
  { value: 'procuracao',  label: 'Procuração' },
  { value: 'sentenca',    label: 'Sentença' },
  { value: 'recurso',     label: 'Recurso' },
  { value: 'laudo',       label: 'Laudo' },
  { value: 'comprovante', label: 'Comprovante' },
  { value: 'outro',       label: 'Outro' },
]

type Case  = { id: string; titulo: string }
type Client = { id: string; name: string }

interface UploadDialogProps {
  open:     boolean
  onClose:  () => void
  onSuccess: (doc: any) => void
  // Pré-seleção (ao fazer upload de dentro de um caso/cliente)
  casoId?:    string
  clienteId?: string
  quotaUsada: number
  quotaTotal: number
}

export function UploadDialog({
  open, onClose, onSuccess,
  casoId, clienteId,
  quotaUsada, quotaTotal,
}: UploadDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [file,      setFile]      = useState<File | null>(null)
  const [nome,      setNome]      = useState('')
  const [tipo,      setTipo]      = useState('outro')
  const [casoSel,   setCasoSel]   = useState(casoId ?? '')
  const [clienteSel,setClienteSel]= useState(clienteId ?? '')
  const [casos,     setCasos]     = useState<Case[]>([])
  const [clientes,  setClientes]  = useState<Client[]>([])
  const [dragging,  setDragging]  = useState(false)
  const [status,    setStatus]    = useState<'idle'|'uploading'|'success'|'error'>('idle')
  const [erro,      setErro]      = useState('')

  // Carrega casos e clientes disponíveis
  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch('/api/documentos/options').then(r => r.json()),
    ]).then(([opts]) => {
      setCasos(opts.casos    ?? [])
      setClientes(opts.clientes ?? [])
    }).catch(() => {})
  }, [open])

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setFile(null)
      setNome('')
      setTipo('outro')
      setCasoSel(casoId ?? '')
      setClienteSel(clienteId ?? '')
      setStatus('idle')
      setErro('')
    }
  }, [open, casoId, clienteId])

  function handleFile(f: File) {
    setErro('')
    if (f.type !== 'application/pdf') { setErro('Apenas arquivos PDF são permitidos.'); return }
    if (f.size > 10 * 1024 * 1024)    { setErro('Arquivo muito grande. Máximo: 10 MB'); return }
    if (quotaUsada + f.size > quotaTotal) {
      const disp = ((quotaTotal - quotaUsada) / (1024 * 1024)).toFixed(1)
      setErro(`Cota insuficiente. Disponível: ${disp} MB`)
      return
    }
    setFile(f)
    if (!nome) setNome(f.name.replace(/\.pdf$/i, ''))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file)       { setErro('Selecione um arquivo PDF.'); return }
    if (!nome.trim()){ setErro('Informe um nome para o documento.'); return }

    setStatus('uploading')
    setErro('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('nome', nome.trim())
    fd.append('tipo', tipo)
    if (casoSel)    fd.append('caso_id',    casoSel)
    if (clienteSel) fd.append('cliente_id', clienteSel)

    try {
      const res  = await fetch('/api/upload/documento', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro no upload'); setStatus('error'); return }
      setStatus('success')
      setTimeout(() => { onSuccess(data.documento); onClose() }, 800)
    } catch {
      setErro('Erro de conexão')
      setStatus('error')
    }
  }

  if (!open) return null

  const quotaPct  = Math.round((quotaUsada / quotaTotal) * 100)
  const quotaUsadaMB = (quotaUsada / (1024 * 1024)).toFixed(1)
  const quotaTotalMB = (quotaTotal / (1024 * 1024)).toFixed(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold">Enviar documento</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileRef.current?.click()}
            className={cn(
              'rounded-lg border-2 border-dashed transition-all cursor-pointer',
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40',
              file && 'cursor-default pointer-events-none'
            )}
          >
            {file ? (
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null); setNome('') }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Upload size={24} className="text-muted-foreground mb-2" />
                <p className="text-[13px] font-medium">Arraste um PDF ou clique para selecionar</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Máximo 10 MB · apenas PDF</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Nome do documento *</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Petição Inicial — Caso 001"
              className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* Tipo + Vínculos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground font-medium">Tipo</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
              >
                {DOC_TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground font-medium">Caso (opcional)</label>
              <select
                value={casoSel}
                onChange={e => setCasoSel(e.target.value)}
                disabled={!!casoId}
                className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition disabled:opacity-60"
              >
                <option value="">— Nenhum —</option>
                {casos.map(c => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Cliente (opcional)</label>
            <select
              value={clienteSel}
              onChange={e => setClienteSel(e.target.value)}
              disabled={!!clienteId}
              className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition disabled:opacity-60"
            >
              <option value="">— Nenhum —</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Quota */}
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] text-muted-foreground">Armazenamento usado</p>
              <p className="text-[11px] font-mono text-muted-foreground">{quotaUsadaMB} / {quotaTotalMB} MB</p>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  quotaPct >= 90 ? 'bg-destructive' : quotaPct >= 70 ? 'bg-amber-500' : 'bg-primary'
                )}
                style={{ width: `${Math.min(quotaPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 text-destructive text-[12px]">
              <AlertCircle size={13} />
              {erro}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 border border-border rounded-[6px] text-[13px] text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === 'uploading' || status === 'success'}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {status === 'uploading' && <Loader2 size={13} className="animate-spin" />}
              {status === 'success'   && <CheckCircle2 size={13} />}
              {status === 'uploading' ? 'Enviando…' : status === 'success' ? 'Enviado!' : 'Enviar documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
