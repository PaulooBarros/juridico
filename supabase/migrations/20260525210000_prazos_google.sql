-- Tabela de prazos
create table prazos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  caso_id       uuid references casos(id) on delete cascade,
  created_by    uuid references auth.users(id) not null,
  titulo        text not null,
  descricao     text,
  data_prazo    date not null,
  tipo          text not null default 'prazo'
                check (tipo in ('prazo','audiencia','reuniao','protocolo','recurso','outro')),
  status        text not null default 'pending'
                check (status in ('pending','done','cancelled')),
  google_event_id text
);

create index on prazos(escritorio_id);
create index on prazos(caso_id);
create index on prazos(data_prazo);

create trigger set_prazos_updated_at
  before update on prazos
  for each row execute function update_updated_at();

alter table prazos enable row level security;

create policy "membros veem prazos do escritorio"
  on prazos for select using (is_membro(escritorio_id));

create policy "membros criam prazos"
  on prazos for insert with check (is_membro(escritorio_id) and auth.uid() = created_by);

create policy "membros atualizam prazos"
  on prazos for update using (is_membro(escritorio_id));

create policy "membros deletam prazos"
  on prazos for delete using (is_membro(escritorio_id));

-- Tabela de tokens Google Calendar por usuário
create table google_calendar_tokens (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  calendar_id   text not null default 'primary'
);

create trigger set_google_calendar_tokens_updated_at
  before update on google_calendar_tokens
  for each row execute function update_updated_at();

alter table google_calendar_tokens enable row level security;

create policy "user ve seu proprio token"
  on google_calendar_tokens for select using (auth.uid() = user_id);

create policy "user insere seu proprio token"
  on google_calendar_tokens for insert with check (auth.uid() = user_id);

create policy "user atualiza seu proprio token"
  on google_calendar_tokens for update using (auth.uid() = user_id);

create policy "user deleta seu proprio token"
  on google_calendar_tokens for delete using (auth.uid() = user_id);
