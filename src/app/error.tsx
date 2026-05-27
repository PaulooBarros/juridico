'use client'
import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-destructive" />
            </div>
            <h1 className="text-base font-bold mb-1">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground rounded-[6px] text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw size={14} /> Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
