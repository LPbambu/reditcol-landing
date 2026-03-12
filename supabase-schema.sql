-- ===================================================
-- CREDITCOL — Schema Supabase
-- Tabla: leads
-- ===================================================
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS leads (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  nombre                TEXT NOT NULL,
  telefono              TEXT NOT NULL,
  tipo_cliente          TEXT NOT NULL CHECK (tipo_cliente IN ('pensionado', 'empleado_publico', 'empleado_privado')),
  ingreso_aproximado    NUMERIC,
  reportado_datacredito BOOLEAN DEFAULT FALSE,
  fuente                TEXT DEFAULT 'directo',
  estado                TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'en_proceso', 'aprobado', 'rechazado')),
  observaciones         TEXT
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_leads_estado     ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tipo       ON leads(tipo_cliente);

-- RLS — Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política: el frontend (anon key) solo puede INSERT nuevos leads
CREATE POLICY "anon_insert_leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: solo usuarios autenticados pueden leer leads
CREATE POLICY "auth_read_leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- Política: solo usuarios autenticados pueden actualizar leads
CREATE POLICY "auth_update_leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true);

-- ===================================================
-- Verificar la tabla creada
-- ===================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
