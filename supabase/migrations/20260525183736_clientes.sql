create table clientes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  created_by    uuid references auth.users(id) not null,
  type          text not null default 'pf' check (type in ('pf', 'pj')),
  name          text not null,
  document      text,
  email         text,
  phone         text,
  address       text,
  city          text,
  state         text,
  status        text not null default 'active' check (status in ('active', 'inactive', 'prospect')),
  notes         text
);

alter table clientes enable row level security;

create policy "clientes_select" on clientes
  for select using (is_membro(escritorio_id));

create policy "clientes_insert" on clientes
  for insert with check (is_membro(escritorio_id));

create policy "clientes_update" on clientes
  for update using (is_membro(escritorio_id));

create policy "clientes_delete" on clientes
  for delete using (is_membro(escritorio_id));
