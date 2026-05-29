-- Tabela de modelos de documentos (templates reutilizáveis)
-- escritorio_id = null → template global da Leea (somente leitura)
-- escritorio_id = <id> → template privado do escritório

create table modelos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade,
  created_by    text,
  nome          text not null,
  descricao     text,
  categoria     text not null check (categoria in ('peticoes','contratos','procuracoes','correspondencias','outros')),
  area          text,
  conteudo      jsonb not null default '{}',
  tags          text[],
  uso_count     int default 0
);

create index modelos_escritorio_id_idx on modelos(escritorio_id);

-- RLS
alter table modelos enable row level security;

-- Leitura: modelos do escritório + globais da Leea
create policy "modelos_select"
  on modelos for select
  using (
    escritorio_id is null
    or escritorio_id in (select get_user_escritorio_ids())
  );

-- Inserção: apenas no próprio escritório
create policy "modelos_insert"
  on modelos for insert
  with check (
    escritorio_id in (select get_user_escritorio_ids())
  );

-- Atualização: apenas modelos do próprio escritório
create policy "modelos_update"
  on modelos for update
  using      (escritorio_id in (select get_user_escritorio_ids()))
  with check (escritorio_id in (select get_user_escritorio_ids()));

-- Exclusão: apenas modelos do próprio escritório
create policy "modelos_delete"
  on modelos for delete
  using (
    escritorio_id in (select get_user_escritorio_ids())
  );

-- Trigger para updated_at
create or replace function touch_modelos_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger modelos_updated_at
  before update on modelos
  for each row execute function touch_modelos_updated_at();

-- RPC para incrementar uso_count de forma atômica
create or replace function incrementar_uso_modelo(modelo_id uuid)
returns void as $$
  update modelos set uso_count = uso_count + 1 where id = modelo_id;
$$ language sql security definer;
