'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

export function WaitlistForm() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Algo deu errado. Tente novamente.')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={18} className="text-primary" />
        </div>
        <p className="text-[15px] font-medium">Email registrado!</p>
        <p className="text-[13px] text-muted-foreground text-center max-w-[36ch]">
          Você entrou na lista. Assim que abrirmos o acesso, você será um dos primeiros a saber.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[420px]">
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="seu@email.com.br"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="flex-1 h-10 px-3.5 rounded-[5px] border border-border bg-card text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="h-10 px-4 rounded-[5px] bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          {status === 'loading'
            ? <><Loader2 size={13} className="animate-spin" /> Aguarde</>
            : 'Entrar na lista'
          }
        </button>
      </div>
      {status === 'error' && (
        <p className="text-[12px] text-destructive mt-2">{message}</p>
      )}
    </form>
  )
}
