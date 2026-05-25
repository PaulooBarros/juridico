export { clientes } from './clientes'
export { casos, timelineEventos } from './casos'
export { documentos } from './documentos'
export { equipe } from './equipe'
export { transacoes } from './financeiro'
export { prazos } from './prazos'
export { notificacoes } from './notificacoes'

export const currentOffice = {
  id: 'off-001',
  name: 'Mendes & Ferreira Advocacia',
  slug: 'mendes-ferreira',
  slogan: 'Estratégia. Precisão. Resultado.',
  cnpj: '12.345.678/0001-90',
  address: 'Av. Brigadeiro Faria Lima, 3000, 12º andar — Itaim Bibi',
  phone: '(11) 3456-7890',
  email: 'contato@vetorjuridico.com.br',
  plan: 'pro' as const,
  createdAt: '2022-01-01T00:00:00Z',
}

export const currentUser = {
  id: 'usr-001',
  name: 'Dr. Rafael Mendes',
  email: 'rafael.mendes@vetorjuridico.com.br',
  oab: 'OAB/SP 234.567',
  bio: 'Advogado com 12 anos de experiência nas áreas cível, empresarial e tributário. Especialista em litígios complexos e recuperação de crédito.',
  specialties: ['Direito Civil', 'Direito Empresarial', 'Direito Tributário'],
  role: 'owner' as const,
  officeId: 'off-001',
  createdAt: '2022-01-01T00:00:00Z',
}

export const modelos = [
  {
    id: 'mod-001', officeId: 'off-001', name: 'Petição Inicial — Ação de Cobrança',
    description: 'Modelo completo de petição inicial para ação de cobrança de títulos de crédito.',
    category: 'peticoes' as const, area: 'civil' as const,
    createdBy: 'usr-001', createdByName: 'Dr. Rafael Mendes',
    usageCount: 23, createdAt: '2022-03-01T00:00:00Z', updatedAt: '2024-04-10T00:00:00Z',
    tags: ['cobrança', 'cível'],
  },
  {
    id: 'mod-002', officeId: 'off-001', name: 'Contestação Trabalhista — Horas Extras',
    description: 'Contestação específica para demandas de horas extras com argumentos técnicos.',
    category: 'peticoes' as const, area: 'trabalhista' as const,
    createdBy: 'usr-002', createdByName: 'Dra. Juliana Ferreira',
    usageCount: 18, createdAt: '2022-05-15T00:00:00Z', updatedAt: '2024-02-20T00:00:00Z',
    tags: ['contestação', 'trabalhista', 'horas extras'],
  },
  {
    id: 'mod-003', officeId: 'off-001', name: 'Procuração Ad Judicia et Extra',
    description: 'Procuração ampla com poderes para todos os atos judiciais e extrajudiciais.',
    category: 'procuracoes' as const,
    createdBy: 'usr-001', createdByName: 'Dr. Rafael Mendes',
    usageCount: 67, createdAt: '2022-01-10T00:00:00Z', updatedAt: '2023-11-01T00:00:00Z',
    tags: ['procuração', 'padrão'],
  },
  {
    id: 'mod-004', officeId: 'off-001', name: 'Contrato de Honorários — Êxito',
    description: 'Contrato de prestação de serviços advocatícios com remuneração por êxito.',
    category: 'contratos' as const,
    createdBy: 'usr-001', createdByName: 'Dr. Rafael Mendes',
    usageCount: 31, createdAt: '2022-02-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
    tags: ['honorários', 'êxito', 'contrato'],
  },
  {
    id: 'mod-005', officeId: 'off-001', name: 'Mandado de Segurança — Matéria Tributária',
    description: 'Petição de MS com fundamentos constitucionais para questões tributárias.',
    category: 'peticoes' as const, area: 'tributario' as const,
    createdBy: 'usr-001', createdByName: 'Dr. Rafael Mendes',
    usageCount: 9, createdAt: '2023-06-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z',
    tags: ['MS', 'tributário', 'constitucional'],
  },
  {
    id: 'mod-006', officeId: 'off-001', name: 'Notificação Extrajudicial',
    description: 'Modelo de notificação extrajudicial para constituição em mora.',
    category: 'correspondencias' as const,
    createdBy: 'usr-004', createdByName: 'Isabela Costa',
    usageCount: 44, createdAt: '2022-04-01T00:00:00Z', updatedAt: '2023-10-01T00:00:00Z',
    tags: ['notificação', 'mora', 'extrajudicial'],
  },
  {
    id: 'mod-007', officeId: 'off-001', name: 'Recurso de Apelação — Modelo Geral',
    description: 'Estrutura base para recurso de apelação com argumentação padrão.',
    category: 'peticoes' as const, area: 'civil' as const,
    createdBy: 'usr-001', createdByName: 'Dr. Rafael Mendes',
    usageCount: 15, createdAt: '2023-01-15T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z',
    tags: ['recurso', 'apelação'],
  },
  {
    id: 'mod-008', officeId: 'off-001', name: 'Acordo de Confidencialidade (NDA)',
    description: 'Contrato de sigilo para proteção de informações empresariais.',
    category: 'contratos' as const, area: 'empresarial' as const,
    createdBy: 'usr-001', createdByName: 'Dr. Rafael Mendes',
    usageCount: 12, createdAt: '2023-03-10T00:00:00Z', updatedAt: '2023-12-01T00:00:00Z',
    tags: ['NDA', 'confidencialidade', 'empresa'],
  },
]
