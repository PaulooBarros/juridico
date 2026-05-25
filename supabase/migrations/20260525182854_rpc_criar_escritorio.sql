-- Remove a policy de insert que dependia de auth.uid() na camada de RLS
-- A criação do escritório passa a ser controlada pelo RPC abaixo (security definer)
drop policy if exists "escritorios_insert" on escritorios;

-- Cria escritório, membro owner e convites em uma única transação
create or replace function criar_escritorio_completo(
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
  p_convites      jsonb  -- [{"email":"...","role":"..."}]
)
returns json language plpgsql security definer as $$
declare
  v_uid          uuid := auth.uid();
  v_escritorio_id uuid;
  v_result       json;
begin
  if v_uid is null then
    raise exception 'Não autenticado';
  end if;

  -- 1. Escritório
  insert into escritorios
    (owner_id, nome, cnpj, oab_sociedade, especialidade, cidade_uf, slogan, descricao, logo_url, slug, plano)
  values
    (v_uid, p_nome, nullif(p_cnpj,''), nullif(p_oab_sociedade,''), nullif(p_especialidade,''),
     nullif(p_cidade_uf,''), nullif(p_slogan,''), nullif(p_descricao,''),
     nullif(p_logo_url,''), nullif(p_slug,''), p_plano)
  returning id into v_escritorio_id;

  -- 2. Owner como membro
  insert into membros (escritorio_id, user_id, role)
  values (v_escritorio_id, v_uid, 'owner');

  -- 3. Convites (ignora entradas com email vazio)
  insert into convites (escritorio_id, created_by, email, role)
  select
    v_escritorio_id,
    v_uid,
    trim(c->>'email'),
    c->>'role'
  from jsonb_array_elements(p_convites) as c
  where trim(coalesce(c->>'email', '')) != '';

  -- 4. Retorna id + convites criados
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
