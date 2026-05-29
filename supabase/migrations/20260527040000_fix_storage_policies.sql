-- Remove policies de escrita abertas nos buckets de storage.
-- Upload direto via anon key era possível pois a publishable key é pública no bundle JS.
-- As API routes continuam funcionando via service role key (server-side, nunca exposta).
-- Leitura pública mantida — necessária para URLs diretas de imagens e PDFs.

DROP POLICY IF EXISTS "imagens_insert"    ON storage.objects;
DROP POLICY IF EXISTS "imagens_update"    ON storage.objects;
DROP POLICY IF EXISTS "imagens_delete"    ON storage.objects;
DROP POLICY IF EXISTS "documentos_insert" ON storage.objects;
DROP POLICY IF EXISTS "documentos_update" ON storage.objects;
DROP POLICY IF EXISTS "documentos_delete" ON storage.objects;
