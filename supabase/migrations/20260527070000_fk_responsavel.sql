-- Foreign keys para responsavel_id → user(id)
-- Necessário para o PostgREST reconhecer o join casos.responsavel_id → user

ALTER TABLE public.casos
  ADD CONSTRAINT casos_responsavel_id_fkey
  FOREIGN KEY (responsavel_id) REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE public.tarefas
  ADD CONSTRAINT tarefas_responsavel_id_fkey
  FOREIGN KEY (responsavel_id) REFERENCES "user"(id) ON DELETE SET NULL;
