CREATE TABLE IF NOT EXISTS public.tarefas (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id        uuid        NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  escritorio_id  uuid        NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  titulo         text        NOT NULL,
  descricao      text        DEFAULT NULL,
  responsavel_id text        DEFAULT NULL,
  status         text        NOT NULL DEFAULT 'pendente',   -- pendente | em_andamento | concluida
  prioridade     text        NOT NULL DEFAULT 'media',      -- alta | media | baixa
  data_limite    date        DEFAULT NULL,
  created_by     text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarefas_all" ON public.tarefas
  FOR ALL
  USING      (escritorio_id IN (SELECT get_user_escritorio_ids()))
  WITH CHECK (escritorio_id IN (SELECT get_user_escritorio_ids()));

CREATE INDEX ON public.tarefas(caso_id);
CREATE INDEX ON public.tarefas(escritorio_id);
