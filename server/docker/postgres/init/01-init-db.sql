CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS app_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_metadata_key ON app_metadata(key);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at DESC);

INSERT INTO app_metadata (key, value)
VALUES
  ('platform.name', '{"value":"ApplyTrack AI Studio"}'),
  ('platform.env', '{"value":"development"}'),
  ('platform.stack', '{"value":["postgresql","firebase","supabase","docker"]}')
ON CONFLICT (key) DO NOTHING;
