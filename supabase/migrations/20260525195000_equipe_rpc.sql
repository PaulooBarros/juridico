-- RPC: lista membros do escritório do usuário logado, com dados do auth.users
create or replace function listar_membros_escritorio()
returns json language plpgsql security definer as $$
declare
  v_escritorio_id uuid;
begin
  select escritorio_id into v_escritorio_id
  from membros
  where user_id = auth.uid()
  limit 1;

  if v_escritorio_id is null then
    return '[]'::json;
  end if;

  return (
    select coalesce(
      json_agg(
        json_build_object(
          'id',         m.id,
          'user_id',    m.user_id,
          'role',       m.role,
          'created_at', m.created_at,
          'email',      u.email,
          'nome',       coalesce(
                          u.raw_user_meta_data->>'nome_profissional',
                          u.raw_user_meta_data->>'full_name',
                          u.email
                        )
        )
        order by m.created_at
      ),
      '[]'::json
    )
    from membros m
    join auth.users u on u.id = m.user_id
    where m.escritorio_id = v_escritorio_id
  );
end;
$$;

-- RPC: remove membro (somente owner/admin, não pode remover o próprio owner)
create or replace function remover_membro(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_escritorio_id uuid;
  v_caller_role   text;
  v_target_role   text;
begin
  select escritorio_id, role into v_escritorio_id, v_caller_role
  from membros
  where user_id = auth.uid()
  limit 1;

  if v_caller_role not in ('owner', 'admin') then
    raise exception 'Sem permissão para remover membros';
  end if;

  select role into v_target_role
  from membros
  where user_id = p_user_id and escritorio_id = v_escritorio_id;

  if v_target_role = 'owner' then
    raise exception 'Não é possível remover o titular do escritório';
  end if;

  delete from membros
  where user_id = p_user_id and escritorio_id = v_escritorio_id;
end;
$$;

-- Policy: owner/admin podem excluir convites do próprio escritório
create policy "convites_delete" on convites
  for delete using (
    is_membro(escritorio_id) and
    exists (
      select 1 from membros
      where escritorio_id = convites.escritorio_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );
