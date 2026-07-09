-- PulsarIQ Complete Supabase Schema
-- Run in Supabase SQL Editor, top to bottom

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE organizations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  logo_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','manager','viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  uploaded_by   UUID REFERENCES profiles(id) NOT NULL,
  name          TEXT NOT NULL,
  file_type     TEXT NOT NULL,
  file_size     BIGINT NOT NULL,
  storage_path  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','chunking','embedding','ready','failed')),
  chunk_count   INT DEFAULT 0,
  error_message TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_chunks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(384),
  chunk_index INT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_sessions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id       UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES profiles(id) NOT NULL,
  title        TEXT NOT NULL DEFAULT 'New Chat',
  document_ids UUID[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  citations  JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX documents_org_id_idx          ON documents(org_id);
CREATE INDEX documents_status_idx          ON documents(status);
CREATE INDEX document_chunks_org_id_idx    ON document_chunks(org_id);
CREATE INDEX chat_sessions_user_id_idx     ON chat_sessions(user_id);
CREATE INDEX messages_session_id_idx       ON messages(session_id);
CREATE INDEX analytics_logs_org_id_idx     ON analytics_logs(org_id);

ALTER TABLE organizations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID AS
  $$ SELECT org_id FROM profiles WHERE id = auth.uid() $$
LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS
  $$ SELECT role FROM profiles WHERE id = auth.uid() $$
LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "org_read"              ON organizations  FOR SELECT USING (id = current_org_id());
CREATE POLICY "profiles_org_read"     ON profiles       FOR SELECT USING (org_id = current_org_id());
CREATE POLICY "profiles_self_update"  ON profiles       FOR UPDATE USING (id = auth.uid());
CREATE POLICY "documents_org_read"    ON documents      FOR SELECT USING (org_id = current_org_id());
CREATE POLICY "documents_mgr_insert"  ON documents      FOR INSERT WITH CHECK (org_id = current_org_id() AND current_user_role() IN ('admin','manager'));
CREATE POLICY "documents_mgr_update"  ON documents      FOR UPDATE USING (org_id = current_org_id() AND current_user_role() IN ('admin','manager'));
CREATE POLICY "documents_adm_delete"  ON documents      FOR DELETE USING (org_id = current_org_id() AND current_user_role() = 'admin');
CREATE POLICY "chunks_org_read"       ON document_chunks FOR SELECT USING (org_id = current_org_id());
CREATE POLICY "chunks_insert"         ON document_chunks FOR INSERT WITH CHECK (org_id = current_org_id());
CREATE POLICY "sessions_own_read"     ON chat_sessions  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sessions_own_insert"   ON chat_sessions  FOR INSERT WITH CHECK (user_id = auth.uid() AND org_id = current_org_id());
CREATE POLICY "sessions_own_update"   ON chat_sessions  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "sessions_own_delete"   ON chat_sessions  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "messages_own_read"     ON messages       FOR SELECT USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_own_insert"   ON messages       FOR INSERT WITH CHECK (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "analytics_admin_read"  ON analytics_logs FOR SELECT USING (org_id = current_org_id() AND current_user_role() = 'admin');
CREATE POLICY "analytics_insert"      ON analytics_logs FOR INSERT WITH CHECK (org_id = current_org_id());

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding    vector(384),
  match_org_id       UUID,
  match_document_ids UUID[]  DEFAULT NULL,
  match_threshold    FLOAT   DEFAULT 0.65,
  match_count        INT     DEFAULT 6
) RETURNS TABLE (id UUID, document_id UUID, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT dc.id, dc.document_id, dc.content, dc.metadata,
         1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.org_id = match_org_id
    AND (match_document_ids IS NULL OR dc.document_id = ANY(match_document_ids))
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END; $$;

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS
  $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at  BEFORE UPDATE ON organizations  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at       BEFORE UPDATE ON profiles       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at      BEFORE UPDATE ON documents      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chat_sessions_updated_at  BEFORE UPDATE ON chat_sessions  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
