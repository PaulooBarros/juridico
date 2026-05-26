-- =============================================================
-- Better Auth Migration
-- =============================================================

-- ── 1. Remover TODAS as políticas do schema public ───────────
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I',
      r.policyname, r.schemaname, r.tablename);
  end loop;
end
$$;

-- ── 2. Desabilitar RLS ───────────────────────────────────────
alter table escritorios          disable row level security;
alter table membros              disable row level security;
alter table convites             disable row level security;
alter table clientes             disable row level security;
alter table casos                disable row level security;
alter table prazos               disable row level security;
alter table transacoes           disable row level security;
alter table google_calendar_tokens disable row level security;

-- ── 3. Limpar dados (reset dev) ──────────────────────────────
truncate table transacoes cascade;
truncate table google_calendar_tokens cascade;
truncate table prazos cascade;
truncate table casos cascade;
truncate table clientes cascade;
truncate table convites cascade;
truncate table membros cascade;
truncate table escritorios cascade;

-- ── 4. Remover FK constraints para auth.users ────────────────
alter table escritorios          drop constraint if exists escritorios_owner_id_fkey;
alter table membros              drop constraint if exists membros_user_id_fkey;
alter table convites             drop constraint if exists convites_created_by_fkey;
alter table casos                drop constraint if exists casos_created_by_fkey;
alter table clientes             drop constraint if exists clientes_created_by_fkey;
alter table prazos               drop constraint if exists prazos_created_by_fkey;
alter table transacoes           drop constraint if exists transacoes_created_by_fkey;
alter table google_calendar_tokens drop constraint if exists google_calendar_tokens_user_id_fkey;

-- ── 5. Converter colunas UUID → TEXT ─────────────────────────
alter table escritorios          alter column owner_id   type text using owner_id::text;
alter table membros              alter column user_id    type text using user_id::text;
alter table convites             alter column created_by type text using created_by::text;
alter table casos                alter column created_by type text using created_by::text;
alter table clientes             alter column created_by type text using created_by::text;
alter table prazos               alter column created_by type text using created_by::text;
alter table transacoes           alter column created_by type text using created_by::text;
alter table google_calendar_tokens alter column user_id  type text using user_id::text;

-- ── 6. Criar tabelas do Better Auth ──────────────────────────
create table if not exists "user" (
  "id"                text        not null primary key,
  "name"              text        not null,
  "email"             text        not null unique,
  "emailVerified"     boolean     not null default false,
  "image"             text,
  "createdAt"         timestamp   not null default now(),
  "updatedAt"         timestamp   not null default now(),
  "nome_profissional" text,
  "oab"               text,
  "bio"               text,
  "areas_atuacao"     text,
  "escritorio_id"     text
);

create table if not exists "session" (
  "id"          text      not null primary key,
  "expiresAt"   timestamp not null,
  "token"       text      not null unique,
  "createdAt"   timestamp not null default now(),
  "updatedAt"   timestamp not null default now(),
  "ipAddress"   text,
  "userAgent"   text,
  "userId"      text      not null references "user"("id") on delete cascade
);

create table if not exists "account" (
  "id"                      text      not null primary key,
  "accountId"               text      not null,
  "providerId"              text      not null,
  "userId"                  text      not null references "user"("id") on delete cascade,
  "accessToken"             text,
  "refreshToken"            text,
  "idToken"                 text,
  "accessTokenExpiresAt"    timestamp,
  "refreshTokenExpiresAt"   timestamp,
  "scope"                   text,
  "password"                text,
  "createdAt"               timestamp not null default now(),
  "updatedAt"               timestamp not null default now()
);

create table if not exists "verification" (
  "id"          text      not null primary key,
  "identifier"  text      not null,
  "value"       text      not null,
  "expiresAt"   timestamp not null,
  "createdAt"   timestamp default now(),
  "updatedAt"   timestamp default now()
);

-- ── 7. FK das nossas tabelas → Better Auth user ──────────────
alter table escritorios add constraint escritorios_owner_id_fkey
  foreign key (owner_id) references "user"(id) on delete restrict;

alter table membros add constraint membros_user_id_fkey
  foreign key (user_id) references "user"(id) on delete cascade;

alter table convites add constraint convites_created_by_fkey
  foreign key (created_by) references "user"(id) on delete restrict;

alter table casos add constraint casos_created_by_fkey
  foreign key (created_by) references "user"(id) on delete restrict;

alter table clientes add constraint clientes_created_by_fkey
  foreign key (created_by) references "user"(id) on delete restrict;

alter table prazos add constraint prazos_created_by_fkey
  foreign key (created_by) references "user"(id) on delete restrict;

alter table transacoes add constraint transacoes_created_by_fkey
  foreign key (created_by) references "user"(id) on delete restrict;

alter table google_calendar_tokens add constraint google_calendar_tokens_user_id_fkey
  foreign key (user_id) references "user"(id) on delete cascade;

-- ── 8. Reescrever RPCs ────────────────────────────────────────
create or replace function criar_escritorio_completo(
  p_user_id       text,
  p_nome          text,
  p_cnpj          text,
  p_oab_sociedade text,
  p_especialidade text,
  p_cidade_uf     text,
  p_slogan        text,
  p_descricao     text,
  p_logo_url      text,
  p_slug          text,
  p_plano         text,
  p_convites      jsonb
)
returns json language plpgsql security definer as $$
declare
  v_escritorio_id uuid;
  v_result        json;
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'Não autenticado';
  end if;

  insert into escritorios
    (owner_id, nome, cnpj, oab_sociedade, especialidade, cidade_uf, slogan, descricao, logo_url, slug, plano)
  values
    (p_user_id, p_nome, nullif(p_cnpj,''), nullif(p_oab_sociedade,''), nullif(p_especialidade,''),
     nullif(p_cidade_uf,''), nullif(p_slogan,''), nullif(p_descricao,''),
     nullif(p_logo_url,''), nullif(p_slug,''), p_plano)
  returning id into v_escritorio_id;

  insert into membros (escritorio_id, user_id, role)
  values (v_escritorio_id, p_user_id, 'owner');

  insert into convites (escritorio_id, created_by, email, role)
  select v_escritorio_id, p_user_id, trim(c->>'email'), c->>'role'
  from jsonb_array_elements(p_convites) as c
  where trim(coalesce(c->>'email', '')) != '';

  select json_build_object(
    'escritorio_id', v_escritorio_id,
    'convites', coalesce(
      (select json_agg(json_build_object('id', id, 'email', email, 'role', role, 'token', token))
       from convites where escritorio_id = v_escritorio_id),
      '[]'::json
    )
  ) into v_result;

  return v_result;
end;
$$;

create or replace function listar_membros_escritorio(p_user_id text)
returns json language plpgsql security definer as $$
declare
  v_escritorio_id uuid;
begin
  select escritorio_id into v_escritorio_id
  from membros where user_id = p_user_id limit 1;

  if v_escritorio_id is null then return '[]'::json; end if;

  return (
    select coalesce(
      json_agg(
        json_build_object(
          'id',         m.id,
          'user_id',    m.user_id,
          'role',       m.role,
          'created_at', m.created_at,
          'email',      u.email,
          'nome',       coalesce(u."nome_profissional", u.name, u.email)
        )
        order by m.created_at
      ),
      '[]'::json
    )
    from membros m
    join "user" u on u.id = m.user_id
    where m.escritorio_id = v_escritorio_id
  );
end;
$$;

create or replace function remover_membro(p_caller_id text, p_user_id text)
returns void language plpgsql security definer as $$
declare
  v_escritorio_id uuid;
  v_caller_role   text;
  v_target_role   text;
begin
  select escritorio_id, role into v_escritorio_id, v_caller_role
  from membros where user_id = p_caller_id limit 1;

  if v_caller_role not in ('owner', 'admin') then
    raise exception 'Sem permissão para remover membros';
  end if;

  select role into v_target_role
  from membros where user_id = p_user_id and escritorio_id = v_escritorio_id;

  if v_target_role = 'owner' then
    raise exception 'Não é possível remover o titular do escritório';
  end if;

  delete from membros where user_id = p_user_id and escritorio_id = v_escritorio_id;
end;
$$;

create or replace function aceitar_convite(p_user_id text, p_token uuid)
returns json language plpgsql security definer as $$
declare
  v_convite convites%rowtype;
begin
  if p_user_id is null or p_user_id = '' then
    raise exception 'Não autenticado';
  end if;

  select * into v_convite
  from convites
  where token = p_token and accepted_at is null and expires_at > now();

  if not found then raise exception 'Convite inválido ou expirado'; end if;

  insert into membros (escritorio_id, user_id, role)
  values (v_convite.escritorio_id, p_user_id, v_convite.role)
  on conflict (escritorio_id, user_id) do nothing;

  update convites set accepted_at = now() where id = v_convite.id;

  return json_build_object('escritorio_id', v_convite.escritorio_id);
end;
$$;
