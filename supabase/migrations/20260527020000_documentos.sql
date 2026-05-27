-- Tabela de documentos
CREATE TABLE IF NOT EXISTS public.documentos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id uuid        NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  caso_id       uuid        REFERENCES public.casos(id) ON DELETE SET NULL,
  cliente_id    uuid        REFERENCES public.clientes(id) ON DELETE SET NULL,
  uploaded_by   text        NOT NULL,
  nome          text        NOT NULL,
  filename      text        NOT NULL,
  tipo          text        NOT NULL DEFAULT 'outro',
  tamanho       bigint      NOT NULL DEFAULT 0,
  storage_path  text        NOT NULL,
  url           text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_all" ON public.documentos
  FOR ALL
  USING      (escritorio_id IN (SELECT get_user_escritorio_ids()))
  WITH CHECK (escritorio_id IN (SELECT get_user_escritorio_ids()));

-- Bucket para PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  true,
  10485760,  -- 10 MB por arquivo
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "documentos_read"   ON storage.objects FOR SELECT USING (bucket_id = 'documentos');
CREATE POLICY "documentos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos');
CREATE POLICY "documentos_update" ON storage.objects FOR UPDATE USING (bucket_id = 'documentos');
CREATE POLICY "documentos_delete" ON storage.objects FOR DELETE USING (bucket_id = 'documentos');
