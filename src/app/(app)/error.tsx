'use client'
import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AppError]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center py-24 px-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-destructive" />
        </div>
        <h1 className="text-base font-bold mb-1">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Não foi possível carregar esta página. Tente novamente ou volte ao dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 h-9 border border-border rounded-[6px] text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground rounded-[6px] text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RotateCcw size={14} /> Tentar novamente
          </button>
        </div>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground/50 mt-6 font-mono">
            {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
