// Vetor Jurídico — mock data (Brazilian context, all fictitious)

window.MOCK = (() => {
  const CLIENTES = [
    { id: "c-001", nome: "Construtora Marítima Atlântico Ltda.", tipo: "PJ", doc: "23.481.092/0001-44", email: "juridico@cmatlantico.com.br", tel: "(21) 3422-8800", cidade: "Rio de Janeiro / RJ", desde: "2021-03", casosAtivos: 4, status: "ativo" },
    { id: "c-002", nome: "Helena Marques de Andrade", tipo: "PF", doc: "184.502.339-12", email: "helena.marques@outlook.com", tel: "(11) 99182-4471", cidade: "Aracaju / SP", desde: "2022-08", casosAtivos: 2, status: "ativo" },
    { id: "c-003", nome: "Têxtil Vale do Itajaí S.A.", tipo: "PJ", doc: "11.092.331/0001-08", email: "contencioso@vti.com.br", tel: "(47) 3035-2200", cidade: "Blumenau / SC", desde: "2019-11", casosAtivos: 7, status: "ativo" },
    { id: "c-004", nome: "Rafael Siqueira Bittencourt", tipo: "PF", doc: "302.118.477-90", email: "r.bittencourt@gmail.com", tel: "(31) 98801-3344", cidade: "Belo Horizonte / MG", desde: "2023-02", casosAtivos: 1, status: "ativo" },
    { id: "c-005", nome: "Cooperativa Agropecuária Cerrado Norte", tipo: "PJ", doc: "07.881.220/0001-55", email: "diretoria@coopcerrado.com.br", tel: "(62) 3221-9090", cidade: "Goiânia / GO", desde: "2020-06", casosAtivos: 3, status: "ativo" },
    { id: "c-006", nome: "Patricia Linhares Vieira", tipo: "PF", doc: "445.901.288-04", email: "patricialv@uol.com.br", tel: "(21) 99713-0021", cidade: "Niterói / RJ", desde: "2024-01", casosAtivos: 1, status: "ativo" },
    { id: "c-007", nome: "Móveis Serra Gaúcha Indústria Ltda.", tipo: "PJ", doc: "18.776.041/0001-22", email: "rh@moveisserragaucha.com.br", tel: "(54) 3290-4400", cidade: "Caxias do Sul / RS", desde: "2018-04", casosAtivos: 5, status: "ativo" },
    { id: "c-008", nome: "Eduardo Pacheco de Almeida", tipo: "PF", doc: "729.014.605-71", email: "eduardo.pacheco@me.com", tel: "(85) 98441-2210", cidade: "Fortaleza / CE", desde: "2023-09", casosAtivos: 0, status: "inativo" },
    { id: "c-009", nome: "TechBras Sistemas e Serviços", tipo: "PJ", doc: "32.557.108/0001-91", email: "legal@techbras.io", tel: "(11) 4003-8800", cidade: "Aracaju / SP", desde: "2022-05", casosAtivos: 2, status: "ativo" },
    { id: "c-010", nome: "Beatriz Camargo Salles", tipo: "PF", doc: "611.882.044-29", email: "bia.salles@hotmail.com", tel: "(11) 99044-1750", cidade: "Campinas / SP", desde: "2024-04", casosAtivos: 1, status: "ativo" },
  ];

  const CASOS = [
    { id: "p-2024-00481", numero: "0008142-29.2024.8.19.0001", clienteId: "c-001", clienteNome: "Construtora Marítima Atlântico", tipo: "Trabalhista", area: "Trabalho", status: "ativo", fase: "Instrução", responsavel: "Dra. Marina Costa", prazo: "2026-06-02", valor: 184000, criadoEm: "2024-02-11", vara: "12ª Vara do Trabalho — Rio de Janeiro" },
    { id: "p-2024-00498", numero: "1024891-77.2024.8.26.0100", clienteId: "c-002", clienteNome: "Helena M. Andrade", tipo: "Família — Inventário", area: "Família", status: "ativo", fase: "Petição inicial", responsavel: "Dr. André Furtado", prazo: "2026-06-04", valor: 0, criadoEm: "2024-04-22", vara: "5ª Vara de Família — Aracaju" },
    { id: "p-2023-00712", numero: "5009124-08.2023.4.03.6100", clienteId: "c-003", clienteNome: "Têxtil Vale do Itajaí", tipo: "Tributário — Execução fiscal", area: "Tributário", status: "ativo", fase: "Embargos", responsavel: "Dra. Marina Costa", prazo: "2026-05-29", valor: 2480000, criadoEm: "2023-08-17", vara: "12ª Vara Federal — Aracaju" },
    { id: "p-2025-00103", numero: "0003221-90.2025.8.13.0024", clienteId: "c-004", clienteNome: "Rafael S. Bittencourt", tipo: "Cível — Indenização", area: "Cível", status: "ativo", fase: "Audiência marcada", responsavel: "Dr. Tiago Mendes", prazo: "2026-06-12", valor: 75000, criadoEm: "2025-01-30", vara: "9ª Vara Cível — Belo Horizonte" },
    { id: "p-2024-00322", numero: "0012770-44.2024.8.09.0051", clienteId: "c-005", clienteNome: "Coop. Cerrado Norte", tipo: "Agrário", area: "Agrário", status: "ativo", fase: "Saneamento", responsavel: "Dra. Marina Costa", prazo: "2026-06-09", valor: 510000, criadoEm: "2024-03-14", vara: "Vara Agrária — Goiânia" },
    { id: "p-2024-00505", numero: "5012088-12.2024.4.03.6182", clienteId: "c-009", clienteNome: "TechBras Sistemas", tipo: "Empresarial — Contratos", area: "Empresarial", status: "ativo", fase: "Negociação", responsavel: "Dra. Júlia Werneck", prazo: "2026-05-28", valor: 320000, criadoEm: "2024-05-02", vara: "Câmara CAM-CCBC — Aracaju" },
    { id: "p-2024-00611", numero: "0005112-66.2024.8.21.0001", clienteId: "c-007", clienteNome: "Móveis Serra Gaúcha", tipo: "Trabalhista", area: "Trabalho", status: "ativo", fase: "Sentença", responsavel: "Dr. André Furtado", prazo: "2026-07-01", valor: 92000, criadoEm: "2024-06-08", vara: "3ª Vara do Trabalho — Caxias do Sul" },
    { id: "p-2022-00088", numero: "0001034-25.2022.8.19.0210", clienteId: "c-001", clienteNome: "Construtora Marítima Atlântico", tipo: "Cível — Recuperação", area: "Cível", status: "ativo", fase: "Plano aprovado", responsavel: "Dra. Júlia Werneck", prazo: "2026-09-15", valor: 12400000, criadoEm: "2022-04-12", vara: "1ª Vara Empresarial — Rio de Janeiro" },
    { id: "p-2025-00210", numero: "1003881-50.2025.8.26.0224", clienteId: "c-010", clienteNome: "Beatriz C. Salles", tipo: "Consumidor", area: "Consumidor", status: "ativo", fase: "Citação", responsavel: "Dr. Tiago Mendes", prazo: "2026-05-30", valor: 18400, criadoEm: "2025-02-19", vara: "JEC — Campinas" },
    { id: "p-2024-00733", numero: "0009912-14.2024.8.13.0024", clienteId: "c-004", clienteNome: "Rafael S. Bittencourt", tipo: "Família — Divórcio", area: "Família", status: "encerrado", fase: "Trânsito em julgado", responsavel: "Dr. André Furtado", prazo: null, valor: 0, criadoEm: "2024-07-21", vara: "5ª Vara de Família — Belo Horizonte" },
    { id: "p-2023-00540", numero: "5007220-91.2023.4.03.6100", clienteId: "c-003", clienteNome: "Têxtil Vale do Itajaí", tipo: "Tributário — Anulatória", area: "Tributário", status: "ativo", fase: "Recurso", responsavel: "Dra. Júlia Werneck", prazo: "2026-06-18", valor: 1880000, criadoEm: "2023-11-09", vara: "TRF 3ª Região" },
    { id: "p-2025-00012", numero: "0000118-77.2025.8.26.0100", clienteId: "c-006", clienteNome: "Patricia L. Vieira", tipo: "Família — Pensão", area: "Família", status: "ativo", fase: "Petição inicial", responsavel: "Dr. André Furtado", prazo: "2026-06-05", valor: 0, criadoEm: "2025-01-04", vara: "8ª Vara de Família — Niterói" },
    { id: "p-2024-00451", numero: "0007041-30.2024.5.04.0211", clienteId: "c-007", clienteNome: "Móveis Serra Gaúcha", tipo: "Trabalhista — Coletiva", area: "Trabalho", status: "ativo", fase: "Audiência marcada", responsavel: "Dra. Marina Costa", prazo: "2026-05-27", valor: 480000, criadoEm: "2024-04-15", vara: "MPT — 4ª Região" },
    { id: "p-2024-00800", numero: "0010220-08.2024.8.26.0100", clienteId: "c-009", clienteNome: "TechBras Sistemas", tipo: "Propriedade Intelectual", area: "Empresarial", status: "ativo", fase: "Liminar concedida", responsavel: "Dra. Júlia Werneck", prazo: "2026-06-22", valor: 240000, criadoEm: "2024-09-10", vara: "2ª Vara Empresarial — Aracaju" },
    { id: "p-2024-00901", numero: "0002288-19.2024.8.09.0051", clienteId: "c-005", clienteNome: "Coop. Cerrado Norte", tipo: "Ambiental", area: "Ambiental", status: "ativo", fase: "Perícia", responsavel: "Dr. Tiago Mendes", prazo: "2026-07-08", valor: 0, criadoEm: "2024-10-22", vara: "Vara Ambiental — Goiás" },
  ];

  const PRAZOS = [
    { id: "pz-001", titulo: "Manifestação sobre laudo pericial", caso: "p-2023-00712", casoNome: "Têxtil Vale do Itajaí · Execução fiscal", data: "2026-05-27", diasRestantes: 2, criticidade: "critico", responsavel: "Dra. Marina Costa", tipo: "Manifestação" },
    { id: "pz-002", titulo: "Audiência de instrução", caso: "p-2024-00451", casoNome: "Móveis Serra Gaúcha · Trabalhista coletiva", data: "2026-05-27", diasRestantes: 2, criticidade: "critico", responsavel: "Dra. Marina Costa", tipo: "Audiência" },
    { id: "pz-003", titulo: "Contrarrazões ao recurso", caso: "p-2024-00505", casoNome: "TechBras · Contratos", data: "2026-05-28", diasRestantes: 3, criticidade: "alto", responsavel: "Dra. Júlia Werneck", tipo: "Petição" },
    { id: "pz-004", titulo: "Impugnação à contestação", caso: "p-2023-00712", casoNome: "Têxtil Vale do Itajaí", data: "2026-05-29", diasRestantes: 4, criticidade: "alto", responsavel: "Dra. Marina Costa", tipo: "Petição" },
    { id: "pz-005", titulo: "Audiência de conciliação", caso: "p-2025-00210", casoNome: "Beatriz Salles · JEC", data: "2026-05-30", diasRestantes: 5, criticidade: "medio", responsavel: "Dr. Tiago Mendes", tipo: "Audiência" },
    { id: "pz-006", titulo: "Resposta à inicial", caso: "p-2024-00481", casoNome: "Construtora Atlântico · Trabalhista", data: "2026-06-02", diasRestantes: 8, criticidade: "medio", responsavel: "Dra. Marina Costa", tipo: "Petição" },
    { id: "pz-007", titulo: "Petição inicial — pensão alimentícia", caso: "p-2024-00498", casoNome: "Helena Andrade · Família", data: "2026-06-04", diasRestantes: 10, criticidade: "baixo", responsavel: "Dr. André Furtado", tipo: "Petição" },
    { id: "pz-008", titulo: "Réplica", caso: "p-2025-00012", casoNome: "Patricia Vieira · Pensão", data: "2026-06-05", diasRestantes: 11, criticidade: "baixo", responsavel: "Dr. André Furtado", tipo: "Petição" },
  ];

  const DOCUMENTOS = [
    { id: "d-001", nome: "Petição inicial — Trabalhista CMA", tipo: "PDF", caso: "p-2024-00481", casoNome: "Construtora Atlântico", tamanho: "2.1 MB", autor: "Marina Costa", data: "2024-02-11", versao: 3 },
    { id: "d-002", nome: "Contestação — Réu", tipo: "PDF", caso: "p-2024-00481", casoNome: "Construtora Atlântico", tamanho: "1.8 MB", autor: "Marina Costa", data: "2024-03-08", versao: 1 },
    { id: "d-003", nome: "Laudo pericial — Vale Itajaí", tipo: "PDF", caso: "p-2023-00712", casoNome: "Têxtil Vale do Itajaí", tamanho: "8.4 MB", autor: "Perito Judicial", data: "2026-04-12", versao: 1 },
    { id: "d-004", nome: "Contrato social — TechBras", tipo: "PDF", caso: "p-2024-00505", casoNome: "TechBras", tamanho: "640 KB", autor: "Júlia Werneck", data: "2024-05-02", versao: 2 },
    { id: "d-005", nome: "Procuração — Helena Andrade", tipo: "PDF", caso: "p-2024-00498", casoNome: "Helena Andrade", tamanho: "120 KB", autor: "André Furtado", data: "2024-04-22", versao: 1 },
    { id: "d-006", nome: "Plano de recuperação — Atlântico v4", tipo: "PDF", caso: "p-2022-00088", casoNome: "Construtora Atlântico", tamanho: "12.1 MB", autor: "Júlia Werneck", data: "2026-05-04", versao: 4 },
    { id: "d-007", nome: "Decisão liminar — TechBras / PI", tipo: "PDF", caso: "p-2024-00800", casoNome: "TechBras · PI", tamanho: "320 KB", autor: "Sistema (eSAJ)", data: "2026-05-12", versao: 1 },
    { id: "d-008", nome: "Acordo extrajudicial — Móveis Serra", tipo: "DOCX", caso: "p-2024-00611", casoNome: "Móveis Serra Gaúcha", tamanho: "240 KB", autor: "André Furtado", data: "2026-05-18", versao: 2 },
    { id: "d-009", nome: "Termo de audiência — Bittencourt", tipo: "PDF", caso: "p-2025-00103", casoNome: "Rafael Bittencourt", tamanho: "180 KB", autor: "Tiago Mendes", data: "2026-05-15", versao: 1 },
    { id: "d-010", nome: "Parecer jurídico — Cerrado Norte", tipo: "PDF", caso: "p-2024-00322", casoNome: "Coop. Cerrado Norte", tamanho: "560 KB", autor: "Marina Costa", data: "2026-05-08", versao: 1 },
    { id: "d-011", nome: "Comprovante de recolhimento custas", tipo: "PDF", caso: "p-2025-00210", casoNome: "Beatriz Salles", tamanho: "84 KB", autor: "Tiago Mendes", data: "2026-05-20", versao: 1 },
    { id: "d-012", nome: "Embargos à execução — Vale Itajaí", tipo: "PDF", caso: "p-2023-00712", casoNome: "Têxtil Vale do Itajaí", tamanho: "3.2 MB", autor: "Marina Costa", data: "2023-09-04", versao: 2 },
    { id: "d-013", nome: "Estatuto social — Cerrado Norte", tipo: "PDF", caso: "p-2024-00322", casoNome: "Coop. Cerrado Norte", tamanho: "1.4 MB", autor: "Marina Costa", data: "2024-03-14", versao: 1 },
    { id: "d-014", nome: "E-mail — proposta de acordo", tipo: "EML", caso: "p-2024-00611", casoNome: "Móveis Serra Gaúcha", tamanho: "16 KB", autor: "André Furtado", data: "2026-05-12", versao: 1 },
    { id: "d-015", nome: "Sentença — Divórcio Bittencourt", tipo: "PDF", caso: "p-2024-00733", casoNome: "Rafael Bittencourt", tamanho: "190 KB", autor: "Sistema (PJe)", data: "2025-11-04", versao: 1 },
    { id: "d-016", nome: "Recurso ordinário — Móveis Serra", tipo: "PDF", caso: "p-2024-00611", casoNome: "Móveis Serra Gaúcha", tamanho: "2.7 MB", autor: "André Furtado", data: "2026-05-22", versao: 1 },
    { id: "d-017", nome: "Notificação extrajudicial — TechBras", tipo: "PDF", caso: "p-2024-00505", casoNome: "TechBras", tamanho: "210 KB", autor: "Júlia Werneck", data: "2024-04-18", versao: 1 },
    { id: "d-018", nome: "Acordo de confidencialidade", tipo: "PDF", caso: "p-2024-00800", casoNome: "TechBras · PI", tamanho: "180 KB", autor: "Júlia Werneck", data: "2024-09-15", versao: 1 },
    { id: "d-019", nome: "Estudo de impacto ambiental", tipo: "PDF", caso: "p-2024-00901", casoNome: "Coop. Cerrado Norte · Ambiental", tamanho: "16.8 MB", autor: "Consultor externo", data: "2024-11-30", versao: 1 },
    { id: "d-020", nome: "Memorando interno — estratégia", tipo: "DOCX", caso: "p-2022-00088", casoNome: "Construtora Atlântico · Recuperação", tamanho: "92 KB", autor: "Júlia Werneck", data: "2026-05-10", versao: 3 },
  ];

  const EQUIPE = [
    { id: "u-001", nome: "Marina Costa", iniciais: "MC", email: "marina@vetorjuridico.com.br", role: "owner", roleNome: "Sócia titular", oab: "OAB/RJ 184.221", status: "ativo", casos: 12, ultimoLogin: "agora" },
    { id: "u-002", nome: "André Furtado", iniciais: "AF", email: "andre@vetorjuridico.com.br", role: "admin", roleNome: "Sócio", oab: "OAB/SP 311.044", status: "ativo", casos: 9, ultimoLogin: "há 2 h" },
    { id: "u-003", nome: "Júlia Werneck", iniciais: "JW", email: "julia@vetorjuridico.com.br", role: "lawyer", roleNome: "Advogada sênior", oab: "OAB/RJ 220.491", status: "ativo", casos: 8, ultimoLogin: "há 18 min" },
    { id: "u-004", nome: "Tiago Mendes", iniciais: "TM", email: "tiago@vetorjuridico.com.br", role: "lawyer", roleNome: "Advogado pleno", oab: "OAB/MG 195.882", status: "ativo", casos: 5, ultimoLogin: "há 4 h" },
    { id: "u-005", nome: "Camila Reis", iniciais: "CR", email: "camila@vetorjuridico.com.br", role: "assistant", roleNome: "Assistente jurídica", oab: "—", status: "convidado", casos: 0, ultimoLogin: "—" },
  ];

  const FINANCEIRO = [
    { id: "f-001", cliente: "Construtora Marítima Atlântico", caso: "p-2024-00481", descricao: "Honorários — fase instrutória", valor: 32000, vencimento: "2026-05-15", status: "atraso", diasAtraso: 10 },
    { id: "f-002", cliente: "Têxtil Vale do Itajaí", caso: "p-2023-00712", descricao: "Honorários mensais — maio", valor: 18000, vencimento: "2026-06-01", status: "pendente" },
    { id: "f-003", cliente: "Coop. Cerrado Norte", caso: "p-2024-00322", descricao: "Êxito parcial — execução", valor: 51000, vencimento: "2026-05-30", status: "pendente" },
    { id: "f-004", cliente: "Helena Marques de Andrade", caso: "p-2024-00498", descricao: "Inventário — entrada", valor: 8000, vencimento: "2026-05-10", status: "recebido", dataPag: "2026-05-08" },
    { id: "f-005", cliente: "TechBras Sistemas", caso: "p-2024-00505", descricao: "Honorários fixos — maio", valor: 24000, vencimento: "2026-05-20", status: "recebido", dataPag: "2026-05-19" },
    { id: "f-006", cliente: "Móveis Serra Gaúcha", caso: "p-2024-00611", descricao: "Honorários — fase recursal", valor: 14500, vencimento: "2026-05-12", status: "atraso", diasAtraso: 13 },
    { id: "f-007", cliente: "Rafael S. Bittencourt", caso: "p-2025-00103", descricao: "Consulta + petição inicial", valor: 4200, vencimento: "2026-04-30", status: "atraso", diasAtraso: 25 },
    { id: "f-008", cliente: "Beatriz C. Salles", caso: "p-2025-00210", descricao: "Honorários JEC", valor: 1800, vencimento: "2026-06-10", status: "pendente" },
    { id: "f-009", cliente: "Construtora Marítima Atlântico", caso: "p-2022-00088", descricao: "Recuperação judicial — fee", valor: 75000, vencimento: "2026-05-22", status: "recebido", dataPag: "2026-05-22" },
    { id: "f-010", cliente: "Patricia Linhares Vieira", caso: "p-2025-00012", descricao: "Entrada — pensão", valor: 3500, vencimento: "2026-06-08", status: "pendente" },
  ];

  const NOTIFICACOES = [
    { id: "n-001", tipo: "prazo", prioridade: "critico", titulo: "Prazo crítico em 2 dias", descricao: "Manifestação sobre laudo pericial — Têxtil Vale do Itajaí", quando: "há 18 min", lida: false },
    { id: "n-002", tipo: "prazo", prioridade: "critico", titulo: "Audiência amanhã às 14h", descricao: "Móveis Serra Gaúcha · Trabalhista coletiva — 3ª Vara do Trabalho", quando: "há 1 h", lida: false },
    { id: "n-003", tipo: "atividade", prioridade: "info", titulo: "Documento adicionado", descricao: "Júlia Werneck anexou \"Plano de recuperação v4\" ao caso Atlântico", quando: "há 3 h", lida: false },
    { id: "n-004", tipo: "financeiro", prioridade: "alto", titulo: "Honorário em atraso — 25 dias", descricao: "Rafael S. Bittencourt · R$ 4.200,00", quando: "há 4 h", lida: true },
    { id: "n-005", tipo: "convite", prioridade: "info", titulo: "Camila Reis aceitou o convite", descricao: "Nova assistente jurídica entrou na equipe", quando: "ontem", lida: true },
    { id: "n-006", tipo: "atividade", prioridade: "info", titulo: "Decisão liminar concedida", descricao: "TechBras · Propriedade Intelectual — favorável", quando: "2 dias atrás", lida: true },
    { id: "n-007", tipo: "prazo", prioridade: "medio", titulo: "Contrarrazões em 3 dias", descricao: "TechBras · Contratos — Câmara CAM-CCBC", quando: "2 dias atrás", lida: true },
  ];

  const MODELOS = [
    { id: "m-001", nome: "Petição inicial — Trabalhista", area: "Trabalho", autor: "Marina Costa", atualizado: "há 4 dias", usos: 28 },
    { id: "m-002", nome: "Contestação — Cível ordinária", area: "Cível", autor: "Júlia Werneck", atualizado: "há 1 semana", usos: 41 },
    { id: "m-003", nome: "Procuração ad judicia", area: "Geral", autor: "Marina Costa", atualizado: "há 2 semanas", usos: 122 },
    { id: "m-004", nome: "Embargos à execução fiscal", area: "Tributário", autor: "Júlia Werneck", atualizado: "há 1 mês", usos: 14 },
    { id: "m-005", nome: "Notificação extrajudicial", area: "Geral", autor: "André Furtado", atualizado: "há 3 semanas", usos: 67 },
    { id: "m-006", nome: "Acordo de confidencialidade (NDA)", area: "Empresarial", autor: "Júlia Werneck", atualizado: "há 5 dias", usos: 19 },
    { id: "m-007", nome: "Petição — Divórcio consensual", area: "Família", autor: "André Furtado", atualizado: "há 2 meses", usos: 23 },
    { id: "m-008", nome: "Recurso ordinário trabalhista", area: "Trabalho", autor: "Marina Costa", atualizado: "há 1 mês", usos: 11 },
    { id: "m-009", nome: "Contrato de prestação de serviços", area: "Empresarial", autor: "Júlia Werneck", atualizado: "há 6 dias", usos: 38 },
  ];

  const ESCRITORIOS = [
    { id: "esc-001", nome: "Costa, Furtado & Werneck Advogados", sigla: "CFW", plano: "Pro", role: "Sócia titular", membros: 5, casos: 35, ultimoAcesso: "agora" },
    { id: "esc-002", nome: "Costa Advocacia Independente", sigla: "CA", plano: "Starter", role: "Titular", membros: 1, casos: 4, ultimoAcesso: "há 2 semanas" },
  ];

  return { CLIENTES, CASOS, PRAZOS, DOCUMENTOS, EQUIPE, FINANCEIRO, NOTIFICACOES, MODELOS, ESCRITORIOS };
})();
