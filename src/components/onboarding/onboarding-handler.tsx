'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { listarMembros } from '@/lib/supabase/equipe'
import { getMeuEscritorio } from '@/lib/supabase/escritorio'
import { WelcomeTour } from './welcome-tour'

const STORAGE_KEY = 'leea_onboarding_visto'

function getVistos(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

function marcarVisto(userId: string) {
  try {
    const vistos = getVistos()
    vistos.add(userId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(vistos)))
  } catch {}
}

export function OnboardingHandler() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [show,           setShow]           = useState(false)
  const [nomeEscritorio, setNomeEscritorio] = useState('')
  const [role,           setRole]           = useState('lawyer')

  useEffect(() => {
    const isWelcome = searchParams.get('welcome') === 'true'
    if (!isWelcome) return

    // Remove o param da URL sem recarregar a página
    const url = new URL(window.location.href)
    url.searchParams.delete('welcome')
    window.history.replaceState({}, '', url.toString())

    authClient.getSession().then(async ({ data }) => {
      const userId = data?.user?.id
      if (!userId) return

      // Já viu o onboarding neste dispositivo
      if (getVistos().has(userId)) return

      // Busca role e nome do escritório
      try {
        const [membros, escritorio] = await Promise.all([
          listarMembros(),
          getMeuEscritorio(),
        ])
        const meu = membros.find(m => m.user_id === userId)
        if (meu) setRole(meu.role)
        if (escritorio) setNomeEscritorio(escritorio.nome)
      } catch {}

      setShow(true)
    })
  }, [searchParams])

  function handleClose() {
    authClient.getSession().then(({ data }) => {
      if (data?.user?.id) marcarVisto(data.user.id)
    })
    setShow(false)
  }

  if (!show) return null

  return (
    <WelcomeTour
      nomeEscritorio={nomeEscritorio}
      role={role}
      onClose={handleClose}
    />
  )
}
