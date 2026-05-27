-- ==================================================================
-- RLS — Vetor Jurídico (Better Auth + Supabase)
-- ==================================================================
-- Estratégia: o cliente Supabase envia o userId do Better Auth no
-- header HTTP  x-user-id  (injetado automaticamente pelo client.ts).
-- PostgREST expõe todos os headers via current_setting('request.headers').
--
-- O service role bypassa RLS automaticamente → usado no servidor.
-- ==================================================================


-- ── 1. Função helper: extrai o userId do header x-user-id ─────────

CREATE OR REPLACE FUNCTION app_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN current_setting('request.headers', true) IS NULL
      OR current_setting('request.headers', true) = ''
    THEN NULL
    ELSE NULLIF(
      (current_setting('request.headers', true)::json) ->> 'x-user-id',
      ''
    )
  END
$$;


-- ── 2. Função SECURITY DEFINER: retorna escritorio_ids do usuário ──
--    SECURITY DEFINER = executa sem RLS no membros → evita recursão

CREATE OR REPLACE FUNCTION get_user_escritorio_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT escritorio_id
  FROM membros
  WHERE user_id = app_user_id()
$$;

COMMENT ON FUNCTION get_user_escritorio_ids() IS
  'Retorna os escritorio_ids do usuário identificado pelo header x-user-id. SECURITY DEFINER para evitar recursão no RLS de membros.';


-- ── 3. Habilitar RLS em todas as tabelas ──────────────────────────

ALTER TABLE escritorios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros                ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites               ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prazos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;


-- ── 4. Políticas ──────────────────────────────────────────────────

--------------------------------------------------------------------
-- escritorios
--------------------------------------------------------------------

DROP POLICY IF EXISTS "escritorios_select" ON escritorios;
CREATE POLICY "escritorios_select" ON escritorios
  FOR SELECT USING (
    id IN (SELECT get_user_escritorio_ids())
  );

DROP POLICY IF EXISTS "escritorios_update" ON escritorios;
CREATE POLICY "escritorios_update" ON escritorios
  FOR UPDATE USING (
    id IN (
      SELECT escritorio_id FROM membros
      WHERE user_id = app_user_id()
        AND role IN ('owner', 'admin')
    )
  );

--------------------------------------------------------------------
-- membros
-- SELECT usa get_user_escritorio_ids() (SECURITY DEFINER)
-- → sem recursão mesmo com RLS ativo em membros
--------------------------------------------------------------------

DROP POLICY IF EXISTS "membros_select" ON membros;
CREATE POLICY "membros_select" ON membros
  FOR SELECT USING (
    escritorio_id IN (SELECT get_user_escritorio_ids())
  );

DROP POLICY IF EXISTS "membros_insert" ON membros;
CREATE POLICY "membros_insert" ON membros
  FOR INSERT WITH CHECK (
    escritorio_id IN (SELECT get_user_escritorio_ids())
  );

DROP POLICY IF EXISTS "membros_delete" ON membros;
CREATE POLICY "membros_delete" ON membros
  FOR DELETE USING (
    escritorio_id IN (SELECT get_user_escritorio_ids())
    AND role <> 'owner'
  );

--------------------------------------------------------------------
-- convites
--------------------------------------------------------------------

DROP POLICY IF EXISTS "convites_select" ON convites;
CREATE POLICY "convites_select" ON convites
  FOR SELECT USING (
    escritorio_id IN (SELECT get_user_escritorio_ids())
  );

DROP POLICY IF EXISTS "convites_insert" ON convites;
CREATE POLICY "convites_insert" ON convites
  FOR INSERT WITH CHECK (
    escritorio_id IN (
      SELECT escritorio_id FROM membros
      WHERE user_id = app_user_id()
        AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "convites_delete" ON convites;
CREATE POLICY "convites_delete" ON convites
  FOR DELETE USING (
    escritorio_id IN (
      SELECT escritorio_id FROM membros
      WHERE user_id = app_user_id()
        AND role IN ('owner', 'admin')
    )
  );

-- Convites podem ser lidos por token (fluxo de aceite — sem login)
DROP POLICY IF EXISTS "convites_select_by_token" ON convites;
CREATE POLICY "convites_select_by_token" ON convites
  FOR SELECT USING (true);  -- Qualquer um pode ler convite pelo token (verificação no código)

-- Remove a policy menos específica para evitar conflito
DROP POLICY IF EXISTS "convites_select" ON convites;

--------------------------------------------------------------------
-- clientes
--------------------------------------------------------------------

DROP POLICY IF EXISTS "clientes_all" ON clientes;
CREATE POLICY "clientes_all" ON clientes
  FOR ALL
  USING      (escritorio_id IN (SELECT get_user_escritorio_ids()))
  WITH CHECK (escritorio_id IN (SELECT get_user_escritorio_ids()));

--------------------------------------------------------------------
-- casos
--------------------------------------------------------------------

DROP POLICY IF EXISTS "casos_all" ON casos;
CREATE POLICY "casos_all" ON casos
  FOR ALL
  USING      (escritorio_id IN (SELECT get_user_escritorio_ids()))
  WITH CHECK (escritorio_id IN (SELECT get_user_escritorio_ids()));

--------------------------------------------------------------------
-- prazos
--------------------------------------------------------------------

DROP POLICY IF EXISTS "prazos_all" ON prazos;
CREATE POLICY "prazos_all" ON prazos
  FOR ALL
  USING      (escritorio_id IN (SELECT get_user_escritorio_ids()))
  WITH CHECK (escritorio_id IN (SELECT get_user_escritorio_ids()));

--------------------------------------------------------------------
-- transacoes
--------------------------------------------------------------------

DROP POLICY IF EXISTS "transacoes_all" ON transacoes;
CREATE POLICY "transacoes_all" ON transacoes
  FOR ALL
  USING      (escritorio_id IN (SELECT get_user_escritorio_ids()))
  WITH CHECK (escritorio_id IN (SELECT get_user_escritorio_ids()));

--------------------------------------------------------------------
-- google_calendar_tokens
--------------------------------------------------------------------

DROP POLICY IF EXISTS "gcal_tokens_own" ON google_calendar_tokens;
CREATE POLICY "gcal_tokens_own" ON google_calendar_tokens
  FOR ALL
  USING      (user_id = app_user_id())
  WITH CHECK (user_id = app_user_id());


-- ── 5. Garantir que o role anon/authenticated possa chamar as funções

GRANT EXECUTE ON FUNCTION app_user_id()            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_escritorio_ids() TO anon, authenticated;
