import Link from 'next/link'
import { Scale, Building2, ArrowRight, Plus } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const ESCRITORIOS = [
  { id: 'off-001', name: 'Mendes & Ferreira Advocacia', slug: 'mendes-ferreira', role: 'Titular', members: 5, plan: 'Pro' },
  { id: 'off-002', name: 'Souza Advogados Associados', slug: 'souza-advogados', role: 'Advogado', members: 3, plan: 'Starter' },
]

export default function EscritoriosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Scale size={15} className="text-white" />
          </div>
          <span className="text-sm font-bold">Vetor Jurídico</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight mb-1">Seus escritórios</h1>
            <p className="text-sm text-muted-foreground">Selecione o escritório que deseja acessar.</p>
          </div>

          <div className="space-y-3 mb-6">
            {ESCRITORIOS.map((escritorio) => (
              <Link
                key={escritorio.id}
                href="/dashboard"
                className="flex items-center justify-between p-4 rounded-lg border bg-background hover:border-primary/60 hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{escritorio.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{escritorio.role}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{escritorio.members} membros</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{escritorio.plan}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>

          <Link
            href="/gateway"
            className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
          >
            <Plus size={16} />
            Criar ou entrar em outro escritório
          </Link>
        </div>
      </main>
    </div>
  )
}
