import type { Client } from '@/lib/types'

export const clientes: Client[] = [
  {
    id: 'cli-001', officeId: 'off-001', type: 'pj', name: 'Construtora Horizonte Ltda',
    document: '12.345.678/0001-90', email: 'juridico@horizonte.com.br', phone: '(11) 3456-7890',
    address: 'Av. Paulista, 1200, conj. 101', city: 'Aracaju', state: 'SP',
    status: 'active', caseCount: 3, createdAt: '2024-01-15T10:00:00Z',
    notes: 'Cliente de longa data, múltiplos contratos em andamento.',
  },
  {
    id: 'cli-002', officeId: 'off-001', type: 'pf', name: 'Ricardo Almeida Santos',
    document: '123.456.789-00', email: 'ricardo.santos@email.com', phone: '(21) 98765-4321',
    address: 'Rua das Acácias, 45', city: 'Rio de Janeiro', state: 'RJ',
    status: 'active', caseCount: 2, createdAt: '2024-02-03T09:30:00Z',
  },
  {
    id: 'cli-003', officeId: 'off-001', type: 'pf', name: 'Fernanda Costa Oliveira',
    document: '987.654.321-00', email: 'fernanda.oliveira@email.com', phone: '(31) 97654-3210',
    address: 'Rua dos Ipês, 150, apto 32', city: 'Belo Horizonte', state: 'MG',
    status: 'active', caseCount: 1, createdAt: '2024-02-20T14:00:00Z',
  },
  {
    id: 'cli-004', officeId: 'off-001', type: 'pj', name: 'TechBrasil Sistemas S/A',
    document: '98.765.432/0001-10', email: 'legal@techbrasil.com', phone: '(11) 4000-1234',
    address: 'Rua Funchal, 700, 5º andar', city: 'Aracaju', state: 'SP',
    status: 'active', caseCount: 4, createdAt: '2024-03-01T11:00:00Z',
    notes: 'Demandas trabalhistas recorrentes.',
  },
  {
    id: 'cli-005', officeId: 'off-001', type: 'pf', name: 'Marcos Vinícius Pereira',
    document: '456.789.123-00', email: 'marcos.pereira@email.com', phone: '(85) 96543-2109',
    address: 'Av. Santos Dumont, 800, apto 14', city: 'Fortaleza', state: 'CE',
    status: 'active', caseCount: 1, createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'cli-006', officeId: 'off-001', type: 'pj', name: 'Supermercados Bom Preço Ltda',
    document: '34.567.890/0001-23', email: 'contato@bompreco.com.br', phone: '(41) 3200-5678',
    address: 'Rua XV de Novembro, 300', city: 'Curitiba', state: 'PR',
    status: 'active', caseCount: 2, createdAt: '2024-04-01T10:30:00Z',
  },
  {
    id: 'cli-007', officeId: 'off-001', type: 'pf', name: 'Ana Paula Rodrigues',
    document: '321.654.987-00', email: 'ana.rodrigues@email.com', phone: '(51) 95432-1098',
    address: 'Rua Independência, 55, apto 201', city: 'Porto Alegre', state: 'RS',
    status: 'inactive', caseCount: 1, createdAt: '2023-11-10T09:00:00Z',
    notes: 'Caso encerrado. Potencial para novos contratos.',
  },
  {
    id: 'cli-008', officeId: 'off-001', type: 'pj', name: 'Clínica Bem Estar Saúde S/S',
    document: '56.789.012/0001-45', email: 'adm@bemestar.com.br', phone: '(62) 3300-9876',
    address: 'Rua T-37, 600, Setor Bueno', city: 'Goiânia', state: 'GO',
    status: 'active', caseCount: 2, createdAt: '2024-04-20T14:30:00Z',
  },
  {
    id: 'cli-009', officeId: 'off-001', type: 'pf', name: 'Carlos Eduardo Lima',
    document: '654.987.321-00', email: 'carlos.lima@email.com', phone: '(71) 94321-0987',
    address: 'Rua da Graça, 120', city: 'Salvador', state: 'BA',
    status: 'prospect', caseCount: 0, createdAt: '2024-05-01T16:00:00Z',
    notes: 'Consulta inicial realizada. Aguardando proposta.',
  },
  {
    id: 'cli-010', officeId: 'off-001', type: 'pj', name: 'Agropecuária São Francisco S/A',
    document: '78.901.234/0001-67', email: 'juridico@saofrancisco.agr.br', phone: '(67) 3200-4567',
    address: 'Rodovia BR-163, km 12', city: 'Campo Grande', state: 'MS',
    status: 'active', caseCount: 3, createdAt: '2024-05-10T08:30:00Z',
  },
]
