ALTER TABLE casos
  ADD COLUMN tipo_processo text CHECK (tipo_processo IN ('fisico', 'eletronico'));
