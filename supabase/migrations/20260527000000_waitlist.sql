-- Lista de espera (beta privado)
CREATE TABLE IF NOT EXISTS public.waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: só leitura interna (via service role); insert público via API
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_public" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Nenhuma política de SELECT/UPDATE/DELETE — só acessível via service role ou SQL Editor
