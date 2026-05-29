-- Adiciona responsável ao caso (membro do escritório)
ALTER TABLE public.casos
  ADD COLUMN IF NOT EXISTS responsavel_id text DEFAULT NULL;
