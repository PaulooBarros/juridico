-- Bucket único para todas as imagens da plataforma
-- Caminhos: imagens/avatars/{userId}.ext | imagens/logos/{escritorioId}.ext

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagens',
  'imagens',
  true,
  2097152,  -- 2 MB por arquivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (URLs diretas funcionam sem token)
CREATE POLICY "imagens_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'imagens');

-- Escrita permitida para todos (segurança via API routes com Better Auth)
CREATE POLICY "imagens_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'imagens');

-- Atualização (upsert)
CREATE POLICY "imagens_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'imagens');

-- Deleção
CREATE POLICY "imagens_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'imagens');
