create table casos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  created_by    uuid references auth.users(id) not null,
  cliente_id    uuid references clientes(id) on delete set null,
  numero        text,
  titulo        text not null,
  area          text not null default 'civil' check (area in ('civil','criminal','trabalhista','tributario','empresarial','familia','consumidor','previdenciario')),
  fase          text not null default 'conhecimento' check (fase in ('conhecimento','recurso','execucao','cumprimento','extrajudicial','consulta')),
  status        text not null default 'active' check (status in ('active','suspended','closed','archived','pending')),
  vara          text,
  juiz          text,
  descricao     text,
  valor_causa   numeric,
  notes         text
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger casos_updated_at
  before update on casos
  for each row execute procedure update_updated_at();

alter table casos enable row level security;

create policy "casos_select" on casos
  for select using (is_membro(escritorio_id));

create policy "casos_insert" on casos
  for insert with check (is_membro(escritorio_id));

create policy "casos_update" on casos
  for update using (is_membro(escritorio_id));

create policy "casos_delete" on casos
  for delete using (is_membro(escritorio_id));
