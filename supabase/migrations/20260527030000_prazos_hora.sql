-- Adiciona horário opcional aos prazos (ex: audiências com hora marcada)
ALTER TABLE public.prazos
  ADD COLUMN IF NOT EXISTS hora text DEFAULT NULL;
