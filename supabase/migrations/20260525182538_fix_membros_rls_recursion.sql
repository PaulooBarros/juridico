-- Função auxiliar com SECURITY DEFINER para checar membership sem acionar RLS
create or replace function is_membro(p_escritorio_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from membros
    where escritorio_id = p_escritorio_id
      and user_id = auth.uid()
  )
$$;

-- Recriar policies que causavam recursão
drop policy if exists "membros_select"    on membros;
drop policy if exists "escritorios_select" on escritorios;
drop policy if exists "escritorios_update" on escritorios;
drop policy if exists "convites_select"   on convites;
drop policy if exists "convites_insert"   on convites;

-- membros: usuário vê somente suas próprias linhas (sem recursão)
create policy "membros_select" on membros
  for select using (user_id = auth.uid());

-- escritorios: usa a função helper (sem recursão)
create policy "escritorios_select" on escritorios
  for select using (is_membro(id));

create policy "escritorios_update" on escritorios
  for update using (is_membro(id));

-- convites: usa a função helper (sem recursão)
create policy "convites_select" on convites
  for select using (is_membro(escritorio_id));

create policy "convites_insert" on convites
  for insert with check (
    exists (
      select 1 from membros
      where escritorio_id = convites.escritorio_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );
