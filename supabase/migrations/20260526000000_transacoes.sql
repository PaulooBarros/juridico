create table transacoes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  created_by    uuid references auth.users(id) not null,
  caso_id       uuid references casos(id) on delete set null,
  cliente_id    uuid references clientes(id) on delete set null,
  descricao     text not null,
  tipo          text not null default 'honorario'
                check (tipo in ('honorario','despesa','reembolso','adiantamento')),
  status        text not null default 'pending'
                check (status in ('pending','paid','overdue','cancelled')),
  valor         numeric(15,2) not null,
  vencimento    date,
  pago_em       date,
  notas         text
);

create index on transacoes(escritorio_id);
create index on transacoes(caso_id);
create index on transacoes(cliente_id);
create index on transacoes(status);

create trigger set_transacoes_updated_at
  before update on transacoes
  for each row execute function update_updated_at();

alter table transacoes enable row level security;

create policy "membros veem transacoes do escritorio"
  on transacoes for select using (is_membro(escritorio_id));

create policy "membros criam transacoes"
  on transacoes for insert
  with check (is_membro(escritorio_id) and auth.uid() = created_by);

create policy "membros atualizam transacoes"
  on transacoes for update using (is_membro(escritorio_id));

create policy "membros deletam transacoes"
  on transacoes for delete using (is_membro(escritorio_id));
