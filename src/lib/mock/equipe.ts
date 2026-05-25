import type { TeamMember } from '@/lib/types'

export const equipe: TeamMember[] = [
  {
    id: 'mem-001', userId: 'usr-001', officeId: 'off-001',
    role: 'owner', name: 'Dr. Rafael Mendes', email: 'rafael.mendes@vetorjuridico.com.br',
    oab: 'OAB/SP 234.567', active: true, joinedAt: '2022-01-01T00:00:00Z',
  },
  {
    id: 'mem-002', userId: 'usr-002', officeId: 'off-001',
    role: 'lawyer', name: 'Dra. Juliana Ferreira', email: 'juliana.ferreira@vetorjuridico.com.br',
    oab: 'OAB/SP 345.678', active: true, joinedAt: '2022-03-15T00:00:00Z',
  },
  {
    id: 'mem-003', userId: 'usr-003', officeId: 'off-001',
    role: 'lawyer', name: 'Dr. Lucas Souza', email: 'lucas.souza@vetorjuridico.com.br',
    oab: 'OAB/MS 123.456', active: true, joinedAt: '2023-01-10T00:00:00Z',
  },
  {
    id: 'mem-004', userId: 'usr-004', officeId: 'off-001',
    role: 'assistant', name: 'Isabela Costa', email: 'isabela.costa@vetorjuridico.com.br',
    active: true, joinedAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 'mem-005', userId: 'usr-005', officeId: 'off-001',
    role: 'admin', name: 'Fernando Alves', email: 'fernando.alves@vetorjuridico.com.br',
    active: true, joinedAt: '2023-09-01T00:00:00Z',
  },
]
