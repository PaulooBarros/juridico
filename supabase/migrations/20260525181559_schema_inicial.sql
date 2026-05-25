-- ─────────────────────────────────────────────
-- Escritórios
-- ─────────────────────────────────────────────
create table escritorios (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  owner_id      uuid references auth.users(id) not null,
  nome          text not null,
  cnpj          text,
  oab_sociedade text,
  especialidade text,
  cidade_uf     text,
  slogan        text,
  descricao     text,
  logo_url      text,
  slug          text unique,
  plano         text default 'pro'
);

-- ─────────────────────────────────────────────
-- Membros (n:n usuários ↔ escritórios)
-- ─────────────────────────────────────────────
create table membros (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  role          text not null check (role in ('owner','admin','lawyer','assistant')),
  unique(escritorio_id, user_id)
);

-- ─────────────────────────────────────────────
-- Convites
-- ─────────────────────────────────────────────
create table convites (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade not null,
  created_by    uuid references auth.users(id) not null,
  email         text not null,
  role          text not null check (role in ('admin','lawyer','assistant')),
  token         uuid default gen_random_uuid() unique not null,
  expires_at    timestamptz default now() + interval '7 days',
  accepted_at   timestamptz
);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
alter table escritorios enable row level security;
alter table membros      enable row level security;
alter table convites     enable row level security;

create policy "escritorios_select" on escritorios
  for select using (
    exists (select 1 from membros where escritorio_id = id and user_id = auth.uid())
  );

create policy "escritorios_insert" on escritorios
  for insert with check (owner_id = auth.uid());

create policy "escritorios_update" on escritorios
  for update using (
    exists (select 1 from membros where escritorio_id = id and user_id = auth.uid() and role in ('owner','admin'))
  );

create policy "membros_select" on membros
  for select using (
    exists (select 1 from membros m2 where m2.escritorio_id = escritorio_id and m2.user_id = auth.uid())
  );

create policy "membros_insert" on membros
  for insert with check (true);

create policy "convites_select" on convites
  for select using (
    exists (select 1 from membros where escritorio_id = convites.escritorio_id and user_id = auth.uid())
  );

create policy "convites_insert" on convites
  for insert with check (
    exists (select 1 from membros where escritorio_id = convites.escritorio_id and user_id = auth.uid() and role in ('owner','admin'))
  );

-- ─────────────────────────────────────────────
-- RPC: buscar convite por token (sem autenticação)
-- ─────────────────────────────────────────────
create or replace function get_convite_by_token(p_token uuid)
returns json language plpgsql security definer as $$
declare v_result json;
begin
  select json_build_object(
    'id',          c.id,
    'email',       c.email,
    'role',        c.role,
    'expires_at',  c.expires_at,
    'accepted_at', c.accepted_at,
    'escritorio',  json_build_object('nome', e.nome, 'slug', e.slug)
  ) into v_result
  from convites c
  join escritorios e on e.id = c.escritorio_id
  where c.token = p_token;

  return v_result;
end; $$;

-- ─────────────────────────────────────────────
-- RPC: aceitar convite (usuário autenticado)
-- ─────────────────────────────────────────────
create or replace function aceitar_convite(p_token uuid)
returns json language plpgsql security definer as $$
declare
  v_convite convites;
  v_uid     uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Não autenticado';
  end if;

  select * into v_convite
  from convites
  where token = p_token
    and accepted_at is null
    and expires_at > now();

  if not found then
    raise exception 'Convite inválido ou expirado';
  end if;

  insert into membros (escritorio_id, user_id, role)
  values (v_convite.escritorio_id, v_uid, v_convite.role)
  on conflict (escritorio_id, user_id) do nothing;

  update convites set accepted_at = now() where id = v_convite.id;

  return json_build_object('escritorio_id', v_convite.escritorio_id);
end; $$;
